import React, { useState, useEffect, useRef } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { XMarkIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Header } from './components/Header';
import { AdminLayout } from './components/Admin/AdminLayout';
import { BannerSlider } from './components/BannerSlider';
import { CategoryTabs } from './components/CategoryTabs';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { FavoritesView } from './components/FavoritesView';
import { ProfileView } from './components/ProfileView';
import { SearchView } from './components/SearchView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { BottomTabBar } from './components/BottomTabBar';
import { OrderSuccessView } from './components/OrderSuccessView';

// Full-screen secure Admin Password Login Screen for browser access
const AdminLoginScreen = ({ onLoginSuccess, onCancel }) => {
  const { lang, triggerHaptic } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Field validation flags
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);

    // Validation checks
    if (!email.trim() || !password.trim()) {
      triggerHaptic('warning');
      setError(lang === 'uz' ? 'Iltimos, barcha maydonlarni to\'ldiring!' : 'Пожалуйста, заполните все поля!');
      return;
    }

    if (!isEmailValid) {
      triggerHaptic('warning');
      setError(lang === 'uz' ? 'Elektron pochta formati noto\'g\'ri!' : 'Неверный формат электронной почты!');
      return;
    }

    if (!isPasswordValid) {
      triggerHaptic('warning');
      setError(lang === 'uz' ? 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!' : 'Пароль должен состоять минимум из 6 символов!');
      return;
    }

    triggerHaptic('medium');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        triggerHaptic('notification');
        onLoginSuccess(data.token, rememberMe);
      } else {
        triggerHaptic('warning');
        setError(data.message || (lang === 'uz' ? 'Email yoki parol noto\'g\'ri!' : 'Неверный email или пароль!'));
      }
    } catch {
      triggerHaptic('warning');
      setError(lang === 'uz' ? 'Ulanish xatoligi yuz berdi.' : 'Ошибка соединения.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f8fafc] via-[#eff6ff] to-[#f5f3ff] flex flex-col justify-center items-center px-4 font-sans relative">
      
      {/* Mesh gradient decorative bubbles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-sm bg-white/70 backdrop-blur-md p-8 rounded-[32px] border border-white/60 shadow-[0_20px_50px_rgba(59,130,246,0.05)] flex flex-col text-center transition-all">
        
        {/* Header Icon badge */}
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-sm shrink-0">
          <LockClosedIcon className="w-6 h-6 text-blue-600 animate-pulse" />
        </div>
        
        <h2 className="text-[20px] font-black text-gray-900 tracking-tight mb-1">
          {lang === 'uz' ? 'Admin panelga kirish' : 'Вход в админ-панель'}
        </h2>
        <p className="text-[10px] text-blue-600 font-extrabold tracking-wider uppercase mb-7">
          Qlay Store Manager
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Email input field */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-600 tracking-wider block mb-1.5 pl-1">
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onBlur={() => setEmailTouched(true)}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@qlay.uz"
                className={`w-full bg-gray-50/50 border pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                  emailTouched && !isEmailValid
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/30' 
                    : 'border-gray-200/80 focus:border-blue-500 focus:ring-blue-500/10 focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* Password input field */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-600 tracking-wider block mb-1.5 pl-1">
              {lang === 'uz' ? 'Maxfiy parol' : 'Секретный пароль'}
            </label>
            <div className="relative">
              <LockClosedIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onBlur={() => setPasswordTouched(true)}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className={`w-full bg-gray-50/50 border pl-10 pr-12 py-3 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                  passwordTouched && !isPasswordValid
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/30'
                    : 'border-gray-200/80 focus:border-blue-500 focus:ring-blue-500/10 focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setShowPassword(!showPassword); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-650 transition-colors absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5 shrink-0" /> : <EyeIcon className="w-5 h-5 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password row */}
          <div className="flex items-center justify-between pl-1 pt-0.5 select-none text-[11px] font-semibold text-gray-500">
            <label className="flex items-center gap-2 cursor-pointer active:scale-98 transition-transform">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => { triggerHaptic('light'); setRememberMe(e.target.checked); }}
                className="w-4 h-4 text-blue-600 bg-gray-55/30 rounded-md border-gray-200 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none cursor-pointer"
              />
              <span>{lang === 'uz' ? 'Eslab qolish' : 'Запомнить'}</span>
            </label>
          </div>

          {/* Error warning badge */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] font-bold text-rose-600 text-center animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* Submit button with loader */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-3.5"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{lang === 'uz' ? 'Kirilmoqda...' : 'Вход...'}</span>
              </div>
            ) : (
              <span>{lang === 'uz' ? 'Kirish' : 'Войти'}</span>
            )}
          </button>
        </form>
      </div>

      {/* Return to store button */}
      <button
        onClick={onCancel}
        className="mt-6 text-gray-500 hover:text-gray-900 text-xs font-bold transition-colors active:scale-95 py-2 px-4 rounded-xl hover:bg-gray-100"
      >
        {lang === 'uz' ? 'Do\'konga qaytish' : 'Вернуться в магазин'}
      </button>
    </div>
  );
};

