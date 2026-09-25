import React, { useState } from 'react';
import { TireProduct, StaffRole, STAFF_PROFILES, StockMovementRecord } from '../data';
import { formatPHP } from '../utils';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  MapPin,
  X,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Check,
  Building,
  Layers,
  HelpCircle
} from 'lucide-react';

interface CycleCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: TireProduct[];
  initialProduct?: TireProduct;
  activeRole: StaffRole;
  onConfirmReconciliation: (
    product: TireProduct,
    countedQty: number,
    variance: number,
    reason: string,
    notes: string
  ) => void;
}

export const CycleCountModal: React.FC<CycleCountModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProduct,
  activeRole,
  onConfirmReconciliation
}) => {
  if (!isOpen) return null;

  const currentProfile = STAFF_PROFILES[activeRole];
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || products[0]?.id || ''
  );

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Count states
  const systemStock = selectedProduct ? selectedProduct.stock : 0;
  const [countedQty, setCountedQty] = useState<number>(systemStock);
  const [discrepancyReason, setDiscrepancyReason] = useState<string>(
    'Unrecorded bay installation handover'
  );
  const [auditNotes, setAuditNotes] = useState<string>('');
  const [blindCountMode, setBlindCountMode] = useState<boolean>(false);

  // Variance calculation
  const variance = countedQty - systemStock; // e.g. -2 or +1 or 0
  const financialImpact = Math.abs(variance) * selectedProduct.price;

  const isIntern = activeRole === 'ROLE_INTERN';
  const isClerk = activeRole === 'ROLE_CLERK';
  const isManager = activeRole === 'ROLE_MANAGER' || activeRole === 'ROLE_ADMIN';

  const requiresSupervisorSignoff = Math.abs(variance) > 2 && isClerk;

  const handleAdjustCount = (delta: number) => {
    setCountedQty(prev => Math.max(0, prev + delta));
  };

  const handleSelectProduct = (newId: string) => {
    setSelectedProductId(newId);
    const prod = products.find(p => p.id === newId);
    if (prod) {
      setCountedQty(prod.stock);
    }
  };

  const handleExecuteReconciliation = () => {
    onConfirmReconciliation(
      selectedProduct,
      countedQty,
      variance,
      variance !== 0 ? discrepancyReason : 'Exact Physical Match Verified',
      auditNotes || (variance === 0 ? 'Cycle count matched ledger perfectly.' : `Adjusted inventory by ${variance > 0 ? '+' : ''}${variance} units.`)
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  Physical Inventory Cycle Count &amp; Reconciliation
                </h3>
                <span className="text-[10px] font-mono bg-purple-900/70 text-purple-300 border border-purple-700 px-2 py-0.5 rounded font-bold">
                  Poka-Yoke Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical rack count verification with variance analysis and ledger reconciliation.
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

        {/* MODAL CONTENT */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* SKU SELECTION DROPDOWN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Tire SKU to Count on Physical Rack:
            </label>
            <select
              value={selectedProductId}
              onChange={e => handleSelectProduct(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-purple-600 focus:bg-white cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.model} ({p.specCode}) — {p.binLocation} [System: {p.stock} units]
                </option>
              ))}
            </select>
          </div>

          {/* TARGET PRODUCT SNAPSHOT CARD */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {selectedProduct.brand} {selectedProduct.model}
                </span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                  {selectedProduct.id}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                Spec: {selectedProduct.specCode} &bull; Barcode: {selectedProduct.barcode}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-blue-900 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{selectedProduct.binLocation}</span>
              </div>
            </div>
          </div>

          {/* STEP 2: PHYSICAL COUNT INTERACTION */}
          <div className="bg-purple-50/60 rounded-2xl p-5 border border-purple-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-purple-950 uppercase tracking-wider block">
                  Physical Tires Counted on Rack Shelf
                </span>
                <span className="text-[11px] text-purple-700">
                  Walk to <strong>{selectedProduct.binLocation}</strong> and count physical tires.
                </span>
              </div>

              {/* Blind Count Mode Toggle */}
              <button
                type="button"
                onClick={() => setBlindCountMode(!blindCountMode)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                  blindCountMode
                    ? 'bg-purple-600 text-white border-purple-700'
                    : 'bg-white text-purple-800 border-purple-300 hover:bg-purple-100'
                }`}
              >
                {blindCountMode ? 'Blind Audit Mode: ON' : 'Blind Audit: OFF'}
              </button>
            </div>

            {/* COUNT CONTROLLER */}
            <div className="flex items-center justify-center space-x-4 py-2">
              <button
                type="button"
                onClick={() => handleAdjustCount(-1)}
                className="w-12 h-12 rounded-2xl bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 font-extrabold text-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                -
              </button>

              <div className="w-32 text-center">
                <input
                  type="number"
                  value={countedQty}
                  onChange={e => setCountedQty(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center text-4xl font-extrabold font-mono text-purple-950 bg-transparent outline-none border-b-2 border-purple-400 focus:border-purple-700 pb-1"
                />
                <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block mt-1">
                  Physical Units
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAdjustCount(1)}
                className="w-12 h-12 rounded-2xl bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 font-extrabold text-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                +
              </button>
            </div>

            {/* QUICK STEPPER PRESETS (+4 car set, +10 pallet layer) */}
            <div className="flex items-center justify-center space-x-2 pt-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleAdjustCount(4)}
                className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg font-bold cursor-pointer"
              >
                +4 (1 Set)
              </button>
              <button
                type="button"
                onClick={() => handleAdjustCount(8)}
                className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg font-bold cursor-pointer"
              >
                +8 (2 Sets)
              </button>
              <button
                type="button"
                onClick={() => handleAdjustCount(12)}
                className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg font-bold cursor-pointer"
              >
                +12 (Pallet)
              </button>
              <button
                type="button"
                onClick={() => setCountedQty(systemStock)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-lg font-bold cursor-pointer flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Match System</span>
              </button>
            </div>
          </div>

          {/* STEP 3: VARIANCE TELEMETRY & ROOT CAUSE EXPLANATION */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">System Ledger</span>
                <span className="text-lg font-extrabold font-mono text-slate-800">
                  {blindCountMode ? '***' : `${systemStock} Units`}
                </span>
              </div>

              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                <span className="text-[10px] text-purple-700 font-bold uppercase block">Counted Physical</span>
                <span className="text-lg font-extrabold font-mono text-purple-900">
                  {countedQty} Units
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${
                variance === 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : variance > 0
                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}>
                <span className="text-[10px] font-bold uppercase block">Variance Discrepancy</span>
                <span className="text-lg font-extrabold font-mono">
                  {variance > 0 ? `+${variance}` : variance} Units
                </span>
              </div>
            </div>

            {/* VARIANCE FEEDBACK BANNER */}
            {variance === 0 ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-3 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-extrabold block">Perfect Reconciliation Match</span>
                  Physical shelf count exactly matches ledger record. No stock write-off required.
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-amber-900">
                <div className="flex items-start space-x-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-extrabold block">
                      Inventory Discrepancy Detected ({variance > 0 ? `Surplus of +${variance}` : `Shortfall of ${variance}`} Units)
                    </span>
                    Financial impact: <strong>{formatPHP(financialImpact)}</strong> retail value difference.
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-950 uppercase tracking-wide mt-2 mb-1">
                    Select Mandatory Root Cause Category:
                  </label>
                  <select
                    value={discrepancyReason}
                    onChange={e => setDiscrepancyReason(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Unrecorded bay installation handover">
                      Unrecorded bay installation handover (mechanic pulled without ticket)
                    </option>
                    <option value="PO inbound pallet receiving count mistake">
                      PO inbound pallet receiving count mistake from supplier
                    </option>
                    <option value="Bin misplacement (tires placed in adjacent rack)">
                      Bin misplacement (tires placed in adjacent rack)
                    </option>
                    <option value="Damaged / defective tire discarded without ticket">
                      Damaged / defective tire discarded without ticket
                    </option>
                    <option value="Customer reservation return un-stocked">
                      Customer reservation return un-stocked
                    </option>
                    <option value="Suspected shrinkage / unaccounted shortfall">
                      Suspected shrinkage / unaccounted shortfall
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* AUDIT EXPLANATION NOTES */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Audit Notes &amp; Inspector Sign-Off:
              </label>
              <textarea
                value={auditNotes}
                onChange={e => setAuditNotes(e.target.value)}
                placeholder="e.g. Conducted morning physical shelf sweep. Inspected Bay 1 & Bay 2 staging racks to verify no stray unmounted tires."
                rows={2}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>

            {/* SUPERVISOR GATE WARNING (FOR CLERKS WHEN VARIANCE IS HIGH) */}
            {requiresSupervisorSignoff && (
              <div className="p-3 bg-purple-50 border border-purple-300 rounded-xl text-xs text-purple-900 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Supervisor Verification Flagged:</span>
                  Variance exceeds 2 units. This reconciliation will be tagged for Branch Manager review on the audit ledger.
                </div>
              </div>
            )}

          </div>

          {/* MODAL FOOTER */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] font-mono text-slate-500">
              Auditor: <strong className="text-slate-800">{currentProfile.name}</strong> ({currentProfile.badgeCode})
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
                onClick={handleExecuteReconciliation}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-purple-600/20 flex items-center space-x-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Reconcile Stock</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
