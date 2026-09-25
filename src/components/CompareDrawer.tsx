import React from 'react';
import { TireProduct } from '../data';
import { formatPHP, calculateVatBreakdown } from '../utils';
import { X, Scale, ShoppingCart, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface CompareDrawerProps {
  comparedProducts: TireProduct[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onAddToCart: (product: TireProduct) => void;
  onAddToQuote: (product: TireProduct) => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  comparedProducts,
  onRemove,
  onClear,
  onAddToCart,
  onAddToQuote,
}) => {
  const [isMinimized, setIsMinimized] = React.useState(false);

  if (comparedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 shadow-2xl shadow-black backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between py-3.5 border-b border-zinc-800/80">
          <div className="flex items-center space-x-3">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              <Scale className="w-4 h-4" />
            </span>
            <h4 className="text-xs sm:text-sm font-semibold tracking-wide text-white">
              Side-by-Side Specification Comparison ({comparedProducts.length} of 3 selected)
            </h4>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title={isMinimized ? 'Expand Comparison' : 'Minimize Comparison'}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={onClear}
              className="text-xs text-zinc-400 hover:text-rose-400 font-medium transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Matrix Body */}
        {!isMinimized && (
          <div className="py-5 overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 min-w-[700px]">
              {comparedProducts.map(tire => {
                const { netOfVat, vatAmount } = calculateVatBreakdown(tire.price);

                return (
                  <div
                    key={tire.id}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between relative shadow-xl shadow-black/40"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => onRemove(tire.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      {/* Brand & Model */}
                      <div className="pr-8">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-black px-2 py-0.5 rounded text-zinc-300 border border-zinc-800">
                            {tire.brand}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {tire.terrain}
                          </span>
                        </div>
                        <h5 className="text-base font-bold text-white mt-1">{tire.model}</h5>
                        <div className="font-mono text-xs font-semibold text-blue-400 mt-0.5">
                          {tire.specCode}
                        </div>
                      </div>

                      {/* Specs Matrix */}
                      <div className="mt-4 space-y-2 text-xs border-t border-zinc-800/80 pt-3">
                        <div className="flex justify-between py-1 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Unit Price:</span>
                          <span className="font-mono font-bold text-white">{formatPHP(tire.price)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-zinc-800/60">
                          <span className="text-zinc-400">12% VAT Breakdown:</span>
                          <span className="font-mono text-[11px] text-zinc-300">
                            {formatPHP(netOfVat)} + {formatPHP(vatAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Load Capacity:</span>
                          <span className="font-medium text-zinc-200">{tire.loadCapacity}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Speed Max:</span>
                          <span className="font-medium text-zinc-200">{tire.speedRating} ({tire.speedMax})</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-zinc-800/60">
                          <span className="text-zinc-400">UTQG Treadwear / Grip:</span>
                          <span className="font-medium text-zinc-200">{tire.treadwear} / {tire.traction}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Warranty:</span>
                          <span className="font-medium text-zinc-200 truncate">{tire.warranty}</span>
                        </div>
                        <div className="py-1">
                          <span className="text-zinc-400 block mb-1">Recommended Application:</span>
                          <span className="text-zinc-300 text-[11px] leading-relaxed block bg-black/60 p-2.5 rounded-xl border border-zinc-800">
                            {tire.recommendedUse}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-zinc-800 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onAddToCart(tire)}
                        className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add Cart</span>
                      </button>
                      <button
                        onClick={() => onAddToQuote(tire)}
                        className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Add Quote</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
