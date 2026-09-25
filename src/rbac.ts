import type { StaffRole } from './data';
import type { AppViewMode } from './types/views';

/** Warehouse physical stock out */
export function canReleaseStock(role: StaffRole): boolean {
  return role === 'ROLE_CLERK' || role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
}

export function canCancelRelease(role: StaffRole): boolean {
  return canReleaseStock(role);
}

/** Finance: deposit / PDC review */
export function canVerifyPayment(role: StaffRole): boolean {
  return role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER';
}

export function canEditInventoryMaster(role: StaffRole): boolean {
  return role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
}

export function canViewFinancials(role: StaffRole): boolean {
  return role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
}

/** Intake, cycle count, bin transfer */
export function canManageWarehouseOps(role: StaffRole): boolean {
  return role === 'ROLE_CLERK' || role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
}

/** Read-only catalog (availability) */
export function canViewInventory(role: StaffRole): boolean {
  return true;
}

export function canRequestStockPull(role: StaffRole): boolean {
  return role === 'ROLE_INTERN' || role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
}

export function canAccessSalesDesk(role: StaffRole): boolean {
  return role === 'ROLE_INTERN' || role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
}

export function canAccessFleetQuotes(role: StaffRole): boolean {
  return role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
}

export function canAccessBays(role: StaffRole): boolean {
  return role === 'ROLE_CLERK' || role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
}

export function canAccessPaymentAudit(role: StaffRole): boolean {
  return role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
}

export function roleHomeView(role: StaffRole): AppViewMode {
  switch (role) {
    case 'ROLE_INTERN':
      return 'sales_desk';
    case 'ROLE_CLERK':
      return 'inventory_kiosk';
    case 'ROLE_MANAGER':
      return 'inventory_kiosk';
    case 'ROLE_ADMIN':
      return 'accounting_audit';
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
      return 'Admin';
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
      return 'Director console';
  }
}
