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
  TrashIcon
} from '@heroicons/react/24/outline';
import { compressImage } from '../../utils/imageCompressor';

export const AdminSiteSettings = () => {
  const { lang, triggerHaptic, getAdminHeaders, fetchSiteSettings } = useStore();

  const [submitting, setSubmitting] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [adminIdsList, setAdminIdsList] = useState([]);
  const [newAdminIdInput, setNewAdminIdInput] = useState('');

  // Phone state: 9 digits after permanent +998
  const [phoneDigits, setPhoneDigits] = useState('901234567');
  const [phoneError, setPhoneError] = useState('');

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookInfo, setWebhookInfo] = useState(null);

  const [form, setForm] = useState({
    name: 'Qlay Store',
    logo: '',
    bot_token: '',
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

  // bot_token/admin_ids are stripped from the public /api/site-settings
  // response — this screen needs the real values, so it fetches the
  // auth-gated admin copy directly instead of using the shared public
  // `siteSettings` from context.
  useEffect(() => {
    const loadFullSettings = async () => {
      try {
        const res = await fetch('/api/admin/site-settings', { headers: getAdminHeaders() });
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setForm({
            name: s.name || 'Ravshan Rivoj Market',
            logo: s.logo || '',
            bot_token: s.bot_token || '',
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
    e.preventDefault();

    if (phoneDigits.length > 0 && phoneDigits.length < 9) {
      setPhoneError(lang === 'uz' ? 'Raqam 9 ta raqamdan iborat bo\'lishi kerak' : 'Номер должен состоять из 9 цифр');
      return;
    }

    setSubmitting(true);
    triggerHaptic('medium');

    const fullPhone = phoneDigits ? `+998${phoneDigits}` : '';

    const payload = {
      name: form.name || 'Ravshan Rivoj Market',
      logo: form.logo || '',
      phone: fullPhone,
      bot_token: form.bot_token || '',
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
        alert(lang === 'uz' ? 'Sozlamalar saqlandi!' : 'Настройки сохранены!');
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
        alert(data.message);
      } else {
        alert(data.message || 'Telegram bot ulanishida xatolik yuz berdi');
      }
    } catch (err) {
      console.error('Telegram test error:', err);
      alert('Telegram ulanishini tekshirishda xatolik yuz berdi');
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleSetWebhook = async () => {
    if (!webhookUrl) return alert('Webhook URL kiritilishi shart');
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
      alert(data.message || (data.success ? 'Webhook o\'rnatildi!' : 'Xatolik'));
      fetchWebhookStatus();
    } catch (err) {
      alert('Webhook o\'rnatishda xatolik');
    }
  };

  const handleDeleteWebhook = async () => {
    triggerHaptic('warning');
    try {
      const res = await fetch('/api/admin/telegram/delete-webhook', {
        method: 'POST',
        headers: getAdminHeaders()
      });
      const data = await res.json();
      alert(data.message || 'Webhook o\'chirildi!');
      fetchWebhookStatus();
    } catch (err) {
      alert('Webhook o\'chirishda xatolik');
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto pb-10">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Store Base Info */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <StoreIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <h3 className="font-bold text-gray-900 text-sm">
              {lang === 'uz' ? 'Do\'kon Ma\'lumotlari' : 'Данные магазина'}
            </h3>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {lang === 'uz' ? 'Sayt Logotipi' : 'Логотип сайта'}
            </label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs border-dashed">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" onError={() => setLogoPreview(null)} />
                ) : (
                  <UploadIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 rounded-xl text-xs font-bold transition-all cursor-pointer border border-blue-100 shadow-2xs">
                  <UploadIcon className="w-4 h-4 shrink-0" />
                  <span>{uploadingLogo ? (lang === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...') : (lang === 'uz' ? 'Logotipni almashtirish' : 'Изменить логотип')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Store Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'uz' ? 'Do\'kon Nomi' : 'Название магазина'} *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Permanent +998 Phone Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'uz' ? 'Telefon Raqami' : 'Номер телефона'}
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
                  className="w-full pl-14 pr-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              {phoneError && (
                <p className="text-[10px] text-rose-500 font-bold mt-1">{phoneError}</p>
              )}
            </div>
          </div>

          {/* Delivery Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'uz' ? 'Shahar ichida yetkazib berish narxi (so\'m)' : 'Стоимость доставки по городу (сум)'}
              </label>
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
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'uz' ? 'BTS yetkazib berish narxi (so\'m)' : 'Стоимость доставки BTS (сум)'}
              </label>
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
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Telegram Bot & Webhook */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <SendIcon className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="font-bold text-gray-900 text-sm">
                Telegram Bot
              </h3>
            </div>

            {/* Blue Styled Test Button (2-rasm) */}
            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testingTelegram}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
            >
              <RefreshIcon className={`w-3.5 h-3.5 ${testingTelegram ? 'animate-spin' : ''}`} />
              <span>{testingTelegram ? (lang === 'uz' ? 'Sinovda...' : 'Тест...') : (lang === 'uz' ? 'Botni Sinash' : 'Тест Бота')}</span>
            </button>
          </div>

          {/* Telegram Bot Token */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {lang === 'uz' ? 'Telegram Bot Token' : 'Токен Telegram Бота'}
            </label>
            <input
              type="text"
              placeholder="789123456:AAHxxxx..."
              value={form.bot_token}
              onChange={(e) => setForm(prev => ({ ...prev, bot_token: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-mono font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Webhook Configuration Section */}
          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-gray-800">
                Telegram Webhook URL
              </label>
              {webhookInfo && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${webhookInfo.url ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {webhookInfo.url ? (
                    <>
                      <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                      <span>{lang === 'uz' ? 'Webhook Faol' : 'Webhook Активен'}</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-3 h-3 text-amber-600" />
                      <span>{lang === 'uz' ? 'Webhook O\'rnatilmagan' : 'Webhook не настроен'}</span>
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.com/telegram/webhook"
                className="flex-1 px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-mono font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={handleSetWebhook}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{lang === 'uz' ? 'O\'rnatish' : 'Установить'}</span>
              </button>
              {webhookInfo && webhookInfo.url && (
                <button
                  type="button"
                  onClick={handleDeleteWebhook}
                  className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-200 flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Webhook o'chirish"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-semibold">
              {lang === 'uz' ? 'Ngrok yoki SSL domen manzilingiz orqali Telegram webhook o\'rnatiladi.' : 'Telegram webhook устанавливается через SSL домен или Ngrok.'}
            </p>
          </div>
        {/* Section 3: Manage Admins */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <SendIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <h3 className="font-bold text-gray-900 text-sm">
              {lang === 'uz' ? 'Telegram Adminlarni Boshqarish' : 'Управление администраторами Telegram'}
            </h3>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700">
              {lang === 'uz' ? 'Yangi Admin Telegram Chat ID' : 'Telegram Chat ID нового админа'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAdminIdInput}
                onChange={(e) => setNewAdminIdInput(e.target.value)}
                placeholder="1165441564"
                className="flex-1 px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-mono font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  if (!newAdminIdInput.trim()) return;
                  const clean = newAdminIdInput.trim();
                  if (isNaN(parseInt(clean, 10))) {
                    alert(lang === 'uz' ? 'ID faqat raqamlardan iborat bo\'lishi kerak!' : 'ID должен состоять только из цифр!');
                    return;
                  }
                  if (adminIdsList.includes(clean)) {
                    alert(lang === 'uz' ? 'Bu ID allaqachon qo\'shilgan!' : 'Этот ID уже добавлен!');
                    return;
                  }
                  setAdminIdsList(prev => [...prev, clean]);
                  setNewAdminIdInput('');
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                {lang === 'uz' ? 'Qo\'shish' : 'Добавить'}
              </button>
            </div>

            {/* List of custom admins */}
            {adminIdsList.length > 0 ? (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  {lang === 'uz' ? 'Qo\'shilgan admin ID ro\'yxati:' : 'Список добавленных ID:'}
                </span>
                <div className="divide-y divide-gray-100 border border-gray-155 rounded-xl bg-gray-55/30 overflow-hidden">
                  {adminIdsList.map((id) => (
                    <div key={id} className="flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50/50 transition-colors">
                      <span className="text-xs font-mono font-semibold text-gray-800">{id}</span>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('warning');
                          setAdminIdsList(prev => prev.filter(item => item !== id));
                        }}
                        className="text-red-500 hover:text-red-600 transition-colors p-1"
                        title={lang === 'uz' ? 'O\'chirish' : 'Удалить'}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic pt-1">
                {lang === 'uz' ? 'Hozircha qo\'shimcha adminlar yo\'q. Faqat .env da kiritilgan adminlar xabar oladi.' : 'Дополнительных админов нет. Уведомления получат только админы из .env.'}
              </p>
            )}
          </div>
        </div>
      </div>

        {/* Submit Actions Bar - Full Width Button */}
        <div className="pt-3 border-t border-gray-150">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 cursor-pointer"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>{submitting ? (lang === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...') : (lang === 'uz' ? 'Sozlamalarni Saqlash' : 'Сохранить настройки')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
