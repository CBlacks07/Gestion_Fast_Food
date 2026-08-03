import { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Plus, RefreshCw, Eye, EyeOff, Lock, Tag, X, Loader2, Search, ImageIcon, Upload } from 'lucide-react';
import { productsApi, categoriesApi, API_BASE_URL } from '../services/api';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Product, Category, ProductType } from '../types';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === 'MANAGER';

  const productTypes: { value: ProductType; label: string }[] = [
    { value: 'FOOD', label: 'Nourriture' },
    { value: 'DRINK', label: 'Boisson' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'SIDE', label: 'Accompagnement' },
  ];

  useEffect(() => {
    if (!isManager) return;
    loadData();
  }, [isManager]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      if (productsRes.success && productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.success && categoriesRes.data) setCategories(categoriesRes.data);
    } catch {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setConfirmDelete(null);
    try {
      const response = await productsApi.delete(id);
      if (response.success) {
        toast.success('Produit supprimé avec succès');
        loadData();
      } else {
        toast.error((response as { error?: string }).error || 'Erreur lors de la suppression');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(err.response?.data?.error || err.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const response = await productsApi.updateAvailability(product.id, !product.isAvailable);
      if (response.success) {
        toast.success(product.isAvailable ? `"${product.name}" désactivé` : `"${product.name}" activé`);
        loadData();
      }
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getTypeLabel = (type: ProductType) => productTypes.find((t) => t.value === type)?.label || type;

  const getTypeIcon = (type: ProductType) => {
    const icons: Record<ProductType, string> = { FOOD: '🍽️', DRINK: '🥤', DESSERT: '🍰', SIDE: '🍟' };
    return icons[type] || '🍽️';
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || product.categoryId === filterCategory;
    return matchSearch && matchCategory && product.isActive !== false;
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
            <p className="text-sm text-gray-500 mt-1">Créez et gérez les produits du menu</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              style={{ background: 'var(--color-primary, #e05252)' }}
            >
              <Plus size={16} />
              Nouveau produit
            </button>
            <button
              onClick={loadData}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw size={15} />
              Rafraîchir
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400 flex-shrink-0">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Tag size={56} strokeWidth={1.2} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const categoryName = categories.find((c) => c.id === product.categoryId)?.name;
              const imgSrc = product.image
                ? (product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`)
                : null;
              const icon = product.category?.icon || getTypeIcon(product.type);

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
                    !product.isAvailable
                      ? 'border-red-200 opacity-80'
                      : 'border-gray-100 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Image zone */}
                  <div className="relative w-full h-32 bg-gray-100 overflow-hidden">
                    {imgSrc ? (
                      <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                        <span className="text-4xl">{icon}</span>
                      </div>
                    )}
                    {/* Unavailable overlay */}
                    {!product.isAvailable && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-500 bg-white px-2 py-1 rounded-full border border-red-100">
                          Indisponible
                        </span>
                      </div>
                    )}
                    {/* Price badge */}
                    <div className="absolute bottom-2 right-2">
                      <span className="text-xs font-bold text-white px-2 py-1 rounded-lg shadow backdrop-blur-sm"
                        style={{ background: 'var(--color-secondary, #6b7280)' }}>
                        {Number(product.price).toLocaleString()} F
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 truncate text-sm mb-0.5">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-gray-400 line-clamp-1 mb-2">{product.description}</p>
                    )}

                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {getTypeLabel(product.type)}
                      </span>
                      {categoryName && (
                        <span className="text-xs bg-primary-50 px-2 py-0.5 rounded-full"
                          style={{ color: 'var(--color-primary, #e05252)' }}>
                          {categoryName}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`flex-1 px-2 py-1.5 font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1 ${
                          product.isAvailable
                            ? 'bg-red-50 hover:bg-red-100 text-red-600'
                            : 'bg-green-50 hover:bg-green-100 text-green-700'
                        }`}
                      >
                        {product.isAvailable ? <><EyeOff size={12} /> Désactiver</> : <><Eye size={12} /> Activer</>}
                      </button>
                      <button
                        onClick={() => { setSelectedProduct(product); setShowEditModal(true); }}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(product)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <ProductModal
          categories={categories}
          productTypes={productTypes}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { loadData(); setShowCreateModal(false); }}
        />
      )}
      {showEditModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          productTypes={productTypes}
          onClose={() => { setShowEditModal(false); setSelectedProduct(null); }}
          onSuccess={() => { loadData(); setShowEditModal(false); setSelectedProduct(null); }}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer le produit"
          message={`Voulez-vous vraiment supprimer "${confirmDelete.name}" ? Cette action est irréversible.`}
          variant="danger"
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  categories,
  productTypes,
  onClose,
  onSuccess,
}: {
  product?: Product;
  categories: Category[];
  productTypes: { value: ProductType; label: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [cost, setCost] = useState(product?.cost?.toString() || '');
  const [type, setType] = useState<ProductType>(product?.type || 'FOOD');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [preparationTime, setPreparationTime] = useState(product?.preparationTime?.toString() || '');
  const [imageUrl, setImageUrl] = useState(product?.image || '');
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!name || !price || !categoryId) {
      toast.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      setIsProcessing(true);
      const data = {
        name, description: description || undefined,
        price: Number(price), cost: cost ? Number(cost) : undefined,
        type, categoryId, image: imageUrl || undefined,
        preparationTime: preparationTime ? Number(preparationTime) : undefined,
        isAvailable, isActive,
      };
      const response = product
        ? await productsApi.update(product.id, data)
        : await productsApi.create(data);
      if (response.success) {
        toast.success(product ? 'Produit modifié avec succès' : 'Produit créé avec succès');
        onSuccess();
      } else {
        toast.error(response.error || 'Erreur lors de l\'opération');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(err.response?.data?.error || 'Erreur lors de l\'opération');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="h-1 rounded-t-2xl" style={{ background: 'var(--color-primary, #e05252)' }} />
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Burger Classique" required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du produit..." rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
            </div>

            {/* Image */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <ImageIcon size={14} /> Image
              </label>
              {imageUrl ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 mt-1.5">
                  <img
                    src={imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`}
                    alt="Aperçu" className="w-full h-full object-cover"
                  />
                  <button type="button" onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                  className="mt-1.5 w-full h-20 border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-gray-50 hover:bg-primary-50"
                >
                  {isUploadingImage ? (
                    <><Loader2 size={18} className="animate-spin text-primary-500" /><span className="text-xs text-gray-500">Upload en cours...</span></>
                  ) : (
                    <><Upload size={18} className="text-gray-400" /><span className="text-xs text-gray-500">Cliquez pour importer une image</span></>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix de vente (F) *</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Coût (F)</label>
              <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value as ProductType)} required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                {productTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">Sélectionnez...</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Temps de préparation (min)</label>
              <input type="number" value={preparationTime} onChange={(e) => setPreparationTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>

            <div className="col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="rounded" />
                <span className="text-sm font-medium text-gray-700">Disponible à la vente</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                <span className="text-sm font-medium text-gray-700">Actif</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isProcessing || isUploadingImage}
              className="flex-1 px-4 py-3 text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              style={{ background: 'var(--color-primary, #e05252)' }}>
              {isProcessing ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : (product ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
