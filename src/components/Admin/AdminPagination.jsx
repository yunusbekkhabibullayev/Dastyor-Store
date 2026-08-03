import React from 'react';

export const AdminPagination = ({ currentPage, totalPages, onPageChange, triggerHaptic }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const pages = getPageNumbers();

  const handlePageClick = (page) => {
    if (triggerHaptic) triggerHaptic('light');
    onPageChange(page);
  };

  return (
    <div className="py-4 px-4 border-t border-gray-100 flex items-center justify-center gap-1.5 select-none animate-fadeIn bg-white">
      {/* Previous Page Link */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => handlePageClick(currentPage - 1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border text-sm font-bold bg-white text-gray-700 border-gray-200 hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
      >
        &laquo;
      </button>

      {/* Page Numbers Links */}
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => handlePageClick(p)}
          className={`inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-xl border text-sm font-extrabold transition-all duration-200 active:scale-95 ${
            currentPage === p
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/10'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-55'
          }`}
        >
          {p}
        </button>
      ))}

      {/* Next Page Link */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border text-sm font-bold bg-white text-gray-700 border-gray-200 hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
      >
        &raquo;
      </button>
    </div>
  );
};
