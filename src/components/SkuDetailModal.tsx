import React from 'react';
import { TireProduct, StaffRole, StockMovementRecord, STAFF_PROFILES } from '../data';
import { formatPHP } from '../utils';
import {
  Package,
  Barcode,
  MapPin,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Edit3,
  ShieldCheck,
  DollarSign,
  Truck,
  Building2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface SkuDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: TireProduct | null;
  movements: StockMovementRecord[];
  activeRole: StaffRole;
  onOpenIntake: (product: TireProduct) => void;
  onOpenDispatch: (product: TireProduct) => void;
  onOpenCycleCount: (product: TireProduct) => void;
  onOpenEditMaster: (product: TireProduct) => void;
}

export const SkuDetailModal: React.FC<SkuDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  movements,
  activeRole,
  onOpenIntake,
  onOpenDispatch,
  onOpenCycleCount,
  onOpenEditMaster
}) => {
  if (!isOpen || !product) return null;

  const isManager = activeRole === 'ROLE_MANAGER';
  const isAdmin = activeRole === 'ROLE_ADMIN';
  const canViewFinancials = isManager || isAdmin;
  const canEditMaster = isManager || isAdmin;

  // Filter movements for this specific SKU
  const skuMovements = movements.filter(m => m.sku === product.id);

  const isLowStock = product.stock <= product.minStockThreshold;
  const isOutOfStock = product.stock === 0;
  const reserved = product.stockReserved || 0;
  const netAvailable = Math.max(0, product.stock - reserved);
  const parLevel = product.parLevel || 24;

  // Health percent
  const stockHealthPercent = Math.min(100, Math.round((product.stock / parLevel) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-xl">
                  {product.brand} {product.model}
                </h3>
                <span className="text-[10px] font-mono bg-blue-900/80 text-blue-300 border border-blue-700 px-2 py-0.5 rounded font-bold">
                  {product.id}
                </span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                  {product.dotBatchCode || 'DOT 1425'}
                </span>
                {isLowStock && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wide shadow-xs animate-in fade-in">
                    <AlertTriangle className="w-3 h-3 text-white fill-white/20 shrink-0" />
                    <span>Low Stock Alert</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Spec: {product.specCode} &bull; Category: {product.category}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canEditMaster && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditMaster(product);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer border border-slate-700"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Edit Master</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* STOCK HEALTH & PHYSICAL LOCATION HERO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Box 1: Real-time Stock Breakdown */}
            <div className={`p-4 rounded-2xl border ${
              isLowStock ? 'bg-red-50/70 border-red-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Stock Status
                </span>
                {isLowStock && (
                  <span className="inline-flex items-center space-x-1 text-[9px] font-extrabold text-red-700 bg-red-100 border border-red-300 px-1.5 py-0.2 rounded-full">
                    <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                    <span>Low Stock Alert</span>
                  </span>
                )}
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-extrabold font-mono ${
                  isOutOfStock ? 'text-red-600' : isLowStock ? 'text-red-600' : 'text-slate-900'
                }`}>
                  {product.stock}
                </span>
                <span className="text-xs text-slate-500 font-bold">Total Physical</span>
              </div>

              <div className="mt-2 space-y-1 text-[11px] font-mono border-t border-slate-200 pt-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Reserved for Bay Jobs:</span>
                  <strong className="text-amber-700">{reserved} units</strong>
                </div>
                <div className="flex justify-between">
                  <span>Available to Promise:</span>
                  <strong className="text-emerald-700">{netAvailable} units</strong>
                </div>
              </div>
            </div>

            {/* Box 2: Physical Shelf Bin Tag */}
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-900 block mb-1">
                  Physical Storage Bin
                </span>
                <div className="flex items-center space-x-2 font-mono font-extrabold text-blue-950 text-xl">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{product.binLocation}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-blue-200/80 text-[11px] font-mono text-blue-800 flex items-center space-x-1.5">
                <Barcode className="w-3.5 h-3.5" />
                <span>{product.barcode}</span>
              </div>
            </div>

            {/* Box 3: Par Level & Replenishment Meter */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                  <span>Safety Par Level</span>
                  <span>{stockHealthPercent}% Filled</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOutOfStock ? 'w-0' :
                      isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${stockHealthPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>Safety Minimum:</span>
                  <strong>{product.minStockThreshold} units</strong>
                </div>
                <div className="flex justify-between">
                  <span>Target Par:</span>
                  <strong>{parLevel} units</strong>
                </div>
              </div>
            </div>

          </div>

          {/* FINANCIALS & SUPPLIER INFO (ROLE-GATED) */}
          {canViewFinancials && (
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                <span>Commercial Terms &amp; Wholesale Margins (Restricted)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Wholesale Cost</span>
                  <span className="font-bold text-slate-900">{formatPHP(product.wholesaleCost || 3500)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Retail Selling Price</span>
                  <span className="font-extrabold text-blue-900">{formatPHP(product.price)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Gross Profit</span>
                  <span className="font-bold text-emerald-700">
                    {formatPHP(product.price - (product.wholesaleCost || 3500))}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Primary Supplier</span>
                  <span className="font-sans text-slate-700 truncate block">
                    {product.supplier || 'Michelin Logistics Hub'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* QUICK OPERATIONAL WORKFLOW ACTIONS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fast Inventory Actions for this SKU:
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenIntake(product);
                }}
                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
              >
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                <span>+ Stock Intake</span>
              </button>

              <button
                type="button"
                disabled={product.stock === 0}
                onClick={() => {
                  onClose();
                  onOpenDispatch(product);
                }}
                className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors disabled:opacity-40"
              >
                <ArrowUpRight className="w-5 h-5 text-blue-600" />
                <span>- Bay Dispatch</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCycleCount(product);
                }}
                className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 font-bold text-xs flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
              >
                <ClipboardCheck className="w-5 h-5 text-purple-600" />
                <span>Cycle Count Audit</span>
              </button>
            </div>
          </div>

          {/* IMMUTABLE STOCK MOVEMENT TIMELINE PER SKU */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Historical Movement Timeline ({skuMovements.length} Records)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                Immutable Ledger
              </span>
            </div>

            {skuMovements.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
                No recorded stock movements for this tire yet today.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {skuMovements.map(m => {
                  const isIntake = m.type.includes('Intake');
                  const isDispatch = m.type.includes('Dispatch');
                  const isTransfer = m.type.includes('Transfer');
                  const isReconciliation = m.type.includes('Reconciliation');

                  return (
                    <div key={m.id} className="relative group">
                      {/* Timeline Node Icon */}
                      <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${
                        isIntake ? 'bg-emerald-500 text-white' :
                        isDispatch ? 'bg-blue-500 text-white' :
                        isTransfer ? 'bg-purple-500 text-white' :
                        isReconciliation ? 'bg-amber-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {isIntake ? '↓' : isDispatch ? '↑' : isTransfer ? '⇄' : '✓'}
                      </div>

                      <div className="bg-slate-50 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 transition-colors space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isIntake ? 'bg-emerald-100 text-emerald-800' :
                              isDispatch ? 'bg-blue-100 text-blue-800' :
                              isTransfer ? 'bg-purple-100 text-purple-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {m.type}
                            </span>
                            <span className="text-xs font-mono font-extrabold text-slate-900">
                              {isIntake ? `+${m.quantity}` : `-${m.quantity}`} Units
                            </span>
                            {m.workOrderRef && (
                              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">
                                {m.workOrderRef}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] font-mono text-slate-400">
                            {m.timestamp} &bull; {m.id}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 font-medium">
                          Route: <strong className="text-slate-800">{m.sourceLocation}</strong> &rarr; <strong className="text-blue-700">{m.destinationLocation}</strong>
                        </div>

                        <div className="text-[11px] text-slate-500 italic">
                          "{m.notes}"
                        </div>

                        <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                          <span>Operator: {m.performedBy}</span>
                          <span className="uppercase text-[9px] bg-slate-200/80 px-1.5 py-0.2 rounded font-bold text-slate-600">
                            {m.role.replace('ROLE_', '')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
