import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={() => onSelect(product)}
      disabled={!product.isAvailable}
      className={`
        relative p-4 rounded-lg transition-all duration-200
        ${product.isAvailable
          ? 'bg-white hover:bg-gray-50 hover:shadow-lg cursor-pointer border-2 border-gray-200 hover:border-primary-500'
          : 'bg-gray-100 cursor-not-allowed opacity-60 border-2 border-gray-300'
        }
      `}
    >
      {product.image && (
        <div className="aspect-square mb-3 rounded-md overflow-hidden bg-gray-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {!product.image && (
        <div className="aspect-square mb-3 rounded-md bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
          <span className="text-4xl">{product.category?.icon || '🍔'}</span>
        </div>
      )}

      <h3 className="font-semibold text-gray-900 mb-1 text-left">
        {product.name}
      </h3>

      {product.description && (
        <p className="text-sm text-gray-500 mb-2 text-left line-clamp-2">
          {product.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-lg font-bold text-primary-600">
          {Number(product.price).toLocaleString()} FCFA
        </span>

        {!product.isAvailable && (
          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
            Indisponible
          </span>
        )}
      </div>

      {product.preparationTime && (
        <div className="mt-2 text-xs text-gray-400">
          ⏱️ {product.preparationTime} min
        </div>
      )}
    </button>
  );
}
