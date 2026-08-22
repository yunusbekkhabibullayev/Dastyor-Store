import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  PresentationChartBarIcon as LayoutDashboardIcon, 
  ShoppingCartIcon, 
  CubeIcon as PackageIcon, 
  Square3Stack3DIcon as LayersIcon, 
  ArrowRightOnRectangleIcon as LogOutIcon, 
  Bars3Icon as MenuIcon, 
  XMarkIcon, 
  GlobeAltIcon as GlobeIcon, 
  BuildingStorefrontIcon as StoreIcon,
  ShieldCheckIcon,
  Cog6ToothIcon as SettingsIcon,
  AdjustmentsHorizontalIcon as SlidersIcon,
  PhotoIcon,
  UsersIcon,
  UserGroupIcon,
  ChevronDownIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminUsers } from './AdminUsers';
import { AdminEmployees } from './AdminEmployees';
import { AdminSettings } from './AdminSettings';
import { AdminOrderDetail } from './AdminOrderDetail';
import { AdminCategoryCreate } from './AdminCategoryCreate';
import { AdminCategoryEdit } from './AdminCategoryEdit';
import { AdminCategoryDetail } from './AdminCategoryDetail';
import { AdminProductCreate } from './AdminProductCreate';
import { AdminProductEdit } from './AdminProductEdit';
import { AdminSiteSettings } from './AdminSiteSettings';
import { AdminProfileModal } from './AdminProfileModal';
import { LanguageFlag } from '../FlagIcon';
import { AdminProductDetail } from './AdminProductDetail';
import { ConfirmationModal } from '../ConfirmationModal';

