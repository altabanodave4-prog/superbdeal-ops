/** Canonical view modes for the staff operations workstation */
export type AppViewMode =
  | 'inventory_kiosk'
  | 'sales_desk'
  | 'bay_terminal'
  | 'accounting_audit'
  | 'fleet_quotes'
  | 'design_system';

export const VIEW_PATHS: Record<AppViewMode, string> = {
  inventory_kiosk: '/inventory',
  sales_desk: '/sales',
  bay_terminal: '/bays',
  accounting_audit: '/audit',
  fleet_quotes: '/fleet-quotes',
  design_system: '/design-system',
};

export const PATH_TO_VIEW: Record<string, AppViewMode> = {
  '/': 'inventory_kiosk',
  '/inventory': 'inventory_kiosk',
  '/sales': 'sales_desk',
  '/bays': 'bay_terminal',
  '/audit': 'accounting_audit',
  '/fleet-quotes': 'fleet_quotes',
  '/design-system': 'design_system',
};

export function viewLabel(view: AppViewMode): string {
  return view.replace(/_/g, ' ');
}
