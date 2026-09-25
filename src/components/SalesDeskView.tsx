import React, { useState, useMemo } from 'react';
import { PageHeader } from './ui/PageHeader';
import { TireProduct, OrderRecord } from '../data';
import { formatPHP, getAvailableStock, normalizePlate, calculateVatBreakdown } from '../utils';
import {
  Search,
  Copy,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  MessageSquare,
  Wrench,
  FileText,
  Disc,
  Layers,
  ChevronDown,
  Sparkles,
  Share2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  LayoutGrid,
  List,
  Gauge,
  Shield,
  ArrowUpRight,
  Send,
  UserCheck
} from 'lucide-react';

interface SalesDeskViewProps {
  products: TireProduct[];
  onBookInstallation: (product: TireProduct) => void;
  onAddToQuote: (product: TireProduct) => void;
  onOpenCustomerLink: (query: string) => void;
  onTriggerToast: (msg: string) => void;
  onRequestTireFromWarehouse?: (
    product: TireProduct,
    quantity: number,
    customerName: string,
    plateNumber: string,
    destination?: string
  ) => void;
}

export const SalesDeskView: React.FC<SalesDeskViewProps> = ({
  products,
  onBookInstallation,
  onAddToQuote,
  onOpenCustomerLink,
  onTriggerToast,
  onRequestTireFromWarehouse,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedTerrain, setSelectedTerrain] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Customer Quote Link Generator State
  const [customClientName, setCustomClientName] = useState('');
  const [customPlate, setCustomPlate] = useState('');
  const [customSelectedSku, setCustomSelectedSku] = useState(products[2]?.id || products[0]?.id);
  const [customQty, setCustomQty] = useState(4);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesText =
        !q ||
        p.specCode.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.recommendedUse.toLowerCase().includes(q) ||
        p.terrain.toLowerCase().includes(q) ||
        (p.dotBatchCode && p.dotBatchCode.toLowerCase().includes(q));

      const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
      const matchesTerrain = selectedTerrain === 'all' || p.terrain === selectedTerrain;

      return matchesText && matchesBrand && matchesTerrain;
    });
  }, [products, searchQuery, selectedBrand, selectedTerrain]);

  const selectedCustomProduct = products.find(p => p.id === customSelectedSku) || products[0];

  const handleCopyViberQuote = (
    product: TireProduct,
    quantity = 4,
    client = 'Valued Client',
    plate?: string
  ) => {
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const available = getAvailableStock(product);
    if (available <= 0) {
      onTriggerToast(`${product.brand} ${product.model} has no available stock to quote.`);
      return;
    }
    if (qty > available) {
      onTriggerToast(`Only ${available} available — quote qty adjusted in the message.`);
    }
    const useQty = Math.min(qty, available);
    const subtotal = product.price * useQty;
    const { netOfVat, vatAmount } = calculateVatBreakdown(subtotal);
    const trackKey = (plate && plate.trim()) || product.specCode;
    const customerPortalUrl = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(trackKey)}`;
    const plateLine = plate?.trim() ? `• Plate: ${normalizePlate(plate)}\n` : '';

    const message = `Good day ${client.trim() || 'Valued Client'}!

Superbdeal Corp — QC Hub quotation

TIRES
• ${product.brand} ${product.model}
• Spec: ${product.specCode}
• Terrain: ${product.terrain}
• DOT: ${product.dotBatchCode || 'Latest batch'}
• Warranty: ${product.warranty}
${plateLine}• Qty: ${useQty} (available now: ${available})

PRICE (VAT-inclusive)
• Unit: ${formatPHP(product.price)}
• Total: ${formatPHP(subtotal)}
• Net: ${formatPHP(netOfVat)} + VAT: ${formatPHP(vatAmount)}

${useQty >= 4 ? 'With 4+ units: alignment + balancing promo may apply at install.\n' : ''}
Track / book: ${customerPortalUrl}

