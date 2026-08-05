import { useState, useEffect } from 'react';
import { Lock, Loader2, BarChart2, ShoppingBag, TrendingUp, X, CreditCard, Award } from 'lucide-react';
import { usersApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import MobileSheet from '../../components/mobile/MobileSheet';
import type { UserStats, UserDetailedStats } from '../../types';

const ROLE_BADGE: Record<string, string> = {
ADMIN: 'bg-red-100 text-red-700', MANAGER: 'bg-purple-100 text-purple-700',
CASHIER: 'bg-blue-100 text-blue-700', KITCHEN: 'bg-green-100 text-green-700', WAITER: 'bg-yellow-100 text-yellow-700',
};
const ROLE_LABEL: Record<string, string> = {
ADMIN: 'Administrateur', MANAGER: 'Gérant', CASHIER: 'Caissier', KITCHEN: 'Cuisine', WAITER: 'Serveur',
};
const PAYMENT_METHOD_LABEL: Record<string, string> = {
CASH: 'Espèces', TMONEY: 'TMoney', FLOOZ: 'Flooz', CARD: 'Carte bancaire', MOBILE: 'Mobile', OTHER: 'Autre',
};

function displayName(u: { username: string; firstName?: string; lastName?: string }) {
return u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username;
}

function initials(u: { username: string; firstName?: string; lastName?: string }) {
if (u.firstName && u.lastName) return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
return u.username.charAt(0).toUpperCase();
}

export default function MobileTeamPage() {
const [stats, setStats] = useState<UserStats[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
const [detailed, setDetailed] = useState<UserDetailedStats | null>(null);
const [isLoadingDetail, setIsLoadingDetail] = useState(false);

const user = useAuthStore((state) => state.user);
const isManager = user?.role === 'MANAGER';

useEffect(() => {
if (!isManager) return;
loadAllStats();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isManager, selectedDate]);

const loadAllStats = async () => {
try {
setIsLoading(true);
const response = await usersApi.getAllUsersStats(selectedDate);
if (response.success && response.data) {
const list = (response.data.users || []) as UserStats[];
setStats(list.filter((s) => s.user.role !== 'ADMIN'));
}
} catch (error) {
console.error(error);
toast.error('Erreur lors du chargement des statistiques');
} finally {
setIsLoading(false);
}
};

const openDetail = async (userId: string) => {
setSelectedUserId(userId);
setIsLoadingDetail(true);
try {
const response = await usersApi.getUserStats(userId, selectedDate);
if (response.success && response.data) setDetailed(response.data as UserDetailedStats);
} catch (error) {
console.error(error);
} finally {
setIsLoadingDetail(false);
}
};

if (!isManager) {
return (
<div className="h-full flex items-center justify-center">
<div className="text-center px-6">
<Lock size={44} className="text-gray-300 mx-auto mb-3" />
<h2 className="text-base font-bold text-gray-900 mb-1">Accès restreint</h2>
<p className="text-sm text-gray-500">Cette page est réservée aux gérants</p>
</div>
</div>
);
}

return (
<div className="h-full flex flex-col">
<div className="px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
<input
type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-500"
/>
</div>

<div className="flex-1 overflow-y-auto p-3 space-y-2.5">
{isLoading ? (
<div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
) : stats.length === 0 ? (
<div className="text-center py-12 text-gray-400">
<BarChart2 size={44} strokeWidth={1.2} className="mx-auto mb-3 text-gray-300" />
<p className="text-sm font-medium">Aucune activité pour cette date</p>
</div>
) : (
stats.map((s) => {
const completion = s.totalOrders > 0 ? Math.round((s.completedOrders / s.totalOrders) * 100) : 0;
const barColor = completion >= 80 ? 'bg-green-500' : completion >= 50 ? 'bg-amber-500' : 'bg-red-500';
return (
<div key={s.user.id} onClick={() => openDetail(s.user.id)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5">
<div className="flex items-center gap-2.5 mb-2.5">
<div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
{initials(s.user)}
</div>
<div className="min-w-0 flex-1">
<div className="text-sm font-bold text-gray-900 truncate">{displayName(s.user)}</div>
<span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_BADGE[s.user.role] || 'bg-gray-100 text-gray-600'}`}>
{ROLE_LABEL[s.user.role] || s.user.role}
</span>
</div>
</div>
{s.totalOrders > 0 && (
<div className="mb-2">
<div className="flex justify-between text-[11px] text-gray-500 mb-1">
<span>{s.completedOrders}/{s.totalOrders} commandes</span>
<span>{completion}%</span>
</div>
<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
<div className={`h-full rounded-full ${barColor}`} style={{ width: `${completion}%` }} />
</div>
</div>
)}
<div className="flex items-center justify-between text-xs pt-2 border-t border-gray-50">
<span className="text-gray-500">CA: <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{s.totalRevenue.toLocaleString()} F</span></span>
<span className="text-gray-500">Paiements: <span className="font-bold text-green-600">{s.totalPayments.toLocaleString()} F</span></span>
</div>
</div>
);
})
)}
</div>

{selectedUserId && (
<MobileSheet onClose={() => { setSelectedUserId(null); setDetailed(null); }}>
{isLoadingDetail || !detailed ? (
<div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
) : (
<div className="px-4 pb-6">
<div className="flex items-center justify-between py-2">
<div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center">
{initials(detailed.user)}
</div>
<div>
<div className="text-sm font-bold text-gray-900">{displayName(detailed.user)}</div>
<span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_BADGE[detailed.user.role] || ''}`}>
{ROLE_LABEL[detailed.user.role] || detailed.user.role}
</span>
</div>
</div>
<button onClick={() => { setSelectedUserId(null); setDetailed(null); }} className="text-gray-400"><X size={18} /></button>
</div>

<div className="grid grid-cols-2 gap-2.5 my-4">
<div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
<ShoppingBag size={16} className="text-blue-500" />
<div><div className="text-base font-bold text-blue-700">{detailed.stats.totalOrders}</div><div className="text-[10px] text-blue-500">Commandes</div></div>
</div>
<div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
<TrendingUp size={16} className="text-green-500" />
<div><div className="text-base font-bold text-green-700">{detailed.stats.completedOrders}</div><div className="text-[10px] text-green-500">Complétées</div></div>
</div>
</div>

<div className="bg-primary-50 rounded-xl p-3.5 flex items-center gap-3 mb-4">
<div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(var(--color-primary-rgb), 0.15)' }}>
<Award size={18} style={{ color: 'var(--color-primary)' }} />
</div>
<div>
<div className="text-lg font-extrabold" style={{ color: 'var(--color-primary)' }}>{detailed.stats.averageOrderValue.toLocaleString()} FCFA</div>
<div className="text-[11px] text-gray-500">Panier moyen</div>
</div>
</div>

{detailed.topProducts.length > 0 && (
<div className="mb-4">
<div className="text-xs font-semibold text-gray-500 mb-2">Produits les plus vendus</div>
<div className="space-y-1.5">
{detailed.topProducts.slice(0, 5).map((p, i) => (
<div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
<span className="text-xs text-gray-700">#{i + 1} {p.name} <span className="text-gray-400">×{p.quantity}</span></span>
<span className="text-xs font-semibold text-gray-900">{p.revenue.toLocaleString()} F</span>
</div>
))}
</div>
</div>
)}

{Object.keys(detailed.paymentsByMethod).length > 0 && (
<div className="mb-4">
<div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5"><CreditCard size={13} />Répartition des paiements</div>
<div className="space-y-1.5">
{Object.entries(detailed.paymentsByMethod).map(([method, data]) => (
<div key={method} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs">
<span className="text-gray-700">{PAYMENT_METHOD_LABEL[method] || method} ({data.count})</span>
<span className="font-semibold text-gray-900">{data.total.toLocaleString()} F</span>
</div>
))}
</div>
</div>
)}
</div>
)}
</MobileSheet>
)}
</div>
);
}
