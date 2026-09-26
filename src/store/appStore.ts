import { create } from 'zustand';
import {
  TireProduct,
  B2BQuoteItem,
  ShopBooking,
  OrderRecord,
  StaffRole,
  STAFF_PROFILES,
  StockMovementRecord,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_BOOKINGS,
  INITIAL_MOVEMENTS,
  ReleaseNotification,
  ReleaseLine,
  INITIAL_RELEASE_NOTIFICATIONS,
} from '../data';
import {
  playDispatchAlertChime,
  playDispatchSuccessChime,
  getAvailableStock,
  canReserve,
  isPaymentAmountAcceptable,
  findBaySlotConflict,
  fefoHint,
} from '../utils';
import type { AppViewMode } from '../types/views';
import {
  canReleaseStock,
  canCancelRelease,
  canVerifyPayment,
  canEditInventoryMaster,
  canManageWarehouseOps,
  canAccessFleetQuotes,
  canAccessBays,
  canRequestStockPull,
  roleHomeView,
} from '../rbac';

interface AppState {
  activeRole: StaffRole;
  currentView: AppViewMode;
  isSoundMuted: boolean;
  toastMessage: string | null;
  isBookingModalOpen: boolean;
  selectedTireForBooking: TireProduct | null;

  products: TireProduct[];
  orders: OrderRecord[];
  bookings: ShopBooking[];
  movements: StockMovementRecord[];
  releaseNotifications: ReleaseNotification[];
  quoteItems: B2BQuoteItem[];

  setActiveRole: (role: StaffRole) => void;
  setCurrentView: (view: AppViewMode) => void;
  toggleSound: () => void;
  triggerToast: (msg: string) => void;
  clearToast: () => void;

  updateProductStock: (productId: string, newStock: number) => void;
  updateMinThreshold: (productId: string, newThreshold: number) => void;
  saveProduct: (product: TireProduct) => void;
  archiveProduct: (productId: string) => void;
  addMovement: (mov: Omit<StockMovementRecord, 'id' | 'timestamp'>) => void;

  addToQuote: (product: TireProduct, qty?: number) => void;
  updateQuoteQuantity: (productId: string, quantity: number) => void;
  removeQuoteItem: (productId: string) => void;
  clearQuote: () => void;
  convertQuoteToOrder: (meta: {
    companyName: string;
    attention: string;
    phone: string;
    email: string;
    paymentTerms: string;
    deliveryAddress?: string;
  }) => string | null;

  openBookingModal: (product: TireProduct | null) => void;
  closeBookingModal: () => void;
  confirmBooking: (
    bookingData: ShopBooking | Omit<ShopBooking, 'id'>,
    tiresOrdered?: { product: TireProduct; quantity: number }
  ) => void;

  updateBookingStatus: (bookingId: string, status: ShopBooking['status']) => void;
  verifyOrder: (orderId: string, amountReceived?: number) => void;
  rejectOrder: (orderId: string, reason: string) => void;

  fulfillReleaseTicket: (
    ticketId: string,
    product: TireProduct,
    quantity: number,
    targetDestination: string,
    workOrderRef: string
  ) => void;
  cancelReleaseTicket: (ticketId: string, reason?: string) => void;
  simulateNewAlert: () => void;
  openDispatchForTicket: (ticket: ReleaseNotification) => void;

  requestTireFromWarehouse: (
    product: TireProduct,
    quantity: number,
    customerName: string,
    plateNumber: string,
    destination?: string
  ) => void;

