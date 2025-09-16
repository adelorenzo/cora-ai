/**
 * Curated Models Configuration
 *
 * These 2 models are carefully selected to provide optimal browser performance:
 *
 * Selection Criteria:
 * - Memory footprint: Must work within browser memory constraints
 * - Inference speed: Fast enough for real-time chat interaction
 * - Model quality: Very good to excellent output quality
 * - Use case diversity: Cover general and advanced scenarios
 * - Browser compatibility: Verified to work with WebLLM/WebGPU
 *
 * Priority system: Lower number = higher priority for auto-selection
 */
export const CURATED_MODELS = [
  {
    // DeepSeek's general-purpose model with strong reasoning
    model_id: 'DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC',
    name: 'DeepSeek 1.5B',
    description: 'Efficient general-purpose model with strong reasoning',
    size: '~900MB',
    speed: 'Fast',
    quality: 'Very Good',
    useCase: 'General chat, reasoning, analysis',
    priority: 1 // Fallback when Hermes too large
  },
  {
    // Hermes model with function calling support
    model_id: 'Hermes-3-Llama-3.1-8B-q4f16_1-MLC',
    name: 'Hermes 3 Llama 8B',
    description: 'Advanced with function calling & web search',
    size: '~4.5GB',
    speed: 'Moderate',
    quality: 'Excellent',
    useCase: 'Advanced tasks, function calling',
    priority: 2 // Default for new users
  },
];

// Model categories for filtering/organization
export const MODEL_CATEGORIES = {
  GENERAL: ['DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC'],
  ADVANCED: ['Hermes-3-Llama-3.1-8B-q4f16_1-MLC']
};

// Recommended models by use case
export const RECOMMENDED_MODELS = {
  LOW_MEMORY: 'DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC',
  BALANCED: 'DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC',
  ADVANCED: 'Hermes-3-Llama-3.1-8B-q4f16_1-MLC'
};