import { useState, useEffect } from 'react';
import { optionsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Option, OptionType } from '../types';

export default function OptionsManagementPage() {
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('');

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const optionTypes: { value: OptionType; label: string; color: string; icon: string }[] = [
    { value: 'SUPPLEMENT', label: 'Supplément', color: 'bg-blue-100 text-blue-700', icon: '➕' },
    { value: 'CHOICE', label: 'Choix', color: 'bg-purple-100 text-purple-700', icon: '🔄' },
    { value: 'REMOVAL', label: 'Retrait', color: 'bg-red-100 text-red-700', icon: '➖' },
  ];

  useEffect(() => {
    if (!isAdmin) return;
    loadOptions();
  }, [isAdmin]);

  const loadOptions = async () => {
    try {
      setIsLoading(true);
      const response = await optionsApi.getAll();
      if (response.success && response.data) {
        setOptions(response.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cette option ?')) return;

    try {
      const response = await optionsApi.delete(id);
      if (response.success) {
        alert('Option désactivée avec succès');
        loadOptions();
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la désactivation');
    }
  };

  const getTypeInfo = (type: OptionType) => {
    return optionTypes.find((t) => t.value === type) || optionTypes[0];
  };

  // Filtrage
  const filteredOptions = options.filter((option) => {
    const matchType = !filterType || option.type === filterType;
    return matchType;
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
            <h1 className="text-2xl font-bold text-gray-900">⚙️ Gestion des Options</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configurez les suppléments, choix et retraits pour les produits
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              ➕ Nouvelle option
            </button>
            <button
              onClick={loadOptions}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              🔄 Rafraîchir
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-4 mt-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            {optionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
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
        ) : filteredOptions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-medium">Aucune option</p>
            <p className="text-sm mt-1">
              {filterType ? 'Aucune option de ce type' : 'Commencez par ajouter des options'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOptions.map((option) => {
              const typeInfo = getTypeInfo(option.type);

              return (
                <div
                  key={option.id}
                  className={`bg-white rounded-lg p-4 border-2 transition-all ${
                    !option.isActive
                      ? 'border-red-300 bg-red-50 opacity-75'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{typeInfo.icon}</span>
                        <h3 className="font-bold text-gray-900">{option.name}</h3>
                      </div>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    {!option.isActive && (
                      <span className="text-red-500 text-xl">❌</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">Prix:</div>
                    <div className="text-lg font-bold text-primary-600">
                      {Number(option.price).toLocaleString()} FCFA
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOption(option);
                        setShowEditModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg text-sm transition-colors"
                    >
                      ✏️ Modifier
                    </button>
                    {option.isActive && (
                      <button
                        onClick={() => handleDelete(option.id)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <OptionModal
          optionTypes={optionTypes}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadOptions();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOption && (
        <OptionModal
          option={selectedOption}
          optionTypes={optionTypes}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOption(null);
          }}
          onSuccess={() => {
            loadOptions();
            setShowEditModal(false);
            setSelectedOption(null);
          }}
        />
      )}
    </div>
  );
}

// Option Modal Component
function OptionModal({
  option,
  optionTypes,
  onClose,
  onSuccess,
}: {
  option?: Option;
  optionTypes: { value: OptionType; label: string; color: string; icon: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(option?.name || '');
  const [type, setType] = useState<OptionType>(option?.type || 'SUPPLEMENT');
  const [price, setPrice] = useState(option?.price?.toString() || '0');
  const [isActive, setIsActive] = useState(option?.isActive ?? true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsProcessing(true);

      const data = {
        name,
        type,
        price: Number(price),
        isActive,
      };

      const response = option
        ? await optionsApi.update(option.id, data)
        : await optionsApi.create(data);

      if (response.success) {
        alert(option ? 'Option modifiée avec succès' : 'Option créée avec succès');
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
            {option ? 'Modifier l\'option' : 'Nouvelle option'}
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
              Nom de l'option *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fromage, Sauce épicée, Sans oignon..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'option *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OptionType)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {optionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Supplément: ajoute un élément payant • Choix: option sans surcoût • Retrait: retire un ingrédient
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix (FCFA) *
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mettre 0 pour les options sans supplément de prix
            </p>
          </div>

          {option && (
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
              {isProcessing ? 'Enregistrement...' : option ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
