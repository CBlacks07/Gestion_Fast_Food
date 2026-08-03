import { useState, useEffect } from 'react';
import { Pencil, Plus, RefreshCw, ArrowUpDown, Package, X, Loader2, AlertTriangle } from 'lucide-react';
import { ingredientsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
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
  const isManager = user?.role === 'MANAGER';

  const units: { value: IngredientUnit; label: string; short: string }[] = [
    { value: 'GRAM', label: 'Gramme (g)', short: 'g' },
    { value: 'KILOGRAM', label: 'Kilogramme (kg)', short: 'kg' },
    { value: 'LITER', label: 'Litre (L)', short: 'L' },
    { value: 'MILLILITER', label: 'Millilitre (ml)', short: 'ml' },
    { value: 'PIECE', label: 'Pièce', short: 'pcs' },
    { value: 'UNIT', label: 'Unité', short: 'u' },
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
    } catch {
      toast.error('Erreur lors du chargement des ingrédients');
    } finally {
      setIsLoading(false);
    }
  };

  const getUnitShort = (unit: IngredientUnit) => {
    return units.find((u) => u.value === unit)?.short || unit;
  };

  const isLowStock = (ingredient: Ingredient) => {
    return Number(ingredient.currentStock) <= Number(ingredient.minStock);
  };

  const getStockPercent = (ingredient: Ingredient) => {
    const current = Number(ingredient.currentStock);
    const min = Number(ingredient.minStock);
    if (min === 0) return current > 0 ? 100 : 0;
    return Math.min(100, Math.round((current / (min * 2)) * 100));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h1>
            <p className="text-sm text-gray-500 mt-1">Suivi des ingrédients et mouvements</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="rounded accent-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Stock bas uniquement</span>
            </label>
            {isManager && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                style={{ background: 'var(--color-primary, #e05252)' }}
              >
                <Plus size={16} />
                Nouvel ingrédient
              </button>
            )}
            <button
              onClick={loadIngredients}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
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
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={56} strokeWidth={1.2} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Aucun ingrédient</p>
            <p className="text-sm mt-1">
              {showLowStock ? 'Aucun ingrédient en stock bas' : 'Commencez par ajouter des ingrédients'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ingredients.map((ingredient) => {
              const low = isLowStock(ingredient);
              const pct = getStockPercent(ingredient);
              return (
                <div
                  key={ingredient.id}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
                    low ? 'border-red-200' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  {/* Top accent bar */}
                  <div
                    className="h-1"
                    style={{ background: low ? '#ef4444' : '#22c55e' }}
                  />

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{ingredient.name}</h3>
                        {ingredient.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{ingredient.description}</p>
                        )}
                      </div>
                      {low && (
                        <div className="ml-2 flex-shrink-0">
                          <AlertTriangle size={16} className="text-red-500" />
                        </div>
                      )}
                    </div>

                    {/* Stock progress */}
                    <div className="mb-3">
                      <div className="flex items-end justify-between mb-1.5">
                        <div>
                          <span className={`text-xl font-bold ${low ? 'text-red-600' : 'text-gray-900'}`}>
                            {Number(ingredient.currentStock).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-400 ml-1">{getUnitShort(ingredient.unit)}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          min: {Number(ingredient.minStock).toLocaleString()} {getUnitShort(ingredient.unit)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: low ? '#ef4444' : '#22c55e',
                          }}
                        />
                      </div>
                      {low && (
                        <p className="text-xs text-red-500 font-medium mt-1">Stock insuffisant</p>
                      )}
                    </div>

                    {/* Cost */}
                    <div className="flex items-center justify-between py-2.5 border-t border-gray-50 mb-3">
                      <span className="text-xs text-gray-400">Coût unitaire</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {Number(ingredient.unitCost).toLocaleString()} F
                      </span>
                    </div>

                    {/* Actions */}
                    {isManager && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedIngredient(ingredient); setShowStockModal(true); }}
                          className="flex-1 px-3 py-2 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 text-white"
                          style={{ background: 'var(--color-primary, #e05252)' }}
                        >
                          <ArrowUpDown size={14} />
                          Mouvement
                        </button>
                        <button
                          onClick={() => { setSelectedIngredient(ingredient); setShowEditModal(true); }}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showStockModal && selectedIngredient && (
        <StockMovementModal
          ingredient={selectedIngredient}
          units={units}
          onClose={() => { setShowStockModal(false); setSelectedIngredient(null); }}
          onSuccess={() => { loadIngredients(); setShowStockModal(false); setSelectedIngredient(null); }}
        />
      )}
      {showCreateModal && (
        <IngredientModal
          units={units}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { loadIngredients(); setShowCreateModal(false); }}
        />
      )}
      {showEditModal && selectedIngredient && (
        <IngredientModal
          ingredient={selectedIngredient}
          units={units}
          onClose={() => { setShowEditModal(false); setSelectedIngredient(null); }}
          onSuccess={() => { loadIngredients(); setShowEditModal(false); setSelectedIngredient(null); }}
        />
      )}
    </div>
  );
}

