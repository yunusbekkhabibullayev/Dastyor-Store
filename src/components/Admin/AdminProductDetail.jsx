import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CATEGORY_ATTRIBUTES = {
  cosmetics: [
    { key: 'brand', label: { uz: 'Brend', ru: 'Бренд' }, type: 'text' },
    { key: 'volume', label: { uz: 'Hajmi (ml / g)', ru: 'Объем (мл / г)' }, type: 'text' },
    { key: 'skin_type', label: { uz: 'Teri turi', ru: 'Тип кожи' }, type: 'text' }
  ],
  flowers: [
    { key: 'flower_type', label: { uz: 'Gul turi', ru: 'Тип цветка' }, type: 'text' },
    { key: 'count', label: { uz: 'Gullar soni (dona)', ru: 'Количество цветов (шт)' }, type: 'number' },
    { key: 'ribbon_color', label: { uz: 'Tasma rangi', ru: 'Цвет ленты' }, type: 'text' }
  ],
  men: [
    { key: 'sizes', label: { uz: 'O\'lchamlar (komalar bilan ajrating, masalan: S, M, L, XL)', ru: 'Размеры (через запятую, например: S, M, L, XL)' }, type: 'text', placeholder: 'S, M, L, XL' },
    { key: 'colors', label: { uz: 'Ranglar (komalar bilan ajrating, masalan: Qora, Oq)', ru: 'Цвета (через запятую, например: Черный, Белый)' }, type: 'text', placeholder: 'Qora, Oq' },
    { key: 'material', label: { uz: 'Matosi', ru: 'Материал' }, type: 'text' }
  ],
  women: [
    { key: 'sizes', label: { uz: 'O\'lchamlar (komalar bilan ajrating, masalan: S, M, L, XL)', ru: 'Размеры (через запятую, например: S, M, L, XL)' }, type: 'text', placeholder: 'S, M, L, XL' },
    { key: 'colors', label: { uz: 'Ranglar (komalar bilan ajrating, masalan: Qora, Oq)', ru: 'Цвета (через запятую, например: Черный, Белый)' }, type: 'text', placeholder: 'Qora, Oq' },
    { key: 'material', label: { uz: 'Matosi', ru: 'Материал' }, type: 'text' }
  ],
  electronics: [
    { key: 'brand', label: { uz: 'Brend', ru: 'Бренд' }, type: 'text' },
    { key: 'model', label: { uz: 'Model', ru: 'Модель' }, type: 'text' },
    { key: 'warranty', label: { uz: 'Kafolat (oy)', ru: 'Гарантия (месяцев)' }, type: 'number' },
    { key: 'specs', label: { uz: 'Texnik xususiyatlari', ru: 'Характеристики' }, type: 'textarea' }
  ],
  books: [
    { key: 'author', label: { uz: 'Muallif', ru: 'Автор' }, type: 'text' },
    { key: 'cover_type', label: { uz: 'Muqova turi', ru: 'Тип обложки' }, type: 'select', options: [
      { value: 'hard', label: { uz: 'Qattiq', ru: 'Твердая' } },
      { value: 'soft', label: { uz: 'Yumshoq', ru: 'Мягкая' } }
    ] },
    { key: 'pages', label: { uz: 'Sahifalar soni', ru: 'Количество страниц' }, type: 'number' },
    { key: 'publisher', label: { uz: 'Nashriyot', ru: 'Издательство' }, type: 'text' },
    { key: 'year', label: { uz: 'Nashr yili', ru: 'Год издания' }, type: 'number' }
  ],
  kitoblar: [
    { key: 'author', label: { uz: 'Muallif', ru: 'Автор' }, type: 'text' },
    { key: 'cover_type', label: { uz: 'Muqova turi', ru: 'Тип обложки' }, type: 'select', options: [
      { value: 'hard', label: { uz: 'Qattiq', ru: 'Твердая' } },
      { value: 'soft', label: { uz: 'Yumshoq', ru: 'Мягкая' } }
    ] },
    { key: 'pages', label: { uz: 'Sahifalar soni', ru: 'Количество страниц' }, type: 'number' },
    { key: 'publisher', label: { uz: 'Nashriyot', ru: 'Издательство' }, type: 'text' },
    { key: 'year', label: { uz: 'Nashr yili', ru: 'Год издания' }, type: 'number' }
  ]
};

