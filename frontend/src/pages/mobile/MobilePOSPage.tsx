import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, ShoppingCart } from 'lucide-react';
import { categoriesApi, productsApi } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import ProductCard from '../../components/ProductCard';
import MobileCartSheet from '../../components/mobile/MobileCartSheet';
import MobilePaymentSheet from '../../components/mobile/MobilePaymentSheet';
import type { Category, Product } from '../../types';

export default function MobilePOSPage() {
const [categories, setCategories] = useState<Category[]>([]);
const [products, setProducts] = useState<Product[]>([]);
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');
const [isLoading, setIsLoading] = useState(true);
const [cartOpen, setCartOpen] = useState(false);
const [paymentOpen, setPaymentOpen] = useState(false);

const { addItem, getItemCount, getTotal } = useCartStore();

useEffect(() => {
loadData();
}, []);

useEffect(() => {
const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200);
return () => clearTimeout(timer);
}, [searchQuery]);

const loadData = async () => {
try {
setIsLoading(true);
const [categoriesResponse, productsResponse] = await Promise.all([
categoriesApi.getAll(),
productsApi.getAll({ available: true }),
]);
if (categoriesResponse.success && categoriesResponse.data) setCategories(categoriesResponse.data);
if (productsResponse.success && productsResponse.data) setProducts(productsResponse.data);
} catch (err) {
console.error('Erreur de chargement:', err);
} finally {
setIsLoading(false);
}
};

const filteredProducts = useMemo(() => {
const query = debouncedQuery.trim().toLowerCase();
return products.filter((product) => {
const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
const matchesSearch = !query ||
product.name.toLowerCase().includes(query) ||
product.description?.toLowerCase().includes(query);
return matchesCategory && matchesSearch;
});
}, [products, selectedCategory, debouncedQuery]);

const itemCount = getItemCount();

if (isLoading) {
return (
<div className="h-full flex items-center justify-center">
<Loader2 className="animate-spin h-10 w-10 text-primary-500" />
</div>
);
}

return (
<div className="h-full flex flex-col relative">
{/* Recherche */}
<div className="px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
<div className="relative">
<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
<input
type="text"
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
placeholder="Rechercher un produit..."
className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
/>
</div>
</div>

{/* Catégories */}
<div className="flex gap-2 overflow-x-auto px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
<button
onClick={() => setSelectedCategory(null)}
className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${!selectedCategory ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
>
Tous
</button>
{categories.map((category) => (
<button
key={category.id}
onClick={() => setSelectedCategory(category.id)}
className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${selectedCategory === category.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
>
{category.icon && <span>{category.icon}</span>}
{category.name}
</button>
))}
</div>

{/* Grille produits */}
<div className="flex-1 overflow-y-auto p-3 pb-24">
{filteredProducts.length === 0 ? (
<div className="h-full flex items-center justify-center text-gray-400 text-sm">
Aucun produit trouvé
</div>
) : (
<div className="grid grid-cols-2 gap-3">
{filteredProducts.map((product) => (
<ProductCard key={product.id} product={product} onSelect={addItem} />
))}
</div>
)}
</div>

{/* Bouton panier flottant */}
{!cartOpen && itemCount > 0 && (
<button
onClick={() => setCartOpen(true)}
className="absolute left-4 right-4 bottom-4 bg-primary-600 text-white rounded-2xl py-3.5 px-4 flex items-center justify-between font-bold shadow-lg z-20"
>
<span className="flex items-center gap-2">
<ShoppingCart size={18} />
Panier · {itemCount}
</span>
<span>{getTotal().toLocaleString()} FCFA</span>
</button>
)}

{cartOpen && (
<MobileCartSheet
onClose={() => setCartOpen(false)}
onCheckout={() => { setCartOpen(false); setPaymentOpen(true); }}
/>
)}

{paymentOpen && (
<MobilePaymentSheet
onClose={() => setPaymentOpen(false)}
onSuccess={loadData}
/>
)}
</div>
);
}
