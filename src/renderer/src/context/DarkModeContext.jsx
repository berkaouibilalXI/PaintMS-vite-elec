import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [systemPreference, setSystemPreference] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Initialize darkMode based on saved preference
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;

    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      return true;
    } else if (savedTheme === 'light') {
      return false;
    } else {
      // savedTheme is 'system' or null, use system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemPreference(e.matches);
      
      // If user is using system theme, update dark mode
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme || savedTheme === 'system') {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document whenever darkMode changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const setTheme = (theme) => {
    console.log('Setting theme to:', theme); // Debug log
    
    localStorage.setItem('theme', theme);
    
    if (theme === 'system') {
      setDarkMode(systemPreference);
    } else if (theme === 'dark') {
      setDarkMode(true);
    } else if (theme === 'light') {
      setDarkMode(false);
    }
  };

  const getCurrentTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'system';
  };

  return (
    <DarkModeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        setTheme,
        getCurrentTheme,
        systemPreference
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}