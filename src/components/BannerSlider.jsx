import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';

export const BannerSlider = () => {
  const { lang, triggerHaptic, banners } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const isUserInteracting = useRef(false);

  // Auto-scrolling interval
  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      if (isUserInteracting.current) return;
      if (sliderRef.current) {
        const container = sliderRef.current;
        const nextIndex = (currentIndex + 1) % banners.length;
        container.scrollTo({
          left: nextIndex * container.offsetWidth,
          behavior: 'smooth'
        });
        setCurrentIndex(nextIndex);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, banners]);

  // Handle scroll events to sync the page indicator dot
  const handleScroll = () => {
    if (sliderRef.current && banners && banners.length > 0) {
      const container = sliderRef.current;
      const index = Math.round(container.scrollLeft / container.offsetWidth);
      if (index !== currentIndex && index >= 0 && index < banners.length) {
        setCurrentIndex(index);
      }
    }
  };

  const handleTouchStart = () => {
    isUserInteracting.current = true;
  };

  const handleTouchEnd = () => {
    // Release lock after a short delay so auto-scroll doesn't immediately hijack
    setTimeout(() => {
      isUserInteracting.current = false;
    }, 2000);
  };

  const handleDotClick = (idx) => {
    triggerHaptic('light');
    setCurrentIndex(idx);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: idx * sliderRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pt-3.5 pb-2">
      {/* Swipeable Banner Slider Container */}
      <div
        className="relative w-full rounded-[20px] overflow-hidden bg-gray-100 shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
        style={{ aspectRatio: '16/7.5' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-full scroll-smooth"
        >
          {banners.map((banner) => {
            const title = banner.title[lang] || banner.title['uz'] || '';
            const subtitle = banner.subtitle ? (banner.subtitle[lang] || banner.subtitle['uz'] || '') : '';
            const badge = banner.badge ? (banner.badge[lang] || banner.badge['uz'] || '') : '';
            
            return (
              <div
                key={banner.id}
                className="w-full h-full shrink-0 snap-center relative overflow-hidden bg-gray-100"
              >
                {/* Ambient blur background for banners with arbitrary dimensions */}
                <img
                  src={banner.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 z-0 pointer-events-none"
                />
                <img
                  src={banner.image}
                  alt={title}
                  className="w-full h-full object-cover relative z-10"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent z-20" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  {badge && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#3b82f6] text-white mb-1.5 shadow-sm">
                      {badge}
                    </span>
                  )}
                  <h2 className="text-white font-bold text-base leading-tight drop-shadow-sm">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-white/80 text-[11px] font-medium mt-0.5 drop-shadow-xs">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots with equal top and bottom margin */}
      <div className="flex items-center justify-center gap-1.5 my-3">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`transition-all duration-300 ${
              idx === currentIndex
                ? 'w-6 h-[7px] bg-[#3b82f6] rounded-full'
                : 'w-[7px] h-[7px] bg-[#d3e2ff] rounded-full'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
