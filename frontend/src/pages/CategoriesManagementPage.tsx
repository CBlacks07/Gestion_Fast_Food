import { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Plus, RefreshCw, Lock, Layers, X, ImageIcon, Upload } from 'lucide-react';
import { categoriesApi, API_BASE_URL } from '../services/api';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Category } from '../types';

export default function CategoriesManagementPage() {
const [categories, setCategories] = useState<Category[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
const [showCreateModal, setShowCreateModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

const user = useAuthStore((state) => state.user);
const isManager = user?.role === 'MANAGER';

useEffect(() => {
if (!isManager) return;
loadCategories();
}, [isManager]);

const loadCategories = async () => {
try {
setIsLoading(true);
const response = await categoriesApi.getAll();
if (response.success && response.data) {
setCategories(response.data);
}
} catch (error) {
console.error('Erreur:', error);
toast.error('Erreur lors du chargement des catégories');
} finally {
setIsLoading(false);
}
};

const handleDelete = async (id: string) => {
try {
const response = await categoriesApi.delete(id);
if (response.success) {
toast.success('Catégorie supprimée avec succès');
loadCategories();
}
} catch (error: any) {
toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
} finally {
setConfirmDelete(null);
}
};

if (!isManager) {
return (
<div className="h-screen flex items-center justify-center bg-gray-50">
<div className="text-center">
<Lock size={56} className="text-gray-300 mx-auto mb-4" />
<h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
<p className="text-gray-500">Cette page est réservée aux gérants</p>
</div>
</div>
);
}

return (
<div className="h-screen flex flex-col bg-gray-50">
{/* Header */}
<header className="bg-white border-b px-6 py-4 flex-shrink-0">
<div className="flex items-center justify-between">
<div>
<h1 className="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
<p className="text-sm text-gray-500 mt-1">Organisez vos produits par catégories</p>
</div>
<div className="flex items-center gap-4">
<button
onClick={() => setShowCreateModal(true)}
className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
>
<Plus size={16} />
Nouvelle catégorie
</button>
<button
onClick={loadCategories}
className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
>
<RefreshCw size={15} />
Rafraîchir
</button>
</div>
</div>
</header>

{/* Content */}
<div className="flex-1 overflow-y-auto p-6">
{isLoading ? (
<div className="flex items-center justify-center py-12">
<svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>
</div>
) : categories.length === 0 ? (
<div className="text-center py-12 text-gray-400">
<Layers size={56} strokeWidth={1.2} className="mx-auto mb-4 text-gray-300" />
<p className="font-medium">Aucune catégorie</p>
<p className="text-sm mt-1">Commencez par créer une catégorie</p>
</div>
) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
{categories.map((category) => (
<div
key={category.id}
className={`bg-white rounded-lg border-2 transition-all overflow-hidden ${
category.isActive
? 'border-gray-200 hover:border-primary-300'
: 'border-gray-300 opacity-60'
}`}
>
{/* Image ou placeholder */}
{category.image ? (
<div className="w-full h-24 overflow-hidden">
<img
src={category.image.startsWith('http') ? category.image : `${API_BASE_URL}${category.image}`}
alt={category.name}
className="w-full h-full object-cover"
/>
</div>
) : (
<div className="w-full h-24 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
{category.icon
? <span className="text-4xl">{category.icon}</span>
: <Layers size={32} className="text-primary-300" strokeWidth={1.5} />
}
</div>
)}

<div className="p-4">
<div className="flex items-center gap-2 mb-1">
<h3 className="font-bold text-gray-900">{category.name}</h3>
{!category.isActive && (
<span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Inactive</span>
)}
</div>
{category.description && (
<p className="text-xs text-gray-500 mb-3 line-clamp-1">{category.description}</p>
)}

<div className="flex items-center justify-between text-xs text-gray-500 mb-3">
<span>Ordre: {category.displayOrder}</span>
<span>{category.products?.length || 0} produit(s)</span>
</div>

<div className="flex gap-2">
<button
onClick={() => {
setSelectedCategory(category);
setShowEditModal(true);
}}
className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
>
<Pencil size={14} />
Modifier
</button>
<button
onClick={() => setConfirmDelete(category)}
className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
>
<Trash2 size={15} />
</button>
</div>
</div>
</div>
))}
</div>
)}
</div>

{/* Create Modal */}
{showCreateModal && (
<CategoryModal
onClose={() => setShowCreateModal(false)}
onSuccess={() => {
loadCategories();
setShowCreateModal(false);
}}
/>
)}

{/* Edit Modal */}
{showEditModal && selectedCategory && (
<CategoryModal
category={selectedCategory}
onClose={() => {
setShowEditModal(false);
setSelectedCategory(null);
}}
onSuccess={() => {
loadCategories();
setShowEditModal(false);
setSelectedCategory(null);
}}
/>
)}

{/* Confirm Delete */}
{confirmDelete && (
<ConfirmDialog
title="Supprimer la catégorie"
message={`Supprimer "${confirmDelete.name}" ? Les produits associés seront affectés.`}
confirmLabel="Supprimer"
variant="danger"
onConfirm={() => handleDelete(confirmDelete.id)}
onCancel={() => setConfirmDelete(null)}
/>
)}
</div>
);
}

// Category Modal Component
function CategoryModal({
category,
onClose,
onSuccess,
}: {
category?: Category;
onClose: () => void;
onSuccess: () => void;
}) {
const [name, setName] = useState(category?.name || '');
const [description, setDescription] = useState(category?.description || '');
const [icon, setIcon] = useState(category?.icon || '');
const [imageUrl, setImageUrl] = useState(category?.image || '');
const [displayOrder, setDisplayOrder] = useState(category?.displayOrder.toString() || '0');
const [isActive, setIsActive] = useState(category?.isActive ?? true);
const [isProcessing, setIsProcessing] = useState(false);
const [isUploadingImage, setIsUploadingImage] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);

const user = useAuthStore((state) => state.user);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (!file) return;

try {
setIsUploadingImage(true);
const formData = new FormData();
formData.append('file', file);

const response = await api.post('/api/upload/image', formData, {
headers: { 'Content-Type': 'multipart/form-data' },
});

if (response.data.success && response.data.data) {
setImageUrl(response.data.data.url);
}
} catch (error: any) {
toast.error(error.response?.data?.error || "Erreur lors de l'upload de l'image");
} finally {
setIsUploadingImage(false);
if (fileInputRef.current) fileInputRef.current.value = '';
}
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

if (!name.trim()) {
toast.error('Veuillez entrer un nom');
return;
}

try {
setIsProcessing(true);

const data = {
name: name.trim(),
description: description.trim() || undefined,
icon: icon.trim() || undefined,
image: imageUrl || undefined,
displayOrder: Number(displayOrder),
isActive,
userId: user?.id,
};

const response = category
? await categoriesApi.update(category.id, data)
: await categoriesApi.create(data);

if (response.success) {
toast.success(category ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès');
onSuccess();
} else {
toast.error(response.error || "Erreur lors de l'opération");
}
} catch (error: any) {
toast.error(error.response?.data?.error || "Erreur lors de l'opération");
} finally {
setIsProcessing(false);
}
};

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl">
<div className="p-5 border-b flex items-center justify-between flex-shrink-0">
<h2 className="text-xl font-bold text-gray-900">
{category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
</h2>
<button
onClick={onClose}
disabled={isProcessing}
className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
>
<X size={18} />
</button>
</div>

<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
{/* Nom */}
<div>
<label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
<input
type="text"
value={name}
onChange={(e) => setName(e.target.value)}
placeholder="Ex: Burgers, Boissons..."
required
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
/>
</div>

{/* Description */}
<div>
<label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
<textarea
value={description}
onChange={(e) => setDescription(e.target.value)}
placeholder="Description de la catégorie..."
rows={2}
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
/>
</div>

{/* Image */}
<div>
<label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
<ImageIcon size={14} />
Image
</label>
{imageUrl ? (
<div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 mt-1.5">
<img
src={imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`}
alt="Aperçu"
className="w-full h-full object-cover"
/>
<button
type="button"
onClick={() => setImageUrl('')}
className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
>
<X size={14} />
</button>
</div>
) : (
<div
onClick={() => !isUploadingImage && fileInputRef.current?.click()}
className="mt-1.5 w-full h-24 border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-gray-50 hover:bg-primary-50"
>
{isUploadingImage ? (
<>
<svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>
<span className="text-xs text-gray-500">Upload en cours...</span>
</>
) : (
<>
<Upload size={20} className="text-gray-400" />
<span className="text-xs text-gray-500">Cliquez pour importer une image</span>
<span className="text-xs text-gray-400">JPG, PNG, WEBP · Max 5MB</span>
</>
)}
</div>
)}
<input
ref={fileInputRef}
type="file"
accept="image/*"
onChange={handleImageUpload}
className="hidden"
/>
</div>

{/* Emoji (optionnel si pas d'image) */}
{!imageUrl && (
<div>
<label className="block text-sm font-medium text-gray-700 mb-1.5">
Emoji <span className="text-gray-400 font-normal">(si pas d'image)</span>
</label>
<input
type="text"
value={icon}
onChange={(e) => setIcon(e.target.value)}
placeholder="🍔"
maxLength={2}
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-2xl"
/>
</div>
)}

{/* Ordre d'affichage */}
<div>
<label className="block text-sm font-medium text-gray-700 mb-1.5">Ordre d'affichage</label>
<input
type="number"
value={displayOrder}
onChange={(e) => setDisplayOrder(e.target.value)}
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
/>
<p className="text-xs text-gray-400 mt-1">Les catégories sont affichées par ordre croissant</p>
</div>

{/* Active (seulement en mode édition) */}
{category && (
<div>
<label className="flex items-center gap-2 cursor-pointer">
<input
type="checkbox"
checked={isActive}
onChange={(e) => setIsActive(e.target.checked)}
className="rounded"
/>
<span className="text-sm font-medium text-gray-700">Active</span>
</label>
</div>
)}

{/* Boutons */}
<div className="flex gap-3 pt-2">
<button
type="button"
onClick={onClose}
disabled={isProcessing}
className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
>
Annuler
</button>
<button
type="submit"
disabled={isProcessing || isUploadingImage}
className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg disabled:opacity-50 transition-colors"
>
{isProcessing ? 'Enregistrement...' : category ? 'Modifier' : 'Créer'}
</button>
</div>
</form>
</div>
</div>
);
}
