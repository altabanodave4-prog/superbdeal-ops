import React, { useState } from 'react';
import { PageHeader } from './ui/PageHeader';
import { TireProduct, B2BQuoteItem, INITIAL_PRODUCTS } from '../data';
import { formatPHP, calculateVatBreakdown, getVolumeDiscountTier } from '../utils';
import {
  FileText,
  Printer,
  Mail,
  Copy,
  Plus,
  Trash2,
  Building2,
  User,
  Phone,
  MapPin,
  Hash,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  Calendar,
  CreditCard,
  Landmark,
  AlertCircle,
  Check
} from 'lucide-react';

export type B2BPaymentTerms =
  | '30 Days PDC'
  | '60 Days PDC'
  | '90 Days PDC'
  | '30-60-90 Staggered PDC (3 Tranches)'
  | '50% DP / 50% Upon Delivery'
  | 'Cash / Bank Transfer';

interface B2BQuoteViewProps {
  quoteItems: B2BQuoteItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onAddItem: (product: TireProduct, qty: number) => void;
  onClearQuote: () => void;
  onConvertToOrder?: (meta: {
    companyName: string;
    attention: string;
    phone: string;
    email: string;
    paymentTerms: string;
    deliveryAddress?: string;
  }) => void;
}

export const B2BQuoteView: React.FC<B2BQuoteViewProps> = ({
  quoteItems,
  onUpdateQuantity,
  onRemoveItem,
  onAddItem,
  onClearQuote,
  onConvertToOrder,
}) => {
  // Corporate Info State
  const [companyName, setCompanyName] = useState('Metro Logistics & Transport Corp.');
  const [attention, setAttention] = useState('Engr. Dominic Reyes (Fleet Director)');
  const [tinNumber, setTinNumber] = useState('240-891-304-000');
  const [address, setAddress] = useState('Lot 12 Block 4, Industrial Ave, Novaliches, Quezon City');
  const [phone, setPhone] = useState('0917-882-3341');
  const [email, setEmail] = useState('procurement@metrologistics.ph');
  const [paymentTerms, setPaymentTerms] = useState<B2BPaymentTerms>('30-60-90 Staggered PDC (3 Tranches)');
  const [issuingBank, setIssuingBank] = useState('BDO Unibank');
  const [startingCheckNo, setStartingCheckNo] = useState('0094182');
  const [applyCwt, setApplyCwt] = useState(true); // 1% BIR 2307 Creditable Withholding Tax for Top Corporate Accounts
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>(INITIAL_PRODUCTS[0].id);
  const [addQuantity, setAddQuantity] = useState<number>(8);

  const [isCopiedToast, setIsCopiedToast] = useState(false);
  const [isEmailSentModal, setIsEmailSentModal] = useState(false);

  // Total Units
  const totalUnits = quoteItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const discountTier = getVolumeDiscountTier(totalUnits);

  // Gross & Net Calculations
  const grossTotal = quoteItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const totalDiscountAmount = grossTotal * discountTier.percentage;
  const netDiscountedTotal = grossTotal - totalDiscountAmount;
  const { netOfVat, vatAmount } = calculateVatBreakdown(netDiscountedTotal);

  // PDC Clearance & Maturity Schedule Calculations
  const isPdcTerm =
    paymentTerms === '30 Days PDC' ||
    paymentTerms === '60 Days PDC' ||
    paymentTerms === '90 Days PDC' ||
    paymentTerms === '30-60-90 Staggered PDC (3 Tranches)';

  const computeBankingDate = (daysFromNow: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    // Philippine Banking System Rule: If maturity falls on weekend, clear on next banking day (Monday)
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPdcSchedule = () => {
    if (!isPdcTerm && paymentTerms !== '50% DP / 50% Upon Delivery') return [];

    let tranches: { trancheNum: number; label: string; days: number; share: number }[] = [];

    if (paymentTerms === '30 Days PDC') {
      tranches = [{ trancheNum: 1, label: '30-Day Bullet PDC', days: 30, share: 1.0 }];
    } else if (paymentTerms === '60 Days PDC') {
      tranches = [{ trancheNum: 1, label: '60-Day Bullet PDC', days: 60, share: 1.0 }];
    } else if (paymentTerms === '90 Days PDC') {
      tranches = [{ trancheNum: 1, label: '90-Day Bullet PDC', days: 90, share: 1.0 }];
    } else if (paymentTerms === '30-60-90 Staggered PDC (3 Tranches)') {
      tranches = [
        { trancheNum: 1, label: 'Tranche 1 (30 Days PDC)', days: 30, share: 1 / 3 },
        { trancheNum: 2, label: 'Tranche 2 (60 Days PDC)', days: 60, share: 1 / 3 },
        { trancheNum: 3, label: 'Tranche 3 (90 Days PDC)', days: 90, share: 1 / 3 }
      ];
    } else if (paymentTerms === '50% DP / 50% Upon Delivery') {
      tranches = [
        { trancheNum: 1, label: '50% Immediate Downpayment', days: 0, share: 0.5 },
        { trancheNum: 2, label: '50% Upon Delivery (PDC)', days: 15, share: 0.5 }
      ];
    }

    const baseCheckNumInt = parseInt(startingCheckNo.replace(/\D/g, '') || '94182', 10);
    const totalCwt = applyCwt ? Math.round(netOfVat * 0.01 * 100) / 100 : 0;

    let allocatedGross = 0;
    let allocatedCwt = 0;

    return tranches.map((t, idx) => {
      const isLast = idx === tranches.length - 1;
      const grossShare = isLast
        ? Math.round((netDiscountedTotal - allocatedGross) * 100) / 100
        : Math.round(netDiscountedTotal * t.share * 100) / 100;
      allocatedGross += grossShare;

      const cwtShare = isLast
        ? Math.round((totalCwt - allocatedCwt) * 100) / 100
        : Math.round(totalCwt * t.share * 100) / 100;
      allocatedCwt += cwtShare;

      const netCheckAmount = Math.round((grossShare - cwtShare) * 100) / 100;
      const checkNo = `CHK-${(baseCheckNumInt + idx).toString().padStart(7, '0')}`;
      const dueDateFormatted = computeBankingDate(t.days);

      return {
        ...t,
        grossShare,
        cwtShare,
        netCheckAmount,
        checkNo,
        dueDateFormatted,
        bank: issuingBank
      };
    });
  };

  const pdcSchedule = getPdcSchedule();

  const handleCopyPdcSchedule = () => {
    const lines = pdcSchedule.map(
      (s, idx) =>
        `Check #${idx + 1} (${s.days} Days PDC): ${s.checkNo} | ${s.bank} | Due: ${s.dueDateFormatted} | Face Value: ${formatPHP(s.netCheckAmount)} (Gross: ${formatPHP(s.grossShare)}${applyCwt ? ` less ${formatPHP(s.cwtShare)} 1% BIR 2307` : ''})`
    ).join('\n');

    const totalCwtVal = applyCwt ? netOfVat * 0.01 : 0;
    const copyText = `SUPERBDEAL CORP - CORPORATE FLEET PDC CLEARANCE SCHEDULE
Quotation Ref: ${quoteNumber}
Client: ${companyName}
Attention: ${attention}
Payment Term: ${paymentTerms}
Total Invoice (12% VAT Inc): ${formatPHP(netDiscountedTotal)}
${applyCwt ? `BIR 2307 Withholding (1% of Net VAT): -${formatPHP(totalCwtVal)}\nNet Payable via Checks: ${formatPHP(netDiscountedTotal - totalCwtVal)}\n` : ''}
${lines}
Note: Checks must be crossed "Account Payee Only", drawn against ${issuingBank}, and issued on physical handover.`;

    navigator.clipboard.writeText(copyText);
    setIsCopiedToast(true);
    setTimeout(() => setIsCopiedToast(false), 2500);
  };

  const quoteNumber = 'SQ-2026-7842';
  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const lines = quoteItems.map(
      (item, idx) => `${idx + 1}. ${item.product.brand} ${item.product.model} (${item.product.specCode}) x ${item.quantity} units @ ${formatPHP(item.product.price)}`
    ).join('\n');

    const text = `SUPERBDEAL CORP - B2B FLEET TIRE QUOTATION\nQuote Ref: ${quoteNumber}\nAccount: ${companyName}\nAttn: ${attention}\nTotal Units: ${totalUnits}\nVolume Tier: ${discountTier.label}\nTotal Net Payable: ${formatPHP(netDiscountedTotal)} (Inclusive of 12% VAT)\n\nItems:\n${lines}\n\nTerms: ${paymentTerms}\nValid until: ${expiryDate}\nQuezon City Hub - Tel: (02) 8371-9920`;

    navigator.clipboard.writeText(text);
    setIsCopiedToast(true);
    setTimeout(() => setIsCopiedToast(false), 3500);
  };

  const handleAddProductFromDropdown = () => {
    const prod = INITIAL_PRODUCTS.find(p => p.id === selectedProductToAdd);
    if (prod) {
      onAddItem(prod, addQuantity);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Fleet quotes"
        description="Build volume quotes and convert accepted terms into a sales order."
      />

      {/* Toast Notification */}
      {isCopiedToast && (
        <div className="fixed top-24 right-6 z-50 bg-blue-600 text-white font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>B2B Quotation summary copied to clipboard!</span>
        </div>
      )}

      {/* Top Banner & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-xl ">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-[13px] font-medium text-slate-600">
              Quote tools
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopySummary}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold tracking-wide transition-all cursor-pointer "
          >
            <Copy className="w-4 h-4 text-blue-600" />
            <span>Copy Text/Viber</span>
          </button>

          <button
            onClick={() => setIsEmailSentModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold tracking-wide transition-all cursor-pointer "
          >
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Email PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold tracking-wide transition-all  cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Formal PDF</span>
          </button>

          {onConvertToOrder && (
            <button
              type="button"
              onClick={() =>
                onConvertToOrder({
                  companyName,
                  attention,
                  phone,
                  email,
                  paymentTerms,
                  deliveryAddress: address,
                })
              }
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all  cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Convert to Sales Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Tier Status Alert */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="text-xs text-slate-700">
            Active Fleet Volume Tier:{' '}
            <strong className="text-blue-700 font-mono text-sm">{discountTier.label}</strong>
            <span className="text-slate-500 block sm:inline sm:ml-2">
              (Total Quantity: <span className="font-mono text-slate-900 font-semibold">{totalUnits} units</span>)
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600">
          {totalUnits < 12 ? (
            <span>Add <strong className="text-blue-700 font-semibold">{12 - totalUnits} more</strong> tires to unlock 5% Bulk Tier</span>
          ) : totalUnits < 24 ? (
            <span>Add <strong className="text-blue-700 font-semibold">{24 - totalUnits} more</strong> tires to unlock 10% Commercial Tier</span>
          ) : (
            <span className="text-blue-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Maximum 10% Fleet Volume Discount Applied
            </span>
          )}
        </div>
      </div>

      {/* Form: Corporate Information Inputs & Quick Line Item Adder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Account Details (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 ">
          <h3 className="text-sm font-bold tracking-wide text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Corporate Fleet Account &amp; Billing Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Company / Registered Entity *</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                placeholder="e.g. Metro Logistics Corp"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Attention (Fleet / Procurement Officer) *</label>
              <input
                type="text"
                value={attention}
                onChange={e => setAttention(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                placeholder="e.g. Engr. Dominic Reyes"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Corporate TIN # (Format: 000-000-000-000) *</label>
              <input
                type="text"
                value={tinNumber}
                onChange={e => setTinNumber(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm font-mono text-blue-700 focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Payment Terms *</label>
              <div className="relative">
                <select
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value as any)}
                  className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="30-60-90 Staggered PDC (3 Tranches)">30 / 60 / 90 Days Staggered PDC (3 Tranches)</option>
                  <option value="30 Days PDC">30 Days Post-Dated Check (Single 30-Day PDC)</option>
                  <option value="60 Days PDC">60 Days Post-Dated Check (Single 60-Day PDC)</option>
                  <option value="90 Days PDC">90 Days Post-Dated Check (Single 90-Day PDC)</option>
                  <option value="50% DP / 50% Upon Delivery">50% DP / 50% Upon Delivery</option>
                  <option value="Cash / Bank Transfer">Cash / Bank Transfer</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Warehouse Delivery &amp; Billing Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Fleet Dispatch Contact Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Corporate Procurement Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Add Product Box (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 flex flex-col justify-between ">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-800 flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Add Tire To Quotation</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Tire Specification</label>
                <div className="relative">
                  <select
                    value={selectedProductToAdd}
                    onChange={e => setSelectedProductToAdd(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none appearance-none transition-all cursor-pointer"
                  >
                    {INITIAL_PRODUCTS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.brand} {p.model} ({p.specCode}) - {formatPHP(p.price)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Batch Quantity (Units)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={addQuantity}
                    onChange={e => setAddQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm font-mono text-blue-700 focus:border-blue-600 focus:bg-white outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setAddQuantity(4)}
                    className="h-12 px-3 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 cursor-pointer font-bold transition-colors"
                  >
                    4
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddQuantity(8)}
                    className="h-12 px-3 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 cursor-pointer font-bold transition-colors"
                  >
                    8
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddQuantity(16)}
                    className="h-12 px-3 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 cursor-pointer font-bold transition-colors"
                  >
                    16
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddProductFromDropdown}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide rounded-xl  transition-all cursor-pointer flex items-center justify-center space-x-2 mt-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add Specification to Queue</span>
          </button>
        </div>

      </div>

      {/* INTERACTIVE PDC SCHEDULE & UNDERWRITING REGISTER */}
      {pdcSchedule.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7  space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                  <Landmark className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Post-Dated Check (PDC) Maturity Schedule &amp; Check Register
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Automated Philippine banking clearing day calculation (Mon–Fri) for <strong>{paymentTerms}</strong>.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopyPdcSchedule}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-all cursor-pointer "
                title="Copy formatted schedule for client email or Viber"
              >
                {isCopiedToast ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Schedule Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy PDC Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Underwriting Bank & Check Config Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Drawn Bank (Issuing Financial Institution)
              </label>
              <select
                value={issuingBank}
                onChange={e => setIssuingBank(e.target.value)}
                className="w-full h-10 bg-white border border-slate-300 rounded-lg px-3 text-xs text-slate-900 focus:border-blue-600 outline-none font-medium cursor-pointer"
              >
                <option value="BDO Unibank">BDO Unibank (Banco de Oro)</option>
                <option value="Bank of the Philippine Islands (BPI)">Bank of the Philippine Islands (BPI)</option>
                <option value="Metrobank">Metrobank (Metropolitan Bank &amp; Trust)</option>
                <option value="Security Bank">Security Bank Corporation</option>
                <option value="RCBC">RCBC (Rizal Commercial Banking Corp)</option>
                <option value="China Bank">China Banking Corporation</option>
                <option value="UnionBank">UnionBank of the Philippines</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Starting Check Serial #
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={startingCheckNo}
                  onChange={e => setStartingCheckNo(e.target.value)}
                  className="w-full h-10 bg-white border border-slate-300 rounded-lg px-3 text-xs font-mono text-blue-700 font-bold focus:border-blue-600 outline-none"
                  placeholder="e.g. 0094182"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                BIR Form 2307 Withholding Tax (CWT)
              </label>
              <div className="flex items-center h-10 px-3 bg-white border border-slate-300 rounded-lg justify-between">
                <span className="text-xs text-slate-700 font-medium">1% Withholding on Goods</span>
                <input
                  type="checkbox"
                  checked={applyCwt}
                  onChange={e => setApplyCwt(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* PDC Breakdown Cards / Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Tranche &amp; Aging</th>
                  <th className="py-3 px-4">Check Serial #</th>
                  <th className="py-3 px-4">Maturity Clearing Date</th>
                  <th className="py-3 px-4 text-right">Gross Amount</th>
                  {applyCwt && <th className="py-3 px-4 text-right">1% BIR 2307 CWT</th>}
                  <th className="py-3 px-4 text-right">Net Check Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {pdcSchedule.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.label}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.days === 0 ? 'Immediate Deposit' : `${item.days} Calendar Days from Invoice`}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                        {item.checkNo}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">{item.bank}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.dueDateFormatted}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        Guaranteed Banking Day
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                      {formatPHP(item.grossShare)}
                    </td>
                    {applyCwt && (
                      <td className="py-3 px-4 text-right font-mono text-amber-700">
                        -{formatPHP(item.cwtShare)}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 text-sm">
                      {formatPHP(item.netCheckAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 border border-amber-200 text-amber-800">
                        Pending Physical Vaulting
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Underwriting Notice & Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-start space-x-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Physical checks must be crossed <strong>&quot;Account Payee Only&quot;</strong> and issued to{' '}
                <strong>SUPERBDEAL CORP</strong> upon delivery. All checks will be registered into the accounting vault and auto-cleared on maturity.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Total Face Value of Checks
              </span>
              <span className="font-mono text-base font-bold text-slate-900">
                {formatPHP(pdcSchedule.reduce((sum, s) => sum + s.netCheckAmount, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FORMAL PRINTABLE QUOTATION SHEET */}
      <div 
        id="printable-quote"
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-lg text-slate-900 relative overflow-hidden"
      >
        {/* Top Letterhead Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-8 border-b border-slate-200 gap-6">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                SUPERBDEAL
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                CORP
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              Automotive Tire Importer, Distributor &amp; Commercial Fleet Center
            </p>
            <div className="text-xs text-slate-500 space-y-0.5 mt-3">
              <p>📍 Central Facility &amp; Fitting Bays: #148 G. Araneta Ave, Brgy. Tatalon, Quezon City, Metro Manila</p>
              <p>📞 Fleet Dispatch: (02) 8371-9920 / 0917-882-9901 &bull; Email: fleet@superbdeal.ph</p>
              <p className="font-mono text-slate-500 text-[11px]">BIR VAT Reg. TIN: 008-123-456-000 &bull; SEC Registration: CS2018-99042</p>
            </div>
          </div>

          <div className="sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 block">
              OFFICIAL B2B FLEET QUOTATION
            </span>
            <div className="text-xl font-mono font-bold text-slate-900 mt-0.5">{quoteNumber}</div>
            <div className="text-xs text-slate-600 mt-2 space-y-0.5">
              <div>Date Issued: <span className="font-mono font-semibold text-slate-800">{issueDate}</span></div>
              <div>Validity: <span className="font-mono font-semibold text-blue-700">{expiryDate}</span> (7 Days)</div>
            </div>
          </div>
        </div>

        {/* Client Account Info Bar */}
        <div className="py-6 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Quotation Prepared For:
            </span>
            <div className="text-sm font-bold text-slate-900">{companyName || 'Corporate Fleet Account'}</div>
            <div className="text-slate-600 mt-0.5">Attention: <strong className="text-blue-700">{attention || 'Procurement Head'}</strong></div>
            <div className="text-slate-500 mt-0.5">Address: {address || 'Quezon City, Metro Manila'}</div>
            <div className="font-mono text-slate-500 mt-0.5 text-[11px]">TIN: {tinNumber} | Tel: {phone}</div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Commercial Fleet Logistics Terms:
            </span>
            <div className="text-slate-700">Approved Payment: <strong className="text-blue-700">{paymentTerms}</strong></div>
            <div className="text-slate-600 mt-0.5">Delivery Fulfillment: <strong>Quezon City Hub Pickup OR Free Metro Manila Dispatch (20+ units)</strong></div>
            <div className="text-slate-600 mt-0.5">Shop Services: <strong>Free 3D Laser Alignment &amp; Tire Mounting Included at QC Bay</strong></div>
          </div>
        </div>

        {/* Itemized Financial Breakdown Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px] bg-slate-50">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Tire Description &amp; Technical Spec</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Volume Tier</th>
                <th className="py-3 px-3 text-right">Net of VAT</th>
                <th className="py-3 px-3 text-right">Total (PHP)</th>
                <th className="py-3 px-3 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quoteItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                    No tire specifications in quotation. Use the form above or catalog to add line items.
                  </td>
                </tr>
              ) : (
                quoteItems.map((item, index) => {
                  const lineGross = item.product.price * item.quantity;
                  const lineNetDiscounted = lineGross * (1 - discountTier.percentage);
                  const { netOfVat: lineNetVat } = calculateVatBreakdown(lineNetDiscounted);

                  return (
                    <tr key={item.product.id} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-3 font-mono text-blue-700 font-semibold">{item.product.id}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-900">{item.product.brand} {item.product.model}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{item.product.specCode} &bull; {item.product.loadCapacity} &bull; {item.product.terrain}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="text-slate-500 hover:text-slate-900 font-bold px-1 no-print cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-slate-900 px-1.5">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="text-slate-500 hover:text-slate-900 font-bold px-1 no-print cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">{formatPHP(item.product.price)}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-blue-700 font-medium">
                        {discountTier.percentage > 0 ? `-${(discountTier.percentage * 100).toFixed(0)}%` : '0%'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-500">{formatPHP(lineNetVat)}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatPHP(lineNetDiscounted)}
                      </td>
                      <td className="py-3.5 px-3 text-center no-print">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Printable Official PDC Maturity Schedule & Undertaking */}
        {pdcSchedule.length > 0 && (
          <div className="my-6 border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-blue-700" />
                Post-Dated Check (PDC) Issuance &amp; Maturity Schedule ({paymentTerms})
              </span>
              <span className="text-[11px] font-mono text-slate-600">
                Drawn Against: <strong>{issuingBank}</strong>
              </span>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-600">
                  <th className="py-2 px-3">Tranche / Aging</th>
                  <th className="py-2 px-3">Check Serial #</th>
                  <th className="py-2 px-3">Clearing Due Date</th>
                  <th className="py-2 px-3 text-right">Gross Amount</th>
                  {applyCwt && <th className="py-2 px-3 text-right">1% BIR 2307 CWT</th>}
                  <th className="py-2 px-3 text-right">Net Check Face Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pdcSchedule.map((s, idx) => (
                  <tr key={idx} className="text-slate-800">
                    <td className="py-2.5 px-3 font-medium">
                      {s.label} ({s.days} Days)
                    </td>
                    <td className="py-2.5 px-3 font-mono text-blue-700">{s.checkNo}</td>
                    <td className="py-2.5 px-3 font-medium">{s.dueDateFormatted}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatPHP(s.grossShare)}</td>
                    {applyCwt && (
                      <td className="py-2.5 px-3 text-right font-mono text-amber-700">
                        -{formatPHP(s.cwtShare)}
                      </td>
                    )}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatPHP(s.netCheckAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-[10px] text-slate-500 italic">
              * By signing below, the corporate client undertakes that all issued post-dated checks are funded, cross-checked &quot;Account Payee Only&quot;, and will clear on stated banking dates without stop-payment orders.
            </div>
          </div>
        )}

        {/* Totals & VAT Breakdown Box */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between gap-6">
          {/* Notes & Guarantees */}
          <div className="space-y-2 max-w-md text-xs text-slate-500">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Corporate Terms &amp; Conditions:
            </h5>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Prices quoted are inclusive of 12% Value Added Tax (VAT) and official BIR Sales Invoice.</li>
              <li>Free tire mounting, wheel dynamic balancing, and laser 3D alignment at QC Hub.</li>
              <li>Official manufacturer warranty covering manufacturing defects up to 5 years.</li>
              <li>Quotation is valid for 7 calendar days from issuance and subject to stock availability.</li>
            </ul>
          </div>

          {/* Mathematical Financial Totals */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 sm:w-80 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Retail Subtotal:</span>
              <span className="font-mono text-slate-800">{formatPHP(grossTotal)}</span>
            </div>

            {totalDiscountAmount > 0 && (
              <div className="flex justify-between text-blue-700">
                <span>Fleet Tier Discount ({(discountTier.percentage * 100).toFixed(0)}%):</span>
                <span className="font-mono font-bold">-{formatPHP(totalDiscountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
              <span>Net of 12% VAT:</span>
              <span className="font-mono text-slate-800">{formatPHP(netOfVat)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>12% Value Added Tax (VAT):</span>
              <span className="font-mono text-slate-800">{formatPHP(vatAmount)}</span>
            </div>

            <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
              <span>Total Payable Amount:</span>
              <span className="font-mono text-blue-700 text-lg font-bold">{formatPHP(netDiscountedTotal)}</span>
            </div>
          </div>
        </div>

        {/* Official Sign-off Signature Section */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-12 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-8">
              PREPARED BY (SUPERBDEAL CORP):
            </span>
            <div className="border-b border-slate-300 pb-1">
              <span className="font-bold text-slate-900 text-sm">ENGR. KENNETH TAN</span>
            </div>
            <div className="text-slate-500 mt-1">Corporate Fleet Director &bull; Superbdeal Corp</div>
            <div className="text-[10px] text-slate-400 font-mono">Verified Digital Authorization Token: SEC-QC-2026-991A</div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-8">
              CONFORME &amp; APPROVED BY (CLIENT):
            </span>
            <div className="border-b border-slate-300 pb-1">
              <span className="text-slate-400 italic">Signature Over Printed Authorized Name</span>
            </div>
            <div className="text-slate-500 mt-1">{companyName || 'Client Fleet Representative'}</div>
            <div className="text-[10px] text-slate-400">Date: ________________________</div>
          </div>
        </div>

      </div>

      {/* Modal: Dispatch Quote to Email */}
      {isEmailSentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
              <Mail className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-bold text-center text-slate-900">
              Transmit Formal Quotation PDF
            </h4>
            <p className="text-xs text-slate-500 text-center">
              Send an authenticated PDF copy of quote <strong>{quoteNumber}</strong> directly to the company representative.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Recipient Email</label>
                <input
                  type="email"
                  defaultValue={email}
                  className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-4 text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Carbon Copy (CC)</label>
                <input
                  type="email"
                  defaultValue="fleet@superbdeal.ph"
                  className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-4 text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEmailSentModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEmailSentModal(false);
                  setIsCopiedToast(true);
                  setTimeout(() => setIsCopiedToast(false), 3000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer "
              >
                Send Formal PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
