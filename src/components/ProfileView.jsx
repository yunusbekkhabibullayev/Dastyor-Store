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
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { ProductImage } from './ProductImage';

const formatUzPhone = (inputValue) => {
  let digits = inputValue || '';
  if (digits.startsWith('+998')) {
    digits = digits.slice(4);
  }
  digits = digits.replace(/\D/g, '');
  digits = digits.slice(0, 9);
  
  let formatted = '+998 (';
  if (digits.length > 0) {
    formatted += digits.slice(0, 2);
  }
  if (digits.length >= 2) {
    formatted += ') ';
  }
  if (digits.length > 2) {
    formatted += digits.slice(2, 5);
  }
  if (digits.length >= 5) {
    formatted += ' ';
  }
  if (digits.length > 5) {
    formatted += digits.slice(5, 7);
  }
  if (digits.length >= 7) {
    formatted += ' ';
  }
  if (digits.length > 7) {
    formatted += digits.slice(7, 9);
  }
  return formatted;
};

export const ProfileView = () => {
  const {
    lang, t, orders, triggerHaptic, profileUser, setProfileUser, updateProfileUser, 
    loginCustomer, logoutUser, clearOrders, deleteOrder, profileSubView, setProfileSubView, 
    showConfirm, telegramUser, setIsAdminMode, siteSettings, formatQuantity, adminAuth,
    isCustomerLoggedIn
  } = useStore();

  // Auth Flow states
  const [authStep, setAuthStep] = useState('phone'); // 'phone' | 'password' | 'register'
  const [phoneInput, setPhoneInput] = useState('+998 (');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [detectedUser, setDetectedUser] = useState(null);

  // Register / Edit states
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Logged-in Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profileUser?.name || '');
  const [editPhone, setEditPhone] = useState(profileUser?.phone ? formatUzPhone(profileUser.phone) : '+998 (');
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
      setEditPhone(profileUser.phone ? formatUzPhone(profileUser.phone) : '+998 (');
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

  // Handle Step 1: Check Phone Number
  const handleCheckPhone = async (e) => {
    e.preventDefault();
    setAuthError('');

    const phoneDigits = phoneInput.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
      triggerHaptic('warning');
      setAuthError(lang === 'uz' ? 'Iltimos, telefon raqamingizni to\'liq kiriting' : 'Введите полный номер телефона');
      return;
    }

    const prefix = phoneDigits.slice(3, 5);
    const allowedPrefixes = ['90', '91', '93', '94', '50', '55', '99', '95', '77', '97', '88', '33', '98', '20'];
    if (!allowedPrefixes.includes(prefix)) {
      triggerHaptic('warning');
      setAuthError(lang === 'uz' ? 'Noto\'g\'ri operator kodi (90, 91, 93, 94, 50, 55, 99, 95, 77, 97, 88, 33, 98, 20)' : 'Неверный код оператора');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/user/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput })
      });
      const data = await res.json();

      if (data.success) {
        triggerHaptic('light');
        if (data.exists && data.user && data.user.hasPassword) {
          // User exists and has password -> Go to Step 2 (Password)
          setDetectedUser(data.user);
          setPasswordInput('');
          setAuthStep('password');
        } else {
          // New user or has no password -> Go to Step 3 (Register)
          setDetectedUser(data.user || null);
          setRegName(data.user?.name || '');
          setRegAddress(data.user?.address || '');
          setRegPassword('');
          setAuthStep('register');
        }
      } else {
        triggerHaptic('warning');
        setAuthError(data.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      triggerHaptic('warning');
      setAuthError(err.message || 'Server bilan aloqa xatosi');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Step 2: Login with Password
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      triggerHaptic('warning');
      setAuthError(lang === 'uz' ? 'Parolni kiriting' : 'Введите пароль');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/user/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInput,
          password: passwordInput.trim()
        })
      });
      const data = await res.json();

      if (data.success && data.user) {
        triggerHaptic('notification');
        loginCustomer(data.token, data.user, true);
        setAuthStep('phone');
      } else {
        triggerHaptic('warning');
        setAuthError(data.message || 'Parol noto\'g\'ri!');
      }
    } catch (err) {
      triggerHaptic('warning');
      setAuthError(err.message || 'Server bilan aloqa xatosi');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Step 3: Register / Set Password
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim()) {
      triggerHaptic('warning');
      setAuthError(lang === 'uz' ? 'Ismingizni kiriting' : 'Введите ваше имя');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      triggerHaptic('warning');
      setAuthError(lang === 'uz' ? 'Parol kamida 4 ta belgidan iborat bo\'lishi shart' : 'Пароль должен содержать минимум 4 символа');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/user/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInput,
          name: regName.trim(),
          password: regPassword.trim(),
          address: regAddress.trim()
        })
      });
      const data = await res.json();

      if (data.success && data.user) {
        triggerHaptic('notification');
        loginCustomer(data.token, data.user, true);
        setAuthStep('phone');
      } else {
        triggerHaptic('warning');
        setAuthError(data.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      }
    } catch (err) {
      triggerHaptic('warning');
      setAuthError(err.message || 'Server bilan aloqa xatosi');
    } finally {
      setAuthLoading(false);
    }
  };

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
  // AUTH SCREEN (IF NOT LOGGED IN)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isUserAuthenticated) {
    return (
      <div className="p-4 max-w-sm mx-auto text-left space-y-4 animate-fadeIn pb-24">
        
        {/* STEP 1: PHONE NUMBER INPUT */}
        {authStep === 'phone' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-md space-y-5 animate-scaleUp">
            {/* Top Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-xs">
              <PhoneIcon className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-gray-900 leading-tight">
                {lang === 'uz' ? 'Profilga Kirish' : 'Вход в профиль'}
              </h2>
              <p className="text-xs text-gray-500 font-medium leading-relaxed px-2">
                {lang === 'uz' 
                  ? 'Buyurtmalaringizni kuzatish va tezkor xarid qilish uchun telefon raqamingizni kiriting.' 
                  : 'Введите номер телефона для входа и отслеживания заказов.'}
              </p>
            </div>

            {authError && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 text-center animate-shake">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleCheckPhone} className="space-y-4">
              <div>
                <label className="font-extrabold text-gray-700 text-xs block mb-1.5">
                  {lang === 'uz' ? 'Telefon raqamingiz' : 'Номер телефона'}
                </label>
                <div className="relative">
                  <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={phoneInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length < 6) {
                        setPhoneInput('+998 (');
                        return;
                      }
                      setPhoneInput(formatUzPhone(val));
                    }}
                    placeholder="+998 (90) 123 45 67"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 font-mono font-bold text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{lang === 'uz' ? 'Davom etish' : 'Продолжить'}</span>
                    <ChevronRightIcon className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: PASSWORD ENTRY (EXISTING USER) */}
        {authStep === 'password' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-md space-y-5 animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
              <KeyIcon className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-full border border-blue-100 mb-1">
                👋 {lang === 'uz' ? `Xush kelibsiz, ${detectedUser?.name || 'Mijoz'}!` : `Добро пожаловать, ${detectedUser?.name || 'Клиент'}!`}
              </span>
              <h2 className="text-lg font-black text-gray-900 leading-tight">
                {lang === 'uz' ? 'Maxfiy Parolni Kiriting' : 'Введите пароль'}
              </h2>
              <p className="text-xs text-gray-500 font-mono font-medium">
                {phoneInput}
              </p>
            </div>

            {authError && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 text-center animate-shake">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="font-extrabold text-gray-700 text-xs block mb-1.5">
                  {lang === 'uz' ? 'Maxfiy parol' : 'Пароль'}
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-11 py-3 font-semibold text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                      <span>{lang === 'uz' ? 'Tizimga kirish' : 'Войти'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setAuthStep('phone');
                    setAuthError('');
                  }}
                  className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-bold transition-colors cursor-pointer"
                >
                  {lang === 'uz' ? '← Boshqa raqam kiritish' : '← Ввести другой номер'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: REGISTRATION / PASSWORD SETUP (NEW USER) */}
        {authStep === 'register' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-md space-y-5 animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mx-auto shadow-xs">
              <SparklesIcon className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-gray-900 leading-tight">
                {lang === 'uz' ? 'Ro\'yxatdan O\'tish' : 'Регистрация'}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {phoneInput} {lang === 'uz' ? 'uchun yangi profil' : 'новый профиль'}
              </p>
            </div>

            {authError && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 text-center animate-shake">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="font-extrabold text-gray-700 text-xs block mb-1">
                  {lang === 'uz' ? 'Ism va Familiyangiz *' : 'Имя и фамилия *'}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Masalan: Azizbek Karimov"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="font-extrabold text-gray-700 text-xs block mb-1">
                  {lang === 'uz' ? 'Maxfiy parol o\'rnating *' : 'Придумайте пароль *'}
                </label>
                <div className="relative">
                  <KeyIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Kamida 4 ta belgi"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 font-semibold text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="font-extrabold text-gray-700 text-xs block mb-1">
                  {lang === 'uz' ? 'Yetkazib berish manzili (Ixtiyoriy)' : 'Адрес доставки (необязательно)'}
                </label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Masalan: Toshkent sh., Chilonzor 5"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 stroke-[2.5]" />
                      <span>{lang === 'uz' ? 'Ro\'yxatdan o\'tish va Kirish' : 'Зарегистрироваться'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setAuthStep('phone');
                    setAuthError('');
                  }}
                  className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-bold transition-colors cursor-pointer"
                >
                  {lang === 'uz' ? '← Orqaga' : '← Назад'}
                </button>
              </div>
            </form>
          </div>
        )}
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
              <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-blue-500/20 shrink-0">
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
                  if (val.length < 6) {
                    setEditPhone('+998 (');
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
