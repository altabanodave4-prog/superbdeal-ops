import React, { useState, useEffect } from 'react';
import { PageHeader } from './ui/PageHeader';
import { OrderRecord, ShopBooking, TIME_SLOTS, StaffRole } from '../data'
import { canVerifyPayment } from '../rbac';
import { formatPHP } from '../utils';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  Eye,
  AlertTriangle,
  UserPlus,
  Car,
  Check,
  ChevronDown,
  Share2,
  ExternalLink,
  Radio,
  Landmark,
  Calendar
} from 'lucide-react';

interface AdminDashboardProps {
  orders: OrderRecord[];
  onApproveOrder: (orderId: string, amountReceived?: number) => void;
  onRejectOrder: (orderId: string, reason: string) => void;
  bookings: ShopBooking[];
  onUpdateBookingStatus: (bookingId: string, newStatus: ShopBooking['status']) => void;
  onAddWalkinBooking: (booking: ShopBooking) => void;
  initialTab?: 'audit' | 'bays';
  onOpenCustomerLink?: (query: string) => void;
  onTriggerToast?: (msg: string) => void;
  activeRole?: StaffRole;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onApproveOrder,
  onRejectOrder,
  bookings,
  onUpdateBookingStatus,
  onAddWalkinBooking,
  initialTab = 'audit',
  onOpenCustomerLink,
  onTriggerToast,
  activeRole = 'ROLE_ADMIN',
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'bays'>(initialTab);
  const [amountReceivedInput, setAmountReceivedInput] = useState('');
  const financeOk = canVerifyPayment(activeRole);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [rejectModalOrderId, setRejectModalOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Deposit slip image is unreadable or blurry.');
  const [walkinModalOpen, setWalkinModalOpen] = useState(false);

  // Walk-in Form State
  const [walkinName, setWalkinName] = useState('');
  const [walkinPlate, setWalkinPlate] = useState('');
  const [walkinModel, setWalkinModel] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinBay, setWalkinBay] = useState<1 | 2>(1);
  const [walkinSlot, setWalkinSlot] = useState<string>('02:30 PM');
  const [walkinServices, setWalkinServices] = useState<string[]>(['Computerized 3D Wheel Alignment']);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  const handleCreateWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName || !walkinPlate || !walkinModel) {
      alert('Please fill out all required walk-in customer details.');
      return;
    }

    const newBooking: ShopBooking = {
      id: `SB-WALK-${Math.floor(1000 + Math.random() * 9000)}`,
      bay: walkinBay,
      timeSlot: walkinSlot,
      customerName: `${walkinName} (Walk-In)`,
      plateNumber: walkinPlate.toUpperCase(),
      vehicleModel: walkinModel,
      phone: walkinPhone || '0900-000-0000',
      email: 'walkin@shop.ph',
      date: 'Today',
      services: walkinServices,
      totalCost: 800,
      status: 'Vehicle in Bay (In Progress)',
      paymentStatus: 'Cash at Shop',
      notes: 'Customer arrived on-site without prior booking.'
    };

    onAddWalkinBooking(newBooking);
    setWalkinModalOpen(false);
    setWalkinName('');
    setWalkinPlate('');
    setWalkinModel('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={activeTab === 'bays' ? 'Service bays' : 'Payment review'}
        description={
          activeTab === 'bays'
            ? 'Bay schedule and job status for the QC service floor.'
            : 'Review deposit proofs, confirm amounts, and release stock allocation.'
        }
      />


      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200 w-fit mb-1">
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
            activeTab === 'audit'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Payments
          <span className="ml-1.5 text-[11px] text-slate-400">
            ({orders.filter(o => o.paymentStatus === 'Under Review' || o.paymentStatus === 'Awaiting Proof').length})
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bays')}
          className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
            activeTab === 'bays'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Service bays
        </button>
      </div>

      {/* PANEL A: SPLIT-SCREEN MANUAL PAYMENT AUDIT TOOL */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Pending Verification Queue (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4 ">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Orders Awaiting Audit</span>
              </h3>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {orders.length} Records
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {orders.map(order => {
                const isSelected = order.id === selectedOrder?.id;
                const isPending = order.paymentStatus === 'Under Review' || order.paymentStatus === 'Awaiting Proof';
                const isVerified = order.paymentStatus === 'Cleared' || order.paymentStatus === 'Credit Approved (PDC)';

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 '
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{order.id}</span>
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isVerified ? 'bg-emerald-500' : isPending ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                        }`} />
                        <span>{order.paymentStatus} · {order.fulfillmentStatus}</span>
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900">{order.customerName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Method: <strong className="text-slate-700">{order.paymentMethod}</strong>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200 text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">{order.submissionDate}</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatPHP(order.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Inspection & Verification Workspace (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-6 ">
            {selectedOrder ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">Auditing Transaction</span>
                    <h3 className="text-lg font-mono font-bold text-slate-900 mt-0.5">
                      {selectedOrder.id} &bull; <span className="font-sans font-semibold">{selectedOrder.customerName}</span>
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">Total Payable</span>
                    <div className="text-2xl font-mono font-bold text-blue-700">
                      {formatPHP(selectedOrder.amount)}
                    </div>
                  </div>
                </div>

                {/* Proof Image / PDC Slip Preview & Data Match Overlay */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-blue-600" />
                      Uploaded Bank Slip / Deposit Proof Screenshot
                    </span>
                    <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Ref: {selectedOrder.referenceNumber}
                    </span>
                  </div>

                  {/* Proof preview box */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center group">
                    <img
                      src={selectedOrder.proofImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80'}
                      alt="Deposit Proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Verification Watermark Overlay */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 text-xs ">
                      <div className="text-blue-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>100% Amount Match Verified</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Claimed: {formatPHP(selectedOrder.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Order Line Items */}
                  <div className="text-xs space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-1">Items In Order:</span>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span>{item.quantity}x {item.productName} ({item.specCode})</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatPHP(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* PDC Checks Vault & Clearance Register */}
                  {selectedOrder.pdcSchedule && selectedOrder.pdcSchedule.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-blue-200 space-y-3 ">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-blue-600" />
                          Corporate PDC Vault Register ({selectedOrder.paymentMethod})
                        </span>
                        <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {selectedOrder.pdcSchedule.length} Checks Staggered
                        </span>
                      </div>

                      <div className="space-y-2">
                        {selectedOrder.pdcSchedule.map((tranche, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span className="font-mono text-blue-700 font-bold">{tranche.checkNo}</span>
                                <span className="text-slate-400">&bull;</span>
                                <span className="text-slate-700">{tranche.bank}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>Maturity / Deposit Due: <strong className="text-slate-700">{tranche.dueDate}</strong> ({tranche.days} Days)</span>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {formatPHP(tranche.amount)}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  tranche.status === 'Cleared / Deposited'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : tranche.status === 'In Vault (Pending Clearance)'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {tranche.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                        * Post-dated checks are verified against signed BIR Form 2307 and vaulted in the QC Hub treasury desk for scheduled banking clearance.
                      </div>
                    </div>
                  )}
                </div>

                {/* Audit Actions */}
                <div className="space-y-3 pt-2">
                  {/* Customer Tracking Link Quick Bar */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                      <span className="font-medium text-slate-900">Live Customer Status Link:</span>
                      <span className="font-mono text-slate-500 hidden sm:inline">{selectedOrder.id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(selectedOrder.id)}`;
                          navigator.clipboard.writeText(url);
                          if (onTriggerToast) onTriggerToast(`Copied customer live tracking link for ${selectedOrder.id}!`);
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 text-[11px] font-medium transition-colors cursor-pointer "
                        title="Copy link to send via Viber or SMS to the customer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Copy Viber Link</span>
                      </button>
                      {onOpenCustomerLink && (
                        <button
                          type="button"
                          onClick={() => onOpenCustomerLink(selectedOrder.id)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium transition-colors cursor-pointer "
                          title="Open the customer's live view in this tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Preview Live Link</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedOrder.paymentStatus === 'Under Review' || selectedOrder.paymentStatus === 'Awaiting Proof' ? (
                    <div className="space-y-4">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Amount received (PHP)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={amountReceivedInput}
                        onChange={(e) => setAmountReceivedInput(e.target.value)}
                        placeholder={String(selectedOrder.amount)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Order total {selectedOrder.amount.toLocaleString()} · Non-PDC requires ≥95%. Leave blank to use full total.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Button 1: Approve Payment & Sync QuickBooks */}
                      <button
                        type="button"
                        disabled={!financeOk}
                        title={!financeOk ? 'Only Manager can final-approve payments' : undefined}
                        onClick={() => {
                          const raw = amountReceivedInput.trim();
                          const amt = raw === '' ? selectedOrder.amount : Number(raw);
                          onApproveOrder(selectedOrder.id, amt);
                        }}
                        className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition-all  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve &amp; Sync QuickBooks</span>
                      </button>

                      {/* Button 2: Reject Payment Proof */}
                      <button
                        type="button"
                        disabled={!financeOk}
                        title={!financeOk ? 'Only Manager can reject payments' : undefined}
                        onClick={() => setRejectModalOrderId(selectedOrder.id)}
                        className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-300 font-semibold text-xs tracking-wide transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Payment Proof</span>
                      </button>
                      {!financeOk && (
                        <p className="sm:col-span-2 text-[11px] text-slate-500">
                          Counter can open this queue and note proof for the customer. Final approve/reject is Manager only.
                        </p>
                      )}
                    </div>
                    </div>
                  ) : selectedOrder.paymentStatus === 'Cleared' || selectedOrder.paymentStatus === 'Credit Approved (PDC)' ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-emerald-800">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                        <div>
                          <strong className="font-semibold">Payment Officially Verified!</strong>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            QuickBooks Journal Entry: <span className="font-mono text-slate-700">QB-JE-2026-9918</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                        Stock Reserved
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                      <strong>Payment Proof Rejected:</strong> {selectedOrder.rejectionReason || 'Discrepancy in deposit slip'}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-400">
                Select an order from the queue to inspect payment proof.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANEL B: VISUAL SHOP BAY QUEUE & CALENDAR MANAGEMENT */}
      {activeTab === 'bays' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <span>Quezon City Central Service Bays</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time bay workflow tracking for computerized alignment, high-speed spin balancing, and mounting.
              </p>
            </div>

            <button
              onClick={() => setWalkinModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition-all  cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Log Walk-In Customer</span>
            </button>
          </div>

          {/* Bays Columns (Bay 1 vs Bay 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BAY 1: ALIGNMENT & SUSPENSION BAY */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 ">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <h4 className="text-base font-bold text-slate-900">
                    Bay 1: Computerized 3D Alignment &amp; Suspension
                  </h4>
                </div>
                <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  Hunter Hawkeye Elite
                </span>
              </div>

              <div className="space-y-3">
                {TIME_SLOTS.map(slot => {
                  const booking = bookings.find(b => b.bay === 1 && b.timeSlot === slot);

                  return (
                    <div
                      key={slot}
                      className={`p-4 rounded-xl border transition-all ${
                        booking
                          ? 'bg-slate-50 border-slate-300 '
                          : 'bg-white border border-dashed border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-mono font-bold text-xs text-slate-900">{slot}</span>
                        </div>

                        {booking ? (
                          <div className="relative">
                            <select
                              value={booking.status}
                              onChange={e => onUpdateBookingStatus(booking.id, e.target.value as any)}
                              className="bg-white text-xs font-medium rounded-lg border border-slate-300 px-3 py-1 text-slate-800 focus:border-blue-600 outline-none pr-7 appearance-none cursor-pointer"
                            >
                              <option value="Waiting for Arrival">Waiting for Arrival</option>
                              <option value="Vehicle in Bay (In Progress)">In Bay (In Progress)</option>
                              <option value="Installation Complete (Ready for Release)">Complete (Ready)</option>
                              <option value="Completed">Completed</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        ) : (
                          <span className="text-[11px] text-blue-600 font-medium">Slot Available</span>
                        )}
                      </div>

                      {booking ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{booking.customerName}</span>
                            <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {booking.plateNumber}
                            </span>
                          </div>

                          <div className="text-slate-600 flex items-center space-x-2">
                            <Car className="w-3.5 h-3.5 text-slate-400" />
                            <span>{booking.vehicleModel}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {booking.services.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* Customer Viber / Live Status Link */}
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-mono">Ref: {booking.id}</span>
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const url = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(booking.plateNumber)}`;
                                  navigator.clipboard.writeText(url);
                                  if (onTriggerToast) onTriggerToast(`Copied tracking link for plate ${booking.plateNumber}!`);
                                }}
                                className="flex items-center space-x-1 px-2 py-1 rounded bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 transition-colors cursor-pointer "
                                title="Copy Viber live tracking link for this driver"
                              >
                                <Share2 className="w-3 h-3" />
                                <span>Copy Link</span>
                              </button>
                              {onOpenCustomerLink && (
                                <button
                                  type="button"
                                  onClick={() => onOpenCustomerLink(booking.plateNumber)}
                                  className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer "
                                  title="Preview customer live view"
                                >
                                  <ExternalLink className="w-3 h-3 text-blue-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No reservation scheduled.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BAY 2: TIRE FITTING & BALANCING BAY */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 ">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <h4 className="text-base font-bold text-slate-900">
                    Bay 2: Tire Fitting &amp; High-Speed Spin
                  </h4>
                </div>
                <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  Corghi Master Leverless
                </span>
              </div>

              <div className="space-y-3">
                {TIME_SLOTS.map(slot => {
                  const booking = bookings.find(b => b.bay === 2 && b.timeSlot === slot);

                  return (
                    <div
                      key={slot}
                      className={`p-4 rounded-xl border transition-all ${
                        booking
                          ? 'bg-slate-50 border-slate-300 '
                          : 'bg-white border border-dashed border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-mono font-bold text-xs text-slate-900">{slot}</span>
                        </div>

                        {booking ? (
                          <div className="relative">
                            <select
                              value={booking.status}
                              onChange={e => onUpdateBookingStatus(booking.id, e.target.value as any)}
                              className="bg-white text-xs font-medium rounded-lg border border-slate-300 px-3 py-1 text-slate-800 focus:border-blue-600 outline-none pr-7 appearance-none cursor-pointer"
                            >
                              <option value="Waiting for Arrival">Waiting for Arrival</option>
                              <option value="Vehicle in Bay (In Progress)">In Bay (In Progress)</option>
                              <option value="Installation Complete (Ready for Release)">Complete (Ready)</option>
                              <option value="Completed">Completed</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        ) : (
                          <span className="text-[11px] text-blue-600 font-medium">Slot Available</span>
                        )}
                      </div>

                      {booking ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{booking.customerName}</span>
                            <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {booking.plateNumber}
                            </span>
                          </div>

                          <div className="text-slate-600 flex items-center space-x-2">
                            <Car className="w-3.5 h-3.5 text-slate-400" />
                            <span>{booking.vehicleModel}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {booking.services.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* Customer Viber / Live Status Link */}
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-mono">Ref: {booking.id}</span>
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const url = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(booking.plateNumber)}`;
                                  navigator.clipboard.writeText(url);
                                  if (onTriggerToast) onTriggerToast(`Copied tracking link for plate ${booking.plateNumber}!`);
                                }}
                                className="flex items-center space-x-1 px-2 py-1 rounded bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 transition-colors cursor-pointer "
                                title="Copy Viber live tracking link for this driver"
                              >
                                <Share2 className="w-3 h-3" />
                                <span>Copy Link</span>
                              </button>
                              {onOpenCustomerLink && (
                                <button
                                  type="button"
                                  onClick={() => onOpenCustomerLink(booking.plateNumber)}
                                  className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer "
                                  title="Preview customer live view"
                                >
                                  <ExternalLink className="w-3 h-3 text-blue-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No reservation scheduled.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Reject Payment Proof Modal */}
      {rejectModalOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-bold text-center text-slate-900">
              Reject Deposit Proof
            </h4>
            <p className="text-xs text-slate-500 text-center">
              Please specify the audit discrepancy reason. An automated notification will be dispatched to the customer.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Audit Reason</label>
              <div className="relative">
                <select
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-4 text-xs text-slate-900 focus:border-rose-500 focus:bg-white outline-none appearance-none cursor-pointer"
                >
                  <option value="Deposit slip image is unreadable or blurry.">Deposit slip image is unreadable or blurry.</option>
                  <option value="Amount on receipt does not match order payable amount.">Amount on receipt does not match order payable amount.</option>
                  <option value="Bank reference number is invalid or not yet reflected on statement.">Bank reference number invalid / not reflected.</option>
                  <option value="Duplicate payment proof detected.">Duplicate payment proof detected.</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setRejectModalOrderId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRejectOrder(rejectModalOrderId, rejectReason);
                  setRejectModalOrderId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer "
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Walk-in Customer Modal */}
      {walkinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-md">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Log On-Site Walk-In Customer</span>
            </h4>

            <form onSubmit={handleCreateWalkin} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={walkinName}
                    onChange={e => setWalkinName(e.target.value)}
                    placeholder="e.g. Dennis Lim"
                    className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Plate / CS Number *</label>
                  <input
                    type="text"
                    required
                    value={walkinPlate}
                    onChange={e => setWalkinPlate(e.target.value)}
                    placeholder="e.g. NBF 7712"
                    className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs font-mono uppercase text-blue-700 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Vehicle Model *</label>
                  <input
                    type="text"
                    required
                    value={walkinModel}
                    onChange={e => setWalkinModel(e.target.value)}
                    placeholder="e.g. Honda Civic RS"
                    className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Mobile Contact</label>
                  <input
                    type="text"
                    value={walkinPhone}
                    onChange={e => setWalkinPhone(e.target.value)}
                    placeholder="0917-000-0000"
                    className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Assign Physical Bay</label>
                  <div className="relative">
                    <select
                      value={walkinBay}
                      onChange={e => setWalkinBay(Number(e.target.value) as 1 | 2)}
                      className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value={1}>Bay 1 (Alignment)</option>
                      <option value={2}>Bay 2 (Tire Fitting)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Time Slot</label>
                  <div className="relative">
                    <select
                      value={walkinSlot}
                      onChange={e => setWalkinSlot(e.target.value)}
                      className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white appearance-none cursor-pointer"
                    >
                      {TIME_SLOTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setWalkinModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer "
                >
                  Assign to Bay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
