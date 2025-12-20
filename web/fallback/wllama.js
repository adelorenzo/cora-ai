import { Wllama } from '@wllama/wllama';

// WASM-compatible models (GGUF format from HuggingFace)
export const WASM_MODELS = [
  {
    id: 'qwen2.5-0.5b',
    name: 'Qwen 2.5 (0.5B)',
    description: 'Lightweight and fast, good for basic tasks',
    size: '~400MB',
    url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    priority: 1
  },
  {
    id: 'smollm2-360m',
    name: 'SmolLM2 (360M)',
    description: 'Ultra-fast responses, minimal memory',
    size: '~250MB',
    url: 'https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF/resolve/main/smollm2-360m-instruct-q4_k_m.gguf',
    priority: 2
  },
  {
    id: 'tinyllama-1.1b',
    name: 'TinyLlama (1.1B)',
    description: 'Best quality for WASM, slower on weak devices',
    size: '~670MB',
    url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    priority: 3
  },
  {
    id: 'qwen2.5-1.5b',
    name: 'Qwen 2.5 (1.5B)',
    description: 'Higher quality, needs more memory',
    size: '~1GB',
    url: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    priority: 4
  }
];

// Get default WASM model
export function getDefaultWasmModel() {
  return WASM_MODELS[0]; // Qwen 0.5B as default - good balance of size/quality
}

// Get WASM model by ID
export function getWasmModelById(modelId) {
  return WASM_MODELS.find(m => m.id === modelId) || getDefaultWasmModel();
}

/**
 * Start WASM fallback with specified model
 * @param {string} modelId - Model ID to load (optional, defaults to qwen2.5-0.5b)
 * @param {Function} progressCallback - Progress callback function
 * @returns {Promise<Object>} WASM engine interface
 */
export async function startWasmFallback(modelId = null, progressCallback = null) {
  const model = modelId ? getWasmModelById(modelId) : getDefaultWasmModel();

  // Use local wllama package - works on all browsers including Firefox
  const wllama = new Wllama({
    'single-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.5/src/single-thread/wllama.wasm',
    'multi-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.5/src/multi-thread/wllama.wasm',
    'multi-thread/wllama.worker.mjs': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.5/src/multi-thread/wllama.worker.mjs',
  });

  console.log(`[WASM] Loading model: ${model.name} (${model.size})`);

  await wllama.loadModelFromUrl(model.url, {
    progressCallback: ({ loaded, total }) => {
      const percent = Math.round((loaded / total) * 100);
      const message = `Loading ${model.name}: ${percent}%`;
      console.log(`[WASM] ${message}`);
      if (progressCallback) {
        progressCallback(message);
      }
    }
  });

  console.log(`[WASM] Model loaded: ${model.name}`);

  return {
    modelId: model.id,
    modelName: model.name,

    async complete(prompt, opts = {}) {
      return wllama.createCompletion(prompt, {
        nPredict: opts.nPredict ?? 512,
        sampling: {
          temp: opts.temp ?? 0.7,
          top_k: 40,
          top_p: 0.9
        },
      });
    },

    async unload() {
      try {
        await wllama.exit();
      } catch (e) {
        console.warn('[WASM] Error unloading model:', e);
      }
    }
  };
}
