import React, { useState } from 'react';
import { OrderRecord } from '../data';
import { formatPHP } from '../utils';
import { X, Search, CheckCircle2, Clock, Truck, ShieldCheck, AlertCircle } from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  const [searchQuery, setSearchQuery] = useState('ORD-9932');
  const [matchedOrder, setMatchedOrder] = useState<OrderRecord | null>(orders[0] || null);
  const [hasSearched, setHasSearched] = useState(true);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim().toLowerCase();
    const found = orders.find(
      o => o.id.toLowerCase() === cleanQuery || o.phone.includes(cleanQuery) || o.referenceNumber.toLowerCase().includes(cleanQuery)
    );
    setMatchedOrder(found || null);
    setHasSearched(true);
  };

  const getStepProgress = (status: OrderRecord['status']) => {
    switch (status) {
      case 'Pending Verification':
      case 'Under Review':
      case 'Awaiting Proof':
        return 1;
      case 'Payment Verified':
      case 'Cleared':
      case 'Credit Approved (PDC)':
      case 'Allocated':
        return 2;
      case 'Warehouse Pick & Prep':
      case 'Picking':
        return 3;
      case 'Ready for Dispatch / Installation':
      case 'Dispatched':
      case 'Completed':
      case 'Paid':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = matchedOrder ? getStepProgress(matchedOrder.status) : 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">
                Track Order &amp; Fulfillment Status
              </h3>
              <p className="text-xs text-zinc-400">
                Check bank verification, warehouse preparation, or installation readiness
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Enter Order ID (e.g. ORD-9932) or Mobile Phone..."
            className="flex-1 h-12 bg-black/80 border border-zinc-700/80 rounded-xl px-4 text-sm text-zinc-100 font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          <button
            type="submit"
            className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer"
          >
            Track
          </button>
        </form>

        {/* Search Result */}
        {hasSearched && matchedOrder ? (
          <div className="space-y-6">
            {/* Status Stepper */}
            <div className="bg-black/80 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-sm font-bold text-blue-400">{matchedOrder.id}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium">
                  {matchedOrder.status}
                </span>
              </div>

              {/* 4-Step Progress Bar */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[
                  { step: 1, label: 'Order Submitted' },
                  { step: 2, label: 'Bank Verified' },
                  { step: 3, label: 'Warehouse Pick' },
                  { step: 4, label: 'Ready / Released' },
                ].map(item => {
                  const isDone = currentStep >= item.step;
                  return (
                    <div key={item.step} className="text-center">
                      <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                      </div>
                      <span className={`text-[11px] font-medium mt-2 block ${
                        isDone ? 'text-zinc-200' : 'text-zinc-500'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-black/60 border border-zinc-800 rounded-2xl p-5 text-xs space-y-2.5">
              <div className="flex justify-between text-zinc-400">
                <span>Customer:</span>
                <span className="font-semibold text-white">{matchedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Fulfillment Mode:</span>
                <span className="text-zinc-200">{matchedOrder.fulfillmentType}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Payment Method:</span>
                <span className="text-zinc-200">{matchedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Bank Ref #:</span>
                <span className="font-mono text-blue-400 font-semibold">{matchedOrder.referenceNumber}</span>
              </div>
              <div className="flex justify-between text-zinc-400 pt-2 border-t border-zinc-800">
                <span className="font-medium text-white">Order Total:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{formatPHP(matchedOrder.amount)}</span>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="text-center py-10 bg-black/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-400">
            <AlertCircle className="w-10 h-10 mx-auto text-amber-500/80 mb-2" />
            <p className="text-sm font-semibold text-white">No order record found matching &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-zinc-400 mt-1">Please verify the Order ID or phone number.</p>
          </div>
        ) : null}

        <div className="pt-2 text-center text-xs text-zinc-400">
          Need urgent assistance? Call Superbdeal Corp dispatch hotline:{' '}
          <strong className="text-blue-400 font-semibold">(02) 8371-9920</strong>
        </div>

      </div>
    </div>
  );
};
