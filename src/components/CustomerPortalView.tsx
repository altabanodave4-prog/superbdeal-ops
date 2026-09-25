import React, { useState, useMemo } from 'react';
import { OrderRecord, ShopBooking, TireProduct } from '../data';
import { formatPHP } from '../utils';
import {
  ShieldCheck,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  MessageSquare,
  Share2,
  Search,
  ArrowRight,
  Disc,
  Car,
  QrCode,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface CustomerPortalViewProps {
  orders: OrderRecord[];
  bookings: ShopBooking[];
  products: TireProduct[];
  initialSearchQuery?: string;
  onReturnToStaff: () => void;
  onOpenBookingModal?: () => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  orders,
  bookings,
  products,
  initialSearchQuery = '',
  onReturnToStaff,
}) => {
  const [query, setQuery] = useState<string>(initialSearchQuery || 'ORD-9940');
  const [copiedLink, setCopiedLink] = useState(false);

  // Find matching order or booking by Order ID, Booking ID, or Plate Number
  const searchResult = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return null;

    // Direct Order Match
    const matchedOrder = orders.find(
      o => o.id.toUpperCase() === q ||
           (o.plateNumber && o.plateNumber.toUpperCase().replace(/\s/g, '').includes(q.replace(/\s/g, ''))) ||
           o.referenceNumber.toUpperCase().includes(q)
    );

    // Direct Booking Match
    const matchedBooking = bookings.find(
      b => b.id.toUpperCase() === q ||
           b.plateNumber.toUpperCase().replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    );

    return {
      order: matchedOrder || orders[2] || orders[0],
      booking: matchedBooking || (matchedOrder?.bookingRef ? bookings.find(b => b.id === matchedOrder.bookingRef) : bookings[0])
    };
  }, [query, orders, bookings]);

  const activeOrder = searchResult?.order || orders[0];
  const activeBooking = searchResult?.booking || bookings[0];

  // Derive active status stage (1 to 4)
  const currentStage = useMemo(() => {
    if (!activeOrder) return 2;
    if (activeOrder.paymentStatus === 'Rejected') return -1;
    if (activeOrder.paymentStatus === 'Under Review' || activeOrder.paymentStatus === 'Awaiting Proof') return 1;
    if (activeOrder.paymentStatus === 'Cleared' || activeOrder.paymentStatus === 'Credit Approved (PDC)') {
      if (activeBooking?.status === 'Vehicle in Bay (In Progress)') return 3;
      if (activeBooking?.status === 'Installation Complete (Ready for Release)' || activeBooking?.status === 'Completed') return 4;
      return 2; // Stock Allocation / Pick & Prep
    }
    if (activeOrder.fulfillmentStatus === 'Picking' || activeOrder.fulfillmentStatus === 'Allocated') return 2;
    if (activeOrder.fulfillmentStatus === 'Dispatched' || activeOrder.fulfillmentStatus === 'Completed') {
      if (activeBooking?.status === 'Vehicle in Bay (In Progress)') return 3;
      if (activeBooking?.status === 'Completed') return 4;
      return 3;
    }
    return 3;
  }, [activeOrder, activeBooking]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(activeOrder.id)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Staff Preview Bar Indicator */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-zinc-300">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="font-semibold text-white">Customer Live Portal Preview</span>
          <span className="text-zinc-400 hidden sm:inline">&bull;</span>
          <span className="text-zinc-400 hidden sm:inline">This is the exact view your retail &amp; fleet drivers see when opening your Viber link.</span>
        </div>
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 font-medium transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Copy Customer Viber Link'}</span>
          </button>
          <button
            onClick={onReturnToStaff}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Back to Staff Workstation</span>
          </button>
        </div>
      </div>

      {/* Customer Header Search & Quick Switcher */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Superbdeal Corp &bull; Central QC Service Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Live Vehicle &amp; Order Status
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Track your bank verification, warehouse tire allocation, and live installation progress inside Bay 1 (Alignment) &amp; Bay 2 (Tire Fitting).
            </p>
          </div>

          {/* Quick Lookup Form */}
          <div className="w-full lg:w-96">
            <div className="bg-black border border-zinc-800 rounded-2xl p-2.5 focus-within:border-blue-500 transition-colors shadow-inner flex items-center space-x-2">
              <Search className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter Order ID or Plate (e.g. NDI 4821, ORD-9940)"
                className="w-full bg-transparent text-white placeholder-zinc-500 text-xs font-mono uppercase focus:outline-none"
              />
              <button
                onClick={() => setQuery('ORD-9940')}
                className="text-[10px] px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono shrink-0 transition-colors cursor-pointer"
                title="View live demo order currently in Bay 1"
              >
                Demo Bay 1
              </button>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-[11px] text-zinc-400">
              <span>Try:</span>
              <button onClick={() => setQuery('ORD-9940')} className="text-blue-400 hover:underline font-mono">ORD-9940 (In Bay)</button>
              <span>&bull;</span>
              <button onClick={() => setQuery('ORD-9932')} className="text-blue-400 hover:underline font-mono">ORD-9932 (Fleet)</button>
              <span>&bull;</span>
              <button onClick={() => setQuery('BAC 1049')} className="text-blue-400 hover:underline font-mono">BAC 1049</button>
            </div>
          </div>
        </div>

        {/* Live Identification Badge */}
        <div className="mt-8 pt-6 border-t border-zinc-850/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Vehicle Plate</span>
            <span className="font-mono text-base font-bold text-white mt-0.5 block flex items-center gap-1.5">
              <Car className="w-4 h-4 text-blue-400" />
              {activeOrder.plateNumber || activeBooking?.plateNumber || 'WALK-IN'}
            </span>
            <span className="text-zinc-400 text-[11px] truncate block">
              {activeOrder.vehicleModel || activeBooking?.vehicleModel || 'Standard Passenger Vehicle'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Customer Reference</span>
            <span className="font-semibold text-white mt-0.5 block truncate">
              {activeOrder.customerName}
            </span>
            <span className="text-zinc-400 font-mono text-[11px] block truncate">
              Order: {activeOrder.id}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Assigned Bay</span>
            <span className="font-semibold text-white mt-0.5 block flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              {activeBooking?.bay === 1 ? 'Bay 1 (3D Laser Alignment)' : 'Bay 2 (Corghi Tire Fitting)'}
            </span>
            <span className="text-zinc-400 text-[11px] block">
              Quezon City Central Hub
            </span>
          </div>

          <div>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Live Service Status</span>
            <div className="mt-1 flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                currentStage === 3
                  ? 'bg-blue-600 text-white animate-pulse'
                  : currentStage === 4
                  ? 'bg-zinc-800 text-blue-400 border border-blue-500/40'
                  : currentStage === -1
                  ? 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                  : 'bg-zinc-900 text-blue-300 border border-blue-500/30'
              }`}>
                {currentStage === 3 ? 'Vehicle In Bay (Active)' : activeOrder.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-STAGE LIVE PROGRESS STEPPER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Real-Time Service Stepper</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automated milestone tracking updated live by Quezon City shop advisors and mechanics.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono font-bold text-blue-400">
              Stage {Math.max(1, currentStage)} of 4
            </span>
          </div>
        </div>

        {/* Step Progress Track */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          {/* Step 1: Payment Verification */}
          <div className={`p-5 rounded-2xl border transition-all ${
            currentStage >= 1
              ? 'bg-zinc-900/90 border-blue-500/40 text-white shadow-lg shadow-blue-950/20'
              : 'bg-zinc-950 border-zinc-850 text-zinc-500'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStage >= 2
                  ? 'bg-blue-600 text-white'
                  : currentStage === 1
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-zinc-900 text-zinc-500'
              }`}>
                {currentStage >= 2 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Accounting</span>
            </div>
            <h3 className="text-sm font-bold tracking-tight text-white mb-1">
              Payment Verified
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {activeOrder.paymentMethod} ref <span className="font-mono text-zinc-300">{activeOrder.referenceNumber}</span> audited by QC finance.
            </p>
            {activeOrder.quickBooksSyncId && (
              <span className="inline-block mt-2 text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {activeOrder.quickBooksSyncId}
              </span>
            )}
          </div>

          {/* Step 2: Warehouse Stock Allocation */}
          <div className={`p-5 rounded-2xl border transition-all ${
            currentStage >= 2
              ? 'bg-zinc-900/90 border-blue-500/40 text-white shadow-lg shadow-blue-950/20'
              : 'bg-zinc-950 border-zinc-850 text-zinc-500'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStage >= 3
                  ? 'bg-blue-600 text-white'
                  : currentStage === 2
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-zinc-900 text-zinc-500'
              }`}>
                {currentStage >= 3 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Warehouse</span>
            </div>
            <h3 className="text-sm font-bold tracking-tight text-white mb-1">
              Tires Picked &amp; Inspected
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tires pulled from Quezon City warehouse. DOT date stamp confirmed (<span className="font-mono text-zinc-300">{activeOrder.items[0]?.dotBatchCode || 'DOT 2025'}</span>).
            </p>
          </div>

          {/* Step 3: Bay Work In Progress */}
          <div className={`p-5 rounded-2xl border transition-all ${
            currentStage >= 3
              ? 'bg-zinc-900/90 border-blue-500/50 text-white shadow-lg shadow-blue-950/30 ring-1 ring-blue-500/30'
              : 'bg-zinc-950 border-zinc-850 text-zinc-500'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStage >= 4
                  ? 'bg-blue-600 text-white'
                  : currentStage === 3
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-zinc-900 text-zinc-500'
              }`}>
                {currentStage >= 4 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
              </span>
              <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Active Bay</span>
            </div>
            <h3 className="text-sm font-bold tracking-tight text-white mb-1">
              Vehicle In Service Bay
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {activeBooking?.bay === 1 ? 'Hunter 3D Hawkeye Laser Alignment' : 'Corghi Leverless Tire Mounting & Spin Balancing'} currently active.
            </p>
            {currentStage === 3 && (
              <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-blue-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                <span>Work in progress &bull; Est. 15-20m</span>
              </div>
            )}
          </div>

          {/* Step 4: Ready for Release */}
          <div className={`p-5 rounded-2xl border transition-all ${
            currentStage >= 4
              ? 'bg-zinc-900/90 border-blue-500/50 text-white shadow-lg shadow-blue-950/30'
              : 'bg-zinc-950 border-zinc-850 text-zinc-500'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStage >= 4
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-900 text-zinc-500'
              }`}>
                {currentStage >= 4 ? <CheckCircle2 className="w-4 h-4" /> : '4'}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Final Signoff</span>
            </div>
            <h3 className="text-sm font-bold tracking-tight text-white mb-1">
              Ready for Vehicle Release
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Torque spec verified (105 lb-ft). 3D alignment diagnostic printout ready at service counter.
            </p>
          </div>

        </div>
      </div>

      {/* TWO-COLUMN DETAILS: BAY TERMINAL STATUS + TIRE & WARRANTY PASS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col (7 cols): Bay Details & Live Technician Assignment */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between pb-5 border-b border-zinc-850">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Shop Bay Operations Details
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Live bay allocation at Superbdeal Corp Quezon City Hub
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-900 text-blue-400 border border-zinc-800">
                {activeBooking?.id || 'APPT-HUB-01'}
              </span>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 font-medium uppercase tracking-wider block text-[10px]">
                    Physical Bay Assignment
                  </span>
                  <p className="text-sm font-bold text-white mt-1">
                    {activeBooking?.bay === 1 ? 'Bay 1 — Hawkeye 3D Alignment' : 'Bay 2 — Heavy Tire Fitting & Balance'}
                  </p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    {activeBooking?.bay === 1 ? 'Hunter Elite High-Definition Laser Rack' : 'Corghi Master Leverless Tire Changers'}
                  </p>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 font-medium uppercase tracking-wider block text-[10px]">
                    Scheduled Service Window
                  </span>
                  <p className="text-sm font-bold text-white mt-1 font-mono">
                    {activeBooking?.timeSlot || '09:00 AM – 10:30 AM'} ({activeBooking?.date || 'Today'})
                  </p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Standard 90-Minute Express Slot
                  </p>
                </div>
              </div>

              {/* Included Services Checklist */}
              <div className="bg-black/60 p-4 rounded-2xl border border-zinc-850 space-y-2.5">
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                  Included Bay Labor &amp; Quality Checks:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Computerized 4-Wheel Laser Alignment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Dynamic High-Speed Spin Balancing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Brand-New TR414 Rubber Valves</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Digital Nitrogen Inflation (34 PSI)</span>
                  </div>
                </div>
              </div>

              {/* Technician Notes */}
              {activeBooking?.notes && (
                <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 flex items-start space-x-2">
                  <span className="font-bold text-blue-400 shrink-0">Advisor Note:</span>
                  <span>{activeBooking.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Directions Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Quezon City Service Hub Directions
                </h3>
                <p className="text-xs text-zinc-400">
                  #148 G. Araneta Ave. cor. Ma. Clara St., Brgy. Sto. Domingo, Quezon City
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-5">
              Our branch features high-clearance truck and SUV service bays, a climate-controlled customer lounge with high-speed WiFi, complimentary espresso, and real-time bay viewing windows.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://maps.google.com/?q=Quezon+City+Philippines"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Navigate via Google Maps / Waze</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>

              <a
                href="tel:0283719920"
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 font-medium text-xs transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Call QC Dispatch: (02) 8371-9920</span>
              </a>

              <a
                href="https://viber.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 font-medium text-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Chat with Service Advisor on Viber</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): Official Digital Tire Pass & Warranty */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-5 border-b border-zinc-850">
              <div className="flex items-center space-x-2.5">
                <Disc className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Digital Tire &amp; Warranty Pass
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase bg-zinc-900 px-2 py-1 rounded">
                Official Receipt
              </span>
            </div>

            {/* Tires in Order */}
            <div className="mt-6 space-y-4">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {item.productName}
                      </h4>
                      <p className="text-xs font-mono text-blue-400 mt-0.5">
                        {item.specCode}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                      {item.quantity} Units
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <span>DOT Production Batch:</span>
                    <span className="font-mono text-white font-semibold">
                      {item.dotBatchCode || 'DOT 0625 (Fresh Spec)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Factory Warranty:</span>
                    <span className="text-blue-400 font-medium">
                      5-Year Authorized Protection
                    </span>
                  </div>
                </div>
              ))}

              {/* Financial VAT Breakdown */}
              <div className="bg-black/60 p-4 rounded-2xl border border-zinc-850 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Gross Order Amount:</span>
                  <span className="font-mono text-white">{formatPHP(activeOrder.amount)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Net of 12% BIR VAT:</span>
                  <span className="font-mono text-zinc-300">{formatPHP(activeOrder.amount / 1.12)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>12% Philippine VAT:</span>
                  <span className="font-mono text-zinc-300">{formatPHP(activeOrder.amount - (activeOrder.amount / 1.12))}</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-sm text-white">
                  <span>Total Payable:</span>
                  <span className="font-mono text-blue-400">{formatPHP(activeOrder.amount)}</span>
                </div>
              </div>

              {/* Digital QR Pass Stub */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-xl p-1.5 shrink-0 flex items-center justify-center">
                  <QrCode className="w-full h-full text-black" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Digital Shop Gate Pass</span>
                  <p className="text-zinc-400 text-[11px] mt-0.5 leading-snug">
                    Present this QR code to the Quezon City security gate upon arrival for priority bay admission.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
