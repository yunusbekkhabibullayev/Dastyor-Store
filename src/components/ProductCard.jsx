import React from 'react';
import { useStore } from '../context/StoreContext';
import { HeartIcon as HeartOutline, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { ProductImage } from './ProductImage';

export const ProductCard = ({ product }) => {
  const { lang, t, addToCart, updateCartQuantity, cart, favorites, toggleFavorite, setSelectedProduct } = useStore();

  const isFavorite = favorites.includes(product.id);
  const cartItem = cart.find(item => item.id === product.id);
  const inCartCount = cartItem ? cartItem.quantity : 0;

  const formatPrice = (price) => {
    return price.toLocaleString('uz-UZ').replace(/,/g, ' ') + ' ' + (lang === 'uz' ? "so'm" : lang === 'ru' ? 'сум' : 'som');
  };

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl flex flex-col relative border border-gray-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* Product Image Area - gray background with rounded top */}
      <div
        className="relative bg-[#f5f5f7] cursor-pointer flex items-center justify-center h-44 overflow-hidden group"
        onClick={() => setSelectedProduct(product)}
      >
        {/* Discount badge top-left */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#ff3b30] text-white text-[11px] font-bold px-2 py-0.5 rounded-[6px] shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Product image - fills the entire container */}
        <ProductImage
          product={product}
          className="w-full h-full object-contain p-3 drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
        />

        {/* Favorite Heart top-right in a white circle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className="absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-gray-100/50"
          title={isFavorite ? (lang === 'uz' ? 'Saralanganlardan o\'chirish' : 'Удалить из избранного') : (lang === 'uz' ? 'Saralanganlarga qo\'shish' : 'В избранное')}
        >
          {isFavorite ? (
            <HeartSolid className="w-[18px] h-[18px] text-[#3b82f6]" />
          ) : (
            <HeartOutline className="w-[18px] h-[18px] text-gray-500" />
          )}
        </button>
      </div>

      {/* Product Info - white background */}
      <div className="px-3 pt-3 pb-3 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Title */}
          <h3
            className="font-bold text-[14px] text-gray-900 line-clamp-2 leading-tight mb-1 cursor-pointer min-h-[38px]"
            onClick={() => setSelectedProduct(product)}
          >
            {product.title[lang]}
          </h3>

          {/* Price */}
          <div className="mb-1">
            <span className="font-bold text-[16px] text-gray-900 block leading-tight">
              {formatPrice(product.price)} {product.unit ? `/ ${product.unit}` : ''}
            </span>
            {product.oldPrice && (
              <span className="text-[12px] text-gray-400 line-through block leading-tight mt-0.5">
                {formatPrice(product.oldPrice)} {product.unit ? `/ ${product.unit}` : ''}
              </span>
            )}
          </div>

          {/* Stock info */}
          <div className="mb-3">
            {(product.stock === undefined || product.stock === null || product.stock <= 0) ? (
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100/60">
                {lang === 'uz' ? 'Tugagan' : lang === 'ru' ? 'Нет в наличии' : 'Out of stock'}
              </span>
            ) : product.stock <= 3 ? (
              <span className="text-[12px] font-semibold text-[#ff9500]">
                {lang === 'uz' ? `Faqat ${product.stock} ${product.unit || 'dona'} qoldi` : lang === 'ru' ? `Осталось ${product.stock} ${product.unit === 'dona' ? 'шт' : product.unit || 'шт'}` : `Only ${product.stock} ${product.unit || 'pcs'} left`}
              </span>
            ) : (
              <span className="text-[12px] font-medium text-gray-400">
                {lang === 'uz' ? `Sotuvda bor: ${product.stock} ${product.unit || 'dona'}` : lang === 'ru' ? `В наличии: ${product.stock} ${product.unit === 'dona' ? 'шт' : product.unit || 'шт'}` : `In stock: ${product.stock} ${product.unit || 'pcs'}`}
              </span>
            )}
          </div>
        </div>

        {/* Add to cart / Counter button */}
        {(product.stock !== undefined && product.stock !== null && product.stock <= 0) ? (
          <button
            disabled
            className="w-full h-10 rounded-xl bg-gray-100 border border-gray-200 text-gray-400 font-bold text-[13px] cursor-not-allowed mt-1"
          >
            {lang === 'uz' ? 'Tugagan' : lang === 'ru' ? 'Нет в наличии' : 'Out of stock'}
          </button>
        ) : inCartCount > 0 ? (
          <div className="flex items-center justify-between h-10 w-full mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateCartQuantity(product.id, -1);
              }}
              className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 active:bg-gray-50 shadow-sm"
            >
              <MinusIcon className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center justify-center leading-tight flex-1 px-1">
              <span className="text-sm font-bold text-gray-900">{inCartCount} {product.unit || ''}</span>
              <span className="text-[9px] text-gray-400 font-medium">{lang === 'uz' ? 'savatda' : lang === 'ru' ? 'в корзине' : 'in cart'}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                updateCartQuantity(product.id, 1);
              }}
              disabled={product.stock !== undefined && product.stock !== null && inCartCount >= product.stock}
              className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 active:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-full h-10 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white font-bold text-[14px] transition-colors mt-1"
          >
            {lang === 'uz' ? 'Korzinaga' : lang === 'ru' ? 'В корзину' : 'To Cart'}
          </button>
        )}
      </div>
    </div>
  );
};
