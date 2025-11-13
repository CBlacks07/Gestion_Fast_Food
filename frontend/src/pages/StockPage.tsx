import { useState, useEffect } from 'react';
import type { Ingredient } from '../types';

// Note: Nécessite l'ajout de l'API ingredients dans services/api.ts
export default function StockPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    loadIngredients();
  }, [showLowStock]);

  const loadIngredients = async () => {
    try {
      setIsLoading(true);
      // TODO: Implémenter l'API call
      // const response = await ingredientsApi.getAll({ lowStock: showLowStock });
      setIngredients([]);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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

            <button onClick={loadIngredients} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              🔄 Rafraîchir
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <p className="text-center text-gray-500">Gestion des stocks - API à connecter</p>
          </div>
        )}
      </div>
    </div>
  );
}
