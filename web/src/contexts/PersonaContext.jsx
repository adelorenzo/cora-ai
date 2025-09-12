import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultPersonas = {
  assistant: {
    id: 'assistant',
    name: 'Assistant',
    icon: '🤖',
    systemPrompt: 'You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.',
    temperature: 0.7
  },
  coder: {
    id: 'coder',
    name: 'Coder',
    icon: '💻',
    systemPrompt: 'You are an expert programmer. Provide clear, well-commented code with explanations. Focus on best practices, efficiency, and clean code principles. When debugging, think step-by-step.',
    temperature: 0.3
  },
  teacher: {
    id: 'teacher',
    name: 'Teacher',
    icon: '👩‍🏫',
    systemPrompt: 'You are a patient and knowledgeable teacher. Explain concepts clearly, use examples, and adapt your explanations to the learner\'s level. Encourage questions and provide step-by-step guidance.',
    temperature: 0.5
  },
  creative: {
    id: 'creative',
    name: 'Creative Writer',
    icon: '✍️',
    systemPrompt: 'You are a creative writer with a vivid imagination. Help with storytelling, creative writing, brainstorming ideas, and crafting engaging narratives. Be descriptive and original.',
    temperature: 0.9
  },
  analyst: {
    id: 'analyst',
    name: 'Analyst',
    icon: '📊',
    systemPrompt: 'You are a data analyst and strategic thinker. Provide detailed analysis, identify patterns, and offer data-driven insights. Be thorough, objective, and structured in your responses.',
    temperature: 0.4
  }
};

const PersonaContext = createContext();

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};

export const PersonaProvider = ({ children }) => {
  const [personas, setPersonas] = useState(() => {
    const saved = localStorage.getItem('custom-personas');
    if (saved) {
      try {
        const customPersonas = JSON.parse(saved);
        return { ...defaultPersonas, ...customPersonas };
      } catch {
        return defaultPersonas;
      }
    }
    return defaultPersonas;
  });

  const [activePersona, setActivePersona] = useState(() => {
    const saved = localStorage.getItem('active-persona');
    return saved || 'assistant';
  });

  useEffect(() => {
    localStorage.setItem('active-persona', activePersona);
  }, [activePersona]);

  const saveCustomPersona = (persona) => {
    const newPersonas = {
      ...personas,
      [persona.id]: persona
    };
    setPersonas(newPersonas);
    
    // Save only custom personas to localStorage
    const customPersonas = {};
    Object.entries(newPersonas).forEach(([key, value]) => {
      if (!defaultPersonas[key]) {
        customPersonas[key] = value;
      }
    });
    localStorage.setItem('custom-personas', JSON.stringify(customPersonas));
  };

  const deleteCustomPersona = (personaId) => {
    if (defaultPersonas[personaId]) {
      return; // Can't delete default personas
    }
    
    const newPersonas = { ...personas };
    delete newPersonas[personaId];
    setPersonas(newPersonas);
    
    // Update localStorage
    const customPersonas = {};
    Object.entries(newPersonas).forEach(([key, value]) => {
      if (!defaultPersonas[key]) {
        customPersonas[key] = value;
      }
    });
    localStorage.setItem('custom-personas', JSON.stringify(customPersonas));
    
    // Switch to assistant if deleting active persona
    if (activePersona === personaId) {
      setActivePersona('assistant');
    }
  };

  const value = {
    personas,
    activePersona,
    setActivePersona,
    activePersonaData: personas[activePersona],
    saveCustomPersona,
    deleteCustomPersona,
    isCustomPersona: (id) => !defaultPersonas[id]
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
};