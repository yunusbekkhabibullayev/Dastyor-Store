import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  XMarkIcon, 
  PhoneIcon, 
  KeyIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  CheckIcon, 
  UserIcon,
  SparklesIcon,
  ShoppingBagIcon
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

export const CustomerAuthModal = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    loginCustomer, 
    triggerHaptic, 
    siteSettings, 
    lang, 
    setActiveTab 
  } = useStore();

  const [step, setStep] = useState('phone'); // 'phone' | 'password' | 'register'
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [detectedUser, setDetectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset modal state when closed or opened
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('phone');
      setPhone('+998 ');
      setPassword('');
      setName('');
      setError('');
      setDetectedUser(null);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Step 1: Check Phone
  const handleCheckPhone = async (e) => {
    e.preventDefault();
    setError('');

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
      triggerHaptic('warning');
      setError(lang === 'uz' ? 'Telefon raqamingizni to\'liq kiriting' : 'Введите номер полностью');
      return;
    }

    const prefix = phoneDigits.slice(3, 5);
    const allowedPrefixes = ['90', '91', '93', '94', '50', '55', '99', '95', '77', '97', '88', '33', '98', '20'];
    if (!allowedPrefixes.includes(prefix)) {
      triggerHaptic('warning');
      setError(lang === 'uz' ? 'Noto\'g\'ri operator kodi (90, 91, 93, 94, 50, 55, 99, 95, 77, 97, 88, 33, 98, 20)' : 'Неверный код оператора');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();

      if (data.success) {
        triggerHaptic('light');
        if (data.exists && data.user && data.user.hasPassword) {
          // Existing user -> Password step
          setDetectedUser(data.user);
          setPassword('');
          setStep('password');
        } else {
          // New user -> Registration step
          setDetectedUser(data.user || null);
          setName(data.user?.name || '');
          setPassword('');
          setStep('register');
        }
      } else {
        triggerHaptic('warning');
        setError(data.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      triggerHaptic('warning');
      setError(err.message || 'Server bilan aloqa xatosi');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Login with Password
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      triggerHaptic('warning');
      setError(lang === 'uz' ? 'Parolni kiriting' : 'Введите пароль');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: password.trim() })
      });
      const data = await res.json();

      if (data.success && data.user) {
        triggerHaptic('notification');
        loginCustomer(data.token, data.user, true);
        closeAuthModal();
        setActiveTab('profile');
      } else {
        triggerHaptic('warning');
        setError(data.message || 'Parol noto\'g\'ri!');
      }
    } catch (err) {
      triggerHaptic('warning');
      setError(err.message || 'Server bilan aloqa xatosi');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerHaptic('warning');
      setError(lang === 'uz' ? 'Ism va familiyangizni kiriting' : 'Введите имя');
      return;
    }
    if (!password || password.length < 4) {
      triggerHaptic('warning');
      setError(lang === 'uz' ? 'Parol kamida 4 ta belgidan iborat bo\'lsin' : 'Минимум 4 символа для пароля');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: name.trim(),
          password: password.trim()
        })
      });
      const data = await res.json();

      if (data.success && data.user) {
        triggerHaptic('notification');
        loginCustomer(data.token, data.user, true);
        closeAuthModal();
        setActiveTab('profile');
      } else {
        triggerHaptic('warning');
        setError(data.message || 'Ro\'yxatdan o\'tishda xatolik');
      }
    } catch (err) {
      triggerHaptic('warning');
      setError(err.message || 'Server bilan aloqa xatosi');
    } finally {
      setLoading(false);
    }
  };

  const storeBrandName = siteSettings?.name || 'Dastyor Market';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Backdrop */}
      <div 
        onClick={() => {
          triggerHaptic('light');
          closeAuthModal();
        }}
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-fadeIn" 
      />

      {/* Bottom Sheet Drawer */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-[32px] p-6 pb-9 shadow-2xl z-10 animate-slideUp transition-transform max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle Bar */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

        {/* Close Button Top-Right */}
        <button
          onClick={() => {
            triggerHaptic('light');
            closeAuthModal();
          }}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
        >
          <XMarkIcon className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6 pt-1">
          {/* Logo Badge (Uzum style) */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7000ff] border border-purple-100/80 mb-3 shadow-2xs">
            <div className="w-4 h-4 rounded-full bg-[#7000ff] text-white flex items-center justify-center text-[10px] font-black">
              D
            </div>
            <span className="font-extrabold text-xs tracking-tight">DastyorID</span>
          </div>

          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            {step === 'phone' && `${storeBrandName}'ga kirish`}
            {step === 'password' && (lang === 'uz' ? 'Parolni kiriting' : 'Введите пароль')}
            {step === 'register' && (lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Регистрация')}
          </h3>

          {step === 'password' && (
            <p className="text-xs text-purple-600 font-extrabold mt-1">
              👋 {lang === 'uz' ? `Xush kelibsiz, ${detectedUser?.name || 'Mijoz'}!` : `Добро пожаловать, ${detectedUser?.name || 'Клиент'}!`}
            </p>
          )}

          {step === 'register' && (
            <p className="text-xs text-gray-500 font-medium mt-1">
              {phone} {lang === 'uz' ? 'uchun yangi profil' : 'новый профиль'}
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: PHONE FORM (UZUM STYLE) */}
        {step === 'phone' && (
          <form onSubmit={handleCheckPhone} className="space-y-4">
            <div>
              <input
                type="text"
                autoFocus
                value={phone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length < 5) {
                    setPhone('+998 ');
                    return;
                  }
                  setPhone(formatUzPhone(val));
                }}
                placeholder="+998 00 000-00-00"
                className="w-full bg-[#f2f4f7] hover:bg-[#ebedf0] focus:bg-white border-2 border-transparent focus:border-[#7000ff] rounded-2xl px-4 py-3.5 text-base font-bold font-mono text-gray-900 text-center tracking-wider focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#7000ff] hover:bg-[#5e00db] active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{lang === 'uz' ? 'Davom etish' : 'Продолжить'}</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: PASSWORD FORM */}
        {step === 'password' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'uz' ? 'Maxfiy parolingiz' : 'Ваш пароль'}
                className="w-full bg-[#f2f4f7] hover:bg-[#ebedf0] focus:bg-white border-2 border-transparent focus:border-[#7000ff] rounded-2xl px-4 pr-11 py-3.5 text-sm font-semibold text-gray-900 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#7000ff] hover:bg-[#5e00db] active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{lang === 'uz' ? 'Kirish' : 'Войти'}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setStep('phone');
                setError('');
              }}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-bold transition-colors cursor-pointer"
            >
              {lang === 'uz' ? '← Boshqa raqam kiritish' : '← Ввести другой номер'}
            </button>
          </form>
        )}

        {/* STEP 3: REGISTRATION FORM */}
        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-extrabold text-gray-700 block mb-1">
                {lang === 'uz' ? 'Ism va Familiyangiz *' : 'Имя и фамилия *'}
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Sardor Aliyev"
                className="w-full bg-[#f2f4f7] hover:bg-[#ebedf0] focus:bg-white border-2 border-transparent focus:border-[#7000ff] rounded-2xl px-4 py-3 text-xs font-bold text-gray-900 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-700 block mb-1">
                {lang === 'uz' ? 'Maxfiy parol o\'rnating *' : 'Придумайте пароль *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kamida 4 ta belgi"
                  className="w-full bg-[#f2f4f7] hover:bg-[#ebedf0] focus:bg-white border-2 border-transparent focus:border-[#7000ff] rounded-2xl px-4 pr-11 py-3 text-xs font-semibold text-gray-900 focus:outline-none transition-all"
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

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#7000ff] hover:bg-[#5e00db] active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Зарегистрироваться'}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setStep('phone');
                  setError('');
                }}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-bold transition-colors cursor-pointer"
              >
                {lang === 'uz' ? '← Orqaga' : '← Назад'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
