import React, { useState } from 'react';
import { PageHeader } from './ui/PageHeader';
import {
  TireProduct,
  StaffRole,
  STAFF_PROFILES,
  StockMovementRecord,
  INITIAL_MOVEMENTS,
  ReleaseNotification
} from '../data';
import { formatPHP, getAvailableStock } from '../utils';
import { canReleaseStock, canManageWarehouseOps } from '../rbac';
import { StockIntakeWizard } from './StockIntakeWizard';
import { StockDispatchWizard } from './StockDispatchWizard';
import { ItemMasterModal } from './ItemMasterModal';
import { CycleCountModal } from './CycleCountModal';
import { SkuDetailModal } from './SkuDetailModal';
import { ReorderModal } from './ReorderModal';
import {
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  MapPin,
  Barcode,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Plus,
  Truck,
  Building,
  Printer,
  FileText,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  ClipboardCheck,
  Edit3,
  ExternalLink,
  ShieldAlert,
  Archive,
  History,
  BellRing,
  Flame,
  Radio
} from 'lucide-react';

interface InventoryWorkspaceProps {
  products: TireProduct[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onUpdateMinThreshold: (productId: string, newThreshold: number) => void;
  onSaveProduct?: (product: TireProduct) => void;
  onArchiveProduct?: (productId: string) => void;
  activeRole: StaffRole;
  movements: StockMovementRecord[];
  onAddMovement: (movement: Omit<StockMovementRecord, 'id' | 'timestamp'>) => void;
  onTriggerToast: (msg: string) => void;
  onNavigateToView?: (view: string) => void;
  releaseNotifications?: ReleaseNotification[];
  onFulfillReleaseTicket?: (
    ticketId: string,
    product: TireProduct,
    quantity: number,
    targetDestination: string,
    workOrderRef: string
  ) => void;
}

export const InventoryWorkspace: React.FC<InventoryWorkspaceProps> = ({
  products,
  onUpdateProductStock,
  onUpdateMinThreshold,
  onSaveProduct,
  onArchiveProduct,
  activeRole,
  movements,
  onAddMovement,
  onTriggerToast,
  releaseNotifications = [],
  onFulfillReleaseTicket
}) => {
  const currentProfile = STAFF_PROFILES[activeRole];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  // Phase 2 Wizards (Zero-Training Intake & Dispatch)
  const [isIntakeWizardOpen, setIsIntakeWizardOpen] = useState(false);
  const [isDispatchWizardOpen, setIsDispatchWizardOpen] = useState(false);
  const [dispatchTargetTicketId, setDispatchTargetTicketId] = useState<string | null>(null);

  // Phase 3 Modules
  const [isItemMasterModalOpen, setIsItemMasterModalOpen] = useState(false);
  const [productToEditInMaster, setProductToEditInMaster] = useState<TireProduct | null>(null);

  const [isCycleCountModalOpen, setIsCycleCountModalOpen] = useState(false);
  const [cycleCountTargetProduct, setCycleCountTargetProduct] = useState<TireProduct | undefined>(undefined);

  const [isSkuDetailModalOpen, setIsSkuDetailModalOpen] = useState(false);
  const [skuDetailTargetProduct, setSkuDetailTargetProduct] = useState<TireProduct | null>(null);

  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  // Quick Action Modal States
  const [activeModal, setActiveModal] = useState<'none' | 'bin_transfer' | 'damage_report' | 'quarantine_review'>('none');
  const [selectedProduct, setSelectedProduct] = useState<TireProduct>(products[0] || {} as TireProduct);
  const [actionQuantity, setActionQuantity] = useState(4);
  const [targetBin, setTargetBin] = useState('RACK-B-04');
  const [damageNotes, setDamageNotes] = useState('');

  // Capabilities per role
  const isIntern = activeRole === 'ROLE_INTERN';
  const isClerk = activeRole === 'ROLE_CLERK';
  const isManager = activeRole === 'ROLE_MANAGER';
  const isAdmin = activeRole === 'ROLE_ADMIN';

  const canViewFinancials = isManager || isAdmin;
  const canEditThresholds = isManager || isAdmin;
  const canRelease = canReleaseStock(activeRole);
  const canWarehouseOps = canManageWarehouseOps(activeRole);
  const canViewAuditLedger = isAdmin || isManager;
  const canPerformBinTransfer = isClerk || isManager || isAdmin;
  const canManageItemMaster = isManager || isAdmin;
  const canPerformCycleCount = isClerk || isManager || isAdmin;

  // Wizard Handlers
  const handleWizardIntakeConfirm = (
    product: TireProduct,
    qty: number,
    bin: string,
    dotCode: string
  ) => {
    const safeQty = Math.floor(Number(qty) || 0);
    if (safeQty < 1) {
      onTriggerToast('Intake quantity must be at least 1.');
      return;
    }
    const newStock = product.stock + safeQty;
    onUpdateProductStock(product.id, newStock);

    onAddMovement({
      sku: product.id,
      productName: `${product.brand} ${product.model}`,
      type: 'Stock Intake (PO Check-In)',
      quantity: qty,
      sourceLocation: 'Receiving Dock B',
      destinationLocation: bin,
      performedBy: `${currentProfile.name} (${currentProfile.title})`,
      role: activeRole,
      notes: `Intake verified via Barcode ${product.barcode} & ${dotCode}. Printed ${safeQty}x thermal tread labels.`
    });

    onTriggerToast(`Stock Intake Complete: +${safeQty} ${product.brand} ${product.model} checked into ${bin}.`);
  };

  const handleWizardDispatchConfirm = (
    product: TireProduct,
    qty: number,
    destination: string,
    workOrderRef: string,
    ticketId?: string
  ) => {
    if (!canRelease) {
      onTriggerToast('Only Warehouse Clerk, Manager, or Admin can release stock.');
      return;
    }

    // Ticket path: store.fulfillReleaseTicket commits stock + reserved + movement
    if (onFulfillReleaseTicket && ticketId) {
      onFulfillReleaseTicket(ticketId, product, qty, destination, workOrderRef);
      setDispatchTargetTicketId(null);
      return;
    }

    // Ad-hoc dispatch (no ticket): only from available stock
    const available = getAvailableStock(product);
    const safeQty = Math.floor(Number(qty) || 0);
    if (safeQty < 1) {
      onTriggerToast('Quantity must be at least 1.');
      return;
    }
    if (safeQty > available) {
      onTriggerToast(`Only ${available} available to release (on-hand ${product.stock}, reserved ${product.stockReserved ?? 0}).`);
      return;
    }
    const newStock = product.stock - safeQty;
    onUpdateProductStock(product.id, newStock);

    onAddMovement({
      sku: product.id,
      productName: `${product.brand} ${product.model}`,
      type: 'Bay Handover (Dispatch)',
      quantity: safeQty,
      sourceLocation: product.binLocation,
      destinationLocation: destination,
      performedBy: `${currentProfile.name} (${currentProfile.title})`,
      role: activeRole,
      workOrderRef,
      notes: `Ad-hoc release (no ticket) for ${workOrderRef}.`,
    });

    onTriggerToast(
      `Released ${safeQty}x ${product.brand} → ${destination}`
    );
    setDispatchTargetTicketId(null);
  };

  const handleOpenDispatchForTicket = (ticketId: string) => {
    setDispatchTargetTicketId(ticketId);
    setIsDispatchWizardOpen(true);
  };

  // Phase 3: Cycle Count Handler
  const handleConfirmReconciliation = (
    product: TireProduct,
    countedQty: number,
    variance: number,
    reason: string,
    notes: string
  ) => {
    onUpdateProductStock(product.id, countedQty);

    onAddMovement({
      sku: product.id,
      productName: `${product.brand} ${product.model}`,
      type: 'Cycle Count Reconciliation',
      quantity: Math.abs(variance),
      sourceLocation: variance < 0 ? product.binLocation : 'Physical Floor Discovery',
      destinationLocation: variance < 0 ? 'Adjustment Loss (Ledger Reconciliation)' : product.binLocation,
      performedBy: `${currentProfile.name} (${currentProfile.title})`,
      role: activeRole,
      notes: `Audit Variance: ${variance > 0 ? '+' : ''}${variance} units. Reason: ${reason}. Inspector notes: ${notes}`
    });

    onTriggerToast(`Cycle Count Reconciled: ${product.brand} ${product.model} stock set to ${countedQty} units.`);
  };

  // Phase 3: Reorder PO Handler
  const handleConfirmReorderPO = (
    poNumber: string,
    supplier: string,
    items: { product: TireProduct; qty: number }[],
    totalCost: number
  ) => {
    const summary = items.map(i => `${i.qty}x ${i.product.model}`).join(', ');
    onAddMovement({
      sku: items[0]?.product.id || 'MULTI',
      productName: `Replenishment PO ${poNumber} (${items.length} SKUs)`,
      type: 'Stock Intake (PO Check-In)',
      quantity: items.reduce((a, b) => a + b.qty, 0),
      sourceLocation: supplier,
      destinationLocation: 'Receiving Dock B (Staging)',
      performedBy: `${currentProfile.name} (${currentProfile.title})`,
      role: activeRole,
      workOrderRef: poNumber,
      notes: `Official PO Issued for ${formatPHP(totalCost)}: ${summary}. Dock alerted for freight arrival.`
    });

    onTriggerToast(`Replenishment Purchase Order ${poNumber} authorized and transmitted.`);
  };

  // Filtered Products
  const filteredProducts = products.filter(product => {
    const matchesQuery =
      product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.specCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.binLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);

    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;

    const available = getAvailableStock(product);
    const matchesLowStock = !showOnlyLowStock || available <= product.minStockThreshold;

    return matchesQuery && matchesCategory && matchesLowStock;
  });