QC Hub — 148 G. Araneta Ave., Quezon City
Tel: (02) 8371-9920`;

    void navigator.clipboard.writeText(message).then(
      () => {
        setCopiedId(product.id);
        onTriggerToast(`Quote copied (${useQty}x ${product.brand})`);
        setTimeout(() => setCopiedId(null), 2500);
      },
      () => onTriggerToast('Could not copy — check browser clipboard permission.')
    );
  };

  const handleCopyQuickSnippet = () => {
    if (!selectedCustomProduct) {
      onTriggerToast('Select a tire first.');
      return;
    }
    handleCopyViberQuote(
      selectedCustomProduct,
      customQty,
      customClientName || 'Valued Client',
      customPlate
    );
  };

  const handleRequestPull = (product: TireProduct, fallbackQty = 4) => {
    if (!onRequestTireFromWarehouse) return;
    const available = getAvailableStock(product);
    if (available <= 0) {
      onTriggerToast('No available stock to request.');
      return;
    }
    const qty = Math.min(Math.max(1, Math.floor(fallbackQty)), available);
    const name = (customClientName || 'Counter customer').trim();
    const plate = normalizePlate(customPlate || 'WALK-IN');
    onRequestTireFromWarehouse(product, qty, name, plate, 'Front Counter');
  };

  const handleTrackLink = () => {
    const key = (customPlate || customClientName || selectedCustomProduct?.specCode || '').trim();
    if (!key) {
      onTriggerToast('Enter a plate or customer name to copy a tracking link.');
      return;
    }
    onOpenCustomerLink(normalizePlate(key));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counter desk"
        description="Look up fitment, send quotes, book the bay, and request stock from the warehouse."
      />
      


      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5  flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Rapid Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Type size (265/65/17), vehicle (Fortuner), DOT, or brand..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white font-mono"
          />
        </div>

        {/* Brand & Terrain Dropdowns + View Mode Toggle */}
        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto">
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer"
            >
              <option value="all">All Brands (6 Available)</option>
              <option value="Michelin">Michelin</option>
              <option value="Bridgestone">Bridgestone</option>
              <option value="Yokohama">Yokohama</option>
              <option value="Goodyear">Goodyear</option>
              <option value="Continental">Continental</option>
              <option value="Dunlop">Dunlop</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedTerrain}
              onChange={e => setSelectedTerrain(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer"
            >
              <option value="all">All Terrains</option>
              <option value="Touring">Touring</option>
              <option value="Highway Terrain (HT)">Highway Terrain (HT)</option>
              <option value="All-Terrain (AT)">All-Terrain (AT)</option>
              <option value="Performance">Performance</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Toggle: Cards vs Table */}
          <div className="flex items-center bg-slate-100 border border-slate-300 rounded-lg p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 '
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 '
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono shrink-0 pl-1">
            {filteredProducts.length} Matches
          </span>
        </div>
      </div>

      {/* PRODUCTS DISPLAY: CARDS OR TABLE */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-lg p-8 ">
          <Disc className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Matching Tires Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try searching a different tire size (e.g. 265/65/17), vehicle name, or reset the brand and terrain filters.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARD DESIGN GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const wholesale = product.wholesaleCost || Math.round(product.price * 0.78);
            const marginPhp = product.price - wholesale;
            const marginPct = Math.round((marginPhp / product.price) * 100);
            const availableStock = Math.max(0, product.stock - (product.stockReserved || 0));

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 hover:border-blue-500 rounded-lg p-6  hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top row: Brand & Terrain Pill + DOT Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-800">
                        {product.brand}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                        {product.terrain}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 font-mono text-[11px] font-bold text-blue-700">
                      {product.dotBatchCode || 'DOT 2025'}
                    </span>
                  </div>

                  {/* Stock On Hand Pill */}
                  <div className="mb-4">
                    {product.stock > 5 ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>In Stock ({getAvailableStock(product)} available &bull; {availableStock} available)</span>
                      </span>
                    ) : product.stock >= 1 ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>Low Stock ({getAvailableStock(product)} available remaining)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span>Out of Stock (Backorder)</span>
                      </span>
                    )}
                  </div>

                  {/* Model Title & Specs */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {product.model}
                      </h3>
                      {product.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-base font-semibold text-blue-600 mt-1 flex items-center justify-between">
                      <span>{product.specCode}</span>
                      <span className="text-xs text-slate-500 font-sans font-normal">
                        Rim: {product.rim} &bull; {product.speedRating}
                      </span>
                    </div>
                  </div>

                  {/* Spec Mini Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4 text-[11px]">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Load: <strong className="text-slate-900 font-mono">{product.loadCapacity}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <span className="text-slate-400 font-mono font-bold">SPD:</span>
                      <span>Max: <strong className="text-slate-900 font-mono">{product.speedMax}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <span className="text-slate-400 font-mono font-bold">UTQG:</span>
                      <span>Wear: <strong className="text-slate-900 font-mono">{product.treadwear}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{product.warranty}</span>
                    </div>
                  </div>

                  {/* Financial & Margin Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-5">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold">Retail Price (VAT Inc)</span>
                      <span className="text-lg font-bold font-mono text-slate-900">
                        {formatPHP(product.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <span>Wholesale Cost</span>
                      <span className="font-mono text-slate-700">{formatPHP(wholesale)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Dealer Margin</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        +{marginPct}% ({formatPHP(marginPhp)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sales Actions Footer */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleCopyViberQuote(product)}
                    className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all cursor-pointer  ${
                      copiedId === product.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedId === product.id ? 'Copied to Clipboard!' : 'Copy Viber Quote'}</span>
                  </button>

                  {onRequestTireFromWarehouse && (
                    <button
                      type="button"
                      onClick={() => handleRequestPull(product, customQty || 4)}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer "
                      title="Ping warehouse releasing staff to pull 4x units of this tire"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-700" />
                      <span>Request 4x from Warehouse Staff</span>
                    </button>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onBookInstallation(product)}
                      className="flex items-center justify-center space-x-1 py-2 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                      title="Directly reserve a service bay slot"
                    >
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <span>Book Bay</span>
                    </button>
                    <button
                      onClick={() => onAddToQuote(product)}
                      className="flex items-center justify-center space-x-1 py-2 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                      title="Add to Corporate Fleet Quotation"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Quote</span>
                    </button>
                    <button
                      onClick={() => onOpenCustomerLink((customPlate || product.specCode).trim())}
                      className="flex items-center justify-center space-x-1 py-2 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                      title="Copy Live Customer Status Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span>Link</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DENSE OPERATIONAL INVENTORY TABLE */
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden ">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Tire Brand &amp; Model</th>
                  <th className="py-3.5 px-4">Spec &amp; Rim</th>
                  <th className="py-3.5 px-4">DOT Batch</th>
                  <th className="py-3.5 px-4">Stock on Hand</th>
                  <th className="py-3.5 px-4">Wholesale Cost</th>
                  <th className="py-3.5 px-4">Retail Price (VAT Inc)</th>
                  <th className="py-3.5 px-4">Dealer Margin</th>
                  <th className="py-3.5 px-4 text-right">Quick Sales Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(product => {
                  const wholesale = product.wholesaleCost || Math.round(product.price * 0.78);
                  const marginPhp = product.price - wholesale;
                  const marginPct = Math.round((marginPhp / product.price) * 100);
                  const availableStock = Math.max(0, product.stock - (product.stockReserved || 0));

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors group">
                      
                      {/* Brand & Model */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-blue-600 font-bold">
                            <Disc className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{product.brand}</span>
                              <span className="font-normal text-slate-600">{product.model}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              SKU: {product.id} &bull; {product.terrain}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Spec & Rim */}
                      <td className="py-4 px-4 font-mono">
                        <span className="font-bold text-slate-900 text-xs block">{product.specCode}</span>
                        <span className="text-[10px] text-slate-500">Rim: {product.rim} &bull; {product.speedRating}</span>
                      </td>

                      {/* DOT Batch */}
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 font-mono text-[11px] font-bold text-blue-700">
                          {product.dotBatchCode || 'DOT 2025'}
                        </span>
                      </td>

                      {/* Stock On Hand vs Reserved */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            product.stock === 0
                              ? 'bg-slate-400'
                              : product.stock <= 4
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-emerald-500'
                          }`} />
                          <div>
                            <span className={`font-mono font-bold text-xs ${
                              product.stock === 0 ? 'text-slate-400' : 'text-slate-900'
                            }`}>
                              {product.stock} Units
                            </span>
                            {product.stockReserved ? (
                              <span className="text-[10px] text-slate-500 block font-mono">
                                ({availableStock} avail / {product.stockReserved} res)
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 block font-mono">
                                (Ready to mount)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Wholesale Cost */}
                      <td className="py-4 px-4 font-mono text-slate-500 text-xs">
                        {formatPHP(wholesale)}
                      </td>

                      {/* Retail Price */}
                      <td className="py-4 px-4 font-mono">
                        <span className="text-sm font-bold text-slate-900 block">
                          {formatPHP(product.price)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Net: {formatPHP(product.price / 1.12)}
                        </span>
                      </td>

                      {/* Gross Margin */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          +{marginPct}% ({formatPHP(marginPhp)})
                        </span>
                      </td>

                      {/* Quick Sales Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* Copy Viber Quote Button */}
                          <button
                            onClick={() => handleCopyViberQuote(product)}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                              copiedId === product.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white '
                            }`}
                            title="Copy ready-to-send Viber quote snippet with live customer portal link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedId === product.id ? 'Copied!' : 'Copy Viber Quote'}</span>
                          </button>

                          {/* Preview Customer View */}
                          <button
                            onClick={() => onOpenCustomerLink((customPlate || product.specCode).trim())}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                            title="Preview the Live Customer Status Portal for this tire"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                          </button>

                          {/* Direct Bay Booking */}
                          <button
                            onClick={() => onBookInstallation(product)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                            title="Directly reserve a service bay slot for this customer"
                          >
                            <Wrench className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {/* Request Tire from Warehouse */}
                          {onRequestTireFromWarehouse && (
                            <button
                              type="button"
                              onClick={() => handleRequestPull(product, customQty || 4)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
                              title="Request 4x tires from warehouse releasing staff"
                            >
                              <Send className="w-3 h-3" />
                              <span className="hidden xl:inline">Request from Warehouse</span>
                            </button>
                          )}

                          {/* Add to Corporate Fleet Quote */}
                          <button
                            onClick={() => onAddToQuote(product)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                            title="Add to B2B Fleet Quote (30/60 PDC)"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