  copyCustomerTrackingLink: (query: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function genId(prefix: string, min = 1000, range = 9000): string {
  return `${prefix}${Math.floor(min + Math.random() * range)}`;
}

function nowLabel(): string {
  return (
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' Today'
  );
}

/** Positive integer quantity (tires are whole units). */
function asPositiveInt(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.floor(value));
}

function matchProductForOrderLine(
  products: TireProduct[],
  item: { productName: string; specCode: string }
): TireProduct | undefined {
  const bySpec = products.find((p) => p.specCode === item.specCode);
  if (bySpec) return bySpec;
  const byId = products.find((p) => p.id === item.specCode || p.id === item.productName);
  if (byId) return byId;
  const name = item.productName.toLowerCase().trim();
  if (!name) return undefined;
  return products.find((p) => {
    const label = `${p.brand} ${p.model}`.toLowerCase();
    return label === name || name.includes(label) || label.includes(name);
  });
}

function ticketLines(ticket: ReleaseNotification): ReleaseLine[] {
  if (ticket.lines && ticket.lines.length > 0) return ticket.lines;
  return [
    {
      productSku: ticket.productSku,
      productName: ticket.productName,
      quantity: ticket.quantity,
      binLocation: ticket.binLocation,
      fulfilledQty: 0,
    },
  ];
}

function remainingOnLine(line: ReleaseLine): number {
  return Math.max(0, line.quantity - (line.fulfilledQty ?? 0));
}

export const useAppStore = create<AppState>((set, get) => ({
  activeRole: 'ROLE_INTERN',
  currentView: 'sales_desk',
  isSoundMuted: false,
  toastMessage: null,
  isBookingModalOpen: false,
  selectedTireForBooking: null,

  products: INITIAL_PRODUCTS,
  orders: INITIAL_ORDERS,
  bookings: INITIAL_BOOKINGS,
  movements: INITIAL_MOVEMENTS,
  releaseNotifications: INITIAL_RELEASE_NOTIFICATIONS,
  quoteItems: [
    {
      product: INITIAL_PRODUCTS[2],
      quantity: 16,
    },
  ],

  setActiveRole: (newRole) => {
    const profile = STAFF_PROFILES[newRole];
    const home = roleHomeView(newRole);
    set({ activeRole: newRole, currentView: home });
    get().triggerToast(`${profile.title} · ${profile.name}`);
  },

  setCurrentView: (view) => {
    const { activeRole } = get();
    const allowed = STAFF_PROFILES[activeRole].allowedViews;
    if (!allowed.includes(view)) {
      get().triggerToast('That screen is not available for your role.');
      return;
    }
    set({ currentView: view });
  },

  toggleSound: () => set((s) => ({ isSoundMuted: !s.isSoundMuted })),

  triggerToast: (msg) => {
    const text = (msg || '').trim();
    if (!text) return;
    if (toastTimer) clearTimeout(toastTimer);
    set({ toastMessage: text });
    toastTimer = setTimeout(() => {
      set({ toastMessage: null });
      toastTimer = null;
    }, 4000);
  },

  clearToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toastMessage: null });
  },

  updateProductStock: (productId, newStock) => {
    const { products, activeRole } = get();
    if (!canManageWarehouseOps(activeRole) && !canEditInventoryMaster(activeRole)) {
      get().triggerToast('You cannot adjust on-hand stock.');
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) {
      get().triggerToast('Product not found.');
      return;
    }
    const stock = asPositiveInt(newStock, product.stock);
    const reserved = product.stockReserved ?? 0;
    if (stock < reserved) {
      get().triggerToast(
        `On-hand cannot be below reserved (${reserved}). Set at least ${reserved}.`
      );
      return;
    }
    set((s) => ({
      products: s.products.map((p) => (p.id === productId ? { ...p, stock } : p)),
    }));
  },

  updateMinThreshold: (productId, newThreshold) => {
    const { activeRole } = get();
    if (!canEditInventoryMaster(activeRole)) {
      get().triggerToast('Only Manager or Admin can change min stock.');
      return;
    }
    const threshold = asPositiveInt(newThreshold, 0);
    set((s) => ({
      products: s.products.map((p) =>
        p.id === productId ? { ...p, minStockThreshold: threshold } : p
      ),
    }));
    get().triggerToast('Minimum stock threshold updated.');
  },

  saveProduct: (updatedProduct) => {
    const { activeRole, products } = get();
    if (!canEditInventoryMaster(activeRole)) {
      get().triggerToast('Only Manager or Admin can edit the item master.');
      return;
    }
    if (!updatedProduct.id?.trim() || !updatedProduct.brand?.trim() || !updatedProduct.model?.trim()) {
      get().triggerToast('SKU, brand, and model are required.');
      return;
    }
    const stock = asPositiveInt(updatedProduct.stock, 0);
    const existing = products.find((p) => p.id === updatedProduct.id);
    const reserved = existing?.stockReserved ?? updatedProduct.stockReserved ?? 0;
    if (stock < reserved) {
      get().triggerToast(`On-hand (${stock}) cannot be below reserved (${reserved}).`);
      return;
    }
    const safe: TireProduct = {
      ...updatedProduct,
      stock,
      stockReserved: reserved,
      minStockThreshold: asPositiveInt(updatedProduct.minStockThreshold, 0),
      price: Math.max(0, Number(updatedProduct.price) || 0),
    };
    set((s) => {
      const exists = s.products.some((p) => p.id === safe.id);
      return {
        products: exists
          ? s.products.map((p) => (p.id === safe.id ? { ...p, ...safe, stockReserved: p.stockReserved ?? 0 } : p))
          : [safe, ...s.products],
      };
    });
    get().triggerToast(`Saved ${safe.brand} ${safe.model}`);
  },

