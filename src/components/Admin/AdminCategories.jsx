import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon, ChevronLeftIcon, ChevronRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { AdminPagination } from './AdminPagination';

export const AdminCategories = () => {
  const { lang, telegramUser, triggerHaptic, showConfirm, getAdminHeaders, categories, products, fetchCategories, fetchProducts, setAdminTab, setSelectedAdminCategory } = useStore();
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [categories.length]);

  const translations = {
    uz: {
      addCategory: 'Yangi kategoriya',
      editCategory: 'Kategoriyani tahrirlash',
      categoryDetails: 'Kategoriya tafsilotlari',
      empty: 'Kategoriyalar topilmadi',
      deleteConfirmTitle: 'Toifani o\'chirish',
      deleteConfirmMsg: 'Haqiqatan ham ushbu kategoriyani o\'chirmoqchimisiz?',
      actions: 'Amallar',
      sortOrder: 'Tartib',
      itemName: 'Nomi',
      itemsCount: 'Mahsulotlar',
      status: 'Status',
      active: 'Faol',
      inactive: 'Nofaol'
    },
    ru: {
      addCategory: 'Новая категория',
      editCategory: 'Редактировать категорию',
      categoryDetails: 'Детали категории',
      empty: 'Категории не найдены',
      deleteConfirmTitle: 'Удаление категории',
      deleteConfirmMsg: 'Вы действительно хотите удалить эту категорию?',
      actions: 'Действия',
      sortOrder: 'Порядок',
      itemName: 'Название',
      itemsCount: 'Товары',
      status: 'Статус',
      active: 'Активен',
      inactive: 'Неактивен'
    }
  };

  const t = translations[lang] || translations.uz;

  const loadData = async () => {
    setLoading(true);
    try {
      fetchCategories();
      fetchProducts();
    } catch (err) {
      console.warn('Categories failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [telegramUser]);

  const handleOpenAddModal = () => {
    triggerHaptic('light');
    setAdminTab('category-add');
  };

  const handleOpenEditModal = (cat) => {
    triggerHaptic('light');
    setSelectedAdminCategory(cat);
    setAdminTab('category-edit');
  };

  const handleOpenDetails = (cat) => {
    triggerHaptic('light');
    setSelectedAdminCategory(cat);
    setAdminTab('category-details');
  };

  const handleDelete = (categoryId) => {
    triggerHaptic('warning');
    const productsCount = products.filter(p => p.category_id === categoryId).length;
    const msg = productsCount > 0
      ? (lang === 'uz'
          ? `Ushbu kategoriyada ${productsCount} ta mahsulot bor. Baribir o'chirmoqchimisiz?`
          : `В этой категории ${productsCount} товаров. Всё равно удалить?`)
      : t.deleteConfirmMsg;

    showConfirm(
      t.deleteConfirmTitle,
      msg,
      async () => {
        try {
          const res = await fetch(`/api/admin/categories/${categoryId}`, {
            method: 'DELETE',
            headers: getAdminHeaders()
          });
          const data = await res.json();
          if (data.success) {
            fetchCategories();
          } else {
            alert(data.message || (lang === 'uz' ? "Xatolik yuz berdi" : "Произошла ошибка"));
          }
        } catch (err) {
          console.warn('Failed to delete category:', err);
          alert(lang === 'uz' ? "Kategoriyani o'chirishda xatolik yuz berdi" : "Ошибка при удалении категории");
        }
      }
    );
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-3 text-xs font-semibold text-gray-500">Yuklanmoqda...</span>
      </div>
    );
  }

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categories.length]);

  const filteredCategories = categories.filter((c) => {
    const name = (c[`name_${lang}`] || c.name_uz || '').toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    const isActive = c.is_active === 1 || c.is_active === true;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && isActive) || (statusFilter === 'inactive' && !isActive);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base uppercase tracking-wider">
            {lang === 'uz' ? 'Toifalar ro\'yxati' : 'Список категорий'}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100/60">
            {filteredCategories.length} ta
          </span>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4 shrink-0" />
          <span>{t.addCategory}</span>
        </button>
      </div>

      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={lang === 'uz' ? 'Kategoriya nomini qidirish...' : 'Поиск категории по названию...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3.5 pr-4 py-2.5 bg-white border border-gray-150 rounded-xl text-xs font-medium placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all shadow-xs"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 border border-gray-150 rounded-xl shadow-xs shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: lang === 'uz' ? 'Barchasi' : 'Все' },
            { id: 'active', label: t.active },
            { id: 'inactive', label: t.inactive }
          ].map(st => (
            <button
              key={st.id}
              type="button"
              onClick={() => { triggerHaptic('light'); setStatusFilter(st.id); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 whitespace-nowrap active:scale-95 ${
                statusFilter === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories table */}
      {filteredCategories.length > 0 ? (
        <div className="bg-white border border-gray-155 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-5 w-16">{t.sortOrder}</th>
                  <th className="py-3 px-5">{t.itemName}</th>
                  <th className="py-3 px-5">{t.itemsCount}</th>
                  <th className="py-3 px-5">{t.status}</th>
                  <th className="py-3 px-5 text-right w-32">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-750">
                {filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((c, index) => {
                  const name = c[`name_${lang}`] || c.name_uz || '';
                  const productsCount = products.filter(p => p.category_id === c.id).length;
                  const isActive = c.is_active === 1 || c.is_active === true;
                  const itemIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5 font-bold text-gray-900">{itemIndex}</td>
                      <td className="py-3 px-5 font-bold text-gray-900">{name}</td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          {productsCount} ta
                        </span>
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-150'}`}>
                          {isActive ? t.active : t.inactive}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg transition-colors"
                          >
                            <PencilIcon className="w-5 h-5 shrink-0" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-5 h-5 shrink-0" />
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
          <FolderIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-xs font-bold text-gray-400">{t.empty}</p>
        </div>
      )}
    </div>
  );
};
