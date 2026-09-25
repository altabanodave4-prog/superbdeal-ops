import React from 'react';
import { TireProduct } from '../data';
import { formatPHP, calculateVatBreakdown } from '../utils';
import { ShoppingCart, Wrench, FileText, Share2, Scale, Shield, Gauge, Check, AlertTriangle, XCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProductCatalogProps {
  products: TireProduct[];
  onAddToCart: (product: TireProduct) => void;
  onBookInstallation: (product: TireProduct) => void;
  onAddToQuote: (product: TireProduct) => void;
  onCopyShareLink: (product: TireProduct) => void;
  comparedIds: string[];
  onToggleCompare: (product: TireProduct) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onBookInstallation,
  onAddToQuote,
  onCopyShareLink,
  comparedIds,
  onToggleCompare,
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-950/40 border border-dashed border-zinc-800 rounded-2xl p-8">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4 text-zinc-400">
          <Scale className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-200">No Matching Tire Specifications</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mt-2">
          Try expanding your size parameters, vehicle selection, or brand filters to view available warehouse inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => {
        const { netOfVat, vatAmount } = calculateVatBreakdown(product.price);
        const isCompared = comparedIds.includes(product.id);

        return (
          <div
            key={product.id}
            className="bg-zinc-950/90 border border-zinc-800/90 hover:border-blue-500/50 rounded-2xl p-6 shadow-xl shadow-black hover:shadow-blue-950/20 transition-all duration-200 flex flex-col justify-between group relative backdrop-blur-sm"
          >
            {/* Top Row: Brand, Terrain & Compare Action */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-black border border-zinc-800 text-zinc-200">
                    {product.brand}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {product.terrain}
                  </span>
                </div>

                {/* Compare Checkbox Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleCompare(product)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                    isCompared
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-black text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                  title="Compare side-by-side"
                >
                  <Scale className="w-3 h-3" />
                  <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                </button>
              </div>

              {/* Status Badges - Refined Blue/Neutral accents */}
              <div className="mb-4">
                {product.stock > 5 ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>In Stock ({product.stock} units available)</span>
                  </span>
                ) : product.stock >= 1 ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Low Stock ({product.stock} units remaining)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                    <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                    <span>Out of Stock (Backorder Available)</span>
                  </span>
                )}
              </div>

              {/* Hierarchy: Brand > Model Headline > Specs */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {product.model}
                  </h3>
                  {product.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="font-mono text-base font-semibold text-blue-400 mt-1 flex items-center justify-between">
                  <span>{product.specCode}</span>
                  <span className="text-xs text-zinc-400 font-sans font-normal">
                    {product.rim} Rim ({product.width}/{product.profile})
                  </span>
                </div>
              </div>

              {/* Specification Pills Grid */}
              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-xl bg-black/60 border border-zinc-850 mb-5 text-[11px]">
                <div className="flex items-center space-x-1.5 text-zinc-300">
                  <Gauge className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Load: <strong className="text-white font-mono">{product.loadCapacity}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-zinc-300">
                  <span className="text-zinc-400 font-mono font-bold">SPD:</span>
                  <span>Max: <strong className="text-white font-mono">{product.speedMax}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-zinc-300">
                  <span className="text-zinc-400 font-mono font-bold">UTQG:</span>
                  <span>Wear: <strong className="text-white font-mono">{product.treadwear}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-zinc-300">
                  <Shield className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{product.warranty}</span>
                </div>
              </div>

              {/* Recommended Application description */}
              <p className="text-xs text-zinc-400 mb-5 line-clamp-2 leading-relaxed">
                {product.recommendedUse}
              </p>
            </div>

            {/* Bottom: Pricing Block & Refined Buttons */}
            <div>
              {/* Pricing Display */}
              <div className="p-3.5 rounded-xl bg-black/80 border border-zinc-800/90 mb-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium text-zinc-400">Retail Unit Price</span>
                  <span className="font-mono text-2xl font-bold text-white">
                    {formatPHP(product.price)}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center justify-between mt-1.5 pt-1.5 border-t border-zinc-800/80">
                  <span>Net of VAT:</span>
                  <span className="font-mono text-zinc-300">
                    {formatPHP(netOfVat)} + 12% VAT ({formatPHP(vatAmount)})
                  </span>
                </div>
              </div>

              {/* Action Buttons: Primary Solid Blue & Secondary Outlined Zinc */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Primary Button */}
                  <button
                    disabled={product.stock === 0}
                    onClick={() => onAddToCart(product)}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-sm hover:shadow-blue-950/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Secondary Button */}
                  <button
                    disabled={product.stock === 0}
                    onClick={() => onBookInstallation(product)}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-800 font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5 text-blue-400" />
                    <span>Book Fitting</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* B2B Quote Button */}
                  <button
                    onClick={() => onAddToQuote(product)}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-black/60 hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-medium transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Add to Quote</span>
                  </button>

                  {/* Share Link Button */}
                  <button
                    onClick={() => onCopyShareLink(product)}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-black/60 hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-medium transition-all cursor-pointer"
                    title="Copy direct shareable catalog link for Viber or corporate inquiry"
                  >
                    <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};
