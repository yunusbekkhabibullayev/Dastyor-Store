import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  BuildingStorefrontIcon as StoreIcon, 
  ArrowUpTrayIcon as UploadIcon,
  PaperAirplaneIcon as SendIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon as RefreshIcon,
  LinkIcon,
  TrashIcon,
  TruckIcon,
  Cog6ToothIcon as SettingsIcon,
  GlobeAltIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { compressImage } from '../../utils/imageCompressor';

export const AdminSiteSettings = () => {
  const { lang, triggerHaptic, getAdminHeaders, fetchSiteSettings, setAdminTab } = useStore();

  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showBotToken, setShowBotToken] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [adminIdsList, setAdminIdsList] = useState([]);
  const [newAdminIdInput, setNewAdminIdInput] = useState('');

  // Phone state: 9 digits after permanent +998
  const [phoneDigits, setPhoneDigits] = useState('901234567');
  const [phoneError, setPhoneError] = useState('');

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookInfo, setWebhookInfo] = useState(null);
  const [settingWebhook, setSettingWebhook] = useState(false);

  const [form, setForm] = useState({
    name: 'Ravshan Rivoj Market',
    description: 'Oziq-ovqat mahsulotlari do\'koni',
    logo: '',
    address: 'Toshkent sh.',
    working_hours: '09:00 - 22:00',
    telegram_channel: '',
    instagram: '',
    bot_token: '',
    bot_username: 'ravshan_rivoj_bot',
    delivery_price: 0,
    bts_delivery_price: 50000
  });

  const fetchWebhookStatus = async () => {
    try {
      const res = await fetch('/api/admin/telegram/webhook-status', {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success && data.webhookInfo) {
        setWebhookInfo(data.webhookInfo);
        if (data.webhookInfo.url) {
          setWebhookUrl(data.webhookInfo.url);
        } else {
          setWebhookUrl(`${window.location.origin}/telegram/webhook`);
        }
      } else {
        setWebhookUrl(`${window.location.origin}/telegram/webhook`);
      }
    } catch (err) {
      console.warn('Webhook status fetch failed:', err);
      setWebhookUrl(`${window.location.origin}/telegram/webhook`);
    }
  };

  const parsePhoneDigits = (fullPhone) => {
    if (!fullPhone) return '';
    const clean = fullPhone.replace(/\D/g, '');
    if (clean.startsWith('998')) {
      return clean.slice(3, 12);
    }
    return clean.slice(-9);
  };

  useEffect(() => {
    const loadFullSettings = async () => {
      try {
        const res = await fetch('/api/admin/site-settings', { headers: getAdminHeaders() });
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setForm({
            name: s.name || 'Ravshan Rivoj Market',
            description: s.description || '',
            logo: s.logo || '',
            address: s.address || '',
            working_hours: s.working_hours || '09:00 - 22:00',
            telegram_channel: s.telegram_channel || '',
            instagram: s.instagram || '',
            bot_token: s.bot_token || '',
            bot_username: s.bot_username || '',
            delivery_price: s.delivery_price || 0,
            bts_delivery_price: s.bts_delivery_price || 50000
          });
          setLogoPreview(s.logo || '');
          if (s.phone) {
            setPhoneDigits(parsePhoneDigits(s.phone));
          }
          setAdminIdsList(s.admin_ids ? s.admin_ids.split(',').map(x => x.trim()).filter(Boolean) : []);
        }
      } catch (err) {
        console.warn('Failed to load admin site settings:', err);
      }
    };
    loadFullSettings();
    fetchWebhookStatus();
  }, []);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhoneDigits(val);
    if (val.length > 0 && val.length < 9) {
      setPhoneError(lang === 'uz' ? 'Raqam 9 ta raqamdan iborat bo\'lishi kerak' : 'Номер должен состоять из 9 цифр');
    } else {
      setPhoneError('');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    triggerHaptic('light');

    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressedFile);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, logo: data.fileUrl }));
        setLogoPreview(data.fileUrl);
        triggerHaptic('notification');
      } else {
        alert(data.message || 'Rasm yuklashda xatolik yuz berdi');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      alert('Rasm yuklashda xatolik yuz berdi');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (phoneDigits.length > 0 && phoneDigits.length < 9) {
      setPhoneError(lang === 'uz' ? 'Raqam 9 ta raqamdan iborat bo\'lishi kerak' : 'Номер должен состоять из 9 цифр');
      triggerHaptic('warning');
      return;
    }

    setSubmitting(true);
    triggerHaptic('medium');

    const fullPhone = phoneDigits ? `+998${phoneDigits}` : '';

    const payload = {
      name: form.name || 'Ravshan Rivoj Market',
      description: form.description || '',
      logo: form.logo || '',
      phone: fullPhone,
      address: form.address || '',
      working_hours: form.working_hours || '09:00 - 22:00',
      telegram_channel: form.telegram_channel || '',
      instagram: form.instagram || '',
      bot_token: form.bot_token || '',
      bot_username: form.bot_username || '',
      delivery_price: parseInt(form.delivery_price, 10) || 0,
      bts_delivery_price: parseInt(form.bts_delivery_price, 10) || 0,
      admin_ids: adminIdsList.join(','),
      is_active: 1
    };

    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        triggerHaptic('notification');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (fetchSiteSettings) fetchSiteSettings();
      } else {
        alert(data.message || 'Sozlamalarni saqlashda xatolik yuz berdi');
      }
    } catch (err) {
      console.error('Settings save error:', err);
      alert('Sozlamalarni saqlashda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    triggerHaptic('light');

    try {
      const res = await fetch('/api/admin/test-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({ bot_token: form.bot_token })
      });
      const data = await res.json();
      if (data.success) {
        triggerHaptic('notification');
        alert('✅ ' + (data.message || 'Telegram bot bilan aloqa muvaffaqiyatli o\'rnatildi!'));
      } else {
        triggerHaptic('warning');
        alert('❌ ' + (data.message || 'Telegram bot ulanishida xatolik yuz berdi'));
      }
    } catch (err) {
      triggerHaptic('warning');
      alert('Telegram ulanishini tekshirishda xatolik yuz berdi');
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleSetWebhook = async () => {
    if (!webhookUrl) return alert('Webhook URL kiritilishi shart');
    setSettingWebhook(true);
    triggerHaptic('light');
    try {
      const res = await fetch('/api/admin/telegram/set-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({ url: webhookUrl })
      });
      const data = await res.json();
      if (data.success) {
        triggerHaptic('notification');
        alert('✅ Webhook muvaffaqiyatli o\'rnatildi!');
      } else {
        triggerHaptic('warning');
        alert('❌ ' + (data.message || 'Xatolik yuz berdi'));
      }
      fetchWebhookStatus();
    } catch (err) {
      alert('Webhook o\'rnatishda xatolik yuz berdi');
    } finally {
      setSettingWebhook(false);
    }
  };

  const handleDeleteWebhook = async () => {
    triggerHaptic('warning');
    if (!window.confirm('Webhookni o\'chirmoqchimisiz?')) return;
    try {
      const res = await fetch('/api/admin/telegram/delete-webhook', {
        method: 'POST',
        headers: getAdminHeaders()
      });
      const data = await res.json();
      triggerHaptic('notification');
      alert(data.message || 'Webhook o\'chirildi!');
      fetchWebhookStatus();
    } catch (err) {
      alert('Webhook o\'chirishda xatolik');
    }
  };

  const settingsTabs = [
    { id: 'general', name: lang === 'uz' ? 'Do\'kon Profili' : 'Профиль магазина', icon: StoreIcon },
    { id: 'delivery', name: lang === 'uz' ? 'Yetkazib Berish' : 'Доставка', icon: TruckIcon },
    { id: 'telegram', name: 'Telegram & Webhook', icon: SendIcon },
    { id: 'notifications', name: lang === 'uz' ? 'Xabarnomalar' : 'Уведомления', icon: UserGroupIcon }
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-16 animate-fadeIn">
      {/* Top Header & Save Button Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-150 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <SettingsIcon className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 leading-tight">
              {lang === 'uz' ? 'Do\'kon Sozlamalari' : 'Настройки магазина'}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {lang === 'uz' 
                ? 'Do\'kon rekvizitlari, yetkazib berish narxlari va Telegram bot integratsiyasi' 
                : 'Параметры магазина, тарифы доставки и интеграция с Telegram'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl animate-fadeIn">
              <CheckIcon className="w-4 h-4" />
              <span>{lang === 'uz' ? 'Saqlandi!' : 'Сохранено!'}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/15 transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>{submitting ? (lang === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...') : (lang === 'uz' ? 'Saqlash' : 'Сохранить')}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeSettingsTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveSettingsTab(tab.id);
              }}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none
                ${active 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'bg-white text-gray-600 border border-gray-150 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── TAB 1: General Store Profile ─────────────────────────────────── */}
        {activeSettingsTab === 'general' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Logo and Identity Card */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <StoreIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-gray-900 text-sm">
                  {lang === 'uz' ? 'Do\'konning Asosiy Ko\'rinishi' : 'Основной вид магазина'}
                </h3>
              </div>

              {/* Logo Section */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-2">
                  {lang === 'uz' ? 'Do\'kon Logotipi' : 'Логотип магазина'}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" onError={() => setLogoPreview(null)} />
                    ) : (
                      <UploadIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 rounded-xl text-xs font-extrabold transition-all cursor-pointer border border-blue-100 shadow-2xs">
                      <UploadIcon className="w-4 h-4" />
                      <span>{uploadingLogo ? (lang === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...') : (lang === 'uz' ? 'Logotip yuklash' : 'Загрузить логотип')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(p => ({ ...p, logo: '' }));
                          setLogoPreview(null);
                        }}
                        className="block text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        {lang === 'uz' ? 'Logotipni olib tashlash' : 'Удалить логотип'}
                      </button>
                    )}
                    <p className="text-[10px] text-gray-400 font-medium">
                      PNG, JPG yoki WEBP formatidagi rasmlar (tavsiya: kvadrat o'lcham)
                    </p>
                  </div>
                </div>
              </div>

              {/* Name & Slogan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">
                    {lang === 'uz' ? 'Do\'kon Nomi' : 'Название магазина'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ravshan Rivoj Market"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">
                    {lang === 'uz' ? 'Qisqacha Tavsif / Slogan' : 'Краткое описание'}
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Oziq-ovqat mahsulotlari do'koni"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Contacts & Location Card */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <PhoneIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-gray-900 text-sm">
                  {lang === 'uz' ? 'Aloqa va Manzil Rekvizitlari' : 'Контакты и локация'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">
                    {lang === 'uz' ? 'Do\'kon Telefon Raqami' : 'Телефон магазина'}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-extrabold text-gray-600 select-none pointer-events-none">
                      +998
                    </span>
                    <input
                      type="text"
                      placeholder="90 123 45 67"
                      value={phoneDigits}
                      onChange={handlePhoneChange}
                      className="w-full pl-14 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1">{phoneError}</p>
                  )}
                </div>

                {/* Working Hours */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">
                    {lang === 'uz' ? 'Ish Vaqti' : 'Время работы'}
                  </label>
                  <div className="relative">
                    <ClockIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.working_hours}
                      onChange={(e) => setForm(prev => ({ ...prev, working_hours: e.target.value }))}
                      placeholder="09:00 - 22:00"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">
                    {lang === 'uz' ? 'Do\'kon Manzili (Shahar, tuman, ko\'cha)' : 'Адрес магазина'}
                  </label>
                  <div className="relative">
                    <MapPinIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Toshkent sh., Chilonzor tumani..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">
                    Telegram Kanal / Guruh Havolasi
                  </label>
                  <input
                    type="text"
                    value={form.telegram_channel}
                    onChange={(e) => setForm(prev => ({ ...prev, telegram_channel: e.target.value }))}
                    placeholder="https://t.me/ravshanrivoj"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">
                    Instagram Profil Havolasi
                  </label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://instagram.com/ravshanrivoj"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Delivery Rates ───────────────────────────────────────── */}
        {activeSettingsTab === 'delivery' && (
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-2xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <TruckIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-gray-900 text-sm">
                {lang === 'uz' ? 'Yetkazib Berish Ta\'riflari va Narxlari' : 'Тарифы доставки'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* City Delivery */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-100/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <span>🛵 Shahar Ichida Yetkazib Berish</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Standart
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Mijoz savatchani rasmiylashtirayotganda standart yetkazish uchun hisoblanadi (0 kiritilsa bepul bo'ladi).
                </p>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    value={form.delivery_price === 0 || form.delivery_price === '0' || form.delivery_price === '' ? '' : form.delivery_price}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        delivery_price: raw === '' ? 0 : (parseInt(raw, 10) || 0)
                      }));
                    }}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm font-mono font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">so'm</span>
                </div>
              </div>

              {/* Regional BTS Delivery */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-100/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <span>🚚 BTS / Viloyatlarga Yetkazib Berish</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Viloyatlar
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Boshqa viloyat va tumanlarga BTS pochtasi orqali yetkazib berish narxi.
                </p>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="50000"
                    value={form.bts_delivery_price === 0 || form.bts_delivery_price === '0' || form.bts_delivery_price === '' ? '' : form.bts_delivery_price}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        bts_delivery_price: raw === '' ? 0 : (parseInt(raw, 10) || 0)
                      }));
                    }}
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-sm font-mono font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">so'm</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: Telegram Bot & Webhook ───────────────────────────────── */}
        {activeSettingsTab === 'telegram' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <SendIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-gray-900 text-sm">
                    Telegram Bot Integratsiyasi
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 rounded-xl text-xs font-extrabold border border-blue-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshIcon className={`w-3.5 h-3.5 ${testingTelegram ? 'animate-spin' : ''}`} />
                  <span>{testingTelegram ? 'Tekshirilmoqda...' : 'Botni Sinash'}</span>
                </button>
              </div>

              {/* Bot Token */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                  Telegram Bot API Token (@BotFather'dan olingan)
                </label>
                <div className="relative">
                  <input
                    type={showBotToken ? 'text' : 'password'}
                    placeholder="789123456:AAHxxxx..."
                    value={form.bot_token}
                    onChange={(e) => setForm(prev => ({ ...prev, bot_token: e.target.value }))}
                    className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBotToken(!showBotToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showBotToken ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Webhook Status & Control */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900">
                    Webhook Manzili va Holati
                  </span>
                  {webhookInfo && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${webhookInfo.url ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      <div className={`w-2 h-2 rounded-full ${webhookInfo.url ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                      <span>{webhookInfo.url ? 'Webhook Faol' : 'Webhook Ulanmagan'}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-domain.com/telegram/webhook"
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono font-medium text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSetWebhook}
                      disabled={settingWebhook}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>{settingWebhook ? 'O\'rnatilmoqda...' : 'O\'rnatish'}</span>
                    </button>
                    {webhookInfo && webhookInfo.url && (
                      <button
                        type="button"
                        onClick={handleDeleteWebhook}
                        className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-200 flex items-center gap-1 cursor-pointer"
                        title="Webhookni bekor qilish"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  SSL (HTTPS) domen manzili orqali Telegram serveridan so'rovlarni qabul qilish.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: Staff & Notification Recipients ─────────────────────── */}
        {activeSettingsTab === 'notifications' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Shortcut Card to Modern Employees */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-blue-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-sm">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-200" />
                  <span>Xodimlar va Rollar Boshqaruvi</span>
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  Barcha do'kon xodimlari (Dasturchi, Super Admin, Menejer, Kuryer) maxsus "Xodimlar" bo'limida boshqariladi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setAdminTab('employees');
                }}
                className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 active:scale-95 font-extrabold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap self-start sm:self-auto"
              >
                Xodimlarga o'tish →
              </button>
            </div>

            {/* Notification recipient IDs Card */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">
                    Yangi Buyurtma Bildirishnomalarini Oluvchi Adminlar
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Do'konga yangi buyurtma tushganida bot orqali xabar yuboriladigan Telegram ID raqamlar ro'yxati.
                  </p>
                </div>
              </div>

              {/* Add recipient input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAdminIdInput}
                  onChange={(e) => setNewAdminIdInput(e.target.value)}
                  placeholder="Telegram ID: masalan 1165441564"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    if (!newAdminIdInput.trim()) return;
                    const clean = newAdminIdInput.trim();
                    if (isNaN(parseInt(clean, 10))) {
                      alert('ID faqat raqamlardan iborat bo\'lishi kerak!');
                      return;
                    }
                    if (adminIdsList.includes(clean)) {
                      alert('Bu Telegram ID allaqachon qo\'shilgan!');
                      return;
                    }
                    setAdminIdsList(prev => [...prev, clean]);
                    setNewAdminIdInput('');
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
                >
                  Qo'shish
                </button>
              </div>

              {/* List */}
              {adminIdsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {adminIdsList.map((id) => (
                    <div key={id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50/50 rounded-xl border border-gray-200 transition-colors">
                      <span className="font-mono font-bold text-xs text-gray-800">
                        {id}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('warning');
                          setAdminIdsList(prev => prev.filter(item => item !== id));
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic py-2">
                  Qo'shimcha ID kiritilmagan. Bildirishnomalar faqat asosiy adminlarga yuboriladi.
                </p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
