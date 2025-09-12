import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Zap, Brain, Sparkles, ChevronDown } from 'lucide-react';

const curatedModels = [
  {
    id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 360M',
    description: 'Fast & efficient, great for quick responses',
    icon: <Zap className="w-4 h-4" />,
    size: '~200MB',
    speed: 'Very Fast',
    quality: 'Good'
  },
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B',
    description: 'Balanced performance and quality',
    icon: <Brain className="w-4 h-4" />,
    size: '~650MB',
    speed: 'Fast',
    quality: 'Very Good'
  },
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B',
    description: 'High quality responses, more capable',
    icon: <Sparkles className="w-4 h-4" />,
    size: '~1.7GB',
    speed: 'Moderate',
    quality: 'Excellent'
  },
  {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi 3.5 Mini',
    description: 'Microsoft\'s efficient model, good reasoning',
    icon: <Cpu className="w-4 h-4" />,
    size: '~2GB',
    speed: 'Moderate',
    quality: 'Very Good'
  },
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 1.5B',
    description: 'Multilingual support, well-rounded',
    icon: <Brain className="w-4 h-4" />,
    size: '~900MB',
    speed: 'Fast',
    quality: 'Very Good'
  }
];

const ModelSelector = ({ currentModel, onModelSelect, runtime }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = async (model) => {
    if (model.id === currentModel) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(false);
    
    try {
      await onModelSelect(model.id);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModel = curatedModels.find(m => m.id === currentModel) || {
    name: currentModel || 'Select Model',
    description: 'Choose a model to start chatting',
    icon: <Brain className="w-4 h-4" />
  };

  // For WASM runtime, only show the fallback model
  const availableModels = runtime === 'wasm' 
    ? [{ 
        id: 'stories260K',
        name: 'TinyStories',
        description: 'Lightweight WASM fallback model',
        icon: <Zap className="w-4 h-4" />,
        size: '~15MB',
        speed: 'Very Fast',
        quality: 'Basic'
      }]
    : curatedModels;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || runtime === 'wasm'}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors ${
          (isLoading || runtime === 'wasm') ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          selectedModel.icon
        )}
        <div className="text-left">
          <div className="text-sm font-medium">{selectedModel.name}</div>
          {runtime === 'wasm' && (
            <div className="text-xs text-muted-foreground">WASM Mode</div>
          )}
        </div>
        {runtime !== 'wasm' && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {isOpen && runtime !== 'wasm' && (
        <div className="absolute left-0 mt-2 w-96 rounded-lg bg-popover border border-border shadow-lg z-50">
          <div className="p-3">
            <div className="text-sm font-medium text-muted-foreground mb-3">
              Select AI Model
            </div>
            
            <div className="space-y-2">
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className={`w-full p-3 rounded-lg text-left hover:bg-secondary transition-colors ${
                    currentModel === model.id ? 'bg-secondary ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{model.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.size}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {model.description}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-muted-foreground">
                          Speed: <span className="text-foreground">{model.speed}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Quality: <span className="text-foreground">{model.quality}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Runtime: {runtime === 'webgpu' ? 'WebGPU (Hardware Accelerated)' : 'WebAssembly'}
                </div>
                <div>Models are downloaded once and cached locally</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;