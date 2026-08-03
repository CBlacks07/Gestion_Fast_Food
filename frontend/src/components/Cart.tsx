import { Utensils, ShoppingBag, Bike, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import CartItem from './CartItem';
import type { OrderType } from '../types';

interface CartProps {
  onCheckout: () => void;
}

const ORDER_TYPES: { value: OrderType; label: string; Icon: typeof Utensils }[] = [
  { value: 'DINE_IN',   label: 'Sur place',  Icon: Utensils },
  { value: 'TAKEAWAY',  label: 'À emporter', Icon: ShoppingBag },
  { value: 'DELIVERY',  label: 'Livraison',  Icon: Bike },
];

export default function Cart({ onCheckout }: CartProps) {
  const {
    items, orderType, setOrderType,
    updateQuantity, removeItem, clear,
    getTotal, getItemCount, getSubtotal,
  } = useCartStore();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={18} className="text-gray-500" />
            Panier
            {getItemCount() > 0 && (
              <span className="bg-primary-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {getItemCount()}
              </span>
            )}
          </h2>

          {items.length > 0 && (
            <button
              onClick={clear}
              className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 size={13} />
              Vider
            </button>
          )}
        </div>

        {/* Type de commande */}
        <div className="flex gap-1.5">
          {ORDER_TYPES.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setOrderType(value)}
              className={`
                flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center gap-1
                ${orderType === value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
            <ShoppingCart size={48} strokeWidth={1.2} />
            <div className="text-center">
              <p className="font-medium text-sm">Panier vide</p>
              <p className="text-xs mt-0.5">Ajoutez des produits pour commencer</p>
            </div>
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
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Sous-total</span>
              <span>{getSubtotal().toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span style={{ color: 'var(--color-secondary, #6b7280)' }}>{getTotal().toLocaleString()} FCFA</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Passer au paiement</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
