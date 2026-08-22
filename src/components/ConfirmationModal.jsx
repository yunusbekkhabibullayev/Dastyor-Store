import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ArrowRightOnRectangleIcon, 
  TrashIcon, 
  ExclamationTriangleIcon, 
  XMarkIcon, 
  CheckIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

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

  const isLogout = confirmModal.type === 'logout';
  const isDelete = confirmModal.type === 'danger';

  const getIconBadge = () => {
    if (isLogout) {
      return (
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-3 shadow-xs">
          <ArrowRightOnRectangleIcon className="w-7 h-7" />
        </div>
      );
    }
    if (isDelete) {
      return (
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-3 shadow-xs">
          <TrashIcon className="w-7 h-7" />
        </div>
      );
    }
    return (
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
        <ExclamationTriangleIcon className="w-7 h-7" />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      {/* Modal Dialog Card */}
      <div className="bg-white w-full max-w-[340px] rounded-[32px] p-6 shadow-2xl border border-gray-150 flex flex-col items-center text-center animate-scaleUp">
        
        {/* Dynamic Icon Badge */}
        {getIconBadge()}

        {/* Message Title */}
        <h3 className="text-base font-black text-gray-900 leading-snug mb-1 px-1">
          {confirmModal.title}
        </h3>

        {/* Optional Subtitle / Description */}
        {confirmModal.message ? (
          <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6 px-2">
            {confirmModal.message}
          </p>
        ) : (
          <div className="mb-5"></div>
        )}

        {/* Action Buttons Row */}
        <div className="flex w-full gap-2.5">
          {/* Cancel button */}
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-3 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4 text-gray-500 shrink-0" />
            <span>{confirmModal.cancelText}</span>
          </button>
          
          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 py-3 px-3 rounded-2xl active:scale-95 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
              isLogout || isDelete
                ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
            }`}
          >
            {isLogout ? (
              <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0" />
            ) : isDelete ? (
              <TrashIcon className="w-4 h-4 shrink-0" />
            ) : (
              <CheckIcon className="w-4 h-4 shrink-0" />
            )}
            <span>{confirmModal.confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
