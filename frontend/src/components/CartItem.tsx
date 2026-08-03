import type { CartItem as CartItemType } from '../types';

interface CartItemProps {
item: CartItemType;
onUpdateQuantity: (productId: string, quantity: number) => void;
onRemove: (productId: string) => void;
onAddOption?: (productId: string) => void;
}

export default function CartItem({
item,
onUpdateQuantity,
onRemove,
onAddOption,
}: CartItemProps) {
return (
<div className="bg-white rounded-lg p-3 border border-gray-200">
<div className="flex items-start justify-between mb-2">
<div className="flex-1">
<h4 className="font-semibold text-gray-900">{item.product.name}</h4>
<p className="text-sm text-gray-500">
{Number(item.product.price).toLocaleString()} FCFA
</p>
</div>

<button
onClick={() => onRemove(item.product.id)}
className="text-red-500 hover:text-red-700 p-1"
title="Supprimer"
>
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

{/* Options sélectionnées */}
{item.selectedOptions.length > 0 && (
<div className="mb-2 space-y-1">
{item.selectedOptions.map((opt) => (
<div key={opt.option.id} className="text-xs text-gray-600 flex items-center gap-1">
<span>+ {opt.option.name}</span>
{Number(opt.option.price) > 0 && (
<span className="text-primary-600">
(+{Number(opt.option.price).toLocaleString()} FCFA)
</span>
)}
</div>
))}
</div>
)}

{/* Notes */}
{item.notes && (
<div className="mb-2 text-xs text-gray-500 italic">
Note: {item.notes}
</div>
)}

{/* Contrôles de quantité */}
<div className="flex items-center justify-between mt-3">
<div className="flex items-center gap-2">
<button
onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
>
-
</button>

<span className="w-8 text-center font-semibold">{item.quantity}</span>

<button
onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
className="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center font-bold"
>
+
</button>
</div>

<div className="font-bold text-gray-900">
{item.total.toLocaleString()} FCFA
</div>
</div>

{/* Bouton Options (si disponibles) */}
{item.product.options && item.product.options.length > 0 && onAddOption && (
<button
onClick={() => onAddOption(item.product.id)}
className="mt-2 w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
>
+ Ajouter options
</button>
)}
</div>
);
}
