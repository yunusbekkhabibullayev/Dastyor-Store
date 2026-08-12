import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCartIcon, TrashIcon, PlusIcon, MinusIcon, TagIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { ProductImage } from './ProductImage';

export const CartDrawer = ({ onProceedCheckout }) => {
  const {
    lang, t, cart, updateCartQuantity, removeFromCart, clearCart,
    appliedPromo, applyPromoCode, cartSubtotal, promoDiscount, cartTotal,
    triggerHaptic, setActiveTab, showConfirm
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState(null);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    triggerHaptic('light');
    if (promoInput.trim().length <= 3) return;
    const res = applyPromoCode(promoInput);
    setPromoMsg(res.success
      ? { type: 'success', text: t.promoApplied }
      : { type: 'error', text: t.promoError }
    );
  };

  const formatPrice = (price) => price.toLocaleString('uz-UZ').replace(/,/g, ' ') + ' ' + (lang === 'uz' ? "so'm" : lang === 'ru' ? 'сум' : 'som');

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        {/* Large outline cart icon, no circle background */}
        <ShoppingCartIcon className="w-20 h-20 text-gray-300 mb-6 animate-pulse" />
        <h3 className="text-[17px] font-bold text-gray-900 mb-2">{t.emptyCart}</h3>
        <p className="text-[13px] text-gray-400 max-w-[260px] leading-relaxed mb-8">{t.emptyCartDesc}</p>
        <button
          onClick={() => { triggerHaptic('light'); setActiveTab('catalog'); }}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-[14px] px-8 py-3 rounded-2xl transition-all shadow-sm active:scale-95"
        >
          {t.backToCatalogShort}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-bold text-gray-900">
          {t.cart} ({cart.reduce((s, i) => s + i.quantity, 0)})
        </h2>
        <button
          onClick={() => {
            triggerHaptic('light');
            showConfirm(
              lang === 'uz' ? 'Savatni tozalashni xohlaysizmi?' : lang === 'ru' ? 'Очистить корзину?' : 'Clear the cart?',
              clearCart
            );
          }}
          className="text-xs font-semibold text-red-500 flex items-center gap-1"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          {t.clearCart}
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-2 mb-5">
        {cart.map((item) => {
          const itemCartId = item.cartId || item.id;
          return (
            <div key={itemCartId} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-155 shadow-xs relative">
              {/* Fixed 64x64px Product Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#f5f5f7] border border-gray-100 flex items-center justify-center relative">
                <img
                  src={item.image}
                  alt={item.title[lang] || 'Product'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300';
                  }}
                />
              </div>

              {/* Right Side Column (min-h-[64px]) */}
              <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[64px] py-0.5">
                {/* Top Row: Title (2 lines clamp) & Trash delete icon (right) */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 text-left">
                    <h4
                      className="text-[13px] font-bold text-gray-900 leading-snug mb-0.5"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {item.title[lang]}
                    </h4>
                    {item.selectedVariant && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {Object.entries(item.selectedVariant).map(([k, v]) => (
                          <span key={k} className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-bold">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      showConfirm(
                        lang === 'uz' ? 'Mahsulotni savatdan o\'chirmoqchimisiz?' : lang === 'ru' ? 'Удалить товар из корзины?' : 'Remove product from cart?',
                        () => removeFromCart(itemCartId)
                      );
                    }}
                    className="text-red-500 hover:text-red-650 active:scale-90 transition-all p-0.5 shrink-0 cursor-pointer"
                    title={lang === 'uz' ? 'O\'chirish' : 'Удалить'}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Row: Price (left) & Quantity Counter (right) */}
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-[13px] font-black text-gray-900 whitespace-nowrap">{formatPrice(item.price)} {item.unit ? `/ ${item.unit}` : ''}</span>
                  
                  <div className="flex items-center gap-1 bg-[#f2f2f7] rounded-xl p-0.5 border border-gray-200/60 shrink-0">
                    <button
                      onClick={() => updateCartQuantity(itemCartId, -1)}
                      className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-gray-700 font-bold shadow-2xs hover:bg-gray-50 active:scale-90 transition-all cursor-pointer"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black px-1.5 text-gray-900 min-w-[16px] text-center">{item.quantity} {item.unit || ''}</span>
                    <button
                      onClick={() => updateCartQuantity(itemCartId, 1)}
                      className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-gray-700 font-bold shadow-2xs hover:bg-gray-50 active:scale-90 transition-all cursor-pointer"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promo */}
      <div className="bg-white rounded-xl p-3 border border-gray-100 mb-4">
        <form onSubmit={handleApplyPromo} className="flex gap-2">
          <div className="relative flex-1">
            <TagIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="QLAY2026"
              className="w-full bg-gray-50 text-xs text-gray-900 pl-8 pr-3 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 uppercase font-bold tracking-wider"
            />
          </div>
          <button 
            type="submit" 
            disabled={promoInput.trim().length <= 3}
            className={`font-semibold text-xs px-4 py-2.5 rounded-lg shrink-0 transition-colors ${
              promoInput.trim().length <= 3 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {t.applyPromo}
          </button>
        </form>
        {promoMsg && (
          <p className={`text-[11px] font-semibold mt-1.5 ${promoMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {promoMsg.text}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-2 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{t.totalPrice}</span>
          <span className="font-bold text-gray-900">{formatPrice(cartSubtotal)}</span>
        </div>
        {appliedPromo && (
          <div className="flex justify-between text-sm text-green-600 font-semibold">
            <span>{t.promoCode} (-{appliedPromo.discountPercent}%)</span>
            <span>-{formatPrice(promoDiscount)}</span>
          </div>
        )}
        <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
          <span className="text-sm font-bold text-gray-900">{t.totalPrice}</span>
          <span className="text-lg font-bold text-blue-600">{formatPrice(cartTotal)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={() => { triggerHaptic('heavy'); onProceedCheckout(); }}
        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <span>{t.checkout}</span>
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
