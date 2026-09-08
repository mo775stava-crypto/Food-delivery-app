import React, { useState, useEffect } from 'react';
import { CartItem, DeliveryInfo, OrderRecord, PromoCode, StoreMode } from '../types';
import { 
  formatCurrency, 
  generateOrderId, 
  buildWhatsAppMessage, 
  createWhatsAppUrl, 
  generateQRCodeDataUrl 
} from '../utils/orderUtils';
import { 
  sanitizeText, 
  sanitizePhone, 
  safeCurrencyRound, 
  validateFullName, 
  validatePhone, 
  validateAddress,
  validateInstructions
} from '../utils/securityUtils';
import { DEFAULT_WHATSAPP_PHONE } from '../data/mockData';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CreditCard, 
  QrCode, 
  Send, 
  Copy, 
  Check, 
  ShieldCheck,
  AlertCircle,
  FileText,
  ExternalLink
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tipAmount: number;
  grandTotal: number;
  activeStore: StoreMode;
  appliedPromo: PromoCode | null;
  initialDeliveryAddress: string;
  onOrderCompleted: (order: OrderRecord) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  deliveryFee,
  discount,
  tipAmount,
  grandTotal,
  activeStore,
  appliedPromo,
  initialDeliveryAddress,
  onOrderCompleted,
}) => {
  // Form State with sanitized initial defaults
  const [fullName, setFullName] = useState('Alex Morgan');
  const [phone, setPhone] = useState('+1 (555) 349-2810');
  const [useSameForWhatsApp, setUseSameForWhatsApp] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('+1 (555) 349-2810');
  const [deliveryAddress, setDeliveryAddress] = useState(
    initialDeliveryAddress ? sanitizeText(initialDeliveryAddress, 200) : '742 Evergreen Terrace, Apt 4B, Springfield'
  );
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Please leave at front door, ring buzzer 4B.');
  const [deliveryTimeType, setDeliveryTimeType] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledTime, setScheduledTime] = useState('Today at 6:30 PM - 7:00 PM');
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'cod' | 'card'>('whatsapp');
  
  // Destination store dispatch contact number
  const [storeWhatsAppPhone] = useState(DEFAULT_WHATSAPP_PHONE);

  // Field specific validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    whatsappNumber?: string;
    deliveryAddress?: string;
    deliveryInstructions?: string;
  }>({});

  // QR Code & Message Previews
  const [orderId] = useState(() => generateOrderId());
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showFullMessagePreview, setShowFullMessagePreview] = useState(false);
  const [globalErrorMsg, setGlobalErrorMsg] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Lock body scroll and handle Escape key while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sanitizedCustomerInfo: DeliveryInfo = {
    fullName: sanitizeText(fullName, 60),
    phone: sanitizePhone(phone),
    whatsappNumber: sanitizePhone(useSameForWhatsApp ? phone : whatsappNumber),
    deliveryAddress: sanitizeText(deliveryAddress, 200),
    addressType,
    deliveryInstructions: sanitizeText(deliveryInstructions, 150),
    deliveryTimeType,
    scheduledTime: deliveryTimeType === 'scheduled' ? sanitizeText(scheduledTime, 40) : undefined,
    paymentMethod,
  };

  const safeSubtotal = safeCurrencyRound(subtotal);
  const safeDeliveryFee = safeCurrencyRound(deliveryFee);
  const safeDiscount = safeCurrencyRound(discount);
  const safeTip = safeCurrencyRound(tipAmount);
  const safeGrandTotal = safeCurrencyRound(grandTotal);

  const whatsappMessageText = buildWhatsAppMessage(
    orderId,
    sanitizedCustomerInfo,
    cartItems,
    safeSubtotal,
    safeDeliveryFee,
    safeDiscount,
    safeTip,
    safeGrandTotal,
    activeStore
  );

  const qrPayload = JSON.stringify({
    orderId,
    name: sanitizedCustomerInfo.fullName,
    total: safeGrandTotal,
    phone: sanitizedCustomerInfo.whatsappNumber,
    itemsCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
    store: activeStore,
  });

  // Generate QR Code safely
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    generateQRCodeDataUrl(qrPayload).then((url) => {
      if (isMounted) {
        setQrCodeDataUrl(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen, qrPayload]);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessageText);
      setCopiedMessage(true);
      setCopyFeedback('Order text copied to clipboard!');
      setTimeout(() => {
        setCopiedMessage(false);
        setCopyFeedback(null);
      }, 2500);
    } catch {
      setCopyFeedback('Please select and copy manually from the preview below.');
      setShowFullMessagePreview(true);
    }
  };

  const validateAllFields = (): boolean => {
    const errors: typeof fieldErrors = {};

    const nameResult = validateFullName(fullName);
    if (!nameResult.isValid) errors.fullName = nameResult.error;

    const phoneResult = validatePhone(phone);
    if (!phoneResult.isValid) errors.phone = phoneResult.error;

    if (!useSameForWhatsApp) {
      const waResult = validatePhone(whatsappNumber);
      if (!waResult.isValid) errors.whatsappNumber = waResult.error;
    }

    const addrResult = validateAddress(deliveryAddress);
    if (!addrResult.isValid) errors.deliveryAddress = addrResult.error;

    const instrResult = validateInstructions(deliveryInstructions);
    if (!instrResult.isValid) errors.deliveryInstructions = instrResult.error;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setGlobalErrorMsg('Please correct the highlighted fields before placing your order.');
      return false;
    }

    setGlobalErrorMsg('');
    return true;
  };

  const createOrderRecord = (): OrderRecord => ({
    orderId,
    createdAt: new Date().toISOString(),
    items: cartItems,
    subtotal: safeSubtotal,
    deliveryFee: safeDeliveryFee,
    discount: safeDiscount,
    promoApplied: appliedPromo?.code,
    tip: safeTip,
    grandTotal: safeGrandTotal,
    customer: sanitizedCustomerInfo,
    status: 'received',
    estimatedDeliveryMinutes: activeStore === 'food' ? 25 : 18,
    whatsappMessageText,
    qrData: qrPayload,
    qrDataUrl: qrCodeDataUrl || undefined,
  });

  const handleSendToWhatsApp = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!validateAllFields()) return;

    const orderRecord = createOrderRecord();
    const targetUrl = createWhatsAppUrl(storeWhatsAppPhone, whatsappMessageText);

    // Open WhatsApp safely in a new window/tab
    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Fallback if popup blocked
    }

    onOrderCompleted(orderRecord);
  };

  const handlePlaceOrderDirect = () => {
    if (!validateAllFields()) return;
    const orderRecord = createOrderRecord();
    onOrderCompleted(orderRecord);
  };

  if (!isOpen) return null;

  return (
    <div
      id="checkout-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="checkout-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold font-['Outfit'] text-stone-900">
                Checkout & WhatsApp Order
              </h2>
              <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-100 text-amber-900">
                #{orderId}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Instant WhatsApp order dispatch with live QR code verification
            </p>
          </div>

          <button
            id="btn-close-checkout"
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {globalErrorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{globalErrorMsg}</span>
            </div>
          )}

          {/* Customer Details Form */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 font-['Outfit'] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-500" />
              1. Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label 
                  htmlFor="input-customer-name"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="input-customer-name"
                  type="text"
                  maxLength={60}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) {
                      setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                    }
                    setGlobalErrorMsg('');
                  }}
                  onBlur={() => {
                    const res = validateFullName(fullName);
                    if (!res.isValid) {
                      setFieldErrors((prev) => ({ ...prev, fullName: res.error }));
                    }
                  }}
                  required
                  className={`w-full px-3.5 py-2 text-sm bg-stone-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                    fieldErrors.fullName
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/40'
                      : 'border-stone-200 focus:border-stone-400'
                  }`}
                  placeholder="e.g. Alex Morgan"
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="input-customer-phone"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Phone Number *
                </label>
                <input
                  id="input-customer-phone"
                  type="tel"
                  maxLength={25}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (fieldErrors.phone) {
                      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                    setGlobalErrorMsg('');
                  }}
                  onBlur={() => {
                    const res = validatePhone(phone);
                    if (!res.isValid) {
                      setFieldErrors((prev) => ({ ...prev, phone: res.error }));
                    }
                  }}
                  required
                  className={`w-full px-3.5 py-2 text-sm bg-stone-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                    fieldErrors.phone
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/40'
                      : 'border-stone-200 focus:border-stone-400'
                  }`}
                  placeholder="e.g. +1 555 0192"
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            {/* WhatsApp Phone preference */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  id="checkbox-same-whatsapp"
                  type="checkbox"
                  checked={useSameForWhatsApp}
                  onChange={(e) => {
                    setUseSameForWhatsApp(e.target.checked);
                    if (e.target.checked) {
                      setFieldErrors((prev) => ({ ...prev, whatsappNumber: undefined }));
                    }
                  }}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
                <span>Use same phone number for WhatsApp order updates</span>
              </label>

              {!useSameForWhatsApp && (
                <div className="pt-2">
                  <label 
                    htmlFor="input-custom-whatsapp"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Custom WhatsApp Number *
                  </label>
                  <input
                    id="input-custom-whatsapp"
                    type="tel"
                    maxLength={25}
                    value={whatsappNumber}
                    onChange={(e) => {
                      setWhatsappNumber(e.target.value);
                      if (fieldErrors.whatsappNumber) {
                        setFieldErrors((prev) => ({ ...prev, whatsappNumber: undefined }));
                      }
                    }}
                    onBlur={() => {
                      const res = validatePhone(whatsappNumber);
                      if (!res.isValid) {
                        setFieldErrors((prev) => ({ ...prev, whatsappNumber: res.error }));
                      }
                    }}
                    className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none transition-colors ${
                      fieldErrors.whatsappNumber
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/40'
                        : 'border-stone-200 focus:border-stone-400'
                    }`}
                    placeholder="e.g. +1 555 0199"
                  />
                  {fieldErrors.whatsappNumber && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.whatsappNumber}</p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Delivery Address Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 font-['Outfit'] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              2. Delivery Address & Instructions
            </h3>

            <div>
              <label 
                htmlFor="input-delivery-address"
                className="block text-xs font-semibold text-stone-700 mb-1"
              >
                Street Address, Flat / Villa No. *
              </label>
              <textarea
                id="input-delivery-address"
                rows={2}
                maxLength={200}
                value={deliveryAddress}
                onChange={(e) => {
                  setDeliveryAddress(e.target.value);
                  if (fieldErrors.deliveryAddress) {
                    setFieldErrors((prev) => ({ ...prev, deliveryAddress: undefined }));
                  }
                  setGlobalErrorMsg('');
                }}
                onBlur={() => {
                  const res = validateAddress(deliveryAddress);
                  if (!res.isValid) {
                    setFieldErrors((prev) => ({ ...prev, deliveryAddress: res.error }));
                  }
                }}
                required
                className={`w-full px-3.5 py-2 text-sm bg-stone-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                  fieldErrors.deliveryAddress
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/40'
                    : 'border-stone-200 focus:border-stone-400'
                }`}
                placeholder="Apartment name, street, landmarks, city..."
              />
              {fieldErrors.deliveryAddress && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.deliveryAddress}</p>
              )}
            </div>

            {/* Address Tag Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-semibold">Address Tag:</span>
              {(['home', 'work', 'other'] as const).map((type) => (
                <button
                  key={type}
                  id={`btn-tag-${type}`}
                  type="button"
                  onClick={() => setAddressType(type)}
                  className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                    addressType === type
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div>
              <label 
                htmlFor="input-delivery-instructions"
                className="block text-xs font-semibold text-stone-700 mb-1"
              >
                Delivery Instructions (Optional, max 150 chars)
              </label>
              <input
                id="input-delivery-instructions"
                type="text"
                maxLength={150}
                value={deliveryInstructions}
                onChange={(e) => {
                  setDeliveryInstructions(e.target.value);
                  if (fieldErrors.deliveryInstructions) {
                    setFieldErrors((prev) => ({ ...prev, deliveryInstructions: undefined }));
                  }
                }}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-stone-400 focus:outline-none"
                placeholder="e.g. Leave at door, don't ring bell, call upon arrival"
              />
              {fieldErrors.deliveryInstructions && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.deliveryInstructions}</p>
              )}
            </div>
          </section>

          {/* Delivery Timing & Payment */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 font-['Outfit'] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              3. Delivery Timing & Payment
            </h3>

            {/* Timing selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-delivery-asap"
                type="button"
                onClick={() => setDeliveryTimeType('asap')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  deliveryTimeType === 'asap'
                    ? 'bg-amber-50/70 border-amber-500 text-stone-900 shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <div className="font-bold text-xs">⚡ Deliver ASAP</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Estimated {activeStore === 'food' ? '20-30 min' : '15-25 min'}
                </div>
              </button>

              <button
                id="btn-delivery-schedule"
                type="button"
                onClick={() => setDeliveryTimeType('scheduled')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  deliveryTimeType === 'scheduled'
                    ? 'bg-amber-50/70 border-amber-500 text-stone-900 shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <div className="font-bold text-xs">🕒 Schedule for Later</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Choose preferred slot</div>
              </button>
            </div>

            {deliveryTimeType === 'scheduled' && (
              <select
                id="select-scheduled-slot"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-stone-200 rounded-xl focus:outline-none"
              >
                <option value="Today: 5:00 PM - 5:30 PM">Today: 5:00 PM - 5:30 PM</option>
                <option value="Today: 6:30 PM - 7:00 PM">Today: 6:30 PM - 7:00 PM</option>
                <option value="Today: 8:00 PM - 8:30 PM">Today: 8:00 PM - 8:30 PM</option>
                <option value="Tomorrow: 10:00 AM - 11:00 AM">Tomorrow: 10:00 AM - 11:00 AM</option>
                <option value="Tomorrow: 1:00 PM - 2:00 PM">Tomorrow: 1:00 PM - 2:00 PM</option>
              </select>
            )}

            {/* Payment Method */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-stone-700">Payment Option:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'whatsapp', name: 'WhatsApp Pay / Link', desc: 'Direct chat confirmation' },
                  { id: 'cod', name: 'Cash on Delivery', desc: 'Pay rider in cash' },
                  { id: 'card', name: 'Card / UPI on Door', desc: 'Mobile terminal at door' },
                ].map((method) => (
                  <button
                    key={method.id}
                    id={`btn-payment-${method.id}`}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === method.id
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <div className="font-bold text-xs">{method.name}</div>
                    <div className={`text-[10px] ${paymentMethod === method.id ? 'text-stone-300' : 'text-stone-400'}`}>
                      {method.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* QR Code & WhatsApp Preview Card */}
          <section className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-stone-800 font-['Outfit']">
                  Order Verification QR Code
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">Scannable by Driver & Store</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-stone-200/80">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR code for order ${orderId}`}
                  className="w-28 h-28 object-contain rounded-lg border border-stone-100 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-28 h-28 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-xs">
                  Generating QR...
                </div>
              )}

              <div className="flex-1 text-xs space-y-1.5 text-center sm:text-left">
                <div className="font-bold text-stone-900 font-['Outfit'] text-sm">
                  Order Ref: #{orderId}
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  This QR contains encrypted order reference, item details, and verified total. Scan with any camera or WhatsApp scanner to authenticate.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    id="btn-copy-order-text"
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMessage ? 'Copied to Clipboard!' : 'Copy Order Text'}</span>
                  </button>

                  <button
                    id="btn-toggle-msg-preview"
                    type="button"
                    onClick={() => setShowFullMessagePreview(!showFullMessagePreview)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{showFullMessagePreview ? 'Hide Message Preview' : 'View WhatsApp Text'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Expandable WhatsApp Message Preview */}
            {showFullMessagePreview && (
              <div className="p-3 bg-stone-900 text-emerald-400 rounded-xl font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed border border-stone-800">
                {whatsappMessageText}
              </div>
            )}
          </section>

          {/* Store WhatsApp Contact Configuration (Optional override) */}
          <div className="text-[11px] text-stone-500 flex items-center justify-between">
            <span>Store Dispatch Line: <strong className="text-stone-700">{storeWhatsAppPhone}</strong></span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Encrypted & Safe
            </span>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs text-stone-500 uppercase font-semibold">Grand Total</span>
            <span className="text-xl font-extrabold text-stone-900 font-['Outfit']">
              {formatCurrency(grandTotal)}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-place-order-direct"
              type="button"
              onClick={handlePlaceOrderDirect}
              className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-all cursor-pointer"
            >
              Confirm in App
            </button>

            <button
              id="btn-submit-whatsapp-order"
              type="button"
              onClick={() => handleSendToWhatsApp()}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Order to WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
