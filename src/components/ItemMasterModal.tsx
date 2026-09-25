import React, { useState, useEffect } from 'react';
import { TireProduct } from '../data';
import { formatPHP } from '../utils';
import {
  Package,
  Barcode,
  MapPin,
  DollarSign,
  AlertTriangle,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Archive,
  Info,
  Layers,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface ItemMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: TireProduct | null; // null means creating a brand new SKU
  onSaveProduct: (product: TireProduct) => void;
  onArchiveProduct?: (productId: string) => void;
}

export const ItemMasterModal: React.FC<ItemMasterModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
  onArchiveProduct
}) => {
  if (!isOpen) return null;

  const isEditing = !!productToEdit;

  // Form states
  const [brand, setBrand] = useState<TireProduct['brand']>(productToEdit?.brand || 'Michelin');
  const [model, setModel] = useState(productToEdit?.model || '');
  const [width, setWidth] = useState(productToEdit?.width || 205);
  const [profile, setProfile] = useState(productToEdit?.profile || 55);
  const [rim, setRim] = useState(productToEdit?.rim || 'R16');
  const [category, setCategory] = useState(productToEdit?.category || 'Passenger Car Radial (PCR)');
  const [terrain, setTerrain] = useState<TireProduct['terrain']>(productToEdit?.terrain || 'Touring');
  const [speedRating, setSpeedRating] = useState(productToEdit?.speedRating || 'V (240 km/h)');
  const [loadIndex, setLoadIndex] = useState(productToEdit?.loadIndex || '91');
  const [barcode, setBarcode] = useState(productToEdit?.barcode || '');
  const [binLocation, setBinLocation] = useState(productToEdit?.binLocation || 'RACK-A-01');
  const [stock, setStock] = useState(productToEdit?.stock ?? 12);
  const [minStockThreshold, setMinStockThreshold] = useState(productToEdit?.minStockThreshold ?? 8);
  const [parLevel, setParLevel] = useState(productToEdit?.parLevel ?? 24);
  const [wholesaleCost, setWholesaleCost] = useState(productToEdit?.wholesaleCost ?? 3500);
  const [retailPrice, setRetailPrice] = useState(productToEdit?.price ?? 4600);
  const [supplier, setSupplier] = useState(productToEdit?.supplier || 'Michelin Philippines Distribution Hub');
  const [dotBatchCode, setDotBatchCode] = useState(productToEdit?.dotBatchCode || 'DOT 1825');
  const [recommendedUse, setRecommendedUse] = useState(productToEdit?.recommendedUse || 'Passenger Sedans & Compact Vehicles');

  // Destructive Archive Confirmation Modal
  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [archiveConfirmationText, setArchiveConfirmationText] = useState('');

  // Auto-generate barcode if blank
  useEffect(() => {
    if (!barcode && !isEditing) {
      handleGenerateBarcode();
    }
  }, []);

  const handleGenerateBarcode = () => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    setBarcode(`498191${randomSuffix}`);
  };

  // Derived spec code
  const derivedSpecCode = `${width}/${profile} ${rim} ${loadIndex}${speedRating.charAt(0)}`;

  // Financial calculations
  const grossProfit = retailPrice - wholesaleCost;
  const grossMarginPercent = retailPrice > 0 ? (grossProfit / retailPrice) * 100 : 0;

  // Validation
  const isValid = model.trim().length > 0 && barcode.trim().length > 0 && retailPrice > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const savedRecord: TireProduct = {
      id: productToEdit ? productToEdit.id : `SKU-${Math.floor(100 + Math.random() * 900)}`,
      brand,
      model: model.trim(),
      specCode: derivedSpecCode,
      width: Number(width),
      profile: Number(profile),
      rim,
      price: Number(retailPrice),
      wholesaleCost: Number(wholesaleCost),
      stock: Number(stock),
      stockReserved: productToEdit?.stockReserved || 0,
      dotBatchCode,
      barcode: barcode.trim(),
      binLocation,
      category,
      minStockThreshold: Number(minStockThreshold),
      parLevel: Number(parLevel),
      terrain,
      speedRating,
      loadIndex,
      loadCapacity: `${Math.round(Number(loadIndex) * 7.2)} kg`,
      speedMax: speedRating,
      treadwear: productToEdit?.treadwear || '340 AA',
      traction: productToEdit?.traction || 'A',
      temperature: productToEdit?.temperature || 'A',
      warranty: productToEdit?.warranty || '5 Years Manufacturer Warranty',
      recommendedUse,
      supplier,
      badge: productToEdit?.badge
    };

    onSaveProduct(savedRecord);
    onClose();
  };

  const handleExecuteArchive = () => {
    if (productToEdit && onArchiveProduct && archiveConfirmationText === 'ARCHIVE') {
      onArchiveProduct(productToEdit.id);
      setIsConfirmArchiveOpen(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  {isEditing ? `Edit Item Master: ${productToEdit.brand} ${productToEdit.model}` : 'New Tire Item Master Specification'}
                </h3>
                <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700 px-2 py-0.5 rounded font-bold">
                  {isEditing ? productToEdit.id : 'SKU-NEW'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Role-gated management: configure specifications, safety par levels, storage location, and wholesale margins.
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

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* SECTION 1: TIRE BRAND & MODEL IDENTIFICATION */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Tire Brand, Model &amp; Sizing Specs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand Manufacturer <span className="text-red-500">*</span>
                </label>
                <select
                  value={brand}
                  onChange={e => setBrand(e.target.value as TireProduct['brand'])}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                >
                  <option value="Michelin">Michelin</option>
                  <option value="Bridgestone">Bridgestone</option>
                  <option value="Yokohama">Yokohama</option>
                  <option value="Goodyear">Goodyear</option>
                  <option value="Continental">Continental</option>
                  <option value="Dunlop">Dunlop</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Model Pattern Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="e.g. Primacy 4 ST, Geolandar A/T G015"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Spec Sizing Trio: Width / Profile / Rim */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Width (mm)</label>
                <input
                  type="number"
                  value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                  className="w-full h-9 px-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Aspect Ratio (%)</label>
                <input
                  type="number"
                  value={profile}
                  onChange={e => setProfile(Number(e.target.value))}
                  className="w-full h-9 px-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Rim Diameter</label>
                <input
                  type="text"
                  value={rim}
                  onChange={e => setRim(e.target.value)}
                  className="w-full h-9 px-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 uppercase"
                  placeholder="R16"
                />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Calculated Spec</label>
                <div className="h-9 px-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono font-extrabold text-blue-900 flex items-center justify-center">
                  {derivedSpecCode}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Classification</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                >
                  <option value="Passenger Car Radial (PCR)">Passenger Car Radial (PCR)</option>
                  <option value="SUV / 4x4 All-Terrain">SUV / 4x4 All-Terrain</option>
                  <option value="Commercial Light Truck / 4x4">Commercial Light Truck / 4x4</option>
                  <option value="Ultra High Performance (UHP)">Ultra High Performance (UHP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Terrain / Application</label>
                <select
                  value={terrain}
                  onChange={e => setTerrain(e.target.value as TireProduct['terrain'])}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                >
                  <option value="Touring">Touring (Quiet / Highway Comfort)</option>
                  <option value="Highway Terrain (HT)">Highway Terrain (HT)</option>
                  <option value="All-Terrain (AT)">All-Terrain (AT 50/50 On/Off-Road)</option>
                  <option value="Mud-Terrain (MT)">Mud-Terrain (MT Rugged Heavy)</option>
                  <option value="Performance">Performance (High Speed / Grip)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: BARCODE & PHYSICAL STORAGE LOCATION TAG */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Barcode className="w-3.5 h-3.5 text-blue-600" />
              <span>Barcode Tagging &amp; Warehouse Physical Bin</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    EAN-13 / Code-128 Barcode <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate New</span>
                  </button>
                </div>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    placeholder="4981910884011"
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physical Storage Bin Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={binLocation}
                    onChange={e => setBinLocation(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-900 outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="RACK-A-01">RACK-A-01 (Ground Level Fast-Moving PCR)</option>
                    <option value="RACK-A-02">RACK-A-02 (Level 2 Fast-Moving PCR)</option>
                    <option value="RACK-B-04">RACK-B-04 (Heavy SUV / Pickups Rack)</option>
                    <option value="RACK-C-01">RACK-C-01 (Sport / Performance Rack)</option>
                    <option value="RACK-C-02">RACK-C-02 (Economy &amp; Compact Tires)</option>
                    <option value="PALLET-P-03">PALLET-P-03 (Bulk Commercial Logistics)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Active DOT Production Batch</label>
                <input
                  type="text"
                  value={dotBatchCode}
                  onChange={e => setDotBatchCode(e.target.value)}
                  placeholder="DOT 1425"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Supplier / Distributor</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  placeholder="Michelin Philippines Logistics Hub"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SAFETY STOCK THRESHOLDS & INVENTORY LEVELS */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Inventory Thresholds &amp; Safety Stock Policies</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Stock (Units)</label>
                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(Math.max(0, Number(e.target.value)))}
                  className="w-full h-9 px-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-extrabold text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Physical on shelves</span>
              </div>

              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                <label className="block text-[11px] font-bold text-amber-900 mb-1">Min Safety Threshold</label>
                <input
                  type="number"
                  value={minStockThreshold}
                  onChange={e => setMinStockThreshold(Math.max(0, Number(e.target.value)))}
                  className="w-full h-9 px-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-extrabold text-amber-900"
                />
                <span className="text-[10px] text-amber-800 mt-1 block">Triggers low-stock alert</span>
              </div>

              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">Target Par Stock Level</label>
                <input
                  type="number"
                  value={parLevel}
                  onChange={e => setParLevel(Math.max(minStockThreshold, Number(e.target.value)))}
                  className="w-full h-9 px-2 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-extrabold text-emerald-900"
                />
                <span className="text-[10px] text-emerald-800 mt-1 block">Optimal replenishment</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: FINANCIALS & MARGIN CALCULATOR */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              <span>Wholesale Cost, Retail Selling Price &amp; Profit Margins</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Wholesale Landed Cost (PHP) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">₱</span>
                  <input
                    type="number"
                    value={wholesaleCost}
                    onChange={e => setWholesaleCost(Number(e.target.value))}
                    className="w-full h-10 pl-7 pr-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Retail Selling Price (PHP with 12% VAT) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">₱</span>
                  <input
                    type="number"
                    value={retailPrice}
                    onChange={e => setRetailPrice(Number(e.target.value))}
                    className="w-full h-10 pl-7 pr-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-extrabold text-blue-900 outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* LIVE MARGIN TELEMETRY */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Gross Profit</span>
                  <span className="font-mono font-bold text-slate-900">{formatPHP(grossProfit)} / tire</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Gross Margin</span>
                  <span className={`font-mono font-extrabold ${grossMarginPercent >= 20 ? 'text-emerald-700' : grossMarginPercent >= 10 ? 'text-amber-700' : 'text-red-600'}`}>
                    {grossMarginPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center space-x-1.5 ${
                grossMarginPercent >= 20 ? 'bg-emerald-100 text-emerald-800' :
                grossMarginPercent >= 10 ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {grossMarginPercent >= 20 ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>
                  {grossMarginPercent >= 20 ? 'Healthy Wholesale Margin' :
                   grossMarginPercent >= 10 ? 'Low Margin Threshold' : 'Critical Negative or Thin Margin'}
                </span>
              </div>
            </div>
          </div>

          {/* MODAL FOOTER BUTTONS */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Destructive Action Button: Archive SKU */}
            {isEditing && onArchiveProduct ? (
              <button
                type="button"
                onClick={() => setIsConfirmArchiveOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Archive className="w-4 h-4" />
                <span>Archive / Deactivate SKU</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes to Item Master' : 'Create & Register Tire SKU'}</span>
              </button>
            </div>

          </div>

        </form>

        {/* DESTRUCTIVE CONFIRMATION MODAL (POKA-YOKE SAFEGUARD) */}
        {isConfirmArchiveOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border-2 border-red-500 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-xl shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Confirm SKU Deactivation / Archival
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    You are about to archive <strong>{brand} {model}</strong> ({productToEdit?.id}). 
                    This will hide the SKU from frontline counter sales and inbound receiving kiosks.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1 font-medium">
                <div>&bull; Current Physical Stock: <strong>{stock} units</strong> in {binLocation}</div>
                <div>&bull; Physical rack slot must be reassigned or cleared before deactivating.</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type <span className="font-mono text-red-600 font-extrabold">ARCHIVE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={archiveConfirmationText}
                  onChange={e => setArchiveConfirmationText(e.target.value.toUpperCase())}
                  placeholder="ARCHIVE"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-red-700 outline-none focus:border-red-600 focus:bg-white uppercase"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmArchiveOpen(false);
                    setArchiveConfirmationText('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={archiveConfirmationText !== 'ARCHIVE'}
                  onClick={handleExecuteArchive}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-red-600/20"
                >
                  Confirm Archive
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
