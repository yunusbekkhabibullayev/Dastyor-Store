import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { XMarkIcon, MapPinIcon, ChevronLeftIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Leaflet Full-Screen Map Picker Modal Component (100% matches screenshot)
const MapModal = ({ isOpen, onClose, onSelect, target }) => {
  const { lang, triggerHaptic } = useStore();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

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

      const defaultLoc = [41.311081, 69.240562]; // Tashkent center (Adiblar xiyoboni / Milliy bog' area)
      
      // Initialize map without default zoom control to place it on top-right
      const map = window.L.map('map-container', {
        zoomControl: false
      }).setView(defaultLoc, 15);
      mapRef.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      // Add Zoom Control to the top-right
      window.L.control.zoom({ position: 'topright' }).addTo(map);

      if (target === 'bts') {
        // BTS branches markers
        const btsBranches = [
          { name: 'BTS Chilonzor filiali (Qatortol ko\'chasi, 15)', loc: [41.277943, 69.213197] },
          { name: 'BTS Yunusobod filiali (Amir Temur shoh ko\'chasi, 95)', loc: [41.353381, 69.284241] },
          { name: 'BTS Mirobod filiali (Mirobod ko\'chasi, 21)', loc: [41.298132, 69.278381] },
          { name: 'BTS Chorsu filiali (Navoiy ko\'chasi, 40)', loc: [41.321233, 69.238329] }
        ];

        setAddress(btsBranches[0].name);

        btsBranches.forEach((branch, idx) => {
          const m = window.L.marker(branch.loc).addTo(map);
          m.bindPopup(`<b>${branch.name}</b>`).openPopup();
          
          if (idx === 0) {
            map.setView(branch.loc, 15);
          }

          m.on('click', () => {
            setAddress(branch.name);
          });
        });
      } else {
        // For general address: fixed pin in center, geocode center on pan (moveend)
        const updateAddressFromCenter = () => {
          const center = map.getCenter();
          setLoading(true);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&accept-language=uz`)
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                const addr = data.address;
                const road = addr.road || '';
                const suburb = addr.suburb || addr.district || '';
                const city = addr.city || addr.town || 'Toshkent';
                
                // Format matching Seul ko'chasi, Chilonzor Tumani, Toshkent format
                const formatted = [
                  road,
                  suburb || (addr.county ? addr.county : ''),
                  city
                ].filter(Boolean).join(', ');
                
                setAddress(formatted || data.display_name.split(',').slice(0, 3).join(', '));
              } else {
                setAddress(`Toshkent, koord: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`);
              }
              setLoading(false);
            })
            .catch(() => {
              setAddress(`Toshkent, koord: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`);
              setLoading(false);
            });
        };

        // Initialize address
        updateAddressFromCenter();

        // Listen for map move (pan) to geocode center coordinates
        map.on('moveend', () => {
          updateAddressFromCenter();
        });
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen, target]);

  const handleLocateUser = () => {
    triggerHaptic('light');
    
    const fallbackBrowserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 16);
            }
          },
          () => {
            alert(lang === 'uz' ? 'GPS aniqlashda xatolik yuz berdi.' : lang === 'ru' ? 'Ошибка геолокации.' : 'GPS location error.');
          }
        );
      } else {
        alert(lang === 'uz' ? 'GPS aniqlashda xatolik yuz berdi.' : lang === 'ru' ? 'Ошибка геолокации.' : 'GPS location error.');
      }
    };

    // 1. Try Telegram WebApp LocationManager (best integration inside Telegram client)
    const tg = window.Telegram?.WebApp;
    if (tg && tg.locationManager) {
      const lm = tg.locationManager;
      
      const requestTelegramLocation = () => {
        lm.getLocation((location) => {
          if (location && location.latitude && location.longitude) {
            const { latitude, longitude } = location;
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 16);
            }
          } else {
            fallbackBrowserLocation();
          }
        });
      };

      if (!lm.isInited) {
        lm.init(() => {
          if (lm.isAvailable) {
            requestTelegramLocation();
          } else {
            fallbackBrowserLocation();
          }
        });
      } else if (lm.isAvailable) {
        requestTelegramLocation();
      } else {
        fallbackBrowserLocation();
      }
      return;
    }
    
    // 2. Fallback to normal browser geolocation
    fallbackBrowserLocation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-lg mx-auto">
      {/* Absolute Back Button overlaying the top left */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 z-[400] w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
      </button>

      {/* Target marker in center of map */}
      {target !== 'bts' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
          <div className="flex flex-col items-center -mt-9">
            <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md mb-1.5 animate-bounce">
              {lang === 'uz' ? 'Yetkazish joyi' : lang === 'ru' ? 'Точка доставки' : 'Delivery point'}
            </div>
            <MapPinIcon className="w-9 h-9 text-blue-600 drop-shadow-md" />
          </div>
        </div>
      )}

      {/* Map Element Container */}
      <div id="map-container" className="flex-1 w-full bg-gray-150 relative" />

      {/* Locate Me GPS overlay bottom-right */}
      {target !== 'bts' && (
        <button
          type="button"
          onClick={handleLocateUser}
          className="absolute bottom-40 right-4 z-[400] w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.15)] text-gray-750 hover:text-blue-600 active:scale-95 transition-all border border-gray-100"
        >
          <MapPinIcon className="w-5.5 h-5.5 text-gray-600" />
        </button>
      )}

      {/* Selected Location Card at the bottom */}
      <div className="p-5 bg-white border-t border-gray-100 space-y-4 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] shrink-0">
        <div className="space-y-1">
          <h4 className="text-[16px] font-bold text-gray-900 leading-tight">
            {loading ? (
              <span className="text-gray-400">{lang === 'uz' ? 'Yuklanmoqda...' : lang === 'ru' ? 'Загрузка...' : 'Loading...'}</span>
            ) : (
              address || (lang === 'uz' ? 'Manzil tanlanmagan' : lang === 'ru' ? 'Адрес не выбран' : 'Address not selected')
            )}
          </h4>
          <p className="text-[13px] text-gray-400 font-medium">
            {target === 'bts' 
              ? (lang === 'uz' ? 'Tegishli filialni bosing' : lang === 'ru' ? 'Нажмите на соответствующий филиал' : 'Click on the matching branch') 
              : (lang === 'uz' ? 'Aniq joyni ko\'rsatish uchun xaritani suring' : lang === 'ru' ? 'Переместите карту для точного указания' : 'Drag map to point exact location')}
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-[110px] py-3.5 border border-gray-200 rounded-[16px] text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            {lang === 'uz' ? 'Bekor qilish' : lang === 'ru' ? 'Отмена' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (address) onSelect(address);
            }}
            disabled={loading}
            className="flex-1 py-3.5 bg-[#3b82f6] hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-[16px] transition-all shadow-md shadow-blue-500/10 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {lang === 'uz' ? 'Tasdiqlash' : lang === 'ru' ? 'Подтвердить' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

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

export const CheckoutModal = ({ onClose }) => {
  const { lang, t, cart, cartTotal, placeOrder, telegramUser, triggerHaptic, setActiveTab, profileUser, setIsOrderSuccess } = useStore();

  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(profileUser?.name || telegramUser?.first_name || '');
  const [address, setAddress] = useState(profileUser?.address || '');
  const [phone, setPhone] = useState(formatUzPhone(profileUser?.phone || ''));
  const [btsBranch, setBtsBranch] = useState('');
  const [isDeliveryEnabled, setIsDeliveryEnabled] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('city'); // 'city', 'bts'
  const [error, setError] = useState('');
  
  // Map Modal settings
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState('address'); // 'address', 'bts'

  const deliveryCost = isDeliveryEnabled ? (deliveryMethod === 'city' ? 30000 : 50000) : 0;
  const finalTotal = cartTotal + deliveryCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    triggerHaptic('light');
    setError('');

    if (!name.trim()) {
      setError(lang === 'uz' ? 'Iltimos, ismingizni kiriting' : lang === 'ru' ? 'Пожалуйста, введите ваше имя' : 'Please enter your name');
      triggerHaptic('warning');
      return;
    }
    
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
      setError(lang === 'uz' ? 'Iltimos, telefon raqamingizni to\'liq kiriting' : lang === 'ru' ? 'Пожалуйста, введите номер телефона полностью' : 'Please enter your complete phone number');
      triggerHaptic('warning');
      return;
    }
    const prefix = phoneDigits.slice(3, 5);
    const allowedPrefixes = ['90', '91', '93', '94', '50', '55', '99', '95', '77', '97', '88', '33', '98', '20'];
    if (!allowedPrefixes.includes(prefix)) {
      setError(lang === 'uz' ? 'Noto\'g\'ri telefon operatori kodi! (Faqat 90, 91, 93, 94, 50, 55, 99, 95, 77, 97, 88, 33, 98, 20 kodlari qabul qilinadi)' : lang === 'ru' ? 'Неверный код оператора! (Допускаются только коды 90, 91, 93, 94, 50, 55, 99, 95, 77, 97, 88, 33, 98, 20)' : 'Invalid operator code! (Only 90, 91, 93, 94, 50, 55, 99, 95, 77, 97, 88, 33, 98, 20 codes are allowed)');
      triggerHaptic('warning');
      return;
    }
    if (isDeliveryEnabled && deliveryMethod === 'bts' && !btsBranch.trim()) {
      setError(lang === 'uz' ? 'Iltimos, BTS filialini tanlang' : lang === 'ru' ? 'Пожалуйста, выберите филиал BTS' : 'Please select a BTS branch');
      triggerHaptic('warning');
      return;
    }
    if (isDeliveryEnabled && deliveryMethod === 'city' && !address.trim()) {
      setError(lang === 'uz' ? 'Iltimos, yetkazib berish manzilini kiriting' : lang === 'ru' ? 'Пожалуйста, введите адрес доставки' : 'Please enter a delivery address');
      triggerHaptic('warning');
      return;
    }

    setSubmitting(true);
    const result = await placeOrder({
      name,
      address: isDeliveryEnabled 
        ? (deliveryMethod === 'bts' ? btsBranch : address) 
        : (address || (lang === 'uz' ? 'Olib ketish' : lang === 'ru' ? 'Самовывоз' : 'Self-pickup')),
      phone,
      paymentMethod: isDeliveryEnabled 
        ? (deliveryMethod === 'city' ? (lang === 'uz' ? 'Click (Shahar ichida)' : lang === 'ru' ? 'Click (Внутри города)' : 'Click (In city)') : 'Click (BTS)') 
        : (lang === 'uz' ? 'Click (Olib ketish)' : lang === 'ru' ? 'Click (Самовывоз)' : 'Click (Self-pickup)'),
      total: finalTotal
    });

    setSubmitting(false);
    if (result.success) {
      setIsOrderSuccess(true);
      setActiveTab('catalog');
      onClose();
    } else {
      setError(result.message || 'Xatolik yuz berdi');
      triggerHaptic('warning');
    }
  };

  const handleMapSelect = (selectedAddr) => {
    setIsMapOpen(false);
    triggerHaptic('medium');
    if (mapTarget === 'bts') {
      setBtsBranch(selectedAddr);
    } else {
      setAddress(selectedAddr);
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString('uz-UZ').replace(/,/g, ' ') + ' ' + (lang === 'uz' ? "so'm" : lang === 'ru' ? 'сум' : 'som');
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50/60 min-h-screen">
      {/* Header — matching 3-rasm back button & title */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all shrink-0"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <span className="text-[17px] font-bold text-gray-900">
          {lang === 'uz' ? 'Buyurtma berish' : lang === 'ru' ? 'Оформление заказа' : 'Checkout'}
        </span>
        <div className="w-9" /> {/* Spacer to center title */}
      </div>

      {/* Main Form content */}
      <form onSubmit={handleSubmit} className="p-4 pb-28 space-y-4 overflow-y-auto">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-[12px] font-bold text-rose-600 flex items-start gap-2 animate-scaleUp">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm space-y-5">
          {/* ALOQA MA'LUMOTLARI */}
          <div>
            <h3 className="text-[11px] font-bold text-[#3b82f6] tracking-wider uppercase mb-3">
              {lang === 'uz' ? "ALOQA MA'LUMOTLARI" : lang === 'ru' ? 'КОНТАКТНЫЕ ДАННЫЕ' : 'CONTACT INFORMATION'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-700 block mb-1">
                  {lang === 'uz' ? 'Ism' : lang === 'ru' ? 'Имя' : 'Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'uz' ? "Ismingizni kiriting" : lang === 'ru' ? "Введите ваше имя" : "Enter your name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#fcfcfd] border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-900 w-full focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-gray-700 block mb-1">
                  {lang === 'uz' ? 'Telefon' : lang === 'ru' ? 'Telefon' : 'Phone'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+998 ( ) xxx xx xx"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length === 1 && /\d/.test(val)) {
                      setPhone(formatUzPhone('+998 (' + val));
                      return;
                    }
                    if (val.length < 6) {
                      setPhone('');
                      return;
                    }
                    setPhone(formatUzPhone(val));
                  }}
                  className="bg-[#fcfcfd] border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-900 w-full focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Only show personal address location picker if delivery is disabled or city-delivery selected */}
              {(!isDeliveryEnabled || deliveryMethod === 'city') && (
                <div>
                  <label className="text-[13px] font-semibold text-gray-700 block mb-1">
                    {isDeliveryEnabled 
                      ? (lang === 'uz' ? 'Yetkazib berish manzili' : lang === 'ru' ? 'Адрес доставки' : 'Delivery address') 
                      : (lang === 'uz' ? 'Lokatsiya (ixtiyoriy)' : lang === 'ru' ? 'Локация (опционально)' : 'Location (optional)')} 
                    {isDeliveryEnabled && <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required={isDeliveryEnabled}
                      placeholder={isDeliveryEnabled 
                        ? (lang === 'uz' ? "Manzilingizni tanlang" : lang === 'ru' ? "Выберите ваш адрес" : "Select your address") 
                        : (lang === 'uz' ? "Xaritada ko'rsatish" : lang === 'ru' ? "Указать на карте" : "Select on map")}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-[#fcfcfd] border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-900 w-full flex-1 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setMapTarget('address');
                        setIsMapOpen(true);
                      }}
                      className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm text-gray-400 hover:text-blue-500 active:scale-95 transition-all shrink-0 hover:border-blue-300"
                    >
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Yetkazib berish */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-gray-900">
                {lang === 'uz' ? 'Yetkazib berish' : lang === 'ru' ? 'Доставка' : 'Delivery'} {isDeliveryEnabled && <span className="text-gray-400 font-normal text-xs ml-1">+{formatPrice(deliveryCost)}</span>}
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsDeliveryEnabled(!isDeliveryEnabled);
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  isDeliveryEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                    isDeliveryEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Delivery Methods Options (4-rasm) */}
            {isDeliveryEnabled && (
              <div className="mt-3 space-y-3 animate-scaleUp">
                <div
                  onClick={() => { triggerHaptic('light'); setDeliveryMethod('city'); }}
                  className={`p-3 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    deliveryMethod === 'city'
                      ? 'border-blue-500 bg-[#f0f6ff]'
                      : 'border-gray-150 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-blue-600">
                      {lang === 'uz' ? 'Shahar ichida yetkazib berish' : lang === 'ru' ? 'Доставка по городу' : 'City delivery'}
                    </h5>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {lang === 'uz' ? '5 kg gacha, 1 soatda' : lang === 'ru' ? 'до 5 кг, за 1 час' : 'up to 5kg, in 1 hour'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{formatPrice(30000)}</span>
                </div>

                <div
                  onClick={() => { triggerHaptic('light'); setDeliveryMethod('bts'); }}
                  className={`p-3 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    deliveryMethod === 'bts'
                      ? 'border-blue-500 bg-[#f0f6ff]'
                      : 'border-gray-150 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-gray-800 font-bold">BTS</h5>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {lang === 'uz' ? '5 kg gacha, 1 kunda' : lang === 'ru' ? 'до 5 кг, за 1 день' : 'up to 5kg, in 1 day'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{formatPrice(50000)}</span>
                </div>

                {/* BTS Branch Selection Input (1-rasm) */}
                {deliveryMethod === 'bts' && (
                  <div className="pt-2 border-t border-gray-100 space-y-1.5 animate-scaleUp">
                    <label className="text-[13px] font-semibold text-gray-750 block mb-1">
                      {lang === 'uz' ? 'BTS filiali' : lang === 'ru' ? 'Филиал BTS' : 'BTS Branch'} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder={lang === 'uz' ? "filialni tanlang yoki kiriting" : lang === 'ru' ? "выберите или введите филиал" : "select or enter branch"}
                        value={btsBranch}
                        onChange={(e) => setBtsBranch(e.target.value)}
                        className="bg-[#fcfcfd] border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-900 w-full flex-1 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setMapTarget('bts');
                          setIsMapOpen(true);
                        }}
                        className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm text-gray-400 hover:text-blue-500 active:scale-95 transition-all shrink-0 hover:border-blue-300"
                      >
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* JAMI TO'LOV */}
          <div>
            <h3 className="text-[11px] font-bold text-[#3b82f6] tracking-wider uppercase mb-3">
              {lang === 'uz' ? "JAMI TO'LOV" : lang === 'ru' ? 'ИТОГО К ОПЛАТЕ' : 'TOTAL PAYMENT'}
            </h3>
            <div className="space-y-2 text-xs">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span>{item.title[lang]} × {item.quantity} {lang === 'uz' ? 'dona' : lang === 'ru' ? 'шт' : 'pcs'}</span>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              {isDeliveryEnabled && (
                <div className="flex justify-between text-gray-600">
                  <span>{deliveryMethod === 'city' ? (lang === 'uz' ? 'Shahar ichida yetkazib berish' : lang === 'ru' ? 'Доставка по городу' : 'City delivery') : 'BTS'}</span>
                  <span className="font-semibold">{formatPrice(deliveryCost)}</span>
                </div>
              )}
              <hr className="border-gray-50 my-2" />
              <div className="flex justify-between text-[16px] font-extrabold text-gray-900">
                <span>{lang === 'uz' ? 'Jami:' : lang === 'ru' ? 'Итого:' : 'Total:'}</span>
                <span className="text-[17px] text-blue-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{lang === 'uz' ? 'Tasdiqlash va To\'lash' : lang === 'ru' ? 'Подтвердить и оплатить' : 'Confirm and Pay'}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        
        {/* Bot Username Footer */}
        <span className="text-[12px] text-gray-400/80 text-center mt-3 block font-semibold">
          @dastyor_bola_bot
        </span>
      </form>

      {/* Interactive Map Picker Modal wrapper */}
      <MapModal
        isOpen={isMapOpen}
        target={mapTarget}
        onClose={() => setIsMapOpen(false)}
        onSelect={handleMapSelect}
      />
    </div>
  );
};
