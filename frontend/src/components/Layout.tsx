import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, ClipboardList, BarChart2, Package, Lock,
  Users, Tag, Layers, Settings, UserCog, LogOut, UtensilsCrossed,
} from 'lucide-react';
import { useAppSettingsStore } from '../store/appSettingsStore';
import { API_BASE_URL } from '../services/api';
import ConfirmDialog from './ConfirmDialog';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
  username: string;
  userRole: string;
}

type LucideIcon = typeof ShoppingCart;

interface MenuItem {
  path: string;
  label: string;
  Icon: LucideIcon;
  roles: string[];
}

export default function Layout({ children, onLogout, username, userRole }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useAppSettingsStore((state) => state.settings);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isAdmin = userRole === 'ADMIN';

  const menuItems: MenuItem[] = [
    { path: '/pos',       label: 'Point de Vente', Icon: ShoppingCart,  roles: ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER'] },
    { path: '/orders',    label: 'Commandes',      Icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER'] },
    { path: '/dashboard', label: 'Statistiques',   Icon: BarChart2,     roles: ['MANAGER', 'CASHIER'] },
    { path: '/stock',     label: 'Stocks',         Icon: Package,       roles: ['MANAGER'] },
    { path: '/closures',  label: 'Clôtures',       Icon: Lock,          roles: ['MANAGER', 'CASHIER'] },
    { path: '/team',      label: 'Équipe',         Icon: Users,         roles: ['MANAGER'] },
  ].filter((item) => item.roles.includes(userRole));

  const managementMenuItems: MenuItem[] = [
    { path: '/products-management',   label: 'Produits',        Icon: Tag,      roles: ['MANAGER'] },
    { path: '/categories-management', label: 'Catégories',      Icon: Layers,   roles: ['MANAGER'] },
    { path: '/app-settings',          label: 'Paramètres App',  Icon: Settings, roles: ['ADMIN'] },
    { path: '/users-management',      label: 'Utilisateurs',    Icon: UserCog,  roles: ['ADMIN'] },
  ].filter((item) => item.roles.includes(userRole));

  const roleLabel: Record<string, string> = {
    ADMIN: 'Administrateur',
    MANAGER: 'Gérant',
    CASHIER: 'Caissier',
    KITCHEN: 'Cuisine',
    WAITER: 'Serveur',
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg overflow-hidden border border-gray-100">
                <img
                  src={settings.logoUrl?.startsWith('http') ? settings.logoUrl : `${API_BASE_URL}${settings.logoUrl}`}
                  alt={settings.appName || 'Logo'}
                  className="max-w-full max-h-full object-contain"
                  crossOrigin="anonymous"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
            )}
            <h1 className="text-base font-bold text-gray-900 flex-1 truncate">
              {settings?.appName || 'Fast-Food'}
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {menuItems.map(({ path, label, Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  w-full px-3 py-2.5 rounded-lg font-medium text-left transition-colors
                  flex items-center gap-3
                  ${isActive
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                <span className="text-sm">{label}</span>
              </button>
            );
          })}

          {managementMenuItems.length > 0 && (
            <>
              <div className="pt-3 pb-1.5">
                <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {isAdmin ? 'Administration' : 'Gestion'}
                </div>
              </div>
              {managementMenuItems.map(({ path, label, Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`
                      w-full px-3 py-2.5 rounded-lg font-medium text-left transition-colors
                      flex items-center gap-3
                      ${isActive
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="flex-shrink-0" size={18} />
                    <span className="text-sm">{label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* User info */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-3 mb-2.5 px-1">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate text-sm">{username}</div>
              <div className="text-xs text-gray-400">{roleLabel[userRole] || userRole}</div>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={15} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {showLogoutConfirm && (
        <ConfirmDialog
          title="Se déconnecter"
          message="Êtes-vous sûr de vouloir vous déconnecter ?"
          confirmLabel="Se déconnecter"
          cancelLabel="Annuler"
          variant="warning"
          onConfirm={onLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
}