  // Inventory Totals
  const totalUnits = products.reduce((acc, p) => acc + getAvailableStock(p), 0);
  const lowStockCount = products.filter(p => getAvailableStock(p) <= p.minStockThreshold).length;
  const outOfStockCount = products.filter(p => getAvailableStock(p) === 0).length;

  // Categories list
  const categories = ['All', 'Passenger Car Radial (PCR)', 'SUV / 4x4 All-Terrain', 'Commercial Light Truck / 4x4', 'Ultra High Performance (UHP)'];

  // Handle Bin Transfer (Clerk / Manager)
  const handleConfirmBinTransfer = () => {
    onAddMovement({
      sku: selectedProduct.id,
      productName: `${selectedProduct.brand} ${selectedProduct.model}`,
      type: 'Bin-to-Bin Transfer',
      quantity: actionQuantity,
      sourceLocation: selectedProduct.binLocation,
      destinationLocation: targetBin,
      performedBy: `${currentProfile.name} (${currentProfile.title})`,
      role: activeRole,
      notes: `Relocated ${actionQuantity} units from ${selectedProduct.binLocation} to ${targetBin}`
    });

    onTriggerToast(`Transferred ${actionQuantity} units of ${selectedProduct.brand} to ${targetBin}`);
    setActiveModal('none');
  };

