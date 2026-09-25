import React, { useState } from 'react';
import { TireProduct, StaffRole, STAFF_PROFILES } from '../data';
import {
  ArrowDownLeft,
  Barcode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Printer,
  Sparkles,
  Search,
  Check,
  RotateCcw,
  Layers,
  ChevronRight,
  Info,
  Calendar
} from 'lucide-react';

interface StockIntakeWizardProps {
  products: TireProduct[];
  isOpen: boolean;
  onClose: () => void;
  activeRole: StaffRole;
  onConfirmIntake: (product: TireProduct, quantity: number, bin: string, dotCode: string) => void;
}

export const StockIntakeWizard: React.FC<StockIntakeWizardProps> = ({
  products,
  isOpen,
  onClose,
  activeRole,
  onConfirmIntake
}) => {
  const currentProfile = STAFF_PROFILES[activeRole];

  // Wizard Step: 1 = Scan/Identify, 2 = Qty/Batch/Bin, 3 = Confirmation & Label Print
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Selected Product & Barcode Detection
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<TireProduct | null>(products[0]);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [manualSearch, setManualSearch] = useState<string>('');

  // Step 2 Form Values
  const [quantity, setQuantity] = useState<number>(4);
  const [dotWeek, setDotWeek] = useState<string>('14');
  const [dotYear, setDotYear] = useState<string>('26');
  const [selectedBin, setSelectedBin] = useState<string>(products[0].binLocation);

  // Step 3 Thermal Label Print Preview State
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printSuccess, setPrintSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Barcode quick match
  const handleBarcodeScan = (code: string) => {
    setScannedBarcode(code);
    const matched = products.find(p => p.barcode === code);
    if (matched) {
      setSelectedProduct(matched);
      setSelectedBin(matched.binLocation);
    }
  };

  // DOT Code Freshness Warning Check
  const dotFullCode = `DOT ${dotWeek}${dotYear}`;
  const yearNum = parseInt(dotYear, 10);
  // Assume current year is 26 (2026). If year < 23 (2023), that's >3 years old!
  const isDotOld = !isNaN(yearNum) && yearNum < 24;

  const handleNextToStep2 = () => {
    if (!selectedProduct) return;
    setCurrentStep(2);
  };

  const handleNextToStep3 = () => {
    setCurrentStep(3);
  };

  const handleExecuteIntake = () => {
    if (!selectedProduct) return;
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setPrintSuccess(true);
      setTimeout(() => {
        onConfirmIntake(selectedProduct, quantity, selectedBin, dotFullCode);
        onClose();
        // Reset
        setCurrentStep(1);
        setPrintSuccess(false);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* WIZARD HEADER & STEP PROGRESS BAR */}
        <div className="bg-slate-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                  Zero-Training Intake Wizard
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Stock Check-In &amp; Receiving
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
              currentStep >= 1 ? 'bg-emerald-500' : 'bg-slate-700'
            }`} />
            <div className={`h-1.5 rounded-full transition-all ${
              currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-700'
            }`} />
            <div className={`h-1.5 rounded-full transition-all ${
              currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-700'
            }`} />
          </div>

          <div className="flex justify-between text-[10px] font-mono font-bold mt-1.5 text-slate-400 uppercase">
            <span className={currentStep === 1 ? 'text-emerald-400' : ''}>1. Scan &amp; Identify</span>
            <span className={currentStep === 2 ? 'text-emerald-400' : ''}>2. Qty &amp; Shelf Bin</span>
            <span className={currentStep === 3 ? 'text-emerald-400' : ''}>3. Print Labels &amp; Save</span>
          </div>
        </div>

        {/* STEP 1: SCAN & IDENTIFY ITEM */}
        {currentStep === 1 && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Camera Viewfinder Simulation */}
            <div className="relative rounded-2xl bg-slate-950 border-2 border-slate-800 p-4 overflow-hidden text-center">
              {/* Laser Scanning Line Animation */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce top-1/2 -translate-y-1/2 pointer-events-none opacity-80" />

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-3">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <Camera className="w-3.5 h-3.5" />
                  <span>CAMERA / SCANNER ACTIVE</span>
                </div>
                <span>60 FPS &bull; AUTO-FOCUS</span>
              </div>

              {/* Viewfinder Target Box */}
              <div className="border-2 border-dashed border-emerald-500/60 rounded-2xl py-6 px-4 bg-emerald-950/20 max-w-sm mx-auto">
                <Barcode className="w-16 h-16 text-emerald-400 mx-auto opacity-80" />
                <p className="text-xs text-slate-300 font-bold mt-2">
                  Position tread barcode sticker in viewfinder
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  Compatible with physical USB / Bluetooth scanner guns or phone camera.
                </p>
              </div>

              {/* Quick Barcode Simulator Buttons for Testing */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-left">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1.5">
                  Simulate Trigger Scan (Click to test instant lookup):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {products.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleBarcodeScan(p.barcode)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                        selectedProduct?.id === p.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {p.brand} ({p.barcode.slice(-4)})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Identified Tire Card with Photo and Spec */}
            {selectedProduct && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-emerald-200 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Item Identified Successfully</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {selectedProduct.brand} {selectedProduct.model}
                    </h4>
                    <div className="font-mono text-xs font-bold text-slate-700 mt-0.5">
                      {selectedProduct.specCode} &bull; {selectedProduct.category}
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Current Shelf Stock</div>
                    <div className="text-lg font-extrabold text-slate-900">{selectedProduct.stock} Units</div>
                    <div className="text-[11px] text-blue-700 font-bold flex items-center sm:justify-end gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{selectedProduct.binLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center justify-between">
                  <span className="text-xs text-emerald-900 font-medium">
                    Barcode Verified: <strong className="font-mono">{selectedProduct.barcode}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleNextToStep2}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>Yes, Physical Tire Matches</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Manual SKU Lookup fallback */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Or select item manually (if label is torn or unreadable)
              </label>
              <select
                value={selectedProduct?.id || ''}
                onChange={e => {
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) {
                    setSelectedProduct(p);
                    setSelectedBin(p.binLocation);
                  }
                }}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-emerald-600"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.brand} {p.model} - {p.specCode} ({p.binLocation})
                  </option>
                ))}
              </select>
            </div>

          </div>
        )}

        {/* STEP 2: QUANTITY, DOT BATCH & SHELF BIN */}
        {currentStep === 2 && selectedProduct && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Selected Product Pill */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900">{selectedProduct.brand} {selectedProduct.model}</span>
                <span className="text-slate-500 ml-2 font-mono">{selectedProduct.specCode}</span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
              >
                Change Item
              </button>
            </div>

            {/* Large Zero-Training Quantity Stepper */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                1. Arriving Physical Quantity (+ Units)
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-2xl font-black flex items-center justify-center cursor-pointer transition-all border border-slate-200"
                >
                  -
                </button>
                <div className="flex-1 h-14 bg-slate-50 border-2 border-slate-300 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-black font-mono text-slate-900">{quantity}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase ml-2">Tires</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-2xl font-black flex items-center justify-center cursor-pointer transition-all border border-slate-200"
                >
                  +
                </button>
              </div>

              {/* Fast Pallet & Set Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => setQuantity(4)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    quantity === 4
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  +4 (1 Set)
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(8)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    quantity === 8
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  +8 (2 Sets)
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(16)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    quantity === 16
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  +16 (Pallet)
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(24)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    quantity === 24
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  +24 (Fleet)
                </button>
              </div>
            </div>

            {/* DOT Batch Freshness Mask */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. Manufacturing DOT Code (Week / Year)</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">e.g. 1426 = Week 14, 2026</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-20 h-11 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center font-mono font-bold text-slate-500 text-xs">
                  DOT
                </div>
                <input
                  type="text"
                  maxLength={2}
                  value={dotWeek}
                  onChange={e => setDotWeek(e.target.value.replace(/\D/g, ''))}
                  placeholder="WW"
                  className="w-20 h-11 text-center font-mono font-bold text-base bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
                <span className="font-bold text-slate-400">/</span>
                <input
                  type="text"
                  maxLength={2}
                  value={dotYear}
                  onChange={e => setDotYear(e.target.value.replace(/\D/g, ''))}
                  placeholder="YY"
                  className="w-20 h-11 text-center font-mono font-bold text-base bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
                <div className="flex-1 text-right text-xs font-mono font-bold text-slate-700">
                  Formatted: <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">{dotFullCode}</span>
                </div>
              </div>

              {/* Old DOT Alert Safeguard */}
              {isDotOld && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start space-x-2.5 text-xs text-amber-900 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Tire Freshness Advisory (&gt;3 Years Old)</span>
                    Manufacturing year 20{dotYear} exceeds standard warehouse freshness threshold. Please verify with supervisor before shelf stocking.
                  </div>
                </div>
              )}
            </div>

            {/* Storage Shelf Bin Selection */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                3. Physical Warehouse Storage Bin
              </label>
              <select
                value={selectedBin}
                onChange={e => setSelectedBin(e.target.value)}
                className="w-full h-12 px-3.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 outline-none cursor-pointer focus:border-emerald-600 focus:bg-white"
              >
                <option value="RACK-A-01">RACK-A-01 (Ground Level &bull; Passenger Sedans)</option>
                <option value="RACK-A-02">RACK-A-02 (Ground Level &bull; Compact Cars)</option>
                <option value="RACK-B-04">RACK-B-04 (Level 2 &bull; Heavy SUV All-Terrain)</option>
                <option value="RACK-C-01">RACK-C-01 (Level 3 &bull; Ultra-High Performance)</option>
                <option value="RACK-C-02">RACK-C-02 (Level 3 &bull; Touring Radial)</option>
                <option value="PALLET-P-03">PALLET-P-03 (Receiving Dock &bull; Commercial Staging)</option>
              </select>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                &larr; Back to Scan
              </button>
              <button
                type="button"
                onClick={handleNextToStep3}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Review &amp; Print Tread Labels</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: CONFIRMATION & THERMAL TREAD LABEL PRINTING */}
        {currentStep === 3 && selectedProduct && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Printable Thermal Tread Sticker Preview (100mm x 50mm layout) */}
            <div className="text-center">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-400">
                Printable Thermal Tread Label Simulation (Dispenses on Zebra / Honeywell)
              </span>

              <div className="mt-2.5 mx-auto max-w-sm bg-white border-2 border-dashed border-slate-400 rounded-2xl p-4 shadow-lg text-left text-slate-900 font-sans relative overflow-hidden">
                {/* Header Logo */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2">
                  <div className="font-black tracking-tighter text-xs">SUPERBDEAL CORP</div>
                  <div className="text-[9px] font-mono font-bold bg-black text-white px-1.5 py-0.2 rounded">
                    QC CENTRAL HUB
                  </div>
                </div>

                {/* Tire Specs */}
                <div className="text-sm font-black uppercase leading-tight">
                  {selectedProduct.brand} {selectedProduct.model}
                </div>
                <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">
                  SIZE: {selectedProduct.specCode}
                </div>

                {/* Barcode Strip Graphic */}
                <div className="my-2 bg-slate-100 p-2 rounded text-center">
                  <div className="font-mono tracking-widest text-lg font-bold text-slate-900">
                    ||| | |||| | || ||||| | |||
                  </div>
                  <div className="font-mono text-[10px] text-slate-600 mt-0.5">
                    {selectedProduct.barcode} &bull; {selectedProduct.id}
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono border-t border-slate-300 pt-1.5">
                  <div>
                    <span className="text-slate-500">BATCH: </span>
                    <span className="font-bold">{dotFullCode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">BIN: </span>
                    <span className="font-bold text-blue-800">{selectedBin}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">OP: </span>
                    <span className="font-bold">{currentProfile.badgeCode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">DATE: </span>
                    <span className="font-bold">2026-09-24</span>
                  </div>
                </div>

                {/* Quantity Badge */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-600 text-white font-mono font-extrabold text-xs flex items-center justify-center shadow-xs">
                  x{quantity}
                </div>
              </div>
            </div>

            {/* Summary details */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold text-sm">Summary of Inbound Receiving:</div>
              <div>&bull; Adding <strong>+{quantity} tires</strong> of <strong>{selectedProduct.brand} {selectedProduct.model}</strong></div>
              <div>&bull; Destination Shelf: <strong>{selectedBin}</strong> (Previous: {selectedProduct.stock} &rarr; New: <strong>{selectedProduct.stock + quantity} units</strong>)</div>
              <div>&bull; Operator: <strong>{currentProfile.name} ({currentProfile.title})</strong></div>
            </div>

            {/* Final Action Buttons */}
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
                disabled={isPrinting}
                onClick={handleExecuteIntake}
                className="flex-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isPrinting ? (
                  <>
                    <Printer className="w-4 h-4 animate-spin" />
                    <span>Printing {quantity}x Tread Labels &amp; Saving...</span>
                  </>
                ) : printSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Intake Recorded Successfully!</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Confirm Intake &amp; Print Labels ({quantity}x)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
