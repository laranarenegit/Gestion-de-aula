import React, { useState } from 'react';
import { 
  GraduationCap, 
  Palette, 
  LogOut, 
  User as UserIcon, 
  HelpCircle, 
  Users, 
  BookOpen, 
  RotateCw,
  ChevronDown
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { GoogleUser, ThemeKey } from '../types';

interface NavbarProps {
  activeTab: 'students' | 'classes';
  setActiveTab: (tab: 'students' | 'classes') => void;
  user: GoogleUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogin,
  onLogout,
  onOpenGuide,
}) => {
  const { theme, themeKey, setThemeKey } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header 
      id="main-app-header"
      className={`sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors ${theme.surfaceClass} ${theme.borderClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`p-2.5 rounded-xl shadow-xs ${theme.accentClass}`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base sm:text-lg font-bold tracking-tight ${theme.textPrimaryClass}`}>
                  Gestión de Estudiantes
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-slate-100 text-slate-700 dark:bg-[#161B22] dark:text-slate-300 dark:border dark:border-[#30363D]">
                  Workspace DB
                </span>
              </div>
              <p className={`text-xs hidden md:block ${theme.textSecondaryClass}`}>
                Sincronización Sheets, Drive & Docs • Next.js Ready
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#161B22] border border-slate-200/60 dark:border-[#30363D]">
            <button
              id="tab-btn-students"
              type="button"
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'students'
                  ? `${theme.cardBgClass} ${theme.textPrimaryClass} shadow-xs font-semibold dark:border dark:border-[#30363D] dark:text-indigo-400`
                  : `${theme.textSecondaryClass} hover:${theme.textPrimaryClass} hover:bg-slate-200/50 dark:hover:bg-[#1F2937]`
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Estudiantes & Notas</span>
            </button>
            <button
              id="tab-btn-classes"
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'classes'
                  ? `${theme.cardBgClass} ${theme.textPrimaryClass} shadow-xs font-semibold dark:border dark:border-[#30363D] dark:text-indigo-400`
                  : `${theme.textSecondaryClass} hover:${theme.textPrimaryClass} hover:bg-slate-200/50 dark:hover:bg-[#1F2937]`
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Bitácora & Temario</span>
            </button>
          </nav>

          {/* Right Action Tools: Themes, Deployment Guide & Google Account */}
          <div className="flex items-center gap-2">
            
            {/* Theme Selector Dropdown */}
            <div className="relative">
              <button
                id="btn-theme-selector"
                type="button"
                onClick={() => {
                  setShowThemeMenu(!showThemeMenu);
                  setShowUserMenu(false);
                }}
                className={`p-2 rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textSecondaryClass} hover:${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors flex items-center gap-1`}
                title="Cambiar tema de diseño"
              >
                <Palette className="w-4 h-4 text-indigo-400" />
                <ChevronDown className="w-3 h-3 opacity-60 hidden sm:block" />
              </button>

              {showThemeMenu && (
                <div 
                  id="dropdown-theme-menu"
                  className={`absolute right-0 mt-2 w-64 p-2 rounded-xl shadow-xl border ${theme.cardBgClass} ${theme.borderClass} z-50`}
                >
                  <div className={`px-2 py-1.5 text-xs font-bold uppercase tracking-wider ${theme.textMutedClass}`}>
                    Paleta de Diseño
                  </div>
                  <div className="space-y-1">
                    {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
                      const t = THEMES[key];
                      const isActive = themeKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setThemeKey(key);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col gap-0.5 transition-colors ${
                            isActive 
                              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold' 
                              : `${theme.textSecondaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937]`
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{t.name}</span>
                            {isActive && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                          </div>
                          <span className="text-[11px] opacity-70 font-normal">
                            {t.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Next.js & Vercel Deployment Guide Modal Trigger */}
            <button
              id="btn-deployment-guide"
              type="button"
              onClick={onOpenGuide}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
              title="Ver guía completa para Next.js, Vercel y GitHub"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Guía Next.js & Vercel</span>
            </button>

            {/* Google User Menu or Sign In Button */}
            {user ? (
              <div className="relative">
                <button
                  id="btn-user-profile-menu"
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowThemeMenu(false);
                  }}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border ${theme.borderClass} ${theme.cardBgClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'Google User'} 
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-[#30363D]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
                    </div>
                  )}
                  <div className="hidden lg:block text-left text-xs">
                    <p className={`font-semibold line-clamp-1 ${theme.textPrimaryClass}`}>
                      {user.displayName || 'Docente'}
                    </p>
                    <p className={`text-[11px] line-clamp-1 ${theme.textMutedClass}`}>
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div 
                    id="dropdown-user-account-menu"
                    className={`absolute right-0 mt-2 w-72 p-3 rounded-xl shadow-xl border ${theme.cardBgClass} ${theme.borderClass} z-50`}
                  >
                    <div className={`pb-2.5 mb-2 border-b ${theme.borderClass}`}>
                      <p className={`text-xs font-semibold ${theme.textPrimaryClass}`}>
                        {user.displayName || 'Docente'}
                      </p>
                      <p className={`text-xs ${theme.textMutedClass}`}>
                        {user.email}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {/* Switch Google Account Option (Explicitly requested: "con otra cuenta de google") */}
                      <button
                        id="btn-switch-google-account"
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogin(); // triggers prompt: 'select_account'
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
                      >
                        <RotateCw className="w-4 h-4 text-indigo-400" />
                        <span>Cambiar a otra cuenta de Google</span>
                      </button>

                      {/* Log out */}
                      <button
                        id="btn-logout-google"
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-navbar-google-signin"
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Acceder con Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
