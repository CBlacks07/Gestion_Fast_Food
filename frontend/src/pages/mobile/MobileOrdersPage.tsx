import { useState, useEffect, useMemo } from 'react';
import {
Clock, Truck, XCircle, LayoutGrid, Loader2, Inbox,
Utensils, ShoppingBag, Bike, Banknote, Smartphone, CreditCard, Wallet, Trash2,
} from 'lucide-react';
import { ordersApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import ConfirmDialog from '../../components/ConfirmDialog';
import MobileSheet from '../../components/mobile/MobileSheet';
import type { Order, OrderStatus } from '../../types';

type LucideIcon = typeof Clock;

interface StatusOption {
value: string;
label: string;
Icon: LucideIcon;
}

const STATUS_OPTIONS: StatusOption[] = [
{ value: 'all',       label: 'Toutes',     Icon: LayoutGrid },
{ value: 'PENDING',   label: 'En attente', Icon: Clock },
{ value: 'DELIVERED', label: 'Servi/Livré', Icon: Truck },
{ value: 'CANCELLED', label: 'Annulée',    Icon: XCircle },
];

function getStatusColor(status: OrderStatus) {
const colors: Record<OrderStatus, string> = {
PENDING: 'bg-yellow-100 text-yellow-800',
PREPARING: 'bg-blue-100 text-blue-800',
READY: 'bg-green-100 text-green-800',
DELIVERED: 'bg-purple-100 text-purple-800',
CANCELLED: 'bg-red-100 text-red-800',
};
return colors[status] || 'bg-gray-100 text-gray-800';
}

function getDeliveredLabel(type?: string) {
if (type === 'DINE_IN') return 'Servi';
if (type === 'TAKEAWAY') return 'Récupéré';
return 'Livré';
}

function getStatusLabel(status: OrderStatus, type?: string) {
if (status === 'DELIVERED') return getDeliveredLabel(type);
const labels: Record<OrderStatus, string> = {
PENDING: 'En attente', PREPARING: 'En préparation', READY: 'Prête',
DELIVERED: 'Livré', CANCELLED: 'Annulée',
};
return labels[status] || status;
}

export default function MobileOrdersPage() {
const [rawOrders, setRawOrders] = useState<Order[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [selectedStatus, setSelectedStatus] = useState('all');
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
const [confirmCancel, setConfirmCancel] = useState<{ orderId: string } | null>(null);

const user = useAuthStore((state) => state.user);
const isManager = user?.role === 'MANAGER';

const orders = useMemo(
() => [...rawOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
[rawOrders]
);

useEffect(() => {
loadOrders();
}, [selectedStatus, selectedDate]);

const loadOrders = async () => {
try {
setIsLoading(true);
const params: { status?: string; date?: string } = {};
if (selectedStatus !== 'all') params.status = selectedStatus;
if (selectedDate) params.date = selectedDate;
const response = await ordersApi.getAll(params);
if (response.success && response.data) setRawOrders(response.data);
} catch (error) {
console.error(error);
toast.error('Impossible de charger les commandes');
} finally {
setIsLoading(false);
}
};

const applyStatusChange = async (orderId: string, newStatus: OrderStatus) => {
try {
await ordersApi.updateStatus(orderId, newStatus);
toast.success('Statut mis à jour');
loadOrders();
if (selectedOrder?.id === orderId) {
setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
}
} catch (error) {
console.error(error);
toast.error('Erreur lors de la mise à jour du statut');
}
};

const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
if (newStatus === 'CANCELLED') {
setConfirmCancel({ orderId });
return;
}
applyStatusChange(orderId, newStatus);
};

const confirmDeleteOrder = async () => {
if (!confirmDelete || !user?.id) return;
try {
await ordersApi.cancel(confirmDelete, user.id);
toast.success('Commande annulée avec succès');
loadOrders();
if (selectedOrder?.id === confirmDelete) setSelectedOrder(null);
} catch (error) {
console.error(error);
toast.error("Erreur lors de la suppression de la commande");
} finally {
setConfirmDelete(null);
}
};

return (
<div className="h-full flex flex-col">
{/* Filtres */}
<div className="px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0 space-y-2">
<input
type="date"
value={selectedDate}
onChange={(e) => setSelectedDate(e.target.value)}
className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-500"
/>
<div className="flex gap-1.5 overflow-x-auto">
{STATUS_OPTIONS.map(({ value, label, Icon }) => (
<button
key={value}
onClick={() => setSelectedStatus(value)}
className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${selectedStatus === value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
>
<Icon size={13} />
{label}
</button>
))}
</div>
</div>

{/* Liste */}
<div className="flex-1 overflow-y-auto p-3 space-y-2.5">
{isLoading ? (
<div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
) : orders.length === 0 ? (
<div className="text-center py-12 text-gray-400">
<Inbox size={44} strokeWidth={1.2} className="mx-auto mb-3 text-gray-300" />
<p className="text-sm font-medium">Aucune commande</p>
</div>
) : (
orders.map((order) => (
<div
key={order.id}
onClick={() => setSelectedOrder(order)}
className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm"
>
<div className="flex items-start justify-between mb-2">
<div>
<div className="text-sm font-bold text-gray-900">{order.orderNumber}</div>
<div className="text-[11px] text-gray-400">{new Date(order.createdAt).toLocaleString('fr-FR')}</div>
</div>
<span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
{getStatusLabel(order.status, order.type)}
</span>
</div>
<div className="text-xs text-gray-500 mb-2">
{order.items.slice(0, 2).map((i) => `${i.quantity}x ${i.product.name}`).join(', ')}
{order.items.length > 2 && ` +${order.items.length - 2} autre(s)`}
</div>
<div className="flex items-center justify-between pt-2 border-t border-gray-50">
<div className="text-[11px] text-gray-400 flex items-center gap-1">
{order.type === 'DINE_IN' ? <Utensils size={11} /> : order.type === 'TAKEAWAY' ? <ShoppingBag size={11} /> : <Bike size={11} />}
{order.type === 'DINE_IN' ? 'Sur place' : order.type === 'TAKEAWAY' ? 'À emporter' : 'Livraison'}
{order.table && ` · Table ${order.table.number}`}
</div>
<div className="text-sm font-bold text-primary-600">{Number(order.total).toLocaleString()} FCFA</div>
</div>
</div>
))
)}
</div>

{/* Sheet détail */}
{selectedOrder && (
<MobileSheet onClose={() => setSelectedOrder(null)}>
<div className="px-4 pb-6">
<div className="py-2">
<div className="text-lg font-extrabold text-gray-900">{selectedOrder.orderNumber}</div>
<div className="text-xs text-gray-400">{new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</div>
</div>

<div className="mb-4">
<div className="text-xs font-semibold text-gray-500 mb-2">Statut</div>
<div className="flex gap-2">
{(['PENDING', 'DELIVERED', 'CANCELLED'] as OrderStatus[])
.filter((s) => s !== 'CANCELLED' || !selectedOrder.payments || selectedOrder.payments.length === 0 || selectedOrder.status === 'CANCELLED')
.map((s) => (
<button
key={s}
disabled={selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED'}
onClick={() => handleStatusChange(selectedOrder.id, s)}
className={`flex-1 py-2 rounded-lg text-xs font-semibold disabled:opacity-40 ${selectedOrder.status === s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
>
{getStatusLabel(s, selectedOrder.type)}
</button>
))}
</div>
</div>

<div className="mb-4">
<div className="text-xs font-semibold text-gray-500 mb-2">Articles</div>
<div className="space-y-1.5">
{selectedOrder.items.map((item) => (
<div key={item.id} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
<span className="text-gray-700">{item.quantity}x {item.product.name}</span>
<span className="font-semibold text-gray-900">{Number(item.total).toLocaleString()} F</span>
</div>
))}
</div>
</div>

<div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100 mb-4">
<span>Total</span>
<span className="text-primary-600">{Number(selectedOrder.total).toLocaleString()} FCFA</span>
</div>

{selectedOrder.payments && selectedOrder.payments.length > 0 && (
<div className="mb-4">
<div className="text-xs font-semibold text-gray-500 mb-2">Paiements</div>
<div className="space-y-1.5">
{selectedOrder.payments.map((payment) => (
<div key={payment.id} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
<div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
{payment.method === 'CASH' ? <Banknote size={13} /> : payment.method === 'CARD' ? <CreditCard size={13} /> : payment.method === 'FLOOZ' ? <Wallet size={13} /> : <Smartphone size={13} />}
{payment.method === 'CASH' ? 'Espèces' : payment.method === 'TMONEY' ? 'TMoney' : payment.method === 'FLOOZ' ? 'Flooz' : payment.method === 'CARD' ? 'Carte' : 'Mobile'}
</div>
<span className="text-sm font-semibold text-green-600">{Number(payment.amount).toLocaleString()} F</span>
</div>
))}
</div>
</div>
)}

{isManager && selectedOrder.status !== 'CANCELLED' && (
<button
onClick={() => setConfirmDelete(selectedOrder.id)}
className="w-full py-3 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
>
<Trash2 size={15} />
Supprimer la commande
</button>
)}
</div>
</MobileSheet>
)}

{confirmCancel && (
<ConfirmDialog
title="Annuler la commande"
message="Passer cette commande en statut Annulée ? Cette action ne pourra plus être modifiée."
confirmLabel="Oui, annuler"
cancelLabel="Non, garder"
variant="warning"
onConfirm={async () => { await applyStatusChange(confirmCancel.orderId, 'CANCELLED'); setConfirmCancel(null); }}
onCancel={() => setConfirmCancel(null)}
/>
)}

{confirmDelete && (
<ConfirmDialog
title="Supprimer la commande"
message="Cette action est irréversible."
confirmLabel="Supprimer"
cancelLabel="Annuler"
variant="danger"
onConfirm={confirmDeleteOrder}
onCancel={() => setConfirmDelete(null)}
/>
)}
</div>
);
}