  // Handle Damage Report Draft
  const handleConfirmDamageReport = () => {
    onAddMovement({
      sku: selectedProduct.id,
      productName: `${selectedProduct.brand} ${selectedProduct.model}`,
      type: 'Damage / Scrap Logging',
      quantity: actionQuantity,
      sourceLocation: selectedProduct.binLocation,
      destinationLocation: 'Quarantine / Inspection Shelf',
      performedBy: `${currentProfile.name} (${currentProfile.title})`,
      role: activeRole,
      notes: damageNotes || 'Visual defect flag logged during shop operations.'
    });

    onTriggerToast(
      isIntern
        ? 'Draft damage report submitted for Manager sign-off.'
        : `Logged ${actionQuantity} units of ${selectedProduct.model} to quarantine shelf.`
    );
    setActiveModal('none');
    setDamageNotes('');
  };

  // Quarantine write-off sign-off
  const handleResolveQuarantineWriteoff = (skuId: string, action: 'scrap' | 'return') => {
    const prod = products.find(p => p.id === skuId);
    if (!prod) return;

    if (action === 'scrap') {
      const newStock = Math.max(0, prod.stock - 1);
      onUpdateProductStock(prod.id, newStock);
      onAddMovement({
        sku: prod.id,
        productName: `${prod.brand} ${prod.model}`,
        type: 'Damage / Scrap Logging',
        quantity: 1,
        sourceLocation: 'Quarantine / Inspection Shelf',
        destinationLocation: 'Scrap Recycling Bin (Written Off)',
        performedBy: `${currentProfile.name} (${currentProfile.title})`,
        role: activeRole,
        notes: `Manager approved scrap write-off. Deducted 1 unit from master stock.`
      });
      onTriggerToast(`Approved write-off: 1 unit of ${prod.model} deducted and logged to scrap ledger.`);
    } else {
      onAddMovement({
        sku: prod.id,
        productName: `${prod.brand} ${prod.model}`,
        type: 'Damage / Scrap Logging',
        quantity: 1,
        sourceLocation: 'Quarantine / Inspection Shelf',
        destinationLocation: 'Supplier RTV (Return to Vendor)',
        performedBy: `${currentProfile.name} (${currentProfile.title})`,
        role: activeRole,
        notes: `Tire returned to supplier for warranty credit slip.`
      });
      onTriggerToast(`Initiated return to supplier for warranty replacement credit.`);
    }
    setActiveModal('none');
  };

