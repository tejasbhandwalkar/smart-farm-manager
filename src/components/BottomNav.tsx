import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Map, 
  Wheat, 
  Bot, 
  Wallet,
  Menu
} from 'lucide-react';

interface BottomNavProps {
  onOpenMoreMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMoreMenu }) => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/plots', label: t('nav.plots'), icon: Map },
    { to: '/crops', label: t('nav.crops'), icon: Wheat },
    { to: '/ai-advisor', label: 'कृषी AI', icon: Bot, isAi: true },
    { to: '/finance', label: t('nav.finance'), icon: Wallet },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg safe-area-bottom">
      <div className="grid grid-cols-6 gap-1 items-center max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${
                  isActive
                    ? item.isAi
                      ? 'text-emerald-800 font-bold bg-emerald-100 shadow-sm'
                      : 'text-emerald-700 font-bold bg-emerald-50/90'
                    : item.isAi
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-emerald-600'
                }`
              }
            >
              <Icon className={`w-5 h-5 mb-0.5 ${item.isAi ? 'text-emerald-600 animate-pulse' : ''}`} />
              <span className="text-[10px] leading-tight truncate max-w-[54px] text-center">
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={onOpenMoreMenu}
          className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight text-center font-medium">
            {t('nav.settings')}
          </span>
        </button>
      </div>
    </nav>
  );
};
