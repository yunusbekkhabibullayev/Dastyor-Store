import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  UserCircleIcon, 
  XMarkIcon, 
  ShieldCheckIcon, 
  CommandLineIcon, 
  BriefcaseIcon, 
  TruckIcon, 
  PhotoIcon, 
  PhoneIcon, 
  IdentificationIcon, 
  BuildingStorefrontIcon as StoreIcon, 
  ArrowRightOnRectangleIcon as LogOutIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import versionInfo from '../../version.json';

export const AdminProfileModal = ({ isOpen, onClose, onBackToStore, onLogout }) => {
  const { lang, telegramUser, adminAuth, triggerHaptic } = useStore();

  if (!isOpen) return null;

  const role = adminAuth?.role || 'super_admin';
  const permissions = adminAuth?.permissions || [];

  const roleConfigs = {
    developer: {
      name: '💻 Bosh Dasturchi',
      desc: 'Tizimning to\'liq arxitekturasi va barcha ma\'lumotlar bazasiga kirish huquqi',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: CommandLineIcon
    },
    super_admin: {
      name: '👑 Super Administrator',
      desc: 'Do\'konning barcha bo\'limlari va xodimlarini to\'liq boshqarish',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: ShieldCheckIcon
    },
    manager: {
      name: '🧑‍💼 Menejer / Operator',
      desc: 'Buyurtmalar, mahsulotlar va mijozlar bilan ishlash huquqi',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: BriefcaseIcon
    },
    courier: {
      name: '🚚 Kuryer',
      desc: 'Faqat buyurtmalar va yetkazib berish manzillari bilan ishlash',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: TruckIcon
    },
    content_manager: {
      name: '🎨 Kontent Menejer',
      desc: 'Mahsulotlar, kategoriyalar va reklama bannerlarini tahrirlash',
      color: 'bg-pink-50 text-pink-700 border-pink-200',
      icon: PhotoIcon
    }
  };

  const currentRoleConfig = roleConfigs[role] || roleConfigs.super_admin;
  const RoleIcon = currentRoleConfig.icon;

  const adminName = telegramUser 
    ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim() 
    : (adminAuth?.id || 'Yunusbek Khabibullayev');

  const permissionLabels = {
    dashboard: '📊 Statistika',
    orders: '🛒 Buyurtmalar',
    products: '📦 Mahsulotlar',
    categories: '🗂️ Kategoriyalar',
    users: '👥 Mijozlar (CRM)',
    employees: '🧑‍💼 Xodimlar & Rollar',
    settings: '🖼️ Bannerlar',
    'site-settings': '⚙️ Sayt Sozlamalari'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl border border-gray-150 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-lg text-white shadow-md">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white leading-tight">{adminName}</h3>
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block mt-0.5">
                {currentRoleConfig.name}
              </span>
            </div>
          </div>

          <button
            onClick={() => { triggerHaptic('light'); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body Info */}
        <div className="p-6 space-y-4 text-xs">
          {/* Role Card */}
          <div className={`p-4 rounded-2xl border ${currentRoleConfig.color} space-y-1`}>
            <div className="flex items-center gap-2 font-black text-xs">
              <RoleIcon className="w-4 h-4" />
              <span>{currentRoleConfig.name}</span>
            </div>
            <p className="text-[11px] opacity-90 leading-snug font-medium">
              {currentRoleConfig.desc}
            </p>
          </div>

          {/* Details Row */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 space-y-2.5">
            {telegramUser && telegramUser.id && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold text-[11px]">Telegram ID:</span>
                <span className="font-mono font-black text-gray-800">{telegramUser.id}</span>
              </div>
            )}
            {telegramUser && telegramUser.username && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold text-[11px]">Telegram Username:</span>
                <span className="font-bold text-blue-600">@{telegramUser.username}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-bold text-[11px]">Kirish usuli:</span>
              <span className="font-bold text-gray-800">
                {telegramUser ? '📱 Telegram WebApp (Auto-Auth)' : '🌐 Web Browser (JWT Session)'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="text-gray-400 font-bold text-[11px]">Tizim versiyasi:</span>
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-[10px]">
                {versionInfo?.version || 'v2.0.76'}
              </span>
            </div>
          </div>

          {/* Active Permissions Badges */}
          <div>
            <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider block mb-2">
              Faol Ruxsatlar ({permissions.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {permissions.map((p) => (
                <span key={p} className="px-2.5 py-1 bg-gray-100 text-gray-700 font-bold text-[10px] rounded-lg border border-gray-200">
                  {permissionLabels[p] || p}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <button
              onClick={() => {
                onClose();
                onBackToStore();
              }}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <StoreIcon className="w-4 h-4 text-gray-500" />
              <span>{lang === 'uz' ? 'Saytga qaytish' : 'Вернуться в магазин'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <LogOutIcon className="w-4 h-4 text-rose-600" />
              <span>{lang === 'uz' ? 'Tizimdan chiqish' : 'Выйти из системы'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
