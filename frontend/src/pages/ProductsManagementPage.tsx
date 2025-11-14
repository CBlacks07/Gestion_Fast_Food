import { useState, useEffect } from 'react';
import { productsApi, categoriesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
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

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const productTypes: { value: ProductType; label: string }[] = [
    { value: 'FOOD', label: 'Nourriture' },
    { value: 'DRINK', label: 'Boisson' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'SIDE', label: 'Accompagnement' },
  ];

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
      ]);

      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data);
      }
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const response = await productsApi.delete(id);
      if (response.success) {
        alert('Produit supprimé avec succès');
        loadData();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const response = await productsApi.updateAvailability(product.id, !product.isAvailable);
      if (response.success) {
        loadData();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const getTypeLabel = (type: ProductType) => {
    return productTypes.find((t) => t.value === type)?.label || type;
  };

  const getTypeIcon = (type: ProductType) => {
    const icons: Record<ProductType, string> = {
      FOOD: '🍔',
      DRINK: '🥤',
      DESSERT: '🍰',
      SIDE: '🍟',
    };
    return icons[type] || '🍽️';
  };

  // Filtrage
  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || product.categoryId === filterCategory;
    return matchSearch && matchCategory;
  });

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-500">Cette page est réservée aux administrateurs</p>
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
            <h1 className="text-2xl font-bold text-gray-900">🍔 Gestion des Produits</h1>
            <p className="text-sm text-gray-500 mt-1">Créez et gérez les produits du menu</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              ➕ Nouveau produit
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              🔄 Rafraîchir
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-4 mt-4">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-medium">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg p-4 border-2 transition-all ${
                  !product.isAvailable
                    ? 'border-red-300 bg-red-50 opacity-75'
                    : product.isActive
                    ? 'border-gray-200 hover:border-primary-300'
                    : 'border-gray-300 opacity-60'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getTypeIcon(product.type)}</span>
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                    </div>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                    )}
                  </div>
                  {!product.isAvailable && (
                    <span className="text-red-500 text-xl">❌</span>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Prix:</span>
                    <span className="font-bold text-primary-600">
                      {Number(product.price).toLocaleString()} FCFA
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getTypeLabel(product.type)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Catégorie:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {categories.find((c) => c.id === product.categoryId)?.name || 'N/A'}
                    </span>
                  </div>

                  {product.preparationTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Préparation:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {product.preparationTime} min
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    className={`flex-1 px-3 py-2 font-medium rounded-lg text-sm transition-colors ${
                      product.isAvailable
                        ? 'bg-red-100 hover:bg-red-200 text-red-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {product.isAvailable ? '❌ Désactiver' : '✅ Activer'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowEditModal(true);
                    }}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ProductModal
          categories={categories}
          productTypes={productTypes}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadData();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          productTypes={productTypes}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            loadData();
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

// Product Modal Component
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
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !categoryId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsProcessing(true);

      const data = {
        name,
        description: description || undefined,
        price: Number(price),
        cost: cost ? Number(cost) : undefined,
        type,
        categoryId,
        preparationTime: preparationTime ? Number(preparationTime) : undefined,
        isAvailable,
        isActive,
      };

      const response = product
        ? await productsApi.update(product.id, data)
        : await productsApi.create(data);

      if (response.success) {
        alert(product ? 'Produit modifié avec succès' : 'Produit créé avec succès');
        onSuccess();
      } else {
        alert(response.error || 'Erreur lors de l\'opération');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de l\'opération');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Burger Classique"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du produit..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix de vente (FCFA) *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coût (FCFA)</label>
              <input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProductType)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {productTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sélectionnez...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temps de préparation (minutes)
              </label>
              <input
                type="number"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Disponible à la vente</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Actif</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg disabled:opacity-50"
            >
              {isProcessing ? 'Enregistrement...' : product ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
