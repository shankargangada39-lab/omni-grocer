import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle, CreditCard, Loader2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { DeliveryDetails, CurrencyCode, CURRENCY_MAP } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryDetails: DeliveryDetails | null;
  totalUSD: number;
  currency: CurrencyCode;
  onPaymentSuccess: (receipt: any) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  deliveryDetails,
  totalUSD,
  currency,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const { symbol, rate } = CURRENCY_MAP[currency];
  const totalAmount = totalUSD * rate;

  // Form Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState(deliveryDetails?.name || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [formError, setFormError] = useState('');

  // Processing Animation State
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [processingMessage, setProcessingMessage] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    if (deliveryDetails) {
      setCardName(deliveryDetails.name);
    }
  }, [deliveryDetails]);

  if (!isOpen || !deliveryDetails) return null;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    const formatted = value.length >= 2 ? `${value.substring(0, 2)}/${value.substring(2)}` : value;
    setExpiry(formatted);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvv(value);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
      return setFormError('Please enter a valid 16-digit card number.');
    }
    if (!cardName.trim()) {
      return setFormError('Cardholder name is required.');
    }
    if (!expiry.trim() || expiry.length < 5) {
      return setFormError('Expiry date must be in MM/YY format.');
    }
    if (!cvv.trim() || cvv.length < 3) {
      return setFormError('Please enter a valid 3-digit CVV code.');
    }

    setFormError('');
    setPaymentStep('processing');

    // Simulated 4-Step Payment Gateway pipeline
    const steps = [
      'Establishing secure connection with payment processor...',
      'Verifying credit card authorization & funding limits...',
      'Resurfacing inventory shelves and allocating products...',
      'Assembling digital receipt invoice and sending automated email notification...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingMessage(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: JSON.parse(localStorage.getItem('fresh_cart') || '[]').map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          deliveryDetails,
          totalAmount,
          currency,
          currencySymbol: symbol,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error || 'Payment failed.');
        setPaymentStep('form');
        return;
      }

      setSuccessData(data.order);
      setPaymentStep('success');
      onPaymentSuccess(data);
    } catch (err) {
      console.error(err);
      setFormError('Payment gateway communication failed. Please try again.');
      setPaymentStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={paymentStep === 'success' ? onClose : undefined} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col">
        {/* Header - Closed on click if not in progress */}
        <div className="flex items-center justify-between border-b border-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-600" />
            <h3 className="font-display text-base font-bold text-slate-900">Secure Payment Gateway</h3>
          </div>
          {paymentStep !== 'processing' && (
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {paymentStep === 'form' && (
          /* Payment Credit Card Form */
          <form onSubmit={handlePay} className="p-6 space-y-5 text-left">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Due</span>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-extrabold text-slate-900">
                  {symbol}
                  {totalAmount.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-slate-100">
                  Transaction Currency: {currency}
                </span>
              </div>
            </div>

            {/* Simulated Card Display */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/5 blur-xl"></div>
              <div className="flex justify-between items-start">
                <div className="flex h-10 w-13 items-center justify-center rounded-md bg-white/10 border border-white/10 text-white">
                  <CreditCard className="h-6 w-6 opacity-80" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secure Payment</div>
              </div>
              <div className="my-6">
                <p className="font-mono text-lg tracking-widest text-slate-100">
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-1">Cardholder</p>
                  <p className="font-sans text-xs font-semibold text-slate-200 uppercase tracking-wide truncate max-w-[200px]">
                    {cardName || 'FULL NAME'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-1">Expiry</p>
                  <p className="font-mono text-xs font-semibold text-slate-200">
                    {expiry || 'MM/YY'}
                  </p>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              {/* Card Number */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
                    placeholder="4111 2222 3333 4444"
                  />
                  <CreditCard className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  placeholder="John Doe"
                />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Expiry Date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden text-center"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">CVV Code</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden text-center"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 p-2.5 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-1.5">
                <Lock className="h-4 w-4" />
                {formError}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              Pay {symbol}
              {totalAmount.toFixed(2)} Securely
            </button>
          </form>
        )}

        {paymentStep === 'processing' && (
          /* Processing State Screen */
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin"></div>
              <Lock className="absolute top-5 left-5 h-6 w-6 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-slate-800">Processing Payment...</h4>
              <p className="mt-1.5 text-xs text-slate-400 font-semibold uppercase tracking-widest">Do not close window</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600 border border-slate-100 max-w-sm">
              {processingMessage}
            </div>
          </div>
        )}

        {paymentStep === 'success' && successData && (
          /* Payment Success State Screen */
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md shadow-emerald-100">
              <CheckCircle className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-display text-lg font-bold text-slate-900">Payment Approved!</h4>
              <p className="text-sm text-slate-500">Your FreshMarket Co. delivery is officially scheduled.</p>
            </div>

            <div className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-left space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Receipt Number</span>
                <span className="font-mono font-bold text-slate-800">{successData.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Charge</span>
                <span className="font-mono font-bold text-slate-800">
                  {symbol}
                  {successData.totalAmount.toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Recipient</span>
                <span className="text-slate-800">{successData.deliveryDetails.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Scheduled Date</span>
                <span className="text-slate-800 font-bold">{successData.deliveryDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Window</span>
                <span className="text-slate-800 font-bold">{successData.deliveryDetails.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span>Address</span>
                <span className="text-slate-800 truncate max-w-[200px]">{successData.deliveryDetails.address}</span>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-50/50 p-3 border border-emerald-100/50 flex items-start gap-2 text-left max-w-md">
              <Mail className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Automated Email Notification Sent!</p>
                <p className="text-[10px] text-emerald-600 font-medium">
                  We have successfully transmitted your invoice and delivery receipt to your email outbox inbox.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
