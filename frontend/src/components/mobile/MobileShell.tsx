import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { mobileTabItemsForRole, mobileMoreItemsForRole, titleForPath, ROLE_LABELS } from '../../config/navigation';
import ConfirmDialog from '../ConfirmDialog';
import MobileSheet from './MobileSheet';
import MobilePOSPage from '../../pages/mobile/MobilePOSPage';
import MobileOrdersPage from '../../pages/mobile/MobileOrdersPage';
import MobileDashboardPage from '../../pages/mobile/MobileDashboardPage';
import MobileClosuresPage from '../../pages/mobile/MobileClosuresPage';
import MobileMorePage from '../../pages/mobile/MobileMorePage';
import MobileStockPage from '../../pages/mobile/MobileStockPage';
import MobileTeamPage from '../../pages/mobile/MobileTeamPage';
import MobileProductsManagementPage from '../../pages/mobile/MobileProductsManagementPage';
import MobileCategoriesManagementPage from '../../pages/mobile/MobileCategoriesManagementPage';
import MobileUsersManagementPage from '../../pages/mobile/MobileUsersManagementPage';
import MobileAppSettingsPage from '../../pages/mobile/MobileAppSettingsPage';

interface MobileShellProps {
user: { username: string; role: string };
onLogout: () => void;
}

export default function MobileShell({ user, onLogout }: MobileShellProps) {
const navigate = useNavigate();
const location = useLocation();
const [accountSheetOpen, setAccountSheetOpen] = useState(false);
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

const tabItems = mobileTabItemsForRole(user.role);
const moreItems = mobileMoreItemsForRole(user.role);
const title = titleForPath(location.pathname);

const isActive = (path: string) => location.pathname === path;
const isMoreActive = moreItems.some((item) => item.path === location.pathname);

return (
<div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
{/* Header compact partagé */}
<div className="pt-[env(safe-area-inset-top)] bg-white border-b border-gray-100 flex-shrink-0">
<div className="flex items-center justify-between px-4 py-3">
<div className="min-w-0">
<div className="text-lg font-extrabold text-gray-900 truncate">{title}</div>
</div>
<button
onClick={() => setAccountSheetOpen(true)}
className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 font-bold text-sm flex items-center justify-center flex-shrink-0"
>
{user.username.charAt(0).toUpperCase()}
</button>
</div>
</div>

{/* Contenu routé */}
<div className="flex-1 overflow-hidden">
<Routes>
<Route path="/" element={<Navigate to={user.role === 'ADMIN' ? '/app-settings' : '/pos'} replace />} />
<Route path="/pos" element={<MobilePOSPage />} />
<Route path="/orders" element={<MobileOrdersPage />} />
<Route path="/dashboard" element={<MobileDashboardPage />} />
<Route path="/closures" element={<MobileClosuresPage />} />
<Route path="/more" element={<MobileMorePage />} />
<Route path="/stock" element={<MobileStockPage />} />
<Route path="/team" element={<MobileTeamPage />} />
<Route path="/products-management" element={<MobileProductsManagementPage />} />
<Route path="/categories-management" element={<MobileCategoriesManagementPage />} />
<Route path="/users-management" element={<MobileUsersManagementPage />} />
<Route path="/app-settings" element={<MobileAppSettingsPage />} />
</Routes>
</div>

{/* Barre d'onglets */}
<div className="flex-shrink-0 bg-white/95 backdrop-blur border-t border-gray-100 flex pb-[env(safe-area-inset-bottom)]">
{tabItems.map(({ path, label, Icon }) => (
<button
key={path}
onClick={() => navigate(path)}
className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${isActive(path) ? 'text-primary-600' : 'text-gray-400'}`}
>
<Icon size={20} />
<span className="text-[10px] font-medium">{label}</span>
</button>
))}
{moreItems.length > 0 && (
<button
onClick={() => navigate('/more')}
className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${isMoreActive || isActive('/more') ? 'text-primary-600' : 'text-gray-400'}`}
>
<span className="text-lg leading-none">⋯</span>
<span className="text-[10px] font-medium">Plus</span>
</button>
)}
</div>

{/* Sheet compte */}
{accountSheetOpen && (
<MobileSheet onClose={() => setAccountSheetOpen(false)}>
<div className="px-5 pb-8 pt-3">
<div className="flex items-center gap-3 pb-4 border-b border-gray-100">
<div className="w-11 h-11 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center flex-shrink-0">
{user.username.charAt(0).toUpperCase()}
</div>
<div>
<div className="text-sm font-bold text-gray-900">{user.username}</div>
<div className="text-xs text-gray-400">{ROLE_LABELS[user.role] || user.role}</div>
</div>
</div>
<button
onClick={() => { setAccountSheetOpen(false); setShowLogoutConfirm(true); }}
className="mt-4 w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
>
<LogOut size={15} />
Se déconnecter
</button>
</div>
</MobileSheet>
)}

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
