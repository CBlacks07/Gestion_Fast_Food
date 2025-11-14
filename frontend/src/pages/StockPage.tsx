import { useState, useEffect } from 'react';
import { ingredientsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Ingredient, IngredientUnit, StockMovementType } from '../types';

export default function StockPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const units: { value: IngredientUnit; label: string }[] = [
    { value: 'GRAM', label: 'Gramme (g)' },
    { value: 'KILOGRAM', label: 'Kilogramme (kg)' },
    { value: 'LITER', label: 'Litre (L)' },
    { value: 'MILLILITER', label: 'Millilitre (ml)' },
    { value: 'PIECE', label: 'Pièce' },
    { value: 'UNIT', label: 'Unité' },
  ];

  useEffect(() => {
    loadIngredients();
  }, [showLowStock]);

  const loadIngredients = async () => {
    try {
      setIsLoading(true);
      const response = await ingredientsApi.getAll({ lowStock: showLowStock });
      if (response.success && response.data) {
        setIngredients(response.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des ingrédients');
    } finally {
      setIsLoading(false);
    }
  };

  const getUnitLabel = (unit: IngredientUnit) => {
    const unitObj = units.find(u => u.value === unit);
    return unitObj?.label || unit;
  };

  const isLowStock = (ingredient: Ingredient) => {
    return Number(ingredient.currentStock) <= Number(ingredient.minStock);
  };

  const handleOpenStockModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowStockModal(true);
  };

  const handleOpenEditModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowEditModal(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">📦 Gestion des Stocks</h1>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Stock bas uniquement</span>
            </label>

            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                ➕ Nouvel ingrédient
              </button>
            )}

            <button
              onClick={loadIngredients}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              🔄 Rafraîchir
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
        ) : ingredients.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-medium">Aucun ingrédient</p>
            <p className="text-sm mt-1">
              {showLowStock ? 'Aucun ingrédient en stock bas' : 'Commencez par ajouter des ingrédients'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className={`bg-white rounded-lg p-4 border-2 transition-all ${
                  isLowStock(ingredient)
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{ingredient.name}</h3>
                    {ingredient.description && (
                      <p className="text-xs text-gray-500 mt-1">{ingredient.description}</p>
                    )}
                  </div>
                  {isLowStock(ingredient) && (
                    <span className="text-red-500 text-xl">⚠️</span>
                  )}
                </div>

                {/* Stock Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock actuel:</span>
                    <span className={`font-bold ${isLowStock(ingredient) ? 'text-red-600' : 'text-primary-600'}`}>
                      {Number(ingredient.currentStock).toLocaleString()} {getUnitLabel(ingredient.unit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock minimum:</span>
                    <span className="text-gray-900">
                      {Number(ingredient.minStock).toLocaleString()} {getUnitLabel(ingredient.unit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Coût unitaire:</span>
                    <span className="text-gray-900">
                      {Number(ingredient.unitCost).toLocaleString()} FCFA
                    </span>
                  </div>

                  {/* Stock Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isLowStock(ingredient) ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (Number(ingredient.currentStock) / Number(ingredient.minStock)) * 50
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenStockModal(ingredient)}
                      className="flex-1 px-3 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium rounded-lg text-sm transition-colors"
                    >
                      📝 Mouvement
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(ingredient)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Movement Modal */}
      {showStockModal && selectedIngredient && (
        <StockMovementModal
          ingredient={selectedIngredient}
          onClose={() => {
            setShowStockModal(false);
            setSelectedIngredient(null);
          }}
          onSuccess={() => {
            loadIngredients();
            setShowStockModal(false);
            setSelectedIngredient(null);
          }}
        />
      )}

      {/* Create Ingredient Modal */}
      {showCreateModal && (
        <CreateIngredientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadIngredients();
            setShowCreateModal(false);
          }}
          units={units}
        />
      )}

      {/* Edit Ingredient Modal */}
      {showEditModal && selectedIngredient && (
        <EditIngredientModal
          ingredient={selectedIngredient}
          onClose={() => {
            setShowEditModal(false);
            setSelectedIngredient(null);
          }}
          onSuccess={() => {
            loadIngredients();
            setShowEditModal(false);
            setSelectedIngredient(null);
          }}
          units={units}
        />
      )}
    </div>
  );
}

// Stock Movement Modal Component
function StockMovementModal({
  ingredient,
  onClose,
  onSuccess,
}: {
  ingredient: Ingredient;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<StockMovementType>('PURCHASE');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const movementTypes: { value: StockMovementType; label: string; icon: string }[] = [
    { value: 'PURCHASE', label: 'Achat', icon: '📥' },
    { value: 'ADJUSTMENT', label: 'Ajustement', icon: '⚖️' },
    { value: 'WASTE', label: 'Perte', icon: '🗑️' },
    { value: 'RETURN', label: 'Retour', icon: '↩️' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || Number(quantity) === 0) {
      alert('Veuillez entrer une quantité valide');
      return;
    }

    try {
      setIsProcessing(true);

      // Pour les types qui retirent du stock, mettre la quantité en négatif
      let finalQuantity = Number(quantity);
      if (type === 'WASTE' || type === 'SALE') {
        finalQuantity = -Math.abs(finalQuantity);
      }

      const response = await ingredientsApi.addStock(ingredient.id, {
        type,
        quantity: finalQuantity,
        reason: reason || undefined,
        reference: reference || undefined,
      });

      if (response.success) {
        alert('Mouvement de stock enregistré avec succès');
        onSuccess();
      } else {
        alert(response.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            Mouvement de stock - {ingredient.name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Current Stock Display */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Stock actuel</div>
            <div className="text-2xl font-bold text-gray-900">
              {Number(ingredient.currentStock).toLocaleString()} {ingredient.unit}
            </div>
          </div>

          {/* Movement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de mouvement
            </label>
            <div className="grid grid-cols-2 gap-2">
              {movementTypes.map((mt) => (
                <button
                  key={mt.value}
                  type="button"
                  onClick={() => setType(mt.value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    type === mt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{mt.icon}</div>
                  <div className="text-xs font-medium">{mt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité ({ingredient.unit})
            </label>
            <input
              type="number"
              step="0.001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {type === 'WASTE' ? 'Sera soustrait du stock' : 'Sera ajouté au stock'}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison (optionnel)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Livraison fournisseur, inventaire..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence (optionnel)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: BON-2024-001, FAC-123..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
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
              {isProcessing ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Ingredient Modal Component
function CreateIngredientModal({
  onClose,
  onSuccess,
  units,
}: {
  onClose: () => void;
  onSuccess: () => void;
  units: { value: IngredientUnit; label: string }[];
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState<IngredientUnit>('KILOGRAM');
  const [currentStock, setCurrentStock] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [unitCost, setUnitCost] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert('Veuillez entrer un nom');
      return;
    }

    try {
      setIsProcessing(true);

      const response = await ingredientsApi.create({
        name,
        description: description || undefined,
        unit,
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        unitCost: Number(unitCost),
      });

      if (response.success) {
        alert('Ingrédient créé avec succès');
        onSuccess();
      } else {
        alert(response.error || 'Erreur lors de la création');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Nouvel ingrédient</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Farine, Tomates..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'ingrédient..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unité de mesure *
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as IngredientUnit)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {units.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock actuel *
            </label>
            <input
              type="number"
              step="0.001"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock minimum (alerte) *
            </label>
            <input
              type="number"
              step="0.001"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coût unitaire (FCFA) *
            </label>
            <input
              type="number"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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
              {isProcessing ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Ingredient Modal Component
function EditIngredientModal({
  ingredient,
  onClose,
  onSuccess,
  units,
}: {
  ingredient: Ingredient;
  onClose: () => void;
  onSuccess: () => void;
  units: { value: IngredientUnit; label: string }[];
}) {
  const [name, setName] = useState(ingredient.name);
  const [description, setDescription] = useState(ingredient.description || '');
  const [unit, setUnit] = useState<IngredientUnit>(ingredient.unit);
  const [minStock, setMinStock] = useState(ingredient.minStock.toString());
  const [unitCost, setUnitCost] = useState(ingredient.unitCost.toString());
  const [isActive, setIsActive] = useState(ingredient.isActive);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert('Veuillez entrer un nom');
      return;
    }

    try {
      setIsProcessing(true);

      const response = await ingredientsApi.update(ingredient.id, {
        name,
        description: description || undefined,
        unit,
        minStock: Number(minStock),
        unitCost: Number(unitCost),
        isActive,
      });

      if (response.success) {
        alert('Ingrédient modifié avec succès');
        onSuccess();
      } else {
        alert(response.error || 'Erreur lors de la modification');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la modification');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Modifier l'ingrédient</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unité de mesure *
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as IngredientUnit)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {units.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock minimum (alerte) *
            </label>
            <input
              type="number"
              step="0.001"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coût unitaire (FCFA) *
            </label>
            <input
              type="number"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
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
              {isProcessing ? 'Modification...' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
