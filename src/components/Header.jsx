import React from 'react';
import { useStore } from '../context/StoreContext';
import { MagnifyingGlassIcon, InformationCircleIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { LanguageFlag } from './FlagIcon';

export const Header = ({ onSearchOpen }) => {
  const { activeTab, setActiveTab, t, triggerHaptic, lang, toggleLanguage, profileSubView, setProfileSubView, siteSettings } = useStore();

  if (activeTab === 'profile') {
    const isHistorySubView = profileSubView === 'history';
    return (
      <header className="sticky top-0 z-30 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between px-4 py-3 relative min-h-[56px]">
          {/* Back button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              if (isHistorySubView) {
                setProfileSubView(null);
              } else {
                setActiveTab('catalog');
              }
            }}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors bg-white shadow-sm z-10"
          >
            <ChevronLeftIcon className="w-[18px] h-[18px]" />
          </button>

          {/* Centered Page Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[18px] font-bold text-gray-900 tracking-tight">
              {isHistorySubView ? t.ordersHistory : t.profile}
            </span>
          </div>

          {/* Right Action Element (Language Toggle or Spacer) */}
          {isHistorySubView ? (
            <div className="w-8 h-8 opacity-0" />
          ) : (
            <button
              onClick={() => {
                triggerHaptic('light');
                toggleLanguage();
              }}
              className="p-1 hover:opacity-80 active:scale-95 transition-opacity cursor-pointer select-none z-10 flex items-center justify-center"
              title={lang === 'uz' ? 'O\'zbekcha' : lang === 'ru' ? 'Русский' : 'English'}
            >
              <LanguageFlag lang={lang} className="w-6 h-4 object-cover shadow-2xs" />
            </button>
          )}
        </div>
      </header>
    );
  }

  if (activeTab === 'favorites' || activeTab === 'cart') {
    const title = activeTab === 'favorites' ? t.favorites : t.cart;
    return (
      <header className="sticky top-0 z-30 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between px-4 py-3 relative min-h-[56px]">
          {/* Back button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('catalog');
            }}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors bg-white shadow-sm z-10"
          >
            <ChevronLeftIcon className="w-[18px] h-[18px]" />
          </button>

          {/* Centered Page Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[18px] font-bold text-gray-900 tracking-tight">{title}</span>
          </div>

          {/* Empty spacer to keep grid alignment stable */}
          <div className="w-8 h-8 opacity-0" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          {siteSettings?.logo ? (
            <img 
              src={siteSettings.logo} 
              alt={siteSettings?.name || 'Logo'} 
              className="w-8 h-8 rounded-full object-cover border border-gray-200/80 shadow-xs" 
            />
          ) : (
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <InformationCircleIcon className="w-[18px] h-[18px]" />
            </button>
          )}
          <span className="text-[18px] font-bold text-gray-900 tracking-tight">{siteSettings?.name || 'Qlay Store'}</span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Visual SVG Flag Language Toggle (Boxless & No border radius) */}
          <button
            onClick={() => {
              triggerHaptic('light');
              toggleLanguage();
            }}
            className="p-1 hover:opacity-80 active:scale-95 transition-opacity cursor-pointer select-none flex items-center justify-center"
            title={lang === 'uz' ? "O'zbekcha" : lang === 'ru' ? 'Русский' : 'English'}
          >
            <LanguageFlag lang={lang} className="w-6 h-4 object-cover shadow-2xs" />
          </button>

          {/* Search icon in circular box */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onSearchOpen();
            }}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MagnifyingGlassIcon className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
};
