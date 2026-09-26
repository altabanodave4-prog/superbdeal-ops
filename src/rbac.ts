import type { StaffRole } from './data';
import type { AppViewMode } from './types/views';

/**
 * Corrected production-style RBAC (demo still uses role switcher):
 * - Counter: desk, bays, fleet quotes, payment *submit/view* (not approve), inventory lookup, request pull
 * - Warehouse: inventory + release + bays
 * - Manager: full branch ops including payment *approve*
 * - Admin (IT): system/config only — not day-to-day money or stock
 */

/** Warehouse physical stock out — not IT admin */
export function canReleaseStock(role: StaffRole): boolean {
  return role === 'ROLE_CLERK' || role === 'ROLE_MANAGER';
}

export function canCancelRelease(role: StaffRole): boolean {
  return canReleaseStock(role);
}

/** Finance: final deposit / PDC approval — manager only */
export function canVerifyPayment(role: StaffRole): boolean {
  return role === 'ROLE_MANAGER';
}

/** Counter may open payments to attach proof / view queue; cannot approve */
export function canSubmitPaymentProof(role: StaffRole): boolean {
  return (
    role === 'ROLE_INTERN' ||
    role === 'ROLE_MANAGER'
  );
}

export function canEditInventoryMaster(role: StaffRole): boolean {
  return role === 'ROLE_MANAGER';
}

export function canViewFinancials(role: StaffRole): boolean {
  return role === 'ROLE_MANAGER' || role === 'ROLE_INTERN';
}

/** Intake, cycle count, bin transfer */
export function canManageWarehouseOps(role: StaffRole): boolean {
  return role === 'ROLE_CLERK' || role === 'ROLE_MANAGER';
}

/** Read-only catalog (availability) — IT excluded from ops screens */
export function canViewInventory(role: StaffRole): boolean {
  return role !== 'ROLE_ADMIN';
}

export function canRequestStockPull(role: StaffRole): boolean {
  return role === 'ROLE_INTERN' || role === 'ROLE_MANAGER';
}

export function canAccessSalesDesk(role: StaffRole): boolean {
  return role === 'ROLE_INTERN' || role === 'ROLE_MANAGER';
}

export function canAccessFleetQuotes(role: StaffRole): boolean {
  return role === 'ROLE_INTERN' || role === 'ROLE_MANAGER';
}

export function canAccessBays(role: StaffRole): boolean {
  return role === 'ROLE_INTERN' || role === 'ROLE_CLERK' || role === 'ROLE_MANAGER';
}

/** Payments module: counter + manager (approve gated by canVerifyPayment) */
export function canAccessPaymentAudit(role: StaffRole): boolean {
  return role === 'ROLE_INTERN' || role === 'ROLE_MANAGER';
}

/** Design / system config — IT admin only */
export function canAccessDesignSystem(role: StaffRole): boolean {
  return role === 'ROLE_ADMIN';
}

export function roleHomeView(role: StaffRole): AppViewMode {
  switch (role) {
    case 'ROLE_INTERN':
      return 'sales_desk';
    case 'ROLE_CLERK':
      return 'inventory_kiosk';
    case 'ROLE_MANAGER':
      return 'accounting_audit';
    case 'ROLE_ADMIN':
      return 'design_system';
  }
}

export function roleLabel(role: StaffRole): string {
  switch (role) {
    case 'ROLE_INTERN':
      return 'Counter';
    case 'ROLE_CLERK':
      return 'Warehouse';
    case 'ROLE_MANAGER':
      return 'Manager';
    case 'ROLE_ADMIN':
      return 'IT Admin';
  }
}

export function roleWorkspaceTitle(role: StaffRole): string {
  switch (role) {
    case 'ROLE_INTERN':
      return 'Counter desk';
    case 'ROLE_CLERK':
      return 'Warehouse floor';
    case 'ROLE_MANAGER':
      return 'Branch operations';
    case 'ROLE_ADMIN':
      return 'System administration';
  }
}
