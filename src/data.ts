export interface TireProduct {
  id: string;
  brand: 'Michelin' | 'Bridgestone' | 'Yokohama' | 'Goodyear' | 'Continental' | 'Dunlop';
  model: string;
  specCode: string;
  width: number;
  profile: number;
  rim: string;
  price: number;
  wholesaleCost?: number;
  stock: number;
  stockReserved?: number;
  dotBatchCode?: string;
  barcode: string;
  binLocation: string;
  category: string;
  minStockThreshold: number;
  terrain: 'Touring' | 'Highway Terrain (HT)' | 'All-Terrain (AT)' | 'Mud-Terrain (MT)' | 'Performance';
  speedRating: string;
  loadIndex: string;
  loadCapacity: string;
  speedMax: string;
  treadwear: string;
  traction: string;
  temperature: string;
  warranty: string;
  recommendedUse: string;
  badge?: string;
  parLevel?: number;
  supplier?: string;
  status?: 'active' | 'archived';
  lastCycleCountDate?: string;
}

export type StaffRole = 'ROLE_INTERN' | 'ROLE_CLERK' | 'ROLE_MANAGER' | 'ROLE_ADMIN';

export interface StaffUserProfile {
  id: string;
  name: string;
  role: StaffRole;
  title: string;
  badgeCode: string;
  hub: string;
  avatarInitials: string;
  rolePillColor: string;
  description: string;
  allowedViews: ('inventory_kiosk' | 'sales_desk' | 'bay_terminal' | 'accounting_audit' | 'fleet_quotes' | 'design_system')[];
  capabilities: string[];
}

export interface StockMovementRecord {
  id: string;
  timestamp: string;
  sku: string;
  productName: string;
  type: 'Stock Intake (PO Check-In)' | 'Bay Handover (Dispatch)' | 'Bin-to-Bin Transfer' | 'Damage / Scrap Logging' | 'Cycle Count Reconciliation';
  quantity: number;
  sourceLocation: string;
  destinationLocation: string;
  performedBy: string;
  role: StaffRole;
  workOrderRef?: string;
  notes?: string;
}

export const STAFF_PROFILES: Record<StaffRole, StaffUserProfile> = {
  ROLE_INTERN: {
    id: 'USR-0941',
    name: 'Dave Altavano',
    role: 'ROLE_INTERN',
    title: 'Counter Staff',
    badgeCode: 'STAFF-0941',
    hub: 'Quezon City Central Hub',
    avatarInitials: 'DA',
    rolePillColor: 'bg-emerald-600 text-white',
    description:
      'Front desk: quotes, book bay, view/update bays, fleet quotes, submit payment proof, request stock. Cannot release warehouse stock or final-approve bank deposits.',
    allowedViews: [
      'sales_desk',
      'inventory_kiosk',
      'bay_terminal',
      'accounting_audit',
      'fleet_quotes',
    ],
    capabilities: [
      'Tire fitment & availability lookup',
      'Quotes & book service bay',
      'View / update bay board',
      'Fleet quotations',
      'Submit payment proof (no final approve)',
      'Request warehouse pull (does not release)',
    ],
  },
  ROLE_CLERK: {
    id: 'USR-4402',
    name: 'Marco Ramos',
    role: 'ROLE_CLERK',
    title: 'Warehouse Clerk',
    badgeCode: 'WH-4402',
    hub: 'Quezon City Hub · Dock B',
    avatarInitials: 'MR',
    rolePillColor: 'bg-blue-600 text-white',
    description: 'Warehouse floor: release stock, intake, cycle count, service bay board. No payments or fleet.',
    allowedViews: ['inventory_kiosk', 'bay_terminal'],
    capabilities: [
      'Stock release to bay / counter',
      'PO intake & bin transfers',
      'Cycle counts',
      'Service bay status',
    ],
  },
  ROLE_MANAGER: {
    id: 'USR-1002',
    name: 'Elena Santos',
    role: 'ROLE_MANAGER',
    title: 'Branch Manager',
    badgeCode: 'MGR-1002',
    hub: 'Quezon City Central Hub',
    avatarInitials: 'ES',
    rolePillColor: 'bg-violet-600 text-white',
    description:
      'Branch ops: counter oversight, warehouse override, fleet, bay board, and final payment approval.',
    allowedViews: [
      'inventory_kiosk',
      'sales_desk',
      'fleet_quotes',
      'bay_terminal',
      'accounting_audit',
    ],
    capabilities: [
      'Item master & min stock',
      'Fleet quotations → orders',
      'Final payment approve / reject',
      'Warehouse override & release',
      'Service bay oversight',
    ],
  },
  ROLE_ADMIN: {
    id: 'USR-0001',
    name: 'Robert Tan',
    role: 'ROLE_ADMIN',
    title: 'IT / System Admin',
    badgeCode: 'IT-0001',
    hub: 'Quezon City Central Hub',
    avatarInitials: 'RT',
    rolePillColor: 'bg-slate-800 text-white',
    description:
      'System configuration only (design tokens, future users/roles). No day-to-day sales, stock release, or payment approval.',
    allowedViews: ['design_system'],
    capabilities: [
      'Design system / UI tokens',
      'System configuration (demo)',
      'No live payment or stock actions',
    ],
  },
};

