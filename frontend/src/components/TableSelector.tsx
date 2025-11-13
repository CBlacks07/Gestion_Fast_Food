import { useState, useEffect } from 'react';
import { tablesApi } from '../services/api';
import { useCartStore } from '../store/cartStore';
import type { Table } from '../types';

interface TableSelectorProps {
  onClose: () => void;
}

export default function TableSelector({ onClose }: TableSelectorProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setTableId, tableId } = useCartStore();

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setIsLoading(true);
      const response = await tablesApi.getAll();

      if (response.success && response.data) {
        setTables(response.data);
      }
    } catch (error) {
      console.error('Erreur de chargement des tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTable = (table: Table) => {
    setTableId(table.id);
    onClose();
  };

  const handleNoTable = () => {
    setTableId(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sélectionner une table</h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <>
              {/* Option "Pas de table" */}
              <button
                onClick={handleNoTable}
                className={`
                  w-full p-4 rounded-lg border-2 transition-colors text-left mb-4
                  ${!tableId
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl">🥡</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Pas de table</div>
                    <div className="text-sm text-gray-500">À emporter ou livraison</div>
                  </div>
                </div>
              </button>

              {/* Grille des tables */}
              <div className="grid grid-cols-3 gap-3">
                {tables.map((table) => {
                  const isOccupied = table.orders && table.orders.length > 0;
                  const isSelected = tableId === table.id;

                  return (
                    <button
                      key={table.id}
                      onClick={() => !isOccupied && handleSelectTable(table)}
                      disabled={isOccupied}
                      className={`
                        p-4 rounded-lg border-2 transition-colors
                        ${isOccupied
                          ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">🪑</div>
                        <div className="font-bold text-gray-900 mb-1">
                          Table {table.number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {table.capacity} pers.
                        </div>
                        {isOccupied && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                              Occupée
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {tables.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="font-medium">Aucune table disponible</p>
                  <p className="text-sm mt-1">Créez des tables depuis l'administration</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
