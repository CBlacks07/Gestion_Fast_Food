import { UtensilsCrossed, Coffee, IceCream, Layers } from 'lucide-react';
import type { Product, ProductType } from '../types';
import { API_BASE_URL } from '../services/api';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

function TypeIcon({ type, size = 28 }: { type: ProductType; size?: number }) {
  if (type === 'DRINK') return <Coffee size={size} strokeWidth={1.5} />;
  if (type === 'DESSERT') return <IceCream size={size} strokeWidth={1.5} />;
  if (type === 'SIDE') return <Layers size={size} strokeWidth={1.5} />;
  return <UtensilsCrossed size={size} strokeWidth={1.5} />;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  // Préfixe les chemins relatifs (/uploads/...) avec l'URL de l'API ; laisse les URLs absolues (http) telles quelles
  const resolveImage = (url?: string | null) =>
    url ? (url.startsWith('http') ? url : `${API_BASE_URL}${url}`) : null;

  const imgSrc = resolveImage(product.image) ?? resolveImage(product.category?.image);

  return (
    <button
      onClick={() => onSelect(product)}
      disabled={!product.isAvailable}
      className={`
        relative w-full text-left rounded-xl transition-all duration-200 overflow-hidden shadow-sm
        ${product.isAvailable
          ? 'bg-white hover:shadow-lg cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5'
          : 'bg-white cursor-not-allowed opacity-50'
        }
      `}
    >
      {/* Zone image */}
      <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
            <div className="text-primary-300">
              {product.category?.icon
                ? <span className="text-5xl">{product.category.icon}</span>
                : <TypeIcon type={product.type} size={44} />
              }
            </div>
          </div>
        )}

        {/* Badge indispo */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-bold text-red-500 bg-white px-2 py-1 rounded-full shadow-sm border border-red-100">
              Indisponible
            </span>
          </div>
        )}

        {/* Badge prix */}
        <div className="absolute bottom-2 right-2">
          <span className="text-xs font-bold text-white px-2 py-1 rounded-lg shadow backdrop-blur-sm"
            style={{ background: 'var(--color-secondary, #6b7280)' }}>
            {Number(product.price).toLocaleString()} F
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 leading-tight truncate text-sm">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-1">
          {product.description ? (
            <p className="text-xs text-gray-400 line-clamp-1 flex-1 mr-2">
              {product.description}
            </p>
          ) : <span />}

          {product.preparationTime ? (
            <span className="text-xs text-gray-400 flex-shrink-0">{product.preparationTime} min</span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