export interface CartItem {
  product: TireProduct;
  quantity: number;
  installationIncluded: boolean;
}

export interface B2BQuoteItem {
  product: TireProduct;
  quantity: number;
}

export interface ShopBooking {
  id: string;
  bay: 1 | 2;
  timeSlot: string;
  customerName: string;
  plateNumber: string;
  vehicleModel: string;
  phone: string;
  email: string;
  date: string;
  services: string[];
  totalCost: number;
  status: 'Waiting for Arrival' | 'Vehicle in Bay (In Progress)' | 'Installation Complete (Ready for Release)' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid' | 'Cash at Shop';
  notes?: string;
  /** Linked SKU when booking is for a specific tire job */
  productId?: string;
  /** Units allocated/reserved for this job (not hardcoded 4) */
  tireQuantity?: number;
}

export interface PdcTrancheRecord {
  tranche: number;
  days: number;
  amount: number;
  checkNo: string;
  dueDate: string;
  bank: string;
  status: 'In Vault (Pending Clearance)' | 'Cleared / Deposited' | 'Awaiting Physical Check';
}

export type OrderPaymentStatus =
  | 'Awaiting Proof'
  | 'Under Review'
  | 'Cleared'
  | 'Credit Approved (PDC)'
  | 'Rejected';

export type OrderFulfillmentStatus =
  | 'Not Started'
  | 'Allocated'
  | 'Picking'
  | 'Dispatched'
  | 'Completed'
  | 'Cancelled';

export interface OrderRecord {
  id: string;
  customerName: string;
  companyName?: string;
  plateNumber?: string;
  vehicleModel?: string;
  assignedBay?: 1 | 2;
  bookingRef?: string;
  phone: string;
  email: string;
  items: { productName: string; specCode: string; quantity: number; unitPrice: number; dotBatchCode?: string }[];
  amount: number;
  fulfillmentType: 'Direct Delivery' | 'Installation at QC Branch' | 'Warehouse Bulk Pallet Delivery';
  deliveryAddress?: string;
  paymentMethod: 'PayMongo Gateway' | 'Bank Transfer (BDO)' | 'Bank Transfer (BPI)' | '30/60 Days PDC' | '30/60/90 Days PDC';
  /** Money side — independent of warehouse progress */
  paymentStatus: OrderPaymentStatus;
  /** Ops side — allocation → pick → dispatch */
  fulfillmentStatus: OrderFulfillmentStatus;
  /**
   * @deprecated Combined status kept only for older UI strings; prefer paymentStatus + fulfillmentStatus.
   * Derived on write in the store when possible.
   */
  status?: string;
  referenceNumber: string;
  submissionDate: string;
  proofImageUrl?: string;
  rejectionReason?: string;
  quickBooksSyncId?: string;
  pdcSchedule?: PdcTrancheRecord[];
  /** Amount confirmed from deposit slip / gateway (PHP) */
  amountReceived?: number;
  quoteRef?: string;
}

export interface ReleaseLine {
  productSku: string;
  productName: string;
  quantity: number;
  binLocation: string;
  dotBatchCode?: string;
  /** Qty already committed on partial fulfill */
  fulfilledQty?: number;
}