const MainLayout = () => {
  const { activeTab, selectedCategory, setSelectedCategory, lang, isSearchOpen, setIsSearchOpen, isOrderSuccess, setIsOrderSuccess, botUsername, isAdminMode, setIsAdminMode, products, categories } = useStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [expandedCats, setExpandedCats] = useState({});

  const isClickScrolling = useRef(false);

  // Custom smooth scroll helper with organic cubic easing and finish callback
  const animateScrollTo = (targetPosition, duration = 600, callback) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const run = easeInOutCubic(progress);
      window.scrollTo(0, startPosition + distance * run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else if (callback) {
        callback();
      }
    };

    requestAnimationFrame(animation);
  };

  // Smooth scroll to category sections when tab is clicked
  useEffect(() => {
    if (activeTab !== 'catalog') return;
    if (isClickScrolling.current) return; // Ignore if triggered by manual scroll updates

    isClickScrolling.current = true;
    if (selectedCategory === 'all') {
      animateScrollTo(0, 500, () => {
        isClickScrolling.current = false;
      });
    } else {
      const element = document.getElementById(`category-sec-${selectedCategory}`);
      if (element) {
        const yOffset = -115; // height offset of sticky header + category tabs
        const targetY = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        animateScrollTo(targetY, 600, () => {
          isClickScrolling.current = false;
        });
      } else {
        isClickScrolling.current = false;
      }
    }
  }, [selectedCategory, activeTab]);

  // Scroll listener to update highlighted category tab during manual scrolling
  useEffect(() => {
    if (activeTab !== 'catalog') return;

    let debounceTimeout = null;

    const handleScroll = () => {
      // If we are currently click-scrolling, don't interfere
      if (isClickScrolling.current) return;

      const scrollPosition = window.scrollY;

      // Find active category section
      let activeSecId = 'all';
      if (scrollPosition >= 120) {
        for (const cat of categories) {
          if (cat.id === 'all') continue;
          const element = document.getElementById(`category-sec-${cat.id}`);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 125 && rect.bottom > 125) {
              activeSecId = cat.id;
              break;
            }
          }
        }
      }

      // Update DOM classes instantly (smooth, no layout thrashing, 60fps)
      const buttons = document.querySelectorAll('.category-tab-btn');
      buttons.forEach(btn => {
        const catId = btn.getAttribute('data-category-id');
        if (catId === activeSecId) {
          btn.className = 'category-tab-btn px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 bg-[#3b82f6] text-white border border-transparent';
          
          // Center tab in the sticky scroll container
          const container = btn.parentElement;
          if (container) {
            const scrollLeft = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
          }
        } else {
          btn.className = 'category-tab-btn px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50';
        }
      });

      // Debounce React state update (sync to context only after scrolling stops)
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        if (activeSecId !== selectedCategory) {
          isClickScrolling.current = true;
          setSelectedCategory(activeSecId);
          setTimeout(() => {
            isClickScrolling.current = false;
          }, 50);
        }
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [activeTab, selectedCategory, setSelectedCategory]);

  // Reset order success state when navigating away from catalog
  useEffect(() => {
    if (activeTab !== 'catalog') {
      setIsOrderSuccess(false);
    }
  }, [activeTab, setIsOrderSuccess]);

  // Get current category name
  const currentCategory = categories.find(c => c.id === selectedCategory);
  const categoryName = currentCategory ? currentCategory.name[lang] : '';

  // Check if we are inside Telegram WebApp
  const isInsideTelegram = !!(window.Telegram?.WebApp?.initData);
  const showTelegramRedirectBanner = showBanner && !isInsideTelegram && botUsername;

  // Get current product ID from search params
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product') || urlParams.get('productId') || '';
  const botLink = productId 
    ? `https://t.me/${botUsername}?start=${productId}` 
    : `https://t.me/${botUsername}`;

  // Parse admin mode on mount if ?admin=true is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdminMode(true);
    }
  }, [setIsAdminMode]);

  // Session storage update helper
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick(t => t + 1);

  if (isAdminMode) {
    const isBrowserAdminVerified = sessionStorage.getItem('qlay_admin_verified') === 'true' ||
                                   !!localStorage.getItem('qlay_admin_token') ||
                                   !!sessionStorage.getItem('qlay_admin_token');

    if (isBrowserAdminVerified) {
      return <AdminLayout />;
    } else {
      return (
        <AdminLoginScreen 
          onLoginSuccess={(token, remember) => {
            sessionStorage.setItem('qlay_admin_verified', 'true');
            if (remember) {
              localStorage.setItem('qlay_admin_token', token);
            } else {
              sessionStorage.setItem('qlay_admin_token', token);
            }
            forceUpdate();
          }} 
          onCancel={() => setIsAdminMode(false)} 
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto relative">
      {showTelegramRedirectBanner && (
        <div className="bg-gradient-to-r from-[#229ED9] to-[#0088cc] text-white px-4 py-3 text-xs flex items-center justify-between shadow-md relative shrink-0">
          <div className="flex-1 pr-6 text-left">
            <span className="font-extrabold block text-[13px] tracking-wide mb-0.5">
              {lang === 'uz' ? '🛍️ Telegramda ochish' : lang === 'ru' ? '🛍️ Открыть в Telegram' : '🛍️ Open in Telegram'}
            </span>
            <span className="opacity-95 font-medium block leading-snug">
              {lang === 'uz' 
                ? 'Mahsulotlarni oson buyurtma qilish uchun botimizga o\'ting!' 
                : lang === 'ru' 
                ? 'Для удобного заказа товаров перейдите в наш бот!' 
                : 'For convenient ordering, open our shop in Telegram!'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={botLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#0088cc] px-3.5 py-1.5 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all text-[11px] whitespace-nowrap shadow-sm"
            >
              {lang === 'uz' ? 'Ochish' : lang === 'ru' ? 'Открыть' : 'Open'}
            </a>
            <button 
              onClick={() => setShowBanner(false)}
              className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {!isCheckoutOpen && !isOrderSuccess && <Header onSearchOpen={() => setIsSearchOpen(true)} />}

      <main className="flex-1">
        {isOrderSuccess ? (
          <OrderSuccessView />
        ) : (
          <>
            {activeTab === 'catalog' && (
              <div className="pb-28">
                <BannerSlider />
                <CategoryTabs />

                {/* Grouped Products Feed */}
                <div className="space-y-6 mt-4">
                  {categories.filter(c => c.id !== 'all' && (c.is_active === 1 || c.is_active === true)).map((cat) => {
                    const catProducts = products.filter(p => p.categoryId === cat.id);
                    if (catProducts.length === 0) return null;

                    const isExpanded = expandedCats[cat.id];
                    const displayedProducts = isExpanded ? catProducts : catProducts.slice(0, 6);

                    return (
                      <div
                        key={cat.id}
                        id={`category-sec-${cat.id}`}
                        className="scroll-mt-32"
                      >
                        {/* Category Title */}
                        <div className="px-4 pt-3 pb-2">
                          <h2 className="text-[17px] font-bold text-gray-900">
                            {cat.name[lang]}
                          </h2>
                        </div>

                        {/* Products Grid */}
                        <div className="px-4">
                          <div className="grid grid-cols-2 gap-2.5">
                            {displayedProducts.map((product) => (
                              <ProductCard key={product.id} product={product} />
                            ))}
                          </div>

                          {catProducts.length > 6 && !isExpanded && (
                            <button
                              onClick={() => setExpandedCats(prev => ({ ...prev, [cat.id]: true }))}
                              className="w-full mt-3 py-2.5 bg-white border border-gray-150 rounded-2xl text-[11px] font-extrabold text-blue-600 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <span>
                                {lang === 'uz' 
                                  ? `Ko'proq ko'rish (+${catProducts.length - 6})` 
                                  : `Показать больше (+${catProducts.length - 6})`}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'cart' && (
              !isCheckoutOpen ? (
                <CartDrawer onProceedCheckout={() => setIsCheckoutOpen(true)} />
              ) : (
                <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
              )
            )}

            {activeTab === 'favorites' && <FavoritesView />}
            {activeTab === 'profile' && <ProfileView />}
          </>
        )}
      </main>

      <ProductDetailModal />
      <ConfirmationModal />

      {/* Full-screen Search View */}
      {isSearchOpen && (
        <SearchView onClose={() => setIsSearchOpen(false)} />
      )}

      <BottomTabBar />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}

