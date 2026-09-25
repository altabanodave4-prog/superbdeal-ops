import React, { useState } from 'react';
import { TireProduct, ShopBooking, TIME_SLOTS, CUSTOMER_VEHICLE_DIRECTORY } from '../data';
import { formatPHP, getAvailableStock, normalizePlate } from '../utils';
import { X, Wrench, CheckCircle2, Calendar, Clock, Car, User, Phone, Check, QrCode, ArrowRight, ShieldCheck, Download } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTire: TireProduct | null;
  onConfirmBooking: (booking: ShopBooking, tiresOrdered?: { product: TireProduct; quantity: number }) => void;
  existingBookings: ShopBooking[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedTire,
  onConfirmBooking,
  existingBookings,
}) => {
  const [quantity, setQuantity] = useState<number>(4);
  const availableForBooking = selectedTire ? getAvailableStock(selectedTire) : 0;


  const applyPlateLookup = (raw: string) => {
    setPlateNumber(raw);
    const hit = CUSTOMER_VEHICLE_DIRECTORY.find(
      (e) => normalizePlate(e.plateNumber) === normalizePlate(raw)
    );
    if (!hit) return;
    setCustomerName(hit.customerName);
    setPhone(hit.phone);
    if (hit.email) setEmail(hit.email);
    setVehicleModel(hit.vehicleModel);
  };

  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Computerized 3D Wheel Alignment',
    'Wheel Balancing & Weights',
    'Tire Mounting & Valve Replacement',
    '10-Point Auto Safety Checkup'
  ]);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedBay, setSelectedBay] = useState<1 | 2>(1);
  const [selectedTime, setSelectedTime] = useState<string>('09:00 AM');
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<ShopBooking | null>(null);

  if (!isOpen) return null;

  const isFreeServicesApplied = selectedTire ? quantity >= 4 : false;

  const servicesList = [
    {
      name: 'Computerized 3D Wheel Alignment',
      price: 800,
      desc: 'Precision laser calibration targeting factory camber, toe & caster specs.'
    },
    {
      name: 'Wheel Balancing & Weights',
      price: 500,
      desc: 'Dynamic high-speed electronic spin balancing with zinc clip weights.'
    },
    {
      name: 'Tire Mounting & Valve Replacement',
      price: 300,
      desc: 'Scratch-free pneumatic tire mounting and high-pressure brass valves.'
    },
    {
      name: '10-Point Auto Safety Checkup',
      price: 0,
      desc: 'Complimentary inspection of brake pads, suspension bushings, and fluid lines.'
    }
  ];

  const toggleService = (name: string) => {
    if (selectedServices.includes(name)) {
      setSelectedServices(selectedServices.filter(s => s !== name));
    } else {
      setSelectedServices([...selectedServices, name]);
    }
  };

  // Calculations
  const tiresSubtotal = selectedTire ? selectedTire.price * quantity : 0;
  const servicesSubtotal = selectedServices.reduce((acc, curr) => {
    const s = servicesList.find(item => item.name === curr);
    return acc + (s ? s.price : 0);
  }, 0);
  const discountAmount = isFreeServicesApplied ? servicesSubtotal : 0;
  const totalCost = tiresSubtotal + servicesSubtotal - discountAmount;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !plateNumber.trim() || !vehicleModel.trim()) {
      window.alert('Please fill in customer name, phone, plate, and vehicle model.');
      return;
    }
    if (selectedTire && availableForBooking < 1) {
      window.alert('This tire has no available stock. Choose another size or clear the tire selection for service-only.');
      return;
    }
    if (selectedTire && quantity > availableForBooking) {
      window.alert(`Only ${availableForBooking} available. Reduce quantity.`);
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newBooking: ShopBooking = {
      id: `SB-2026-${randomSuffix}`,
      bay: selectedBay,
      timeSlot: selectedTime,
      customerName,
      plateNumber: normalizePlate(plateNumber),
      vehicleModel,
      phone,
      email: email || 'walkin@customer.ph',
      date: appointmentDate,
      services: selectedServices,
      totalCost,
      status: 'Waiting for Arrival',
      paymentStatus: totalCost === 0 ? 'Paid' : 'Unpaid',
      notes: selectedTire ? `Tire Installation: ${quantity}x ${selectedTire.brand} ${selectedTire.model}` : 'Service Bay Reservation',
      productId: selectedTire?.id,
      tireQuantity: selectedTire ? Math.min(quantity, Math.max(1, availableForBooking)) : undefined,
    };

    onConfirmBooking(newBooking, selectedTire ? { product: selectedTire, quantity: Math.min(quantity, Math.max(1, availableForBooking)) } : undefined);
    setCompletedBooking(newBooking);
    setIsSuccess(true);
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                {isSuccess ? 'Installation Confirmed' : 'Quezon City Shop Fitting & Service Reservation'}
              </h3>
              <p className="text-xs text-slate-500">
                Official Superbdeal Corp Service Center &bull; Fast-Track Express Bay Booking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isSuccess && completedBooking ? (
            /* Success Ticket View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-2xl font-bold text-slate-900">
                  Bay Slot Successfully Reserved!
                </h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Your appointment has been queued in the Quezon City central shop calendar. Please arrive 10 minutes before your scheduled slot.
                </p>
              </div>

              {/* Service Ticket Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left max-w-lg mx-auto shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Appointment Pass</span>
                    <h5 className="text-lg font-mono font-bold text-slate-900">{completedBooking.id}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Bay Assignment</span>
                    <div className="text-sm font-bold text-blue-700">
                      Bay {completedBooking.bay} ({completedBooking.bay === 1 ? 'Alignment' : 'Tire Fitting'})
                    </div>
                  </div>
                </div>

                <div className="py-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Customer Name:</span>
                    <span className="font-semibold text-slate-900 text-sm">{completedBooking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Plate / CS Number:</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">{completedBooking.plateNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Vehicle Model:</span>
                    <span className="font-medium text-slate-800">{completedBooking.vehicleModel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Scheduled Time:</span>
                    <span className="font-semibold text-slate-900">{completedBooking.date} @ {completedBooking.timeSlot}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500 block mb-1.5">Scheduled Services:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {completedBooking.services.map(s => (
                      <span key={s} className="px-2.5 py-0.5 rounded-lg text-[10px] bg-white border border-slate-200 text-slate-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Payable at Shop</span>
                    <div className="font-mono text-xl font-bold text-blue-700">
                      {formatPHP(completedBooking.totalCost)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <QrCode className="w-8 h-8 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrintTicket}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Download / Print Ticket</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              
              {/* Pre-selected Tire Highlight (if any) */}
              {selectedTire && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      Selected Tire For Installation
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{selectedTire.brand} {selectedTire.model}</h4>
                    <span className="font-mono text-xs font-semibold text-blue-700">{selectedTire.specCode}</span>
                    <div className="text-xs text-slate-500 mt-1">
                      Unit Retail Price: <strong className="text-slate-900 font-mono">{formatPHP(selectedTire.price)}</strong>
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-blue-700 text-sm px-2">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(getAvailableStock(selectedTire) || 1, quantity + 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Free Promotion Banner if 4 tires */}
              {isFreeServicesApplied && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>
                      <strong className="text-slate-900">4-Tire Promotion Active!</strong> All alignment, mounting &amp; balancing fees are 100% complimentary.
                    </span>
                  </div>
                  <span className="font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs">
                    -₱1,600 SAVED
                  </span>
                </div>
              )}

              {/* Step 1: Service Selection Cards */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
                  Step 1: Select Required Shop Services
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {servicesList.map(s => {
                    const isSelected = selectedServices.includes(s.name);
                    const effectivePrice = isFreeServicesApplied && s.price > 0 ? 0 : s.price;

                    return (
                      <div
                        key={s.name}
                        onClick={() => toggleService(s.name)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-500 text-slate-900 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white font-bold' : 'border border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900">{s.name}</span>
                            <span className="font-mono text-xs font-bold text-blue-700">
                              {effectivePrice === 0 ? (
                                <span className="text-blue-700">FREE</span>
                              ) : (
                                formatPHP(effectivePrice)
                              )}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{s.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Vehicle & Customer Identification */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
                  Step 2: Vehicle &amp; Customer Identification
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. Roberto Gomez"
                      className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0917-XXX-XXXX"
                      className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Vehicle Plate / CS Number *</label>
                    <input
                      type="text"
                      required
                      value={plateNumber}
                      onChange={e => applyPlateLookup(e.target.value)}
                      placeholder="e.g. NDI 4821 or Conduction Sticker"
                      className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm font-mono uppercase text-blue-700 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Vehicle Make, Model &amp; Year *</label>
                    <input
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      placeholder="e.g. 2024 Toyota Fortuner V"
                      className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Date & Bay Time Slot Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
                  Step 3: Appointment Date &amp; Service Bay Selection
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Service Date</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setAppointmentDate(e.target.value)}
                      className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Preferred Service Bay</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBay(1)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                          selectedBay === 1
                            ? 'bg-blue-50/70 border-blue-600 text-blue-700 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div>Bay 1: 3D Alignment &amp; Suspension</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">Hunter Hawkeye Elite</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedBay(2)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                          selectedBay === 2
                            ? 'bg-blue-50/70 border-blue-600 text-blue-700 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div>Bay 2: Tire Fitting &amp; High-Speed Spin</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">Corghi Leverless Master</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slot Selection */}
                <div>
                  <span className="text-xs text-slate-500 block mb-2 font-medium">Available 90-Minute Service Slots for Bay {selectedBay}:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {TIME_SLOTS.map(slot => {
                      const isBooked = existingBookings.some(
                        b => b.bay === selectedBay && b.timeSlot === slot && b.status !== 'Completed'
                      );
                      const isSelected = selectedTime === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedTime(slot)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isBooked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-600 text-white font-semibold border-blue-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div className="text-xs font-mono font-bold">{slot}</div>
                          <div className="text-[10px] mt-0.5">
                            {isBooked ? '🔴 Booked' : '🟢 Available'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 4: Cost Summary & Submit */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="text-slate-500">
                    Tires ({selectedTire ? `${quantity}x ${formatPHP(selectedTire.price)}` : 'No Tires Selected'}):{' '}
                    <span className="font-mono text-slate-800">{formatPHP(tiresSubtotal)}</span>
                  </div>
                  <div className="text-slate-500">
                    Services: <span className="font-mono text-slate-800">{formatPHP(servicesSubtotal)}</span>
                    {discountAmount > 0 && (
                      <span className="text-blue-700 font-mono ml-2">(-{formatPHP(discountAmount)} Promo)</span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-slate-900 pt-1">
                    Estimated Total:{' '}
                    <span className="font-mono text-blue-700 text-lg font-bold">{formatPHP(totalCost)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition-all shadow-xs cursor-pointer"
                >
                  <span>Confirm &amp; Reserve Bay Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
