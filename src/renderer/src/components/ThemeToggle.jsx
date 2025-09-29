import { useState } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

export function ThemeToggle() {
  const { darkMode, setTheme, getCurrentTheme } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentTheme = getCurrentTheme();

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor }
  ];

  const currentThemeData = themes.find(theme => theme.id === currentTheme);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-background hover:bg-accent/50 border border-border transition-colors duration-200"
        aria-label="Toggle theme"
      >
        <currentThemeData.icon className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:inline">
          {currentThemeData.label}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden">
            {themes.map(theme => {
              const Icon = theme.icon;
              const isSelected = currentTheme === theme.id;
              
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors duration-150 ${
                    isSelected ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{theme.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {theme.id === 'light' && 'Always use light theme'}
                      {theme.id === 'dark' && 'Always use dark theme'}
                      {theme.id === 'system' && 'Follow system preference'}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="h-2 w-2 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}