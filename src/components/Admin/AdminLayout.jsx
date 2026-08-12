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
  PhotoIcon
} from '@heroicons/react/24/outline';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminSettings } from './AdminSettings';
import { AdminOrderDetail } from './AdminOrderDetail';
import { AdminCategoryCreate } from './AdminCategoryCreate';
import { AdminCategoryEdit } from './AdminCategoryEdit';
import { AdminCategoryDetail } from './AdminCategoryDetail';
import { AdminProductCreate } from './AdminProductCreate';
import { AdminProductEdit } from './AdminProductEdit';
import { AdminSiteSettings } from './AdminSiteSettings';
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
    showConfirm
  } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [adminTab]);

  const translations = {
    uz: {
      adminPanel: 'Admin Panel',
      dashboard: 'Statistika',
      orders: 'Buyurtmalar',
      products: 'Mahsulotlar',
      categories: 'Kategoriyalar',
      settings: 'Banners',
      logout: 'Chiqish',
      store: 'Saytga qaytish',
      admin: 'Administrator'
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
      admin: 'Администратор'
    }
  };

  const t = translations[lang] || translations.uz;

  const menuItems = [
    { id: 'dashboard', name: t.dashboard, icon: LayoutDashboardIcon },
    { id: 'orders', name: t.orders, icon: ShoppingCartIcon },
    { id: 'products', name: t.products, icon: PackageIcon },
    { id: 'categories', name: t.categories, icon: LayersIcon },
    { id: 'settings', name: t.settings, icon: PhotoIcon },
    { id: 'site-settings', name: lang === 'uz' ? 'Sozlamalar' : 'Настройки', icon: SettingsIcon }
  ];

  const adminName = telegramUser 
    ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim() 
    : 'Yunusbek Khabibullayev';

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
              <span className="text-[9px] text-gray-400 uppercase font-semibold">{t.admin}</span>
            </div>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
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

        {/* Sidebar Footer Links */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          <button
            onClick={handleBackToStore}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <StoreIcon className="w-5 h-5 shrink-0 text-slate-400" />
            <span>{t.store}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide text-rose-450 hover:text-white hover:bg-rose-950/20 transition-colors"
          >
            <LogOutIcon className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{t.logout}</span>
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
              {menuItems.find(item => item.id === adminTab)?.name || t.adminPanel}
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

            {/* Profile badge desktop */}
            <div className="flex items-center gap-2.5 border-l pl-3 border-gray-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-extrabold text-xs">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-800 leading-tight">{adminName}</span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{t.admin}</span>
              </div>
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
    </div>
  );
};