function StockMovementModal({
  ingredient,
  units,
  onClose,
  onSuccess,
}: {
  ingredient: Ingredient;
  units: { value: IngredientUnit; label: string; short: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<StockMovementType>('PURCHASE');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const unitShort = units.find((u) => u.value === ingredient.unit)?.short || ingredient.unit;

  const movementTypes: { value: StockMovementType; label: string; color: string }[] = [
    { value: 'PURCHASE', label: 'Achat', color: 'border-green-400 bg-green-50 text-green-700' },
    { value: 'ADJUSTMENT', label: 'Ajustement', color: 'border-blue-400 bg-blue-50 text-blue-700' },
    { value: 'WASTE', label: 'Perte', color: 'border-red-400 bg-red-50 text-red-700' },
    { value: 'RETURN', label: 'Retour', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || Number(quantity) === 0) {
      toast.warning('Veuillez entrer une quantité valide');
      return;
    }
    try {
      setIsProcessing(true);
      let finalQuantity = Number(quantity);
      if (type === 'WASTE' || type === 'SALE') {
        finalQuantity = -Math.abs(finalQuantity);
      }
      const response = await ingredientsApi.addStock(ingredient.id, {
        type, quantity: finalQuantity,
        reason: reason || undefined, reference: reference || undefined,
      });
      if (response.success) {
        toast.success('Mouvement de stock enregistré');
        onSuccess();
      } else {
        toast.error(response.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="h-1 rounded-t-2xl" style={{ background: 'var(--color-primary, #e05252)' }} />
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Mouvement de stock</h2>
            <p className="text-sm text-gray-500">{ingredient.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Stock actuel */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">Stock actuel</span>
            <span className="text-2xl font-bold text-gray-900">
              {Number(ingredient.currentStock).toLocaleString()} <span className="text-base font-normal text-gray-400">{unitShort}</span>
            </span>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de mouvement</label>
            <div className="grid grid-cols-2 gap-2">
              {movementTypes.map((mt) => (
                <button
                  key={mt.value}
                  type="button"
                  onClick={() => setType(mt.value)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    type === mt.value ? mt.color : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {mt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantité ({unitShort})</label>
            <input
              type="number"
              step="0.001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">
              {type === 'WASTE' ? 'Sera soustrait du stock' : 'Sera ajouté au stock'}
            </p>
          </div>

          {/* Raison */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Raison <span className="text-gray-400 font-normal">(optionnel)</span></label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Livraison fournisseur..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Référence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Référence <span className="text-gray-400 font-normal">(optionnel)</span></label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: BON-2024-001..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isProcessing}
              className="flex-1 px-4 py-3 text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              style={{ background: 'var(--color-primary, #e05252)' }}>
              {isProcessing ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IngredientModal({
  ingredient,
  units,
  onClose,
  onSuccess,
}: {
  ingredient?: Ingredient;
  units: { value: IngredientUnit; label: string; short: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(ingredient?.name || '');
  const [description, setDescription] = useState(ingredient?.description || '');
  const [unit, setUnit] = useState<IngredientUnit>(ingredient?.unit || 'KILOGRAM');
  const [currentStock, setCurrentStock] = useState(ingredient?.currentStock?.toString() || '0');
  const [minStock, setMinStock] = useState(ingredient?.minStock?.toString() || '0');
  const [unitCost, setUnitCost] = useState(ingredient?.unitCost?.toString() || '0');
  const [isActive, setIsActive] = useState(ingredient?.isActive ?? true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) { toast.warning('Veuillez entrer un nom'); return; }
    try {
      setIsProcessing(true);
      const response = ingredient
        ? await ingredientsApi.update(ingredient.id, {
            name, description: description || undefined, unit,
            minStock: Number(minStock), unitCost: Number(unitCost), isActive,
          })
        : await ingredientsApi.create({
            name, description: description || undefined, unit,
            currentStock: Number(currentStock),
            minStock: Number(minStock), unitCost: Number(unitCost),
          });
      if (response.success) {
        toast.success(ingredient ? 'Ingrédient modifié avec succès' : 'Ingrédient créé avec succès');
        onSuccess();
      } else {
        toast.error(response.error || 'Erreur lors de l\'opération');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'opération');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="h-1 rounded-t-2xl" style={{ background: 'var(--color-primary, #e05252)' }} />
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {ingredient ? 'Modifier l\'ingrédient' : 'Nouvel ingrédient'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Farine, Tomates..."
              required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'ingrédient..." rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Unité de mesure *</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value as IngredientUnit)} required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>

          {!ingredient && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock actuel *</label>
              <input type="number" step="0.001" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)}
                required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock minimum *</label>
              <input type="number" step="0.001" value={minStock} onChange={(e) => setMinStock(e.target.value)}
                required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Coût unitaire (F) *</label>
              <input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)}
                required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          </div>

          {ingredient && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium text-gray-700">Actif</span>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isProcessing}
              className="flex-1 px-4 py-3 text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              style={{ background: 'var(--color-primary, #e05252)' }}>
              {isProcessing ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : (ingredient ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
