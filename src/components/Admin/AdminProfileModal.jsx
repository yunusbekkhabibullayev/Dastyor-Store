import React, { useState, useEffect } from 'react';
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
  ArrowRightOnRectangleIcon as LogOutIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  PencilSquareIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import versionInfo from '../../version.json';

export const AdminProfileModal = ({ isOpen, onClose, onLogout }) => {
  const { lang, telegramUser, adminAuth, setAdminAuth, getAdminHeaders, triggerHaptic } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const role = adminAuth?.role || 'super_admin';
  const permissions = adminAuth?.permissions || [];
  const adminUser = adminAuth?.user || {};

  const roleConfigs = {
    developer: {
      name: 'Bosh Dasturchi',
      desc: 'Tizimning to\'liq arxitekturasi va barcha ma\'lumotlar bazasiga kirish huquqi',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: CommandLineIcon
    },
    super_admin: {
      name: 'Super Administrator',
      desc: 'Do\'konning barcha bo\'limlari va xodimlarini to\'liq boshqarish',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: ShieldCheckIcon
    },
    manager: {
      name: 'Menejer / Operator',
      desc: 'Buyurtmalar, mahsulotlar va mijozlar bilan ishlash huquqi',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: BriefcaseIcon
    },
    courier: {
      name: 'Kuryer',
      desc: 'Faqat buyurtmalar va yetkazib berish manzillari bilan ishlash',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: TruckIcon
    },
    content_manager: {
      name: 'Kontent Menejer',
      desc: 'Mahsulotlar, kategoriyalar va reklama bannerlarini tahrirlash',
      color: 'bg-pink-50 text-pink-700 border-pink-200',
      icon: PhotoIcon
    }
  };

  const currentRoleConfig = roleConfigs[role] || roleConfigs.super_admin;
  const RoleIcon = currentRoleConfig.icon;

  const adminName = adminUser.name 
    || (telegramUser ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim() : null)
    || (adminUser.login ? `@${adminUser.login}` : null)
    || 'Administrator';

  const adminLogin = adminUser.login;
  const adminPhone = adminUser.phone || '';
  const adminTelegramId = adminUser.telegram_id || telegramUser?.id;
  const initial = (adminName || 'A').charAt(0).toUpperCase();

  const permissionLabels = {
    dashboard: 'Statistika',
    orders: 'Buyurtmalar',
    products: 'Mahsulotlar',
    categories: 'Kategoriyalar',
    users: 'Mijozlar (CRM)',
    employees: 'Xodimlar & Rollar',
    settings: 'Bannerlar',
    'site-settings': 'Sayt Sozlamalari'
  };

  const handleStartEdit = () => {
    triggerHaptic('light');
    setEditName(adminUser.name || adminName || '');
    setEditPhone(adminUser.phone || '');
    setEditPassword('');
    setShowPassword(false);
    setSaveError('');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      triggerHaptic('warning');
      setSaveError(lang === 'uz' ? 'Ism kiritilishi shart!' : 'Имя обязательно!');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
          password: editPassword.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        triggerHaptic('notification');
        if (data.token) {
          if (localStorage.getItem('qlay_admin_token')) {
            localStorage.setItem('qlay_admin_token', data.token);
          } else {
            sessionStorage.setItem('qlay_admin_token', data.token);
          }
        }
        setAdminAuth(prev => ({
          ...prev,
          user: data.user
        }));
        setIsEditing(false);
        setToastMessage(lang === 'uz' ? 'Profil muvaffaqiyatli saqlandi!' : 'Профиль успешно сохранен!');
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        triggerHaptic('warning');
        setSaveError(data.message || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err) {
      triggerHaptic('warning');
      setSaveError(err.message || 'Server bilan aloqa xatosi');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl border border-gray-150 shadow-2xl overflow-hidden animate-scaleUp relative">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold backdrop-blur-md border border-gray-700 animate-scaleUp">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-lg text-white shadow-md">
              {initial}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white leading-tight">{adminName}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                  <RoleIcon className="w-3.5 h-3.5 text-blue-300" />
                  <span>{currentRoleConfig.name}</span>
                </span>
                {adminLogin && (
                  <span className="text-[10px] font-mono font-bold text-blue-200 bg-blue-500/20 px-1.5 py-0.2 rounded border border-blue-400/30">
                    @{adminLogin}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                title="Profilni tahrirlash"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                <span>Tahrirlash</span>
              </button>
            )}

            <button
              onClick={() => { triggerHaptic('light'); onClose(); }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Info */}
        <div className="p-6 space-y-4 text-xs">

          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSaveProfile} className="space-y-4 text-left animate-fadeIn">
              {saveError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-bold text-center">
                  ⚠️ {saveError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Ism va Familiya *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Masalan: Sardor Rahimov"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Telefon Raqami</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">
                  Yangi Maxfiy Parol (Ixtiyoriy)
                </label>
                <div className="relative">
                  <KeyIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="O'zgartirmaslik uchun bo'sh qoldiring"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Parolni yangilashni xohlamasangiz, bu maydonni bo'sh qoldiring.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? (
                    <span>Saqlanmoqda...</span>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Saqlash</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* View Details */
            <>
              {/* Role Card */}
              <div className={`p-4 rounded-2xl border ${currentRoleConfig.color} space-y-1 text-left`}>
                <div className="flex items-center gap-2 font-black text-xs">
                  <RoleIcon className="w-4 h-4" />
                  <span>{currentRoleConfig.name}</span>
                </div>
                <p className="text-[11px] opacity-90 leading-snug font-medium">
                  {currentRoleConfig.desc}
                </p>
              </div>

              {/* Details Row */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 space-y-2.5 text-left">
                {adminLogin && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-bold text-[11px]">Xodim Logini:</span>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      @{adminLogin}
                    </span>
                  </div>
                )}
                {adminPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-bold text-[11px]">Telefon raqami:</span>
                    <span className="font-mono font-bold text-gray-800">{adminPhone}</span>
                  </div>
                )}
                {adminTelegramId && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-bold text-[11px]">Telegram ID:</span>
                    <span className="font-mono font-black text-gray-800">{adminTelegramId}</span>
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
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    {telegramUser ? (
                      <>
                        <DevicePhoneMobileIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Telegram WebApp (Auto-Auth)</span>
                      </>
                    ) : (
                      <>
                        <ComputerDesktopIcon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Web Browser ({adminLogin ? `@${adminLogin}` : 'JWT Session'})</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                  <span className="text-gray-400 font-bold text-[11px]">Tizim versiyasi:</span>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-[10px]">
                    {versionInfo?.version || 'v2.0.86'}
                  </span>
                </div>
              </div>

              {/* Active Permissions Badges */}
              <div className="text-left">
                <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider block mb-2">
                  Faol Ruxsatlar ({permissions.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {permissions.map((p) => (
                    <span key={p} className="px-2.5 py-1 bg-gray-100 text-gray-700 font-bold text-[10px] rounded-lg border border-gray-200 flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3 text-blue-600" />
                      <span>{permissionLabels[p] || p}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Logout Action Button */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                >
                  <LogOutIcon className="w-4 h-4 text-rose-600" />
                  <span>{lang === 'uz' ? 'Tizimdan chiqish' : 'Выйти из системы'}</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
