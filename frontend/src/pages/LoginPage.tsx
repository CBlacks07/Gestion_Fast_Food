import { useState } from 'react';
import { Building2, User, Lock, Eye, EyeOff, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { authApi, API_BASE_URL } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useAppSettingsStore } from '../store/appSettingsStore';

const LAST_RESTAURANT_CODE_KEY = 'last-restaurant-code';

export default function LoginPage() {
  const [code, setCode] = useState(() => localStorage.getItem(LAST_RESTAURANT_CODE_KEY) || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const settings = useAppSettingsStore((state) => state.settings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code || !username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.login(code, username, password);
      if (response.success) {
        localStorage.setItem(LAST_RESTAURANT_CODE_KEY, code);
      }

      if (response.success && response.data) {
        login(response.data.user, response.data.token);
      } else {
        setError(response.error || 'Identifiants incorrects');
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string } }; code?: string; message?: string };
      if (e.response?.status === 503) {
        setError('Le serveur démarre... Veuillez réessayer dans quelques secondes.');
      } else if (e.response?.data?.error) {
        setError(e.response.data.error);
      } else if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
        setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      {/* Lueur subtile de la couleur du thème — toujours élégant peu importe la couleur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-primary, #e05252)22 0%, transparent 70%)',
        }}
      />

      {/* Points décoratifs */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Cercles flous de profondeur */}
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'var(--color-primary, #e05252)', opacity: 0.06, filter: 'blur(80px)' }}
      />
      <div className="absolute top-[20%] right-[-5%] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'var(--color-secondary, #6b7280)', opacity: 0.08, filter: 'blur(60px)' }}
      />

      {/* Carte */}
      <div className="relative w-full max-w-sm">
        {/* Liseré coloré en haut */}
        <div className="h-1 rounded-t-2xl" style={{ background: 'var(--color-primary, #e05252)' }} />

        <div className="bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-2xl px-8 pt-8 pb-8">

          {/* Logo / Branding */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {settings?.logoUrl ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                  <img
                    src={settings.logoUrl.startsWith('http') ? settings.logoUrl : `${API_BASE_URL}${settings.logoUrl}`}
                    alt={settings.appName || 'Logo'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-gray-100 flex items-center justify-center text-4xl shadow-lg bg-gray-50">
                  {settings?.appIcon || '🍽️'}
                </div>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {settings?.appName || 'Gestion Fast-Food'}
            </h1>
            {settings?.slogan && (
              <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-primary, #e05252)' }}>
                {settings.slogan}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1.5">Connectez-vous pour continuer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code établissement */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Code établissement
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: CHEZFATOU"
                  disabled={isLoading}
                  autoComplete="organization"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent focus:bg-white disabled:opacity-50 transition-all text-sm outline-none uppercase"
                  style={{ '--tw-ring-color': 'var(--color-primary, #e05252)' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre identifiant"
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent focus:bg-white disabled:opacity-50 transition-all text-sm outline-none"
                  style={{ '--tw-ring-color': 'var(--color-primary, #e05252)' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent focus:bg-white disabled:opacity-50 transition-all text-sm outline-none"
                  style={{ '--tw-ring-color': 'var(--color-primary, #e05252)' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3">
                <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 shadow-lg"
              style={{ background: 'var(--color-primary, #e05252)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
