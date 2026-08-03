import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const AdminCategoryDetail = () => {
  const { lang, setAdminTab, triggerHaptic, selectedAdminCategory, products } = useStore();

  const category = selectedAdminCategory;

  if (!category) return null;

  const translations = {
    uz: {
      back: 'Orqaga',
      categoryDetails: 'Kategoriya tafsilotlari',
      productsInCat: 'Ushbu kategoriyadagi mahsulotlar',
      noProducts: 'Ushbu kategoriyada mahsulotlar mavjud emas.',
      currency: 'so\'m'
    },
    ru: {
      back: 'Назад',
      categoryDetails: 'Детали категории',
      productsInCat: 'Товары в этой категории',
      noProducts: 'В этой категории нет товаров.',
      currency: 'сум'
    }
  };

  const t = translations[lang] || translations.uz;

  const detailedProducts = products.filter(p => p.category_id === category.id);

  return (
    <div className="space-y-6 text-left max-w-2xl animate-fadeIn">
      <button 
        onClick={() => {
          triggerHaptic('light');
          setAdminTab('categories');
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>{t.back}</span>
      </button>

      <div className="bg-white border border-gray-155 rounded-2xl shadow-xs p-6 space-y-6">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          {t.categoryDetails}: {category[`name_${lang}`] || category.name_uz}
        </h3>

        <div>
          <h4 className="text-xs font-extrabold text-blue-600 uppercase tracking-wide mb-3">
            {t.productsInCat} ({detailedProducts.length} ta)
          </h4>

          {detailedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailedProducts.map(p => {
                const title = p[`title_${lang}`] || p.title_uz || '';
                const price = new Intl.NumberFormat('uz-UZ').format(p.price);
                
                return (
                  <div 
                    key={p.id}
                    className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-gray-150/50"
                  >
                    <img 
                      src={p.image} 
                      alt="" 
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200 bg-white shrink-0"
                      onError={(e) => { e.target.src = '/images/skincare_banner.png'; }}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <h5 className="font-bold text-gray-900 text-xs truncate leading-tight">{title}</h5>
                      <div className="flex gap-2 text-[10px] text-gray-400 mt-0.5">
                        <span className="font-extrabold text-gray-700">{price} {t.currency}</span>
                        <span>•</span>
                        <span className={p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          Qoldiq: {p.stock} ta
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center bg-slate-50 border border-gray-150 rounded-2xl">
              <p className="text-xs font-semibold text-gray-400 italic">{t.noProducts}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
