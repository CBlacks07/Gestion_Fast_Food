import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSettingsStore } from '../store/appSettingsStore';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
  username: string;
  userRole: string;
}

export default function Layout({ children, onLogout, username, userRole }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useAppSettingsStore((state) => state.settings);

  const isAdmin = userRole === 'ADMIN';

  // Debugging: Log settings when they change
  console.log('🔍 Layout - Settings actuels:', settings);
  console.log('🖼️ Layout - Logo URL:', settings?.logoUrl);

  // Menu principal basé sur le rôle
  const menuItems = [
    { path: '/pos', label: 'Point de Vente', icon: '🛒', roles: ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER'] },
    { path: '/orders', label: 'Commandes', icon: '📋', roles: ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER'] },
    { path: '/dashboard', label: 'Statistiques', icon: '📊', roles: ['MANAGER', 'CASHIER'] },
    { path: '/stock', label: 'Stocks', icon: '📦', roles: ['MANAGER'] },
    { path: '/closures', label: 'Clôtures', icon: '🔒', roles: ['MANAGER', 'CASHIER'] },
    { path: '/team', label: 'Équipe', icon: '👥', roles: ['MANAGER'] },
  ].filter((item) => item.roles.includes(userRole));

  // Menu de gestion (Admin = paramètres système, Manager = gestion complète)
  const managementMenuItems = [
    { path: '/products-management', label: 'Produits', icon: '🍔', roles: ['MANAGER'] },
    { path: '/categories-management', label: 'Catégories', icon: '📂', roles: ['MANAGER'] },
    { path: '/app-settings', label: 'Paramètres App', icon: '🎨', roles: ['ADMIN'] },
    { path: '/users-management', label: 'Utilisateurs', icon: '👤', roles: ['ADMIN'] },
  ].filter((item) => item.roles.includes(userRole));

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <div className="w-12 h-12 flex items-center justify-center bg-white rounded">
                <img
                  src={settings.logoUrl}
                  alt={settings.appName || 'Logo'}
                  className="max-w-full max-h-full object-contain"
                  crossOrigin="anonymous"
                  onLoad={() => {
                    console.log('✅ Logo chargé avec succès:', settings.logoUrl);
                  }}
                  onError={(e) => {
                    console.error('❌ Erreur de chargement du logo:', settings.logoUrl);
                    console.error('❌ Détails:', e);
                    // Fallback vers l'icône
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <span className="text-2xl">{settings?.appIcon || '🍔'}</span>
            )}
            <h1 className="text-lg font-bold text-gray-900 flex-1">
              {settings?.appName || 'Fast-Food'}
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full px-4 py-3 rounded-lg font-medium text-left transition-colors
                  flex items-center gap-3
                  ${isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Management Menu Section */}
          {managementMenuItems.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isAdmin ? 'Administration' : 'Gestion'}
                </div>
              </div>
              {managementMenuItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full px-4 py-3 rounded-lg font-medium text-left transition-colors
                      flex items-center gap-3
                      ${isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* User info */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{username}</div>
              <div className="text-sm text-gray-500">Connecté</div>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                onLogout();
              }
            }}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
