import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ShieldCheckIcon, 
  CommandLineIcon, 
  TruckIcon, 
  PhotoIcon, 
  BriefcaseIcon,
  XMarkIcon,
  CheckCircleIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  ArrowPathIcon as RefreshIcon
} from '@heroicons/react/24/outline';

export const AdminEmployees = () => {
  const { lang, triggerHaptic, getAdminHeaders, showConfirm } = useStore();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [role, setRole] = useState('manager');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/employees', {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (e) {
      console.error('Failed to fetch employees:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openCreateModal = () => {
    triggerHaptic('light');
    setEditingEmp(null);
    setName('');
    setLogin('');
    setPassword('');
    setShowPassword(false);
    setPhone('');
    setTelegramId('');
    setRole('manager');
    setNotes('');
    setIsActive(true);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (emp) => {
    triggerHaptic('light');
    setEditingEmp(emp);
    setName(emp.name || '');
    setLogin(emp.login || '');
    setPassword('');
    setShowPassword(false);
    setPhone(emp.phone || '');
    setTelegramId(emp.telegram_id ? emp.telegram_id.toString() : '');
    setRole(emp.role || 'manager');
    setNotes(emp.notes || '');
    setIsActive(!!emp.is_active);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !telegramId.trim()) {
      triggerHaptic('warning');
      setFormError(lang === 'uz' ? 'Ism va Telegram ID kiritilishi shart!' : 'Имя и Telegram ID обязательны!');
      return;
    }

    if (!editingEmp && !password.trim()) {
      triggerHaptic('warning');
      setFormError(lang === 'uz' ? 'Xodim uchun maxfiy parol kiriting!' : 'Введите пароль для сотрудника!');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const url = editingEmp ? `/api/admin/employees/${editingEmp.id}` : '/api/admin/employees';
      const method = editingEmp ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({
          name: name.trim(),
          login: login.trim() || undefined,
          password: password.trim() || undefined,
          phone: phone.trim(),
          telegramId: telegramId.trim(),
          role,
          notes: notes.trim(),
          isActive
        })
      });

      const data = await res.json();
      if (data.success) {
        triggerHaptic('notification');
        setModalOpen(false);
        fetchEmployees();
      } else {
        triggerHaptic('warning');
        setFormError(data.message || 'Xatolik yuz berdi');
      }
    } catch (e) {
      triggerHaptic('warning');
      setFormError(e.message || 'Server bilan ulanish xatoligi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (emp) => {
    triggerHaptic('warning');
    if (emp.role === 'developer') {
      alert(lang === 'uz' ? 'Bosh dasturchi akkauntini o\'chirib bo\'lmaydi!' : 'Нельзя удалить аккаунт разработчика!');
      return;
    }

    showConfirm(
      lang === 'uz' ? 'Xodimni o\'chirish' : 'Удалить сотрудника',
      `${emp.name} (${emp.telegram_id}) xodimini haqiqatan ham o'chirmoqchimisiz?`,
      async () => {
        try {
          const res = await fetch(`/api/admin/employees/${emp.id}`, {
            method: 'DELETE',
            headers: getAdminHeaders()
          });
          const data = await res.json();
          if (data.success) {
            triggerHaptic('notification');
            setEmployees(prev => prev.filter(e => e.id !== emp.id));
          }
        } catch (e) {
          console.error('Failed to delete employee:', e);
        }
      }
    );
  };

  const getRoleBadge = (empRole) => {
    switch (empRole) {
      case 'developer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
            <CommandLineIcon className="w-3 h-3" />
            <span>💻 Dasturchi</span>
          </span>
        );
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheckIcon className="w-3 h-3" />
            <span>👑 Super Admin</span>
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <BriefcaseIcon className="w-3 h-3" />
            <span>🧑‍💼 Menejer</span>
          </span>
        );
      case 'courier':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <TruckIcon className="w-3 h-3" />
            <span>🚚 Kuryer</span>
          </span>
        );
      case 'content_manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
            <PhotoIcon className="w-3 h-3" />
            <span>🎨 Kontent</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
            {empRole}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-10 animate-fadeIn">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-150 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 leading-tight">
              {lang === 'uz' ? 'Xodimlar va Rollar Boshqaruvi' : 'Сотрудники и роли'}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {lang === 'uz' 
                ? 'Do\'kon adminlari, operatorlari va ularning login/parol va ruxsatlarini boshqarish' 
                : 'Управление учетными записями, логинами/паролями и правами сотрудников'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEmployees}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-600 rounded-xl transition-all border border-gray-200"
            title="Yangilash"
          >
            <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/15 transition-all cursor-pointer"
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>{lang === 'uz' ? 'Yangi Xodim Qo\'shish' : 'Добавить сотрудника'}</span>
          </button>
        </div>
      </div>

      {/* Employees Table */}
      {loading && employees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-150 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-150 text-center space-y-2">
          <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-1" />
          <h3 className="text-sm font-bold text-gray-700">Hozircha xodimlar mavjud emas</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-150 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Xodim / Login</th>
                  <th className="py-3.5 px-4">Telegram ID</th>
                  <th className="py-3.5 px-4">Telefon</th>
                  <th className="py-3.5 px-4">Biriktirilgan Rol</th>
                  <th className="py-3.5 px-4">Holat</th>
                  <th className="py-3.5 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => {
                  const initial = (emp.name || 'X').charAt(0).toUpperCase();

                  return (
                    <tr key={emp.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* Name & Login */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-black text-xs flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <div>
                            <span className="font-extrabold text-gray-900 block">{emp.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {emp.login ? (
                                <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                  @{emp.login}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400 font-mono">login yo'q</span>
                              )}
                              {emp.notes && (
                                <span className="text-[10px] text-gray-400 font-medium">· {emp.notes}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Telegram ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                        {emp.telegram_id}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-gray-600">
                        {emp.phone || '—'}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(emp.role)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.is_active 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {emp.is_active ? 'Faol' : 'Nofaol'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-lg transition-colors cursor-pointer"
                            title="Tahrirlash & Parolni yangilash"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          
                          {emp.role !== 'developer' && (
                            <button
                              onClick={() => handleDelete(emp)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="O'chirish"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border border-gray-150 shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-150 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-gray-900">
                  {editingEmp ? 'Xodimni Tahrirlash' : 'Yangi Xodim Qo\'shish'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-bold text-center animate-shake">
                  ⚠️ {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Xodim Ismi va Familiyasi *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Sardor Rahimov"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Login (Username) */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">
                  Login / Foydalanuvchi nomi *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="masalan: jasur_admin"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Xodim web brauzer orqali kirishda shu logindan foydalanadi.
                </span>
              </div>

              {/* Password */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">
                  {editingEmp ? 'Yangi Parol (Ixtiyoriy)' : 'Maxfiy Parol *'}
                </label>
                <div className="relative">
                  <KeyIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingEmp}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingEmp ? "O'zgartirmaslik uchun bo'sh qoldiring" : "••••••••"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Telegram ID */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Telegram ID (Raqamli) *</label>
                <input
                  type="number"
                  required
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="Masalan: 1165441564"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Xodim Telegram botga kirganida shu ID orqali avtomatik aniqlanadi.
                </span>
              </div>

              {/* Phone */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Telefon Raqami</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Role Select */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Biriktiriladigan Rol *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="developer">💻 Dasturchi (Developer - To'liq huquq)</option>
                  <option value="super_admin">👑 Super Admin (Bosh boshqaruvchi)</option>
                  <option value="manager">🧑‍💼 Menejer / Operator (Buyurtmalar & Mahsulotlar)</option>
                  <option value="courier">🚚 Kuryer (Faqat Yetkazib berish)</option>
                  <option value="content_manager">🎨 Kontent Menejer (Mahsulotlar & Bannerlar)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Izoh / Lavozim</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masalan: Kechki smena operatori"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isActiveCheck" className="font-bold text-gray-700 select-none cursor-pointer">
                  Xodim faol (Admin panelga kira oladi)
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
