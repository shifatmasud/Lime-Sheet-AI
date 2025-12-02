import React, { useState, useEffect } from 'react';

export type StyleObject = React.CSSProperties;

// Tier 2 - Design System Tokens

// 1. CSS Variable Mapping (Theme Agnostic)
const Var = {
  BaseSurface1: '--c-base-s-1',
  BaseSurface2: '--c-base-s-2',
  BaseSurface3: '--c-base-s-3',
  BaseContent1: '--c-base-c-1',
  BaseContent2: '--c-base-c-2',
  BaseContent3: '--c-base-c-3',
  BaseBorder1: '--c-base-b-1',
  BaseBorder2: '--c-base-b-2',
  AccentSurface1: '--c-accent-s-1',
  AccentSurface2: '--c-accent-s-2',
  AccentSurface3: '--c-accent-s-3',
  AccentContent1: '--c-accent-c-1',
  AccentContent2: '--c-accent-c-2',
};

// 2. Semantic Design Tokens
export const Tokens = {
  Color: {
    Base: {
      Surface: {
        1: `var(${Var.BaseSurface1})`, // Cards, Panels
        2: `var(${Var.BaseSurface2})`, // App Background
        3: `var(${Var.BaseSurface3})`, // Inputs, Sub-panels
      },
      Content: {
        1: `var(${Var.BaseContent1})`, // Headings, Primary Text
        2: `var(${Var.BaseContent2})`, // Body Text
        3: `var(${Var.BaseContent3})`, // Captions, Placeholders
      },
      Border: {
        1: `var(${Var.BaseBorder1})`, // Subtle dividers
        2: `var(${Var.BaseBorder2})`, // Active borders
      }
    },
    Accent: {
      Surface: {
        1: `var(${Var.AccentSurface1})`, // Primary Actions
        2: `var(${Var.AccentSurface2})`, // Secondary/Hover Actions
        3: `var(${Var.AccentSurface3})`, // Deep accents
      },
      Content: {
        1: `var(${Var.AccentContent1})`, // Text on Accent Surface
        2: `var(${Var.AccentContent2})`, // Accent colored text on Base Surface
      }
    },
    Feedback: {
      Error: '#ef4444',
      Success: '#22c55e',
      Warning: '#f59e0b',
      Info: '#3b82f6',
    }
  },
  Type: {
    Expressive: {
      Display: {
        L: { fontFamily: '"Bebas Neue", sans-serif', fontSize: '3.5rem', lineHeight: '1', letterSpacing: '0.03em' },
        M: { fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.5rem', lineHeight: '1.1', letterSpacing: '0.02em' },
        S: { fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.75rem', lineHeight: '1.1', letterSpacing: '0.02em' },
      },
      Quote: {
        M: { fontFamily: '"Comic Neue", cursive', fontSize: '1.25rem', lineHeight: '1.4', fontStyle: 'italic' },
      }
    },
    Readable: {
      Body: {
        L: { fontFamily: '"Inter", sans-serif', fontSize: '1.125rem', lineHeight: '1.6', fontWeight: 400 },
        M: { fontFamily: '"Inter", sans-serif', fontSize: '1rem', lineHeight: '1.6', fontWeight: 400 },
        S: { fontFamily: '"Inter", sans-serif', fontSize: '0.875rem', lineHeight: '1.5', fontWeight: 400 },
      },
      Label: {
        L: { fontFamily: '"Inter", sans-serif', fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em' },
        M: { fontFamily: '"Inter", sans-serif', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.01em' },
        S: { fontFamily: '"Inter", sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' as const },
      }
    }
  },
  Space: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
  },
  Effect: {
    Radius: {
      S: '12px',
      M: '16px',
      L: '24px',
      XL: '32px',
      Full: '9999px',
    },
    Shadow: {
      Soft: '0 12px 40px -10px rgba(0, 0, 0, 0.05)',
      Float: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
      Glow: '0 0 30px rgba(190, 242, 100, 0.3)',
      Inset: 'inset 0 2px 4px 0 rgba(0,0,0, 0.03)',
    },
    Transition: {
      Base: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      Fast: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
      Bounce: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }
  }
};

// 3. Helper Styles
export const S = {
  flexCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as StyleObject,
  flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as StyleObject,
  flexCol: { display: 'flex', flexDirection: 'column' } as StyleObject,
  absoluteFill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' } as StyleObject,
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  } as StyleObject,
  glassDark: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  } as StyleObject
};

// 4. Responsive Hook
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
};

// 5. Theme Configuration
const themes = {
  light: {
    [Var.BaseSurface1]: '#ffffff', 
    [Var.BaseSurface2]: '#f4f5f7', 
    [Var.BaseSurface3]: '#eef0f3', 
    [Var.BaseContent1]: '#111827',
    [Var.BaseContent2]: '#6b7280',
    [Var.BaseContent3]: '#9ca3af',
    [Var.BaseBorder1]: 'rgba(0, 0, 0, 0.04)',
    [Var.BaseBorder2]: 'rgba(0, 0, 0, 0.1)',
    [Var.AccentSurface1]: '#bef264',
    [Var.AccentSurface2]: '#ecfccb',
    [Var.AccentSurface3]: '#3f6212',
    [Var.AccentContent1]: '#1a2e05',
    [Var.AccentContent2]: '#65a30d',
  },
  dark: {
    [Var.BaseSurface1]: '#111827', 
    [Var.BaseSurface2]: '#030712', 
    [Var.BaseSurface3]: '#1f2937', 
    [Var.BaseContent1]: '#f9fafb',
    [Var.BaseContent2]: '#9ca3af',
    [Var.BaseContent3]: '#4b5563',
    [Var.BaseBorder1]: 'rgba(255, 255, 255, 0.06)',
    [Var.BaseBorder2]: 'rgba(255, 255, 255, 0.12)',
    [Var.AccentSurface1]: '#bef264',
    [Var.AccentSurface2]: 'rgba(190, 242, 100, 0.15)',
    [Var.AccentSurface3]: '#a3e635',
    [Var.AccentContent1]: '#1a2e05',
    [Var.AccentContent2]: '#d9f99d',
  }
};

export const injectTheme = (mode: 'light' | 'dark') => {
  const root = document.documentElement;
  const theme = themes[mode];
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Explicit Body Background to prevent white flash
  document.body.style.backgroundColor = theme[Var.BaseSurface2];
  document.body.style.color = theme[Var.BaseContent1];
};