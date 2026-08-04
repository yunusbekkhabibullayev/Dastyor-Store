import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeftIcon, ArrowPathIcon, PhotoIcon as ImageIcon, ArrowUpTrayIcon as UploadIcon } from '@heroicons/react/24/outline';

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

const PREDEFINED_OPTIONS = {
  flower_type: ['Ro\'za', 'Lola', 'Tulpan', 'Gvozdika', 'Orxideya', 'Xrizantema', 'Pion', 'Romashka'],
  ribbon_color: ['Qizil', 'Oq', 'Pushti', 'Sariq', 'Ko\'k', 'Siyohrang', 'Yashil', 'Oltin'],
  colors: ['Qora', 'Oq', 'Qizil', 'Ko\'k', 'Yashil', 'Pushti', 'Sariq', 'Jigarang'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44'],
  skin_type: ['Barcha terilar uchun', 'Quruq teri', 'Yog\'li teri', 'Nozik teri', 'Aralash teri'],
  volume: ['ml', 'g']
};

export const AdminProductEdit = () => {
  const { lang, setAdminTab, triggerHaptic, getAdminHeaders, categories, fetchProducts, selectedAdminProduct } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const product = selectedAdminProduct;

  if (!product) return null;

  const activeCategories = categories.filter(c => c.is_active === 1 || c.is_active === true || c.id === product.category_id);

  const [form, setForm] = useState({
    id: product.id,
    category_id: product.category_id || '',
    title_uz: product.title_uz || '',
    title_ru: product.title_ru || '',
    title_en: product.title_en || '',
    description_uz: product.description_uz || '',
    description_ru: product.description_ru || '',
    description_en: product.description_en || '',
    price: product.price ?? '',
    old_price: product.old_price ?? '',
    stock: product.stock ?? 0,
    image: product.image || '',
    attributes: product.attributes || {}
  });

  const [varNameInput, setVarNameInput] = useState('');
  const [varOptsInput, setVarOptsInput] = useState('');

  const generateCombinations = (vList) => {
    if (!vList || vList.length === 0) return [];
    const list = vList.map(v => v.options || []);
    const product = list.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
    return product.map(comb => {
      const values = {};
      vList.forEach((v, index) => {
        values[v.name] = comb[index];
      });
      return { values, price: '', old_price: '', stock: '0' };
    });
  };

  const handleUpdateVariants = (newVList) => {
    const baseCombs = generateCombinations(newVList);
    // Merge with current combinations to preserve prices/stocks
    const mergedCombs = baseCombs.map(nc => {
      const matched = form.attributes?.combinations?.find(ec => {
        return Object.keys(nc.values).every(k => ec.values[k] === nc.values[k]);
      });
      if (matched) {
        return {
          ...nc,
          price: matched.price !== undefined ? matched.price : '',
          old_price: matched.old_price !== undefined ? matched.old_price : '',
          stock: matched.stock !== undefined ? matched.stock.toString() : '0'
        };
      }
      return nc;
    });
    
    setForm(prev => {
      let nextStock = prev.stock;
      if (mergedCombs.length > 0) {
        nextStock = mergedCombs.reduce((sum, c) => sum + (parseInt(c.stock, 10) || 0), 0);
      }
      return {
        ...prev,
        stock: nextStock,
        attributes: {
          ...prev.attributes,
          variants: newVList,
          combinations: mergedCombs
        }
      };
    });
  };

  const handleCombinationChange = (index, field, value) => {
    setForm(prev => {
      const nextCombs = [...(prev.attributes?.combinations || [])];
      nextCombs[index] = {
        ...nextCombs[index],
        [field]: value
      };
      
      let nextStock = prev.stock;
      if (field === 'stock') {
        nextStock = nextCombs.reduce((sum, c) => sum + (parseInt(c.stock, 10) || 0), 0);
      }
      
      return {
        ...prev,
        stock: nextStock,
        attributes: {
          ...prev.attributes,
          combinations: nextCombs
        }
      };
    });
  };

  const toggleVariantOption = (option) => {
    triggerHaptic('light');
    let items = varOptsInput ? varOptsInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (items.includes(option)) {
      items = items.filter(i => i !== option);
    } else {
      items.push(option);
    }
    setVarOptsInput(items.join(', '));
  };

  const translations = {
    uz: {
      back: 'Orqaga',
      editProduct: 'Mahsulotni tahrirlash',
      titleUz: 'Mahsulot nomi',
      descUz: 'Tavsif',
      price: 'Narxi (so\'m)',
      oldPrice: 'Eski narxi (so\'m, agar bo\'lsa)',
      stock: 'Omborda (soni)',
      image: 'Rasm yuklash',
      uploadBtn: 'Rasm tanlash',
      category: 'Kategoriya',
      selectCategory: 'Kategoriyani tanlang',
      save: 'Yangilash',
      cancel: 'Bekor qilish',
      specifications: 'Xususiyatlari'
    },
    ru: {
      back: 'Назад',
      editProduct: 'Редактировать товар',
      titleUz: 'Название товара',
      descUz: 'Описание',
      price: 'Цена (сум)',
      oldPrice: 'Старая цена (сум, если есть)',
      stock: 'В наличии (кол-во)',
      image: 'Загрузить картинку',
      uploadBtn: 'Выбрать картинку',
      category: 'Категория',
      selectCategory: 'Выберите категорию',
      save: 'Обновить',
      cancel: 'Отмена',
      specifications: 'Характеристики'
    }
  };

  const t = translations[lang] || translations.uz;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    triggerHaptic('light');
    setUploadingImage(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, image: data.fileUrl }));
      } else {
        alert(data.message || 'Yuklashda xatolik yuz berdi');
      }
    } catch (err) {
      console.warn('Image upload failed:', err);
      alert('Rasm yuklashda xatolik yuz berdi');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAttrChange = (key, val) => {
    setForm(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: val
      }
    }));
  };

  const toggleChipOption = (key, option) => {
    triggerHaptic('light');
    const currentVal = form.attributes[key] || '';
    if (key === 'volume') {
      const digits = currentVal.replace(/[a-zA-Z]/g, '').trim();
      if (currentVal.endsWith(option)) {
        handleAttrChange(key, digits);
      } else {
        handleAttrChange(key, `${digits} ${option}`.trim());
      }
      return;
    }
    let items = currentVal ? currentVal.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (items.includes(option)) {
      items = items.filter(i => i !== option);
    } else {
      items.push(option);
    }
    handleAttrChange(key, items.join(', '));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic('medium');
    setSubmitting(true);

    const payload = {
      ...form,
      title_ru: form.title_uz,
      title_en: form.title_uz,
      description_ru: form.description_uz || '',
      description_en: form.description_uz || '',
      price: parseInt(form.price, 10) || 0,
      old_price: form.old_price !== '' ? parseInt(form.old_price, 10) : null,
      stock: parseInt(form.stock, 10) || 0
    };

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        setAdminTab('products');
      }
    } catch (err) {
      console.warn('Failed to update product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const activeAttrSpecs = CATEGORY_ATTRIBUTES[form.category_id] || [];

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <button 
        onClick={() => {
          triggerHaptic('light');
          setAdminTab('products');
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors animate-fadeIn"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>{t.back}</span>
      </button>

      <div className="bg-white border border-gray-155 rounded-2xl shadow-xs p-6 space-y-6">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          {t.editProduct}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-455 uppercase tracking-wide block mb-1">
                {t.titleUz}
              </label>
              <input
                type="text" required
                value={form.title_uz}
                onChange={(e) => setForm(prev => ({ ...prev, title_uz: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-455 uppercase tracking-wide block mb-1">
                {t.category}
              </label>
              <select
                required
                value={form.category_id}
                onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value, attributes: {} }))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="">{t.selectCategory}</option>
                {activeCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c[`name_${lang}`] || c.name_uz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-455 uppercase tracking-wide block mb-1">
                {t.price}
              </label>
              <input
                type="number" min="0" required
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-455 uppercase tracking-wide block mb-1">
                {t.oldPrice}
              </label>
              <input
                type="number" min="0"
                placeholder="0"
                value={form.old_price}
                onChange={(e) => setForm(prev => ({ ...prev, old_price: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-455 uppercase tracking-wide block mb-1">
                {t.stock}
              </label>
              <input
                type="number" min="0" required
                value={form.stock}
                onChange={(e) => setForm(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Promokod & Chegirma Foizi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f8fafc] p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wide block mb-1">
                {lang === 'uz' ? 'Mahsulot Promokodi (masalan: SALE10)' : 'Промокод товара (например: SALE10)'}
              </label>
              <input
                type="text"
                placeholder="PROMO10"
                value={form.attributes?.promo_code || ''}
                onChange={(e) => handleAttrChange('promo_code', e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 uppercase transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wide block mb-1">
                {lang === 'uz' ? 'Chegirma Foizi (%)' : 'Процент скидки (%)'}
              </label>
              <input
                type="number" min="0" max="100"
                placeholder="10"
                value={form.attributes?.discount_percent || ''}
                onChange={(e) => handleAttrChange('discount_percent', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {activeAttrSpecs.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-150 space-y-3">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
                {t.specifications} ({categories.find(c => c.id === form.category_id)?.[`name_${lang}`] || form.category_id})
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeAttrSpecs.map((spec) => {
                  const val = form.attributes[spec.key] || '';
                  
                  return (
                    <div key={spec.key} className={spec.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="text-[10px] font-bold text-gray-450 block mb-1">
                        {spec.label[lang] || spec.label['uz']}
                      </label>

                      {spec.type === 'select' ? (
                        <select
                          value={val}
                          onChange={(e) => handleAttrChange(spec.key, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                        >
                          <option value="">-- Tanlang --</option>
                          {spec.options.map(opt => {
                            const isObj = typeof opt === 'object';
                            const optVal = isObj ? opt.value : opt;
                            const optLabel = isObj ? (opt.label[lang] || opt.label['uz']) : opt;
                            return (
                              <option key={optVal} value={optVal}>{optLabel}</option>
                            );
                          })}
                        </select>
                      ) : spec.type === 'textarea' ? (
                        <textarea
                          rows="2"
                          value={val}
                          onChange={(e) => handleAttrChange(spec.key, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div className="space-y-1.5">
                          <input
                            type={spec.type}
                            value={val}
                            onChange={(e) => handleAttrChange(spec.key, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                          />
                          {PREDEFINED_OPTIONS[spec.key] && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {PREDEFINED_OPTIONS[spec.key].map(opt => {
                                const selected = val.split(',').map(s => s.trim()).includes(opt);
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => toggleChipOption(spec.key, opt)}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                      selected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    {selected ? '✓ ' : '+ '}{opt}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Variant Configuration System */}
          <div className="bg-[#f8fafc] p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
              {lang === 'uz' ? 'Mahsulot Variantlari va Variant Narxlari/Qoldiqlari' : 'Варианты товара, цены и остатки'}
            </span>

            {/* Input to add variant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-150 shadow-2xs">
              <div>
                <label className="text-[9px] font-bold text-gray-500 block mb-0.5">
                  {lang === 'uz' ? 'Variant Nomi (Masalan: Rang, O\'lcham, Hajmi)' : 'Название варианта (Например: Цвет, Размер, Объем)'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'uz' ? "Rang" : "Цвет"}
                  value={varNameInput}
                  onChange={(e) => setVarNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 block mb-0.5">
                  {lang === 'uz' ? 'Variant Qiymatlari (vergul bilan ajrating, masalan: Oq, Qora)' : 'Значения (через запятую, например: Белый, Черный)'}
                </label>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={lang === 'uz' ? "Oq, Qora, Ko'k" : "Белый, Черный, Синий"}
                      value={varOptsInput}
                      onChange={(e) => setVarOptsInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        if (!varNameInput.trim() || !varOptsInput.trim()) return;
                        const vName = varNameInput.trim();
                        const vOpts = varOptsInput.split(',').map(s => s.trim()).filter(Boolean);
                        
                        const currentVariants = form.attributes?.variants || [];
                        if (currentVariants.some(v => v.name.toLowerCase() === vName.toLowerCase())) {
                          alert(lang === 'uz' ? 'Bu variant nomi allaqachon qo\'shilgan!' : 'Этот variant ya dobavlen!');
                          return;
                        }
                        
                        const nextVariants = [...currentVariants, { name: vName, options: vOpts }];
                        handleUpdateVariants(nextVariants);
                        
                        setVarNameInput('');
                        setVarOptsInput('');
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      +
                    </button>
                  </div>
                  {/* Quick suggestions/chips based on variant name (second screenshot requirement) */}
                  {varNameInput.trim() && (
                    <div className="flex flex-wrap gap-1 mt-1 pt-0.5 text-left">
                      {(() => {
                        const name = varNameInput.toLowerCase();
                        let suggestions = [];
                        if (name.includes('rang') || name.includes('color') || name.includes('цвет')) {
                          suggestions = ['Oq', 'Qora', 'Ko\'k', 'Qizil', 'Yashil', 'Pushti', 'Sariq', 'Jigarrang'];
                        } else if (name.includes('o\'lcham') || name.includes('size') || name.includes('размер')) {
                          suggestions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44'];
                        } else if (name.includes('hajm') || name.includes('volume') || name.includes('объем')) {
                          suggestions = ['30 ml', '50 ml', '100 ml', '150 ml', '200 ml', '250 ml', '500 ml', '1 L', '50 g', '100 g'];
                        }
                        if (suggestions.length === 0) return null;
                        
                        return suggestions.map(opt => {
                          const selected = varOptsInput.split(',').map(s => s.trim()).includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleVariantOption(opt)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                  selected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-white text-gray-600 border-gray-205 hover:bg-gray-100'
                              }`}
                            >
                              {selected ? '✓ ' : '+ '}{opt}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* List of active variants */}
            {form.attributes?.variants && form.attributes.variants.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.attributes.variants.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-600">
                    <span>{v.name}: {v.options.join(', ')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('warning');
                        const nextVariants = form.attributes.variants.filter((_, i) => i !== idx);
                        handleUpdateVariants(nextVariants);
                      }}
                      className="text-red-500 hover:text-red-700 font-bold ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Combinations pricing and inventory matrix */}
            {form.attributes?.combinations && form.attributes.combinations.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  {lang === 'uz' ? 'Har bir variant narxi va qoldig\'i (ombordagi soni):' : 'Матрица цен и остатков:'}
                </span>

                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3">{lang === 'uz' ? 'Variant' : 'Вариант'}</th>
                        <th className="px-4 py-3">{lang === 'uz' ? 'Narxi (ixtiyoriy)' : 'Цена (опц)'}</th>
                        <th className="px-4 py-3">{lang === 'uz' ? 'Eski Narxi (ixtiyoriy)' : 'Старая цена (опц)'}</th>
                        <th className="px-4 py-3 w-32">{lang === 'uz' ? 'Qoldiq (Soni)' : 'Остаток'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {form.attributes.combinations.map((comb, index) => {
                        const combName = Object.values(comb.values).join(' - ');
                        return (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-bold text-slate-700">{combName}</td>
                            <td className="px-4 py-2.5">
                              <input
                                type="number"
                                placeholder={form.price || "Default"}
                                value={comb.price || ''}
                                onChange={(e) => handleCombinationChange(index, 'price', e.target.value)}
                                className="w-full max-w-[120px] px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <input
                                type="number"
                                placeholder={form.old_price || "Default"}
                                value={comb.old_price || ''}
                                onChange={(e) => handleCombinationChange(index, 'old_price', e.target.value)}
                                className="w-full max-w-[120px] px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <input
                                type="number"
                                min="0"
                                required
                                value={comb.stock || '0'}
                                onChange={(e) => handleCombinationChange(index, 'stock', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-455 uppercase tracking-wide block mb-1">
              {t.descUz}
            </label>
            <textarea
              rows="3"
              value={form.description_uz}
              onChange={(e) => setForm(prev => ({ ...prev, description_uz: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-455 uppercase tracking-wide block mb-1">
              {t.image}
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative border-dashed">
                {form.image ? (
                  <img 
                    src={form.image} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    onError={() => setForm(prev => ({ ...prev, image: '' }))}
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="flex-1 text-left">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-extrabold text-blue-600 hover:bg-blue-100/70 transition-all cursor-pointer">
                  <UploadIcon className="w-3.5 h-3.5" />
                  <span>{t.uploadBtn}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
                <p className="text-[9px] text-gray-400 mt-1">Maksimal hajm: 5MB.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-150 flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {submitting && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
              <span>{t.save}</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('products')}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-150 font-bold rounded-xl text-xs text-gray-700 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
