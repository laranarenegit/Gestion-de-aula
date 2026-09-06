import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeConfig, ThemeKey } from '../types';

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  'gamer-8bit': {
    key: 'gamer-8bit',
    name: '👾 Gamer Retro 8-Bit',
    description: 'Estilo arcade retro de 8 bits con fuentes pixeladas, colores neón CRT y bordes de consola.',
    bgClass: 'bg-[#080811] text-[#39ff14]',
    cardBgClass: 'bg-[#101226]',
    surfaceClass: 'bg-[#0c0d1d]',
    textPrimaryClass: 'text-[#39ff14]',
    textSecondaryClass: 'text-[#00e5ff]',
    textMutedClass: 'text-[#ffdd00]',
    accentClass: 'bg-[#ff007f] hover:bg-[#d9006c] text-white font-bold',
    accentHoverClass: 'hover:bg-[#1a1c38] text-[#00e5ff]',
    accentTextClass: 'text-[#00e5ff]',
    borderClass: 'border-[#00e5ff]/40',
    badgeSuccessClass: 'bg-emerald-950/80 text-[#39ff14] border border-[#39ff14]',
    badgeWarningClass: 'bg-yellow-950/80 text-[#ffdd00] border border-[#ffdd00]',
    badgeDangerClass: 'bg-rose-950/80 text-[#ff0055] border border-[#ff0055]',
    isDark: true
  },
  'oscuro-elegante': {
    key: 'oscuro-elegante',
    name: 'High Density / Elegant Dark',
    description: 'Paleta técnica de alta densidad con fondo #0F1115, tarjetas #161B22 y acentos índigo.',
    bgClass: 'bg-[#0F1115] text-[#E2E8F0]',
    cardBgClass: 'bg-[#161B22]',
    surfaceClass: 'bg-[#0D1117]',
    textPrimaryClass: 'text-[#E2E8F0]',
    textSecondaryClass: 'text-[#8B949E]',
    textMutedClass: 'text-[#6E7681]',
    accentClass: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    accentHoverClass: 'hover:bg-[#1F2937] text-indigo-400',
    accentTextClass: 'text-indigo-400',
    borderClass: 'border-[#30363D]',
    badgeSuccessClass: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
    badgeWarningClass: 'bg-amber-950/40 text-yellow-400 border-amber-800/40',
    badgeDangerClass: 'bg-rose-950/40 text-red-400 border-rose-800/40',
    isDark: true
  },
  'azul-corporativo': {
    key: 'azul-corporativo',
    name: 'Azul Corporativo',
    description: 'Estilo profesional universitario con acentos azul marino y zafiro.',
    bgClass: 'bg-slate-50 text-slate-900',
    cardBgClass: 'bg-white',
    surfaceClass: 'bg-slate-100/80',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-600',
    textMutedClass: 'text-slate-400',
    accentClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    accentHoverClass: 'hover:bg-blue-50 text-blue-700',
    accentTextClass: 'text-blue-600',
    borderClass: 'border-slate-200',
    badgeSuccessClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeWarningClass: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeDangerClass: 'bg-rose-50 text-rose-700 border-rose-200',
    isDark: false
  },
  'minimalista-minimal': {
    key: 'minimalista-minimal',
    name: 'Minimalista Minimal',
    description: 'Diseño sobrio monocromático tipo editorial suizo con líneas limpias.',
    bgClass: 'bg-stone-50 text-stone-900',
    cardBgClass: 'bg-white',
    surfaceClass: 'bg-stone-100',
    textPrimaryClass: 'text-stone-900',
    textSecondaryClass: 'text-stone-600',
    textMutedClass: 'text-stone-400',
    accentClass: 'bg-stone-900 hover:bg-stone-800 text-white',
    accentHoverClass: 'hover:bg-stone-200 text-stone-900',
    accentTextClass: 'text-stone-900',
    borderClass: 'border-stone-200',
    badgeSuccessClass: 'bg-stone-100 text-stone-800 border-stone-300',
    badgeWarningClass: 'bg-stone-200 text-stone-800 border-stone-300',
    badgeDangerClass: 'bg-stone-900 text-stone-50 border-stone-900',
    isDark: false
  },
  'pastel-educativo': {
    key: 'pastel-educativo',
    name: 'Pastel Educativo',
    description: 'Tonos suaves y amigables inspirados en entornos pedagógicos modernos.',
    bgClass: 'bg-amber-50/40 text-neutral-800',
    cardBgClass: 'bg-white',
    surfaceClass: 'bg-amber-100/50',
    textPrimaryClass: 'text-neutral-800',
    textSecondaryClass: 'text-neutral-600',
    textMutedClass: 'text-neutral-400',
    accentClass: 'bg-teal-600 hover:bg-teal-700 text-white',
    accentHoverClass: 'hover:bg-teal-50 text-teal-700',
    accentTextClass: 'text-teal-700',
    borderClass: 'border-amber-200/70',
    badgeSuccessClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    badgeWarningClass: 'bg-orange-100 text-orange-800 border-orange-200',
    badgeDangerClass: 'bg-rose-100 text-rose-800 border-rose-200',
    isDark: false
  },
  'esmeralda-academico': {
    key: 'esmeralda-academico',
    name: 'Esmeralda Académico',
    description: 'Enfoque institucional de prestigio con tonos verde esmeralda y menta.',
    bgClass: 'bg-emerald-50/30 text-slate-900',
    cardBgClass: 'bg-white',
    surfaceClass: 'bg-emerald-100/40',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-600',
    textMutedClass: 'text-slate-400',
    accentClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    accentHoverClass: 'hover:bg-emerald-50 text-emerald-800',
    accentTextClass: 'text-emerald-700',
    borderClass: 'border-emerald-200/80',
    badgeSuccessClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeWarningClass: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeDangerClass: 'bg-red-100 text-red-800 border-red-300',
    isDark: false
  }
};

interface ThemeContextType {
  themeKey: ThemeKey;
  theme: ThemeConfig;
  setThemeKey: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem('gestion_estudiantes_theme');
    if (saved && saved in THEMES) {
      return saved as ThemeKey;
    }
    return 'gamer-8bit';
  });

  const handleSetThemeKey = (key: ThemeKey) => {
    setThemeKey(key);
    localStorage.setItem('gestion_estudiantes_theme', key);
  };

  const currentTheme = THEMES[themeKey] || THEMES['gamer-8bit'];

  useEffect(() => {
    if (currentTheme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (themeKey === 'gamer-8bit') {
      document.documentElement.classList.add('theme-gamer-8bit');
    } else {
      document.documentElement.classList.remove('theme-gamer-8bit');
    }
  }, [currentTheme.isDark, themeKey]);

  return (
    <ThemeContext.Provider value={{ themeKey, theme: currentTheme, setThemeKey: handleSetThemeKey }}>
      <div className={`min-h-screen transition-colors duration-200 ${currentTheme.bgClass}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
