import React from 'react';
import { useStore } from '../context/StoreContext';

export const ConfirmationModal = () => {
  const { confirmModal, hideConfirm, triggerHaptic } = useStore();

  if (!confirmModal || !confirmModal.isOpen) return null;

  const handleConfirm = () => {
    triggerHaptic('medium');
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    hideConfirm();
  };

  const handleCancel = () => {
    triggerHaptic('light');
    if (confirmModal.onCancel) {
      confirmModal.onCancel();
    }
    hideConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fadeIn">
      {/* Modal Dialog Card */}
      <div className="bg-white w-full max-w-[320px] rounded-[28px] p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-scaleUp">
        {/* Message Title */}
        <h3 className="text-[17px] font-bold text-gray-900 leading-snug mb-6 px-1">
          {confirmModal.title}
        </h3>

        {/* Action Buttons Row */}
        <div className="flex w-full gap-3">
          {/* Cancel button */}
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#f2f4f7] hover:bg-[#e4e7ec] active:scale-95 text-gray-700 font-extrabold text-sm transition-all"
          >
            {confirmModal.cancelText}
          </button>
          
          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#ff3b30] hover:bg-[#e03126] active:scale-95 text-white font-extrabold text-sm transition-all shadow-md shadow-red-500/10"
          >
            {confirmModal.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
