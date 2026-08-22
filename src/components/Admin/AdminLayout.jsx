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
import versionInfo from '../../version.json';

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
    adminAuth,
    siteSettings
  } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const mainRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const permissions = adminAuth?.permissions || ['dashboard', 'orders', 'products', 'categories', 'settings', 'site-settings', 'users', 'employees'];
  const userRole = adminAuth?.role || 'super_admin';

  const roleBadges = {
    developer: { uz: 'Dasturchi', ru: 'Разработчик', en: 'Developer' },
    super_admin: { uz: 'Super Admin', ru: 'Главный Админ', en: 'Super Admin' },
    manager: { uz: 'Menejer', ru: 'Менеджер', en: 'Manager' },
    courier: { uz: 'Kuryer', ru: 'Курьер', en: 'Courier' },
    content_manager: { uz: 'Kontent Menejer', ru: 'Контент-менеджер', en: 'Content Manager' }
  };

  const roleIcons = {
    developer: CommandLineIcon,
    super_admin: ShieldCheckIcon,
    manager: BriefcaseIcon,
    courier: TruckIcon,
    content_manager: PhotoIcon
  };

  const RoleIcon = roleIcons[userRole] || ShieldCheckIcon;
  const currentRoleBadge = roleBadges[userRole]?.[lang] || roleBadges[userRole]?.uz || 'Administrator';

  const translations = {
    uz: {
      adminPanel: 'Admin Panel',
      storeManagement: 'Do\'kon boshqaruvi',
      dashboard: 'Statistika',
      orders: 'Buyurtmalar',
      products: 'Mahsulotlar',
      categories: 'Kategoriyalar',
      users: 'Mijozlar',
      employees: 'Xodimlar',
      settings: 'Bannerlar',
      siteSettings: 'Sozlamalar',
      myProfile: 'Profil ma\'lumotlari',
      logout: 'Chiqish',
      store: 'Saytga qaytish',
      admin: currentRoleBadge
    },
    ru: {
      adminPanel: 'Панель админа',
      storeManagement: 'Управление магазином',
      dashboard: 'Статистика',
      orders: 'Заказы',
      products: 'Товары',
      categories: 'Категории',
      users: 'Клиенты',
      employees: 'Сотрудники',
      settings: 'Баннеры',
      siteSettings: 'Настройки',
      myProfile: 'Мой профиль',
      logout: 'Выйти',
      store: 'Вернуться на сайт',
      admin: currentRoleBadge
    },
    en: {
      adminPanel: 'Admin Panel',
      storeManagement: 'Store Management',
      dashboard: 'Analytics',
      orders: 'Orders',
      products: 'Products',
      categories: 'Categories',
      users: 'Customers',
      employees: 'Employees',
      settings: 'Banners',
      siteSettings: 'Settings',
      myProfile: 'My Profile',
      logout: 'Log out',
      store: 'Return to store',
      admin: currentRoleBadge
    }
  };

  const t = translations[lang] || translations.uz;

  const menuGroups = [
    {
      id: 'main',
      title: { uz: 'Asosiy', ru: 'Основное', en: 'Main' },
      items: [
        { id: 'dashboard', name: t.dashboard, icon: LayoutDashboardIcon },
        { id: 'orders', name: t.orders, icon: ShoppingCartIcon }
      ]
    },
    {
      id: 'catalog',
      title: { uz: 'Katalog & Marketing', ru: 'Каталог & Маркетинг', en: 'Catalog & Marketing' },
      items: [
        { id: 'products', name: t.products, icon: PackageIcon },
        { id: 'categories', name: t.categories, icon: LayersIcon },
        { id: 'settings', name: t.settings, icon: PhotoIcon }
      ]
    },
    {
      id: 'people',
      title: { uz: 'Mijozlar & Jamoa', ru: 'Клиенты & Команда', en: 'Users & Team' },
      items: [
        { id: 'users', name: t.users, icon: UsersIcon },
        { id: 'employees', name: t.employees, icon: UserGroupIcon }
      ]
    },
    {
      id: 'system',
      title: { uz: 'Sozlamalar', ru: 'Настройки', en: 'Settings' },
      items: [
        { id: 'site-settings', name: t.siteSettings, icon: SettingsIcon }
      ]
    }
  ];

  const allMenuItems = menuGroups.flatMap(group => group.items);
  const allowedMenuItems = allMenuItems.filter(item => permissions.includes(item.id));

  // Fallback to first available tab if current is forbidden
  useEffect(() => {
    const parentTab = adminTab.split('-')[0];
    const isAllowed = permissions.includes(adminTab) || permissions.includes(parentTab) || adminTab.startsWith('product') || adminTab.startsWith('category') || adminTab.startsWith('order');
    if (!isAllowed && allowedMenuItems.length > 0) {
      setAdminTab(allowedMenuItems[0].id);
    }
  }, [adminTab, permissions]);

  // Read and sync tab from URL query params or history on mount & popstate
  useEffect(() => {
    const syncTabFromUrl = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlTab = params.get('tab');
        if (urlTab && permissions.includes(urlTab)) {
          setAdminTab(urlTab);
        }
      } catch (e) {}
    };

    syncTabFromUrl();

    const handlePopState = (e) => {
      if (e.state && e.state.tab) {
        setAdminTab(e.state.tab);
      } else {
        syncTabFromUrl();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [permissions]);

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

    // Update browser URL query parameter with history pushState
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('tab', tabId);
      window.history.pushState({ tab: tabId }, '', currentUrl.toString());
    } catch (e) {}
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

        {/* Store Brand / Logo Header in Sidebar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {siteSettings?.logo ? (
              <img 
                src={siteSettings.logo} 
                alt={siteSettings?.name || 'Store'} 
                className="w-9 h-9 rounded-xl object-contain bg-white/10 p-1 shrink-0 border border-slate-700 shadow-xs" 
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20 shrink-0">
                {(siteSettings?.name || 'R').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold text-xs text-white truncate leading-tight tracking-tight">
                {siteSettings?.name || 'Ravshan Rivoj Market'}
              </h2>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mt-0.5">
                {t.storeManagement}
              </span>
            </div>
          </div>
          
          {/* Mobile close sidebar button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Links grouped by functional sections */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {menuGroups.map((group) => {
            const groupAllowedItems = group.items.filter(item => permissions.includes(item.id));
            if (groupAllowedItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block select-none">
                  {group.title[lang] || group.title.uz}
                </span>
                {groupAllowedItems.map((item) => {
                  const Icon = item.icon;
                  const active = adminTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200
                        ${active 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'}
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Clean Minimal Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2 pl-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400">Dastyor {versionInfo?.version || 'v2.0.76'}</span>
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
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            
            {/* Active Tab Icon Badge + Title */}
            {(() => {
              const activeItem = allowedMenuItems.find(item => item.id === adminTab) ||
                allMenuItems.find(item => adminTab.startsWith(item.id.replace('-add', '').replace('-edit', '').replace('-details', ''))) ||
                allowedMenuItems[0];
              const ActiveIcon = activeItem?.icon || LayoutDashboardIcon;

              return (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs shrink-0">
                    <ActiveIcon className="w-4 h-4" />
                  </div>
                  <h1 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">
                    {activeItem?.name || t.adminPanel}
                  </h1>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Saytga o'tish (Return to store) Top Header Button */}
            <button
              onClick={handleBackToStore}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95 text-gray-700 font-extrabold text-xs rounded-xl transition-all border border-gray-200 cursor-pointer shadow-2xs"
              title={lang === 'uz' ? 'Saytga o\'tish' : 'Перейти на сайт'}
            >
              <StoreIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">{lang === 'uz' ? 'Saytga qaytish' : lang === 'ru' ? 'На сайт' : 'Store'}</span>
            </button>

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
                  <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <RoleIcon className="w-3 h-3 text-blue-600 shrink-0" />
                    <span>{currentRoleBadge}</span>
                  </span>
                </div>
              </button>

              {/* Profile Dropdown Popup Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-150 py-1.5 z-50 animate-scaleUp">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-black text-gray-900 truncate">{adminName}</p>
                    <p className="text-[10px] font-extrabold text-blue-600 mt-1 flex items-center gap-1">
                      <RoleIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{currentRoleBadge}</span>
                    </p>
                  </div>

                  <div className="p-1.5 space-y-0.5 text-xs">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors text-left cursor-pointer"
                    >
                      <UserCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{lang === 'uz' ? 'Profil ma\'lumotlari' : 'Профиль'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleBackToStore();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 font-bold transition-colors text-left cursor-pointer"
                    >
                      <StoreIcon className="w-4 h-4 text-gray-500 shrink-0" />
                      <span>{t.store}</span>
                    </button>

                    <div className="my-1 border-t border-gray-100"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left cursor-pointer"
                    >
                      <LogOutIcon className="w-4 h-4 text-rose-500 shrink-0" />
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