  archiveProduct: (productId) => {
    const { activeRole, products, releaseNotifications } = get();
    if (!canEditInventoryMaster(activeRole)) {
      get().triggerToast('Only Manager or Admin can archive products.');
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) {
      get().triggerToast('Product not found.');
      return;
    }
    if ((product.stockReserved ?? 0) > 0) {
      get().triggerToast('Cannot archive: stock is still reserved. Cancel open tickets first.');
      return;
    }
    const openTicket = releaseNotifications.some(
      (t) =>
        t.status === 'PENDING_RELEASE' &&
        (t.productSku === productId || t.lines?.some((l) => l.productSku === productId))
    );
    if (openTicket) {
      get().triggerToast('Cannot archive: open release ticket still references this SKU.');
      return;
    }
    set((s) => ({ products: s.products.filter((p) => p.id !== productId) }));
    get().triggerToast(`Archived ${productId}`);
  },

  addMovement: (newMov) => {
    const qty = asPositiveInt(newMov.quantity, 0);
    if (qty <= 0) return;
    const record: StockMovementRecord = {
      ...newMov,
      quantity: qty,
      id: genId('MOV-', 8810, 9000),
      timestamp: nowLabel(),
    };
    set((s) => ({ movements: [record, ...s.movements] }));
  },

  addToQuote: (product, qty = 8) => {
    const n = asPositiveInt(qty, 8) || 1;
    set((s) => {
      const existing = s.quoteItems.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          quoteItems: s.quoteItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + n }
              : item
          ),
        };
      }
      return { quoteItems: [...s.quoteItems, { product, quantity: n }] };
    });
    get().triggerToast(`Added ${product.brand} ${product.model} to quote`);
  },

  updateQuoteQuantity: (productId, quantity) => {
    const n = asPositiveInt(quantity, 1);
    if (n < 1) {
      get().removeQuoteItem(productId);
      return;
    }
    set((s) => ({
      quoteItems: s.quoteItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: n } : item
      ),
    }));
  },

  removeQuoteItem: (productId) => {
    set((s) => ({
      quoteItems: s.quoteItems.filter((item) => item.product.id !== productId),
    }));
  },

  clearQuote: () => set({ quoteItems: [] }),

  convertQuoteToOrder: (meta) => {
    const { quoteItems, activeRole } = get();
    if (!canAccessFleetQuotes(activeRole)) {
      get().triggerToast('Only Manager or Admin can convert fleet quotes.');
      return null;
    }
    if (!quoteItems.length) {
      get().triggerToast('Quote is empty.');
      return null;
    }
    if (!meta.companyName?.trim()) {
      get().triggerToast('Company name is required.');
      return null;
    }
    const lines = quoteItems.filter((qi) => asPositiveInt(qi.quantity, 0) > 0);
    if (!lines.length) {
      get().triggerToast('Quote has no valid quantities.');
      return null;
    }
    const units = lines.reduce((a, i) => a + i.quantity, 0);
    const discount = units >= 24 ? 0.1 : units >= 12 ? 0.05 : 0;
    const gross = lines.reduce((a, i) => a + i.product.price * i.quantity, 0);
    const amount = Math.round(gross * (1 - discount) * 100) / 100;
    const isPdc = (meta.paymentTerms || '').toUpperCase().includes('PDC');
    const id = genId('ORD-');
    const order: OrderRecord = {
      id,
      customerName: (meta.attention || meta.companyName).trim(),
      companyName: meta.companyName.trim(),
      phone: (meta.phone || '—').trim(),
      email: (meta.email || '—').trim(),
      items: lines.map((qi) => ({
        productName: `${qi.product.brand} ${qi.product.model}`,
        specCode: qi.product.specCode,
        quantity: qi.quantity,
        unitPrice: qi.product.price,
        dotBatchCode: qi.product.dotBatchCode,
      })),
      amount,
      fulfillmentType: 'Warehouse Bulk Pallet Delivery',
      deliveryAddress: meta.deliveryAddress?.trim(),
      paymentMethod: isPdc ? '30/60 Days PDC' : 'Bank Transfer (BDO)',
      paymentStatus: 'Under Review',
      fulfillmentStatus: 'Not Started',
      status: 'Pending Verification',
      referenceNumber: `FROM-QUOTE-${id}`,
      submissionDate: new Date().toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      quoteRef: id,
    };
    set((s) => ({ orders: [order, ...s.orders] }));
    get().triggerToast(
      `Order ${id} created (₱${amount.toLocaleString()}). Send to payment review.`
    );
    return id;
  },

  openBookingModal: (product) => {
    set({ selectedTireForBooking: product, isBookingModalOpen: true });
  },

  closeBookingModal: () => {
    set({ isBookingModalOpen: false, selectedTireForBooking: null });
  },

  confirmBooking: (bookingData, tiresOrdered) => {
    const { selectedTireForBooking, activeRole, products, bookings } = get();

    if (!bookingData.plateNumber?.trim() || !bookingData.customerName?.trim()) {
      get().triggerToast('Customer name and plate number are required.');
      return;
    }
    if (!bookingData.timeSlot || !bookingData.date) {
      get().triggerToast('Date and time slot are required.');
      return;
    }
    if (bookingData.bay !== 1 && bookingData.bay !== 2) {
      get().triggerToast('Select Bay 1 or Bay 2.');
      return;
    }

    const tireProduct = tiresOrdered?.product ?? selectedTireForBooking;
    const tireQty = asPositiveInt(
      tiresOrdered?.quantity ?? bookingData.tireQuantity ?? (tireProduct ? 4 : 0),
      0
    );

    if (tireProduct && tireQty > 0) {
      const product = products.find((p) => p.id === tireProduct.id) ?? tireProduct;
      if (!canReserve(product, tireQty)) {
        get().triggerToast(
          `Only ${getAvailableStock(product)} available for ${product.brand} ${product.model} (need ${tireQty}).`
        );
        return;
      }
    }

    const conflict = findBaySlotConflict(
      bookings,
      bookingData.bay,
      bookingData.timeSlot,
      bookingData.date,
      'id' in bookingData ? bookingData.id : undefined
    );
    if (conflict) {
      get().triggerToast(
        `Bay ${bookingData.bay} already booked at ${bookingData.timeSlot} (${conflict.plateNumber}).`
      );
      return;
    }

    const newId = 'id' in bookingData && bookingData.id ? bookingData.id : genId('APPT-QC-');
    const newBooking: ShopBooking = {
      ...bookingData,
      id: newId,
      plateNumber: bookingData.plateNumber.trim().toUpperCase(),
      customerName: bookingData.customerName.trim(),
      productId: bookingData.productId ?? tireProduct?.id,
      tireQuantity: tireQty || undefined,
    };

    set((s) => {
      let nextProducts = s.products;
      if (tireProduct && tireQty > 0) {
        nextProducts = s.products.map((p) =>
          p.id === tireProduct.id
            ? { ...p, stockReserved: (p.stockReserved ?? 0) + tireQty }
            : p
        );
      }
      return {
        products: nextProducts,
        bookings: [newBooking, ...s.bookings],
        isBookingModalOpen: false,
        selectedTireForBooking: null,
      };
    });

    if (tireProduct && tireQty > 0) {
      get().addMovement({
        sku: tireProduct.id,
        productName: `${tireProduct.brand} ${tireProduct.model}`,
        type: 'Bay Handover (Dispatch)',
        quantity: tireQty,
        sourceLocation: tireProduct.binLocation,
        destinationLocation: `Bay ${newBooking.bay}`,
        performedBy: STAFF_PROFILES[activeRole].name,
        role: activeRole,
        workOrderRef: newId,
        notes: `RESERVED (not yet released). ${fefoHint(tireProduct)}`,
      });

      const ticket: ReleaseNotification = {
        id: genId('REL-'),
        sourceType: 'service_bay',
        refId: newId,
        bayName: `Bay ${newBooking.bay}`,
        plateNumber: newBooking.plateNumber,
        vehicleModel: newBooking.vehicleModel,
        customerName: newBooking.customerName,
        productSku: tireProduct.id,
        productName: `${tireProduct.brand} ${tireProduct.model} (${tireProduct.specCode})`,
        quantity: tireQty,
        binLocation: tireProduct.binLocation,
        lines: [
          {
            productSku: tireProduct.id,
            productName: `${tireProduct.brand} ${tireProduct.model}`,
            quantity: tireQty,
            binLocation: tireProduct.binLocation,
            dotBatchCode: tireProduct.dotBatchCode,
            fulfilledQty: 0,
          },
        ],
        status: 'PENDING_RELEASE',
        urgency: 'HIGH_PRIORITY',
        createdAt: 'Just Now',
        notes: `Reserved on booking. ${fefoHint(tireProduct)}`,
        stockAllocated: true,
      };
      set((s) => ({
        releaseNotifications: [ticket, ...s.releaseNotifications],
      }));
    }

    get().triggerToast(
      tireQty > 0 && tireProduct
        ? `${newId}: ${tireQty}x reserved · Bay ${newBooking.bay} · ${newBooking.timeSlot}`
        : `${newId} booked · Bay ${newBooking.bay}`
    );
  },

  updateBookingStatus: (bookingId, newStatus) => {
    const { bookings, releaseNotifications, isSoundMuted, products, activeRole } = get();
    if (!canAccessBays(activeRole)) {
      get().triggerToast('Your role cannot update service bays.');
      return;
    }

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      get().triggerToast('Booking not found.');
      return;
    }
    if (booking.status === newStatus) return;

    // Closing a job: free reserved stock still sitting on pending tickets for this booking
    if (newStatus === 'Completed' || newStatus === 'Cancelled') {
      const pending = releaseNotifications.filter(
        (t) => t.refId === bookingId && t.status === 'PENDING_RELEASE'
      );
      for (const t of pending) {
        get().cancelReleaseTicket(t.id, `Booking ${newStatus.toLowerCase()}`);
      }
    }

    set((s) => ({
      bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
    }));

    if (newStatus === 'Vehicle in Bay (In Progress)') {
      const existingTicket = releaseNotifications.find(
        (t) => t.refId === booking.id && t.status === 'PENDING_RELEASE'
      );
      if (existingTicket) {
        set((s) => ({
          releaseNotifications: s.releaseNotifications.map((t) =>
            t.id === existingTicket.id ? { ...t, urgency: 'URGENT_IN_BAY' as const } : t
          ),
        }));
      } else if (booking.productId) {
        const productMatch = products.find((p) => p.id === booking.productId);
        const qty = asPositiveInt(booking.tireQuantity ?? 4, 4);
        // Only create ticket if we can still reserve (or product already reserved at book time)
        if (productMatch && canReserve(productMatch, qty)) {
          set((s) => ({
            products: s.products.map((p) =>
              p.id === productMatch.id
                ? { ...p, stockReserved: (p.stockReserved ?? 0) + qty }
                : p
            ),
          }));
          const ticket: ReleaseNotification = {
            id: genId('REL-'),
            sourceType: 'service_bay',
            refId: booking.id,
            bayName: `Bay ${booking.bay}`,
            plateNumber: booking.plateNumber,
            vehicleModel: booking.vehicleModel,
            customerName: booking.customerName,
            productSku: productMatch.id,
            productName: `${productMatch.brand} ${productMatch.model}`,
            quantity: qty,
            binLocation: productMatch.binLocation,
            lines: [
              {
                productSku: productMatch.id,
                productName: `${productMatch.brand} ${productMatch.model}`,
                quantity: qty,
                binLocation: productMatch.binLocation,
                dotBatchCode: productMatch.dotBatchCode,
                fulfilledQty: 0,
              },
            ],
            status: 'PENDING_RELEASE',
            urgency: 'URGENT_IN_BAY',
            createdAt: 'Just Now',
            notes: `Vehicle in bay — pull ${qty} units.`,
            stockAllocated: true,
          };
          set((s) => ({
            releaseNotifications: [ticket, ...s.releaseNotifications],
          }));
        } else if (productMatch) {
          // Stock already reserved at booking — open ticket without double-reserve
          const ticket: ReleaseNotification = {
            id: genId('REL-'),
            sourceType: 'service_bay',
            refId: booking.id,
            bayName: `Bay ${booking.bay}`,
            plateNumber: booking.plateNumber,
            vehicleModel: booking.vehicleModel,
            customerName: booking.customerName,
            productSku: productMatch.id,
            productName: `${productMatch.brand} ${productMatch.model}`,
            quantity: qty,
            binLocation: productMatch.binLocation,
            status: 'PENDING_RELEASE',
            urgency: 'URGENT_IN_BAY',
            createdAt: 'Just Now',
            notes: `Vehicle in bay — pull ${qty} (reservation may already exist).`,
            stockAllocated: false,
          };
          set((s) => ({
            releaseNotifications: [ticket, ...s.releaseNotifications],
          }));
        }
      }
      if (!isSoundMuted) playDispatchAlertChime();
      get().triggerToast(`Bay ${booking.bay}: ${booking.plateNumber} in bay — release needed.`);
    }
  },

  verifyOrder: (orderId, amountReceived) => {
    const { orders, products, isSoundMuted, activeRole } = get();
    if (!canVerifyPayment(activeRole)) {
      get().triggerToast('Only Manager or Admin can verify payment.');
      return;
    }
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) {
      get().triggerToast('Order not found.');
      return;
    }
    if (
      targetOrder.paymentStatus !== 'Under Review' &&
      targetOrder.paymentStatus !== 'Awaiting Proof'
    ) {
      get().triggerToast(`Order ${orderId} is not awaiting review.`);
      return;
    }
    if (!targetOrder.items?.length) {
      get().triggerToast('Order has no line items.');
      return;
    }

    const isPdc = targetOrder.paymentMethod.includes('PDC');
    let received: number;
    if (amountReceived !== undefined && amountReceived !== null) {
      received = Number(amountReceived);
      if (!Number.isFinite(received) || received < 0) {
        get().triggerToast('Enter a valid amount received.');
        return;
      }
    } else if (targetOrder.amountReceived != null) {
      received = targetOrder.amountReceived;
    } else {
      received = isPdc ? 0 : targetOrder.amount;
    }

    const amountCheck = isPaymentAmountAcceptable(
      targetOrder.amount,
      received,
      targetOrder.paymentMethod
    );
    if (!amountCheck.ok) {
      get().triggerToast(amountCheck.message);
      return;
    }

    const linePlan: { product: TireProduct; quantity: number }[] = [];
    for (const item of targetOrder.items) {
      const qty = asPositiveInt(item.quantity, 0);
      if (qty <= 0) continue;
      const matched = matchProductForOrderLine(products, item);
      if (!matched) {
        get().triggerToast(`No SKU match for ${item.productName} (${item.specCode}).`);
        return;
      }
      if (!canReserve(matched, qty)) {
        get().triggerToast(
          `Insufficient available stock for ${matched.brand} ${matched.model} (need ${qty}, available ${getAvailableStock(matched)}).`
        );
        return;
      }
      linePlan.push({ product: matched, quantity: qty });
    }
    if (!linePlan.length) {
      get().triggerToast('No valid quantities to allocate.');
      return;
    }

    set((s) => {
      let nextProducts = s.products;
      for (const line of linePlan) {
        nextProducts = nextProducts.map((p) =>
          p.id === line.product.id
            ? { ...p, stockReserved: (p.stockReserved ?? 0) + line.quantity }
            : p
        );
      }
      return {
        products: nextProducts,
        orders: s.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                amountReceived: received,
                paymentStatus: isPdc
                  ? ('Credit Approved (PDC)' as const)
                  : ('Cleared' as const),
                fulfillmentStatus: 'Allocated' as const,
                status: 'Payment Verified',
              }
            : o
        ),
      };
    });

    const lines: ReleaseLine[] = linePlan.map((l) => ({
      productSku: l.product.id,
      productName: `${l.product.brand} ${l.product.model} (${l.product.specCode})`,
      quantity: l.quantity,
      binLocation: l.product.binLocation,
      dotBatchCode: l.product.dotBatchCode,
      fulfilledQty: 0,
    }));
    const totalQty = lines.reduce((a, l) => a + l.quantity, 0);
    const primary = lines[0];

    const newRelTicket: ReleaseNotification = {
      id: genId('REL-', 1100, 8800),
      sourceType:
        targetOrder.fulfillmentType === 'Installation at QC Branch'
          ? 'service_bay'
          : 'verified_order',
      refId: targetOrder.id,
      bayName: targetOrder.assignedBay
        ? `Bay ${targetOrder.assignedBay}`
        : targetOrder.fulfillmentType === 'Direct Delivery'
          ? 'Delivery Staging'
          : 'Front Counter',
      plateNumber: targetOrder.plateNumber || 'FLEET',
      vehicleModel: targetOrder.vehicleModel || 'Order',
      customerName: targetOrder.customerName,
      productSku: primary?.productSku || 'SKU-003',
      productName: primary?.productName || 'Tires',
      quantity: totalQty,
      binLocation: primary?.binLocation || 'RACK-B-04',
      lines,
      status: 'PENDING_RELEASE',
      urgency: 'HIGH_PRIORITY',
      createdAt: 'Just Now',
      notes: `${lines.length} line(s) · ${totalQty} units. ${
        linePlan[0] ? fefoHint(linePlan[0].product) : ''
      }`,
      stockAllocated: true,
    };

    set((s) => ({
      releaseNotifications: [newRelTicket, ...s.releaseNotifications],
    }));
    if (!isSoundMuted) playDispatchAlertChime();
    get().triggerToast(
      `${orderId} approved · ${totalQty} units reserved (${lines.length} lines)`
    );
  },

  rejectOrder: (orderId, reason) => {
    const { activeRole, orders } = get();
    if (!canVerifyPayment(activeRole)) {
      get().triggerToast('Only Manager or Admin can reject payment.');
      return;
    }
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      get().triggerToast('Order not found.');
      return;
    }
    if (
      order.paymentStatus !== 'Under Review' &&
      order.paymentStatus !== 'Awaiting Proof'
    ) {
      get().triggerToast('Only orders awaiting review can be rejected.');
      return;
    }
    const why = (reason || '').trim();
    if (!why) {
      get().triggerToast('A rejection reason is required.');
      return;
    }
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'Rejected' as const,
              fulfillmentStatus: 'Cancelled' as const,
              status: 'Payment Proof Rejected',
              rejectionReason: why,
            }
          : o
      ),
    }));
    get().triggerToast(`Order ${orderId} rejected.`);
  },

  fulfillReleaseTicket: (ticketId, product, quantity, targetDestination, workOrderRef) => {
    const { activeRole, isSoundMuted, releaseNotifications, products } = get();
    if (!canReleaseStock(activeRole)) {
      get().triggerToast('Warehouse Clerk or higher required to release stock.');
      return;
    }
    const ticket = releaseNotifications.find((t) => t.id === ticketId);
    if (!ticket) {
      get().triggerToast('Release ticket not found.');
      return;
    }
    if (ticket.status !== 'PENDING_RELEASE') {
      get().triggerToast(`Ticket ${ticketId} is not pending (status: ${ticket.status}).`);
      return;
    }

    const qty = asPositiveInt(quantity, 0);
    if (qty <= 0) {
      get().triggerToast('Release quantity must be at least 1.');
      return;
    }
    if (!targetDestination?.trim()) {
      get().triggerToast('Destination is required.');
      return;
    }

    const lines = ticketLines(ticket);
    const line = lines.find((l) => l.productSku === product.id);
    if (!line) {
      get().triggerToast(`SKU ${product.id} is not on ticket ${ticketId}.`);
      return;
    }
    const remaining = remainingOnLine(line);
    if (qty > remaining) {
      get().triggerToast(`Only ${remaining} left to release on this line (tried ${qty}).`);
      return;
    }

    const live = products.find((p) => p.id === product.id) ?? product;
    if (live.stock < qty) {
      get().triggerToast(`On-hand is ${live.stock}; cannot release ${qty}.`);
      return;
    }

    set((s) => ({
      products: s.products.map((p) => {
        if (p.id !== product.id) return p;
        const reserved = p.stockReserved ?? 0;
        const nextReserved = ticket.stockAllocated
          ? Math.max(0, reserved - qty)
          : reserved;
        return {
          ...p,
          stock: Math.max(0, p.stock - qty),
          stockReserved: nextReserved,
        };
      }),
      releaseNotifications: s.releaseNotifications.map((t) => {
        if (t.id !== ticketId) return t;
        const nextLines = ticketLines(t).map((ln) =>
          ln.productSku === product.id
            ? { ...ln, fulfilledQty: (ln.fulfilledQty ?? 0) + qty }
            : ln
        );
        const done = nextLines.every(
          (ln) => (ln.fulfilledQty ?? 0) >= ln.quantity
        );
        return {
          ...t,
          lines: nextLines,
          status: done ? ('RELEASED' as const) : t.status,
          releasedAt: done ? nowLabel() : t.releasedAt,
          releasedBy: done
            ? `${STAFF_PROFILES[activeRole].name} (${STAFF_PROFILES[activeRole].title})`
            : t.releasedBy,
          stockAllocated: done ? false : t.stockAllocated,
        };
      }),
      orders: s.orders.map((o) =>
        ticket.refId === o.id
          ? {
              ...o,
              fulfillmentStatus: 'Dispatched' as const,
              status: 'Ready for Dispatch / Installation',
            }
          : o
      ),
    }));

    get().addMovement({
      sku: product.id,
      productName: `${product.brand} ${product.model}`,
      type: 'Bay Handover (Dispatch)',
      quantity: qty,
      sourceLocation: product.binLocation,
      destinationLocation: targetDestination.trim(),
      performedBy: STAFF_PROFILES[activeRole].name,
      role: activeRole,
      workOrderRef: workOrderRef || ticket.refId,
      notes: `Ticket ${ticketId}. ${fefoHint(product)}`,
    });

    if (!isSoundMuted) playDispatchSuccessChime();
    get().triggerToast(`Released ${qty}x ${product.brand} → ${targetDestination.trim()}`);
  },

  cancelReleaseTicket: (ticketId, reason) => {
    const { releaseNotifications, activeRole } = get();
    if (!canCancelRelease(activeRole)) {
      get().triggerToast('Warehouse Clerk or higher can cancel tickets.');
      return;
    }
    const ticket = releaseNotifications.find((t) => t.id === ticketId);
    if (!ticket) {
      get().triggerToast('Ticket not found.');
      return;
    }
    if (ticket.status !== 'PENDING_RELEASE') {
      get().triggerToast('Only pending tickets can be cancelled.');
      return;
    }

    set((s) => {
      let nextProducts = s.products;
      if (ticket.stockAllocated) {
        for (const line of ticketLines(ticket)) {
          const remaining = remainingOnLine(line);
          if (remaining <= 0) continue;
          nextProducts = nextProducts.map((p) =>
            p.id === line.productSku
              ? {
                  ...p,
                  stockReserved: Math.max(0, (p.stockReserved ?? 0) - remaining),
                }
              : p
          );
        }
      }
      return {
        products: nextProducts,
        releaseNotifications: s.releaseNotifications.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'CANCELLED' as const,
                stockAllocated: false,
                notes: `${t.notes || ''} · Cancelled: ${reason || '—'}`.trim(),
              }
            : t
        ),
      };
    });

    get().triggerToast(`Ticket ${ticketId} cancelled — reserved stock freed.`);
  },

  simulateNewAlert: () => {
    const { isSoundMuted, products, activeRole } = get();
    if (!canManageWarehouseOps(activeRole)) {
      get().triggerToast('Only warehouse roles can simulate alerts.');
      return;
    }
    const sku = products.find((p) => p.id === 'SKU-003') ?? products[0];
    const qty = 4;
    if (!sku || !canReserve(sku, qty)) {
      get().triggerToast('Cannot simulate — insufficient available stock.');
      return;
    }
    set((s) => ({
      products: s.products.map((p) =>
        p.id === sku.id
          ? { ...p, stockReserved: (p.stockReserved ?? 0) + qty }
          : p
      ),
    }));
    const randomBay = Math.random() > 0.5 ? 1 : 2;
    const testTicket: ReleaseNotification = {
      id: genId('REL-SIM-', 100, 900),
      sourceType: 'service_bay',
      refId: genId('SB-LIVE-'),
      bayName: `Bay ${randomBay}`,
      plateNumber: `NCF ${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleModel: 'Toyota Hilux 4x4',
      customerName: 'Walk-in',
      productSku: sku.id,
      productName: `${sku.brand} ${sku.model}`,
      quantity: qty,
      binLocation: sku.binLocation,
      lines: [
        {
          productSku: sku.id,
          productName: `${sku.brand} ${sku.model}`,
          quantity: qty,
          binLocation: sku.binLocation,
          dotBatchCode: sku.dotBatchCode,
          fulfilledQty: 0,
        },
      ],
      status: 'PENDING_RELEASE',
      urgency: 'URGENT_IN_BAY',
      createdAt: 'Just Now',
      notes: fefoHint(sku),
      stockAllocated: true,
    };
    set((s) => ({
      releaseNotifications: [testTicket, ...s.releaseNotifications],
    }));
    if (!isSoundMuted) playDispatchAlertChime();
    get().triggerToast(`Test alert: ${qty}x reserved for Bay ${randomBay}`);
  },

  openDispatchForTicket: (ticket) => {
    const { activeRole } = get();
    if (!STAFF_PROFILES[activeRole].allowedViews.includes('inventory_kiosk')) {
      get().triggerToast('Inventory is not available for your role.');
      return;
    }
    set({ currentView: 'inventory_kiosk' });
    get().triggerToast(`Open inventory for ${ticket.id}`);
  },

  requestTireFromWarehouse: (product, quantity, customerName, plateNumber, destination) => {
    const { activeRole, isSoundMuted, products } = get();
    if (!canRequestStockPull(activeRole)) {
      get().triggerToast('Your role cannot request warehouse pulls.');
      return;
    }
    const name = (customerName || '').trim();
    const plate = (plateNumber || '').trim();
    if (!name || !plate) {
      get().triggerToast('Customer name and plate are required.');
      return;
    }
    const qty = asPositiveInt(quantity, 0);
    if (qty <= 0) {
      get().triggerToast('Quantity must be at least 1.');
      return;
    }
    const dest = (destination || 'Front Counter').trim();
    const live = products.find((p) => p.id === product.id) ?? product;
    if (!canReserve(live, qty)) {
      get().triggerToast(
        `Only ${getAvailableStock(live)} available (need ${qty}).`
      );
      return;
    }
    set((s) => ({
      products: s.products.map((p) =>
        p.id === product.id
          ? { ...p, stockReserved: (p.stockReserved ?? 0) + qty }
          : p
      ),
    }));
    const ticket: ReleaseNotification = {
      id: genId('REL-CTR-'),
      sourceType: 'counter_pickup',
      refId: genId('CTR-'),
      bayName: dest,
      plateNumber: plate.toUpperCase(),
      vehicleModel: 'Counter',
      customerName: name,
      productSku: product.id,
      productName: `${product.brand} ${product.model}`,
      quantity: qty,
      binLocation: product.binLocation,
      lines: [
        {
          productSku: product.id,
          productName: `${product.brand} ${product.model}`,
          quantity: qty,
          binLocation: product.binLocation,
          dotBatchCode: product.dotBatchCode,
          fulfilledQty: 0,
        },
      ],
      status: 'PENDING_RELEASE',
      urgency: 'HIGH_PRIORITY',
      createdAt: 'Just Now',
      notes: fefoHint(product),
      stockAllocated: true,
    };
    set((s) => ({
      releaseNotifications: [ticket, ...s.releaseNotifications],
    }));
    if (!isSoundMuted) playDispatchAlertChime();
    get().triggerToast(`Reserved ${qty}x for ${name}`);
  },

  copyCustomerTrackingLink: (query) => {
    const q = (query || '').trim();
    if (!q) {
      get().triggerToast('Nothing to copy — enter a plate or order id.');
      return;
    }
    const trackingUrl = `https://track.superbdeal.com/status/${encodeURIComponent(q)}`;
    void navigator.clipboard.writeText(trackingUrl).catch(() => {});
    get().triggerToast('Tracking link copied');
  },
}));
