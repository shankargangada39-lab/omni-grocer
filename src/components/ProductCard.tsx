import React from 'react';
import { ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { Product, CurrencyCode, CURRENCY_MAP } from '../types';

interface ProductCardProps {
  product: Product;
  currency: CurrencyCode;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, currency, onAddToCart }) => {
  const { symbol, rate } = CURRENCY_MAP[currency];
  const convertedPrice = (product.price * rate).toFixed(2);
  const isOutOfStock = product.inventory === 0;
  const isLowStock = product.inventory > 0 && product.inventory < 10;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition-all hover:scale-[1.01] hover:border-slate-200 hover:shadow-md">
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-all duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-xs border border-slate-100">
          {product.category}
        </span>

        {/* Inventory Indicator Overlay */}
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
            <span className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              <AlertCircle className="h-4 w-4" />
              Out of Stock
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
            <AlertCircle className="h-3 w-3" />
            Only {product.inventory} Left
          </span>
        ) : (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
            <CheckCircle className="h-3 w-3" />
            In Stock ({product.inventory})
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4 text-left">
        <div className="flex items-baseline justify-between gap-1 mb-1">
          <h3 className="font-display text-base font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
        </div>

        <p className="font-sans text-xs text-slate-400 font-semibold mb-2">
          {product.unit}
        </p>

        <p className="font-sans text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Pricing & Add Button row */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Price</span>
            <span className="font-display text-lg font-extrabold text-slate-900">
              {symbol}
              {convertedPrice}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-50 hover:shadow-lg active:scale-95'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
