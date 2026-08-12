import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, GiftIcon, ShoppingBagIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

export const ProductImage = ({ 
  product, 
  className = "w-full h-full object-cover", 
  containerClassName = "w-full h-full flex items-center justify-center bg-[#f5f5f7] rounded-lg border border-gray-100" 
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // Reset states if product image URL changes
  useEffect(() => {
    setError(false);
    setLoaded(false);
    
    // Check if image is already loaded from cache
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [product.image]);

  if (error || !product.image) {
    const iconConfig = {
      cosmetics: SparklesIcon,
      flowers: GiftIcon,
      men: ShoppingBagIcon,
      women: ShoppingBagIcon,
      electronics: MusicalNoteIcon
    };
    
    const IconComponent = iconConfig[product.categoryId] || ShoppingBagIcon;
    
    return (
      <div className={containerClassName}>
        <IconComponent className="w-10 h-10 text-gray-300 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#f8fafc] overflow-hidden flex items-center justify-center">
      {/* Lazy Loader Skeleton Shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse z-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Ambient Blur Backdrop for non-standard image aspect ratios */}
      {loaded && (
        <img
          src={product.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-125 z-0 pointer-events-none"
        />
      )}

      <img
        ref={imgRef}
        src={product.image}
        alt={product.title ? (product.title.uz || product.title.ru || 'Product') : 'Product'}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100 relative z-10' : 'opacity-0 absolute z-0'}`}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};
