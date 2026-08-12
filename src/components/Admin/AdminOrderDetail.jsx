import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ArrowLeftIcon, 
  PhoneIcon, 
  ClockIcon, 
  PaperAirplaneIcon as SendIcon,
  ArrowPathIcon as Loader2Icon
} from '@heroicons/react/24/outline';

export const AdminOrderDetail = () => {
  const { lang, selectedAdminOrder, setAdminTab, triggerHaptic, getAdminHeaders } = useStore();
  const [updating, setUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [order, setOrder] = useState(selectedAdminOrder);

  if (!order) return null;

  const translations = {
    uz: {
      back: 'Orqaga',
      orderDetails: 'Buyurtma tafsilotlari',
      subtotal: 'Oraliq jami',
      delivery: 'Yetkazib berish',
      total: 'Jami',
      currency: 'so\'m',
      info: 'Ma\'lumotlar',
      phone: 'Telefon',
      date: 'Sana',
      status: 'Status',
      telegramStatusNotify: 'Status o\'zgarganda Telegram orqali xabar yuboriladi',
      processing: 'Tayyorlanmoqda',
      shipping: 'Yo\'lda',
      delivered: 'Yetkazib berildi',
      cancelled: 'Bekor qilindi',
      processingAction: 'Kutilmoqda',
      shippingAction: 'Yo\'lda',
      deliveredAction: 'Yetkazildi',
      cancelledAction: 'Bekor qilindi'
    },
    ru: {
      back: 'Назад',
      orderDetails: 'Детали заказа',
      subtotal: 'Подитог',
      delivery: 'Доставка',
      total: 'Итого',
      currency: 'сум',
      info: 'Информация',
      phone: 'Телефон',
      date: 'Дата',
      status: 'Статус',
      telegramStatusNotify: 'При изменении статуса будет отправлено сообщение в Telegram',
      processing: 'Готовится',
      shipping: 'В пути',
      delivered: 'Доставлено',
      cancelled: 'Отменено',
      processingAction: 'В ожидании',
      shippingAction: 'В пути',
      deliveredAction: 'Доставить',
      cancelledAction: 'Отменить'
    }
  };

  const t = translations[lang] || translations.uz;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const statusStyles = {
    processing: 'bg-amber-50 text-amber-600 border-amber-100',
    shipping: 'bg-blue-50 text-blue-600 border-blue-100',
    delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  const handleUpdateStatus = async (newStatus) => {
    triggerHaptic('medium');
    setUpdating(true);
    setUpdatingStatus(newStatus);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.warn('Status update failed:', err);
    } finally {
      setUpdating(false);
      setUpdatingStatus(null);
    }
  };

  const statuses = [
    { value: 'processing', label: t.processingAction },
    { value: 'shipping', label: t.shippingAction },
    { value: 'delivered', label: t.deliveredAction },
    { value: 'cancelled', label: t.cancelledAction }
  ];

  return (
    <div className="space-y-6 text-left">
      <button 
        onClick={() => {
          triggerHaptic('light');
          setAdminTab('dashboard');
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>{t.back}</span>
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Order Details / Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-155 rounded-2xl shadow-xs overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
              {t.orderDetails} #{order.id.replace('ORD-', '')}
            </h3>

            <div className="space-y-4">
              {order.items && order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center text-xl">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : '🍽️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">
                      {item.title_uz || item.title_ru || item.title || 'Mahsulot'}
                    </p>
                    <p className="text-xs text-gray-400 font-semibold mt-1">
                      {formatPrice(item.price)} {t.currency} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-sm">
                      {formatPrice(item.price * item.quantity)} {t.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-150 text-xs font-semibold text-gray-600">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span>{formatPrice(order.total_amount)} {t.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.delivery}</span>
                <span>{formatPrice(15000)} {t.currency}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-gray-955 pt-2 border-t border-gray-100">
                <span>{t.total}</span>
                <span className="text-orange-500">{formatPrice(order.total_amount + 15000)} {t.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Info & Status */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-white border border-gray-155 rounded-2xl shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
              {t.info}
            </h3>

            <a href={`tel:${order.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 shrink-0">
                <PhoneIcon className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.phone}</p>
                <p className="text-xs font-bold text-blue-600 mt-0.5 hover:underline">{order.phone}</p>
              </div>
            </a>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 shrink-0">
                <ClockIcon className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.date}</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">{order.created_at}</p>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white border border-gray-155 rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-gray-900 text-sm">{t.status}</h3>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyles[order.status] || ''}`}>
                {t[order.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleUpdateStatus(s.value)}
                  disabled={updating || order.status === s.value}
                  className={`
                    py-2 px-3 rounded-xl text-[11px] font-bold border transition-all duration-200 flex items-center justify-center gap-1.5
                    ${order.status === s.value 
                      ? 'bg-blue-600 text-white border-transparent' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 active:scale-95 disabled:opacity-50'}
                  `}
                >
                  {updatingStatus === s.value && <Loader2Icon className="w-3.5 h-3.5 animate-spin" />}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl text-blue-900 text-[11px] font-semibold leading-relaxed">
              <SendIcon className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <span>{t.telegramStatusNotify}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
