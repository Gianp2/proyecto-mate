import React, { useState } from 'react';
import { Lock, User, ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { loginAdmin } from '../../services/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onReturnToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onReturnToStore }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor completá todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginAdmin(username, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Return Button */}
        <button
          onClick={onReturnToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7C6E65] hover:text-[#2C221E] mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda</span>
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE6DD] shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#4B5A36] text-white flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-serif-title text-2xl font-bold text-[#2C221E]">
              Panel de Administración
            </h1>
            <p className="text-xs text-[#7C6E65]">
              Ingresá tus credenciales para gestionar el catálogo
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2C221E] uppercase tracking-wider mb-1.5">
                Usuario / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8F87]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#EBE6DD] text-sm text-[#2C221E] focus:outline-none focus:border-[#4B5A36] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C221E] uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8F87]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#EBE6DD] text-sm text-[#2C221E] focus:outline-none focus:border-[#4B5A36] focus:bg-white transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-[#9C8F87] mt-1">
                Credencial por defecto: <code className="bg-[#EFECE6] px-1 rounded text-[#4B5A36]">pampa2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#4B5A36] hover:bg-[#3A4729] text-white font-semibold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-70 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
