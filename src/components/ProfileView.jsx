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
  Cog6ToothIcon as SettingsIcon 
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
    lang, t, orders, triggerHaptic, profileUser, setProfileUser, logoutUser, clearOrders, deleteOrder, profileSubView, setProfileSubView, showConfirm, telegramUser, setIsAdminMode
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profileUser?.name || '');
  const [editPhone, setEditPhone] = useState(formatUzPhone(profileUser?.phone || ''));
  const [editAddress, setEditAddress] = useState(profileUser?.address || '');
  const [error, setError] = useState('');

  // Clear error when editing status changes
  useEffect(() => {
    setError('');
  }, [isEditing]);

  // State to manage expanded status of individual order cards (Accordion)
  const [expandedOrders, setExpandedOrders] = useState({});
  // State to manage pagination for the full history page
  const [visibleCount, setVisibleCount] = useState(5);

  // Keep editing state in sync with context updates
  useEffect(() => {
    if (profileUser) {
      setEditName(profileUser.name);
      setEditPhone(formatUzPhone(profileUser.phone));
      setEditAddress(profileUser.address);
    }
  }, [profileUser, isEditing]);

  // Infinite Scroll / Lazy Loading scroll listener for history sub-view
  useEffect(() => {
    if (profileSubView !== 'history') return;

    const handleScroll = () => {
      const threshold = 120; // load when 120px close to bottom
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

  // Reset lazy load pagination limit when opening subview
  useEffect(() => {
    if (profileSubView === 'history') {
      setVisibleCount(5);
    }
  }, [profileSubView]);

  const handleSave = (e) => {
    setError('');

    if (!editName.trim()) {
      setError(lang === 'uz' ? 'Ism maydoni bo\'sh bo\'lmasligi kerak' : lang === 'ru' ? 'Имя не должно быть пустым' : 'Name field cannot be empty');
      triggerHaptic('warning');
      return;
    }
    const phoneDigits = editPhone.replace(/\D/g, '');
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

    setProfileUser({
      name: editName,
      phone: editPhone,
      address: editAddress
    });
    setIsEditing(false);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('uz-UZ').replace(/,/g, ' ') + ' ' + (lang === 'uz' ? "so'm" : lang === 'ru' ? 'сум' : 'som');
  };

  const formatDate = (dateStr) => {
    const monthsUz = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
    const monthsRu = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = date.getDate();
      const monthIdx = date.getMonth();
      const year = date.getFullYear();
      if (lang === 'uz') {
        return `${day}-${monthsUz[monthIdx]}, ${year}`;
      } else if (lang === 'ru') {
        return `${day}-${monthsRu[monthIdx]}, ${year}`;
      } else {
        return `${monthsEn[monthIdx]} ${day}, ${year}`;
      }
    } catch {
      return dateStr;
    }
  };

  const statusBadge = (status) => {
    const config = {
      processing: { text: t.statusProcessing, color: 'text-amber-600 bg-amber-50/80 border-amber-100', icon: ClockIcon },
      shipping: { text: t.statusShipping, color: 'text-blue-600 bg-blue-50/80 border-blue-100', icon: TruckIcon },
      delivered: { text: t.statusDelivered, color: 'text-green-600 bg-green-50/80 border-green-100', icon: CheckCircleIcon },
    };
    const c = config[status];
    if (!c) return null;
    const IconComponent = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${c.color}`}>
        <IconComponent className="w-3.5 h-3.5" />
        {c.text}
      </span>
    );
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Helper to render a clean, high-end order card layout
  const renderOrderCard = (order) => {
    const isExpanded = !!expandedOrders[order.id];
    
    const statusConfig = {
      processing: { text: lang === 'uz' ? 'Tayyorlanmoqda ⏳' : 'Tayyorlanmoqda ⏳', color: 'bg-amber-50 text-amber-700 border-amber-200/80' },
      shipping: { text: lang === 'uz' ? 'Yo\'lda 🚚' : 'Yo\'lda 🚚', color: 'bg-blue-50 text-blue-700 border-blue-200/80' },
      delivered: { text: lang === 'uz' ? 'Yetkazildi ✅' : 'Yetkazildi ✅', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' },
      cancelled: { text: lang === 'uz' ? 'Bekor qilindi ❌' : 'Bekor qilindi ❌', color: 'bg-rose-50 text-rose-700 border-rose-200/80' },
    };

    const statusInfo = statusConfig[order.status] || { text: order.status, color: 'bg-gray-50 text-gray-700 border-gray-200' };

    return (
      <div key={order.id} className="bg-white rounded-2xl border border-gray-150 p-4 shadow-2xs space-y-3 transition-all duration-200">
        {/* Top Header Row: Order ID, Date & Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-left">
            <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
              {lang === 'uz' ? 'Buyurtma' : 'Заказ'} #{order.id.replace('ORD-', '')}
            </h4>
            <span className="text-[11px] text-gray-400 font-medium mt-0.5 block">
              {formatDate(order.date)}
            </span>
          </div>

          <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${statusInfo.color} shrink-0`}>
            {statusInfo.text}
          </span>
        </div>

        {/* Middle Row: Item Thumbnails / Quick Summary */}
        {order.items && order.items.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <div className="flex items-center -space-x-2 overflow-hidden shrink-0">
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="w-9 h-9 rounded-lg border-2 border-white overflow-hidden bg-gray-100 shadow-2xs">
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-500 font-semibold truncate text-left">
              {order.items[0]?.title ? (order.items[0].title[lang] || order.items[0].title.uz) : 'Mahsulot'}
              {order.items.length > 1 && ` (+${order.items.length - 1})`}
            </span>
          </div>
        )}

        {/* Bottom Row: Price & Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              {lang === 'uz' ? 'Jami' : 'Итого'}
            </span>
            <span className="text-sm font-black text-gray-900 block mt-0.5">
              {formatPrice(order.total)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {order.status === 'processing' && (
              <button
                onClick={() => {
                  showConfirm(
                    lang === 'uz' ? 'Haqiqatan ham ushbu buyurtmani bekor qilmoqchimisiz?' : 'Do you really want to cancel this order?',
                    () => deleteOrder(order.id)
                  );
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 active:scale-95 transition-all text-xs font-bold border border-rose-100 flex items-center gap-1 cursor-pointer"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
                <span>{lang === 'uz' ? 'Bekor qilish' : 'Отменить'}</span>
              </button>
            )}

            <button
              onClick={() => { triggerHaptic('light'); toggleExpand(order.id); }}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-150 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              title={isExpanded ? 'Yopish' : 'Batafsil'}
            >
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expanded Item Details */}
        {isExpanded && (
          <div className="pt-3 border-t border-gray-100 space-y-2 animate-fadeIn">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 text-left">
                <span className="font-semibold text-gray-800 truncate max-w-[200px]">
                  {item.title ? (item.title[lang] || item.title.uz) : 'Mahsulot'}
                </span>
                <span className="text-gray-500 font-bold shrink-0">
                  {item.quantity} x {formatPrice(item.price)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render full screen Order History SubView
  if (profileSubView === 'history') {
    return (
      <div className="p-4 pb-28 max-w-lg mx-auto space-y-4 animate-scaleUp">
        {/* History Header Controls */}
        <div className="flex justify-between items-center px-1">
          <button
            onClick={() => {
              triggerHaptic('light');
              setProfileSubView(null);
            }}
            className="text-xs font-bold text-[#3b82f6] hover:underline flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            ← {lang === 'uz' ? 'Profilga qaytish' : 'Назад в профиль'}
          </button>

          <span className="text-xs font-black text-gray-900">
            {t.ordersHistory} ({orders.length})
          </span>
        </div>

        {/* Mapped Orders list */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-150 text-center text-xs font-bold text-gray-400">
            {lang === 'uz' ? 'Buyurtmalar tarixi bo\'sh' : 'История заказов пуста'}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, visibleCount).map((order) => renderOrderCard(order))}
          </div>
        )}
      </div>
    );
  }

  // Render default Profile Tab view
  return (
    <div className="p-4 pb-28 max-w-lg mx-auto space-y-4">
      {/* Profile Card / Form */}
      {!isEditing ? (
        <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#3b82f6] text-xl font-bold shrink-0">
              {(profileUser?.name || 'Y').charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-[17px] font-extrabold text-gray-900 truncate leading-tight text-left">
                {profileUser?.name}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5 text-left">
                {profileUser?.phone}
              </p>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                setIsEditing(true);
              }}
              className="text-xs font-bold text-[#3b82f6] hover:underline transition-all shrink-0 active:scale-95 py-2 cursor-pointer"
            >
              {lang === 'uz' ? "O'zgartirish" : lang === 'ru' ? 'Изменить' : 'Change'}
            </button>
          </div>

          {telegramUser?.id === 1165441564 && (
            <>
              <div className="border-t border-gray-100 my-4"></div>
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  setIsAdminMode(true);
                }}
                className="w-full py-3 bg-[#e8f0fe] hover:bg-[#dbeafe] text-[#2563eb] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-blue-100 active:scale-[0.98] shadow-2xs cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>{lang === 'uz' ? 'Admin panelga o\'tish' : 'Перейти в админ панель'}</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 border border-gray-150 shadow-2xs space-y-4 animate-scaleUp">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] font-bold text-rose-600 text-center animate-shake">
              ⚠️ {error}
            </div>
          )}
          <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#3b82f6]" />
            <span>{lang === 'uz' ? 'Ma\'lumotlarni tahrirlash' : 'Edit profile'}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 text-left">
                {lang === 'uz' ? 'Ism' : 'Name'}
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#fcfcfd] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 text-left">
                {lang === 'uz' ? 'Telefon raqam' : 'Phone number'}
              </label>
              <input
                type="text"
                required
                placeholder="+998 ( ) xxx xx xx"
                value={editPhone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length < 6) {
                    setEditPhone('+998 (');
                    return;
                  }
                  setEditPhone(formatUzPhone(val));
                }}
                className="w-full bg-[#fcfcfd] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 text-left">
                {lang === 'uz' ? 'Manzil' : 'Default address'}
              </label>
              <textarea
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                rows={2}
                className="w-full bg-[#fcfcfd] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsEditing(false);
              }}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold text-xs text-center active:scale-95 transition-all cursor-pointer"
            >
              {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#3b82f6] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl text-center shadow-md shadow-blue-500/10 transition-all cursor-pointer"
            >
              {lang === 'uz' ? 'Saqlash' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {/* Drill-down Order History Button (Show ONLY the button on main profile) */}
      <button
        onClick={() => {
          triggerHaptic('light');
          setProfileSubView('history');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        className="w-full py-4 px-5 bg-white border border-gray-150 rounded-2xl flex items-center justify-between text-gray-900 font-bold text-[13px] hover:bg-gray-50 active:scale-[0.99] transition-all shadow-2xs cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span>{lang === 'uz' ? 'Barcha buyurtmalar tarixi' : 'All orders history'}</span>
          {orders.length > 0 && (
            <span className="bg-blue-50 text-[#3b82f6] text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-blue-100">
              {orders.length}
            </span>
          )}
        </span>
        <ChevronRightIcon className="w-4 h-4 text-[#3b82f6]" />
      </button>

      {/* Log out Button */}
      <div className="pt-1">
        <button
          onClick={() => {
            showConfirm(
              lang === 'uz' ? 'Haqiqatan ham profildan chiqmoqchimisiz?' : 'Do you really want to log out?',
              logoutUser
            );
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-md shadow-red-500/10 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <LogOutIcon className="w-4 h-4" />
          <span>{lang === 'uz' ? 'Profildan chiqish' : 'Log out'}</span>
        </button>
      </div>
    </div>
  );
};
