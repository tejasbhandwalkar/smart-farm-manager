import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Map,
  Wheat,
  Users,
  CheckSquare,
  Droplets,
  Wallet,
  Tractor,
  Boxes,
  ShieldAlert,
  ShoppingBag,
  CloudSun,
  Database,
  X,
  Sparkles,
  Bot,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDbModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenDbModal }) => {
  const { t } = useTranslation();

  const links = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/ai-advisor', label: t('nav.ai_advisor'), icon: Bot, badge: 'AI 🤖' },
    { to: '/plots', label: t('nav.plots'), icon: Map, badge: '२० एकर' },
    { to: '/crops', label: t('nav.crops'), icon: Wheat },
    { to: '/workers', label: t('nav.workers'), icon: Users },
    { to: '/tasks', label: t('nav.tasks'), icon: CheckSquare },
    { to: '/irrigation', label: t('nav.irrigation'), icon: Droplets },
    { to: '/finance', label: t('nav.finance'), icon: Wallet },
    { to: '/machinery', label: t('nav.machinery'), icon: Tractor },
    { to: '/inventory', label: t('nav.inventory'), icon: Boxes },
    { to: '/crop-health', label: t('nav.crop_health'), icon: ShieldAlert },
    { to: '/harvest-sales', label: t('nav.harvest_sales'), icon: ShoppingBag },
    { to: '/weather', label: t('nav.weather'), icon: CloudSun },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-30`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-emerald-100 bg-emerald-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              🌾
            </div>
            <div>
              <span className="font-bold text-emerald-950 text-base leading-tight block">
                {t('app.name')}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                {t('app.farm_title')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* 20-Acre Quick Stats in Sidebar */}
        <div className="p-4 mx-3 mb-3 bg-gradient-to-br from-emerald-50 to-green-100/70 border border-emerald-200 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>शेती क्षेत्र वाटप</span>
            </span>
            <span className="text-xs font-bold text-emerald-700">२० एकर</span>
          </div>
          <div className="w-full bg-emerald-200/80 rounded-full h-2 mb-2 overflow-hidden flex">
            <div className="bg-emerald-600 h-2" style={{ width: '40%' }} title="ऊस (८ एकर)" />
            <div className="bg-amber-500 h-2" style={{ width: '30%' }} title="गहू (६ एकर)" />
            <div className="bg-purple-500 h-2" style={{ width: '20%' }} title="कांदा (४ एकर)" />
            <div className="bg-slate-300 h-2" style={{ width: '10%' }} title="पडीक (२ एकर)" />
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>ऊस: ८ एकर</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>गहू: ६ एकर</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>कांदा: ४ एकर</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>पडीक: २ एकर</span>
            </div>
          </div>
        </div>

        {/* Database Button in Sidebar footer */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => {
              onClose();
              onOpenDbModal();
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300 transition-colors"
          >
            <Database className="w-4 h-4 text-emerald-700" />
            <span>{t('database.title')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
