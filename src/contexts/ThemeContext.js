import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    name: 'Темная',
    background: '#000000',
    surface: 'rgba(38, 38, 38, 1)',
    surfaceHover: 'rgba(48, 48, 48, 1)',
    text: 'rgba(255, 255, 255, 0.9)',
    textSecondary: 'rgba(154, 153, 153, 1)',
    border: 'rgba(209, 209, 209, 0.1)',
    accent: 'rgba(237, 93, 25, 1)',
  },
  light: {
    name: 'Светлая',
    background: '#ffffff',
    surface: 'rgba(245, 245, 245, 1)',
    surfaceHover: 'rgba(235, 235, 235, 1)',
    text: 'rgba(0, 0, 0, 0.87)',
    textSecondary: 'rgba(0, 0, 0, 0.6)',
    border: 'rgba(0, 0, 0, 0.12)',
    accent: 'rgba(237, 93, 25, 1)',
  },
  pink: {
    name: 'Розовая',
    background: '#1a0a14',
    surface: 'rgba(45, 20, 35, 1)',
    surfaceHover: 'rgba(60, 30, 48, 1)',
    text: 'rgba(255, 192, 203, 0.95)',
    textSecondary: 'rgba(255, 182, 193, 0.7)',
    border: 'rgba(255, 105, 180, 0.2)',
    accent: 'rgba(255, 105, 180, 1)',
  },
  blue: {
    name: 'Синяя',
    background: '#0a0e1a',
    surface: 'rgba(20, 30, 48, 1)',
    surfaceHover: 'rgba(30, 42, 65, 1)',
    text: 'rgba(173, 216, 230, 0.95)',
    textSecondary: 'rgba(135, 206, 250, 0.7)',
    border: 'rgba(30, 144, 255, 0.2)',
    accent: 'rgba(30, 144, 255, 1)',
  },
  purple: {
    name: 'Фиолетовая',
    background: '#0f0a1a',
    surface: 'rgba(30, 20, 48, 1)',
    surfaceHover: 'rgba(45, 30, 65, 1)',
    text: 'rgba(216, 191, 216, 0.95)',
    textSecondary: 'rgba(186, 85, 211, 0.7)',
    border: 'rgba(138, 43, 226, 0.2)',
    accent: 'rgba(138, 43, 226, 1)',
  },
  green: {
    name: 'Зеленая',
    background: '#0a1a0a',
    surface: 'rgba(20, 48, 20, 1)',
    surfaceHover: 'rgba(30, 65, 30, 1)',
    text: 'rgba(144, 238, 144, 0.95)',
    textSecondary: 'rgba(50, 205, 50, 0.7)',
    border: 'rgba(34, 139, 34, 0.2)',
    accent: 'rgba(34, 139, 34, 1)',
  },
  orange: {
    name: 'Оранжевая',
    background: '#1a0f0a',
    surface: 'rgba(48, 30, 20, 1)',
    surfaceHover: 'rgba(65, 42, 30, 1)',
    text: 'rgba(255, 218, 185, 0.95)',
    textSecondary: 'rgba(255, 165, 0, 0.7)',
    border: 'rgba(255, 140, 0, 0.2)',
    accent: 'rgba(255, 140, 0, 1)',
  },
  red: {
    name: 'Красная',
    background: '#1a0a0a',
    surface: 'rgba(48, 20, 20, 1)',
    surfaceHover: 'rgba(65, 30, 30, 1)',
    text: 'rgba(255, 182, 193, 0.95)',
    textSecondary: 'rgba(220, 20, 60, 0.7)',
    border: 'rgba(178, 34, 34, 0.2)',
    accent: 'rgba(220, 20, 60, 1)',
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('atomglide-theme');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('atomglide-theme', currentTheme);
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const theme = themes[currentTheme];
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    changeTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00
