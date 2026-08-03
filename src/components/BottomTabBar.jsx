import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Squares2X2Icon as Squares2X2Outline, 
  ShoppingCartIcon as ShoppingCartOutline, 
  HeartIcon as HeartOutline, 
  UserIcon as UserOutline 
} from '@heroicons/react/24/outline';
import { 
  Squares2X2Icon as Squares2X2Solid, 
  ShoppingCartIcon as ShoppingCartSolid, 
  HeartIcon as HeartSolid, 
  UserIcon as UserSolid 
} from '@heroicons/react/24/solid';

export const BottomTabBar = () => {
  const { activeTab, setActiveTab, t, totalCartCount, favorites, triggerHaptic } = useStore();

  const navItems = [
    { id: 'catalog', label: t.catalog, outlineIcon: Squares2X2Outline, solidIcon: Squares2X2Solid },
    { id: 'cart', label: t.cart, outlineIcon: ShoppingCartOutline, solidIcon: ShoppingCartSolid },
    { id: 'favorites', label: t.favorites, outlineIcon: HeartOutline, solidIcon: HeartSolid },
    { id: 'profile', label: t.profile, outlineIcon: UserOutline, solidIcon: UserSolid },
  ];

  return (
    /* Outer wrapper — positions the floating card */
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto px-3 pb-3 pointer-events-none">
      {/* Floating card */}
      <nav className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] pointer-events-auto">
        <div className="flex items-center justify-around px-1 py-1.5">
          {navItems.map((item) => {
            const Icon = item.outlineIcon;
            const isActive = activeTab === item.id;

            let badgeCount = 0;
            if (item.id === 'cart') badgeCount = totalCartCount;
            if (item.id === 'favorites') badgeCount = favorites.length;

            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(item.id);
                }}
                className="flex flex-col items-center justify-center flex-1 min-w-0 py-1 cursor-pointer"
              >
                <div className="relative mb-1">
                  <Icon
                    className={`w-5 h-5 transition-colors ${isActive ? 'text-[#3b82f6]' : 'text-gray-400'}`}
                  />
                  {/* Badge */}
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-[3px] bg-[#3b82f6] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-2xs">
                      {badgeCount}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] leading-none transition-colors ${isActive ? 'text-[#3b82f6] font-bold' : 'text-gray-500 font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
