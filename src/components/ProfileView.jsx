import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  UserIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  ArrowRightOnRectangleIcon as LogOutIcon, 
  XMarkIcon, 
  ChevronDownIcon, 
  ChevronRightIcon, 
  Cog6ToothIcon as SettingsIcon,
  PhoneIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  CheckIcon,
  SparklesIcon,
  ShoppingBagIcon,
  HeartIcon,
  GlobeAltIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const formatUzPhone = (inputValue) => {
  let digits = inputValue || '';
  if (digits.startsWith('+998')) {
    digits = digits.slice(4);
  }
  digits = digits.replace(/\D/g, '');
  digits = digits.slice(0, 9);
  
  let formatted = '+998 ';
  if (digits.length > 0) {
    formatted += digits.slice(0, 2);
  }
  if (digits.length >= 2) {
    formatted += ' ';
  }
  if (digits.length > 2) {
    formatted += digits.slice(2, 5);
  }
  if (digits.length >= 5) {
    formatted += '-';
  }
  if (digits.length > 5) {
    formatted += digits.slice(5, 7);
  }
  if (digits.length >= 7) {
    formatted += '-';
  }
  if (digits.length > 7) {
    formatted += digits.slice(7, 9);
  }
  return formatted;
};

export const ProfileView = () => {
  const {
    lang, toggleLanguage, t, orders, triggerHaptic, profileUser, setProfileUser, updateProfileUser, 
    loginCustomer, logoutUser, clearOrders, deleteOrder, profileSubView, setProfileSubView, 
    showConfirm, telegramUser, setIsAdminMode, siteSettings, formatQuantity, adminAuth,
    isCustomerLoggedIn, openAuthModal, setActiveTab
  } = useStore();

  // Logged-in Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profileUser?.name || '');
  const [editPhone, setEditPhone] = useState(profileUser?.phone ? formatUzPhone(profileUser.phone) : '+998 ');
  const [editAddress, setEditAddress] = useState(profileUser?.address || '');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Order history accordion & pagination
  const [expandedOrders, setExpandedOrders] = useState({});
  const [visibleCount, setVisibleCount] = useState(5);

  const checkIsAdmin = () => {
    if (!telegramUser || !telegramUser.id) return false;
    const currentId = telegramUser.id;
    if (siteSettings && siteSettings.admin_ids) {
      const dynamicIds = siteSettings.admin_ids.split(',').map(s => parseInt(s.trim(), 10)).filter(id => !isNaN(id));
      if (dynamicIds.includes(currentId)) {
        return true;
      }
    }
    return false;
  };

  // Sync edit states when profileUser changes
  useEffect(() => {
    if (profileUser) {
      setEditName(profileUser.name || '');
      setEditPhone(profileUser.phone ? formatUzPhone(profileUser.phone) : '+998 ');
      setEditAddress(profileUser.address || '');
    }
  }, [profileUser]);

  // Infinite Scroll for history sub-view
  useEffect(() => {
    if (profileSubView !== 'history') return;

    const handleScroll = () => {
      const threshold = 120;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (docHeight - (scrollTop + windowHeight) < threshold) {
        setVisibleCount((prev) => {
          if (prev < orders.length) {
            triggerHaptic('light');
            return prev + 5;
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [profileSubView, orders.length, triggerHaptic]);

  // Handle Logged-in Profile Edit Save
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editName.trim()) {
      triggerHaptic('warning');
      setEditError(lang === 'uz' ? 'Ism kiritilishi shart' : 'Имя обязательно');
      return;
    }

    const phoneDigits = editPhone.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
      triggerHaptic('warning');
      setEditError(lang === 'uz' ? 'Telefon raqamini to\'liq kiriting' : 'Введите полный номер');
      return;
    }

    setEditSaving(true);
    try {
      await updateProfileUser({
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim()
      });

      // If new password provided, sync via API
      if (editPassword && editPassword.trim()) {
        await fetch('/api/user/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: editPhone.trim(),
            name: editName.trim(),
            password: editPassword.trim(),
            address: editAddress.trim()
          })
        });
      }

      triggerHaptic('notification');
      setIsEditing(false);
      setEditPassword('');
    } catch (err) {
      triggerHaptic('warning');
      setEditError(err.message || 'Saqlashda xatolik');
    } finally {
      setEditSaving(false);
    }
  };

  const isUserAuthenticated = isCustomerLoggedIn || (profileUser && (profileUser.name || profileUser.phone));

  // ─────────────────────────────────────────────────────────────────────────────
  // SUB-VIEW: FULL ORDER HISTORY ACCORDION PAGE
  // ─────────────────────────────────────────────────────────────────────────────
  if (profileSubView === 'history') {
    const visibleOrders = orders.slice(0, visibleCount);

    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto text-left animate-fadeIn pb-24">
        {/* Header with Back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerHaptic('light');
              setProfileSubView(null);
            }}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 leading-tight">
              {lang === 'uz' ? 'Buyurtmalar tarixi' : 'История заказов'}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {orders.length} {lang === 'uz' ? 'ta buyurtma' : 'заказов'}
            </p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-150 text-center space-y-3 shadow-2xs">
            <ClockIcon className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-700">
              {lang === 'uz' ? 'Hozircha buyurtmalar yo\'q' : 'Заказов пока нет'}
            </h3>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleOrders.map((order) => {
              const isExpanded = !!expandedOrders[order.id];

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-150 shadow-2xs overflow-hidden transition-all">
                  <div 
                    onClick={() => {
                      triggerHaptic('light');
                      setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }));
                    }}
                    className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-gray-50/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 text-sm">#{order.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          {order.status || 'Kutilmoqda'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{order.date}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-gray-900 text-sm">{order.total?.toLocaleString()} so'm</span>
                      <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/40 space-y-3 animate-fadeIn">
                      <div className="space-y-2">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-gray-700 font-bold">{item.title?.[lang] || item.title?.uz || item.title || 'Mahsulot'} × {item.quantity}</span>
                            <span className="font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} so'm</span>
                          </div>
                        ))}
                      </div>

                      {order.address && (
                        <div className="pt-2 border-t border-gray-150 flex items-start gap-1.5 text-[11px] text-gray-600">
                          <MapPinIcon className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{order.address}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UZUM STYLE GUEST PROFILE MENU (IF NOT LOGGED IN)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isUserAuthenticated) {
    return (
      <div className="p-4 max-w-lg mx-auto text-left space-y-3 animate-fadeIn pb-24">
        
        {/* Top Header Link: Kirish / Ro'yxatdan o'tish */}
        <div className="flex items-center justify-end px-1 pb-1">
          <button
            onClick={() => {
              triggerHaptic('medium');
              openAuthModal();
            }}
            className="text-xs font-extrabold text-[#7000ff] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{lang === 'uz' ? 'Kirish' : 'Войти'}</span>
            <span>/</span>
            <span>{lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Регистрация'}</span>
          </button>
        </div>

        {/* Guest Banner Card */}
        <div 
          onClick={() => {
            triggerHaptic('medium');
            openAuthModal();
          }}
          className="bg-gradient-to-br from-purple-50 via-white to-blue-50/40 rounded-3xl p-5 border border-purple-100 shadow-2xs flex items-center justify-between cursor-pointer hover:border-purple-200 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#7000ff] text-white flex items-center justify-center text-xl font-black shadow-md shadow-purple-500/20 shrink-0">
              <UserIcon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 leading-tight">
                {lang === 'uz' ? 'DastyorID orqali kiring' : 'Войти через DastyorID'}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {lang === 'uz' ? 'Buyurtmalar va qulay xaridlar' : 'Заказы и удобные покупки'}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 bg-[#7000ff] text-white text-xs font-extrabold rounded-xl shadow-sm">
            {lang === 'uz' ? 'Kirish' : 'Войти'}
          </div>
        </div>

        {/* Uzum-style Menu Items */}
        <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-2xs divide-y divide-gray-100">
          {/* Buyurtmalarim */}
          <button
            onClick={() => {
              triggerHaptic('light');
              openAuthModal();
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
              <span className="text-xs font-bold text-gray-800">
                {lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы'}
              </span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </button>

          {/* Saralanganlar */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('favorites');
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <HeartIcon className="w-5 h-5 text-gray-600" />
              <span className="text-xs font-bold text-gray-800">
                {lang === 'uz' ? 'Saralangan' : 'Избранное'}
              </span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </button>

          {/* Sayt tili */}
          <button
            onClick={() => {
              triggerHaptic('light');
              toggleLanguage();
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <GlobeAltIcon className="w-5 h-5 text-gray-600" />
              <span className="text-xs font-bold text-gray-800">
                {lang === 'uz' ? 'Sayt tili: O\'zbekcha' : 'Язык сайта: Русский'}
              </span>
            </div>
            <span className="text-xs font-extrabold text-blue-600 uppercase">
              {lang}
            </span>
          </button>
        </div>

        {/* Store Info Footer */}
        <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-900 font-extrabold">
            <InformationCircleIcon className="w-4 h-4 text-purple-600" />
            <span>{siteSettings?.name || 'Dastyor Market'}</span>
          </div>
          <p className="text-gray-500 font-medium text-[11px] leading-relaxed">
            {siteSettings?.description || 'Oziq-ovqat va sifatli mahsulotlar yetkazib berish xizmati.'}
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN VIEW: LOGGED-IN CUSTOMER PROFILE
  // ─────────────────────────────────────────────────────────────────────────────
  const initial = (profileUser?.name || 'M').charAt(0).toUpperCase();

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto text-left animate-fadeIn pb-24">
      
      {/* Profile Card */}
      {!isEditing ? (
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-blue-500/20 shrink-0">
                {initial}
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 leading-tight">
                  {profileUser?.name || (lang === 'uz' ? 'Mijoz' : 'Клиент')}
                </h3>
                <p className="text-xs text-gray-500 font-mono font-bold mt-0.5">
                  {profileUser?.phone || '+998 ( ) xxx xx xx'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                setIsEditing(true);
              }}
              className="p-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-xl border border-gray-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Profilni tahrirlash"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          </div>

          {profileUser?.address && (
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-150 flex items-start gap-2 text-xs text-gray-700">
              <MapPinIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Yetkazib berish manzili</span>
                <span className="font-semibold text-gray-800">{profileUser.address}</span>
              </div>
            </div>
          )}

          {/* Admin Panel button (for admins / employees) */}
          {(adminAuth?.isAdmin || checkIsAdmin()) && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                setIsAdminMode(true);
              }}
              className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all border border-blue-200 active:scale-98 shadow-2xs cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4 text-blue-600" />
              <span>
                {adminAuth?.role === 'developer'
                  ? '💻 Dasturchi paneliga o\'tish'
                  : '👑 Admin panelga o\'tish'}
              </span>
            </button>
          )}
        </div>
      ) : (
        /* Edit Profile Form */
        <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900">
              {lang === 'uz' ? 'Profilni Tahrirlash' : 'Редактировать профиль'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {editError && (
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 text-center animate-shake">
              ⚠️ {editError}
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-extrabold text-gray-700 block mb-1">Ism va Familiya *</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="font-extrabold text-gray-700 block mb-1">Telefon Raqami *</label>
              <input
                type="text"
                required
                value={editPhone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length < 5) {
                    setEditPhone('+998 ');
                    return;
                  }
                  setEditPhone(formatUzPhone(val));
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="font-extrabold text-gray-700 block mb-1">Yetkazib Berish Manzili</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Toshkent sh., ..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="font-extrabold text-gray-700 block mb-1">Yangi Parol (Ixtiyoriy)</label>
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="O'zgartirmaslik uchun bo'sh qoldiring"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={editSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {editSaving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      )}

      {/* Order History Button */}
      <button
        onClick={() => {
          triggerHaptic('light');
          setProfileSubView('history');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        className="w-full py-4 px-5 bg-white border border-gray-150 rounded-2xl flex items-center justify-between text-gray-900 font-bold text-xs hover:bg-gray-50 active:scale-[0.99] transition-all shadow-2xs cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-blue-600" />
          <span>{lang === 'uz' ? 'Barcha buyurtmalar tarixi' : 'История заказов'}</span>
          {orders.length > 0 && (
            <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-100">
              {orders.length}
            </span>
          )}
        </span>
        <ChevronRightIcon className="w-4 h-4 text-blue-600" />
      </button>

      {/* Log out Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            showConfirm(
              lang === 'uz' ? 'Tizimdan chiqish' : 'Выйти из аккаунта',
              lang === 'uz' ? 'Haqiqatan ham profilingizdan chiqmoqchimisiz?' : 'Вы действительно хотите выйти из своего профиля?',
              logoutUser
            );
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <LogOutIcon className="w-4 h-4 text-rose-600" />
          <span>{lang === 'uz' ? 'Profildan chiqish' : 'Выйти'}</span>
        </button>
      </div>
    </div>
  );
};
