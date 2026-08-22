import React, { useState, useEffect, useRef } from 'react';
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
  EnvelopeIcon,
  CameraIcon,
  PhotoIcon,
  HomeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  MapIcon
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

// Leaflet Full-Screen Map Picker Modal with High-Accuracy GPS & Reverse Geocoding
const MapPickerModal = ({ isOpen, onClose, onSelect }) => {
  const { lang, triggerHaptic } = useStore();
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gpsLocating, setGpsLocating] = useState(false);
  const mapRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const fetchReverseGeocode = (lat, lon) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setLoading(true);
    setCoords({ lat: parseFloat(lat.toFixed(5)), lon: parseFloat(lon.toFixed(5)) });

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}&lang=${lang}`);
        const data = await res.json();
        if (data && data.success && data.address) {
          setAddress(data.address);
        } else {
          setAddress(`Manzil: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
      } catch (e) {
        console.warn('Geocoding error:', e);
        setAddress(`Manzil: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const locateUser = () => {
    triggerHaptic('light');
    setGpsLocating(true);

    const onSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 18, { animate: true });
      }
      fetchReverseGeocode(latitude, longitude);
      setGpsLocating(false);
      triggerHaptic('notification');
    };

    const onError = (err) => {
      setGpsLocating(false);
      console.warn('GPS location error:', err);
      alert(lang === 'uz' 
        ? 'GPS orqali joylashuvni aniqlash uchun brauzeringizda joylashuvga ruxsat bering.' 
        : 'Пожалуйста, разрешите доступ к геолокации в браузере для определения местоположения.');
    };

    if (window.Telegram?.WebApp?.LocationManager) {
      window.Telegram.WebApp.LocationManager.getLocation((loc) => {
        if (loc && loc.latitude && loc.longitude) {
          if (mapRef.current) {
            mapRef.current.setView([loc.latitude, loc.longitude], 18, { animate: true });
          }
          fetchReverseGeocode(loc.latitude, loc.longitude);
          setGpsLocating(false);
          triggerHaptic('notification');
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        }
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      setGpsLocating(false);
      alert(lang === 'uz' ? 'Qurilmangizda GPS qo\'llab-quvvatlanmaydi.' : 'GPS не поддерживается.');
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!window.L) {
        console.error('Leaflet library not loaded.');
        return;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const defaultLoc = [41.311081, 69.240562]; // Toshkent
      
      const map = window.L.map('profile-map-container', {
        zoomControl: false
      }).setView(defaultLoc, 15);
      mapRef.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      window.L.control.zoom({ position: 'topright' }).addTo(map);

      // On pan/drag end: geocode center
      map.on('moveend', () => {
        const center = map.getCenter();
        fetchReverseGeocode(center.lat, center.lng);
      });

      // On map click: pan to clicked spot
      map.on('click', (e) => {
        triggerHaptic('light');
        map.panTo(e.latlng, { animate: true });
      });

      // Initial center geocode
      const initialCenter = map.getCenter();
      fetchReverseGeocode(initialCenter.lat, initialCenter.lng);

      // Try automatic GPS geolocation on map open
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 17, { animate: true });
            }
            fetchReverseGeocode(latitude, longitude);
          },
          () => {} // Silent fail on initial open
        );
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-gray-100 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer"
          >
            <ArrowLeftIcon className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h3 className="font-black text-sm text-gray-900">
            {lang === 'uz' ? 'Xaritadan manzilni belgilash' : 'Указать адрес на карте'}
          </h3>
        </div>

        {/* GPS Locate Button */}
        <button 
          onClick={locateUser}
          disabled={gpsLocating}
          className="px-3 py-2 rounded-2xl bg-purple-50 text-[#7000ff] hover:bg-purple-100 border border-purple-100 flex items-center gap-1.5 text-xs font-black shadow-2xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
        >
          {gpsLocating ? (
            <div className="w-3.5 h-3.5 border-2 border-[#7000ff] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <MapPinIcon className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>{lang === 'uz' ? 'Joylashuvim' : 'Мое место'}</span>
        </button>
      </div>

      {/* Map Element Container */}
      <div className="relative flex-1 w-full bg-gray-100">
        <div id="profile-map-container" className="w-full h-full" />
        
        {/* Center Target Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-20 flex flex-col items-center">
          <div className="p-2.5 bg-[#7000ff] text-white rounded-full shadow-2xl border-2 border-white animate-bounce">
            <MapPinIcon className="w-6 h-6 stroke-[2.8]" />
          </div>
          <div className="w-2.5 h-2.5 bg-black/40 rounded-full blur-[1.5px] -mt-0.5"></div>
        </div>

        {/* Tip text floating over map */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg pointer-events-none z-10 whitespace-nowrap">
          {lang === 'uz' ? '📍 Xaritani suring yoki bosing' : '📍 Перемещайте или нажимайте на карту'}
        </div>
      </div>

      {/* Bottom Selected Address Bar */}
      <div className="bg-white border-t border-gray-150 p-4 pb-8 shadow-2xl space-y-3 z-10">
        <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#7000ff] flex items-center justify-center shrink-0 mt-0.5">
            <MapPinIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              {lang === 'uz' ? 'Aniqlangan to\'liq manzil' : 'Определенный адрес'}
            </p>
            <p className="text-xs font-black text-gray-900 leading-snug mt-0.5">
              {loading ? (
                <span className="text-gray-400 animate-pulse">{lang === 'uz' ? 'Manzil aniqlanmoqda...' : 'Определение адреса...'}</span>
              ) : (
                address || (lang === 'uz' ? 'Xaritani suring' : 'Переместите карту')
              )}
            </p>
            {coords && (
              <p className="text-[10px] text-gray-400 font-mono mt-0.5 font-bold">
                {coords.lat}, {coords.lon}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic('notification');
            const finalAddr = coords 
              ? `${address} (${coords.lat}, ${coords.lon})`
              : address;
            onSelect(finalAddr);
            onClose();
          }}
          disabled={loading || !address}
          className="w-full py-3.5 bg-[#7000ff] hover:bg-[#5e00db] text-white font-black rounded-2xl text-xs shadow-lg shadow-purple-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <span>{lang === 'uz' ? 'Ushbu manzilni tanlash' : 'Выбрать этот адрес'}</span>
        </button>
      </div>
    </div>
  );
};

export const ProfileView = () => {
  const {
    lang, toggleLanguage, t, orders, triggerHaptic, profileUser, setProfileUser, updateProfileUser, 
    customerToken, customerUser, logoutUser, clearOrders, deleteOrder, profileSubView, setProfileSubView, 
    showConfirm, telegramUser, siteSettings, formatQuantity, adminAuth,
    isCustomerLoggedIn, openAuthModal, setActiveTab, favorites
  } = useStore();

  // Edit Page States
  const [editName, setEditName] = useState(profileUser?.name || '');
  const [editPhone, setEditPhone] = useState(profileUser?.phone ? formatUzPhone(profileUser.phone) : '+998 ');
  const [editPassword, setEditPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editAvatarUrl, setEditAvatarUrl] = useState(profileUser?.avatar_url || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Contact / About modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  // Address management states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrCategory, setAddrCategory] = useState('home'); // home, work, office, other
  const [addrTitle, setAddrTitle] = useState('Uy');
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
      setEditAvatarUrl(profileUser.avatar_url || '');
    }
  }, [profileUser]);

  // Handle Avatar Image File Upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerHaptic('warning');
      setEditError(lang === 'uz' ? 'Faqat rasm fayllarini yuklash mumkin' : 'Можно загружать только изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerHaptic('warning');
      setEditError(lang === 'uz' ? 'Rasm hajmi 5MB dan oshmasligi kerak' : 'Размер фото не должен превышать 5МБ');
      return;
    }

    setAvatarUploading(true);
    setEditError('');
    triggerHaptic('light');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const headers = {};
      if (customerToken) {
        headers['Authorization'] = `Bearer ${customerToken}`;
      }

      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();
      if (data.success && data.fileUrl) {
        setEditAvatarUrl(data.fileUrl);
        triggerHaptic('notification');
      } else {
        triggerHaptic('warning');
        setEditError(data.message || 'Rasm yuklashda xatolik yuz berdi');
      }
    } catch (err) {
      triggerHaptic('warning');
      setEditError(err.message || 'Server xatosi');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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

  // Address Category Definitions with Pure SVG Icons
  const addressPresets = [
    { id: 'home', title: lang === 'uz' ? 'Uy' : 'Дом', icon: HomeIcon },
    { id: 'work', title: lang === 'uz' ? 'Ishxona' : 'Работа', icon: BriefcaseIcon },
    { id: 'office', title: lang === 'uz' ? 'Ofis' : 'Офис', icon: BuildingOfficeIcon },
    { id: 'other', title: lang === 'uz' ? 'Boshqa' : 'Другое', icon: MapPinIcon }
  ];

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
        updatedList = updatedList.map(a => {
          if (a.id === editingAddressId) {
            return {
              ...a,
              category: addrCategory,
              title: addrTitle,
              address: addrText.trim(),
              is_default: addrIsDefault
            };
          }
          return addrIsDefault ? { ...a, is_default: false } : a;
        });
      } else {
        const newAddr = {
          id: 'addr_' + Date.now(),
          category: addrCategory,
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

  // Handle Save Full Profile Edit
  const handleSaveProfileEdit = async (e) => {
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
      const payload = {
        name: editName.trim(),
        phone: editPhone.trim(),
        avatar_url: editAvatarUrl || ''
      };

      await updateProfileUser(payload);

      const headers = { 'Content-Type': 'application/json' };
      if (customerToken) headers['Authorization'] = `Bearer ${customerToken}`;

      const updateBody = {
        phone: editPhone.trim(),
        name: editName.trim(),
        avatar_url: editAvatarUrl || ''
      };
      if (editPassword && editPassword.trim()) {
        updateBody.password = editPassword.trim();
      }

      await fetch('/api/user/me', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateBody)
      });

      triggerHaptic('notification');
      setEditPassword('');
      setProfileSubView(null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      triggerHaptic('warning');
      setEditError(err.message || 'Saqlashda xatolik');
    } finally {
      setEditSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SUB-VIEW: DEDICATED EDIT PROFILE PAGE
  // ─────────────────────────────────────────────────────────────────────────────
  if (profileSubView === 'edit') {
    return (
      <div className="p-4 space-y-5 max-w-lg mx-auto text-left animate-fadeIn pb-28">
        {/* Top Header */}
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
              {lang === 'uz' ? 'Profil ma\'lumotlari' : 'Данные профиля'}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {lang === 'uz' ? 'Shaxsiy ma\'lumotlarni tahrirlash' : 'Редактирование профиля'}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfileEdit} className="space-y-4">
          {/* Avatar Upload Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-2xs text-center flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 min-w-[96px] min-h-[96px] max-w-[96px] max-h-[96px] aspect-square rounded-3xl overflow-hidden shadow-md ring-4 ring-purple-100 bg-[#f2f4f7] flex items-center justify-center transition-transform active:scale-95 shrink-0">
                {editAvatarUrl ? (
                  <img 
                    src={editAvatarUrl} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover rounded-3xl block" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#7000ff] to-blue-600 flex items-center justify-center text-white">
                    <UserIcon className="w-12 h-12 stroke-[1.8]" />
                  </div>
                )}

                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] rounded-3xl flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-2xl bg-[#7000ff] text-white flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                <CameraIcon className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="mt-3.5 space-y-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-black text-[#7000ff] hover:underline cursor-pointer"
              >
                {lang === 'uz' ? 'Rasmni o\'zgartirish' : 'Изменить фото'}
              </button>
              {editAvatarUrl && (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setEditAvatarUrl('');
                    }}
                    className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    {lang === 'uz' ? 'Rasmni o\'chirish' : 'Удалить фото'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-4">
            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center animate-shake">
                ⚠️ {editError}
              </div>
            )}

            <div>
              <label className="text-[11px] font-extrabold text-gray-700 block mb-1.5">
                {lang === 'uz' ? 'Ism va Familiya *' : 'Имя и Фамилия *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={lang === 'uz' ? 'Ismingiz' : 'Ваше имя'}
                  className="w-full bg-[#f2f4f7] border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-[#7000ff] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-700 block mb-1.5">
                {lang === 'uz' ? 'Telefon Raqami *' : 'Номер телефона *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <PhoneIcon className="w-4 h-4" />
                </div>
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
                  className="w-full bg-[#f2f4f7] border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-[#7000ff] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-700 block mb-1.5">
                {lang === 'uz' ? 'Yangi Parol (Ixtiyoriy)' : 'Новый Пароль (Необязательно)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <LockClosedIcon className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder={lang === 'uz' ? 'O\'zgartirmaslik uchun bo\'sh qoldiring' : 'Оставьте пустым, чтобы не менять'}
                  className="w-full bg-[#f2f4f7] border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#7000ff] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setProfileSubView(null);
              }}
              className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs active:scale-95 transition-all cursor-pointer"
            >
              {lang === 'uz' ? 'Bekor qilish' : 'Отмена'}
            </button>

            <button
              type="submit"
              disabled={editSaving || avatarUploading}
              className="flex-1 py-3.5 bg-[#7000ff] hover:bg-[#5e00db] text-white font-black rounded-2xl text-xs shadow-lg shadow-purple-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {editSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{lang === 'uz' ? 'Saqlash' : 'Сохранить'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUB-VIEW: SAVED ADDRESSES (MANZILLARIM)
  // ─────────────────────────────────────────────────────────────────────────────
  if (profileSubView === 'addresses') {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto text-left animate-fadeIn pb-28">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                triggerHaptic('light');
                setProfileSubView(null);
              }}
              className="w-9 h-9 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeftIcon className="w-4 h-4 stroke-[2.2]" />
            </button>
            <div>
              <h2 className="text-sm font-black text-gray-900 leading-tight">
                {lang === 'uz' ? 'Yetkazib berish manzillarim' : 'Мои адреса доставки'}
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">
                {savedAddresses.length} {lang === 'uz' ? 'ta saqlangan manzil' : 'сохраненных адресов'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setEditingAddressId(null);
              setAddrCategory('home');
              setAddrTitle(lang === 'uz' ? 'Uy' : 'Дом');
              setAddrText('');
              setAddrIsDefault(savedAddresses.length === 0);
              setAddrError('');
              setIsAddressModalOpen(true);
            }}
            className="px-3.5 py-2 bg-[#7000ff] hover:bg-[#5e00db] text-white text-xs font-black rounded-2xl flex items-center gap-1.5 shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <PlusIcon className="w-3.5 h-3.5 stroke-[2.8]" />
            <span>{lang === 'uz' ? 'Qo\'shish' : 'Добавить'}</span>
          </button>
        </div>

        {/* Addresses List */}
        {savedAddresses.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-150 text-center space-y-3.5 shadow-2xs">
            <div className="w-14 h-14 bg-purple-50 text-[#7000ff] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <MapPinIcon className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-gray-900">
                {lang === 'uz' ? 'Hozircha saqlangan manzillar yo\'q' : 'Нет сохраненных адресов'}
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed font-medium">
                {lang === 'uz' 
                  ? 'Buyurtmalarni tezkor qabul qilish uchun manzilingizni qo\'shing.' 
                  : 'Добавьте свой адрес для быстрого оформления заказов.'}
              </p>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                setEditingAddressId(null);
                setAddrCategory('home');
                setAddrTitle(lang === 'uz' ? 'Uy' : 'Дом');
                setAddrText('');
                setAddrIsDefault(true);
                setAddrError('');
                setIsAddressModalOpen(true);
              }}
              className="mt-1 px-6 py-3 bg-[#7000ff] hover:bg-[#5e00db] text-white text-xs font-black rounded-2xl shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {lang === 'uz' ? 'Manzil qo\'shish' : 'Добавить адрес'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedAddresses.map((item) => {
              const matchedPreset = addressPresets.find(p => p.id === item.category) || addressPresets[3];
              const IconComponent = matchedPreset.icon;

              return (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-3xl p-4 border transition-all shadow-2xs space-y-3 ${
                    item.is_default ? 'border-[#7000ff]/60 bg-purple-50/15 ring-1 ring-[#7000ff]/25' : 'border-gray-150'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100/70 text-[#7000ff] flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <span className="font-extrabold text-sm text-gray-900">
                        {item.title || matchedPreset.title}
                      </span>
                      {item.is_default && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-[#7000ff]">
                          {lang === 'uz' ? 'Asosiy' : 'Основной'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setEditingAddressId(item.id);
                          setAddrCategory(item.category || 'home');
                          setAddrTitle(item.title || 'Uy');
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

                  <div className="text-xs text-gray-700 font-medium leading-relaxed bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
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
              );
            })}
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
                {/* SVG Icon Category Selector */}
                <div>
                  <label className="text-[11px] font-extrabold text-gray-700 block mb-2">
                    {lang === 'uz' ? 'Manzil turi' : 'Тип адреса'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {addressPresets.map(preset => {
                      const Icon = preset.icon;
                      const isSelected = addrCategory === preset.id;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setAddrCategory(preset.id);
                            setAddrTitle(preset.title);
                          }}
                          className={`py-2.5 px-2 rounded-2xl text-xs font-black flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                            isSelected 
                              ? 'bg-[#7000ff] text-white border-[#7000ff] shadow-md shadow-purple-500/25' 
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className={`w-4 h-4 stroke-[2.2] ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                          <span className="truncate w-full text-center text-[11px]">{preset.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Name / Label */}
                <div>
                  <label className="text-[11px] font-extrabold text-gray-700 block mb-1.5">
                    {lang === 'uz' ? 'Manzil nomi' : 'Название адреса'}
                  </label>
                  <input
                    type="text"
                    required
                    value={addrTitle}
                    onChange={(e) => setAddrTitle(e.target.value)}
                    placeholder="Masalan: Uyim, Dacha, ..."
                    className="w-full bg-[#f2f4f7] border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-[#7000ff] transition-all"
                  />
                </div>

                {/* Interactive Map Picker Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-extrabold text-gray-700">
                      {lang === 'uz' ? 'To\'liq manzil va mo\'ljal *' : 'Полный адрес и ориентир *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="text-[11px] font-black text-[#7000ff] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <MapIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{lang === 'uz' ? 'Xaritadan belgilash' : 'Указать на карте'}</span>
                    </button>
                  </div>

                  <textarea
                    required
                    rows={3}
                    value={addrText}
                    onChange={(e) => setAddrText(e.target.value)}
                    placeholder="Masalan: Toshkent sh., Chilonzor 5-mavze, 12-uy, 45-xonadon (Mo'ljal: Maktab yonida)"
                    className="w-full bg-[#f2f4f7] border border-gray-200 rounded-2xl p-3.5 text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-[#7000ff] transition-all resize-none"
                  />
                </div>

                {/* Set as Default Checkbox */}
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
                    className="flex-1 py-3.5 bg-[#7000ff] hover:bg-[#5e00db] text-white font-black rounded-2xl text-xs shadow-lg shadow-purple-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
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

        {/* Full-Screen Map Picker Modal */}
        <MapPickerModal
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          onSelect={(selectedAddress) => {
            setAddrText(selectedAddress);
          }}
        />
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
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs flex items-center justify-between">
          {/* Avatar & User Details Side-by-Side */}
          <div 
            onClick={() => {
              triggerHaptic('light');
              setProfileSubView('edit');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="flex items-center gap-3.5 min-w-0 cursor-pointer group"
          >
            <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0 bg-[#f2f4f7] flex items-center justify-center">
              {profileUser?.avatar_url ? (
                <img 
                  src={profileUser.avatar_url} 
                  alt={profileUser.name} 
                  className="w-full h-full object-cover rounded-2xl block" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#7000ff] to-blue-600 text-white flex items-center justify-center">
                  <UserIcon className="w-7 h-7 stroke-[2.2]" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-gray-900 truncate leading-snug group-hover:text-[#7000ff] transition-colors">
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
              setProfileSubView('edit');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="p-2.5 bg-gray-50 hover:bg-purple-50 hover:text-[#7000ff] text-gray-600 rounded-2xl border border-gray-200 transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
            title="Profilni tahrirlash"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
        </div>
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
