import React, { useState } from 'react';
import { Lock, User, ArrowLeft, ShieldCheck, AlertCircle, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { loginAdmin } from '../../services/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onReturnToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onReturnToStore }) => {
  const [username, setUsername] = useState('mates@admin.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleFillCredentials = (user: string = 'mates@admin.com', pass: string = 'admin123') => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="h-screen w-screen max-w-full overflow-hidden bg-[#FAF8F5] dark:bg-[#181412] text-[#2C221E] dark:text-[#F4EFEA] flex flex-col justify-center items-center p-4 transition-colors duration-300 select-none">
      <div className="w-full max-w-md max-h-full flex flex-col justify-center">
        {/* Return Button */}
        <button
          type="button"
          onClick={onReturnToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA] mb-4 transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda</span>
        </button>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#241E1B] rounded-3xl p-6 sm:p-7 border border-[#EBE6DD] dark:border-[#3D322B] shadow-xl space-y-5">
          <div className="text-center space-y-1.5">
            <div className="w-11 h-11 rounded-2xl bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="font-serif-title text-xl sm:text-2xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
              Panel de Administración
            </h1>
            <p className="text-xs text-[#7C6E65] dark:text-[#A39489]">
              Ingresá tus credenciales para gestionar el catálogo
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8F87] dark:text-[#7C6E65]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8F87] dark:text-[#7C6E65]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C8F87] dark:text-[#7C6E65] hover:text-[#2C221E] dark:hover:text-[#F4EFEA] p-1 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Fill Credentials Banner */}
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-xs flex items-center justify-between gap-2">
              <div className="text-[11px] text-[#7C6E65] dark:text-[#A39489]">
                <span>Usuario: <strong className="text-[#2C221E] dark:text-[#F4EFEA]">mates@admin.com</strong></span>
                <span className="mx-1">·</span>
                <span>Clave: <strong className="text-[#2C221E] dark:text-[#F4EFEA]">admin123</strong></span>
              </div>
              <button
                type="button"
                onClick={() => handleFillCredentials('mates@admin.com', 'admin123')}
                className="px-2 py-1 rounded-lg bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] hover:bg-[#4B5A36]/20 font-bold text-[10px] inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              >
                <KeyRound className="w-3 h-3" />
                <span>Autocompletar</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#4B5A36] hover:bg-[#3A4729] dark:bg-[#809761] dark:hover:bg-[#6b824e] text-white dark:text-[#181412] font-semibold py-3 px-6 rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-70 cursor-pointer text-sm min-h-[44px]"
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
