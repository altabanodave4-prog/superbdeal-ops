import React, { useState } from 'react';
import { ReleaseNotification, StaffRole } from '../data';
import { canReleaseStock, canCancelRelease } from '../rbac';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Package,
  Wrench,
  Radio,
  Plus,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { playDispatchAlertChime } from '../utils';

interface DispatchNotificationCenterProps {
  notifications: ReleaseNotification[];
  activeRole: StaffRole;
  onOpenDispatchForTicket: (ticket: ReleaseNotification) => void;
  onCancelTicket?: (ticketId: string) => void;
  onSimulateNewAlert?: () => void;
  onTriggerToast: (msg: string) => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export const DispatchNotificationCenter: React.FC<DispatchNotificationCenterProps> = ({
  notifications,
  activeRole,
  onOpenDispatchForTicket,
  onCancelTicket,
  onSimulateNewAlert,
  onTriggerToast,
  isSoundMuted,
  onToggleSound
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'pending' | 'all'>('pending');

  const canRelease = canReleaseStock(activeRole);
  const canCancel = canCancelRelease(activeRole);
  const pendingTickets = notifications.filter(n => n.status === 'PENDING_RELEASE');
  const pendingCount = pendingTickets.length;
  const hasUrgentInBay = pendingTickets.some(n => n.urgency === 'URGENT_IN_BAY');

  const displayedTickets = filterTab === 'pending'
    ? pendingTickets
    : notifications;

  return (
    <div className="relative">
      {/* Bell Trigger Button with Unread Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
          pendingCount > 0
            ? hasUrgentInBay
              ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 shadow-xs'
              : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-xs'
            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
        }`}
        title="Releasing Staff Dispatch Notifications: Tires requiring warehouse handover"
        aria-label="Dispatch Notifications"
      >
        {pendingCount > 0 ? (
          <BellRing className={`w-4 h-4 ${hasUrgentInBay ? 'animate-bounce text-rose-600' : 'text-amber-600'}`} />
        ) : (
          <Bell className="w-4 h-4 text-slate-500" />
        )}
        
        <span className="hidden sm:inline">
          {pendingCount > 0 ? 'Release Queue' : 'Dispatches'}
        </span>

        {pendingCount > 0 && (
          <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-mono font-bold text-white shadow-xs ${
            hasUrgentInBay ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
          }`}>
            {pendingCount}
          </span>
        )}
      </button>

      {/* Slide-over / Dropdown Modal */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-2xs lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-12 z-50 w-[92vw] sm:w-[480px] max-w-[500px] bg-white rounded-xl border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      Live Releasing Feed
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      Warehouse Release &amp; Dispatch Queue
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Audio Mute/Unmute Toggle */}
                  <button
                    type="button"
                    onClick={onToggleSound}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      isSoundMuted
                        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        : 'bg-blue-600/30 border-blue-500 text-blue-300 hover:bg-blue-600/50'
                    }`}
                    title={isSoundMuted ? 'Notification sounds are muted. Click to unmute chime.' : 'Notification chime enabled. Click to mute.'}
                  >
                    {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Sub-status bar */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full font-mono font-bold ${
                    pendingCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {pendingCount} Tire{pendingCount === 1 ? '' : 's'} Awaiting Handover
                  </span>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center space-x-1 bg-slate-800 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFilterTab('pending')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      filterTab === 'pending' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      filterTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                </div>
              </div>
            </div>

            {/* List of Tickets */}
            <div className="p-3 max-h-[65vh] overflow-y-auto space-y-2.5 bg-slate-50">
              {displayedTickets.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">All Dispatches Clear!</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                    No tires currently waiting to be pulled from racks. When bay mechanics check in a vehicle or accounting verifies an order, alerts will ping here automatically.
                  </p>
                </div>
              ) : (
                displayedTickets.map(ticket => {
                  const isUrgent = ticket.urgency === 'URGENT_IN_BAY';
                  const isPending = ticket.status === 'PENDING_RELEASE';

                  return (
                    <div
                      key={ticket.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        !isPending
                          ? 'bg-white border-slate-200 opacity-75'
                          : isUrgent
                          ? 'bg-rose-50/70 border-rose-300 shadow-xs ring-1 ring-rose-200'
                          : 'bg-white border-amber-200 shadow-xs'
                      }`}
                    >
                      {/* Ticket Top Meta */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-1.5">
                          {isPending ? (
                            isUrgent ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono uppercase tracking-wider animate-pulse">
                                <Flame className="w-3 h-3" />
                                Urgent: In Bay
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-mono uppercase tracking-wider">
                                Order Verified
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono uppercase tracking-wider">
                              Handover Completed
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-slate-500">
                            {ticket.id}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {ticket.createdAt}
                        </span>
                      </div>

                      {/* Required Tire & Pick Bin */}
                      <div className="flex items-start justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200/80 mb-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            <span className="text-blue-700 font-semibold mr-1">{ticket.quantity}x</span>
                            {ticket.productName}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            SKU: <span className="font-mono text-slate-700 font-semibold">{ticket.productSku}</span>
                          </div>
                          {ticket.lines && ticket.lines.length > 1 && (
                            <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-600 border-t border-slate-100 pt-1.5">
                              {ticket.lines.map((ln) => (
                                <li key={ln.productSku} className="flex justify-between gap-2">
                                  <span className="truncate">{ln.quantity}× {ln.productName}</span>
                                  <span className="font-mono shrink-0 text-slate-500">{ln.binLocation}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Pick Rack Bin - high contrast so staff knows where to walk */}
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                            Pick Bin
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-semibold text-xs bg-slate-900 text-amber-300">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            {ticket.binLocation}
                          </span>
                        </div>
                      </div>

                      {/* Destination Vehicle & Bay */}
                      <div className="text-xs text-slate-700 space-y-1 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <Car className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {ticket.plateNumber}
                            </span>
                            <span className="text-slate-600 truncate max-w-[180px]">
                              {ticket.vehicleModel}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {ticket.customerName}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5 text-blue-700 font-medium text-[11px]">
                          <Wrench className="w-3 h-3 text-blue-600" />
                          <span>Destination: <strong>{ticket.bayName || 'Shop Bay'}</strong></span>
                        </div>

                        {ticket.notes && (
                          <div className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-200/60">
                            &ldquo;{ticket.notes}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {isPending ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!canRelease}
                            title={!canRelease ? 'Warehouse Clerk or higher only' : undefined}
                            onClick={() => {
                              if (!canRelease) return;
                              setIsOpen(false);
                              onOpenDispatchForTicket(ticket);
                            }}
                            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center space-x-2 transition-all shadow-xs ${
                              !canRelease
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : isUrgent
                                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                            }`}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            <span>{canRelease ? 'Pull / Release' : 'Warehouse Only'}</span>
                          </button>
                          {onCancelTicket && canCancel && (
                            <button
                              type="button"
                              onClick={() => {
                                onCancelTicket(ticket.id);
                              }}
                              className="px-3 py-2.5 rounded-xl font-bold text-xs tracking-wide border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                              title="Cancel ticket and return reserved stock to available"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center justify-between font-mono">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Released at {ticket.releasedAt || 'Today'}
                          </span>
                          <span className="text-slate-500">{ticket.releasedBy}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with Simulate Test Alert */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Warehouse Dispatch Protocol
              </span>

              {onSimulateNewAlert && (
                <button
                  type="button"
                  onClick={() => {
                    onSimulateNewAlert();
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200"
                  title="Simulate a new incoming bay dispatch alert to test chime and toast"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Test Release Ping</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
