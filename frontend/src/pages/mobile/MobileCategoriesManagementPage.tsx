import { useState, useEffect } from 'react';
import { Lock, Loader2, Layers, Plus, Pencil, Trash2 } from 'lucide-react';
import { categoriesApi, API_BASE_URL } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import ConfirmDialog from '../../components/ConfirmDialog';
import MobileSheet from '../../components/mobile/MobileSheet';
import MobileImageUpload from '../../components/mobile/MobileImageUpload';
import type { Category } from '../../types';

function CategoryFormSheet({ category, userId, onClose, onSuccess }: { category: Category | null; userId?: string; onClose: () => void; onSuccess: () => void }) {
const [name, setName] = useState(category?.name || '');
const [description, setDescription] = useState(category?.description || '');
const [image, setImage] = useState(category?.image || '');
const [icon, setIcon] = useState(category?.icon || '');
const [displayOrder, setDisplayOrder] = useState(category?.displayOrder?.toString() || '0');
const [isActive, setIsActive] = useState(category?.isActive ?? true);
const [isSaving, setIsSaving] = useState(false);

const handleSubmit = async () => {
if (!name.trim()) {
toast.error('Veuillez entrer un nom');
return;
}
try {
setIsSaving(true);
const data = {
name: name.trim(), description: description.trim() || undefined,
icon: !image ? (icon.trim() || undefined) : undefined,
image: image || undefined, displayOrder: Number(displayOrder), isActive, userId,
};
if (category) await categoriesApi.update(category.id, data);
else await categoriesApi.create(data);
toast.success(category ? 'Catégorie modifiée' : 'Catégorie créée');
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
<h2 className="text-base font-bold text-gray-900 py-2">{category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
<div className="space-y-3">
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Nom *</div>
<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Burgers, Boissons..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Description</div>
<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
</div>
<MobileImageUpload label="Image" imageUrl={image} onChange={setImage} onClear={() => setImage('')} />
{!image && (
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Emoji</div>
<input type="text" maxLength={2} value={icon} onChange={(e) => setIcon(e.target.value)} className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg text-2xl text-center outline-none focus:ring-2 focus:ring-primary-500" />
</div>
)}
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Ordre d'affichage</div>
<input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
<p className="text-[11px] text-gray-400 mt-1">Les catégories sont affichées par ordre croissant</p>
</div>
{category && (
<label className="flex items-center gap-2 text-sm text-gray-600">
<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
Active
</label>
)}
</div>
<button onClick={handleSubmit} disabled={isSaving} className="w-full mt-5 bg-primary-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50">
{isSaving ? 'Enregistrement...' : category ? 'Modifier' : 'Créer'}
</button>
</div>
</MobileSheet>
);
}

export default function MobileCategoriesManagementPage() {
const [categories, setCategories] = useState<Category[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [editTarget, setEditTarget] = useState<Category | null>(null);
const [showCreate, setShowCreate] = useState(false);
const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

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
const response = await categoriesApi.getAll();
if (response.success && response.data) setCategories(response.data);
} catch (error) {
console.error(error);
toast.error('Erreur lors du chargement des catégories');
} finally {
setIsLoading(false);
}
};

const confirmDeleteCategory = async () => {
if (!confirmDelete) return;
try {
await categoriesApi.delete(confirmDelete.id);
toast.success('Catégorie supprimée');
setConfirmDelete(null);
loadData();
} catch (error: any) {
toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
}
};

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
<div className="px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0 flex justify-end">
<button onClick={() => setShowCreate(true)} className="flex items-center gap-1 text-xs font-semibold text-primary-600">
<Plus size={14} />
Nouvelle catégorie
</button>
</div>

<div className="flex-1 overflow-y-auto p-3">
{isLoading ? (
<div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
) : categories.length === 0 ? (
<div className="text-center py-12 text-gray-400"><Layers size={44} strokeWidth={1.2} className="mx-auto mb-3 text-gray-300" /><p className="text-sm font-medium">Aucune catégorie</p></div>
) : (
<div className="grid grid-cols-2 gap-3">
{categories.map((c) => {
const imgSrc = c.image ? (c.image.startsWith('http') ? c.image : `${API_BASE_URL}${c.image}`) : null;
return (
<div key={c.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${c.isActive ? 'border-gray-100' : 'border-red-200 opacity-70'}`}>
<div className="h-20 bg-gray-100 flex items-center justify-center">
{imgSrc ? <img src={imgSrc} alt="" className="w-full h-full object-cover" /> : c.icon ? <span className="text-3xl">{c.icon}</span> : <Layers size={22} className="text-gray-300" />}
</div>
<div className="p-2">
<div className="flex items-center gap-1">
<div className="text-xs font-semibold text-gray-900 truncate">{c.name}</div>
{!c.isActive && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded flex-shrink-0">Inactive</span>}
</div>
<div className="text-[10px] text-gray-400 mt-0.5">Ordre: {c.displayOrder} · {c.products?.length || 0} produit(s)</div>
<div className="flex items-center gap-1 mt-1.5">
<button onClick={() => setEditTarget(c)} className="flex-1 py-1 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 flex items-center justify-center gap-1">
<Pencil size={10} />
Modifier
</button>
<button onClick={() => setConfirmDelete(c)} className="py-1 px-2 rounded text-[10px] font-semibold bg-red-50 text-red-600"><Trash2 size={10} /></button>
</div>
</div>
</div>
);
})}
</div>
)}
</div>

{(editTarget || showCreate) && (
<CategoryFormSheet
category={editTarget}
userId={user?.id}
onClose={() => { setEditTarget(null); setShowCreate(false); }}
onSuccess={() => { setEditTarget(null); setShowCreate(false); loadData(); }}
/>
)}

{confirmDelete && (
<ConfirmDialog
title="Supprimer la catégorie"
message={`Supprimer "${confirmDelete.name}" ? Les produits associés seront affectés.`}
confirmLabel="Supprimer"
variant="danger"
onConfirm={confirmDeleteCategory}
onCancel={() => setConfirmDelete(null)}
/>
)}
</div>
);
}