export interface ReleaseNotification {
  id: string;
  sourceType: 'service_bay' | 'verified_order' | 'b2b_fleet' | 'counter_pickup';
  refId: string;
  bayName?: string;
  plateNumber: string;
  vehicleModel: string;
  customerName: string;
  /** Primary line (backward compatible); prefer `lines` for multi-SKU */
  productSku: string;
  productName: string;
  quantity: number;
  binLocation: string;
  /** Multi-line pick list when order has several SKUs */
  lines?: ReleaseLine[];
  status: 'PENDING_RELEASE' | 'RELEASED' | 'CANCELLED';
  urgency: 'HIGH_PRIORITY' | 'STANDARD' | 'URGENT_IN_BAY';
  createdAt: string;
  releasedAt?: string;
  releasedBy?: string;
  notes?: string;
  stockAllocated?: boolean;
}

export interface VehicleDirectoryEntry {
  plateNumber: string;
  customerName: string;
  companyName?: string;
  phone: string;
  email?: string;
  vehicleModel: string;
  preferredSpecCode?: string;
  preferredProductId?: string;
  notes?: string;
}

export const CUSTOMER_VEHICLE_DIRECTORY: VehicleDirectoryEntry[] = [
  {
    plateNumber: 'BAC 1049',
    customerName: 'Juan Dela Cruz',
    phone: '0918-554-1029',
    email: 'juandc@gmail.com',
    vehicleModel: 'Honda City 1.5 RS (2022)',
    preferredSpecCode: '205/55 R16 91V',
    preferredProductId: 'SKU-001',
  },
  {
    plateNumber: 'NDI 4821',
    customerName: 'Engr. David Tan',
    phone: '0917-550-9921',
    email: 'david.tan@tanengineers.com',
    vehicleModel: 'Toyota Fortuner 2.8 4x4 (2023)',
    preferredSpecCode: '265/60 R18 110H',
    preferredProductId: 'SKU-003',
  },
  {
    plateNumber: 'NXX 902',
    customerName: 'Capt. Ramos',
    companyName: 'ABC Logistics Inc.',
    phone: '0917-882-9901',
    email: 'fleet@abclogistics.ph',
    vehicleModel: 'Mitsubishi L300 FB Fleet',
    preferredSpecCode: '265/60 R18 110H',
    preferredProductId: 'SKU-003',
  },
  {
    plateNumber: 'NCF 8840',
    customerName: 'Metro Logistics Procurement',
    companyName: 'Metro Logistics & Transport Corp.',
    phone: '0917-882-3341',
    email: 'procurement@metrologistics.ph',
    vehicleModel: 'Isuzu Elf Truck Fleet',
    preferredSpecCode: '195/80 R15 107/105S',
  },
];

