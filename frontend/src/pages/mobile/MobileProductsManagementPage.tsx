import { useState, useEffect, useMemo } from 'react';
import { Lock, Loader2, Tag, Search, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { productsApi, categoriesApi, API_BASE_URL } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import ConfirmDialog from '../../components/ConfirmDialog';
import MobileSheet from '../../components/mobile/MobileSheet';
import MobileImageUpload from '../../components/mobile/MobileImageUpload';
import type { Product, Category, ProductType } from '../../types';

const TYPE_LABELS: Record<ProductType, string> = { FOOD: 'Nourriture', DRINK: 'Boisson', DESSERT: 'Dessert', SIDE: 'Accompagnement' };

function ProductFormSheet({ product, categories, onClose, onSuccess }: { product: Product | null; categories: Category[]; onClose: () => void; onSuccess: () => void }) {
const [name, setName] = useState(product?.name || '');
const [description, setDescription] = useState(product?.description || '');
const [image, setImage] = useState(product?.image || '');
const [price, setPrice] = useState(product?.price?.toString() || '');
const [cost, setCost] = useState(product?.cost?.toString() || '');
const [type, setType] = useState<ProductType>(product?.type || 'FOOD');
const [categoryId, setCategoryId] = useState(product?.categoryId || '');
const [preparationTime, setPreparationTime] = useState(product?.preparationTime?.toString() || '');
const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
const [isActive, setIsActive] = useState(product?.isActive ?? true);
const [isSaving, setIsSaving] = useState(false);

const handleSubmit = async () => {
if (!name || !price || !categoryId) {
toast.warning('Veuillez remplir tous les champs obligatoires');
return;
}
try {
setIsSaving(true);
const data = {
name, description: description || undefined, price: Number(price),
cost: cost ? Number(cost) : undefined, type, categoryId, image: image || undefined,
preparationTime: preparationTime ? Number(preparationTime) : undefined,
isAvailable, isActive,
};
if (product) await productsApi.update(product.id, data);
else await productsApi.create(data);
toast.success(product ? 'Produit modifié' : 'Produit créé');
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
<h2 className="text-base font-bold text-gray-900 py-2">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
<div className="space-y-3">
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Nom *</div>
<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Burger Classique" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Description</div>
<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
</div>
<MobileImageUpload label="Image" imageUrl={image} onChange={setImage} onClear={() => setImage('')} />
<div className="grid grid-cols-2 gap-3">
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Prix de vente (F) *</div>
<input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Coût (F)</div>
<input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Type *</div>
<select value={type} onChange={(e) => setType(e.target.value as ProductType)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
{Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
</select>
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Catégorie *</div>
<select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
<option value="">Sélectionnez...</option>
{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
</select>
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Temps de préparation (min)</div>
<input type="number" value={preparationTime} onChange={(e) => setPreparationTime(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<label className="flex items-center gap-2 text-sm text-gray-600">
<input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
Disponible à la vente
</label>
{product && (
<label className="flex items-center gap-2 text-sm text-gray-600">
<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
Actif
</label>
)}
</div>
<button onClick={handleSubmit} disabled={isSaving} className="w-full mt-5 bg-primary-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50">
{isSaving ? 'Enregistrement...' : product ? 'Modifier' : 'Créer'}
</button>
</div>
</MobileSheet>
);
}

export default function MobileProductsManagementPage() {
const [products, setProducts] = useState<Product[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [search, setSearch] = useState('');
const [filterCategory, setFilterCategory] = useState('');
const [editTarget, setEditTarget] = useState<Product | null>(null);
const [showCreate, setShowCreate] = useState(false);
const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

const user = useAuthStore((state) => state.user);
const isManager = user?.role === 'MANAGER';

useEffect(() => {
if (!isManager) return;
loadData();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isManager]);

const loadData = async () => {
try {
setIsLoading(true);
const [productsResponse, categoriesResponse] = await Promise.all([productsApi.getAll(), categoriesApi.getAll()]);
if (productsResponse.success && productsResponse.data) setProducts(productsResponse.data);
if (categoriesResponse.success && categoriesResponse.data) setCategories(categoriesResponse.data);
} catch (error) {
console.error(error);
toast.error('Erreur lors du chargement des produits');
} finally {
setIsLoading(false);
}
};

const toggleAvailability = async (product: Product) => {
try {
await productsApi.updateAvailability(product.id, !product.isAvailable);
toast.success('Disponibilité mise à jour');
loadData();
} catch (error) {
toast.error('Erreur lors de la mise à jour');
}
};

const confirmDeleteProduct = async () => {
if (!confirmDelete) return;
try {
await productsApi.delete(confirmDelete.id);
toast.success('Produit supprimé');
setConfirmDelete(null);
loadData();
} catch (error: any) {
toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
}
};

const filtered = useMemo(() => {
const q = search.trim().toLowerCase();
return products
.filter((p) => p.isActive !== false)
.filter((p) => !filterCategory || p.categoryId === filterCategory)
.filter((p) => !q || p.name.toLowerCase().includes(q));
}, [products, search, filterCategory]);

if (!isManager) {
return (
<div className="h-full flex items-center justify-center">
<div className="text-center px-6">
<Lock size={44} className="text-gray-300 mx-auto mb-3" />
<h2 className="text-base font-bold text-gray-900 mb-1">Accès restreint</h2>
<p className="text-sm text-gray-500">Réservé aux gérants</p>
</div>
</div>
);
}

return (
<div className="h-full flex flex-col">
<div className="px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0 space-y-2">
<div className="flex items-center justify-between">
<div className="relative flex-1 mr-2">
<Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
<input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none" />
</div>
<button onClick={() => setShowCreate(true)} className="flex items-center gap-1 text-xs font-semibold text-primary-600 flex-shrink-0">
<Plus size={14} />
Nouveau
</button>
</div>
<select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs outline-none">
<option value="">Toutes les catégories</option>
{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
</select>
</div>

<div className="flex-1 overflow-y-auto p-3">
{isLoading ? (
<div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
) : filtered.length === 0 ? (
<div className="text-center py-12 text-gray-400"><Tag size={44} strokeWidth={1.2} className="mx-auto mb-3 text-gray-300" /><p className="text-sm font-medium">Aucun produit trouvé</p></div>
) : (
<div className="grid grid-cols-2 gap-3">
{filtered.map((p) => {
const imgSrc = p.image ? (p.image.startsWith('http') ? p.image : `${API_BASE_URL}${p.image}`) : null;
return (
<div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
<div className="relative h-24 bg-gray-100">
{imgSrc ? <img src={imgSrc} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Tag size={24} /></div>}
{!p.isAvailable && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="text-[9px] font-bold text-red-500 bg-white px-1.5 py-0.5 rounded-full">Indisponible</span></div>}
<span className="absolute bottom-1.5 right-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: 'var(--color-secondary, #6b7280)' }}>{Number(p.price).toLocaleString()} F</span>
</div>
<div className="p-2">
<div className="text-xs font-semibold text-gray-900 truncate">{p.name}</div>
<div className="flex items-center gap-1 mt-1.5">
<button onClick={() => toggleAvailability(p)} className={`flex-1 py-1 rounded text-[10px] font-semibold flex items-center justify-center gap-1 ${p.isAvailable ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
{p.isAvailable ? <EyeOff size={10} /> : <Eye size={10} />}
</button>
<button onClick={() => setEditTarget(p)} className="flex-1 py-1 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 flex items-center justify-center"><Pencil size={10} /></button>
<button onClick={() => setConfirmDelete(p)} className="flex-1 py-1 rounded text-[10px] font-semibold bg-red-50 text-red-600 flex items-center justify-center"><Trash2 size={10} /></button>
</div>
</div>
</div>
);
})}
</div>
)}
</div>

{(editTarget || showCreate) && (
<ProductFormSheet
product={editTarget}
categories={categories}
onClose={() => { setEditTarget(null); setShowCreate(false); }}
onSuccess={() => { setEditTarget(null); setShowCreate(false); loadData(); }}
/>
)}

{confirmDelete && (
<ConfirmDialog
title="Supprimer le produit"
message={`Supprimer "${confirmDelete.name}" ? Cette action est irréversible.`}
confirmLabel="Supprimer"
variant="danger"
onConfirm={confirmDeleteProduct}
onCancel={() => setConfirmDelete(null)}
/>
)}
</div>
);
}
