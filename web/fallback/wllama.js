import { Wllama } from '@wllama/wllama';

export async function startWasmFallback() {
  // Use local wllama package - works on all browsers including Firefox
  const wllama = new Wllama({
    'single-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.5/src/single-thread/wllama.wasm',
    'multi-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.5/src/multi-thread/wllama.wasm',
    'multi-thread/wllama.worker.mjs': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.5/src/multi-thread/wllama.worker.mjs',
  });

  await wllama.loadModelFromUrl(
    "https://huggingface.co/ggml-org/models/resolve/main/tinyllamas/stories260K.gguf?download=true",
    {
      progressCallback: ({ loaded, total }) => {
        const percent = Math.round((loaded / total) * 100);
        console.log(`[WASM] Loading model: ${percent}%`);
      }
    }
  );

  return {
    async complete(prompt, opts = {}) {
      return wllama.createCompletion(prompt, {
        nPredict: opts.nPredict ?? 128,
        sampling: { temp: opts.temp ?? 0.7, top_k: 40, top_p: 0.9 },
      });
    }
  };
}
