import React, { useState, useEffect } from 'react';
import { TireProduct, StaffRole, STAFF_PROFILES, ReleaseNotification } from '../data';
import {
  ArrowUpRight,
  Barcode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Wrench,
  Car,
  Check,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  Clock,
  Sparkles,
  RefreshCw,
  Flame
} from 'lucide-react';

export interface ActiveJobOrder {
  id: string;
  bayName: string;
  plateNumber: string;
  vehicleModel: string;
  customerName: string;
  requiredProductSku: string;
  requiredQuantity: number;
  ticketId?: string;
  urgency?: string;
  binLocation?: string;
}

const SAMPLE_JOB_ORDERS: ActiveJobOrder[] = [
  {
    id: 'JOB-QC-104',
    bayName: 'Bay 1 (Hunter 3D Hawkeye)',
    plateNumber: 'NCF 8840',
    vehicleModel: 'Toyota Fortuner 2.8 V',
    customerName: 'Atty. Marco Valderrama',
    requiredProductSku: 'SKU-003', // Yokohama Geolandar A/T G015
    requiredQuantity: 4
  },
  {
    id: 'JOB-QC-108',
    bayName: 'Bay 2 (Road Force Mounting)',
    plateNumber: 'NBB 1024',
    vehicleModel: 'Mitsubishi Montero Sport',
    customerName: 'Capt. Nestor Ramos',
    requiredProductSku: 'SKU-001', // Michelin Primacy 4 ST
    requiredQuantity: 4
  },
  {
    id: 'ORD-9920',
    bayName: 'Front Counter Pickup',
    plateNumber: 'WALK-IN',
    vehicleModel: 'Honda City 1.5 RS',
    customerName: 'Engr. Ronald Velasco',
    requiredProductSku: 'SKU-005', // Continental UltraContact UC6
    requiredQuantity: 2
  }
];

interface StockDispatchWizardProps {
  products: TireProduct[];
  isOpen: boolean;
  onClose: () => void;
  activeRole: StaffRole;
  onConfirmDispatch: (
    product: TireProduct,
    quantity: number,
    targetDestination: string,
    workOrderRef: string,
    ticketId?: string
  ) => void;
  activeTickets?: ReleaseNotification[];
  preselectedTicketId?: string | null;
}

