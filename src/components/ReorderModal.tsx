import React, { useState } from 'react';
import { TireProduct, StaffRole, STAFF_PROFILES } from '../data';
import { formatPHP } from '../utils';
import {
  AlertTriangle,
  FileText,
  Truck,
  CheckCircle2,
  X,
  Printer,
  Send,
  Building,
  Calendar,
  Sparkles,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: TireProduct[];
  activeRole: StaffRole;
  onConfirmReorderPO: (poNumber: string, supplier: string, items: { product: TireProduct; qty: number }[], totalCost: number) => void;
}

export const ReorderModal: React.FC<ReorderModalProps> = ({
  isOpen,
  onClose,
  products,
  activeRole,
  onConfirmReorderPO
}) => {
  if (!isOpen) return null;

  const currentProfile = STAFF_PROFILES[activeRole];

  // Filter low stock items
  const lowStockProducts = products.filter(p => p.stock <= p.minStockThreshold);

  // Reorder quantities state
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    lowStockProducts.forEach(p => {
      const par = p.parLevel || 24;
      map[p.id] = Math.max(8, par - p.stock);
    });
    return map;
  });

  const [poNumber] = useState(`PO-QC-${Math.floor(202600 + Math.random() * 900)}`);
  const [deliveryNote, setDeliveryNote] = useState('Priority replenishment for high-demand branch queue. Deliver to Receiving Dock B.');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleQtyChange = (id: string, qty: number) => {
    setOrderQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, qty)
    }));
  };

  // Compute total wholesale cost
  const totalCost = lowStockProducts.reduce((sum, p) => {
    const qty = orderQuantities[p.id] || 0;
    return sum + (p.wholesaleCost || 3500) * qty;
  }, 0);

  const totalUnits = Object.values(orderQuantities).reduce((a, b) => a + b, 0);

  const handleSubmitPO = () => {
    const orderItems = lowStockProducts.map(p => ({
      product: p,
      qty: orderQuantities[p.id] || 0
    })).filter(item => item.qty > 0);

    onConfirmReorderPO(poNumber, 'Direct Supplier Logistics Hub', orderItems, totalCost);
    setIsSubmitted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  Low-Stock Automatic Replenishment Purchase Order
                </h3>
                <span className="text-[10px] font-mono bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold">
                  {poNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated PO generation calculated from safety par stock levels and active shop reservations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">Purchase Order Transmitted!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {poNumber} for <strong>{totalUnits} tires</strong> ({formatPHP(totalCost)}) has been recorded. Inbound Receiving Dock B has been alerted for upcoming pallet delivery.
                </p>
              </div>

              <div className="pt-4 flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Formal PO Slip</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-600/20"
                >
                  Return to Inventory
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TELEMETRY BANNER */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-extrabold block">
                      {lowStockProducts.length} Tire Models Below Safety Minimum Threshold
                    </span>
                    <span>Replenishment quantities are pre-calculated to restore inventory to Target Par Level.</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 font-mono text-xs shrink-0">
                  <div className="bg-white/90 px-3 py-1.5 rounded-xl border border-amber-300">
                    <span className="text-[10px] text-slate-500 block uppercase">Units</span>
                    <strong className="text-slate-900">{totalUnits} Tires</strong>
                  </div>
                  <div className="bg-white/90 px-3 py-1.5 rounded-xl border border-amber-300">
                    <span className="text-[10px] text-slate-500 block uppercase">Est. Wholesale Cost</span>
                    <strong className="text-blue-900">{formatPHP(totalCost)}</strong>
                  </div>
                </div>
              </div>

              {/* REORDER ITEMS LIST */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Replenishment Line Items &amp; Quantity Adjuster:
                </span>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
                  {lowStockProducts.map(product => {
                    const currentQty = orderQuantities[product.id] || 0;
                    const lineCost = (product.wholesaleCost || 3500) * currentQty;
                    const par = product.parLevel || 24;

                    return (
                      <div key={product.id} className="p-4 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        
                        {/* Tire Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm">{product.brand} {product.model}</span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {product.id}
                            </span>
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                              {product.stock === 0 ? 'Out of Stock' : `Low: ${product.stock}/${product.minStockThreshold}`}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            Spec: {product.specCode} &bull; Bin: {product.binLocation} &bull; Par: {par} units
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Supplier: {product.supplier || 'Authorized Tire Distributor Hub'}
                          </div>
                        </div>

                        {/* Adjuster */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(product.id, Math.max(0, currentQty - 4))}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                            >
                              -4
                            </button>
                            <input
                              type="number"
                              value={currentQty}
                              onChange={e => handleQtyChange(product.id, Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-16 h-8 text-center bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() => handleQtyChange(product.id, currentQty + 4)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                            >
                              +4
                            </button>
                          </div>

                          <div className="w-28 text-right font-mono">
                            <span className="text-[10px] text-slate-400 block">Subtotal</span>
                            <strong className="text-slate-900">{formatPHP(lineCost)}</strong>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DOCK DELIVERY NOTES */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Delivery Logistics &amp; Inbound Staging Instructions:
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={e => setDeliveryNote(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-slate-500">
                  Authorized Manager: <strong className="text-slate-800">{currentProfile.name}</strong> ({currentProfile.badgeCode})
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={totalUnits === 0}
                    onClick={handleSubmitPO}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Authorize &amp; Issue Purchase Order</span>
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
