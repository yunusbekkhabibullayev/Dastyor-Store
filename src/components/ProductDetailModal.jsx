import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeftIcon, ShareIcon, MinusIcon, PlusIcon, HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { ProductImage } from './ProductImage';

export const ProductDetailModal = () => {
  const { lang, t, selectedProduct, setSelectedProduct, addToCart, updateCartQuantity, cart, favorites, toggleFavorite, triggerHaptic, products } = useStore();

  const [selectedOptions, setSelectedOptions] = useState({});
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Parse sizes and colors dynamically from attributes or fall back to defaults
  const prodAttrs = selectedProduct?.attributes || {};
  let attrs = selectedProduct?.attributes;
  if (attrs && typeof attrs === 'string') {
    try { attrs = JSON.parse(attrs); } catch (e) {}
  }
  
  let parsedSizes = [];
  if (prodAttrs.sizes) {
    parsedSizes = typeof prodAttrs.sizes === 'string'
      ? prodAttrs.sizes.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(prodAttrs.sizes) ? prodAttrs.sizes : []);
  }

  let parsedColors = [];
  if (prodAttrs.colors) {
    parsedColors = typeof prodAttrs.colors === 'string'
      ? prodAttrs.colors.split(',').map(c => c.trim()).filter(Boolean)
      : (Array.isArray(prodAttrs.colors) ? prodAttrs.colors : []);
  }

  const isShoes = selectedProduct?.id === 'p10' ||
                  selectedProduct?.title[lang]?.toLowerCase().includes('krossovki') ||
                  selectedProduct?.title[lang]?.toLowerCase().includes('poyafzali') ||
                  selectedProduct?.title[lang]?.toLowerCase().includes('кроссовки');
                  
  const isClothing = selectedProduct?.categoryId === 'men' || selectedProduct?.categoryId === 'women';

  const sizes = parsedSizes.length > 0
    ? parsedSizes
    : (isShoes ? ['38', '39', '40', '41', '42'] : (isClothing ? ['XS', 'S', 'M', 'L', 'XL', 'XXL'] : []));

  const colors = parsedColors.length > 0
    ? parsedColors
    : (isClothing ? ['Qora', 'Oq', 'Ko\'k'] : []);

  let productVariants = [];
  if (attrs && attrs.variants && attrs.variants.length > 0) {
    productVariants = attrs.variants;
  } else {
    if (sizes.length > 0) {
      productVariants.push({ name: lang === 'uz' ? "O'lcham" : 'Размер', options: sizes });
    }
    if (colors.length > 0) {
      productVariants.push({ name: lang === 'uz' ? "Rangi" : 'Цвет', options: colors });
    }
  }

  useEffect(() => {
    if (selectedProduct) {
      setIsDescExpanded(false);
      if (productVariants.length > 0) {
        const initial = {};
        productVariants.forEach(v => {
          initial[v.name] = v.options && v.options.length > 0 ? v.options[0] : '';
        });
        setSelectedOptions(initial);
      } else {
        setSelectedOptions({});
      }
    }
  }, [selectedProduct?.id, lang]);

  if (!selectedProduct) return null;

  // Compute overrides dynamically
  let currentPrice = selectedProduct.price;
  let currentOldPrice = selectedProduct.oldPrice || selectedProduct.old_price;
  let currentStock = selectedProduct.stock;
  let selectedCombination = null;

  if (attrs && attrs.variants && attrs.variants.length > 0 && attrs.combinations) {
    selectedCombination = attrs.combinations.find(comb => {
      return attrs.variants.every(v => comb.values[v.name] === selectedOptions[v.name]);
    });
    
    if (selectedCombination) {
      if (selectedCombination.price !== undefined && selectedCombination.price !== null && selectedCombination.price !== '') {
        currentPrice = parseInt(selectedCombination.price, 10);
      }
      if (selectedCombination.old_price !== undefined && selectedCombination.old_price !== null && selectedCombination.old_price !== '') {
        currentOldPrice = parseInt(selectedCombination.old_price, 10);
      } else {
        currentOldPrice = null;
      }
      if (selectedCombination.stock !== undefined && selectedCombination.stock !== null && selectedCombination.stock !== '') {
        currentStock = parseInt(selectedCombination.stock, 10);
      }
    }
  }

  const currentCartId = selectedProduct.id + (Object.keys(selectedOptions).length > 0
    ? '-' + Object.entries(selectedOptions).map(([k,v]) => `${k}:${v}`).sort().join(',')
    : '');

  const productWithVariant = {
    ...selectedProduct,
    price: currentPrice,
    oldPrice: currentOldPrice,
    stock: currentStock,
    selectedVariant: Object.keys(selectedOptions).length > 0 ? selectedOptions : null,
    cartId: currentCartId
  };

  const isFavorite = favorites.includes(selectedProduct.id);
  const cartItem = cart.find(item => (item.cartId || item.id) === currentCartId);
  const inCartCount = cartItem ? cartItem.quantity : 0;

  const formatPrice = (price) => price.toLocaleString('uz-UZ').replace(/,/g, ' ') + ' ' + (lang === 'uz' ? "so'm" : lang === 'ru' ? 'сум' : 'som');

  const discountPercent = currentOldPrice
    ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
    : 0;

  const benefit = currentOldPrice
    ? currentOldPrice - currentPrice
    : 0;

  // Recommendations: products from the same category (excluding current)
  const recommendations = products.filter(p => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id);

  const handleRecommendClick = (prod) => {
    triggerHaptic('light');
    setSelectedProduct(prod);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fadeIn"
      onClick={() => setSelectedProduct(null)}
    >
      <div
        className="bg-[#f5f5f7] w-full max-w-lg rounded-t-[24px] max-h-[92vh] flex flex-col relative overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Floating Circular Header Buttons - Overlay on Image */}
        <div className="sticky top-0 z-30 px-4 pt-3.5 pb-2 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/25 via-black/5 to-transparent shrink-0">
          {/* Back/Close Circular Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setSelectedProduct(null);
            }}
            className="pointer-events-auto w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-gray-800 shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all"
            title={lang === 'uz' ? 'Yopish' : 'Закрыть'}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          {/* Drag handle */}
          <div className="w-12 h-1.5 rounded-full bg-gray-300/80 backdrop-blur-xs shadow-2xs pointer-events-auto" />

          {/* Action buttons: Share & Favorite Circular Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => {
                triggerHaptic('light');
                const baseUrl = window.location.origin + window.location.pathname;
                const shareUrl = `${baseUrl}?product=${selectedProduct.id}`;
                const shareText = `🛒 *${selectedProduct.title[lang]}*\n\n${selectedProduct.description[lang]}`;
                const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

                const fallbackCopy = (text) => {
                  const textarea = document.createElement('textarea');
                  textarea.value = text;
                  textarea.style.position = 'fixed';
                  textarea.style.opacity = '0';
                  document.body.appendChild(textarea);
                  textarea.select();
                  try {
                    document.execCommand('copy');
                    alert(lang === 'uz' ? 'Mahsulot havolasi nusxalandi!' : lang === 'ru' ? 'Ссылка на товар скопирована!' : 'Product link copied!');
                  } catch (err) {
                    console.error('Could not copy text: ', err);
                  }
                  document.body.removeChild(textarea);
                };

                const copyToClipboard = () => {
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      alert(lang === 'uz' ? 'Mahsulot havolasi nusxalandi!' : lang === 'ru' ? 'Ссылка на товар скопирована!' : 'Product link copied!');
                    }).catch(() => fallbackCopy(shareUrl));
                  } else {
                    fallbackCopy(shareUrl);
                  }
                };

                if (window.Telegram?.WebApp) {
                  const tg = window.Telegram.WebApp;
                  tg.showPopup({
                    title: lang === 'uz' ? 'Mahsulotni ulashish' : lang === 'ru' ? 'Поделиться товаром' : 'Share Product',
                    message: lang === 'uz' ? 'Ulashish usulini tanlang:' : lang === 'ru' ? 'Выберите способ отправки:' : 'Choose a sharing method:',
                    buttons: [
                      { id: 'btn_share', type: 'default', text: lang === 'uz' ? 'Telegram orqali yuborish' : lang === 'ru' ? 'Отправить через Telegram' : 'Share via Telegram' },
                      { id: 'btn_copy', type: 'default', text: lang === 'uz' ? 'Havolani nusxalash' : lang === 'ru' ? 'Копировать ссылку' : 'Copy Link' },
                      { id: 'btn_cancel', type: 'cancel', text: lang === 'uz' ? 'Bekor qilish' : lang === 'ru' ? 'Отмена' : 'Cancel' }
                    ]
                  }, function(buttonId) {
                    if (buttonId === 'btn_share') {
                      tg.openTelegramLink(telegramShareUrl);
                    } else if (buttonId === 'btn_copy') {
                      copyToClipboard();
                    }
                  });
                } else {
                  copyToClipboard();
                }
              }}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-gray-800 shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all"
              title={lang === 'uz' ? 'Ulashish' : 'Поделиться'}
            >
              <ShareIcon className="w-[18px] h-[18px]" />
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                toggleFavorite(selectedProduct.id);
              }}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all"
            >
              {isFavorite ? (
                <HeartSolid className="w-[18px] h-[18px] text-[#3b82f6]" />
              ) : (
                <HeartOutline className="w-[18px] h-[18px] text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Content body */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10 mt-[-56px]">
          {/* 1. Large Image Canvas - Aspect square, full bleed */}
          <div className="relative w-full aspect-square bg-[#f5f5f7] overflow-hidden flex items-center justify-center">
            {discountPercent > 0 && (
              <span className="absolute top-[64px] left-4 bg-[#ff3b30] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm z-10">
                -{discountPercent}%
              </span>
            )}
            <ProductImage
              product={selectedProduct}
              className="w-full h-full object-cover"
              containerClassName="w-full h-full flex items-center justify-center bg-[#f5f5f7]"
            />
          </div>

          {/* 2. Selection Row (right below the image) */}
          <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-center">
            {currentStock <= 0 ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-400 font-bold text-[15px] cursor-not-allowed"
              >
                {productVariants.length > 0 ? (
                  Object.keys(selectedOptions).some(k => k.toLowerCase().includes('o\'lcham') || k.toLowerCase().includes('size') || k.toLowerCase().includes('razmer'))
                    ? (lang === 'uz' ? 'Ushbu o\'lcham tugagan' : lang === 'ru' ? 'Данный размер закончился' : 'This size is out of stock')
                    : (lang === 'uz' ? 'Bu variant tugagan' : lang === 'ru' ? 'Данный вариант закончился' : 'This option is out of stock')
                ) : (
                  lang === 'uz' ? 'Tugagan' : lang === 'ru' ? 'Нет в наличии' : 'Out of stock'
                )}
              </button>
            ) : inCartCount > 0 ? (
              <div className="flex items-center gap-6">
                <button
                  onClick={() => updateCartQuantity(currentCartId, -1)}
                  className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm active:bg-gray-50"
                >
                  <MinusIcon className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center justify-center leading-tight min-w-[70px]">
                  <span className="text-[17px] font-bold text-gray-900">{inCartCount} {selectedProduct.unit || ''}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{lang === 'uz' ? 'savatda' : lang === 'ru' ? 'в корзине' : 'in cart'}</span>
                </div>
                <button
                  onClick={() => updateCartQuantity(currentCartId, 1)}
                  disabled={inCartCount >= currentStock}
                  className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm active:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(productWithVariant)}
                className="w-full py-3 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white font-bold text-[15px] transition-colors"
              >
                {lang === 'uz' ? 'Korzinaga' : lang === 'ru' ? 'В корзину' : 'To Cart'}
              </button>
            )}
          </div>

          {/* 3. Product Info Card */}
          <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            {/* Price & Stock info row */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col text-left">
                <span className="text-[22px] font-extrabold text-[#3b82f6]">
                  {formatPrice(currentPrice)} {selectedProduct.unit ? `/ ${selectedProduct.unit}` : ''}
                </span>
                {currentOldPrice && (
                  <span className="text-[14px] text-gray-400 line-through mt-0.5">
                    {formatPrice(currentOldPrice)} {selectedProduct.unit ? `/ ${selectedProduct.unit}` : ''}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end text-right">
                {(currentStock === undefined || currentStock === null || currentStock <= 0) ? (
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                    {lang === 'uz' ? 'Tugagan' : lang === 'ru' ? 'Нет в наличии' : 'Out of stock'}
                  </span>
                ) : currentStock <= 3 ? (
                  <span className="text-[13px] font-semibold text-[#ff3b30]">
                    {lang === 'uz' ? `Faqat ${currentStock} ${selectedProduct.unit || 'dona'} qoldi` : lang === 'ru' ? `Осталось ${currentStock} ${selectedProduct.unit === 'dona' ? 'шт' : selectedProduct.unit || 'шт'}` : `Only ${currentStock} ${selectedProduct.unit || 'pcs'} left`}
                  </span>
                ) : (
                  <span className="text-[13px] font-medium text-gray-500">
                    {lang === 'uz' ? `Sotuvda bor: ${currentStock} ${selectedProduct.unit || 'dona'}` : lang === 'ru' ? `В наличии: ${currentStock} ${selectedProduct.unit === 'dona' ? 'шт' : selectedProduct.unit || 'шт'}` : `In stock: ${currentStock} ${selectedProduct.unit || 'pcs'}`}
                  </span>
                )}
                {benefit > 0 && (
                  <span className="text-[13px] font-bold text-[#34c759] mt-0.5">
                    {lang === 'uz' ? 'Tejamkorlik' : lang === 'ru' ? 'Выгода' : 'Savings'}: {formatPrice(benefit)}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5 border-t border-gray-50 pt-3">
              <h2 className="text-[18px] font-extrabold text-gray-900 leading-tight">
                {selectedProduct.title[lang]}
              </h2>
              <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                <span>
                  {isDescExpanded
                    ? selectedProduct.description[lang]
                    : `${selectedProduct.description[lang].slice(0, 100)}${selectedProduct.description[lang].length > 100 ? '...' : ''}`
                  }
                </span>
                {selectedProduct.description[lang].length > 100 && (
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setIsDescExpanded(!isDescExpanded);
                    }}
                    className="text-[#3b82f6] text-[14px] font-bold mt-1 block focus:outline-none"
                  >
                    {isDescExpanded
                      ? (lang === 'uz' ? 'Yashirish' : lang === 'ru' ? 'Показать меньше' : 'Show less')
                      : (lang === 'uz' ? 'Batafsil' : lang === 'ru' ? 'Показать полностью' : 'Show more')
                    }
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Variants Selection (professional Marketplace style) */}
            {productVariants.length > 0 && (
              productVariants.map((v) => (
                <div key={v.name} className="pt-3 border-t border-gray-100">
                  <h4 className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider mb-2">
                    {v.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => {
                      const isSelected = selectedOptions[v.name] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedOptions(prev => ({
                              ...prev,
                              [v.name]: opt
                            }));
                          }}
                          className={`px-4 py-2 border rounded-xl text-[14px] font-medium transition-all ${
                            isSelected
                              ? 'border-[#3b82f6] text-[#3b82f6] bg-[#f0f6ff]'
                              : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. Recommendations slider ("ВАМ ТАКЖЕ МОЖЕТ ПОНРАВИТЬСЯ") */}
          {recommendations.length > 0 && (
            <div className="mt-6 space-y-2.5">
              <h3 className="px-5 text-[11px] font-bold text-[#3b82f6] tracking-wider uppercase">
                Вам также может понравиться
              </h3>

              <div className="overflow-x-auto no-scrollbar flex gap-3 px-4 py-1">
                {recommendations.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleRecommendClick(prod)}
                    className="w-36 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col shrink-0 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  >
                    <div className="h-28 bg-[#f5f5f7] flex items-center justify-center p-2">
                      <ProductImage
                        product={prod}
                        className="max-h-full max-w-full object-contain"
                        containerClassName="w-full h-full flex items-center justify-center bg-[#f5f5f7] rounded-lg"
                      />
                    </div>
                    <div className="p-2 flex flex-col justify-between flex-1">
                      <h4 className="text-[12px] font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
                        {prod.title[lang]}
                      </h4>
                      <span className="text-[13px] font-bold text-gray-900 block mt-auto">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
