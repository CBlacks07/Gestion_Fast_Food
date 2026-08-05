import { Utensils, ShoppingBag, Bike, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import CartItem from '../CartItem';
import MobileSheet from './MobileSheet';
import type { OrderType } from '../../types';

interface MobileCartSheetProps {
onClose: () => void;
onCheckout: () => void;
}

const ORDER_TYPES: { value: OrderType; label: string; Icon: typeof Utensils }[] = [
{ value: 'DINE_IN',  label: 'Sur place',  Icon: Utensils },
{ value: 'TAKEAWAY', label: 'À emporter', Icon: ShoppingBag },
{ value: 'DELIVERY', label: 'Livraison',  Icon: Bike },
];

export default function MobileCartSheet({ onClose, onCheckout }: MobileCartSheetProps) {
const {
items, orderType, setOrderType,
updateQuantity, removeItem, clear,
getTotal, getItemCount, getSubtotal,
} = useCartStore();

return (
<MobileSheet onClose={onClose} maxHeight="85vh">
<div className="px-4 pb-4">
<div className="flex items-center justify-between py-2">
<h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
<ShoppingCart size={17} className="text-gray-500" />
Panier · {getItemCount()}
</h2>
{items.length > 0 && (
<button onClick={clear} className="text-xs text-red-500 font-semibold flex items-center gap-1">
<Trash2 size={12} />
Vider
</button>
)}
</div>

<div className="flex gap-2 pb-3">
{ORDER_TYPES.map(({ value, label, Icon }) => (
<button
key={value}
onClick={() => setOrderType(value)}
className={`flex-1 py-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 ${orderType === value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
>
<Icon size={16} />
{label}
</button>
))}
</div>

<div className="space-y-2">
{items.length === 0 ? (
<div className="py-10 text-center text-gray-400 text-sm">Panier vide</div>
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

{items.length > 0 && (
<div className="mt-4 pt-3 border-t border-gray-100">
<div className="flex justify-between text-sm text-gray-500 mb-1">
<span>Sous-total</span>
<span>{getSubtotal().toLocaleString()} FCFA</span>
</div>
<div className="flex justify-between text-base font-bold text-gray-900 mb-3">
<span>Total</span>
<span style={{ color: 'var(--color-secondary, #6b7280)' }}>{getTotal().toLocaleString()} FCFA</span>
</div>
<button
onClick={onCheckout}
className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
>
Passer au paiement
<ArrowRight size={18} />
</button>
</div>
)}
</div>
</MobileSheet>
);
}
