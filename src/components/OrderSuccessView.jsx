import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckIcon } from '@heroicons/react/24/outline';

export const OrderSuccessView = () => {
  const { t, setIsOrderSuccess, triggerHaptic } = useStore();

  return (
    <div className="flex-1 flex flex-col bg-white min-h-[85vh]">
      {/* Header — 100% matching the screenshot (no back button, centered title) */}
      <div className="flex items-center justify-center px-4 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-[0_2px_8px_rgba(0,0,0,0.03)] min-h-[56px]">
        <span className="text-[16px] font-bold text-gray-900">{t.orderSuccessTitle}</span>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
        {/* Checkmark in white circle with shadow */}
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-50">
          <CheckIcon className="w-9 h-9 text-[#3b82f6]" />
        </div>

        {/* Title */}
        <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">
          {t.orderSuccessTitle}
        </h2>

        {/* Status text */}
        <p className="text-[15px] font-semibold text-gray-800 mb-1">
          {t.orderSuccessStatus}
        </p>

        {/* Secondary description */}
        <p className="text-[13px] text-gray-400 max-w-[260px] leading-relaxed mb-10">
          {t.orderSuccessDesc2}
        </p>

        {/* Back to catalog button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsOrderSuccess(false);
          }}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-sm px-12 py-3.5 rounded-2xl transition-all shadow-md shadow-blue-500/10 active:scale-95"
        >
          {t.backToCatalogLong}
        </button>
      </div>
    </div>
  );
};
