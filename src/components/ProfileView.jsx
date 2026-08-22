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
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { ProductImage } from './ProductImage';

// Authentic SVG Icons
const TelegramIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.87 7.97-3.44 3.79-1.61 4.58-1.89 5.09-1.9.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.21-.04.37z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

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
  return formatted.trim();
};

const cleanSocialHandle = (urlOrHandle) => {
  if (!urlOrHandle) return '';
  let str = String(urlOrHandle).trim();
  str = str.replace(/^https?:\/\/(www\.)?(t\.me|instagram\.com)\//i, '');
  str = str.replace(/^\/+|\/+$/g, '');
  if (!str.startsWith('@')) {
    str = '@' + str;
  }
  return str;
};

export const ProfileView = () => {
  const {
    lang, toggleLanguage, t, orders, triggerHaptic, profileUser, setProfileUser, updateProfileUser, 
    customerToken, customerUser, logoutUser, clearOrders, deleteOrder, profileSubView, setProfileSubView, 
    showConfirm, telegramUser, siteSettings, formatQuantity, adminAuth,
    isCustomerLoggedIn, openAuthModal, setActiveTab, favorites
  } = useStore();

  // Logged-in Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profileUser?.name || '');
  const [editPhone, setEditPhone] = useState(profileUser?.phone ? formatUzPhone(profileUser.phone) : '+998 ');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Contact / About modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  // Address management states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrTitle, setAddrTitle] = useState('🏠 Uy');
  const [addrText, setAddrText] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState('');

  // Order history accordion & pagination
  const [expandedOrders, setExpandedOrders] = useState({});
  const [visibleCount, setVisibleCount] = useState(5);

  const isUserAuthenticated = isCustomerLoggedIn || (profileUser && (profileUser.name || profileUser.phone));

  // Sync edit states when profileUser changes
  useEffect(() => {
    if (profileUser) {
      setEditName(profileUser.name || '');
      setEditPhone(profileUser.phone ? formatUzPhone(profileUser.phone) : '+998 ');
    }
  }, [profileUser]);

  // Fetch saved addresses from server
  const fetchAddresses = async () => {
    const identifier = customerUser?.telegram_id || customerUser?.phone || (profileUser?.phone ? profileUser.phone.replace(/\D/g, '') : null);
    if (!identifier) return;

    setAddressesLoading(true);
    try {
      const headers = {};
      if (customerToken) headers['Authorization'] = `Bearer ${customerToken}`;

      const res = await fetch(`/api/user/addresses?userId=${encodeURIComponent(identifier)}&phone=${encodeURIComponent(profileUser?.phone || '')}`, { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.addresses)) {
        setSavedAddresses(data.addresses);
      }
    } catch (e) {
      console.warn('Failed to fetch saved addresses:', e);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (isUserAuthenticated) {
      fetchAddresses();
    }
  }, [isUserAuthenticated, customerToken]);

  // Handle Save Address (Create / Update)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrText.trim()) {
      triggerHaptic('warning');
      setAddrError(lang === 'uz' ? 'Manzilni to\'liq kiriting' : 'Введите адрес');
      return;
    }

    setAddrSaving(true);
    setAddrError('');

    try {
      let updatedList = [...savedAddresses];
      const now = new Date().toISOString();

      if (editingAddressId) {
        // Update existing
        updatedList = updatedList.map(a => {
          if (a.id === editingAddressId) {
            return {
              ...a,
              title: addrTitle,
              address: addrText.trim(),
              is_default: addrIsDefault
            };
          }
          return addrIsDefault ? { ...a, is_default: false } : a;
        });
      } else {
        // Create new
        const newAddr = {
          id: 'addr_' + Date.now(),
          title: addrTitle,
          address: addrText.trim(),
          is_default: addrIsDefault || updatedList.length === 0,
          created_at: now
        };

        if (newAddr.is_default) {
          updatedList = updatedList.map(a => ({ ...a, is_default: false }));
        }
        updatedList.unshift(newAddr);
      }

      const identifier = customerUser?.telegram_id || customerUser?.phone || (profileUser?.phone ? profileUser.phone.replace(/\D/g, '') : null);
      const headers = { 'Content-Type': 'application/json' };
      if (customerToken) headers['Authorization'] = `Bearer ${customerToken}`;

      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: identifier,
          phone: profileUser?.phone,
          addresses: updatedList
        })
      });

      const data = await res.json();
      if (data.success) {
        triggerHaptic('notification');
        setSavedAddresses(data.addresses || updatedList);
        
        // Also sync active address to profileUser
        const defaultOne = (data.addresses || updatedList).find(a => a.is_default);
        if (defaultOne) {
          setProfileUser(prev => ({ ...prev, address: defaultOne.address }));
        }

        setIsAddressModalOpen(false);
        setEditingAddressId(null);
        setAddrText('');
      } else {
        triggerHaptic('warning');
        setAddrError(data.message || 'Saqlashda xatolik');
      }
    } catch (err) {
      triggerHaptic('warning');
      setAddrError(err.message || 'Server xatosi');
    } finally {
      setAddrSaving(false);
    }
  };

  // Handle Delete Address
  const handleDeleteAddress = (addrId) => {
    showConfirm(
      lang === 'uz' ? 'Manzilni o\'chirish' : 'Удалить адрес',
      lang === 'uz' ? 'Haqiqatan ham ushbu manzilni o\'chirmoqchimisiz?' : 'Вы уверены, что хотите удалить этот адрес?',
      async () => {
        triggerHaptic('medium');
        const updatedList = savedAddresses.filter(a => a.id !== addrId);
        
        if (updatedList.length > 0 && !updatedList.some(a => a.is_default)) {
          updatedList[0].is_default = true;
        }

        setSavedAddresses(updatedList);
        const identifier = customerUser?.telegram_id || customerUser?.phone || (profileUser?.phone ? profileUser.phone.replace(/\D/g, '') : null);
        const headers = { 'Content-Type': 'application/json' };
        if (customerToken) headers['Authorization'] = `Bearer ${customerToken}`;

        await fetch('/api/user/addresses', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId: identifier,
            phone: profileUser?.phone,
            addresses: updatedList
          })
        });
      }
    );
  };

  // Handle Set Default Address
  const handleSetDefaultAddress = async (addrId) => {
    triggerHaptic('light');
    const updatedList = savedAddresses.map(a => ({
      ...a,
      is_default: a.id === addrId
    }));
    setSavedAddresses(updatedList);

    const defaultOne = updatedList.find(a => a.is_default);
    if (defaultOne) {
      setProfileUser(prev => ({ ...prev, address: defaultOne.address }));
    }

    const identifier = customerUser?.telegram_id || customerUser?.phone || (profileUser?.phone ? profileUser.phone.replace(/\D/g, '') : null);
    const headers = { 'Content-Type': 'application/json' };
    if (customerToken) headers['Authorization'] = `Bearer ${customerToken}`;

    await fetch('/api/user/addresses', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: identifier,
        phone: profileUser?.phone,
        addresses: updatedList
      })
    });
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
        phone: editPhone.trim()
      });

      if (editPassword && editPassword.trim()) {
        await fetch('/api/user/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: editPhone.trim(),
            name: editName.trim(),
            password: editPassword.trim()
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

  // ─────────────────────────────────────────────────────────────────────────────
  // SUB-VIEW: SAVED ADDRESSES (MANZILLARIM)
  // ─────────────────────────────────────────────────────────────────────────────
  if (profileSubView === 'addresses') {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto text-left animate-fadeIn pb-28">
        <div className="flex items-center justify-between">
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
                {lang === 'uz' ? 'Yetkazib berish manzillarim' : 'Мои адреса доставки'}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {savedAddresses.length} {lang === 'uz' ? 'ta manzil' : 'адресов'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setEditingAddressId(null);
              setAddrTitle('🏠 Uy');
              setAddrText('');
              setAddrIsDefault(savedAddresses.length === 0);
              setAddrError('');
              setIsAddressModalOpen(true);
            }}
            className="px-3.5 py-2 bg-[#7000ff] hover:bg-[#5e00db] text-white text-xs font-extrabold rounded-2xl flex items-center gap-1.5 shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'uz' ? 'Qo\'shish' : 'Добавить'}</span>
          </button>
        </div>

        {savedAddresses.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-gray-150 text-center space-y-3 shadow-2xs">
            <div className="w-14 h-14 bg-purple-50 text-[#7000ff] rounded-2xl flex items-center justify-center mx-auto">
              <MapPinIcon className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              {lang === 'uz' ? 'Hozircha saqlangan manzillar yo\'q' : 'Нет сохраненных адресов'}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {lang === 'uz' 
                ? 'Buyurtmalarni tezkor qabul qilish uchun manzilingizni qo\'shing.' 
                : 'Добавьте свой адрес для быстрого оформления заказов.'}
            </p>
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsAddressModalOpen(true);
              }}
              className="mt-2 px-5 py-2.5 bg-[#7000ff] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              {lang === 'uz' ? 'Manzil qo\'shish' : 'Добавить адрес'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedAddresses.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-3xl p-4 border transition-all shadow-2xs space-y-3 ${
                  item.is_default ? 'border-[#7000ff]/60 bg-purple-50/20 ring-1 ring-[#7000ff]/30' : 'border-gray-150'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                      {item.title || '📍 Manzil'}
                    </span>
                    {item.is_default && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#7000ff]">
                        {lang === 'uz' ? 'Asosiy' : 'Основной'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setEditingAddressId(item.id);
                        setAddrTitle(item.title || '🏠 Uy');
                        setAddrText(item.address || '');
                        setAddrIsDefault(item.is_default || false);
                        setAddrError('');
                        setIsAddressModalOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Tahrirlash"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteAddress(item.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-700 font-medium leading-relaxed bg-gray-50/70 rounded-2xl p-3 border border-gray-100">
                  {item.address}
                </div>

                {!item.is_default && (
                  <button
                    onClick={() => handleSetDefaultAddress(item.id)}
                    className="text-xs text-[#7000ff] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{lang === 'uz' ? 'Asosiy manzil qilib belgilash' : 'Сделать основным'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Address Add / Edit Modal Drawer */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
            <div 
              onClick={() => setIsAddressModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] animate-fadeIn" 
            />

            <div className="relative w-full max-w-lg bg-white rounded-t-[32px] p-6 pb-9 shadow-2xl z-10 animate-slideUp max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-gray-900">
                  {editingAddressId 
                    ? (lang === 'uz' ? 'Manzilni tahrirlash' : 'Редактировать адрес') 
                    : (lang === 'uz' ? 'Yangi manzil qo\'shish' : 'Добавить новый адрес')}
                </h3>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <XMarkIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {addrError && (
                <div className="mb-3 p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 text-center animate-shake">
                  ⚠️ {addrError}
                </div>
              )}

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-700 block mb-1.5">
                    {lang === 'uz' ? 'Manzil nomi' : 'Название адреса'}
                  </label>
                  <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                    {['🏠 Uy', '💼 Ishxona', '🏢 Ofis', '📍 Boshqa'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setAddrTitle(chip)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                          addrTitle === chip 
                            ? 'bg-[#7000ff] text-white shadow-xs' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    value={addrTitle}
                    onChange={(e) => setAddrTitle(e.target.value)}
                    placeholder="Masalan: Uyim, Dacha, ..."
                    className="w-full bg-[#f2f4f7] border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-[#7000ff] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-700 block mb-1.5">
                    {lang === 'uz' ? 'To\'liq manzil va mo\'ljal *' : 'Полный адрес и ориентир *'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    autoFocus
                    value={addrText}
                    onChange={(e) => setAddrText(e.target.value)}
                    placeholder="Masalan: Toshkent sh., Chilonzor 5-mavze, 12-uy, 45-xonadon (Mo'ljal: Maktab yonida)"
                    className="w-full bg-[#f2f4f7] border border-gray-200 rounded-2xl p-3.5 text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-[#7000ff] transition-all resize-none"
                  />
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="w-4 h-4 text-[#7000ff] rounded-md focus:ring-0 border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-700">
                    {lang === 'uz' ? 'Asosiy manzil qilib belgilash' : 'Сделать основным адресом'}
                  </span>
                </label>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {lang === 'uz' ? 'Bekor qilish' : 'Отмена'}
                  </button>

                  <button
                    type="submit"
                    disabled={addrSaving}
                    className="flex-1 py-3.5 bg-[#7000ff] hover:bg-[#5e00db] text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-purple-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {addrSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      <span>{lang === 'uz' ? 'Saqlash' : 'Сохранить'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUB-VIEW: FULL ORDER HISTORY ACCORDION PAGE
  // ─────────────────────────────────────────────────────────────────────────────
  if (profileSubView === 'history') {
    const visibleOrders = orders.slice(0, visibleCount);

    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto text-left animate-fadeIn pb-24">
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
  // MAIN PROFILE SCREEN (AUTHENTICATED & GUEST ADAPTIVE)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-3.5 max-w-lg mx-auto text-left animate-fadeIn pb-28">
      
      {/* 1. Profile / Auth Header Card */}
      {isUserAuthenticated ? (
        !isEditing ? (
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs flex items-center justify-between">
            {/* Avatar & User Details Side-by-Side */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#7000ff] to-blue-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                <UserIcon className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-gray-900 truncate leading-snug">
                  {profileUser?.name || (lang === 'uz' ? 'Mijoz' : 'Клиент')}
                </h3>
                <p className="text-xs text-gray-500 font-mono font-bold mt-0.5">
                  {profileUser?.phone ? formatUzPhone(profileUser.phone) : '+998 ( ) xxx xx xx'}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsEditing(true);
              }}
              className="p-2.5 bg-gray-50 hover:bg-purple-50 hover:text-[#7000ff] text-gray-600 rounded-2xl border border-gray-200 transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
              title="Profilni tahrirlash"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Inline Edit Profile Form */
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
                  className="w-full bg-[#f2f4f7] border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-[#7000ff] transition-colors"
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
                  className="w-full bg-[#f2f4f7] border border-gray-200 rounded-xl p-2.5 font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-[#7000ff] transition-colors"
                />
              </div>

              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Yangi Parol (Ixtiyoriy)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="O'zgartirmaslik uchun bo'sh qoldiring"
                  className="w-full bg-[#f2f4f7] border border-gray-200 rounded-xl p-2.5 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#7000ff] transition-colors"
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
                className="px-5 py-2.5 bg-[#7000ff] hover:bg-[#5e00db] text-white font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {editSaving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        )
      ) : (
        /* Guest Header Card */
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
      )}

      {/* 2. Asosiy Menyu Bo'limlari (Core Store Menu) */}
      <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-2xs divide-y divide-gray-100">
        {/* Buyurtmalarim */}
        <button
          onClick={() => {
            triggerHaptic('light');
            if (isUserAuthenticated) {
              setProfileSubView('history');
              window.scrollTo({ top: 0, behavior: 'instant' });
            } else {
              openAuthModal();
            }
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
            <span className="text-xs font-bold text-gray-900">
              {lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {orders.length > 0 && (
              <span className="bg-purple-50 text-[#7000ff] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-100">
                {orders.length}
              </span>
            )}
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        {/* Saralangan */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('favorites');
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <HeartIcon className="w-5 h-5 text-gray-700" />
            <span className="text-xs font-bold text-gray-900">
              {lang === 'uz' ? 'Saralangan' : 'Избранное'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <span className="bg-rose-50 text-rose-600 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-100">
                {favorites.length}
              </span>
            )}
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        {/* Yetkazib berish manzillarim */}
        <button
          onClick={() => {
            triggerHaptic('light');
            if (isUserAuthenticated) {
              setProfileSubView('addresses');
              window.scrollTo({ top: 0, behavior: 'instant' });
            } else {
              openAuthModal();
            }
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <MapPinIcon className="w-5 h-5 text-gray-700" />
            <span className="text-xs font-bold text-gray-900">
              {lang === 'uz' ? 'Yetkazib berish manzillarim' : 'Мои адреса доставки'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {savedAddresses.length > 0 && (
              <span className="bg-purple-50 text-[#7000ff] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-100">
                {savedAddresses.length}
              </span>
            )}
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      </div>

      {/* 3. Yordam va Sozlamalar (Support & Settings) */}
      <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-2xs divide-y divide-gray-100">
        {/* Biz bilan bog'lanish */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsContactModalOpen(true);
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <EnvelopeIcon className="w-5 h-5 text-gray-700" />
            <span className="text-xs font-bold text-gray-900">
              {lang === 'uz' ? 'Biz bilan bog\'lanish' : 'Связаться с нами'}
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
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <GlobeAltIcon className="w-5 h-5 text-gray-700" />
            <span className="text-xs font-bold text-gray-900">
              {lang === 'uz' ? 'Sayt tili: O\'zbekcha' : lang === 'ru' ? 'Язык сайта: Русский' : 'Site language: English'}
            </span>
          </div>
          <span className="text-xs font-extrabold text-[#7000ff] uppercase px-2 py-0.5 bg-purple-50 rounded-lg border border-purple-100">
            {lang}
          </span>
        </button>

        {/* Biz haqimizda (Accordion) */}
        <div className="overflow-hidden">
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsAboutExpanded(!isAboutExpanded);
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <InformationCircleIcon className="w-5 h-5 text-gray-700" />
              <span className="text-xs font-bold text-gray-900">
                {lang === 'uz' ? 'Biz haqimizda' : 'О нас'}
              </span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isAboutExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isAboutExpanded && (
            <div className="p-4 pt-1 border-t border-gray-100 bg-gray-50/50 space-y-2 text-xs text-gray-600 animate-fadeIn">
              <p className="font-extrabold text-gray-900 text-xs">{siteSettings?.name || 'Dastyor Market'}</p>
              <p className="text-[11px] leading-relaxed">{siteSettings?.description || 'Oziq-ovqat va sifatli mahsulotlar yetkazib berish xizmati.'}</p>
              {siteSettings?.address && (
                <div className="flex items-start gap-1.5 pt-1 text-[11px]">
                  <MapPinIcon className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span>{siteSettings.address}</span>
                </div>
              )}
              {siteSettings?.working_hours && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <ClockIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{lang === 'uz' ? 'Ish vaqti:' : 'Время работы:'} {siteSettings.working_hours}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Akkauntdan Chiqish (Faqat tizimga kirganlar uchun) */}
      {isUserAuthenticated && (
        <div className="pt-2">
          <button
            onClick={() => {
              showConfirm(
                lang === 'uz' ? 'Akkauntdan chiqish' : 'Выйти из аккаунта',
                lang === 'uz' ? 'Haqiqatan ham profilingizdan chiqmoqchimisiz?' : 'Вы действительно хотите выйти из своего профиля?',
                logoutUser
              );
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <LogOutIcon className="w-4 h-4 text-rose-600" />
            <span>{lang === 'uz' ? 'Akkauntdan chiqish' : 'Выйти из аккаунта'}</span>
          </button>
        </div>
      )}

      {/* Contact Us Modal Drawer */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
          <div 
            onClick={() => setIsContactModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] animate-fadeIn" 
          />

          <div className="relative w-full max-w-lg bg-white rounded-t-[32px] p-6 pb-9 shadow-2xl z-10 animate-slideUp">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-gray-900">
                {lang === 'uz' ? 'Biz bilan bog\'lanish' : 'Связаться с нами'}
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Phone */}
              {siteSettings?.phone && (
                <a
                  href={`tel:${siteSettings.phone.replace(/[^\d+]/g, '')}`}
                  className="p-4 rounded-2xl bg-gray-50 hover:bg-blue-50/70 border border-gray-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs shrink-0">
                      <PhoneIcon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-extrabold block uppercase tracking-wider">
                        {lang === 'uz' ? 'Telefon raqam' : 'Телефон'}
                      </span>
                      <span className="text-xs font-black text-gray-900 group-hover:text-blue-600 font-mono">
                        {formatUzPhone(siteSettings.phone)}
                      </span>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </a>
              )}

              {/* Telegram */}
              {(siteSettings?.telegram_channel || siteSettings?.bot_username) && (
                <a
                  href={`https://t.me/${(siteSettings.telegram_channel || siteSettings.bot_username || '').replace('@', '').replace('https://t.me/', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-gray-50 hover:bg-sky-50/70 border border-gray-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-2xs shrink-0">
                      <TelegramIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-extrabold block uppercase tracking-wider">
                        Telegram
                      </span>
                      <span className="text-xs font-black text-gray-900 group-hover:text-sky-600">
                        {cleanSocialHandle(siteSettings.telegram_channel || siteSettings.bot_username)}
                      </span>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-sky-600" />
                </a>
              )}

              {/* Instagram */}
              {siteSettings?.instagram && (
                <a
                  href={`https://instagram.com/${siteSettings.instagram.replace('@', '').replace('https://instagram.com/', '').replace('https://www.instagram.com/', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-gray-50 hover:bg-pink-50/70 border border-gray-200 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-2xs shrink-0">
                      <InstagramIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-extrabold block uppercase tracking-wider">
                        Instagram
                      </span>
                      <span className="text-xs font-black text-gray-900 group-hover:text-pink-600">
                        {cleanSocialHandle(siteSettings.instagram)}
                      </span>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-pink-600" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
