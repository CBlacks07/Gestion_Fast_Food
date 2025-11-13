import { useState } from 'react';
import type { Product, Option } from '../types';
import { useCartStore } from '../store/cartStore';

interface ProductOptionsModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductOptionsModal({ product, onClose }: ProductOptionsModalProps) {
  const { addItem, addOption } = useCartStore();
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleToggleOption = (option: Option) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(option.id)) {
      newSelected.delete(option.id);
    } else {
      newSelected.add(option.id);
    }
    setSelectedOptions(newSelected);
  };

  const calculateTotal = () => {
    let total = Number(product.price) * quantity;

    // Ajouter le prix des options sélectionnées
    product.options?.forEach((productOption) => {
      if (selectedOptions.has(productOption.option.id)) {
        total += Number(productOption.option.price) * quantity;
      }
    });

    return total;
  };

  const handleAddToCart = () => {
    // Ajouter le produit au panier
    addItem(product, quantity);

    // Ajouter les options sélectionnées
    selectedOptions.forEach((optionId) => {
      const productOption = product.options?.find(po => po.option.id === optionId);
      if (productOption) {
        addOption(product.id, productOption.option);
      }
    });

    // Si des notes, les ajouter
    if (notes) {
      useCartStore.getState().updateNotes(product.id, notes);
    }

    onClose();
  };

  const availableOptions = product.options?.filter(po => po.option.isActive) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            {product.description && (
              <p className="text-sm text-gray-500 mt-1">{product.description}</p>
            )}
            <p className="text-lg font-bold text-primary-600 mt-2">
              {Number(product.price).toLocaleString()} FCFA
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Options */}
          {availableOptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Options disponibles</h3>
              <div className="space-y-2">
                {availableOptions.map((productOption) => {
                  const option = productOption.option;
                  const isSelected = selectedOptions.has(option.id);

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleToggleOption(option)}
                      className={`
                        w-full p-3 rounded-lg border-2 transition-colors text-left
                        ${isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center
                            ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}
                          `}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          <div>
                            <span className="font-medium text-gray-900">{option.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({option.type === 'SUPPLEMENT' ? 'Supplément' : option.type === 'CHOICE' ? 'Choix' : 'Retrait'})
                            </span>
                          </div>
                        </div>

                        {Number(option.price) > 0 && (
                          <span className="font-semibold text-primary-600">
                            +{Number(option.price).toLocaleString()} FCFA
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes spéciales (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Sans oignon, bien cuit..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-lg"
              >
                -
              </button>

              <span className="w-12 text-center font-bold text-xl">{quantity}</span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium text-gray-700">Total</span>
              <span className="font-bold text-primary-600">
                {calculateTotal().toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              onClick={handleAddToCart}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <span>Ajouter au panier</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
