import { useCartStore } from '../store/cartStore';
import CartItem from './CartItem';
import type { OrderType } from '../types';

interface CartProps {
  onCheckout: () => void;
}

export default function Cart({ onCheckout }: CartProps) {
  const {
    items,
    orderType,
    setOrderType,
    updateQuantity,
    removeItem,
    clear,
    getTotal,
    getItemCount,
    getSubtotal,
  } = useCartStore();

  const orderTypes: { value: OrderType; label: string; icon: string }[] = [
    { value: 'DINE_IN', label: 'Sur place', icon: '🍽️' },
    { value: 'TAKEAWAY', label: 'À emporter', icon: '🥡' },
    { value: 'DELIVERY', label: 'Livraison', icon: '🚗' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">
            Panier ({getItemCount()})
          </h2>

          {items.length > 0 && (
            <button
              onClick={clear}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Vider
            </button>
          )}
        </div>

        {/* Type de commande */}
        <div className="flex gap-2">
          {orderTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setOrderType(type.value)}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${orderType === type.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <div>{type.icon}</div>
              <div className="text-xs mt-1">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="font-medium">Panier vide</p>
            <p className="text-sm mt-1">Ajoutez des produits pour commencer</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="p-4 bg-white border-t space-y-3">
          {/* Résumé */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total</span>
              <span>{getSubtotal().toLocaleString()} FCFA</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span className="text-primary-600">{getTotal().toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Bouton de paiement */}
          <button
            onClick={onCheckout}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Passer au paiement</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