export const AdminLayout = () => {
  const { 
    lang, 
    toggleLanguage, 
    isAdminMode, 
    setIsAdminMode, 
    setActiveTab,
    adminTab, 
    setAdminTab, 
    triggerHaptic, 
    telegramUser,
    showConfirm,
    adminAuth
  } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const mainRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const permissions = adminAuth?.permissions || ['dashboard', 'orders', 'products', 'categories', 'settings', 'site-settings', 'users', 'employees'];
  const userRole = adminAuth?.role || 'super_admin';

  const roleBadges = {
    developer: { uz: '💻 Dasturchi', ru: '💻 Разработчик' },
    super_admin: { uz: '👑 Super Admin', ru: '👑 Главный Админ' },
    manager: { uz: '🧑‍💼 Menejer', ru: '🧑‍💼 Менеджер' },
    courier: { uz: '🚚 Kuryer', ru: '🚚 Курьер' },
    content_manager: { uz: '🎨 Kontent Menejer', ru: '🎨 Контент-менеджер' }
  };

  const currentRoleBadge = roleBadges[userRole]?.[lang] || roleBadges[userRole]?.uz || 'Administrator';

  const translations = {
    uz: {
      adminPanel: 'Admin Panel',
      dashboard: 'Statistika',
      orders: 'Buyurtmalar',
      products: 'Mahsulotlar',
      categories: 'Kategoriyalar',
      settings: 'Bannerlar',
      logout: 'Chiqish',
      store: 'Saytga qaytish',
      admin: currentRoleBadge
    },
    ru: {
      adminPanel: 'Панель админа',
      dashboard: 'Статистика',
      orders: 'Заказы',
      products: 'Товары',
      categories: 'Категории',
      settings: 'Баннеры',
      logout: 'Выйти',
      store: 'Вернуться на сайт',
      admin: currentRoleBadge
    }
  };

  const t = translations[lang] || translations.uz;

  const allMenuItems = [
    { id: 'dashboard', name: t.dashboard, icon: LayoutDashboardIcon },
    { id: 'orders', name: t.orders, icon: ShoppingCartIcon },
    { id: 'products', name: t.products, icon: PackageIcon },
    { id: 'categories', name: t.categories, icon: LayersIcon },
    { id: 'users', name: lang === 'uz' ? 'Mijozlar' : 'Клиенты', icon: UsersIcon },
    { id: 'employees', name: lang === 'uz' ? 'Xodimlar' : 'Сотрудники', icon: UserGroupIcon },
    { id: 'settings', name: t.settings, icon: PhotoIcon },
    { id: 'site-settings', name: lang === 'uz' ? 'Sozlamalar' : 'Настройки', icon: SettingsIcon }
  ];

  const allowedMenuItems = allMenuItems.filter(item => permissions.includes(item.id));

  // Fallback to first available tab if current is forbidden
  useEffect(() => {
    const parentTab = adminTab.split('-')[0];
    const isAllowed = permissions.includes(adminTab) || permissions.includes(parentTab) || adminTab.startsWith('product') || adminTab.startsWith('category') || adminTab.startsWith('order');
    if (!isAllowed && allowedMenuItems.length > 0) {
      setAdminTab(allowedMenuItems[0].id);
    }
  }, [adminTab, permissions]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [adminTab]);

  // Click outside listener to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminName = telegramUser 
    ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim() 
    : 'Admin';

  const handleTabChange = (tabId) => {
    triggerHaptic('light');
    setAdminTab(tabId);
    setSidebarOpen(false);
  };

  const handleBackToStore = () => {
    triggerHaptic('medium');
    setActiveTab('catalog'); // Return to Catalog (Home)
    setIsAdminMode(false);
  };

  const handleLogout = () => {
    triggerHaptic('warning');
    showConfirm(
      lang === 'uz' ? 'Tizimdan chiqish' : 'Выйти из системы',
      lang === 'uz' ? 'Haqiqatan ham tizimdan chiqmoqchimisiz?' : 'Вы действительно хотите выйти из системы?',
      () => {
        triggerHaptic('notification');
        localStorage.removeItem('qlay_admin_token');
        sessionStorage.removeItem('qlay_admin_token');
        sessionStorage.removeItem('qlay_admin_verified');
        setActiveTab('catalog'); // Return to Catalog (Home)
        setIsAdminMode(false);
      }
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none text-xs sm:text-sm text-gray-700">
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-56 bg-slate-900 border-r border-slate-800 text-white transform transition-transform duration-300 md:translate-x-0 md:static shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* User Badge Mobile Header */}
        <div className="md:hidden p-4 border-b border-slate-800 bg-slate-950/20 text-left flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-xs truncate max-w-36">{adminName}</h4>
              <span className="text-[9px] text-blue-400 font-bold">{currentRoleBadge}</span>
            </div>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowedMenuItems.map((item) => {
            const Icon = item.icon;
            const active = adminTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200
                  ${active 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Clean Minimal Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2 pl-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400">Dastyor v2.0</span>
          </div>
          <button
            onClick={() => {
              setSidebarOpen(false);
              setProfileModalOpen(true);
            }}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Profil"
          >
            <UserCircleIcon className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Area Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Top Navbar Header */}
        <header className="h-14 border-b border-gray-150 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            
            <h1 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">
              {allowedMenuItems.find(item => item.id === adminTab)?.name || t.adminPanel}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Lang Switch (Boxless) */}
            <button
              onClick={toggleLanguage}
              className="p-1 hover:opacity-80 active:scale-95 transition-opacity cursor-pointer select-none flex items-center justify-center"
              title={lang === 'uz' ? 'O\'zbekcha' : lang === 'ru' ? 'Русский' : 'English'}
            >
              <LanguageFlag lang={lang} className="w-6 h-4 object-cover shadow-2xs" />
            </button>

            {/* Profile Dropdown Trigger */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setProfileDropdownOpen(prev => !prev);
                }}
                className="flex items-center gap-2.5 border-l pl-3 border-gray-100 hover:bg-gray-50/90 py-1 px-2 rounded-xl transition-all cursor-pointer select-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-800 leading-tight flex items-center gap-1">
                    {adminName}
                    <ChevronDownIcon className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">{currentRoleBadge}</span>
                </div>
              </button>

              {/* Profile Dropdown Popup Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-150 py-1.5 z-50 animate-scaleUp">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-black text-gray-900 truncate">{adminName}</p>
                    <p className="text-[10px] font-bold text-blue-600 mt-0.5">{currentRoleBadge}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5 text-xs">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors text-left"
                    >
                      <UserCircleIcon className="w-4 h-4 text-blue-600" />
                      <span>{lang === 'uz' ? 'Profil ma\'lumotlari' : 'Профиль'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleBackToStore();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 font-bold transition-colors text-left"
                    >
                      <StoreIcon className="w-4 h-4 text-gray-500" />
                      <span>{t.store}</span>
                    </button>

                    <div className="my-1 border-t border-gray-100"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left"
                    >
                      <LogOutIcon className="w-4 h-4 text-rose-500" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content View Routing */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          <div className="max-w-6xl mx-auto pb-16">
            {adminTab === 'dashboard' && <AdminDashboard />}
            {adminTab === 'orders' && <AdminOrders />}
            {adminTab === 'products' && <AdminProducts />}
            {adminTab === 'categories' && <AdminCategories />}
            {adminTab === 'users' && <AdminUsers />}
            {adminTab === 'employees' && <AdminEmployees />}
            {adminTab === 'settings' && <AdminSettings />}
            {adminTab === 'site-settings' && <AdminSiteSettings />}
            {adminTab === 'order-details' && <AdminOrderDetail />}
            {adminTab === 'category-add' && <AdminCategoryCreate />}
            {adminTab === 'category-edit' && <AdminCategoryEdit />}
            {adminTab === 'category-details' && <AdminCategoryDetail />}
            {adminTab === 'product-add' && <AdminProductCreate />}
            {adminTab === 'product-edit' && <AdminProductEdit />}
            {adminTab === 'product-details' && <AdminProductDetail />}
          </div>
        </main>
      </div>
      <ConfirmationModal />
      <AdminProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
        onBackToStore={handleBackToStore} 
        onLogout={handleLogout} 
      />
    </div>
  );
};
