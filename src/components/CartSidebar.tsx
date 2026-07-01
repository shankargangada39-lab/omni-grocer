import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2, Calendar, Clock, MapPin, ClipboardList, User } from 'lucide-react';
import { CartItem, CurrencyCode, CURRENCY_MAP, DeliveryDetails } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  currency: CurrencyCode;
  onProceedToCheckout: (delivery: DeliveryDetails) => void;
  userProfile: { name: string; phone: string; address: string };
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  currency,
  onProceedToCheckout,
  userProfile,
}: CartSidebarProps) {
  const { symbol, rate } = CURRENCY_MAP[currency];

  // Delivery Scheduler State
  const [recipientName, setRecipientName] = useState(userProfile.name || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [address, setAddress] = useState(userProfile.address || '');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  // Calculate prices based on converted currency
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const convertedSubtotal = subtotal * rate;
  const deliveryFee = subtotal > 50 ? 0 : 4.99; // Free delivery over $50
  const convertedDeliveryFee = deliveryFee * rate;
  const convertedTotal = convertedSubtotal + convertedDeliveryFee;

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ];

  const handleCheckoutClick = () => {
    if (!recipientName.trim()) return setFormError('Recipient name is required.');
    if (!phone.trim()) return setFormError('Phone number is required.');
    if (!address.trim()) return setFormError('Delivery address is required.');
    if (!deliveryDate) return setFormError('Delivery date is required.');

    setFormError('');
    onProceedToCheckout({
      name: recipientName,
      phone,
      address,
      date: deliveryDate,
      timeSlot,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Cart Container */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <h2 className="font-display text-lg font-bold text-slate-900">Your Shopping Cart</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-800">Your cart is empty</h3>
            <p className="mt-1 text-sm text-slate-500">Add fresh organic products from our selection to get started.</p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.01] active:scale-95 transition-all"
            >
              Browse Products
            </button>
          </div>
        ) : (
          /* Scrollable Items & Delivery Details */
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6">
            {/* Products List */}
            <div className="space-y-4">
              <h4 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Items</h4>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex p-3 gap-3 bg-white">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-14 w-14 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">{item.product.name}</p>
                        <p className="text-xs text-slate-400 font-semibold">{item.product.unit}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        {/* Quantity controls */}
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded-md text-slate-600 hover:bg-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.inventory}
                            className={`p-1 rounded-md text-slate-600 transition-colors ${
                              item.quantity >= item.product.inventory ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'
                            }`}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Cost */}
                        <span className="text-sm font-bold text-slate-800 font-mono">
                          {symbol}
                          {(item.product.price * item.quantity * rate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1 text-slate-400 hover:text-red-600 self-start"
                      title="Remove product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Scheduler Form */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h4 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule Local Delivery</h4>
              <div className="grid grid-cols-1 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {/* Name */}
                <div className="text-left">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
                    placeholder="Who is receiving?"
                  />
                </div>

                {/* Contact Phone */}
                <div className="text-left">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Recipient Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Delivery Address */}
                <div className="text-left">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
                    placeholder="Full street address, apt, suite"
                  />
                </div>

                {/* Date & Time Slot Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-left">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="text-left">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Delivery Window
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery Notes */}
                <div className="text-left">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
                    <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden resize-none"
                    placeholder="Gate codes, ring doorbell, etc."
                  />
                </div>
              </div>

              {formError && (
                <div className="rounded-lg bg-red-50 p-2 text-xs font-bold text-red-600 text-left border border-red-100 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Area */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 space-y-4">
            <div className="space-y-1.5 text-sm font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-slate-800">
                  {symbol}
                  {convertedSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Local Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase tracking-wider text-xs">Free Delivery</span>
                ) : (
                  <span className="font-mono text-slate-800">
                    {symbol}
                    {convertedDeliveryFee.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
                <span>Total Amount ({currency})</span>
                <span className="font-mono">
                  {symbol}
                  {convertedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Secure Checkout ({symbol}
              {convertedTotal.toFixed(2)})
            </button>
            <p className="text-[10px] font-medium text-slate-400 text-center leading-none">
              🔒 Bank-grade 256-bit secure checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple Helper for quick inline alerts in forms
function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
