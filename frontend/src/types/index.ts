// Types pour l'application

export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'WAITER';

export type ProductType = 'FOOD' | 'DRINK' | 'DESSERT' | 'SIDE';

export type OptionType = 'SUPPLEMENT' | 'CHOICE' | 'REMOVAL';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'TMONEY' | 'FLOOZ' | 'CARD' | 'MOBILE' | 'OTHER';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type IngredientUnit = 'GRAM' | 'KILOGRAM' | 'LITER' | 'MILLILITER' | 'PIECE' | 'UNIT';

export type StockMovementType = 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'WASTE' | 'RETURN';

export interface User {
id: string;
email: string;
username: string;
firstName?: string;
lastName?: string;
role: Role;
isActive: boolean;
}

export interface Category {
id: string;
name: string;
description?: string;
icon?: string;
image?: string;
displayOrder: number;
isActive: boolean;
products?: Product[];
}

export interface Option {
id: string;
name: string;
type: OptionType;
price: number;
isActive: boolean;
}

export interface ProductOption {
id: string;
productId: string;
optionId: string;
option: Option;
}

export interface Product {
id: string;
name: string;
description?: string;
price: number;
cost?: number;
image?: string;
type: ProductType;
isAvailable: boolean;
isActive: boolean;
preparationTime?: number;
displayOrder: number;
categoryId: string;
category?: Category;
options?: ProductOption[];
}

export interface Table {
id: string;
number: number;
capacity: number;
isActive: boolean;
}

export interface OrderItemOption {
id: string;
orderItemId: string;
optionId: string;
price: number;
option: Option;
}

export interface OrderItem {
id: string;
orderId: string;
productId: string;
quantity: number;
unitPrice: number;
total: number;
notes?: string;
product: Product;
options?: OrderItemOption[];
}

export interface Order {
id: string;
orderNumber: string;
type: OrderType;
status: OrderStatus;
tableId?: string;
table?: Table;
customerName?: string;
customerPhone?: string;
notes?: string;
subtotal: number;
discount: number;
tax: number;
total: number;
userId: string;
user?: User;
items: OrderItem[];
payments?: Payment[];
createdAt: string;
updatedAt: string;
}

export interface Payment {
id: string;
orderId: string;
method: PaymentMethod;
status: PaymentStatus;
amount: number;
reference?: string;
userId: string;
user?: User;
order?: Order;
createdAt: string;
updatedAt: string;
}

// Types pour le panier de commande (avant création de la commande)
export interface CartItemOption {
optionId: string;
option: Option;
}

export interface CartItem {
product: Product;
quantity: number;
notes?: string;
selectedOptions: CartItemOption[];
total: number;
}

// Stock Management Types
export interface Ingredient {
id: string;
name: string;
description?: string;
unit: IngredientUnit;
currentStock: number;
minStock: number;
unitCost: number;
isActive: boolean;
createdAt: string;
updatedAt: string;
stockMovements?: StockMovement[];
recipes?: Recipe[];
}

export interface StockMovement {
id: string;
ingredientId: string;
type: StockMovementType;
quantity: number;
reason?: string;
reference?: string;
createdAt: string;
ingredient?: Ingredient;
}

export interface Recipe {
id: string;
productId: string;
ingredientId: string;
quantity: number;
product?: Product;
ingredient?: Ingredient;
}

// App Settings Types
export interface AppSettings {
id: string;
appName: string;
appIcon: string;
slogan?: string;
logoUrl?: string;
primaryColor: string;
secondaryColor?: string;
companyName?: string;
companyEmail?: string;
companyPhone?: string;
companyAddress?: string;
currency: string;
currencySymbol: string;
taxRate: number;
receiptHeader?: string;
receiptFooter?: string;
isActive: boolean;
createdAt: string;
updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
success: boolean;
data?: T;
error?: string;
message?: string;
}
