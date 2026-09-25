import type { ShopBooking, TireProduct } from './data';

export function formatPHP(amount: number): string {
  return (
    '₱' +
    amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** PH 12% VAT where total is VAT-inclusive */
export function calculateVatBreakdown(totalWithVat: number): {
  netOfVat: number;
  vatAmount: number;
} {
  const netOfVat = totalWithVat / 1.12;
  const vatAmount = totalWithVat - netOfVat;
  return { netOfVat, vatAmount };
}

export function getVolumeDiscountTier(totalUnits: number): {
  percentage: number;
  label: string;
} {
  if (totalUnits >= 24) {
    return {
      percentage: 0.1,
      label: '10% Commercial Fleet Discount (24+ units)',
    };
  }
  if (totalUnits >= 12) {
    return {
      percentage: 0.05,
      label: '5% Volume Bulk Discount (12-23 units)',
    };
  }
  return {
    percentage: 0,
    label: 'Standard Retail Pricing (1-11 units)',
  };
}

/** On-hand minus reserved = sellable / allocatable qty */
export function getAvailableStock(product: {
  stock: number;
  stockReserved?: number;
}): number {
  return Math.max(0, product.stock - (product.stockReserved ?? 0));
}

export function canReserve(
  product: { stock: number; stockReserved?: number },
  qty: number
): boolean {
  return qty > 0 && getAvailableStock(product) >= qty;
}

/** Normalize plate for directory lookup (uppercase, collapse spaces) */
export function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * DOT codes often look like "DOT 1425" (week 14, year 2025).
 * Lower week+year sorts as older → FEFO first.
 */
export function parseDotSortKey(dot?: string): number {
  if (!dot) return Number.MAX_SAFE_INTEGER;
  const m = dot.replace(/\s/g, '').match(/(\d{4})/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const wwyy = m[1];
  const week = parseInt(wwyy.slice(0, 2), 10);
  const year = 2000 + parseInt(wwyy.slice(2, 4), 10);
  return year * 100 + week;
}

/** Prefer oldest DOT among candidates (FEFO). */
export function suggestFefoProduct(products: TireProduct[]): TireProduct | null {
  if (!products.length) return null;
  return [...products].sort(
    (a, b) => parseDotSortKey(a.dotBatchCode) - parseDotSortKey(b.dotBatchCode)
  )[0];
}

export function fefoHint(product: TireProduct): string {
  const dot = product.dotBatchCode || 'unknown DOT';
  return `FEFO: pull oldest batch first (${dot}) from ${product.binLocation}`;
}

/** Payment must cover nearly full total unless PDC credit path */
export function isPaymentAmountAcceptable(
  orderAmount: number,
  amountReceived: number,
  paymentMethod: string
): { ok: boolean; message: string } {
  if (!Number.isFinite(amountReceived) || amountReceived < 0) {
    return { ok: false, message: 'Enter a valid amount received.' };
  }
  if (!Number.isFinite(orderAmount) || orderAmount < 0) {
    return { ok: false, message: 'Order total is invalid.' };
  }
  const isPdc = (paymentMethod || '').includes('PDC');
  if (isPdc) {
    return { ok: true, message: 'PDC / credit path — stock policy applies on credit approval.' };
  }
  if (orderAmount === 0) {
    return { ok: true, message: 'Zero-total order.' };
  }
  const min = orderAmount * 0.95;
  if (amountReceived + 0.009 < min) {
    return {
      ok: false,
      message: `Amount received (${formatPHP(amountReceived)}) is below 95% of order total (${formatPHP(orderAmount)}).`,
    };
  }
  return { ok: true, message: 'Amount within tolerance.' };
}

const ACTIVE_BAY_STATUSES: ShopBooking['status'][] = [
  'Waiting for Arrival',
  'Vehicle in Bay (In Progress)',
];

export function findBaySlotConflict(
  bookings: ShopBooking[],
  bay: 1 | 2,
  timeSlot: string,
  date: string,
  excludeId?: string
): ShopBooking | undefined {
  return bookings.find(
    (b) =>
      b.id !== excludeId &&
      b.bay === bay &&
      b.timeSlot === timeSlot &&
      b.date === date &&
      ACTIVE_BAY_STATUSES.includes(b.status)
  );
}

// Auditory Alert Synthesizer for Warehouse / Releasing Staff
export function playDispatchAlertChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.14, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);
  } catch {
    // ignore
  }
}

export function playDispatchSuccessChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.1;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch {
    // ignore
  }
}
