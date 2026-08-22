import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  KeyIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon, 
  UserCircleIcon, 
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export const StaffSetupScreen = ({ empId, token, onSetupSuccess, onCancel }) => {
  const { lang, triggerHaptic } = useStore();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/employees/setup-info?id=${empId}&token=${token}`);
        const data = await res.json();
        if (data.success && data.employee) {
          setEmployee(data.employee);
          if (data.employee.login) {
            setLogin(data.employee.login);
          } else {
            // Default suggested login based on name or ID
            const suggested = (data.employee.name || `user_${data.employee.telegram_id}`)
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '_')
              .replace(/_+/g, '_');
            setLogin(suggested);
          }
        } else {
          setError(data.message || 'Yaroqsiz yoki eskirgan taklif havolasi');
        }
      } catch (err) {
        setError('Server bilan ulanishda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    if (empId && token) {
      fetchInfo();
    } else {
      setError('Taklif parametri noto\'g\'ri');
      setLoading(false);
    }
  }, [empId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!login.trim() || login.trim().length < 3) {
      triggerHaptic('warning');
      setError('Login kamida 3 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    if (!password || password.length < 4) {
      triggerHaptic('warning');
      setError('Parol kamida 4 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    if (password !== confirmPassword) {
      triggerHaptic('warning');
      setError('Kiritilgan parollar bir-biriga mos kelmadi');
      return;
    }

    setSubmitting(true);
    setError('');
    triggerHaptic('medium');

    try {
      const res = await fetch('/api/admin/employees/setup-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: empId,
          token,
          login: login.trim().toLowerCase(),
          password: password.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.token) {
        triggerHaptic('notification');
        onSetupSuccess(data.token);
      } else {
        triggerHaptic('warning');
        setError(data.message || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err) {
      triggerHaptic('warning');
      setError('Serverga ulanish xatoligi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-150 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-600">Taklif ma'lumotlari tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 via-rose-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-rose-100 text-center space-y-4 animate-scaleUp">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-600 border border-rose-100">
            ⚠️
          </div>
          <h2 className="text-lg font-black text-gray-900">Taklif havolasi yaroqsiz</h2>
          <p className="text-xs text-gray-500 font-medium">{error}</p>
          <button
            onClick={onCancel}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f8fafc] via-[#eff6ff] to-[#f5f3ff] flex flex-col justify-center items-center px-4 font-sans relative">
      {/* Decorative bubbles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-[32px] border border-white/80 shadow-[0_20px_50px_rgba(59,130,246,0.08)] flex flex-col text-center animate-scaleUp">
        
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25 shrink-0">
          <KeyIcon className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          Xodim Akkauntini Faollashtirish
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-1 mb-5">
          O'zingiz uchun shaxsiy Login va Maxfiy Parol belgilang
        </p>

        {/* Employee Info Card */}
        {employee && (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/80 mb-5 text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shrink-0">
              {(employee.name || 'X').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-extrabold text-gray-900 text-xs block truncate">
                {employee.name}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.2 rounded-full uppercase">
                  {employee.role || 'manager'}
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  ID: {employee.telegram_id}
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-bold text-xs text-center mb-4 animate-shake">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Login Field */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-700 tracking-wider block mb-1.5 pl-1">
              Login (Foydalanuvchi nomi) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">@</span>
              <input
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="masalan: jasur_admin"
                className="w-full bg-gray-50/60 border border-gray-200 pl-9 pr-4 py-3 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block pl-1">
              Lotin harflari, sonlar va pastki chiziq (_) ruxsat etiladi.
            </span>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-700 tracking-wider block mb-1.5 pl-1">
              Yangi Maxfiy Parol *
            </label>
            <div className="relative">
              <KeyIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="kamida 4 ta belgi"
                className="w-full bg-gray-50/60 border border-gray-200 pl-10 pr-10 py-3 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-700 tracking-wider block mb-1.5 pl-1">
              Parolni Takrorlang *
            </label>
            <div className="relative">
              <CheckCircleIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="parolni qayta kiriting"
                className="w-full bg-gray-50/60 border border-gray-200 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs mt-2"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>{submitting ? 'Saqlanmoqda...' : 'Saqlash va Boshqaruvga Kirish'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
