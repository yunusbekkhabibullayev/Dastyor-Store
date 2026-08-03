import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShoppingBagIcon, 
  MagnifyingGlassIcon as SearchIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  TruckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon as RefreshCwIcon,
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { AdminPagination } from './AdminPagination';

export const AdminOrders = () => {
  const { lang, telegramUser, triggerHaptic, getAdminHeaders } = useStore();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus]);

  const translations = {
    uz: {
      searchPlaceholder: 'Mijoz ismi, buyurtma ID yoki telefon...',
      allOrders: 'Barcha buyurtmalar',
      customer: 'Xaridor',
      address: 'Manzil',
      payment: 'To\'lov turi',
      amount: 'Jami summa',
      status: 'Holati',
      date: 'Sana',
      items: 'Mahsulotlar',
      qty: 'soni',
      price: 'Narx',
      changeStatus: 'Statusni o\'zgartirish',
      currency: 'so\'m',
      empty: 'Buyurtmalar topilmadi',
      processing: 'Tayyorlanmoqda ⏳',
      shipping: 'Yo\'lda 🚚',
      delivered: 'Yetkazib berildi ✅',
      cancelled: 'Bekor qilindi ❌',
      processingAction: 'Tayyorlash',
      shippingAction: 'Yo\'lga chiqarish',
      deliveredAction: 'Yetkazish',
      cancelledAction: 'Bekor qilish',
      viewOnMap: 'Xaritada ko\'rish'
    },
    ru: {
      searchPlaceholder: 'Имя клиента, ID заказа или телефон...',
      allOrders: 'Все заказы',
      customer: 'Покупатель',
      address: 'Адрес',
      payment: 'Тип оплаты',
      amount: 'Итоговая сумма',
      status: 'Статус',
      date: 'Дата',
      items: 'Товары',
      qty: 'кол-во',
      price: 'Цена',
      changeStatus: 'Изменить статус',
      currency: 'сум',
      empty: 'Заказы не найдены',
      processing: 'Готовится ⏳',
      shipping: 'В пути 🚚',
      delivered: 'Доставлено ✅',
      cancelled: 'Отменено ❌',
      processingAction: 'В готовку',
      shippingAction: 'В путь',
      deliveredAction: 'Доставить',
      cancelledAction: 'Отменить',
      viewOnMap: 'На карте'
    }
  };

  const t = translations[lang] || translations.uz;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.warn('Orders fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [telegramUser]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    triggerHaptic('medium');
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        // Update state locally
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.warn('Status update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  const handleApplyFilter = () => {
    triggerHaptic('medium');
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    triggerHaptic('light');
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus, appliedStartDate, appliedEndDate, orders.length]);

  const toggleExpand = (orderId) => {
    triggerHaptic('light');
    setExpandedOrder(prev => prev === orderId ? null : orderId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  // Filter orders by search query, status, and date range (ONLY applies when Filterlash button is clicked)
  const filteredOrders = orders.filter(order => {
    const numId = order.id.replace('ORD-', '');
    const matchesSearch = (
      order.name.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search) ||
      numId.includes(search) ||
      order.address.toLowerCase().includes(search.toLowerCase())
    );
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    let matchesDate = true;

    if (appliedStartDate || appliedEndDate) {
      const rawDate = order.created_at || order.date || '';
      
      const parseToISOString = (val) => {
        if (!val) return '';
        // Check if YYYY-MM-DD (optionally followed by time/T)
        if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
          return val.substring(0, 10);
        }
        // Check if DD.MM.YYYY or YYYY.MM.DD
        if (val.includes('.')) {
          const clean = val.split(' ')[0];
          const parts = clean.split('.');
          if (parts[0].length === 4) { // YYYY.MM.DD
            return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          }
          if (parts[2]?.length === 4) { // DD.MM.YYYY
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        // Check if DD-MM-YYYY
        if (val.includes('-')) {
          const clean = val.split(' ')[0];
          const parts = clean.split('-');
          if (parts[2]?.length === 4) { // DD-MM-YYYY
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        // Fallback to standard new Date() parsing
        try {
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
          }
        } catch (e) {}
        return '';
      };

      const orderDateStr = parseToISOString(rawDate);

      if (orderDateStr) {
        if (appliedStartDate && orderDateStr < appliedStartDate) matchesDate = false;
        if (appliedEndDate && orderDateStr > appliedEndDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusStyles = {
    processing: 'bg-amber-50 text-amber-600 border-amber-100',
    shipping: 'bg-blue-50 text-blue-600 border-blue-100',
    delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-3 text-xs font-semibold text-gray-500">Yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters and Actions Row */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative w-full">
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        {/* Date Filter Bar with explicit labels & high-contrast mobile styling */}
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
            {lang === 'uz' ? 'Sana bo\'yicha saralash:' : 'Фильтр по дате:'}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
            <div className="flex-1 text-left">
              <label className="block text-[10px] font-extrabold text-slate-600 mb-1">
                {lang === 'uz' ? 'Dan (sana):' : 'С (дата):'}
              </label>
              <div className="relative flex items-center">
                <input
                  type={startDate ? "date" : "text"}
                  placeholder="mm/dd/yyyy"
                  value={startDate}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  onChange={(e) => {
                    triggerHaptic("light");
                    setStartDate(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-500 placeholder:font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer shadow-2xs min-h-[42px]"
                />
                <CalendarIcon className="w-4 h-4 text-slate-500 absolute right-3 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 text-left">
              <label className="block text-[10px] font-extrabold text-slate-600 mb-1">
                {lang === 'uz' ? 'Gacha (sana):' : 'По (дата):'}
              </label>
              <div className="relative flex items-center">
                <input
                  type={endDate ? "date" : "text"}
                  placeholder="mm/dd/yyyy"
                  value={endDate}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  onChange={(e) => {
                    triggerHaptic("light");
                    setEndDate(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-500 placeholder:font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer shadow-2xs min-h-[42px]"
                />
                <CalendarIcon className="w-4 h-4 text-slate-500 absolute right-3 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <button
                type="button"
                onClick={handleApplyFilter}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
              >
                <FunnelIcon className="w-3.5 h-3.5" />
                <span>{lang === 'uz' ? 'Filterlash' : 'Фильтровать'}</span>
              </button>

              {(startDate || endDate || appliedStartDate || appliedEndDate) && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-lg border border-rose-100 transition-colors shrink-0 cursor-pointer"
                >
                  {lang === 'uz' ? 'Tozalash' : 'Сбросить'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 border border-gray-150 rounded-xl shadow-xs overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: lang === 'uz' ? 'Barchasi' : 'Все' },
            { id: 'processing', label: t.processing },
            { id: 'shipping', label: t.shipping },
            { id: 'delivered', label: t.delivered },
            { id: 'cancelled', label: t.cancelled }
          ].map(st => (
            <button
              key={st.id}
              type="button"
              onClick={() => { triggerHaptic('light'); setSelectedStatus(st.id); }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap active:scale-95 ${
                selectedStatus === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <>
          <div className="space-y-3">
          {paginatedOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const numId = order.id.replace('ORD-', '');
            const isUpdating = updatingId === order.id;

            // Generate map link from address coordinates if present
            let mapLink = null;
            if (order.address.includes('koord:')) {
              const coords = order.address.split('koord:')[1].trim().split(',');
              if (coords.length === 2) {
                mapLink = `https://www.google.com/maps/search/?api=1&query=${coords[0].trim()},${coords[1].trim()}`;
              }
            }

            return (
              <div 
                key={order.id}
                className="bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Order Header Summary */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-gray-900">#{numId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusStyles[order.status] || ''}`}>
                        {t[order.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 font-semibold">
                      <span className="font-bold text-gray-800">{order.name}</span>
                      <span>•</span>
                      <span>{order.phone}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><CalendarIcon className="w-3 h-3" /> {order.created_at}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-gray-900 whitespace-nowrap">
                      {formatPrice(order.total_amount)} {t.currency}
                    </span>
                    {isExpanded ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50/30 pt-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Left side info */}
                      <div className="space-y-4">
                        {/* Delivery Address */}
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            {t.address}
                          </span>
                          <div className="flex items-start gap-1.5">
                            <MapPinIcon className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-850 leading-relaxed">
                                {order.address}
                              </p>
                              {mapLink && (
                                <a 
                                  href={mapLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  <span>{t.viewOnMap}</span>
                                  <ExternalLinkIcon className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            {t.payment}
                          </span>
                          <p className="text-xs font-semibold text-gray-800">{order.payment_method}</p>
                        </div>

                        {/* Order Items */}
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                            {t.items}
                          </span>
                          <div className="space-y-2">
                            {order.items && order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center gap-2">
                                  {item.image && (
                                    <img 
                                      src={item.image} 
                                      alt="" 
                                      className="w-7 h-7 object-cover rounded-md border border-gray-100 shrink-0"
                                      onError={(e) => { e.target.src = '/images/skincare_banner.png'; }}
                                    />
                                  )}
                                  <span className="font-semibold text-gray-800">
                                    {item.title_uz || item.title_ru || 'Mahsulot'}
                                  </span>
                                </div>
                                <span className="font-bold text-gray-800 whitespace-nowrap">
                                  {item.quantity} x {formatPrice(item.price)} {t.currency}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right side status actions */}
                      <div className="bg-white border border-gray-150 p-4 rounded-2xl flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 mb-3">{t.changeStatus}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {/* Processing button */}
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'processing')}
                              disabled={isUpdating || order.status === 'processing'}
                              className={`
                                flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold border transition-all duration-200
                                ${order.status === 'processing'
                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 active:scale-95'}
                              `}
                            >
                              <ClockIcon className="w-3.5 h-3.5" />
                              <span>{t.processingAction}</span>
                            </button>

                            {/* Shipping button */}
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'shipping')}
                              disabled={isUpdating || order.status === 'shipping'}
                              className={`
                                flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold border transition-all duration-200
                                ${order.status === 'shipping'
                                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 active:scale-95'}
                              `}
                            >
                              <TruckIcon className="w-3.5 h-3.5" />
                              <span>{t.shippingAction}</span>
                            </button>

                            {/* Delivered button */}
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              disabled={isUpdating || order.status === 'delivered'}
                              className={`
                                flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold border transition-all duration-200
                                ${order.status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 active:scale-95'}
                              `}
                            >
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              <span>{t.deliveredAction}</span>
                            </button>

                            {/* Cancelled button */}
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              disabled={isUpdating || order.status === 'cancelled'}
                              className={`
                                flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold border transition-all duration-200
                                ${order.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 active:scale-95'}
                              `}
                            >
                              <XCircleIcon className="w-3.5 h-3.5" />
                              <span>{t.cancelledAction}</span>
                            </button>
                          </div>
                        </div>

                        {isUpdating && (
                          <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-bold text-gray-400">
                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Yangilanmoqda...</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          triggerHaptic={triggerHaptic}
        />
        </>
      ) : (
        <div className="py-16 text-center bg-white border border-gray-150 rounded-2xl shadow-xs">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <ShoppingBagIcon className="w-10 h-10 text-gray-300 animate-pulse" />
          </div>
          <p className="text-sm font-bold text-gray-600 mb-1">{t.empty}</p>
          <p className="text-[11px] text-gray-400 font-medium max-w-xs mx-auto">
            {lang === 'uz'
              ? 'Ushbu filterlar bo\'yicha buyurtmalar topilmadi. Boshqa filter yoki qidiruv so\'zini sinab ko\'ring.'
              : 'По данным фильтрам заказы не найдены. Попробуйте другой фильтр или поиск.'}
          </p>
          {(search || selectedStatus !== 'all' || appliedStartDate || appliedEndDate) && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSearch('');
                setSelectedStatus('all');
                setStartDate('');
                setEndDate('');
                setAppliedStartDate('');
                setAppliedEndDate('');
              }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 rounded-xl text-xs font-bold transition-all border border-blue-100 cursor-pointer"
            >
              {lang === 'uz' ? 'Barcha filterlarni tozalash' : 'Сбросить все фильтры'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
