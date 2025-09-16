/**
 * Curated Models Configuration
 * 
 * These 6 models are carefully selected to provide optimal browser performance:
 * 
 * Selection Criteria:
 * - Memory footprint: Must work within browser memory constraints (100MB-2GB range)
 * - Inference speed: Fast enough for real-time chat interaction
 * - Model quality: Good to excellent output quality for their size class
 * - Use case diversity: Cover different scenarios (speed, multilingual, coding, creative)
 * - Browser compatibility: Verified to work with WebLLM/WebGPU
 * 
 * Priority system: Lower number = higher priority for auto-selection
 */
export const CURATED_MODELS = [
  {
    // Ultra-lightweight model for instant responses and low-memory devices
    model_id: 'SmolLM2-135M-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 135M',
    description: 'Ultra-fast, minimal resource usage',
    size: '~100MB',
    speed: 'Ultra Fast',
    quality: 'Good',
    useCase: 'Quick tasks, low memory',
    priority: 1 // Default fallback - most compatible
  },
  {
    // Best multilingual support in small package
    model_id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 0.5B',
    description: 'Balanced efficiency with multilingual support',
    size: '~300MB',
    speed: 'Very Fast', 
    quality: 'Good',
    useCase: 'General chat, multilingual',
    priority: 2
  },
  {
    // Hermes model with function calling support
    model_id: 'Hermes-3-Llama-3.1-8B-q4f16_1-MLC',
    name: 'Hermes 3 Llama 8B',
    description: 'Advanced with function calling & web search',
    size: '~4.5GB',
    speed: 'Slow',
    quality: 'Excellent',
    useCase: 'Advanced tasks, function calling',
    priority: 6 // Lower priority due to large size
  },
  {
    // Microsoft's specialized model for technical tasks
    model_id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi 3.5 Mini',
    description: 'Excellent for coding and reasoning tasks',
    size: '~2.1GB',
    speed: 'Moderate',
    quality: 'Very Good',
    useCase: 'Coding, reasoning, analysis',
    priority: 4
  },
  {
    // Google's balanced model with strong creative capabilities
    model_id: 'gemma-2-2b-it-q4f16_1-MLC',
    name: 'Gemma 2 2B',
    description: 'Google\'s balanced model with strong capabilities',
    size: '~1.3GB',
    speed: 'Moderate',
    quality: 'Very Good',
    useCase: 'Creative tasks, general chat',
    priority: 5
  },
  {
    // DeepSeek's general-purpose model with strong reasoning
    model_id: 'DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC',
    name: 'DeepSeek 1.5B',
    description: 'Efficient general-purpose model with strong reasoning',
    size: '~900MB',
    speed: 'Fast',
    quality: 'Very Good',
    useCase: 'General chat, reasoning, analysis',
    priority: 3
  },
];

// Model categories for filtering/organization
export const MODEL_CATEGORIES = {
  ULTRA_FAST: ['SmolLM2-135M-Instruct-q4f16_1-MLC'],
  MULTILINGUAL: ['Qwen2.5-0.5B-Instruct-q4f16_1-MLC'],
  GENERAL: ['Qwen2.5-0.5B-Instruct-q4f16_1-MLC', 'gemma-2-2b-it-q4f16_1-MLC', 'DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC'],
  CODING: ['Phi-3.5-mini-instruct-q4f16_1-MLC'],
  CREATIVE: ['gemma-2-2b-it-q4f16_1-MLC']
};

// Recommended models by use case
export const RECOMMENDED_MODELS = {
  LOW_MEMORY: 'SmolLM2-135M-Instruct-q4f16_1-MLC',
  BALANCED: 'gemma-2-2b-it-q4f16_1-MLC',
  CODING: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
  CREATIVE: 'gemma-2-2b-it-q4f16_1-MLC',
  MULTILINGUAL: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'
};