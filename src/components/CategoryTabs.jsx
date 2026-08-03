import React, { useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const CategoryTabs = ({ variant }) => {
  const { lang, selectedCategory, setSelectedCategory, triggerHaptic, categories } = useStore();
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const active = activeRef.current;
      const scrollLeft = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedCategory]);

  const allTab = { id: 'all', name: { uz: 'Barchasi', ru: 'Все', en: 'All' } };
  const activeCategories = categories.filter(c => c.is_active === 1 || c.is_active === true || c.id === 'all');
  const displayCategories = activeCategories.some(c => c.id === 'all')
    ? activeCategories
    : [allTab, ...activeCategories.filter(c => c.id !== 'all')];

  return (
    <div className="sticky top-[56px] z-30 bg-white border-b border-gray-100/80 shadow-2xs">
      <div
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar px-4 py-2.5 flex items-center gap-2"
      >
        {displayCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;

          // Different classes for search variant vs main page
          const buttonStyle = variant === 'search'
            ? isActive
              ? 'bg-[#3b82f6] text-white border border-transparent'
              : 'bg-[#f2f2f7] text-[#3c3c43] border border-transparent'
            : isActive
              ? 'bg-[#3b82f6] text-white border border-transparent'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50';

          const catName = cat.name?.[lang] || cat[`name_${lang}`] || cat.name_uz || cat.name?.uz || '';

          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : null}
              id={variant !== 'search' ? `cat-tab-${cat.id}` : undefined}
              data-category-id={cat.id}
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory(cat.id);
              }}
              className={`category-tab-btn px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${buttonStyle}`}
            >
              {catName}
            </button>
          );
        })}
      </div>
    </div>
  );
};
