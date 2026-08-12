import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, PRODUCTS as staticProducts, CATEGORIES as staticCategories, BANNERS as staticBanners } from '../data/mockData';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('qlay_lang') || 'uz');
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'cart', 'favorites', 'profile'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('qlay_cart')) || [];
    } catch {
      return [];
    }
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('qlay_favorites')) || [];
    } catch {
      return [];
    }
  });
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('qlay_orders');
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  });
  const [telegramUser, setTelegramUser] = useState(null);
  const [botUsername, setBotUsername] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard', 'orders', 'products', 'categories'
  const [selectedAdminOrder, setSelectedAdminOrder] = useState(null);
  const [selectedAdminCategory, setSelectedAdminCategory] = useState(null);
  const [selectedAdminProduct, setSelectedAdminProduct] = useState(null);
  const [products, setProducts] = useState(staticProducts);
  const [categories, setCategories] = useState(staticCategories);
  const [banners, setBanners] = useState(staticBanners);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [profileSubView, setProfileSubView] = useState(null); // null, 'history'
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Ha',
    cancelText: 'Bekor qilish'
  });
  
  const [profileUser, setProfileUser] = useState(() => {
    try {
      const saved = localStorage.getItem('qlay_profile_user');
      if (saved) {
        localStorage.removeItem('qlay_profile_user'); // Clean up old generic cache
      }
    } catch (e) {}

    return {
      name: '',
      phone: '',
      address: ''
    };
  });

  // Telegram SDK setup & Haptic feedback helper
  useEffect(() => {
    try {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes();
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        }
      }
    } catch (e) {
      console.warn('Telegram SDK initialization:', e);
    }
  }, []);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.products)) {
          setProducts(prev => {
            if (prev.length === data.products.length && prev[0]?.id === data.products[0]?.id && prev[prev.length-1]?.price === data.products[data.products.length-1]?.price) return prev;
            return data.products;
          });
        }
      })
      .catch(err => console.warn('Failed to fetch live products:', err));
  };

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.categories)) {
          setCategories(prev => {
            if (prev.length === data.categories.length && prev[0]?.id === data.categories[0]?.id) return prev;
            return data.categories;
          });
        }
      })
      .catch(err => console.warn('Failed to fetch live categories:', err));
  };

  const fetchBanners = () => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.banners)) {
          setBanners(prev => {
            if (prev.length === data.banners.length && prev[0]?.id === data.banners[0]?.id) return prev;
            return data.banners;
          });
        }
      })
      .catch(err => console.warn('Failed to fetch live banners:', err));
  };

  const fetchUserOrders = () => {
    const userId = telegramUser ? telegramUser.id : 1165441564;
    fetch(`/api/user/${userId}/orders`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.orders)) {
          const formattedOrders = data.orders.map(o => ({
            id: o.id,
            date: o.created_at,
            total: o.total_amount,
            status: o.status,
            itemsCount: o.items ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0,
            items: (o.items || []).map(i => ({
              id: i.product_id || i.id,
              title: i.title || { uz: i.title_uz || 'Mahsulot', ru: i.title_ru || 'Товар', en: i.title_en || 'Product' },
              price: i.price,
              quantity: i.quantity,
              image: i.image
            })),
            address: o.address,
            phone: o.phone,
            paymentMethod: o.payment_method
          }));
          setOrders(formattedOrders);
          localStorage.setItem('qlay_orders', JSON.stringify(formattedOrders));
        }
      })
      .catch(err => console.warn('Failed to fetch user orders:', err));
  };

  const [siteSettings, setSiteSettings] = useState({
    name: 'Ravshan Rivoj Market',
    description: 'Oziq-ovqat mahsulotlari do\'koni',
    logo: '',
    phone: '+998 90 123 45 67',
    address: 'Toshkent sh.',
    working_hours: '09:00 - 22:00',
    telegram_channel: '',
    instagram: '',
    bot_token: '',
    bot_username: 'ravshan_rivoj_bot',
    delivery_price: 0,
    is_active: 1
  });

  const fetchSiteSettings = () => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.settings) {
          setSiteSettings(prev => {
            if (JSON.stringify(prev) === JSON.stringify(data.settings)) return prev;
            return data.settings;
          });
        }
      })
      .catch(err => console.warn('Failed to fetch site settings:', err));
  };

  // Fetch bot info, products, categories, banners, site settings, and user orders on mount
  useEffect(() => {
    fetch('/api/bot-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.username) {
          setBotUsername(data.username);
        }
      })
      .catch(err => console.warn('Failed to fetch bot info:', err));

    fetchProducts();
    fetchCategories();
    fetchBanners();
    fetchSiteSettings();
    fetchUserOrders();
  }, [telegramUser]);

  // Sync data smoothly on tab switches without aggressive intervals
  useEffect(() => {
    fetchProducts();
    if (activeTab === 'profile') {
      fetchUserOrders();
    }
  }, [activeTab]);

  // Sync user profile across devices via backend API
  useEffect(() => {
    if (telegramUser && telegramUser.id) {
      const cacheKey = `qlay_profile_user_${telegramUser.id}`;
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        try {
          setProfileUser(JSON.parse(saved));
        } catch (e) {}
      } else {
        setProfileUser({
          name: telegramUser.first_name || '',
          phone: '',
          address: ''
        });
      }

      fetch('/api/user/profile?userId=' + telegramUser.id)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            if (data.profile && (data.profile.name || data.profile.phone)) {
              setProfileUser(data.profile);
              localStorage.setItem(cacheKey, JSON.stringify(data.profile));
            } else {
              // User has no saved profile on the backend, pre-fill with Telegram name
              setProfileUser({
                name: telegramUser.first_name || '',
                phone: '',
                address: ''
              });
            }
          }
        })
        .catch(err => console.warn('Failed to sync profile from API:', err));
    } else {
      // Clear profile when not in Telegram WebApp or telegramUser is null
      setProfileUser({
        name: '',
        phone: '',
        address: ''
      });
    }
  }, [telegramUser?.id]);

  // Parse product from URL query params or Telegram start parameters
  useEffect(() => {
    try {
      let productId = null;
      
      // 1. Try to read from Telegram Start Parameter
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        if (tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
          productId = tg.initDataUnsafe.start_param;
        }
      }
      
      // 2. Try to read from URL Search Params
      if (!productId) {
        const urlParams = new URLSearchParams(window.location.search);
        productId = urlParams.get('product') || urlParams.get('productId');
      }

      if (productId && products) {
        const prod = products.find(p => p.id === productId);
        if (prod) {
          setSelectedProduct(prod);
        }
      }
    } catch (e) {
      console.warn('URL parsing for product failed:', e);
    }
  }, [telegramUser]);

  // Save profileUser to localStorage
  useEffect(() => {
    if (profileUser && (profileUser.name || profileUser.phone)) {
      if (telegramUser && telegramUser.id) {
        localStorage.setItem(`qlay_profile_user_${telegramUser.id}`, JSON.stringify(profileUser));
      }
    }
  }, [profileUser, telegramUser?.id]);

  // Save cart & favorites to localStorage
  useEffect(() => {
    localStorage.setItem('qlay_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('qlay_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('qlay_orders', JSON.stringify(orders));
  }, [orders]);

  // Close search when tab changes
  useEffect(() => {
    setIsSearchOpen(false);
  }, [activeTab]);

  // Reset profile sub-view when tab changes
  useEffect(() => {
    setProfileSubView(null);
  }, [activeTab]);

  const triggerHaptic = (type = 'light') => {
    try {
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    } catch (e) {}
  };

  const showConfirm = (arg1, arg2, arg3, arg4, arg5) => {
    let title = '';
    let onConfirm = null;
    let onCancel = null;
    let confirmText = lang === 'uz' ? 'Ha' : 'Да';
    let cancelText = lang === 'uz' ? 'Bekor qilish' : 'Отмена';

    if (typeof arg1 === 'object' && arg1 !== null) {
      title = arg1.title || '';
      onConfirm = arg1.onConfirm || null;
      onCancel = arg1.onCancel || null;
      if (arg1.confirmText) confirmText = arg1.confirmText;
      if (arg1.cancelText) cancelText = arg1.cancelText;
    } else if (typeof arg2 === 'function') {
      // Called as: showConfirm(title, onConfirmFn, onCancelFn)
      title = arg1;
      onConfirm = arg2;
      onCancel = typeof arg3 === 'function' ? arg3 : null;
      if (typeof arg3 === 'string') confirmText = arg3;
      if (typeof arg4 === 'string') cancelText = arg4;
    } else if (typeof arg3 === 'function') {
      // Called as: showConfirm(title, messageText, onConfirmFn, onCancelFn)
      title = typeof arg2 === 'string' && arg2 ? `${arg1}` : arg1;
      onConfirm = arg3;
      onCancel = typeof arg4 === 'function' ? arg4 : null;
      if (typeof arg4 === 'string') confirmText = arg4;
      if (typeof arg5 === 'string') cancelText = arg5;
    } else {
      title = arg1 || '';
      onConfirm = typeof arg2 === 'function' ? arg2 : null;
      onCancel = typeof arg3 === 'function' ? arg3 : null;
    }

    setConfirmModal({
      isOpen: true,
      title,
      onConfirm,
      onCancel,
      confirmText,
      cancelText
    });
  };

  const hideConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const toggleLanguage = () => {
    triggerHaptic('light');
    const nextLang = lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz';
    setLang(nextLang);
    localStorage.setItem('qlay_lang', nextLang);
  };

  const addToCart = (product, quantity = 1) => {
    triggerHaptic('medium');
    const cartId = product.cartId || product.id;
    const maxStock = (product.stock !== undefined && product.stock !== null) ? product.stock : 999;
    setCart(prev => {
      const existingIndex = prev.findIndex(item => (item.cartId || item.id) === cartId);
      const currentQty = existingIndex > -1 ? prev[existingIndex].quantity : 0;
      if (currentQty + quantity > maxStock) {
        alert(lang === 'uz' 
          ? `Kechirasiz, omborda faqat ${maxStock} ta mahsulot bor!` 
          : `Извините, в наличии только ${maxStock} шт.!`
        );
        return prev;
      }
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateCartQuantity = (cartId, delta) => {
    triggerHaptic('light');
    setCart(prev => {
      return prev.map(item => {
        const itemCartId = item.cartId || item.id;
        if (itemCartId === cartId) {
          const maxStock = (item.stock !== undefined && item.stock !== null) ? item.stock : 999;
          const newQty = item.quantity + delta;
          if (delta > 0 && newQty > maxStock) {
            alert(lang === 'uz' 
              ? `Kechirasiz, omborda faqat ${maxStock} ta mahsulot bor!` 
              : `Извините, в наличии только ${maxStock} шт.!`
            );
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (cartId) => {
    triggerHaptic('medium');
    setCart(prev => prev.filter(item => (item.cartId || item.id) !== cartId));
  };

  const clearCart = () => {
    triggerHaptic('heavy');
    setCart([]);
    setAppliedPromo(null);
  };

  const toggleFavorite = (productId) => {
    triggerHaptic('light');
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const applyPromoCode = (code) => {
    triggerHaptic('medium');
    const cleanCode = code.trim().toUpperCase();

    // 1. Check Global Promocodes created in Admin Panel
    if (promocodes && promocodes.length > 0) {
      const found = promocodes.find(p => p.code?.toUpperCase() === cleanCode && (p.is_active === 1 || p.is_active === true));
      if (found) {
        setAppliedPromo({ code: found.code, discountPercent: found.discount_percent || 10 });
        return { success: true };
      }
    }

    // 2. Check Product-Specific Promocodes assigned on products in cart or products list
    if (products && products.length > 0) {
      for (const prod of products) {
        let attrs = prod.attributes;
        if (typeof attrs === 'string') {
          try { attrs = JSON.parse(attrs); } catch (e) {}
        }
        if (attrs && attrs.promo_code && attrs.promo_code.toUpperCase() === cleanCode) {
          const discountPercent = parseInt(attrs.discount_percent, 10) || 10;
          setAppliedPromo({ code: attrs.promo_code, discountPercent });
          return { success: true, message: `Promokod qo'llandi! (${discountPercent}% chegirma)` };
        }
      }
    }

    // 3. Fallback default code
    if (cleanCode === 'QLAY2026') {
      setAppliedPromo({ code: 'QLAY2026', discountPercent: 15 });
      return { success: true };
    }

    return { success: false };
  };

  const placeOrder = async (orderDetails) => {
    triggerHaptic('heavy');
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      total: orderDetails.total,
      status: 'processing',
      itemsCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      items: [...cart],
      address: orderDetails.address,
      phone: orderDetails.phone,
      paymentMethod: orderDetails.paymentMethod
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: newOrder.id,
          cart: newOrder.items,
          address: newOrder.address,
          phone: newOrder.phone,
          paymentMethod: newOrder.paymentMethod,
          user: telegramUser || { id: 1165441564, first_name: 'Yunusbek' }, // Fallback for testing
          total: newOrder.total
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => [newOrder, ...prev]);
        clearCart();
        setAppliedPromo(null);
        fetchProducts();
        fetchUserOrders();
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Checkout API Error:', err);
      return { 
        success: false, 
        message: lang === 'uz' 
          ? 'Server bilan bog\'lanishda xatolik yuz berdi.' 
          : 'Ошибка связи с сервером.' 
      };
    }
  };

  const clearOrders = () => {
    triggerHaptic('heavy');
    setOrders([]);
  };

  const deleteOrder = (orderId) => {
    triggerHaptic('medium');
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const updateProfileUser = async (newProfile) => {
    setProfileUser(newProfile);
    
    // Sync to server database if telegram user is present
    if (telegramUser && telegramUser.id) {
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: telegramUser.id,
            name: newProfile.name,
            phone: newProfile.phone,
            address: newProfile.address
          })
        });
      } catch (e) {
        console.warn('Failed to save profile to server:', e.message);
      }
    }
  };

  const logoutUser = () => {
    triggerHaptic('heavy');
    localStorage.removeItem('qlay_cart');
    localStorage.removeItem('qlay_favorites');
    localStorage.removeItem('qlay_orders');

    setCart([]);
    setFavorites([]);
    setOrders([]);
    setProfileUser({
      name: '',
      phone: '',
      address: ''
    });
    setActiveTab('catalog');
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.uz;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const promoDiscount = appliedPromo ? (cartSubtotal * appliedPromo.discountPercent) / 100 : 0;
  const cartTotal = Math.max(0, cartSubtotal - promoDiscount);

  const getAdminHeaders = () => {
    const headers = {};
    if (telegramUser && telegramUser.id) {
      headers['X-Admin-Id'] = telegramUser.id.toString();
    }
    const token = localStorage.getItem('qlay_admin_token') || sessionStorage.getItem('qlay_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  return (
    <StoreContext.Provider value={{
      getAdminHeaders,
      lang,
      toggleLanguage,
      t,
      activeTab,
      setActiveTab,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      favorites,
      toggleFavorite,
      appliedPromo,
      applyPromoCode,
      selectedProduct,
      setSelectedProduct,
      isSearchOpen,
      setIsSearchOpen,
      orders,
      placeOrder,
      telegramUser,
      botUsername,
      isAdminMode,
      setIsAdminMode,
      adminTab,
      setAdminTab,
      selectedAdminOrder,
      setSelectedAdminOrder,
      selectedAdminCategory,
      setSelectedAdminCategory,
      selectedAdminProduct,
      setSelectedAdminProduct,
      products,
      setProducts,
      fetchProducts,
      categories,
      setCategories,
      fetchCategories,
      banners,
      setBanners,
      fetchBanners,
      siteSettings,
      setSiteSettings,
      fetchSiteSettings,
      triggerHaptic,
      totalCartCount,
      cartSubtotal,
      promoDiscount,
      cartTotal,
      profileUser,
      setProfileUser,
      updateProfileUser,
      logoutUser,
      isOrderSuccess,
      setIsOrderSuccess,
      clearOrders,
      deleteOrder,
      profileSubView,
      setProfileSubView,
      confirmModal,
      showConfirm,
      hideConfirm
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
