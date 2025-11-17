import { useState, useEffect } from 'react';
import { tablesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Table } from '../types';

export default function TablesManagementPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) return;
    loadTables();
  }, [isAdmin]);

  const loadTables = async () => {
    try {
      setIsLoading(true);
      const response = await tablesApi.getAll();
      if (response.success && response.data) {
        setTables(response.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des tables');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cette table ?')) return;

    try {
      const response = await tablesApi.delete(id);
      if (response.success) {
        alert('Table désactivée avec succès');
        loadTables();
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la désactivation');
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">🪑 Gestion des Tables</h1>
            <p className="text-sm text-gray-500 mt-1">Configurez les tables du restaurant</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              ➕ Nouvelle table
            </button>
            <button
              onClick={loadTables}
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
        ) : tables.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-medium">Aucune table</p>
            <p className="text-sm mt-1">Commencez par ajouter des tables</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`bg-white rounded-lg p-6 border-2 transition-all ${
                  !table.isActive
                    ? 'border-red-300 bg-red-50 opacity-75'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">Table {table.number}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Capacité: {table.capacity} personnes
                    </p>
                  </div>
                  {!table.isActive && (
                    <span className="text-red-500 text-xl">❌</span>
                  )}
                </div>

                {/* Status */}
                <div className="mb-4">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    table.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {table.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTable(table);
                      setShowEditModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg text-sm transition-colors"
                  >
                    ✏️ Modifier
                  </button>
                  {table.isActive && (
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <TableModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadTables();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTable && (
        <TableModal
          table={selectedTable}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTable(null);
          }}
          onSuccess={() => {
            loadTables();
            setShowEditModal(false);
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
}

// Table Modal Component
function TableModal({
  table,
  onClose,
  onSuccess,
}: {
  table?: Table;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [number, setNumber] = useState(table?.number?.toString() || '');
  const [capacity, setCapacity] = useState(table?.capacity?.toString() || '4');
  const [isActive, setIsActive] = useState(table?.isActive ?? true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!number || !capacity) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsProcessing(true);

      const data = {
        number: Number(number),
        capacity: Number(capacity),
        isActive,
      };

      const response = table
        ? await tablesApi.update(table.id, data)
        : await tablesApi.create(data);

      if (response.success) {
        alert(table ? 'Table modifiée avec succès' : 'Table créée avec succès');
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
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {table ? 'Modifier la table' : 'Nouvelle table'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de table *
            </label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Ex: 1, 2, 3..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacité (nombre de personnes) *
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Ex: 2, 4, 6..."
              required
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {table && (
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
              {isProcessing ? 'Enregistrement...' : table ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
