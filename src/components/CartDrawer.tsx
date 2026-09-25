import React, { useState } from 'react';
import { CartItem, OrderRecord } from '../data';
import { formatPHP, calculateVatBreakdown } from '../utils';
import { X, ShoppingBag, Trash2, ArrowRight, Truck, Wrench, CreditCard, Building, Upload, CheckCircle2, QrCode } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCompleteCheckout: (order: OrderRecord) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCompleteCheckout,
}) => {
  const [fulfillmentType, setFulfillmentType] = useState<'Direct Delivery' | 'Installation at QC Branch'>('Installation at QC Branch');
  const [paymentMethod, setPaymentMethod] = useState<'PayMongo Gateway' | 'Bank Transfer (BDO)' | 'Bank Transfer (BPI)' | '30/60 Days PDC'>('Bank Transfer (BDO)');
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  if (!isOpen) return null;

  const itemsGross = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const deliveryFee = fulfillmentType === 'Direct Delivery' ? 500 : 0;
  const grandTotal = itemsGross + deliveryFee;
  const { netOfVat, vatAmount } = calculateVatBreakdown(itemsGross);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) {
      alert('Please fill out customer name and contact phone.');
      return;
    }

    if (fulfillmentType === 'Direct Delivery' && !deliveryAddress) {
      alert('Please provide your complete delivery address in Metro Manila.');
      return;
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderRecord = {
      id: orderId,
      customerName,
      phone,
      email: email || 'customer@gmail.com',
      items: cartItems.map(item => ({
        productName: `${item.product.brand} ${item.product.model}`,
        specCode: item.product.specCode,
        quantity: item.quantity,
        unitPrice: item.product.price
      })),
      amount: grandTotal,
      fulfillmentType,
      deliveryAddress: fulfillmentType === 'Direct Delivery' ? deliveryAddress : undefined,
      paymentMethod,
      paymentStatus: 'Under Review',
      fulfillmentStatus: 'Not Started',
      status: 'Pending Verification',
      referenceNumber: referenceNumber || `REF-${Math.floor(1000000 + Math.random() * 9000000)}`,
      submissionDate: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      proofImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
    };

    onCompleteCheckout(newOrder);
    setCompletedOrder(newOrder);
    setIsSuccess(true);
    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-950/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">
                Delivery Cart &amp; Direct Checkout
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {cartItems.length} items &bull; Quezon City Distribution Warehouse
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

        {/* Body Content */}
        <div className="p-6 flex-1 space-y-6">
          {isSuccess && completedOrder ? (
            /* Order Placed Success Confirmation */
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-2xl font-bold text-white">
                  Order Successfully Placed!
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mt-1">
                  Your order has been queued for bank verification and warehouse packaging. An SMS confirmation reference was sent to {completedOrder.phone}.
                </p>
              </div>

              <div className="bg-black/80 border border-zinc-800 rounded-2xl p-5 text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400 font-sans">Order Tracking ID:</span>
                  <span className="text-blue-400 font-bold">{completedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400 font-sans">Audit Status:</span>
                  <span className="text-amber-400 font-bold">Pending Bank Verification</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400 font-sans">Fulfillment Mode:</span>
                  <span className="text-zinc-200">{completedOrder.fulfillmentType}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-sans font-bold">
                  <span className="text-zinc-200">Total Payable:</span>
                  <span className="text-blue-400 font-mono">{formatPHP(completedOrder.amount)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer"
              >
                Back to Tire Catalog
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-zinc-600" />
              <p className="text-base font-bold text-zinc-300">Your cart is currently empty.</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Explore the warehouse catalog to add tires for dispatch or Quezon City fitting.
              </p>
            </div>
          ) : (
            /* Items & Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* Cart Items List */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                  Items in Cart
                </span>
                {cartItems.map(item => (
                  <div
                    key={item.product.id}
                    className="p-4 rounded-xl bg-black/60 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-white">
                        {item.product.brand} {item.product.model}
                      </div>
                      <div className="font-mono text-xs text-blue-400 font-semibold">{item.product.specCode}</div>
                      <div className="font-mono text-xs text-zinc-300 mt-1">
                        {formatPHP(item.product.price)} each
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center space-x-1.5 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center justify-center cursor-pointer text-xs transition-colors"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-white text-xs px-2">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center justify-center cursor-pointer text-xs transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Fulfillment Method Selection */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                  Select Fulfillment Mode
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('Installation at QC Branch')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      fulfillmentType === 'Installation at QC Branch'
                        ? 'bg-blue-500/10 border-blue-500 text-blue-300'
                        : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Wrench className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold">QC Shop Fitting</span>
                    </div>
                    <div className="text-[11px] text-blue-400 mt-1 font-medium">FREE Mounting &amp; Alignment</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('Direct Delivery')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      fulfillmentType === 'Direct Delivery'
                        ? 'bg-blue-500/10 border-blue-500 text-blue-300'
                        : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold">Direct Delivery</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1 font-mono">₱500 Flat Metro Manila</div>
                  </button>
                </div>
              </div>

              {/* Customer Contact & Address Info */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                  Customer &amp; Contact Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. Manuel Roxas"
                      className="w-full h-11 bg-black/80 border border-zinc-700/80 rounded-xl px-3 text-xs text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0917-XXX-XXXX"
                      className="w-full h-11 bg-black/80 border border-zinc-700/80 rounded-xl px-3 text-xs text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {fulfillmentType === 'Direct Delivery' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Metro Manila Delivery Address *</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      placeholder="Street, Barangay, City, Landmark"
                      className="w-full h-11 bg-black/80 border border-zinc-700/80 rounded-xl px-3 text-xs text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                  Payment Channels
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${
                    paymentMethod === 'Bank Transfer (BDO)' ? 'bg-blue-500/10 border-blue-500 text-blue-300' : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Bank Transfer (BDO)'}
                      onChange={() => setPaymentMethod('Bank Transfer (BDO)')}
                      className="accent-blue-500"
                    />
                    <span>BDO Bank Deposit</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${
                    paymentMethod === 'Bank Transfer (BPI)' ? 'bg-blue-500/10 border-blue-500 text-blue-300' : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Bank Transfer (BPI)'}
                      onChange={() => setPaymentMethod('Bank Transfer (BPI)')}
                      className="accent-blue-500"
                    />
                    <span>BPI Bank Deposit</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${
                    paymentMethod === 'PayMongo Gateway' ? 'bg-blue-500/10 border-blue-500 text-blue-300' : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'PayMongo Gateway'}
                      onChange={() => setPaymentMethod('PayMongo Gateway')}
                      className="accent-blue-500"
                    />
                    <span>PayMongo (GCash / Card)</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${
                    paymentMethod === '30/60 Days PDC' ? 'bg-blue-500/10 border-blue-500 text-blue-300' : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === '30/60 Days PDC'}
                      onChange={() => setPaymentMethod('30/60 Days PDC')}
                      className="accent-blue-500"
                    />
                    <span>Corporate PDC</span>
                  </label>
                </div>

                {/* Bank Details & Proof Reference */}
                {paymentMethod.includes('Bank') && (
                  <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 text-xs">
                    <div className="text-zinc-300 font-semibold">Official Superbdeal Corp Bank Account:</div>
                    <div className="font-mono text-blue-400 font-bold">
                      {paymentMethod === 'Bank Transfer (BDO)' ? 'BDO Current A/C: 0012-3456-7890' : 'BPI Corporate A/C: 3821-9902-14'}
                    </div>
                    <div className="text-zinc-400 text-[11px]">Account Name: SUPERBDEAL CORP &bull; Quezon City Branch</div>
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">Enter Bank Reference Number *</label>
                      <input
                        type="text"
                        required
                        value={referenceNumber}
                        onChange={e => setReferenceNumber(e.target.value)}
                        placeholder="e.g. BDO-982104 or BPI-482109"
                        className="w-full h-11 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 font-mono text-xs text-blue-400 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Order Cost Breakdown */}
              <div className="p-4 rounded-xl bg-black/80 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Net of 12% VAT:</span>
                  <span className="font-mono text-zinc-300">{formatPHP(netOfVat)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>12% Value Added Tax (VAT):</span>
                  <span className="font-mono text-zinc-300">{formatPHP(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Fulfillment ({fulfillmentType}):</span>
                  <span className="font-mono text-zinc-300">{formatPHP(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total Payable:</span>
                  <span className="font-mono text-blue-400 text-base font-bold">{formatPHP(grandTotal)}</span>
                </div>
              </div>

              {/* Submit Checkout Button */}
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Submit Order for Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
