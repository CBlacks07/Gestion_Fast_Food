import { useState } from 'react';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useAppSettingsStore } from '../store/appSettingsStore';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const settings = useAppSettingsStore((state) => state.settings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.login(username, password);

      if (response.success && response.data) {
        // Le backend retourne { user: {...}, token: "..." }
        // On passe l'objet user ET le token au store
        login(response.data.user, response.data.token);
      } else {
        setError(response.error || 'Erreur de connexion');
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);

      // Vérifier si c'est une erreur de service indisponible (503)
      if (err.response?.status === 503) {
        setError('Le serveur démarre... Veuillez réessayer dans quelques secondes.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo ou Icône */}
          <div className="flex justify-center mb-4">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.appName || 'Logo'}
                className="h-24 w-auto object-contain"
                onError={(e) => {
                  console.error('❌ Erreur chargement logo login:', settings.logoUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-6xl">{settings?.appIcon || '🍔'}</div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{settings?.appName || 'Gestion Fast-Food'}</h1>
          {settings?.slogan && (
            <p className="text-gray-600 mb-2">{settings.slogan}</p>
          )}
          <p className="text-gray-500">Connectez-vous pour continuer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connexion...</span>
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Comptes de démonstration :</p>
          <p className="mt-2">admin / Admin123 (Admin)</p>
          <p>cashier / Cashier123 (Caissier)</p>
        </div>
      </div>
    </div>
  );
}
