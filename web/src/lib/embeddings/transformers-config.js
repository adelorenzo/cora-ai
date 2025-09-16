/**
 * Transformers.js configuration for safer browser execution
 * Addresses ONNX runtime eval warnings by using alternative backends
 */

let isConfigured = false;

/**
 * Configure transformers environment for safe browser execution
 */
export const configureTransformers = async () => {
  if (isConfigured) return true;

  try {
    // Dynamic import with error handling for browser environment
    const transformersModule = await import('@xenova/transformers').catch(err => {
      console.error('Failed to import @xenova/transformers:', err);
      throw new Error('Transformers.js library not available. Please ensure @xenova/transformers is installed.');
    });
    
    if (!transformersModule || !transformersModule.env) {
      throw new Error('Invalid transformers module structure');
    }
    
    const { env } = transformersModule;
    
    // Configure environment settings for browser
    env.allowRemoteModels = true; // Allow downloading models from CDN
    env.allowLocalModels = false; // Don't use local file system in browser
    
    // Configure backends - disable ONNX to avoid eval usage
    if (env.backends) {
      env.backends.onnx = false;
      env.backends.wasm = true;
      if (typeof WebGLRenderingContext !== 'undefined') {
        env.backends.webgl = true;
      }
    }
    
    // Use browser cache for models
    env.useBrowserCache = true;
    
    // Set CDN URL for model downloads
    env.remoteURL = 'https://huggingface.co/';
    
    console.log('Transformers.js configured successfully:', {
      backends: env.backends,
      allowRemoteModels: env.allowRemoteModels,
      useBrowserCache: env.useBrowserCache
    });
    
    isConfigured = true;
    return true;
    
  } catch (error) {
    console.error('Failed to configure transformers environment:', error);
    isConfigured = false;
    throw error;
  }
};

/**
 * Get safe pipeline configuration
 */
export const getSafePipelineConfig = () => ({
  // Use quantized models for better performance
  quantized: true,
  
  // Disable ONNX runtime execution provider
  execution_providers: ['wasm', 'cpu'],
  
  // Memory optimization
  memory_pattern: 'low_mem',
  
  // Disable eval-based optimizations
  optimize: false,
  
  // Use WebGL if available, fallback to WASM
  device: typeof WebGLRenderingContext !== 'undefined' ? 'webgl' : 'wasm'
});

/**
 * Check if current environment supports safe transformers execution
 */
export const checkTransformersSupport = () => {
  const support = {
    wasm: typeof WebAssembly !== 'undefined',
    webgl: typeof WebGLRenderingContext !== 'undefined',
    workers: typeof Worker !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined'
  };
  
  const isSupported = support.wasm && support.indexedDB;
  
  return {
    supported: isSupported,
    features: support,
    recommendation: isSupported ? 
      'Full transformer support available' : 
      'Limited support - some features may be unavailable'
  };
};

export default {
  configureTransformers,
  getSafePipelineConfig,
  checkTransformersSupport
};