export const INITIAL_PRODUCTS: TireProduct[] = [
  {
    id: 'SKU-001',
    brand: 'Michelin',
    model: 'Primacy 4 ST',
    specCode: '205/55 R16 91V',
    width: 205,
    profile: 55,
    rim: 'R16',
    price: 4500,
    wholesaleCost: 3550,
    stock: 12,
    stockReserved: 4,
    dotBatchCode: 'DOT 1425',
    barcode: '4981910884011',
    binLocation: 'RACK-A-01',
    category: 'Passenger Car Radial (PCR)',
    minStockThreshold: 8,
    terrain: 'Touring',
    speedRating: 'V (240 km/h)',
    loadIndex: '91',
    loadCapacity: '615 kg',
    speedMax: '240 km/h',
    treadwear: '340 AA',
    traction: 'A',
    temperature: 'A',
    warranty: '5 Years Limited Warranty',
    recommendedUse: 'Executive Sedans, City & Highway Commute (Ultra-Quiet Ride)',
    badge: 'Popular Choice'
  },
  {
    id: 'SKU-002',
    brand: 'Bridgestone',
    model: 'Ecopia EP150',
    specCode: '195/65 R15 91H',
    width: 195,
    profile: 65,
    rim: 'R15',
    price: 3600,
    wholesaleCost: 2850,
    stock: 4,
    stockReserved: 2,
    dotBatchCode: 'DOT 4924',
    barcode: '4968814981120',
    binLocation: 'RACK-A-02',
    category: 'Passenger Car Radial (PCR)',
    minStockThreshold: 8,
    terrain: 'Highway Terrain (HT)',
    speedRating: 'H (210 km/h)',
    loadIndex: '91',
    loadCapacity: '615 kg',
    speedMax: '210 km/h',
    treadwear: '380 A',
    traction: 'A',
    temperature: 'B',
    warranty: '3 Years Factory Warranty',
    recommendedUse: 'Fuel-Efficient Compacts, Fleet Taxis & Commuter Vans',
    badge: 'Eco Saver'
  },
  {
    id: 'SKU-003',
    brand: 'Yokohama',
    model: 'Geolandar A/T G015',
    specCode: '265/60 R18 110H',
    width: 265,
    profile: 60,
    rim: 'R18',
    price: 8800,
    wholesaleCost: 6950,
    stock: 16,
    stockReserved: 8,
    dotBatchCode: 'DOT 0625',
    barcode: '4968814981137',
    binLocation: 'RACK-B-04',
    category: 'SUV / 4x4 All-Terrain',
    minStockThreshold: 12,
    terrain: 'All-Terrain (AT)',
    speedRating: 'H (210 km/h)',
    loadIndex: '110',
    loadCapacity: '1,060 kg',
    speedMax: '210 km/h',
    treadwear: '600 A',
    traction: 'A',
    temperature: 'B',
    warranty: '5 Years Manufacturer Warranty',
    recommendedUse: 'Mid-to-Full Size SUVs, Pickups, Heavy Payloads & Gravel/Provincial Roads',
    badge: 'Fleet Preferred'
  },
  {
    id: 'SKU-004',
    brand: 'Goodyear',
    model: 'Eagle F1 Sport',
    specCode: '215/45 R17 91Y',
    width: 215,
    profile: 45,
    rim: 'R17',
    price: 5200,
    wholesaleCost: 4100,
    stock: 2,
    stockReserved: 2,
    dotBatchCode: 'DOT 0225',
    barcode: '4981910884042',
    binLocation: 'RACK-C-01',
    category: 'Ultra High Performance (UHP)',
    minStockThreshold: 6,
    terrain: 'Performance',
    speedRating: 'Y (300 km/h)',
    loadIndex: '91',
    loadCapacity: '615 kg',
    speedMax: '300 km/h',
    treadwear: '300 AA',
    traction: 'AA',
    temperature: 'A',
    warranty: '4 Years Replacement Warranty',
    recommendedUse: 'Sport Sedans & Hot Hatches (Dynamic Grip & Precise Steering Response)',
    badge: 'Track Inspired'
  },
  {
    id: 'SKU-005',
    brand: 'Continental',
    model: 'UltraContact UC6',
    specCode: '185/60 R15 88H',
    width: 185,
    profile: 60,
    rim: 'R15',
    price: 3850,
    wholesaleCost: 3050,
    stock: 8,
    stockReserved: 0,
    dotBatchCode: 'DOT 1925',
    barcode: '4981910884059',
    binLocation: 'RACK-C-02',
    category: 'Passenger Car Radial (PCR)',
    minStockThreshold: 8,
    terrain: 'Touring',
    speedRating: 'H (210 km/h)',
    loadIndex: '88',
    loadCapacity: '560 kg',
    speedMax: '210 km/h',
    treadwear: '360 A',
    traction: 'A',
    temperature: 'A',
    warranty: '5 Years Confidence Guarantee',
    recommendedUse: 'Subcompact Vehicles & Urban Daily Driving (Exceptional Wet Braking)',
    badge: 'Wet Braking Spec'
  },
  {
    id: 'SKU-006',
    brand: 'Dunlop',
    model: 'Grandtrek AT5',
    specCode: '265/65 R17 112S',
    width: 265,
    profile: 65,
    rim: 'R17',
    price: 7400,
    wholesaleCost: 5900,
    stock: 0,
    stockReserved: 0,
    dotBatchCode: 'DOT 5124',
    barcode: '4981910884066',
    binLocation: 'PALLET-P-03',
    category: 'Commercial Light Truck / 4x4',
    minStockThreshold: 6,
    terrain: 'All-Terrain (AT)',
    speedRating: 'S (180 km/h)',
    loadIndex: '112',
    loadCapacity: '1,120 kg',
    speedMax: '180 km/h',
    treadwear: '540 A',
    traction: 'A',
    temperature: 'B',
    warranty: '3 Years Factory Warranty',
    recommendedUse: 'Utility 4x4s, Provincial Transport & Construction Fleet Rigs',
    badge: 'Heavy Duty'
  }
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ORD-9932',
    customerName: 'ABC Logistics Inc. (Attn: Capt. Ramos)',
    companyName: 'ABC Logistics Inc.',
    plateNumber: 'NXX 902',
    vehicleModel: 'Mitsubishi L300 FB Fleet',
    assignedBay: 2,
    bookingRef: 'SB-2026-8802',
    phone: '0917-882-9901',
    email: 'fleet@abclogistics.ph',
    items: [
      { productName: 'Yokohama Geolandar A/T G015', specCode: '265/60 R18 110H', quantity: 8, unitPrice: 8800, dotBatchCode: 'DOT 0625' }
    ],
    amount: 70400,
    fulfillmentType: 'Installation at QC Branch',
    paymentMethod: 'Bank Transfer (BDO)',
    paymentStatus: 'Under Review',
    fulfillmentStatus: 'Not Started',
    status: 'Pending Verification',
    referenceNumber: 'BDO-8839201',
    submissionDate: '2026-09-17 08:45 AM',
    proofImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ORD-9935',
    customerName: 'Juan Dela Cruz',
    plateNumber: 'BAC 1049',
    vehicleModel: 'Honda City 1.5 RS (2022)',
    assignedBay: 1,
    bookingRef: 'SB-2026-8803',
    phone: '0918-554-1029',
    email: 'juandc@gmail.com',
    items: [
      { productName: 'Michelin Primacy 4 ST', specCode: '205/55 R16 91V', quantity: 4, unitPrice: 4500, dotBatchCode: 'DOT 1425' }
    ],
    amount: 18000,
    fulfillmentType: 'Installation at QC Branch',
    paymentMethod: 'PayMongo Gateway',
    paymentStatus: 'Under Review',
    fulfillmentStatus: 'Not Started',
    status: 'Pending Verification',
    referenceNumber: 'GC-9920104',
    submissionDate: '2026-09-17 09:12 AM',
    proofImageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ORD-9940',
    customerName: 'Engr. David Tan',
    plateNumber: 'NDI 4821',
    vehicleModel: 'Toyota Fortuner 2.8 4x4 (2023)',
    assignedBay: 1,
    bookingRef: 'SB-2026-8801',
    phone: '0917-550-9921',
    email: 'david.tan@tanengineers.com',
    items: [
      { productName: 'Yokohama Geolandar A/T G015', specCode: '265/60 R18 110H', quantity: 4, unitPrice: 8800, dotBatchCode: 'DOT 0625' }
    ],
    amount: 35200,
    fulfillmentType: 'Installation at QC Branch',
    paymentMethod: 'Bank Transfer (BDO)',
    paymentStatus: 'Cleared',
    fulfillmentStatus: 'Allocated',
    status: 'Payment Verified',
    amountReceived: 35200,
    quickBooksSyncId: 'QB-JE-2026-8842',
    referenceNumber: 'BDO-9921840',
    submissionDate: '2026-09-17 07:30 AM',
    proofImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ORD-9950',
    customerName: 'Metro Logistics & Transport Corp.',
    companyName: 'Metro Logistics & Transport Corp.',
    plateNumber: 'NCF 8840 (Fleet)',
    vehicleModel: 'Isuzu Elf Truck Fleet (16 Units)',
    phone: '0917-882-3341',
    email: 'procurement@metrologistics.ph',
    items: [
      { productName: 'Yokohama Geolandar A/T G015', specCode: '265/60 R18 110H', quantity: 16, unitPrice: 8800, dotBatchCode: 'DOT 0625' }
    ],
    amount: 119680,
    fulfillmentType: 'Warehouse Bulk Pallet Delivery',
    deliveryAddress: 'Lot 12 Block 4, Industrial Ave, Novaliches, Quezon City',
    paymentMethod: '30/60/90 Days PDC',
    paymentStatus: 'Under Review',
    fulfillmentStatus: 'Not Started',
    status: 'Pending Verification',
    referenceNumber: 'PDC-BDO-0094182-84',
    submissionDate: '2026-09-17 10:15 AM',
    proofImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    pdcSchedule: [
      { tranche: 1, days: 30, amount: 39893.33, checkNo: 'CHK-BDO-0094182', dueDate: 'October 19, 2026', bank: 'BDO Unibank', status: 'In Vault (Pending Clearance)' },
      { tranche: 2, days: 60, amount: 39893.33, checkNo: 'CHK-BDO-0094183', dueDate: 'November 18, 2026', bank: 'BDO Unibank', status: 'In Vault (Pending Clearance)' },
      { tranche: 3, days: 90, amount: 39893.34, checkNo: 'CHK-BDO-0094184', dueDate: 'December 18, 2026', bank: 'BDO Unibank', status: 'In Vault (Pending Clearance)' }
    ]
  }
];