  const pendingReleases = releaseNotifications.filter(n => n.status === 'PENDING_RELEASE');
  const hasUrgentInBay = pendingReleases.some(n => n.urgency === 'URGENT_IN_BAY');
  const mostUrgentTicket = pendingReleases.find(n => n.urgency === 'URGENT_IN_BAY') || pendingReleases[0];

  return (
    <div className="space-y-6">
      
      <PageHeader
        title={isIntern ? 'Stock availability' : isClerk ? 'Warehouse inventory' : 'Inventory'}
        description={
          isIntern
            ? 'Check bins and available quantity. Warehouse staff handle release.'
            : isClerk
            ? 'Pick queue, intake, and stock counts for the QC hub.'
            : isManager
            ? 'Stock levels, thresholds, and warehouse oversight.'
            : 'Full inventory control.'
        }
        actions={
          <span className="text-[11px] text-slate-400 font-mono">{currentProfile.badgeCode}</span>
        }
      />

      {/* PHASE 3 AUTOMATIC LOW-STOCK NOTIFICATION RIBBON */}
      {lowStockCount > 0 && !isIntern && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-4 rounded-lg border-2 border-amber-400/80  flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-semibold tracking-wider text-amber-950">
                  Critical Low-Stock Replenishment Warning
                </span>
                <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                  {lowStockCount} Models Under Par
                </span>
                {outOfStockCount > 0 && (
                  <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                    {outOfStockCount} Out of Stock
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-900 mt-0.5">
                Current inventory levels for key tires have breached minimum safety thresholds. Replenish before peak Saturday service queue.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-amber-300 cursor-pointer transition-colors"
            >
              {showOnlyLowStock ? 'Show All SKUs' : 'View Low Stock Only'}
            </button>

            {canManageItemMaster && (
              <button
                type="button"
                onClick={() => setIsReorderModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-amber-500/20 transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Generate Replenishment PO</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ZERO-TRAINING EXPRESS ACTION TILES (Prominent & Tailored by Role) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tile 1: Guided Stock Intake */}
        <button
          type="button"
          onClick={() => {
            setSelectedProduct(products[0]);
            setIsIntakeWizardOpen(true);
          }}
          className="bg-white hover:bg-emerald-50/50 border-2 border-slate-200 hover:border-emerald-500 rounded-lg p-5 text-left transition-all group cursor-pointer "
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 flex items-center justify-between">
            <span>Stock In / Intake</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Receive arriving tires, scan barcode, and assign to rack bin.
          </p>
          <div className="mt-3 inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Sparkles className="w-3 h-3" />
            <span>3-Step Guided Wizard</span>
          </div>
        </button>

        {/* Tile 2: Bay Handover Dispatch */}
        <button
          type="button"
          onClick={() => {
            setSelectedProduct(products[0]);
            setIsDispatchWizardOpen(true);
          }}
          className="bg-white hover:bg-blue-50/50 border-2 border-slate-200 hover:border-blue-500 rounded-lg p-5 text-left transition-all group cursor-pointer "
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
            <span>Bay Handover</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch tires from rack to Bay 1 Alignment or Bay 2 Mounting.
          </p>
          <div className="mt-3 inline-flex items-center space-x-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Poka-Yoke Verified</span>
          </div>
        </button>

        {/* Tile 3: Role-Specific Third Tile */}
        {isIntern ? (
          <button
            type="button"
            onClick={() => {
              const searchInput = document.getElementById('inventory-search-input');
              if (searchInput) searchInput.focus();
            }}
            className="bg-white hover:bg-amber-50/50 border-2 border-slate-200 hover:border-amber-500 rounded-lg p-5 text-left transition-all group cursor-pointer "
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-800 flex items-center justify-between">
              <span>Rack &amp; Bin Finder</span>
              <Search className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Locate physical tire slot (RACK-A-01, B-04, etc.) in seconds.
            </p>
            <div className="mt-3 inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <Barcode className="w-3 h-3" />
              <span>Instant Lookup</span>
            </div>
          </button>
        ) : canPerformBinTransfer ? (
          <button
            type="button"
            onClick={() => {
              setSelectedProduct(products[0]);
              setActionQuantity(4);
              setActiveModal('bin_transfer');
            }}
            className="bg-white hover:bg-purple-50/50 border-2 border-slate-200 hover:border-purple-500 rounded-lg p-5 text-left transition-all group cursor-pointer "
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 flex items-center justify-between">
              <span>Bin-to-Bin Transfer</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Relocate tires from Receiving Dock to pick racks.
            </p>
            <div className="mt-3 inline-flex items-center space-x-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              <Layers className="w-3 h-3" />
              <span>Warehouse Logistics</span>
            </div>
          </button>
        ) : null}

        {/* Tile 4: Role-Specific Fourth Tile */}
        {isIntern ? (
          <button
            type="button"
            onClick={() => {
              setSelectedProduct(products[0]);
              setActionQuantity(1);
              setActiveModal('damage_report');
            }}
            className="bg-white hover:bg-red-50/50 border-2 border-slate-200 hover:border-red-500 rounded-lg p-5 text-left transition-all group cursor-pointer "
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-red-700 flex items-center justify-between">
              <span>Report Damaged</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Submit draft report for punctured or defective tire.
            </p>
            <div className="mt-3 inline-flex items-center space-x-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              <Info className="w-3 h-3" />
              <span>Supervisor Approval</span>
            </div>
          </button>
        ) : canPerformCycleCount ? (
          <button
            type="button"
            onClick={() => {
              setCycleCountTargetProduct(products[0]);
              setIsCycleCountModalOpen(true);
            }}
            className="bg-white hover:bg-purple-50/50 border-2 border-slate-200 hover:border-purple-500 rounded-lg p-5 text-left transition-all group cursor-pointer "
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 flex items-center justify-between">
              <span>Cycle Count Audit</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Physical inventory reconciliation &amp; variance tracking.
            </p>
            <div className="mt-3 inline-flex items-center space-x-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              <ShieldCheck className="w-3 h-3" />
              <span>Variance Reconciliation</span>
            </div>
          </button>
        ) : null}

      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white rounded-lg p-4 border border-slate-200  space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Real-time search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="inventory-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Scan barcode, search SKU, tire model, size (e.g. 265/60), or rack (e.g. RACK-B-04)..."
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Barcode Scanner Indicator & Quarantine button */}
          <div className="flex items-center space-x-2">
            {canManageItemMaster && (
              <button
                type="button"
                onClick={() => setActiveModal('quarantine_review')}
                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Quarantine Review</span>
              </button>
            )}

            <div className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 text-xs font-mono">
              <Barcode className="w-3.5 h-3.5 text-blue-600" />
              <span>Scanner Ready</span>
            </div>
          </div>

        </div>

        {/* Category Pills & Low Stock Toggle */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <div className="flex items-center space-x-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white '
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {showOnlyLowStock && (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
              Filtered: Low-Stock Tires Only
            </span>
          )}
        </div>
      </div>

      {/* TAILORED INVENTORY MASTER / RACK TABLE */}
      <div className="bg-white rounded-lg border border-slate-200  overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>
                {isIntern ? 'Physical Shelf & Rack Stock Registry' : 'Item Master Inventory Management'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {isIntern
                ? 'Showing physical storage bins and available quantities. Tap any item row to see specifications or history.'
                : 'Central tire catalog with real-time stock levels, warehouse bins, safety thresholds, and batch tracking.'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold text-slate-500 mr-2">
              Showing {filteredProducts.length} of {products.length} Items
            </span>

            {/* PHASE 3: ITEM MASTER ONBOARDING (MANAGER & ADMIN ONLY) */}
            {canManageItemMaster && onSaveProduct && (
              <button
                type="button"
                onClick={() => {
                  setProductToEditInMaster(null);
                  setIsItemMasterModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-blue-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Tire SKU</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Tire Model &amp; Spec</th>
                <th className="py-3 px-4">Physical Bin</th>
                <th className="py-3 px-4">Barcode / Serial</th>
                <th className="py-3 px-4">DOT Batch</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                {canEditThresholds && <th className="py-3 px-4 text-center">Min Safety Stock</th>}
                {canViewFinancials && (
                  <>
                    <th className="py-3 px-4 text-right">Wholesale Cost</th>
                    <th className="py-3 px-4 text-right">Retail Price</th>
                  </>
                )}
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredProducts.map(product => {
                const available = getAvailableStock(product);
                const isLowStock = available <= product.minStockThreshold;
                const isOutOfStock = available === 0;

                return (
                  <tr
                    key={product.id}
                    className={`transition-colors cursor-pointer group border-l-4 ${
                      isOutOfStock
                        ? 'bg-red-50/70 hover:bg-red-100/70 border-l-red-600'
                        : isLowStock
                        ? 'bg-red-50/40 hover:bg-red-100/50 border-l-red-500'
                        : 'hover:bg-blue-50/40 border-l-transparent'
                    }`}
                    onClick={(e) => {
                      // Only open modal if not clicking an action button directly
                      const target = e.target as HTMLElement;
                      if (!target.closest('button')) {
                        setSkuDetailTargetProduct(product);
                        setIsSkuDetailModalOpen(true);
                      }
                    }}
                  >
                    
                    {/* Model & Spec */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-blue-700">
                          {product.brand} {product.model}
                        </span>
                        <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Red Low Stock Alert Indicator Badge */}
                        {isLowStock && (
                          <span
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-600 text-white font-semibold text-[10px] uppercase tracking-wide  shrink-0 animate-in fade-in"
                            title={`Stock alert: ${available} available / ${product.stock} on-hand (Safety minimum: ${product.minStockThreshold})`}
                          >
                            <AlertTriangle className="w-3 h-3 text-white fill-white/20 shrink-0" />
                            <span>Low Stock Alert</span>
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-slate-600 text-xs font-medium mt-0.5">{product.specCode}</div>
                      <span className="text-[10px] text-slate-400 font-medium">{product.category}</span>
                    </td>

                    {/* Physical Bin Location */}
                    <td className="py-3.5 px-4">
                      <div className={`inline-flex items-center space-x-1 font-mono font-bold px-2 py-1 rounded-lg border ${
                        isLowStock
                          ? 'text-red-900 bg-red-50 border-red-200'
                          : 'text-blue-800 bg-blue-50 border-blue-200'
                      }`}>
                        <MapPin className={`w-3 h-3 ${isLowStock ? 'text-red-600' : 'text-blue-600'}`} />
                        <span>{product.binLocation}</span>
                      </div>
                    </td>

                    {/* Barcode */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-slate-600 flex items-center gap-1">
                        <Barcode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{product.barcode}</span>
                      </div>
                    </td>

                    {/* DOT Code */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                        {product.dotBatchCode || 'DOT 0625'}
                      </span>
                    </td>

                    {/* Available Stock with Red Badge / Warning Icon */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center space-x-1.5">
                          {isLowStock && (
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 " />
                          )}
                          <span className={`text-base font-semibold font-mono ${
                            isOutOfStock ? 'text-red-700 font-semibold' : isLowStock ? 'text-red-600 font-semibold' : 'text-slate-900'
                          }`}>
                            {available}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          on-hand {product.stock}
                          {(product.stockReserved ?? 0) > 0 ? ` · ${product.stockReserved} reserved` : ''}
                        </span>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center space-x-1 text-[9px] font-semibold text-white bg-red-600 border border-red-700 px-2 py-0.5 rounded-full mt-1 ">
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center space-x-1 text-[9px] font-semibold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full mt-1 ">
                            <AlertTriangle className="w-2.5 h-2.5 text-red-600 shrink-0" />
                            <span>Deficit: -{product.minStockThreshold - available} Under Min</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded mt-0.5">
                            In Stock
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Min Safety Stock (Manager & Admin only) */}
                    {canEditThresholds && (
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onUpdateMinThreshold(product.id, Math.max(0, product.minStockThreshold - 2))}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                            title="Decrease safety threshold"
                          >
                            -
                          </button>
                          <span className={`font-mono font-bold text-xs px-2 ${
                            isLowStock
                              ? 'text-red-700 font-semibold bg-red-100 border border-red-300 rounded py-0.5'
                              : 'text-slate-800'
                          }`}>
                            {product.minStockThreshold}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateMinThreshold(product.id, product.minStockThreshold + 2)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                            title="Increase safety threshold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Financial Costs (Manager & Admin only) */}
                    {canViewFinancials && (
                      <>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                          {formatPHP(product.wholesaleCost || 3500)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatPHP(product.price)}
                        </td>
                      </>
                    )}

                    {/* Action Column with Quick Shortcuts */}
                    <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1.5">
                        
                        {/* Intake */}
                        {canWarehouseOps && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsIntakeWizardOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                          title="Stock intake"
                        >
                          Intake
                        </button>
                        )}
                        {canRelease && (
                        <button
                          type="button"
                          disabled={getAvailableStock(product) === 0}
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDispatchWizardOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Release / dispatch"
                        >
                          Release
                        </button>
                        )}

                        {/* Cycle Count shortcut (Clerk / Manager) */}
                        {canPerformCycleCount && (
                          <button
                            type="button"
                            onClick={() => {
                              setCycleCountTargetProduct(product);
                              setIsCycleCountModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 text-[11px] transition-colors cursor-pointer"
                            title="Perform Physical Cycle Count Audit on this SKU"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit Item Master (Manager / Admin) */}
                        {canManageItemMaster && onSaveProduct && (
                          <button
                            type="button"
                            onClick={() => {
                              setProductToEditInMaster(product);
                              setIsItemMasterModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] transition-colors cursor-pointer"
                            title="Edit Item Master Configuration"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* IMMUTABLE ACTION LOG / AUDIT LEDGER (Admin & Manager View) */}
      {canViewAuditLedger && (
        <div className="bg-white rounded-lg border border-slate-200  p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Real-Time Immutable Stock Movement Ledger</span>
              </h3>
              <p className="text-xs text-slate-500">
                Append-only Double-Entry audit trail tracking physical tire movements with operator and timestamp attribution.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              Ledger WORM Locked &bull; Real-time
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[10px] uppercase font-mono">
                  <th className="py-2.5 px-3">Tx ID &amp; Time</th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3">Source &rarr; Destination</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 font-mono text-[11px]">
                    <td className="py-2.5 px-3 font-bold text-blue-700">
                      <div>{m.id}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{m.timestamp}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                      {m.productName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                        m.type.includes('Intake') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        m.type.includes('Dispatch') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        m.type.includes('Transfer') ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        m.type.includes('Reconciliation') ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                      {m.type.includes('Intake') ? `+${m.quantity}` : `-${m.quantity}`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="font-semibold text-slate-800">{m.sourceLocation}</span> &rarr; <span className="font-semibold text-blue-700">{m.destinationLocation}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">
                      {m.performedBy}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[10px] font-sans italic max-w-xs truncate">
                      {m.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PHASE 2 WIZARD 1: STEP-BY-STEP ZERO-TRAINING INTAKE WIZARD */}
      <StockIntakeWizard
        products={products}
        isOpen={isIntakeWizardOpen}
        onClose={() => setIsIntakeWizardOpen(false)}
        activeRole={activeRole}
        onConfirmIntake={handleWizardIntakeConfirm}
      />

      {/* PHASE 2 WIZARD 2: ZERO-TRAINING BAY DISPATCH WIZARD WITH POKA-YOKE MISTAKE PROOFING */}
      <StockDispatchWizard
        products={products}
        isOpen={isDispatchWizardOpen}
        onClose={() => {
          setIsDispatchWizardOpen(false);
          setDispatchTargetTicketId(null);
        }}
        activeRole={activeRole}
        onConfirmDispatch={handleWizardDispatchConfirm}
        activeTickets={releaseNotifications}
        preselectedTicketId={dispatchTargetTicketId}
      />

      {/* PHASE 3 MODAL 1: ITEM MASTER CONFIGURATION & ONBOARDING */}
      {canManageItemMaster && onSaveProduct && (
        <ItemMasterModal
          isOpen={isItemMasterModalOpen}
          onClose={() => setIsItemMasterModalOpen(false)}
          productToEdit={productToEditInMaster}
          onSaveProduct={onSaveProduct}
          onArchiveProduct={onArchiveProduct}
        />
      )}

      {/* PHASE 3 MODAL 2: CYCLE COUNT & PHYSICAL STOCK RECONCILIATION */}
      <CycleCountModal
        isOpen={isCycleCountModalOpen}
        onClose={() => setIsCycleCountModalOpen(false)}
        products={products}
        initialProduct={cycleCountTargetProduct}
        activeRole={activeRole}
        onConfirmReconciliation={handleConfirmReconciliation}
      />

      {/* PHASE 3 MODAL 3: SKU DEEP-DIVE & HISTORICAL MOVEMENT TIMELINE */}
      <SkuDetailModal
        isOpen={isSkuDetailModalOpen}
        onClose={() => setIsSkuDetailModalOpen(false)}
        product={skuDetailTargetProduct}
        movements={movements}
        activeRole={activeRole}
        onOpenIntake={(prod) => {
          setSelectedProduct(prod);
          setIsIntakeWizardOpen(true);
        }}
        onOpenDispatch={(prod) => {
          setSelectedProduct(prod);
          setIsDispatchWizardOpen(true);
        }}
        onOpenCycleCount={(prod) => {
          setCycleCountTargetProduct(prod);
          setIsCycleCountModalOpen(true);
        }}
        onOpenEditMaster={(prod) => {
          setProductToEditInMaster(prod);
          setIsItemMasterModalOpen(true);
        }}
      />

      {/* PHASE 3 MODAL 4: LOW-STOCK REPLENISHMENT PO GENERATOR */}
      <ReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        products={products}
        activeRole={activeRole}
        onConfirmReorderPO={handleConfirmReorderPO}
      />

      {/* QUICK MODAL 3: BIN-TO-BIN TRANSFER (Clerk / Manager) */}
      {activeModal === 'bin_transfer' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wide">Bin-to-Bin Location Relocation</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="text-white hover:text-slate-200 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{selectedProduct.brand} {selectedProduct.model}</div>
                <div className="text-slate-500 font-mono mt-0.5">Current Location: <strong>{selectedProduct.binLocation}</strong></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Select New Warehouse Shelf / Bin
                </label>
                <select
                  value={targetBin}
                  onChange={e => setTargetBin(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold outline-none cursor-pointer"
                >
                  <option value="RACK-A-01">RACK-A-01 (Ground Level - Fast Moving)</option>
                  <option value="RACK-A-02">RACK-A-02 (Level 2)</option>
                  <option value="RACK-B-04">RACK-B-04 (SUV Heavy Rack)</option>
                  <option value="RACK-C-01">RACK-C-01 (Performance Bay Rack)</option>
                  <option value="PALLET-P-03">PALLET-P-03 (Bulk Commercial Staging)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Units to Move
                </label>
                <input
                  type="number"
                  value={actionQuantity}
                  onChange={e => setActionQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBinTransfer}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Execute Bin Move</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MODAL 4: DAMAGE / DEFECT REPORT (Intern draft flow) */}
      {activeModal === 'damage_report' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="bg-red-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wide">Report Damaged / Defective Tire</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="text-white hover:text-slate-200 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{selectedProduct.brand} {selectedProduct.model}</div>
                <div className="text-slate-500 font-mono mt-0.5">Bin: {selectedProduct.binLocation}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Inspection Defect Notes / Photos
                </label>
                <textarea
                  value={damageNotes}
                  onChange={e => setDamageNotes(e.target.value)}
                  placeholder="e.g. Sidewall cut discovered during intake pallet unboxing. Bead deformation prevents bead seating."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800">
                <span className="font-bold block">Supervisor Approval Gate:</span>
                This will place 1 unit into the <strong>Quarantine Shelf</strong>. A manager or admin must sign off before physical write-off occurs.
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDamageReport}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Draft for Manager</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MODAL 5: QUARANTINE REVIEW & SIGN-OFF (Manager / Admin) */}
      {activeModal === 'quarantine_review' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm uppercase tracking-wide">Quarantine &amp; Defect Sign-Off Desk</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="text-white hover:text-slate-200 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block">1 Tire Flagged for Physical Inspection:</span>
                Dunlop Grandtrek AT5 (265/65 R17) &bull; Bin: Quarantine Shelf
                <p className="text-[11px] text-amber-800 mt-1 italic">
                  "Sidewall puncture incurred during transport unstrapping. Awaiting supplier credit claim."
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase block">Authorized Resolution Action:</span>
                
                <button
                  type="button"
                  onClick={() => handleResolveQuarantineWriteoff('SKU-006', 'scrap')}
                  className="w-full p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 border border-red-300 font-bold text-left flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <span className="block font-bold">Approve Write-Off to Scrap</span>
                    <span className="text-[10px] text-red-700 font-normal">Deduct 1 unit from master stock and write off to expense journal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleResolveQuarantineWriteoff('SKU-006', 'return')}
                  className="w-full p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold text-left flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <span className="block font-bold">Return to Supplier (RTV Warranty Credit)</span>
                    <span className="text-[10px] text-blue-700 font-normal">Claim replacement or credit memo against distributor invoice</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Close Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
