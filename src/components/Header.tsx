import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  Globe, 
  Database, 
  Menu, 
  X, 
  User, 
  CheckCircle2, 
  Calendar,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenDbModal: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDbModal, onToggleSidebar, isSidebarOpen }) => {
  const { t, i18n } = useTranslation();
  const { updateLanguage, isCloudConnected, user, profile } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang = i18n.language || 'mr';

  const languages = [
    { code: 'mr', label: 'मराठी', flag: '🚩' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'en', label: 'English', flag: '🌐' },
  ];

  const handleLangChange = (code: 'mr' | 'hi' | 'en') => {
    updateLanguage(code);
    setLangMenuOpen(false);
  };

  const todayStr = new Date().toLocaleDateString(
    currentLang === 'en' ? 'en-IN' : 'mr-IN',
    { weekday: 'short', day: 'numeric', month: 'short' }
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center space-x-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-emerald-800 hover:bg-emerald-50 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-lg sm:text-xl font-bold text-emerald-950 tracking-tight leading-tight">
                    {t('app.name')}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    २० एकर
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium hidden sm:block">
                  {t('app.farm_title')} • ऊस | गहू | कांदा
                </p>
              </div>
            </div>
          </div>

          {/* Right: Date, Language Switcher & Database Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Today's Date Badge */}
            <div className="hidden md:flex items-center space-x-1 text-xs text-slate-600 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{todayStr}</span>
            </div>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
              >
                <Globe className="w-4 h-4 text-emerald-700" />
                <span>{languages.find(l => l.code === currentLang)?.label || 'मराठी'}</span>
                <span className="text-[10px] text-emerald-600">▼</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-emerald-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {t('languages.select')}
                  </div>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-left hover:bg-emerald-50 transition-colors ${
                        currentLang === lang.code ? 'font-bold text-emerald-700 bg-emerald-50/70' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {currentLang === lang.code && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Krishi Advisor Direct Pill */}
            <Link
              to="/ai-advisor"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white shadow-md shadow-emerald-700/20 hover:scale-105 transition-all border border-emerald-500/30"
              title="AI कृषी सल्लागार"
            >
              <Bot className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>कृषी AI 🤖</span>
            </Link>

            {/* Supabase Database Connection Pill */}
            <button
              onClick={onOpenDbModal}
              className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-sm ${
                isCloudConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title={isCloudConnected ? t('database.status_connected') : t('database.status_local_sync')}
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                {isCloudConnected ? 'Supabase' : 'Offline-Sync'}
              </span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
            </button>

            {/* Profile Avatar / Indicator */}
            <button
              onClick={onOpenDbModal}
              className="p-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
              title={profile?.full_name || 'Farmer Account'}
            >
              <User className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