export const INITIAL_BOOKINGS: ShopBooking[] = [
  {
    id: 'SB-2026-8801',
    bay: 1,
    timeSlot: '09:00 AM',
    customerName: 'Mark Santos',
    plateNumber: 'NDI 4821',
    vehicleModel: 'Toyota Fortuner (2023)',
    phone: '0917-332-1190',
    email: 'mark.santos@yahoo.com',
    date: 'Today',
    services: ['Wheel Alignment (3D)', 'Tire Mounting & Valve Replacement', '10-Point Safety Check'],
    totalCost: 0,
    status: 'Completed',
    paymentStatus: 'Paid',
    notes: 'Purchased 4 Yokohama tires - Free Alignment applied.'
  },
  {
    id: 'SB-2026-8802',
    bay: 2,
    timeSlot: '10:30 AM',
    customerName: 'Rizal Fleet Corp (Driver: Gary)',
    plateNumber: 'NXX 902',
    vehicleModel: 'Mitsubishi L300 FB',
    phone: '0922-801-4920',
    email: 'operations@rizalfleet.ph',
    date: 'Today',
    services: ['Tire Mounting & Valve Replacement', 'Wheel Balancing & Weights'],
    totalCost: 800,
    status: 'Vehicle in Bay (In Progress)',
    paymentStatus: 'Paid',
    notes: '2 tires mounted and balanced on Front axle.'
  },
  {
    id: 'SB-2026-8803',
    bay: 1,
    timeSlot: '01:00 PM',
    customerName: 'Elena Gomez',
    plateNumber: 'BAC 1049',
    vehicleModel: 'Honda City (2022)',
    phone: '0998-124-7733',
    email: 'elena.gomez@gmail.com',
    date: 'Today',
    services: ['Wheel Alignment (3D)', '10-Point Auto Safety Checkup'],
    totalCost: 800,
    status: 'Waiting for Arrival',
    paymentStatus: 'Unpaid',
    notes: 'Customer reported slight pull to the right on EDSA.'
  }
];