export const StockDispatchWizard: React.FC<StockDispatchWizardProps> = ({
  products,
  isOpen,
  onClose,
  activeRole,
  onConfirmDispatch,
  activeTickets,
  preselectedTicketId
}) => {
  const currentProfile = STAFF_PROFILES[activeRole];

  // Dynamic ticket list derived from real operations queue
  const availableJobs: ActiveJobOrder[] = (activeTickets && activeTickets.length > 0)
    ? activeTickets
        .filter(t => t.status === 'PENDING_RELEASE')
        .map(t => ({
          id: t.refId || t.id,
          bayName: t.bayName || 'Shop Service Bay',
          plateNumber: t.plateNumber,
          vehicleModel: t.vehicleModel,
          customerName: t.customerName,
          requiredProductSku: t.productSku,
          requiredQuantity: t.quantity,
          ticketId: t.id,
          urgency: t.urgency,
          binLocation: t.binLocation
        }))
    : SAMPLE_JOB_ORDERS;

  // Find initial job
  const getInitialJob = (): ActiveJobOrder => {
    if (preselectedTicketId) {
      const match = availableJobs.find(j => j.ticketId === preselectedTicketId || j.id === preselectedTicketId);
      if (match) return match;
    }
    return availableJobs[0] || SAMPLE_JOB_ORDERS[0];
  };

  // Wizard Steps: 1 = Select Job/Destination, 2 = Barcode Verification (Poka-Yoke), 3 = Handover Sign-off
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(preselectedTicketId ? 2 : 1);

  // Selected Target Job
  const [selectedJob, setSelectedJob] = useState<ActiveJobOrder>(getInitialJob);

  useEffect(() => {
    if (isOpen) {
      const target = getInitialJob();
      setSelectedJob(target);
      setCurrentStep(preselectedTicketId ? 2 : 1);
      setScannedTires([]);
      setMismatchError(null);
    }
  }, [isOpen, preselectedTicketId]);

  // Scanned tires counter & tracking
  const [scannedTires, setScannedTires] = useState<string[]>([]);
  const [mismatchError, setMismatchError] = useState<{
    scannedProduct: TireProduct;
    expectedProduct: TireProduct;
  } | null>(null);

  if (!isOpen) return null;

  // Resolve products
  const targetProduct = products.find(p => p.id === selectedJob.requiredProductSku) || products[0];

  // Handle Scan Verification
  const handleScanTire = (scannedSku: string) => {
    const scannedProd = products.find(p => p.id === scannedSku || p.barcode === scannedSku);
    if (!scannedProd) return;

    // Poka-Yoke Mismatch Check!
    if (scannedProd.id !== targetProduct.id) {
      setMismatchError({
        scannedProduct: scannedProd,
        expectedProduct: targetProduct
      });
      return;
    }

    // Match Success: add serialized tire unit
    if (scannedTires.length < selectedJob.requiredQuantity) {
      const serial = `SN-${scannedProd.brand.slice(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}-0${scannedTires.length + 1}`;
      setScannedTires(prev => [...prev, serial]);
    }
  };

  const handleSimulateQuickScanAll = () => {
    const fullSerials = Array.from({ length: selectedJob.requiredQuantity }).map((_, i) =>
      `SN-${targetProduct.brand.slice(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}-0${i + 1}`
    );
    setScannedTires(fullSerials);
  };

  const isScanComplete = scannedTires.length >= selectedJob.requiredQuantity;

  const handleExecuteDispatch = () => {
    onConfirmDispatch(
      targetProduct,
      selectedJob.requiredQuantity,
      selectedJob.bayName,
      selectedJob.id,
      selectedJob.ticketId
    );
    onClose();
    // Reset state
    setCurrentStep(1);
    setScannedTires([]);
    setMismatchError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* WIZARD HEADER & STEP PROGRESS BAR */}
        <div className="bg-slate-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase font-extrabold tracking-wider text-blue-400">
                  Zero-Training Dispatch Wizard
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Stock Handover &amp; Service Bay Dispatch
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className={`h-1.5 rounded-full transition-all ${
              currentStep >= 1 ? 'bg-blue-500' : 'bg-slate-700'
            }`} />
            <div className={`h-1.5 rounded-full transition-all ${
              currentStep >= 2 ? 'bg-blue-500' : 'bg-slate-700'
            }`} />
            <div className={`h-1.5 rounded-full transition-all ${
              currentStep >= 3 ? 'bg-blue-500' : 'bg-slate-700'
            }`} />
          </div>

          <div className="flex justify-between text-[10px] font-mono font-bold mt-1.5 text-slate-400 uppercase">
            <span className={currentStep === 1 ? 'text-blue-400' : ''}>1. Select Target Job</span>
            <span className={currentStep === 2 ? 'text-blue-400' : ''}>2. Scan Physical Tires</span>
            <span className={currentStep === 3 ? 'text-blue-400' : ''}>3. Handover Sign-off</span>
          </div>
        </div>

        {/* STEP 1: SELECT WORK ORDER OR DESTINATION */}
        {currentStep === 1 && (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600" />
                <span>Select Target Work Order / Vehicle on Floor</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Picking a job automatically sets the exact tire model, bin location, and quantity required, preventing manual typos.
              </p>
            </div>

            <div className="space-y-2.5">
              {availableJobs.map(job => {
                const prod = products.find(p => p.id === job.requiredProductSku);
                const isSelected = selectedJob.id === job.id;
                const isUrgent = job.urgency === 'URGENT_IN_BAY';

                return (
                  <button
                    key={job.ticketId || job.id}
                    type="button"
                    onClick={() => {
                      setSelectedJob(job);
                      setScannedTires([]);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-300 shadow-xs'
                        : isUrgent
                        ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-slate-900">{job.bayName}</span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                            {job.id}
                          </span>
                          {isUrgent && (
                            <span className="text-[10px] font-mono font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <Flame className="w-3 h-3" />
                              Urgent: In Bay
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 font-medium">
                          Plate: <strong className="font-mono text-slate-900">{job.plateNumber}</strong> &bull; {job.vehicleModel} ({job.customerName})
                        </div>
                      </div>

                      <div className="sm:text-right font-mono">
                        <span className="text-xs font-black text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-300 inline-block">
                          Requires {job.requiredQuantity}x {prod?.brand} {prod?.model}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium flex items-center sm:justify-end gap-1">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>Rack Bin: <strong className="text-slate-800 font-bold">{job.binLocation || prod?.binLocation}</strong></span>
                          <span>&bull;</span>
                          <span>In Stock: {prod?.stock} units</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <span>Proceed to Barcode Scan Verification</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PHYSICAL TIRE BARCODE VERIFICATION (POKA-YOKE) */}
        {currentStep === 2 && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Job Target Banner */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600">Active Handover Target:</span>
                <div className="font-black text-slate-900 text-sm">{selectedJob.bayName} &bull; {selectedJob.plateNumber}</div>
                <div className="text-slate-600 mt-0.5">
                  Vehicle: <strong>{selectedJob.vehicleModel}</strong> ({selectedJob.customerName})
                </div>
              </div>

              <div className="sm:text-right font-mono">
                <div className="text-[10px] uppercase font-bold text-slate-500">Pick from Shelf Rack:</div>
                <div className="text-sm font-extrabold text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-300 inline-block">
                  {targetProduct.binLocation}
                </div>
              </div>
            </div>

            {/* Expected Product Callout */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Required Tire:</span>
                <div className="font-bold text-slate-900 text-sm">{targetProduct.brand} {targetProduct.model}</div>
                <div className="text-xs text-slate-600 font-mono">{targetProduct.specCode}</div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400">Barcode to Match:</span>
                <div className="text-xs font-bold text-slate-900">{targetProduct.barcode}</div>
              </div>
            </div>

            {/* Scanner Progress Checklist */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-blue-400 font-bold uppercase flex items-center gap-1.5">
                  <Barcode className="w-4 h-4" />
                  <span>Physical Scan Verification Progress</span>
                </span>
                <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {scannedTires.length} of {selectedJob.requiredQuantity} Scanned
                </span>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: selectedJob.requiredQuantity }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 rounded-full transition-all ${
                      i < scannedTires.length ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Scanned Serial List */}
              <div className="space-y-1.5 pt-1">
                {scannedTires.map((sn, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-emerald-400">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Unit #{idx + 1}: {sn}</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">Tire Tread Verified</span>
                  </div>
                ))}
                {scannedTires.length < selectedJob.requiredQuantity && (
                  <div className="text-xs font-mono text-slate-400 italic text-center py-1">
                    &gt;&gt; Ready to scan tire #{scannedTires.length + 1} barcode...
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Scanner Simulator Controls */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                Simulate Laser Trigger (Click to test scanning):
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Correct tire button */}
                <button
                  type="button"
                  disabled={isScanComplete}
                  onClick={() => handleScanTire(targetProduct.id)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 disabled:opacity-40"
                >
                  <Barcode className="w-3.5 h-3.5" />
                  <span>Scan Correct Tire ({targetProduct.brand})</span>
                </button>

                {/* Intentional Mismatch Error Trigger to test Poka-Yoke */}
                <button
                  type="button"
                  onClick={() => {
                    const wrongTire = products.find(p => p.id !== targetProduct.id) || products[1];
                    handleScanTire(wrongTire.id);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                  title="Test what happens if intern accidentally grabs the wrong tire model"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Test Scan Wrong Tire (Trigger Mistake Interceptor)</span>
                </button>

                {/* Quick scan all */}
                <button
                  type="button"
                  onClick={handleSimulateQuickScanAll}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer ml-auto"
                >
                  ⚡ Fast Scan All 4 Tires
                </button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                &larr; Back to Job
              </button>
              <button
                type="button"
                disabled={!isScanComplete}
                onClick={() => setCurrentStep(3)}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>All {selectedJob.requiredQuantity} Tires Verified &rarr; Next</span>
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: HANDOVER SIGN-OFF & BAY DISPATCH COMMIT */}
        {currentStep === 3 && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                Ready for Service Bay Handover
              </h4>
              <p className="text-xs text-slate-500">
                All {selectedJob.requiredQuantity} physical tires have been verified with zero barcode mismatches.
              </p>
            </div>

            {/* Dispatch Conforme Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Target Vehicle:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedJob.plateNumber} ({selectedJob.vehicleModel})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Service Destination:</span>
                <span className="font-bold text-blue-700">{selectedJob.bayName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Dispatched SKU:</span>
                <span className="font-bold text-slate-900">
                  {selectedJob.requiredQuantity}x {targetProduct.brand} {targetProduct.model} ({targetProduct.specCode})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Shelf Source:</span>
                <span className="font-mono font-bold text-slate-700">{targetProduct.binLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Handover Authorized By:</span>
                <span className="font-bold text-emerald-700">
                  {currentProfile.name} &bull; {currentProfile.badgeCode}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={handleExecuteDispatch}
                className="flex-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Complete Handover &amp; Release Tires to Bay</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* POKA-YOKE BARCODE MISMATCH HARD-LOCK MODAL */}
      {mismatchError && (
        <div className="fixed inset-0 z-60 bg-red-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border-4 border-red-600 shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full font-mono text-xs font-black uppercase tracking-wider mb-2">
              ⛔ Poka-Yoke Mismatch Trap Triggered
            </div>

            <h3 className="text-lg font-black text-slate-900">
              WRONG TIRE SCANNED!
            </h3>

            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              The tire barcode scanned does not match the active service bay job requirements. Dispatch is locked to prevent incorrect mounting.
            </p>

            {/* Comparison Box */}
            <div className="mt-4 p-3 bg-red-50 rounded-2xl border border-red-200 text-left text-xs space-y-2">
              <div className="text-red-800">
                <span className="font-mono text-[10px] uppercase font-bold text-red-500 block">
                  You Scanned (Incorrect):
                </span>
                <strong className="text-sm text-red-900 block">
                  {mismatchError.scannedProduct.brand} {mismatchError.scannedProduct.model}
                </strong>
                <span className="font-mono text-xs font-bold text-red-700">
                  {mismatchError.scannedProduct.specCode} &bull; Barcode: {mismatchError.scannedProduct.barcode}
                </span>
              </div>

              <div className="border-t border-red-200 pt-2 text-slate-800">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">
                  This Job Requires:
                </span>
                <strong className="text-sm text-slate-900 block">
                  {mismatchError.expectedProduct.brand} {mismatchError.expectedProduct.model}
                </strong>
                <span className="font-mono text-xs font-bold text-blue-700">
                  {mismatchError.expectedProduct.specCode} &bull; Shelf: {mismatchError.expectedProduct.binLocation}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setMismatchError(null)}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Dismiss &amp; Scan Correct Tire ({mismatchError.expectedProduct.brand})</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
