import React from 'react';
import {
  Disc,
  Package,
  ShoppingBag,
  Wrench,
  ShieldCheck,
  FileText,
  Palette,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { StaffRole, STAFF_PROFILES, ReleaseNotification } from '../data';
import { RoleSwitcher } from './RoleSwitcher';
import { DispatchNotificationCenter } from './DispatchNotificationCenter';
import type { AppViewMode } from '../types/views';
import { roleWorkspaceTitle } from '../rbac';

export type { AppViewMode };

interface HeaderProps {
  currentView: AppViewMode;
  setCurrentView: (view: AppViewMode) => void;
  b2bCount: number;
  pendingAuditsCount?: number;
  activeBaysCount?: number;
  activeRole: StaffRole;
  onRoleChange: (role: StaffRole) => void;
  releaseNotifications?: ReleaseNotification[];
  onOpenDispatchForTicket?: (ticket: ReleaseNotification) => void;
  onCancelTicket?: (ticketId: string) => void;
  onSimulateNewAlert?: () => void;
  onTriggerToast: (msg: string) => void;
  isSoundMuted?: boolean;
  onToggleSound?: () => void;
}

const NAV: {
  id: AppViewMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'sales_desk', label: 'Counter', icon: <ShoppingBag className="w-3.5 h-3.5" aria-hidden /> },
  { id: 'inventory_kiosk', label: 'Inventory', icon: <Package className="w-3.5 h-3.5" aria-hidden /> },
  { id: 'bay_terminal', label: 'Bays', icon: <Wrench className="w-3.5 h-3.5" aria-hidden /> },
  { id: 'accounting_audit', label: 'Payments', icon: <ShieldCheck className="w-3.5 h-3.5" aria-hidden /> },
  { id: 'fleet_quotes', label: 'Fleet', icon: <FileText className="w-3.5 h-3.5" aria-hidden /> },
  { id: 'design_system', label: 'Design', icon: <Palette className="w-3.5 h-3.5" aria-hidden /> },
];

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  b2bCount,
  pendingAuditsCount = 0,
  activeBaysCount = 0,
  activeRole,
  onRoleChange,
  releaseNotifications = [],
  onOpenDispatchForTicket,
  onCancelTicket,
  onSimulateNewAlert,
  onTriggerToast,
  isSoundMuted = false,
  onToggleSound = () => {},
}) => {
  const profile = STAFF_PROFILES[activeRole];
  const allowed = profile.allowedViews;
  const pendingReleases = releaseNotifications.filter((n) => n.status === 'PENDING_RELEASE').length;
  const showDispatch = activeRole !== 'ROLE_INTERN' && !!onOpenDispatchForTicket;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 gap-3">
          <button
            type="button"
            onClick={() => setCurrentView(allowed[0])}
            className="flex items-center gap-2.5 shrink-0 text-left rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label="Go to home workspace"
          >
            <span className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center">
              <Disc className="w-3.5 h-3.5 text-white" aria-hidden />
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-slate-800">Superbdeal</span>
              <span className="text-[11px] text-slate-500">{roleWorkspaceTitle(activeRole)}</span>
            </span>
          </button>

          <nav
            className="flex items-center gap-0.5 min-w-0 overflow-x-auto no-scrollbar"
            aria-label="Main"
          >
            {NAV.filter((item) => allowed.includes(item.id)).map((item) => {
              const active = currentView === item.id;
              let badge: number | null = null;
              if (item.id === 'accounting_audit' && pendingAuditsCount > 0) badge = pendingAuditsCount;
              if (item.id === 'bay_terminal' && activeBaysCount > 0) badge = activeBaysCount;
              if (item.id === 'fleet_quotes' && b2bCount > 0) badge = b2bCount;
              if (item.id === 'inventory_kiosk' && pendingReleases > 0 && showDispatch) {
                badge = pendingReleases;
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    active
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className={active ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                  {item.label}
                  {badge != null && (
                    <span
                      className={`min-w-[1.15rem] h-[1.15rem] px-1 rounded text-[10px] font-semibold inline-flex items-center justify-center ${
                        active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            {showDispatch && (
              <DispatchNotificationCenter
                notifications={releaseNotifications}
                activeRole={activeRole}
                onOpenDispatchForTicket={onOpenDispatchForTicket!}
                onCancelTicket={onCancelTicket}
                onSimulateNewAlert={onSimulateNewAlert}
                onTriggerToast={onTriggerToast}
                isSoundMuted={isSoundMuted}
                onToggleSound={onToggleSound}
              />
            )}

            <button
              type="button"
              onClick={onToggleSound}
              className="p-2 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              aria-label={isSoundMuted ? 'Unmute alert sounds' : 'Mute alert sounds'}
            >
              {isSoundMuted ? (
                <VolumeX className="w-4 h-4" aria-hidden />
              ) : (
                <Volume2 className="w-4 h-4" aria-hidden />
              )}
            </button>

            <RoleSwitcher activeRole={activeRole} onRoleChange={onRoleChange} />
          </div>
        </div>
      </div>
    </header>
  );
};