export const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '01:00 PM',
  '02:30 PM',
  '04:00 PM'
];

export const VEHICLE_DATABASE: Record<string, { models: string[]; specMapping: Record<string, { width: number; profile: number; rim: string }> }> = {
  Toyota: {
    models: ['Fortuner', 'Hilux', 'Vios', 'Innova'],
    specMapping: {
      Fortuner: { width: 265, profile: 60, rim: 'R18' },
      Hilux: { width: 265, profile: 65, rim: 'R17' },
      Vios: { width: 185, profile: 60, rim: 'R15' },
      Innova: { width: 205, profile: 55, rim: 'R16' }
    }
  },
  Honda: {
    models: ['Civic', 'CR-V', 'City'],
    specMapping: {
      Civic: { width: 215, profile: 45, rim: 'R17' },
      'CR-V': { width: 225, profile: 60, rim: 'R18' },
      City: { width: 185, profile: 60, rim: 'R15' }
    }
  },
  Mitsubishi: {
    models: ['Montero Sport', 'L300', 'Xpander'],
    specMapping: {
      'Montero Sport': { width: 265, profile: 60, rim: 'R18' },
      L300: { width: 195, profile: 65, rim: 'R15' },
      Xpander: { width: 205, profile: 55, rim: 'R16' }
    }
  },
  Ford: {
    models: ['Ranger', 'Everest', 'Territory'],
    specMapping: {
      Ranger: { width: 265, profile: 65, rim: 'R17' },
      Everest: { width: 265, profile: 60, rim: 'R18' },
      Territory: { width: 215, profile: 45, rim: 'R17' }
    }
  },
  Nissan: {
    models: ['Navara', 'Terra', 'Almera'],
    specMapping: {
      Navara: { width: 265, profile: 60, rim: 'R18' },
      Terra: { width: 265, profile: 60, rim: 'R18' },
      Almera: { width: 195, profile: 65, rim: 'R15' }
    }
  },
  Isuzu: {
    models: ['D-Max', 'mu-X'],
    specMapping: {
      'D-Max': { width: 265, profile: 65, rim: 'R17' },
      'mu-X': { width: 265, profile: 60, rim: 'R18' }
    }
  }
};

