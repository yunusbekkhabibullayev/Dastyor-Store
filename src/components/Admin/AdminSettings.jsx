import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { PlusIcon, PencilIcon as Edit2Icon, TrashIcon as Trash2Icon, PhotoIcon as ImageIcon, ArrowUpTrayIcon as UploadIcon, XMarkIcon as XIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { AdminPagination } from './AdminPagination';
import { compressImage } from '../../utils/imageCompressor';

export const AdminSettings = () => {
  const { lang, triggerHaptic, showConfirm, getAdminHeaders, banners, setBanners, fetchBanners } = useStore();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [search, setSearch] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [banners.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, banners.length]);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    badge: 'YANGI',
    button_text: 'Batafsil'
  });

  const translations = {
    uz: {
      banners: 'Reklama Bannerlari',
      addBanner: 'Yangi banner qo\'shish',
      editBanner: 'Banner tahrirlash',
      title: 'Sarlavha',
      subtitle: 'Kichik sarlavha',
      badge: 'Nishon (masalan: YANGI)',
      btn: 'Tugma matni (masalan: Batafsil)',
      image: 'Banner rasmi',
      uploadBtn: 'Rasm yuklash',
      save: 'Saqlash',
      cancel: 'Bekor qilish',
      empty: 'Bannerlar topilmadi',
      deleteConfirmTitle: 'Bannerni o\'chirish',
      deleteConfirmMsg: 'Haqiqatan ham ushbu reklama bannerini o\'chirmoqchimisiz?',
      actions: 'Amallar'
    },
    ru: {
      banners: 'Рекламные баннеры',
      addBanner: 'Добавить баннер',
      editBanner: 'Редактировать баннер',
      title: 'Заголовок',
      subtitle: 'Подзаголовок',
      badge: 'Значок (например: НОВИНКА)',
      btn: 'Текст кнопки (например: Подробнее)',
      image: 'Изображение баннера',
      uploadBtn: 'Загрузить картинку',
      save: 'Сохранить',
      cancel: 'Отмена',
      empty: 'Баннеры не найдены',
      deleteConfirmTitle: 'Удалить баннер',
      deleteConfirmMsg: 'Вы действительно хотите удалить этот рекламный баннер?',
      actions: 'Действия'
    }
  };

  const t = translations[lang] || translations.uz;

  useEffect(() => {
    setLoading(true);
    fetchBanners();
    setLoading(false);
  }, []);

  const handleOpenAddModal = () => {
    triggerHaptic('light');
    setEditingBanner(null);
    setForm({
      title: '',
      subtitle: '',
      image: '',
      badge: 'YANGI',
      button_text: 'Batafsil'
    });
    setView('add');
  };

  const handleOpenEditModal = (banner) => {
    triggerHaptic('light');
    setEditingBanner(banner);
    setForm({
      id: banner.id,
      title: banner.title?.uz || banner.title_uz || banner.title || '',
      subtitle: banner.subtitle ? (banner.subtitle?.uz || banner.subtitle_uz || banner.subtitle || '') : '',
      image: banner.image || '',
      badge: banner.badge ? (banner.badge?.uz || banner.badge_uz || banner.badge || 'YANGI') : 'YANGI',
      button_text: banner.buttonText ? (banner.buttonText?.uz || banner.buttonText_uz || banner.buttonText || 'Batafsil') : 'Batafsil'
    });
    setView('edit');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    triggerHaptic('light');
    setUploadingImage(true);

    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressedFile);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: getAdminHeaders(), // Send admin token
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, image: data.fileUrl }));
      } else {
        alert(data.message || 'Yuklashda xatolik yuz berdi');
      }
    } catch (err) {
      console.warn('Image upload failed:', err);
      alert('Rasm yuklashda xatolik yuz berdi');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.image) {
      alert('Iltimos, banner rasmini yuklang!');
      return;
    }

    triggerHaptic('medium');
    setSubmitting(true);

    const isEdit = !!editingBanner;
    const url = isEdit ? `/api/admin/banners/${form.id}` : '/api/admin/banners';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      title_uz: form.title || 'Banner',
      title_ru: form.title || 'Banner',
      title_en: form.title || 'Banner',
      subtitle_uz: form.subtitle || '',
      subtitle_ru: form.subtitle || '',
      subtitle_en: form.subtitle || '',
      image: form.image,
      badge_uz: form.badge || 'YANGI',
      badge_ru: form.badge || 'YANGI',
      badge_en: form.badge || 'YANGI',
      button_text_uz: form.button_text || 'Batafsil',
      button_text_ru: form.button_text || 'Batafsil',
      button_text_en: form.button_text || 'Batafsil'
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setView('list');
        fetchBanners();
      }
    } catch (err) {
      console.warn('Failed to save banner:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (bannerId) => {
    triggerHaptic('warning');
    showConfirm(
      t.deleteConfirmTitle,
      t.deleteConfirmMsg,
      async () => {
        try {
          const res = await fetch(`/api/admin/banners/${bannerId}`, {
            method: 'DELETE',
            headers: getAdminHeaders()
          });
          const data = await res.json();
          if (data.success) {
            fetchBanners();
          }
        } catch (err) {
          console.warn('Failed to delete banner:', err);
        }
      }
    );
  };

  if (view === 'add' || view === 'edit') {
    return (
      <div className="space-y-6 text-left max-w-3xl">
        <button 
          onClick={() => {
            triggerHaptic('light');
            setView('list');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors animate-fadeIn"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>{lang === 'uz' ? 'Orqaga' : 'Назад'}</span>
        </button>

        <div className="bg-white border border-gray-155 rounded-2xl shadow-xs p-6 space-y-6">
          <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
            {editingBanner ? t.editBanner : t.addBanner}
          </h3>

          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Image upload section */}
            <div>
              <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wide block mb-1">{t.image}</label>
              <div className="flex items-center gap-3">
                <div className="w-20 aspect-video bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                  {form.image ? (
                    <img src={form.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-extrabold text-blue-600 hover:bg-blue-100/70 transition-all cursor-pointer">
                    <UploadIcon className="w-3.5 h-3.5" />
                    <span>{t.uploadBtn}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[9px] text-gray-400 mt-1">Format: png, jpg, webp. Maksimal hajm: 5MB</p>
                </div>
              </div>
            </div>

            {/* Title & Subtitle parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">{t.title}</label>
                <input
                  type="text" required
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">{t.subtitle}</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Badge & Button Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">{t.badge}</label>
                <input
                  type="text"
                  value={form.badge}
                  onChange={(e) => setForm(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">{t.btn}</label>
                <input
                  type="text"
                  value={form.button_text}
                  onChange={(e) => setForm(prev => ({ ...prev, button_text: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submission buttons */}
            <div className="pt-4 border-t border-gray-150 flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-xs text-white transition-all disabled:opacity-50"
              >
                {submitting ? 'Saqlanmoqda...' : t.save}
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-150 font-bold rounded-xl text-xs text-gray-700 transition-colors"
              >
                {t.cancel}
              </button>
            </div>

          </form>
        </div>
      </div>
    );
  }



  const filteredBanners = banners.filter(banner => {
    const title = (banner.title[lang] || banner.title['uz'] || '').toLowerCase();
    const subtitle = (banner.subtitle ? (banner.subtitle[lang] || banner.subtitle['uz'] || '') : '').toLowerCase();
    return title.includes(search.toLowerCase()) || subtitle.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base uppercase tracking-wider">
            {t.banners}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100/60">
            {filteredBanners.length} ta
          </span>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4 shrink-0" />
          <span>{t.addBanner}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder={lang === 'uz' ? 'Bannerni qidirish...' : 'Поиск баннера...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-3.5 pr-4 py-2.5 bg-white border border-gray-150 rounded-xl text-xs font-medium placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all shadow-xs"
        />
      </div>

      {/* Loading banner list */}
      {loading && banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-155 rounded-2xl shadow-xs">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-3 text-xs font-semibold text-gray-500">Yuklanmoqda...</span>
        </div>
      ) : filteredBanners.length > 0 ? (
        <div className="bg-white border border-gray-155 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBanners.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((banner) => {
              const title = banner.title[lang] || banner.title['uz'] || '';
              const subtitle = banner.subtitle ? (banner.subtitle[lang] || banner.subtitle['uz'] || '') : '';
              const badge = banner.badge ? (banner.badge[lang] || banner.badge['uz'] || '') : '';

              return (
                <div 
                  key={banner.id}
                  className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  {/* Banner Preview */}
                  <div className="relative aspect-[16/7] w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={banner.image} 
                      alt={title}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      {badge && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white mb-1 shadow-sm uppercase">
                          {badge}
                        </span>
                      )}
                      <h4 className="text-white font-bold text-sm leading-tight">{title}</h4>
                      {subtitle && <p className="text-white/80 text-[10px] font-medium mt-0.5">{subtitle}</p>}
                    </div>
                  </div>

                  {/* Banner Actions Footer */}
                  <div className="px-4 py-3 bg-slate-50/50 border-t border-gray-100 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      ID: #{banner.id}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(banner)}
                        className="p-1.5 text-blue-600 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all border border-blue-100/50"
                      >
                        <Edit2Icon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-1.5 text-rose-600 bg-rose-50/50 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-all border border-rose-100/50"
                      >
                        <Trash2Icon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={Math.ceil(banners.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            triggerHaptic={triggerHaptic}
          />
        </div>
      ) : (
        <div className="py-20 text-center bg-white border border-gray-155 rounded-2xl shadow-xs">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-xs font-bold text-gray-400">{t.empty}</p>
        </div>
      )}
    </div>
  );
};
