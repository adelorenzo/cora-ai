import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette } from 'lucide-react';

const ThemeSwitcher = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
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

  const handleQuickToggle = () => {
    // Quick toggle between light and dark
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {/* Quick toggle button for light/dark */}
        <button
          onClick={handleQuickToggle}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className="text-xl">
            {currentTheme === 'dark' ? '☀️' : '🌙'}
          </span>
        </button>

        {/* Theme palette button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          title="Choose theme"
        >
          <Palette className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Theme dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-popover border border-border shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
              Choose Theme
            </div>
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  setTheme(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-secondary transition-colors ${
                  currentTheme === key ? 'bg-secondary' : ''
                }`}
              >
                <span className="text-lg">{theme.icon}</span>
                <span className="text-sm font-medium">{theme.name}</span>
                {currentTheme === key && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;