export const AdminProductDetail = () => {
  const { lang, setAdminTab, triggerHaptic, selectedAdminProduct, categories } = useStore();

  const product = selectedAdminProduct;

  if (!product) return null;

  const translations = {
    uz: {
      back: 'Orqaga',
      productDetails: 'Mahsulot tafsilotlari',
      price: 'Narxi',
      oldPrice: 'Eski narxi',
      stock: 'Omborda',
      category: 'Kategoriya',
      specifications: 'Xususiyatlari',
      noSpecs: 'Qo\'shimcha xususiyatlar mavjud emas.',
      currency: 'so\'m'
    },
    ru: {
      back: 'Назад',
      productDetails: 'Детали товара',
      price: 'Цена',
      oldPrice: 'Старая цена',
      stock: 'В наличии',
      category: 'Категория',
      specifications: 'Характеристики',
      noSpecs: 'Нет дополнительных характеристик.',
      currency: 'сум'
    }
  };

  const t = translations[lang] || translations.uz;

  const formatPrice = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
  };

  return (
    <div className="space-y-6 text-left max-w-2xl animate-fadeIn">
      <button 
        onClick={() => {
          triggerHaptic('light');
          setAdminTab('products');
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>{t.back}</span>
      </button>

      <div className="bg-white border border-gray-155 rounded-2xl shadow-xs p-6 space-y-6">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          {t.productDetails}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Photo */}
          <div className="w-full aspect-[4/3] rounded-2xl bg-gray-50 border border-gray-150 overflow-hidden shrink-0">
            <img 
              src={product.image} 
              alt="" 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.src = '/images/skincare_banner.png'; }}
            />
          </div>

          {/* Details Column */}
          <div className="space-y-4">
            <div>
              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                {categories.find(c => c.id === product.category_id)?.[`name_${lang}`] || product.category_id}
              </span>
              <h4 className="text-gray-955 font-black text-lg sm:text-xl mt-1 leading-tight">
                {product[`title_${lang}`] || product.title_uz}
              </h4>
              <div className="flex gap-4 mt-3 font-bold text-sm">
                <span className="text-blue-600">{formatPrice(product.price)} {t.currency} {product.unit ? `/ ${product.unit}` : ''}</span>
                {product.old_price && (
                  <span className="text-gray-400 line-through">{formatPrice(product.old_price)} {t.currency} {product.unit ? `/ ${product.unit}` : ''}</span>
                )}
                <span className={product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {product.stock > 0 ? `${lang === 'uz' ? 'Omborda' : 'В наличии'}: ${product.stock} ${product.unit || 'dona'}` : 'Tugagan'}
                </span>
              </div>
            </div>

            {/* Description */}
            {(product[`description_${lang}`] || product.description_uz) ? (
              <div className="border-t border-gray-100 pt-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {lang === 'uz' ? 'Tavsif' : 'Описание'}
                </span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {product[`description_${lang}`] || product.description_uz}
                </p>
              </div>
            ) : null}

            {/* Specific Attributes */}
            <div className="border-t border-gray-100 pt-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                {t.specifications}
              </span>
              
              {product.attributes && Object.keys(product.attributes).length > 0 ? (
                <div className="bg-slate-50 rounded-xl p-3 border border-gray-150 divide-y divide-gray-200/50 text-xs font-semibold text-gray-850">
                  {Object.entries(product.attributes).map(([k, v]) => {
                    const specDef = (CATEGORY_ATTRIBUTES[product.category_id] || []).find(s => s.key === k);
                    const labelText = specDef ? (specDef.label[lang] || specDef.label['uz']) : k;
                    return (
                      <div key={k} className="flex justify-between py-1.5 first:pt-0 last:pb-0">
                        <span className="text-gray-400 font-bold">{labelText}:</span>
                        <span className="text-gray-800 text-right">{v}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs font-medium text-gray-400 italic">{t.noSpecs}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