export const INITIAL_MOVEMENTS: StockMovementRecord[] = [
  {
    id: 'MOV-8805',
    timestamp: 'Today 11:45 AM',
    sku: 'SKU-001',
    productName: 'Michelin Primacy 4 ST',
    type: 'Stock Intake (PO Check-In)',
    quantity: 8,
    sourceLocation: 'Supplier (Michelin Hub PH)',
    destinationLocation: 'RACK-A-01',
    performedBy: 'Dave Altavano (Shop Intern)',
    role: 'ROLE_INTERN',
    notes: 'Zero-training guided intake: scanned barcode 4981910884011, batch DOT 1425.'
  },
  {
    id: 'MOV-8804',
    timestamp: 'Today 11:20 AM',
    sku: 'SKU-004',
    productName: 'Goodyear Eagle F1 Sport',
    type: 'Cycle Count Reconciliation',
    quantity: 2,
    sourceLocation: 'RACK-C-01',
    destinationLocation: 'RACK-C-01 (Audited)',
    performedBy: 'Elena Santos (Inventory Manager)',
    role: 'ROLE_MANAGER',
    notes: 'Weekly physical count verified match against digital ledger. 0 variance.'
  },
  {
    id: 'MOV-8803',
    timestamp: 'Today 10:10 AM',
    sku: 'SKU-002',
    productName: 'Bridgestone Ecopia EP150',
    type: 'Bin-to-Bin Transfer',
    quantity: 4,
    sourceLocation: 'RECEIVING-DOCK-B',
    destinationLocation: 'RACK-A-02',
    performedBy: 'Marco Ramos (Warehouse Clerk)',
    role: 'ROLE_CLERK',
    notes: 'Relocated from temporary inbound staging to pick bin A-02.'
  },
  {
    id: 'MOV-8802',
    timestamp: 'Today 09:30 AM',
    sku: 'SKU-001',
    productName: 'Michelin Primacy 4 ST',
    type: 'Bay Handover (Dispatch)',
    quantity: 4,
    sourceLocation: 'RACK-A-01',
    destinationLocation: 'Bay 1 (Hunter 3D Hawkeye)',
    performedBy: 'Dave Altavano (Shop Intern)',
    role: 'ROLE_INTERN',
    workOrderRef: 'JOB-QC-104',
    notes: 'Dispatched 4 units for plate NCF 8840 Toyota Fortuner installation.'
  },
  {
    id: 'MOV-8801',
    timestamp: 'Today 08:15 AM',
    sku: 'SKU-003',
    productName: 'Yokohama Geolandar A/T G015',
    type: 'Stock Intake (PO Check-In)',
    quantity: 16,
    sourceLocation: 'Supplier (Yokohama PH Hub)',
    destinationLocation: 'RACK-B-04',
    performedBy: 'Marco Ramos (Warehouse Clerk)',
    role: 'ROLE_CLERK',
    notes: 'Inbound PO #PO-2026-991 pallet delivery verified against delivery receipt.'
  },
  {
    id: 'MOV-8798',
    timestamp: 'Yesterday 04:45 PM',
    sku: 'SKU-002',
    productName: 'Bridgestone Ecopia EP150',
    type: 'Bay Handover (Dispatch)',
    quantity: 4,
    sourceLocation: 'RACK-A-02',
    destinationLocation: 'Bay 2 (Corghi Mount)',
    performedBy: 'Dave Altavano (Shop Intern)',
    role: 'ROLE_INTERN',
    workOrderRef: 'JOB-QC-099',
    notes: 'Dispatched 4 units for Fleet Taxi Avanza plate TXI-4029.'
  },
  {
    id: 'MOV-8790',
    timestamp: 'Sep 22, 2026 02:15 PM',
    sku: 'SKU-006',
    productName: 'Dunlop Grandtrek AT5',
    type: 'Damage / Scrap Logging',
    quantity: 1,
    sourceLocation: 'RACK-C-03',
    destinationLocation: 'Quarantine / Inspection Shelf',
    performedBy: 'Marco Ramos (Warehouse Clerk)',
    role: 'ROLE_CLERK',
    notes: 'Sidewall puncture incurred during transport unstrapping. Awaiting supplier credit claim.'
  },
  {
    id: 'MOV-8785',
    timestamp: 'Sep 21, 2026 10:00 AM',
    sku: 'SKU-005',
    productName: 'Continental UltraContact UC6',
    type: 'Stock Intake (PO Check-In)',
    quantity: 12,
    sourceLocation: 'Continental Logistics PH',
    destinationLocation: 'RACK-C-02',
    performedBy: 'Marco Ramos (Warehouse Clerk)',
    role: 'ROLE_CLERK',
    notes: 'Batch intake of fresh 2025 inventory. Barcode 4981910884059.'
  }
];

