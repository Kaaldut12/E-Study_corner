// frontend/src/contexts/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, MODES } from '../utils/themes';

const ThemeContext = createContext({
  mode: 'dark',
  setMode: () => {},
  colorTheme: 'indigo',
  setColorTheme: () => {},
  toggleMode: () => {},
  THEMES,
  MODES
});

export const ThemeProvider = ({ children }) => {
  const [mode, setModeState] = useState(() => {
    return localStorage.getItem('estudy_mode') || 'dark';
  });

  const [colorTheme, setColorThemeState] = useState(() => {
    return localStorage.getItem('estudy_theme') || 'indigo';
  });

  // Apply mode and theme changes to HTML document element
  useEffect(() => {
    const root = document.documentElement;

    // Apply Mode (dark / light)
    root.setAttribute('data-mode', mode);
    if (mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('estudy_mode', mode);

    // Apply Color Theme
    root.setAttribute('data-theme', colorTheme);
    localStorage.setItem('estudy_theme', colorTheme);
  }, [mode, colorTheme]);

  const setMode = (newMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setColorTheme = (newColor) => {
    setColorThemeState(newColor);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        colorTheme,
        setColorTheme,
        THEMES,
        MODES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
