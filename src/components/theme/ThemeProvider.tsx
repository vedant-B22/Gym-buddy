'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'dark' | 'light';
type AccentColor = 'emerald' | 'orange' | 'crimson';

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  toggleMode: () => void;
  setAccent: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  accent: 'emerald',
  toggleMode: () => {},
  setAccent: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [accent, setAccentState] = useState<AccentColor>('emerald');

  useEffect(() => {
    const savedMode = (localStorage.getItem('gym_theme_mode') as ThemeMode) || 'dark';
    const savedAccent = (localStorage.getItem('gym_accent_color') as AccentColor) || 'emerald';
    
    setMode(savedMode);
    setAccentState(savedAccent);

    applyTheme(savedMode, savedAccent);
  }, []);

  const applyTheme = (m: ThemeMode, a: AccentColor) => {
    const root = document.documentElement;
    if (m === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('dark');
    }

    root.removeAttribute('data-accent');
    if (a !== 'emerald') {
      root.setAttribute('data-accent', a);
    }
  };

  const toggleMode = () => {
    const nextMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
    localStorage.setItem('gym_theme_mode', nextMode);
    applyTheme(nextMode, accent);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem('gym_accent_color', newAccent);
    applyTheme(mode, newAccent);
  };

  return (
    <ThemeContext.Provider value={{ mode, accent, toggleMode, setAccent }}>
      <div className={mode === 'light' ? 'theme-light' : 'dark'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
