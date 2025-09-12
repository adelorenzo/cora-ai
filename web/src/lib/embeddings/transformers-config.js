/**
 * Transformers.js configuration for safer browser execution
 * Addresses ONNX runtime eval warnings by using alternative backends
 */

let isConfigured = false;

/**
 * Configure transformers environment for safe browser execution
 */
export const configureTransformers = async () => {
  if (isConfigured) return;

  try {
    const { env } = await import('@xenova/transformers');
    
    // Disable ONNX runtime to avoid eval usage
    if (env.backends) {
      env.backends.onnx = false;
    }
    
    // Configure environment settings
    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    
    // Use WASM backend as primary (safer alternative to ONNX)
    env.backends = {
      ...env.backends,
      wasm: true,
      webgl: typeof WebGLRenderingContext !== 'undefined',
      onnx: false // Explicitly disable ONNX runtime
    };
    
    // Set cache directory for better performance
    env.cacheDir = './.cache';
    
    // Configure for browser environment
    env.useBrowserCache = true;
    env.useCustomCache = true;
    
    console.log('Transformers.js configured with safe backends:', env.backends);
    isConfigured = true;
    
  } catch (error) {
    console.warn('Failed to configure transformers environment:', error);
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