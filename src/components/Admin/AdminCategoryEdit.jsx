import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const AdminCategoryEdit = () => {
  const { lang, setAdminTab, triggerHaptic, getAdminHeaders, selectedAdminCategory, fetchCategories } = useStore();
  const [submitting, setSubmitting] = useState(false);

  const category = selectedAdminCategory;

  if (!category) return null;

  const [form, setForm] = useState({
    name_uz: category.name_uz || '',
    name_ru: category.name_ru || '',
    name_en: category.name_en || '',
    sort_order: category.sort_order || 0,
    is_active: category.is_active === 1 || category.is_active === true
  });

  const translations = {
    uz: {
      back: 'Orqaga',
      editCat: 'Kategoriyani tahrirlash',
      nameUz: '🇺🇿 Kategoriya nomi (O\'zbekcha)',
      nameRu: '🇷🇺 Kategoriya nomi (Ruscha)',
      nameEn: '🇬🇧 Kategoriya nomi (Inglizcha)',
      sortOrder: 'Tartib raqami',
      active: 'Faol',
      activeHelp: 'Kategoriyani menyuda ko\'rsatish',
      update: 'Yangilash',
      cancel: 'Bekor qilish'
    },
    ru: {
      back: 'Назад',
      editCat: 'Редактировать категорию',
      nameUz: '🇺🇿 Название (Узбекский)',
      nameRu: '🇷🇺 Название (Русский)',
      nameEn: '🇬🇧 Название (Английский)',
      sortOrder: 'Порядковый номер',
      active: 'Активен',
      activeHelp: 'Показывать категорию в меню',
      update: 'Обновить',
      cancel: 'Отмена'
    }
  };

  const t = translations[lang] || translations.uz;

  const handleSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic('medium');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({
          ...form,
          id: category.id
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        setAdminTab('categories');
      }
    } catch (err) {
      console.warn('Failed to update category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl">
      <button 
        onClick={() => {
          triggerHaptic('light');
          setAdminTab('categories');
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>{t.back}</span>
      </button>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-xs p-6 space-y-6">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          {t.editCat}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Single Category Name Input */}
          <div>
            <label className="text-xs font-extrabold text-gray-700 block mb-1.5">
              {lang === 'uz' ? 'Kategoriya nomi' : 'Название категории'} *
            </label>
            <input
              type="text" required
              value={form.name_uz}
              onChange={(e) => setForm(prev => ({ ...prev, name_uz: e.target.value, name_ru: e.target.value, name_en: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Toggle Switch */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="text-left">
              <label className="text-xs font-extrabold text-gray-800">{t.active}</label>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{t.activeHelp}</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${form.is_active ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform duration-250 ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-155 flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {submitting && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
              <span>{t.update}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setAdminTab('categories');
              }}
              className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