export const INITIAL_RELEASE_NOTIFICATIONS: ReleaseNotification[] = [
  {
    id: 'REL-1049',
    sourceType: 'service_bay',
    refId: 'SB-2026-8802',
    bayName: 'Bay 2 (Corghi Master Leverless)',
    plateNumber: 'NXX 902',
    vehicleModel: 'Mitsubishi L300 FB (Rizal Fleet)',
    customerName: 'Gary / Rizal Fleet Corp',
    productSku: 'SKU-002',
    productName: 'Bridgestone Ecopia EP150 (195/65 R15)',
    quantity: 2,
    binLocation: 'RACK-A-02',
    status: 'PENDING_RELEASE',
    urgency: 'URGENT_IN_BAY',
    createdAt: '10:32 AM (5 mins ago)',
    notes: 'Vehicle raised on lift in Bay 2. Mechanics Gary & Lando waiting for 2x front tires.'
  },
  {
    id: 'REL-1050',
    sourceType: 'verified_order',
    refId: 'ORD-9940',
    bayName: 'Bay 1 (Hunter 3D Hawkeye)',
    plateNumber: 'NDI 4821',
    vehicleModel: 'Toyota Fortuner 2.8 4x4 (2023)',
    customerName: 'Engr. David Tan',
    productSku: 'SKU-003',
    productName: 'Yokohama Geolandar A/T G015 (265/60 R18)',
    quantity: 4,
    binLocation: 'RACK-B-04',
    status: 'PENDING_RELEASE',
    urgency: 'HIGH_PRIORITY',
    createdAt: '09:15 AM',
    notes: 'Payment verified via BDO Bank Transfer. Complete 4-tire set ready for mounting.'
  },
  {
    id: 'REL-1048',
    sourceType: 'counter_pickup',
    refId: 'ORD-9920',
    bayName: 'Counter Desk Pickup',
    plateNumber: 'WALK-IN',
    vehicleModel: 'Honda City 1.5 RS',
    customerName: 'Engr. Ronald Velasco',
    productSku: 'SKU-005',
    productName: 'Continental UltraContact UC6 (185/60 R15)',
    quantity: 2,
    binLocation: 'RACK-C-02',
    status: 'PENDING_RELEASE',
    urgency: 'STANDARD',
    createdAt: '08:45 AM',
    notes: 'Customer at counter waiting for pickup receipt verification.'
  },
  {
    id: 'REL-1045',
    sourceType: 'service_bay',
    refId: 'SB-2026-8801',
    bayName: 'Bay 1 (Hunter 3D Hawkeye)',
    plateNumber: 'NDI 4821',
    vehicleModel: 'Toyota Fortuner (2023)',
    customerName: 'Mark Santos',
    productSku: 'SKU-001',
    productName: 'Michelin Primacy 4 ST (205/55 R16)',
    quantity: 4,
    binLocation: 'RACK-A-01',
    status: 'RELEASED',
    urgency: 'HIGH_PRIORITY',
    createdAt: '09:05 AM',
    releasedAt: '09:30 AM',
    releasedBy: 'Dave Altavano (Shop Intern)',
    notes: 'Poka-Yoke verified serials handed over to lead alignment technician.'
  }
];
