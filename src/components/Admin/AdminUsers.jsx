import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  UsersIcon, 
  MagnifyingGlassIcon as SearchIcon, 
  PhoneIcon, 
  ShoppingBagIcon, 
  BanknotesIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  NoSymbolIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  ChatBubbleLeftEllipsisIcon,
  GlobeAltIcon,
  PaperAirplaneIcon,
  BoltIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ArrowPathIcon as RefreshIcon
} from '@heroicons/react/24/outline';
import { AdminPagination } from './AdminPagination';

export const AdminUsers = () => {
  const { lang, triggerHaptic, getAdminHeaders, showConfirm, formatQuantity } = useStore();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    telegramUsers: 0,
    webUsers: 0,
    activeBuyers: 0,
    totalRevenue: 0
  });
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedBlocked, setSelectedBlocked] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '15',
        search: search.trim(),
        source: selectedSource,
        isBlocked: selectedBlocked
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error('Failed to fetch CRM users:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedSource, selectedBlocked]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleOpenDetail = async (user) => {
    triggerHaptic('light');
    setSelectedUser(user);
    setNotesText(user.notes || '');
    setLoadingDetail(true);

    try {
      const res = await fetch(`/api/admin/users/${user.telegram_id}`, {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setSelectedUser(data.user);
        setUserOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to load user details:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedUser) return;
    triggerHaptic('medium');
    setSavingNotes(true);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.telegram_id}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({ notes: notesText })
      });
      const data = await res.json();
      if (data.success) {
        triggerHaptic('notification');
        setSelectedUser(prev => ({ ...prev, notes: notesText }));
        setUsers(prev => prev.map(u => u.telegram_id === selectedUser.telegram_id ? { ...u, notes: notesText } : u));
      }
    } catch (e) {
      console.error('Failed to save notes:', e);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleToggleBlock = (user) => {
    triggerHaptic('warning');
    const actionText = user.is_blocked 
      ? (lang === 'uz' ? 'blokdan chiqarmoqchimisiz' : 'разблокировать') 
      : (lang === 'uz' ? 'bloklamoqchimisiz' : 'заблокировать');

    showConfirm(
      lang === 'uz' ? 'Foydalanuvchi holati' : 'Статус пользователя',
      `${user.name || user.phone}ni haqiqatan ham ${actionText}?`,
      async () => {
        try {
          const res = await fetch(`/api/admin/users/${user.telegram_id}/block`, {
            method: 'PATCH',
            headers: getAdminHeaders()
          });
          const data = await res.json();
          if (data.success && data.user) {
            triggerHaptic('notification');
            setUsers(prev => prev.map(u => u.telegram_id === user.telegram_id ? data.user : u));
            if (selectedUser && selectedUser.telegram_id === user.telegram_id) {
              setSelectedUser(data.user);
            }
          }
        } catch (e) {
          console.error('Failed to toggle block:', e);
        }
      }
    );
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('uz-UZ').format(val || 0) + ' so\'m';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getSourceBadge = (source) => {
    if (source === 'both') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <BoltIcon className="w-3 h-3 text-amber-500" />
          <span>Birikkan</span>
        </span>
      );
    } else if (source === 'telegram') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <PaperAirplaneIcon className="w-3 h-3 text-sky-500" />
          <span>Telegram</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <GlobeAltIcon className="w-3 h-3 text-emerald-500" />
          <span>Web Sayt</span>
        </span>
      );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-blue-600" />
            <span>{lang === 'uz' ? 'Mijozlar Bazasi (CRM)' : 'База клиентов (CRM)'}</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {lang === 'uz' 
              ? 'Telegram va Web sayt orqali ro\'yxatdan o\'tgan barcha mijozlar profili' 
              : 'Профили всех клиентов из Telegram и веб-сайта'}
          </p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            setRefreshing(true);
            fetchUsers();
          }}
          disabled={refreshing}
          className="self-start sm:self-auto px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
        >
          <RefreshIcon className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{lang === 'uz' ? 'Yangilash' : 'Обновить'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'uz' ? 'Jami Mijozlar' : 'Всего клиентов'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-gray-900 mt-2">{stats.totalUsers}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-400">
            <span>📱 {stats.telegramUsers} TG</span>
            <span>•</span>
            <span>🌐 {stats.webUsers} Web</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'uz' ? 'Faol Xaridorlar' : 'Активные покупатели'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              <ShoppingBagIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-600 mt-2">{stats.activeBuyers}</p>
          <p className="text-[10px] font-semibold text-gray-400 mt-1">
            {stats.totalUsers > 0 ? Math.round((stats.activeBuyers / stats.totalUsers) * 100) : 0}% konversiya
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'uz' ? 'Jami Savdo (LTV)' : 'Общий оборот'}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              <BanknotesIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black text-indigo-600 mt-2 truncate">
            {formatPrice(stats.totalRevenue)}
          </p>
          <p className="text-[10px] font-semibold text-gray-400 mt-1">
            Mijozlar keltirgan daromad
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'uz' ? 'O\'rtacha Chek' : 'Средний чек'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              <BoltIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black text-amber-600 mt-2 truncate">
            {formatPrice(stats.activeBuyers > 0 ? Math.round(stats.totalRevenue / stats.activeBuyers) : 0)}
          </p>
          <p className="text-[10px] font-semibold text-gray-400 mt-1">
            Har bir faol xaridorga
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'uz' ? 'Ism, telefon raqam yoki username bo\'yicha qidirish...' : 'Поиск по имени, телефону или username...'}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
          >
            {lang === 'uz' ? 'Qidirish' : 'Найти'}
          </button>
        </form>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold select-none">
          <button
            onClick={() => { triggerHaptic('light'); setSelectedSource('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 ${
              selectedSource === 'all' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {lang === 'uz' ? 'Barcha kanallar' : 'Все каналы'}
          </button>
          <button
            onClick={() => { triggerHaptic('light'); setSelectedSource('telegram'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
              selectedSource === 'telegram' 
                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </button>
          <button
            onClick={() => { triggerHaptic('light'); setSelectedSource('web'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
              selectedSource === 'web' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <GlobeAltIcon className="w-3.5 h-3.5" />
            <span>Web Sayt</span>
          </button>
          <button
            onClick={() => { triggerHaptic('light'); setSelectedSource('both'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
              selectedSource === 'both' 
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <BoltIcon className="w-3.5 h-3.5" />
            <span>Birikkan</span>
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1 shrink-0"></div>

          <button
            onClick={() => { 
              triggerHaptic('light'); 
              setSelectedBlocked(selectedBlocked === 'true' ? 'all' : 'true'); 
              setCurrentPage(1); 
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
              selectedBlocked === 'true' 
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <NoSymbolIcon className="w-3.5 h-3.5 text-rose-500" />
            <span>{lang === 'uz' ? 'Bloklanganlar' : 'Заблокированные'}</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-150 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400">{lang === 'uz' ? 'Mijozlar yuklanmoqda...' : 'Загрузка клиентов...'}</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-150 text-center space-y-2">
          <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-1" />
          <h3 className="text-sm font-bold text-gray-700">{lang === 'uz' ? 'Mijozlar topilmadi' : 'Клиенты не найдены'}</h3>
          <p className="text-xs text-gray-400">
            {lang === 'uz' ? 'Qidiruv parametrlarini o\'zgartirib ko\'ring' : 'Попробуйте изменить параметры поиска'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-150 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">{lang === 'uz' ? 'Mijoz' : 'Клиент'}</th>
                  <th className="py-3.5 px-4">{lang === 'uz' ? 'Telefon' : 'Телефон'}</th>
                  <th className="py-3.5 px-4">{lang === 'uz' ? 'Kanal' : 'Канал'}</th>
                  <th className="py-3.5 px-4 text-center">{lang === 'uz' ? 'Buyurtmalar' : 'Заказы'}</th>
                  <th className="py-3.5 px-4 text-right">{lang === 'uz' ? 'Jami Xarid' : 'Сумма'}</th>
                  <th className="py-3.5 px-4">{lang === 'uz' ? 'Oxirgi faollik' : 'Активность'}</th>
                  <th className="py-3.5 px-4 text-right">{lang === 'uz' ? 'Amallar' : 'Действия'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const initial = (user.name || 'M').charAt(0).toUpperCase();
                  const isBlocked = !!user.is_blocked;

                  return (
                    <tr 
                      key={user.telegram_id || user.id} 
                      className={`hover:bg-blue-50/40 transition-colors ${isBlocked ? 'bg-rose-50/30' : ''}`}
                    >
                      {/* Customer name & username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                            isBlocked ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-gray-900 truncate">{user.name || 'Ismsiz mijoz'}</span>
                              {isBlocked && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700">
                                  BLOK
                                </span>
                              )}
                            </div>
                            {user.username && (
                              <span className="text-[10px] text-gray-400 font-semibold block">@{user.username}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700 whitespace-nowrap">
                        {user.phone || '—'}
                      </td>

                      {/* Channel Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getSourceBadge(user.source)}
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 text-center font-extrabold">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          user.total_orders > 0 ? 'bg-blue-50 text-blue-600 font-black' : 'text-gray-400'
                        }`}>
                          {user.total_orders || 0}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right font-black text-gray-900 whitespace-nowrap">
                        {formatPrice(user.total_spent)}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-gray-500 font-medium whitespace-nowrap text-[11px]">
                        {formatDate(user.last_active_at || user.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(user)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors title='Tafsilotlar'"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              triggerHaptic('light');
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-gray-150 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-sm">
                  {(selectedUser.name || 'M').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                    <span>{selectedUser.name || 'Ismsiz mijoz'}</span>
                    {getSourceBadge(selectedUser.source)}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono font-bold">
                    {selectedUser.phone || 'Telefon kiritilmagan'}
                    {selectedUser.username ? ` • @${selectedUser.username}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* LTV & Statistics Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase block">Buyurtmalar</span>
                  <span className="text-base font-black text-gray-900 mt-0.5 block">{selectedUser.total_orders || 0} ta</span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase block">Jami Xarid</span>
                  <span className="text-base font-black text-gray-900 mt-0.5 block">{formatPrice(selectedUser.total_spent)}</span>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase block">Oxirgi Kirish</span>
                  <span className="text-[11px] font-bold text-gray-900 mt-1 block truncate">
                    {formatDate(selectedUser.last_active_at)}
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedUser.address && (
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-150 flex items-start gap-2.5">
                  <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase block">Asosiy Manzil</span>
                    <span className="font-bold text-gray-800 leading-snug">{selectedUser.address}</span>
                  </div>
                </div>
              )}

              {/* CRM Internal Notes */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'uz' ? 'Admin Eslatmalari (CRM Notes)' : 'Заметки админа (CRM)'}</span>
                </label>
                <textarea
                  rows={3}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder={lang === 'uz' ? 'Mijoz haqida ichki eslatma yozing (masalan: doimiy mijoz, chegirma berilsin)...' : 'Внутренние заметки о клиенте...'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs active:scale-95 transition-all disabled:opacity-50"
                  >
                    {savingNotes ? (lang === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...') : (lang === 'uz' ? 'Eslatmani saqlash' : 'Сохранить заметку')}
                  </button>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBagIcon className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'uz' ? 'Buyurtmalar Tarixi' : 'История заказов'} ({userOrders.length})</span>
                </h4>

                {loadingDetail ? (
                  <div className="p-6 text-center text-gray-400 font-bold">
                    {lang === 'uz' ? 'Buyurtmalar yuklanmoqda...' : 'Загрузка заказов...'}
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-150 text-center text-gray-400 font-bold">
                    {lang === 'uz' ? 'Hozircha buyurtmalar mavjud emas' : 'Заказов пока нет'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {userOrders.map((ord) => (
                      <div key={ord.id} className="p-3.5 bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-xl flex items-center justify-between transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-blue-600">{ord.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              ord.status === 'shipping' ? 'bg-amber-100 text-amber-800' :
                              ord.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                            {formatDate(ord.created_at || ord.createdAt)}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-xs text-gray-900 block">{formatPrice(ord.total_amount || ord.totalAmount)}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{ord.items?.length || 0} xil mahsulot</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-150 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => handleToggleBlock(selectedUser)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 ${
                  selectedUser.is_blocked 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                <NoSymbolIcon className="w-4 h-4" />
                <span>
                  {selectedUser.is_blocked 
                    ? (lang === 'uz' ? 'Blokdan chiqarish' : 'Разблокировать') 
                    : (lang === 'uz' ? 'Foydalanuvchini bloklash' : 'Заблокировать')}
                </span>
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl active:scale-95 transition-all"
              >
                {lang === 'uz' ? 'Yopish' : 'Закрыть'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
