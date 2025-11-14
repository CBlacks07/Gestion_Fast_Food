import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
  username: string;
  userRole: string;
}

export default function Layout({ children, onLogout, username, userRole }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = userRole === 'ADMIN';

  const menuItems = [
    { path: '/pos', label: 'Point de Vente', icon: '🛒', adminOnly: false },
    { path: '/orders', label: 'Commandes', icon: '📋', adminOnly: false },
    { path: '/dashboard', label: 'Statistiques', icon: '📊', adminOnly: false },
    { path: '/stock', label: 'Stocks', icon: '📦', adminOnly: false },
    { path: '/team', label: 'Équipe', icon: '👥', adminOnly: true },
  ].filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>🍔</span>
            <span>Fast-Food</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
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
