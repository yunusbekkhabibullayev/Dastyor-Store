import React, { useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { CategoryTabs } from './CategoryTabs';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const SearchView = ({ onClose }) => {
  const { lang, t, searchQuery, setSearchQuery, selectedCategory, triggerHaptic, products, categories } = useStore();
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;

    // Check if the product's category is active
    const cat = categories.find(c => c.id === product.categoryId);
    const isCatActive = cat ? (cat.is_active === 1 || cat.is_active === true) : false;
    if (!isCatActive) return false;

    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch =
      product.title[lang].toLowerCase().includes(query) ||
      product.description[lang].toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleClose = () => {
    triggerHaptic('light');
    setSearchQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col max-w-lg mx-auto">
      {/* Search input row — gray rounded input wrapper matching screenshot */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-100 shrink-0">
        <div className="flex-1 bg-[#f2f2f7] rounded-[10px] px-3 py-1.5 flex items-center gap-2">
          <MagnifyingGlassIcon className="w-4 h-4 text-[#8e8e93] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 text-[15px] text-gray-900 bg-transparent border-none outline-none placeholder:text-[#8e8e93] caret-[#3b82f6]"
          />
        </div>
        <button
          onClick={handleClose}
          className="text-[#3b82f6] text-[15px] font-semibold shrink-0 animate-fadeIn"
        >
          {lang === 'uz' ? 'Bekor qilish' : lang === 'ru' ? 'Отмена' : 'Cancel'}
        </button>
      </div>

      {/* Category tabs — with search styling (filled gray pills) */}
      <div className="bg-white border-b border-gray-100 shrink-0">
        <CategoryTabs variant="search" />
      </div>

      {/* Content area — white background */}
      <div className="flex-1 overflow-y-auto bg-white pb-20">
        {searchQuery.trim() === '' ? (
          <div className="flex flex-col items-center justify-center pt-36 text-center px-4">
            <MagnifyingGlassIcon className="w-16 h-16 text-[#d1d1d6] mb-4" />
            <p className="text-[16px] font-medium text-[#8e8e93]">
              {lang === 'uz' ? 'Izlash uchun mahsulot nomini kiriting' : lang === 'ru' ? 'Введите название или артикул' : 'Enter product name to search'}
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-36 text-center px-4">
            <MagnifyingGlassIcon className="w-16 h-16 text-[#d1d1d6] mb-4" />
            <p className="text-[16px] font-medium text-[#8e8e93]">
              {lang === 'uz' ? 'Hech narsa topilmadi' : lang === 'ru' ? 'Ничего не найдено' : 'Nothing found'}
            </p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2.5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
