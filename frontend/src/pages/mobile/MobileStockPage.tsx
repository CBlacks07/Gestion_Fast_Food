import { useState, useEffect } from 'react';
import { Package, Plus, Loader2, AlertTriangle, Pencil, ArrowUpDown } from 'lucide-react';
import { ingredientsApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import MobileSheet from '../../components/mobile/MobileSheet';
import type { Ingredient, IngredientUnit, StockMovementType } from '../../types';

const UNITS: { value: IngredientUnit; label: string; suffix: string }[] = [
{ value: 'GRAM', label: 'Grammes', suffix: 'g' },
{ value: 'KILOGRAM', label: 'Kilogrammes', suffix: 'kg' },
{ value: 'LITER', label: 'Litres', suffix: 'L' },
{ value: 'MILLILITER', label: 'Millilitres', suffix: 'ml' },
{ value: 'PIECE', label: 'Pièces', suffix: 'pcs' },
{ value: 'UNIT', label: 'Unités', suffix: 'u' },
];
const unitSuffix = (u: IngredientUnit) => UNITS.find((x) => x.value === u)?.suffix || u;

const MOVEMENT_TYPES: { value: StockMovementType; label: string; color: string }[] = [
{ value: 'PURCHASE', label: 'Achat', color: 'bg-green-100 text-green-700 border-green-300' },
{ value: 'ADJUSTMENT', label: 'Ajustement', color: 'bg-blue-100 text-blue-700 border-blue-300' },
{ value: 'WASTE', label: 'Perte', color: 'bg-red-100 text-red-700 border-red-300' },
{ value: 'RETURN', label: 'Retour', color: 'bg-amber-100 text-amber-700 border-amber-300' },
];

function MovementSheet({ ingredient, onClose, onSuccess }: { ingredient: Ingredient; onClose: () => void; onSuccess: () => void }) {
const [type, setType] = useState<StockMovementType>('PURCHASE');
const [quantity, setQuantity] = useState('');
const [reason, setReason] = useState('');
const [reference, setReference] = useState('');
const [isSaving, setIsSaving] = useState(false);

const handleSubmit = async () => {
const qty = parseFloat(quantity);
if (!qty || qty === 0) {
toast.warning('Veuillez indiquer une quantité');
return;
}
const finalQty = (type === 'WASTE' || type === 'SALE') ? -Math.abs(qty) : qty;
try {
setIsSaving(true);
const response = await ingredientsApi.addStock(ingredient.id, { type, quantity: finalQty, reason: reason || undefined, reference: reference || undefined });
if (response.success) {
toast.success('Mouvement de stock enregistré');
onSuccess();
} else {
toast.error('Erreur lors de l\'enregistrement');
}
} catch (error: any) {
toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
} finally {
setIsSaving(false);
}
};

return (
<MobileSheet onClose={onClose}>
<div className="px-4 pb-6">
<h2 className="text-base font-bold text-gray-900 py-2">Mouvement de stock — {ingredient.name}</h2>
<div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
Stock actuel : <span className="font-bold text-gray-900">{ingredient.currentStock} {unitSuffix(ingredient.unit)}</span>
</div>
<div className="grid grid-cols-2 gap-2 mb-4">
{MOVEMENT_TYPES.map((m) => (
<button
key={m.value}
onClick={() => setType(m.value)}
className={`py-2.5 rounded-lg text-xs font-semibold border-2 ${type === m.value ? m.color : 'border-gray-200 text-gray-500'}`}
>
{m.label}
</button>
))}
</div>
<div className="mb-3">
<div className="text-xs font-semibold text-gray-500 mb-1.5">Quantité ({unitSuffix(ingredient.unit)})</div>
<input
type="number" step="0.001" value={quantity} onChange={(e) => setQuantity(e.target.value)}
className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
/>
<p className="text-[11px] text-gray-400 mt-1">
{type === 'WASTE' ? 'Sera soustrait du stock' : 'Sera ajouté au stock'}
</p>
</div>
<div className="mb-3">
<div className="text-xs font-semibold text-gray-500 mb-1.5">Raison (optionnel)</div>
<input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div className="mb-5">
<div className="text-xs font-semibold text-gray-500 mb-1.5">Référence (optionnel)</div>
<input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<button onClick={handleSubmit} disabled={isSaving} className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50">
{isSaving ? 'Enregistrement...' : 'Enregistrer'}
</button>
</div>
</MobileSheet>
);
}

function IngredientFormSheet({ ingredient, onClose, onSuccess }: { ingredient: Ingredient | null; onClose: () => void; onSuccess: () => void }) {
const [name, setName] = useState(ingredient?.name || '');
const [description, setDescription] = useState(ingredient?.description || '');
const [unit, setUnit] = useState<IngredientUnit>(ingredient?.unit || 'PIECE');
const [currentStock, setCurrentStock] = useState(ingredient?.currentStock?.toString() || '0');
const [minStock, setMinStock] = useState(ingredient?.minStock?.toString() || '0');
const [unitCost, setUnitCost] = useState(ingredient?.unitCost?.toString() || '0');
const [isActive, setIsActive] = useState(ingredient?.isActive ?? true);
const [isSaving, setIsSaving] = useState(false);

const handleSubmit = async () => {
if (!name.trim()) {
toast.warning('Veuillez entrer un nom');
return;
}
try {
setIsSaving(true);
if (ingredient) {
await ingredientsApi.update(ingredient.id, {
name, description: description || undefined, unit,
minStock: parseFloat(minStock), unitCost: parseFloat(unitCost), isActive,
});
} else {
await ingredientsApi.create({
name, description: description || undefined, unit,
currentStock: parseFloat(currentStock), minStock: parseFloat(minStock), unitCost: parseFloat(unitCost),
});
}
toast.success(ingredient ? 'Ingrédient modifié' : 'Ingrédient créé');
onSuccess();
} catch (error: any) {
toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
} finally {
setIsSaving(false);
}
};

return (
<MobileSheet onClose={onClose}>
<div className="px-4 pb-6">
<h2 className="text-base font-bold text-gray-900 py-2">{ingredient ? 'Modifier l\'ingrédient' : 'Nouvel ingrédient'}</h2>
<div className="space-y-3">
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Nom *</div>
<input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Description</div>
<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Unité de mesure *</div>
<select value={unit} onChange={(e) => setUnit(e.target.value as IngredientUnit)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
{UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
</select>
</div>
{!ingredient && (
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Stock actuel *</div>
<input type="number" step="0.001" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
)}
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Stock minimum *</div>
<input type="number" step="0.001" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Coût unitaire (F) *</div>
<input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
{ingredient && (
<label className="flex items-center gap-2 text-sm text-gray-600">
<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
Actif
</label>
)}
</div>
<button onClick={handleSubmit} disabled={isSaving} className="w-full mt-5 bg-primary-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50">
{isSaving ? 'Enregistrement...' : ingredient ? 'Modifier' : 'Créer'}
</button>
</div>
</MobileSheet>
);
}

export default function MobileStockPage() {
const [ingredients, setIngredients] = useState<Ingredient[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [showLowStock, setShowLowStock] = useState(false);
const [movementFor, setMovementFor] = useState<Ingredient | null>(null);
const [editTarget, setEditTarget] = useState<Ingredient | null>(null);
const [showCreate, setShowCreate] = useState(false);

const user = useAuthStore((state) => state.user);
const isManager = user?.role === 'MANAGER';

useEffect(() => {
loadIngredients();
}, [showLowStock]);

const loadIngredients = async () => {
try {
setIsLoading(true);
const response = await ingredientsApi.getAll({ lowStock: showLowStock });
if (response.success && response.data) setIngredients(response.data);
} catch (error) {
console.error(error);
toast.error('Erreur lors du chargement des ingrédients');
} finally {
setIsLoading(false);
}
};

const getStockPercent = (ing: Ingredient) => Math.min(100, Math.round((Number(ing.currentStock) / (Number(ing.minStock) * 2 || 1)) * 100));
const isLow = (ing: Ingredient) => Number(ing.currentStock) <= Number(ing.minStock);

return (
<div className="h-full flex flex-col">
<div className="px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
<label className="flex items-center gap-2 text-xs font-medium text-gray-600">
<input type="checkbox" checked={showLowStock} onChange={(e) => setShowLowStock(e.target.checked)} />
Stock bas uniquement
</label>
{isManager && (
<button onClick={() => setShowCreate(true)} className="flex items-center gap-1 text-xs font-semibold text-primary-600">
<Plus size={14} />
Nouvel ingrédient
</button>
)}
</div>

<div className="flex-1 overflow-y-auto p-3 space-y-2.5">
{isLoading ? (
<div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
) : ingredients.length === 0 ? (
<div className="text-center py-12 text-gray-400">
<Package size={44} strokeWidth={1.2} className="mx-auto mb-3 text-gray-300" />
<p className="text-sm font-medium">Aucun ingrédient</p>
</div>
) : (
ingredients.map((ing) => {
const low = isLow(ing);
return (
<div key={ing.id} className={`bg-white rounded-xl border p-3.5 shadow-sm ${low ? 'border-red-200' : 'border-gray-100'}`}>
<div className="flex items-start justify-between mb-2">
<div className="min-w-0">
<div className="text-sm font-bold text-gray-900 flex items-center gap-1.5 truncate">
{low && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
{ing.name}
</div>
{ing.description && <div className="text-[11px] text-gray-400 truncate">{ing.description}</div>}
</div>
<div className="text-right flex-shrink-0 ml-2">
<div className={`text-sm font-extrabold ${low ? 'text-red-600' : 'text-gray-900'}`}>{ing.currentStock} {unitSuffix(ing.unit)}</div>
<div className="text-[10px] text-gray-400">min: {ing.minStock} {unitSuffix(ing.unit)}</div>
</div>
</div>
<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
<div className={`h-full rounded-full ${low ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${getStockPercent(ing)}%` }} />
</div>
<div className="flex items-center justify-between">
<div className="text-[11px] text-gray-500">Coût unitaire: {Number(ing.unitCost).toLocaleString()} F</div>
{isManager && (
<div className="flex items-center gap-2">
<button onClick={() => setMovementFor(ing)} className="text-[11px] font-semibold text-primary-600 flex items-center gap-1">
<ArrowUpDown size={11} />
Mouvement
</button>
<button onClick={() => setEditTarget(ing)} className="text-gray-400">
<Pencil size={13} />
</button>
</div>
)}
</div>
</div>
);
})
)}
</div>

{movementFor && (
<MovementSheet
ingredient={movementFor}
onClose={() => setMovementFor(null)}
onSuccess={() => { setMovementFor(null); loadIngredients(); }}
/>
)}
{editTarget && (
<IngredientFormSheet
ingredient={editTarget}
onClose={() => setEditTarget(null)}
onSuccess={() => { setEditTarget(null); loadIngredients(); }}
/>
)}
{showCreate && (
<IngredientFormSheet
ingredient={null}
onClose={() => setShowCreate(false)}
onSuccess={() => { setShowCreate(false); loadIngredients(); }}
/>
)}
</div>
);
}
