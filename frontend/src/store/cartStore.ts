import { create } from 'zustand';
import type { CartItem, Product, Option, OrderType } from '../types';

interface CartStore {
items: CartItem[];
orderType: OrderType;
tableId?: string;
customerName?: string;
customerPhone?: string;
notes?: string;

// Actions
addItem: (product: Product, quantity?: number) => void;
removeItem: (productId: string) => void;
updateQuantity: (productId: string, quantity: number) => void;
addOption: (productId: string, option: Option) => void;
removeOption: (productId: string, optionId: string) => void;
updateNotes: (productId: string, notes: string) => void;
setOrderType: (type: OrderType) => void;
setTableId: (tableId?: string) => void;
setCustomerInfo: (name?: string, phone?: string) => void;
setOrderNotes: (notes?: string) => void;
clear: () => void;

// Computed
getTotal: () => number;
getItemCount: () => number;
getSubtotal: () => number;
getTax: () => number;
getDiscount: () => number;
}

const calculateItemTotal = (item: CartItem): number => {
let total = Number(item.product.price) * item.quantity;

// Ajouter le prix des options
item.selectedOptions.forEach((opt) => {
total += Number(opt.option.price) * item.quantity;
});

return total;
};

export const useCartStore = create<CartStore>((set, get) => ({
items: [],
orderType: 'DINE_IN',
tableId: undefined,
customerName: undefined,
customerPhone: undefined,
notes: undefined,

addItem: (product, quantity = 1) => {
set((state) => {
const existingItem = state.items.find(
(item) => item.product.id === product.id
);

if (existingItem) {
// Si le produit existe déjà, augmenter la quantité
return {
items: state.items.map((item) =>
item.product.id === product.id
? {
...item,
quantity: item.quantity + quantity,
total: calculateItemTotal({
...item,
quantity: item.quantity + quantity,
}),
}
: item
),
};
} else {
// Sinon, ajouter un nouvel item
const newItem: CartItem = {
product,
quantity,
selectedOptions: [],
notes: undefined,
total: Number(product.price) * quantity,
};

return {
items: [...state.items, newItem],
};
}
});
},

removeItem: (productId) => {
set((state) => ({
items: state.items.filter((item) => item.product.id !== productId),
}));
},

updateQuantity: (productId, quantity) => {
if (quantity <= 0) {
get().removeItem(productId);
return;
}

set((state) => ({
items: state.items.map((item) =>
item.product.id === productId
? {
...item,
quantity,
total: calculateItemTotal({ ...item, quantity }),
}
: item
),
}));
},

addOption: (productId, option) => {
set((state) => ({
items: state.items.map((item) => {
if (item.product.id === productId) {
// Vérifier si l'option existe déjà
const optionExists = item.selectedOptions.some(
(opt) => opt.option.id === option.id
);

if (!optionExists) {
const updatedItem = {
...item,
selectedOptions: [
...item.selectedOptions,
{ optionId: option.id, option },
],
};

return {
...updatedItem,
total: calculateItemTotal(updatedItem),
};
}
}

return item;
}),
}));
},

removeOption: (productId, optionId) => {
set((state) => ({
items: state.items.map((item) => {
if (item.product.id === productId) {
const updatedItem = {
...item,
selectedOptions: item.selectedOptions.filter(
(opt) => opt.option.id !== optionId
),
};

return {
...updatedItem,
total: calculateItemTotal(updatedItem),
};
}

return item;
}),
}));
},

updateNotes: (productId, notes) => {
set((state) => ({
items: state.items.map((item) =>
item.product.id === productId ? { ...item, notes } : item
),
}));
},

setOrderType: (type) => {
set({ orderType: type });
},

setTableId: (tableId) => {
set({ tableId });
},

setCustomerInfo: (name, phone) => {
set({ customerName: name, customerPhone: phone });
},

setOrderNotes: (notes) => {
set({ notes });
},

clear: () => {
set({
items: [],
orderType: 'DINE_IN',
tableId: undefined,
customerName: undefined,
customerPhone: undefined,
notes: undefined,
});
},

getTotal: () => {
const subtotal = get().getSubtotal();
const tax = get().getTax();
const discount = get().getDiscount();
return subtotal + tax - discount;
},

getItemCount: () => {
return get().items.reduce((count, item) => count + item.quantity, 0);
},

getSubtotal: () => {
return get().items.reduce((sum, item) => sum + item.total, 0);
},

getTax: () => {
// Vous pouvez calculer la taxe ici (par exemple 18% au Togo)
return 0;
},

getDiscount: () => {
// Vous pouvez gérer les réductions ici
return 0;
},
}));
