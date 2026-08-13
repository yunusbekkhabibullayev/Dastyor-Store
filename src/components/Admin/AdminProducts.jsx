import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  PlusIcon, 
  PencilIcon as Edit2Icon, 
  TrashIcon as Trash2Icon, 
  SparklesIcon, 
  MagnifyingGlassIcon as SearchIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { AdminPagination } from './AdminPagination';

export const AdminProducts = () => {
  const { lang, telegramUser, triggerHaptic, showConfirm, getAdminHeaders, products, categories, fetchProducts, fetchCategories, setSelectedAdminProduct, setAdminTab } = useStore();
  
  // UI states
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCat]);

  const translations = {
    uz: {
      addProduct: 'Yangi mahsulot',
      editProduct: 'Mahsulotni tahrirlash',
      productDetails: 'Mahsulot tafsilotlari',
      searchPlaceholder: 'Mahsulot nomini qidirish...',
      price: 'Narxi',
      stock: 'Omborda (soni)',
      empty: 'Mahsulotlar topilmadi',
      deleteConfirmTitle: 'Mahsulotni o\'chirish',
      deleteConfirmMsg: 'Haqiqatan ham ushbu mahsulotni o\'chirmoqchimisiz?',
      actions: 'Amallar',
      currency: 'so\'m'
    },
    ru: {
      addProduct: 'Новый товар',
      editProduct: 'Редактировать товар',
      productDetails: 'Детали товара',
      searchPlaceholder: 'Поиск товара по названию...',
      price: 'Цена',
      stock: 'В наличии (кол-во)',
      empty: 'Товары не найдены',
      deleteConfirmTitle: 'Удаление товара',
      deleteConfirmMsg: 'Вы действительно хотите удалить этот товар?',
      actions: 'Действия',
      currency: 'сум'
    }
  };

  const t = translations[lang] || translations.uz;

  const loadData = async () => {
    setLoading(true);
    try {
      fetchProducts();
      fetchCategories();
    } catch (err) {
      console.warn('Products Admin failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [telegramUser]);

  const handleOpenAddModal = () => {
    triggerHaptic('light');
    setSelectedAdminProduct(null);
    setAdminTab('product-add');
  };

  const handleOpenEditModal = (product) => {
    triggerHaptic('light');
    setSelectedAdminProduct(product);
    setAdminTab('product-edit');
  };

  const handleOpenDetails = (product) => {
    triggerHaptic('light');
    setSelectedAdminProduct(product);
    setAdminTab('product-details');
  };

  const handleDelete = (productId) => {
    triggerHaptic('warning');
    showConfirm(
      t.deleteConfirmTitle,
      t.deleteConfirmMsg,
      async () => {
        try {
          const res = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: getAdminHeaders()
          });
          const data = await res.json();
          if (data.success) {
            fetchProducts();
          } else {
            alert(data.message || (lang === 'uz' ? "Xatolik yuz berdi" : "Произошла ошибка"));
          }
        } catch (err) {
          console.warn('Failed to delete product:', err);
          alert(lang === 'uz' ? "Mahsulotni o'chirishda xatolik yuz berdi" : "Ошибка при удалении товара");
        }
      }
    );
  };

  const formatPrice = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
  };

  const getProductTitle = (p) => {
    if (!p) return '';
    if (typeof p.title === 'string') return p.title;
    if (p.title && typeof p.title === 'object') return p.title[lang] || p.title.uz || p.title.ru || '';
    return p[`title_${lang}`] || p.title_uz || p.title_ru || '';
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const title = getProductTitle(p).toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase());
    const matchesCategory = selectedCat === 'all' || p.category_id === selectedCat;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base uppercase tracking-wider">
            {lang === 'uz' ? 'Mahsulotlar ro\'yxati' : 'Список товаров'}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100/60">
            {filteredProducts.length} ta
          </span>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4 shrink-0" />
          <span>{t.addProduct}</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <SearchIcon className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-150 rounded-xl text-xs font-medium placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all shadow-xs"
          />
        </div>

        {/* Category dropdown */}
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="w-full sm:w-auto bg-white border border-gray-150 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none shadow-xs cursor-pointer"
        >
          <option value="all">{lang === 'uz' ? 'Barcha toifalar' : 'Все категории'}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat[`name_${lang}`] || cat.name_uz}
            </option>
          ))}
        </select>
      </div>

      {/* Products table */}
      {filteredProducts.length > 0 ? (
        <div className="bg-white border border-gray-155 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-5 w-14">{lang === 'uz' ? 'Rasm' : 'Фото'}</th>
                  <th className="py-3 px-5">{lang === 'uz' ? 'Nomi' : 'Название'}</th>
                  <th className="py-3 px-5 text-right w-28">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-750">
                {paginatedProducts.map((p) => {
                  const title = getProductTitle(p);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5">
                        <img
                          src={p.image}
                          alt=""
                          className="w-9 h-9 object-cover rounded-lg border border-gray-150 bg-white"
                          onError={(e) => { e.target.src = '/images/skincare_banner.png'; }}
                        />
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex flex-col text-left">
                          <span 
                            className="font-extrabold text-gray-900 text-xs sm:text-sm leading-tight truncate max-w-[180px] sm:max-w-[280px] block" 
                            title={title}
                          >
                            {title}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-gray-455">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${parseFloat(p.stock) > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-rose-50 text-rose-600 border border-rose-100/50'}`}>
                              {parseFloat(p.stock) > 0 ? `${lang === 'uz' ? 'Qoldiq' : 'Остаток'}: ${Number(p.stock).toString()} ${p.unit || ''}` : (lang === 'uz' ? 'Tugagan' : 'Нет в наличии')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(p)}
                            className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 text-blue-600 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all active:scale-90 border border-blue-100/50"
                          >
                            <Edit2Icon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-rose-600 bg-rose-50/50 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-all active:scale-90 border border-rose-100/50"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            triggerHaptic={triggerHaptic}
          />
        </div>
      ) : (
        <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl shadow-xs">
          <SparklesIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-xs font-bold text-gray-400">{t.empty}</p>
        </div>
      )}
    </div>
  );
};
