import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { HeartIcon } from '@heroicons/react/24/outline';

export const FavoritesView = () => {
  const { favorites, t, setActiveTab, triggerHaptic, products } = useStore();
  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        {/* Large outline heart icon, no circle background */}
        <HeartIcon className="w-20 h-20 text-gray-300 mb-6 animate-pulse" />
        <h3 className="text-[17px] font-bold text-gray-900 mb-2">{t.emptyFavorites}</h3>
        <p className="text-[13px] text-gray-400 max-w-[260px] leading-relaxed mb-8">{t.emptyFavoritesDesc}</p>
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
    <div className="p-4 pb-20 max-w-lg mx-auto">
      <h2 className="text-[17px] font-bold text-gray-900 mb-3">
        {t.favorites} ({favoriteProducts.length})
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {favoriteProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
