import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Calculator, Banknote, Smartphone, CreditCard, Wallet, Lock, Loader2, Utensils, ShoppingBag as TakeawayIcon, Bike } from 'lucide-react';
import { ordersApi, paymentsApi, usersApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface PaymentMethodStats { count: number; total: number; }
interface OrderStats { totalOrders: number; totalRevenue: number; averageOrderValue: number; orders?: DayOrder[]; }
interface PaymentStats { totalPayments: number; byMethod: Record<string, PaymentMethodStats>; totalAmount?: number; }
interface DayOrder { id: string; orderNumber: string; type: string; status: string; createdAt: string; total: number | string; }

function getPaymentMethodIcon(method: string) {
const map: Record<string, JSX.Element> = {
CASH: <Banknote size={14} />, TMONEY: <Smartphone size={14} />, FLOOZ: <Wallet size={14} />,
CARD: <CreditCard size={14} />, MOBILE: <Smartphone size={14} />, OTHER: <Wallet size={14} />,
};
return map[method] || <Wallet size={14} />;
}

function getPaymentMethodLabel(method: string) {
const labels: Record<string, string> = { CASH: 'Espèces', TMONEY: 'TMoney', FLOOZ: 'Flooz', CARD: 'Carte bancaire', MOBILE: 'Mobile', OTHER: 'Autre' };
return labels[method] || method;
}

function getStatusBadge(status: string) {
const config: Record<string, { label: string; dot: string; text: string }> = {
DELIVERED: { label: 'Servie', dot: 'bg-emerald-400', text: 'text-emerald-700' },
PREPARING: { label: 'En prépa.', dot: 'bg-blue-400', text: 'text-blue-700' },
READY: { label: 'Prête', dot: 'bg-purple-400', text: 'text-purple-700' },
CANCELLED: { label: 'Annulée', dot: 'bg-red-400', text: 'text-red-700' },
PENDING: { label: 'En attente', dot: 'bg-amber-400', text: 'text-amber-700' },
};
return config[status] || { label: status, dot: 'bg-gray-400', text: 'text-gray-700' };
}

export default function MobileDashboardPage() {
const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
const [isLoading, setIsLoading] = useState(true);

const user = useAuthStore((state) => state.user);
const isManager = user?.role === 'MANAGER';
const isCashier = user?.role === 'CASHIER';
const canAccess = isManager || isCashier;

useEffect(() => {
if (!canAccess || !user) return;
loadStats();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [canAccess, user]);

const loadStats = async () => {
if (!user) return;
try {
setIsLoading(true);
if (isManager) {
const [ordersResponse, paymentsResponse] = await Promise.all([
ordersApi.getTodayStats(),
paymentsApi.getTodayStats(),
]);
if (ordersResponse.success && ordersResponse.data) setOrderStats(ordersResponse.data as OrderStats);
if (paymentsResponse.success && paymentsResponse.data) setPaymentStats(paymentsResponse.data as PaymentStats);
} else if (isCashier) {
const today = new Date().toISOString().split('T')[0];
const statsResponse = await usersApi.getUserStats(user.id, today);
if (statsResponse.success && statsResponse.data) {
const userData = statsResponse.data as {
stats?: { totalOrders?: number; totalRevenue?: number; averageOrderValue?: number };
orders?: DayOrder[];
paymentsByMethod?: Record<string, PaymentMethodStats>;
};
setOrderStats({
totalOrders: userData.stats?.totalOrders || 0,
totalRevenue: userData.stats?.totalRevenue || 0,
averageOrderValue: userData.stats?.averageOrderValue || 0,
orders: userData.orders || [],
});
const paymentsByMethod = userData.paymentsByMethod || {};
setPaymentStats({
totalPayments: Object.values(paymentsByMethod).reduce((sum, m) => sum + m.count, 0),
byMethod: paymentsByMethod,
totalAmount: Object.values(paymentsByMethod).reduce((sum, m) => sum + m.total, 0),
});
}
}
} catch (error) {
console.error(error);
} finally {
setIsLoading(false);
}
};

if (!canAccess) {
return (
<div className="h-full flex items-center justify-center">
<div className="text-center px-6">
<Lock size={44} className="text-gray-300 mx-auto mb-3" />
<h2 className="text-base font-bold text-gray-900 mb-1">Accès restreint</h2>
<p className="text-sm text-gray-500">Réservé aux gérants et caissiers</p>
</div>
</div>
);
}

if (isLoading) {
return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={28} /></div>;
}

const totalRevenue = orderStats?.totalRevenue || 0;
const totalOrders = orderStats?.totalOrders || 0;
const avgOrder = orderStats?.averageOrderValue || 0;
const totalPayments = paymentStats?.totalAmount || 0;
const byMethod = paymentStats?.byMethod || {};
const methodEntries = Object.entries(byMethod);

return (
<div className="h-full overflow-y-auto p-3 space-y-3 pb-6">
{/* KPI cards */}
<div className="grid grid-cols-1 gap-3">
<div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
<div className="h-1" style={{ background: 'var(--color-primary)' }} />
<div className="p-4 flex items-center gap-3">
<div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--color-primary-rgb), 0.1)' }}>
<TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
</div>
<div>
<div className="text-lg font-extrabold text-gray-900">{totalRevenue.toLocaleString()} <span className="text-xs font-semibold text-gray-400">FCFA</span></div>
<div className="text-xs text-gray-500">Chiffre d'affaires</div>
</div>
</div>
</div>
<div className="grid grid-cols-2 gap-3">
<div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
<div className="h-1 bg-blue-400" />
<div className="p-3.5">
<ShoppingBag size={16} className="text-blue-500 mb-1.5" />
<div className="text-base font-extrabold text-gray-900">{totalOrders}</div>
<div className="text-[11px] text-gray-500">Commandes</div>
</div>
</div>
<div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
<div className="h-1" style={{ background: 'var(--color-secondary, #6b7280)' }} />
<div className="p-3.5">
<Calculator size={16} style={{ color: 'var(--color-secondary, #6b7280)' }} className="mb-1.5" />
<div className="text-base font-extrabold text-gray-900">{avgOrder.toLocaleString()}</div>
<div className="text-[11px] text-gray-500">Panier moyen</div>
</div>
</div>
</div>
</div>

{/* Paiements */}
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
<div className="flex items-center justify-between mb-3">
<h2 className="text-sm font-bold text-gray-900">Répartition des paiements</h2>
</div>
{methodEntries.length === 0 ? (
<div className="text-center py-6 text-gray-400 text-xs">Aucun paiement aujourd'hui</div>
) : (
<div className="space-y-3">
{methodEntries.map(([method, data]) => {
const pct = totalPayments > 0 ? (data.total / totalPayments) * 100 : 0;
return (
<div key={method}>
<div className="flex items-center justify-between text-xs mb-1">
<span className="text-gray-700 font-medium flex items-center gap-1.5">{getPaymentMethodIcon(method)} {getPaymentMethodLabel(method)}</span>
<span className="text-gray-900 font-bold">{data.total.toLocaleString()} FCFA</span>
</div>
<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
<div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--color-primary)' }} />
</div>
</div>
);
})}
<div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between">
<span className="text-xs font-semibold text-gray-700">Total encaissé</span>
<span className="text-base font-extrabold" style={{ color: 'var(--color-secondary, #6b7280)' }}>{totalPayments.toLocaleString()} FCFA</span>
</div>
</div>
)}
</div>

{/* Commandes du jour */}
{orderStats?.orders && orderStats.orders.length > 0 && (
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
<h2 className="text-sm font-bold text-gray-900 mb-3">Commandes du jour</h2>
<div className="space-y-2">
{orderStats.orders.slice(0, 15).map((order) => {
const badge = getStatusBadge(order.status);
return (
<div key={order.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
<div className="min-w-0">
<div className="text-xs font-semibold text-gray-900 truncate">{order.orderNumber}</div>
<div className="flex items-center gap-1 text-[10px] text-gray-400">
{order.type === 'DINE_IN' ? <Utensils size={9} /> : order.type === 'TAKEAWAY' ? <TakeawayIcon size={9} /> : <Bike size={9} />}
{new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
<span className={`inline-flex items-center gap-1 ml-1 ${badge.text}`}>
<span className={`w-1 h-1 rounded-full ${badge.dot}`} />
{badge.label}
</span>
</div>
</div>
<div className="text-xs font-bold text-gray-900 flex-shrink-0 ml-2">{Number(order.total).toLocaleString()} F</div>
</div>
);
})}
</div>
</div>
)}
</div>
);
}
