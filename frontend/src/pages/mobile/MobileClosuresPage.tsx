import { useState, useEffect } from 'react';
import { Archive, Plus, Loader2, Printer } from 'lucide-react';
import { closuresApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import MobileSheet from '../../components/mobile/MobileSheet';

interface Closure {
id: string; date: string; closedAt: string; closedBy: string;
totalOrders: number; completedOrders: number; cancelledOrders: number;
totalRevenue: number; totalCash: number; totalTmoney: number; totalFlooz: number;
totalCard: number; totalMobile: number; totalOther: number;
detailedReport: string; notes?: string;
user: { id: string; username: string; firstName?: string; lastName?: string };
}

function printClosure(closure: Closure) {
const printWindow = window.open('', '_blank');
if (!printWindow) return;
const closureDate = new Date(closure.date);
const closedAtDate = new Date(closure.closedAt);
const date = closureDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

printWindow.document.write(`
<!DOCTYPE html><html><head><title>Rapport de Clôture - ${date}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Segoe UI',sans-serif; padding:40px; line-height:1.6; color:#333; }
h1 { text-align:center; margin-bottom:10px; color:#2563eb; font-size:28px; }
.subtitle { text-align:center; color:#666; margin-bottom:30px; font-size:14px; }
.section { margin-bottom:30px; }
.section-title { font-size:18px; font-weight:bold; margin-bottom:15px; color:#1f2937; border-bottom:2px solid #e5e7eb; padding-bottom:8px; }
table { width:100%; border-collapse:collapse; margin-top:10px; }
th, td { padding:12px; text-align:left; border-bottom:1px solid #e5e7eb; }
th { background:#f3f4f6; font-weight:600; color:#374151; }
.stat-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; margin-top:15px; }
.stat-box { background:#f9fafb; padding:15px; border-radius:8px; border:1px solid #e5e7eb; }
.stat-label { font-size:12px; color:#6b7280; margin-bottom:5px; }
.stat-value { font-size:24px; font-weight:bold; color:#1f2937; }
.total { background:#dbeafe; font-weight:bold; }
.notes { background:#fef3c7; padding:15px; border-radius:8px; border-left:4px solid #f59e0b; margin-top:15px; }
</style></head><body>
<h1>Rapport de Clôture de Journée</h1>
<div class="subtitle">${date}<br>Clôturé le ${closedAtDate.toLocaleString('fr-FR')}<br>Par ${closure.user.firstName && closure.user.lastName ? `${closure.user.firstName} ${closure.user.lastName}` : closure.user.username}</div>
<div class="section"><div class="section-title">Statistiques globales</div>
<div class="stat-grid">
<div class="stat-box"><div class="stat-label">Chiffre d'affaires</div><div class="stat-value" style="color:#059669;">${Number(closure.totalRevenue).toLocaleString()} F</div></div>
<div class="stat-box"><div class="stat-label">Commandes totales</div><div class="stat-value">${closure.totalOrders}</div></div>
<div class="stat-box"><div class="stat-label">Commandes complétées</div><div class="stat-value" style="color:#2563eb;">${closure.completedOrders}</div></div>
<div class="stat-box"><div class="stat-label">Commandes annulées</div><div class="stat-value" style="color:#dc2626;">${closure.cancelledOrders}</div></div>
</div></div>
<div class="section"><div class="section-title">Répartition par mode de paiement</div>
<table><thead><tr><th>Mode de paiement</th><th style="text-align:right;">Montant</th></tr></thead><tbody>
<tr><td>Espèces</td><td style="text-align:right;">${Number(closure.totalCash).toLocaleString()} F CFA</td></tr>
<tr><td>TMoney</td><td style="text-align:right;">${Number(closure.totalTmoney).toLocaleString()} F CFA</td></tr>
<tr><td>Flooz</td><td style="text-align:right;">${Number(closure.totalFlooz).toLocaleString()} F CFA</td></tr>
<tr><td>Carte</td><td style="text-align:right;">${Number(closure.totalCard).toLocaleString()} F CFA</td></tr>
<tr><td>Mobile</td><td style="text-align:right;">${Number(closure.totalMobile).toLocaleString()} F CFA</td></tr>
<tr><td>Autre</td><td style="text-align:right;">${Number(closure.totalOther).toLocaleString()} F CFA</td></tr>
<tr class="total"><td><strong>Total</strong></td><td style="text-align:right;"><strong>${Number(closure.totalRevenue).toLocaleString()} F CFA</strong></td></tr>
</tbody></table></div>
${closure.notes ? `<div class="section"><div class="section-title">Notes</div><div class="notes">${closure.notes}</div></div>` : ''}
<div style="margin-top:50px; padding-top:20px; border-top:2px solid #e5e7eb; text-align:center; color:#6b7280; font-size:12px;">
Rapport généré automatiquement par le système de gestion Fast-Food
</div>
</body></html>
`);
printWindow.document.close();
printWindow.focus();
setTimeout(() => printWindow.print(), 250);
}

function CreateClosureSheet({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
const [notes, setNotes] = useState('');
const [isCreating, setIsCreating] = useState(false);
const [alreadyExists, setAlreadyExists] = useState(false);
const user = useAuthStore((state) => state.user);

useEffect(() => {
const check = async () => {
if (!user) return;
try {
const response = await closuresApi.checkExists(selectedDate, user.id);
if (response.success && response.data) setAlreadyExists(response.data.exists);
} catch (error) {
console.error(error);
}
};
check();
}, [selectedDate, user]);

const handleCreate = async () => {
if (!user || alreadyExists) return;
try {
setIsCreating(true);
const response = await closuresApi.create({ date: selectedDate, userId: user.id, notes: notes.trim() || undefined });
if (response.success) {
toast.success('Clôture créée avec succès');
onSuccess();
}
} catch (error: any) {
toast.error(error.response?.data?.error || 'Erreur lors de la création de la clôture');
} finally {
setIsCreating(false);
}
};

return (
<MobileSheet onClose={onClose}>
<div className="px-4 pb-6">
<h2 className="text-base font-bold text-gray-900 py-2">Nouvelle clôture</h2>
<div className="mb-3">
<div className="text-xs font-semibold text-gray-500 mb-1.5">Date de clôture</div>
<input
type="date"
value={selectedDate}
onChange={(e) => setSelectedDate(e.target.value)}
max={new Date().toISOString().split('T')[0]}
className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
/>
{alreadyExists && <p className="mt-1.5 text-xs text-red-600">Cette date a déjà été clôturée</p>}
</div>
<div className="mb-4">
<div className="text-xs font-semibold text-gray-500 mb-1.5">Notes (optionnel)</div>
<textarea
value={notes}
onChange={(e) => setNotes(e.target.value)}
rows={3}
placeholder="Ajoutez des notes sur cette journée..."
className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
/>
</div>
<div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
La clôture calculera automatiquement toutes les transactions de la journée sélectionnée.
</div>
<button
onClick={handleCreate}
disabled={isCreating || alreadyExists}
className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50"
>
{isCreating ? 'Création...' : 'Créer la clôture'}
</button>
</div>
</MobileSheet>
);
}

export default function MobileClosuresPage() {
const [closures, setClosures] = useState<Closure[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [selectedClosure, setSelectedClosure] = useState<Closure | null>(null);
const [showCreate, setShowCreate] = useState(false);

const user = useAuthStore((state) => state.user);
const isManager = user?.role === 'MANAGER';

useEffect(() => {
if (user) loadClosures();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [user]);

const loadClosures = async () => {
if (!user) return;
try {
setIsLoading(true);
const response = await closuresApi.getAll(isManager ? undefined : user.id);
if (response.success && response.data) setClosures(response.data);
} catch (error) {
console.error(error);
toast.error('Erreur lors du chargement des clôtures');
} finally {
setIsLoading(false);
}
};

return (
<div className="h-full flex flex-col">
<div className="px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
<button
onClick={() => setShowCreate(true)}
className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm"
>
<Plus size={15} />
Nouvelle clôture
</button>
</div>

<div className="flex-1 overflow-y-auto p-3 space-y-2.5">
{isLoading ? (
<div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
) : closures.length === 0 ? (
<div className="text-center py-12 text-gray-400">
<Archive size={44} strokeWidth={1.2} className="mx-auto mb-3 text-gray-300" />
<p className="text-sm font-medium">Aucune clôture</p>
</div>
) : (
closures.map((closure) => (
<div
key={closure.id}
onClick={() => setSelectedClosure(closure)}
className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5"
>
<div className="text-sm font-bold text-gray-900">
{new Date(closure.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
</div>
<div className="text-[11px] text-gray-400 mb-2">Clôturé le {new Date(closure.closedAt).toLocaleString('fr-FR')}</div>
{isManager && (
<div className="text-xs text-gray-500 mb-1.5">
Par <span className="font-medium text-gray-800">{closure.user.firstName && closure.user.lastName ? `${closure.user.firstName} ${closure.user.lastName}` : closure.user.username}</span>
</div>
)}
<div className="flex items-center justify-between pt-2 border-t border-gray-50">
<span className="text-xs text-gray-500">{closure.totalOrders} commandes ({closure.completedOrders} complétées)</span>
<span className="text-sm font-bold text-green-600">{Number(closure.totalRevenue).toLocaleString()} F</span>
</div>
</div>
))
)}
</div>

{selectedClosure && (
<MobileSheet onClose={() => setSelectedClosure(null)}>
<div className="px-4 pb-6">
<div className="flex items-start justify-between py-2">
<div>
<div className="text-base font-extrabold text-gray-900">
{new Date(selectedClosure.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
</div>
<div className="text-xs text-gray-400 mt-0.5">Clôturé le {new Date(selectedClosure.closedAt).toLocaleString('fr-FR')} par {selectedClosure.user.username}</div>
</div>
<button onClick={() => printClosure(selectedClosure)} className="p-2 text-primary-600 flex-shrink-0" title="Imprimer">
<Printer size={18} />
</button>
</div>

<div className="grid grid-cols-2 gap-2.5 my-4">
<div className="bg-green-50 border border-green-200 rounded-lg p-3">
<div className="text-[11px] text-green-600 mb-0.5">Revenus totaux</div>
<div className="text-lg font-bold text-green-700">{Number(selectedClosure.totalRevenue).toLocaleString()} F</div>
</div>
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
<div className="text-[11px] text-blue-600 mb-0.5">Commandes</div>
<div className="text-lg font-bold text-blue-700">{selectedClosure.totalOrders}</div>
</div>
<div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
<div className="text-[11px] text-purple-600 mb-0.5">Complétées</div>
<div className="text-lg font-bold text-purple-700">{selectedClosure.completedOrders}</div>
</div>
<div className="bg-red-50 border border-red-200 rounded-lg p-3">
<div className="text-[11px] text-red-600 mb-0.5">Annulées</div>
<div className="text-lg font-bold text-red-700">{selectedClosure.cancelledOrders}</div>
</div>
</div>

<div className="mb-4">
<div className="text-xs font-semibold text-gray-500 mb-2">Répartition des paiements</div>
<div className="space-y-1.5">
{[
['Espèces', selectedClosure.totalCash], ['TMoney', selectedClosure.totalTmoney],
['Flooz', selectedClosure.totalFlooz], ['Carte', selectedClosure.totalCard],
['Mobile', selectedClosure.totalMobile], ['Autre', selectedClosure.totalOther],
].map(([label, value]) => (
<div key={label as string} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs">
<span className="text-gray-700">{label}</span>
<span className="font-semibold text-gray-900">{Number(value).toLocaleString()} F CFA</span>
</div>
))}
</div>
</div>

{selectedClosure.notes && (
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Notes</div>
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-gray-700 whitespace-pre-wrap">{selectedClosure.notes}</div>
</div>
)}
</div>
</MobileSheet>
)}

{showCreate && (
<CreateClosureSheet
onClose={() => setShowCreate(false)}
onSuccess={() => { setShowCreate(false); loadClosures(); }}
/>
)}
</div>
);
}
