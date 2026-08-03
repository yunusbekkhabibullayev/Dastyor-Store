import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  SparklesIcon, 
  ClockIcon, 
  ArrowRightIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export const AdminDashboard = () => {
  const { lang, telegramUser, setAdminTab, triggerHaptic, getAdminHeaders, setSelectedAdminOrder } = useStore();
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    totalCategories: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const translations = {
    uz: {
      todayOrders: 'Bugungi buyurtmalar',
      todayRevenue: 'Bugungi tushum',
      totalProducts: 'Jami tovarlar',
      pendingOrders: 'Kutilayotganlar',
      recentOrders: 'Oxirgi buyurtmalar',
      totalRevenue: 'Jami tushum',
      categoriesCount: 'Kategoriyalar',
      viewAll: 'Barchasini ko\'rish',
      noOrders: 'Buyurtmalar hali mavjud emas',
      orderNum: '#',
      customer: 'Mijoz',
      amount: 'Summa',
      status: 'Holati',
      date: 'Sana',
      currency: 'so\'m',
      processing: 'Tayyorlanmoqda',
      shipping: 'Yo\'lda',
      delivered: 'Yetkazib berildi',
      cancelled: 'Bekor qilingan',
      orderDetails: 'Buyurtma tafsilotlari',
      address: 'Yetkazib berish manzili',
      payment: 'To\'lov turi',
      items: 'Mahsulotlar',
      viewOnMap: 'Xaritada ko\'rish',
      close: 'Yopish',
      actions: 'Amallar'
    },
    ru: {
      todayOrders: 'Сегодняшние заказы',
      todayRevenue: 'Выручка за сегодня',
      totalProducts: 'Всего товаров',
      pendingOrders: 'В ожидании',
      recentOrders: 'Последние заказы',
      totalRevenue: 'Общая выручка',
      categoriesCount: 'Категории',
      viewAll: 'Посмотреть все',
      noOrders: 'Заказов пока нет',
      orderNum: '#',
      customer: 'Клиент',
      amount: 'Сумма',
      status: 'Статус',
      date: 'Дата',
      currency: 'сум',
      processing: 'Готовится',
      shipping: 'В пути',
      delivered: 'Доставлено',
      cancelled: 'Отменено',
      orderDetails: 'Детали заказа',
      address: 'Адрес доставки',
      payment: 'Способ оплаты',
      items: 'Товары',
      viewOnMap: 'На карте',
      close: 'Закрыть',
      actions: 'Действия'
    }
  };

  const t = translations[lang] || translations.uz;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const statsRes = await fetch('/api/admin/stats', { headers: getAdminHeaders() });
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);

        const ordersRes = await fetch('/api/admin/orders', { headers: getAdminHeaders() });
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setRecentOrders(ordersData.orders.slice(0, 5));
        }
      } catch (err) {
        console.warn('Dashboard loading failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [telegramUser]);

  const handleOpenDetails = (order) => {
    triggerHaptic('light');
    setSelectedAdminOrder(order);
    setAdminTab('order-details');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const statusStyles = {
    processing: 'bg-amber-50 text-amber-600 border-amber-100',
    shipping: 'bg-blue-50 text-blue-600 border-blue-100',
    delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-3 text-xs font-semibold text-gray-500">Yuklanmoqda...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: t.todayOrders,
      value: stats.todayOrders,
      icon: ShoppingBagIcon,
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      title: t.todayRevenue,
      value: `${formatPrice(stats.todayRevenue)} ${t.currency}`,
      icon: CurrencyDollarIcon,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      footer: `${t.totalRevenue}: ${formatPrice(stats.totalRevenue)} ${t.currency}`
    },
    {
      title: t.totalProducts,
      value: stats.totalProducts,
      icon: SparklesIcon,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      footer: `${t.categoriesCount}: ${stats.totalCategories}`
    },
    {
      title: t.pendingOrders,
      value: stats.pendingOrders,
      icon: ClockIcon,
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    }
  ];

  // Map coordinates logic
  let mapLink = null;
  if (selectedOrder && selectedOrder.address && selectedOrder.address.includes('koord:')) {
    const coords = selectedOrder.address.split('koord:')[1].trim().split(',');
    if (coords.length === 2) {
      mapLink = `https://www.google.com/maps/search/?api=1&query=${coords[0].trim()},${coords[1].trim()}`;
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.title}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
              </div>
              <div className="mt-4 text-left">
                <span className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                  {card.value}
                </span>
                {card.footer && (
                  <p className="text-[10px] text-gray-400 font-semibold mt-1.5 border-t pt-1.5 border-gray-100">
                    {card.footer}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Card */}
      <div className="bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">{t.recentOrders}</h3>
          </div>
          <button 
            onClick={() => {
              triggerHaptic('light');
              setAdminTab('orders');
            }}
            className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors"
          >
            <span>{t.viewAll}</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-5">{t.orderNum}</th>
                  <th className="py-3 px-5">{t.customer}</th>
                  <th className="py-3 px-5">{t.amount}</th>
                  <th className="py-3 px-5">{t.status}</th>
                  <th className="py-3 px-5">{t.date}</th>
                  <th className="py-3 px-5 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-750">
                {recentOrders.map((order) => {
                  const numId = order.id.replace('ORD-', '');
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-5 font-bold text-gray-900">#{numId}</td>
                      <td className="py-3 px-5">
                        <span className="font-bold text-gray-900 truncate max-w-[150px] block whitespace-nowrap">
                          {order.name}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-bold text-gray-950">
                        {formatPrice(order.total_amount)} {t.currency}
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyles[order.status] || ''}`}>
                          {t[order.status]}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-gray-400 font-semibold">{order.created_at}</td>
                      <td className="py-3 px-5 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(order);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <ShoppingBagIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-xs font-semibold">{t.noOrders}</p>
          </div>
        )}
      </div>

      {/* Detailed Order Modal */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-xl animate-scaleUp">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-black text-gray-955 text-sm sm:text-base">
                {t.orderDetails} #{selectedOrder.id.replace('ORD-', '')}
              </h3>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-655 transition-all"
              >
                <XMarkIcon className="w-5 h-5 shrink-0" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              {/* Customer summary */}
              <div>
                <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block mb-1">
                  {t.customer}
                </span>
                <div className="flex flex-col font-semibold text-xs text-gray-800">
                  <span className="font-extrabold text-sm text-gray-900">{selectedOrder.name}</span>
                  <span className="text-gray-505 mt-0.5">{selectedOrder.phone}</span>
                </div>
              </div>

              {/* Status and date */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-455 uppercase tracking-wider block mb-1">
                    {t.status}
                  </span>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyles[selectedOrder.status] || ''}`}>
                    {t[selectedOrder.status]}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-455 uppercase tracking-wider block mb-1">
                    {t.date}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{selectedOrder.created_at}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="border-t border-gray-100 pt-3">
                <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block mb-1">
                  {t.address}
                </span>
                <div className="flex items-start gap-1.5 text-xs font-semibold text-gray-800">
                  <MapPinIcon className="w-4 h-4 text-gray-505 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="leading-relaxed">{selectedOrder.address}</p>
                    {mapLink && (
                      <a 
                        href={mapLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-blue-600 hover:underline"
                      >
                        <span>{t.viewOnMap}</span>
                        <ExternalLinkIcon className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-t border-gray-100 pt-3">
                <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block mb-1">
                  {t.payment}
                </span>
                <p className="text-xs font-semibold text-gray-800">{selectedOrder.payment_method}</p>
              </div>

              {/* Items List */}
              <div className="border-t border-gray-100 pt-3">
                <span className="text-[10px] font-bold text-gray-455 uppercase tracking-wider block mb-1.5">
                  {t.items}
                </span>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-b-0">
                      <span className="font-semibold text-gray-800">{item.title_uz || item.title_ru || 'Mahsulot'}</span>
                      <span className="font-extrabold text-gray-900 whitespace-nowrap">
                        {item.quantity} x {formatPrice(item.price)} {t.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-gray-150 pt-3 flex items-center justify-between font-black text-sm text-gray-950 shrink-0">
                <span>{t.totalPrice}:</span>
                <span>{formatPrice(selectedOrder.total_amount)} {t.currency}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 text-right shrink-0">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-gray-250 hover:bg-gray-300 font-bold rounded-xl text-xs text-gray-800 transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
