import React, { useState, useEffect } from 'react';
import { OrderRecord, OrderStatus } from '../types';
import { formatCurrency, createWhatsAppUrl, generateQRCodeDataUrl } from '../utils/orderUtils';
import { DEFAULT_WHATSAPP_PHONE } from '../data/mockData';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Bike, 
  Check, 
  QrCode, 
  MessageCircle, 
  Copy, 
  MapPin, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

interface OrderConfirmationModalProps {
  order: OrderRecord | null;
  onClose: () => void;
  onAdvanceStatus?: (orderId: string, newStatus: OrderStatus) => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string; icon: React.ElementType }[] = [
  { key: 'received', label: 'Order Received', desc: 'Dispatched to merchant', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparing / Packing', desc: 'Freshly assembled', icon: Package },
  { key: 'on_the_way', label: 'Rider On The Way', desc: 'Out for fast delivery', icon: Bike },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your meal/grocery!', icon: Check },
];

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onAdvanceStatus,
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order ? order.status : 'received');
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [countdownMinutes, setCountdownMinutes] = useState(order ? order.estimatedDeliveryMinutes || 25 : 25);
  const [qrSrc, setQrSrc] = useState<string>(
    order?.qrDataUrl || (order?.qrData?.startsWith('data:') ? order.qrData : '')
  );

  // Status simulation effect
  useEffect(() => {
    if (!order) return;
    setCurrentStatus(order.status);
  }, [order?.status]);

  // Lock body scroll and handle Escape key while open
  useEffect(() => {
    if (!order) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [order, onClose]);

  // Ensure QR Code URL is generated if not present in orderRecord
  useEffect(() => {
    if (!order) return;
    let isMounted = true;
    if (!qrSrc && order.qrData) {
      generateQRCodeDataUrl(order.qrData).then((url) => {
        if (isMounted && url) {
          setQrSrc(url);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [order, qrSrc]);

  // Countdown timer simulation
  useEffect(() => {
    if (!order) return;
    const timer = setInterval(() => {
      setCountdownMinutes((prev) => Math.max(1, prev - 1));
    }, 60000);
    return () => clearInterval(timer);
  }, [order]);

  if (!order) return null;

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  const handleStepClick = (statusKey: OrderStatus) => {
    setCurrentStatus(statusKey);
    if (onAdvanceStatus) {
      onAdvanceStatus(order.orderId, statusKey);
    }
  };

  const handleCopyOrderId = () => {
    try {
      navigator.clipboard.writeText(order.orderId);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch {
      // fallback
    }
  };

  const whatsappUrl = createWhatsAppUrl(DEFAULT_WHATSAPP_PHONE, order.whatsappMessageText);

  return (
    <div
      id="order-confirmation-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="order-confirmation-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header with celebration banner */}
        <div className="bg-emerald-600 p-6 text-white text-center relative overflow-hidden shrink-0">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-['Outfit']">
              Order Confirmed & Sent!
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-md">
              Your order has been logged and sent to WhatsApp dispatch. Show your QR code to the delivery driver for instant authentication.
            </p>

            <div className="mt-3 inline-flex items-center gap-2 bg-emerald-700/80 px-3 py-1.5 rounded-full text-xs font-semibold">
              <span>Order Reference: <strong className="font-mono">#{order.orderId}</strong></span>
              <button
                id="btn-copy-confirmed-id"
                type="button"
                onClick={handleCopyOrderId}
                className="hover:text-emerald-200 cursor-pointer"
                title="Copy Order ID"
              >
                {copiedOrderId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Live Tracker Stepper */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-['Outfit']">
                  Live Order Tracker
                </span>
                <div className="text-sm font-bold text-stone-900">
                  Estimated Delivery: {countdownMinutes} mins
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                <Clock className="w-3.5 h-3.5" /> Live
              </span>
            </div>

            {/* Stepper Progress Line */}
            <div className="grid grid-cols-4 gap-2 relative">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx <= currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => handleStepClick(step.key)}
                    className="flex flex-col items-center text-center group cursor-pointer"
                    title="Click to simulate next status step"
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-200 shadow-sm scale-105'
                          : isPassed
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold mt-2 leading-tight ${
                      isCurrent ? 'text-stone-900' : isPassed ? 'text-stone-700' : 'text-stone-400'
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-[9px] text-stone-400 hidden sm:block mt-0.5">
                      {step.desc}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-stone-400 text-center mt-3">
              Tip: Click any status icon above to simulate delivery progress stages
            </div>
          </div>

          {/* QR Code & Dispatch Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* QR Card */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-col items-center text-center shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2 font-['Outfit']">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Verification QR Code</span>
              </div>

              {qrSrc ? (
                <img
                  src={qrSrc}
                  alt={`Verification QR code for order ${order.orderId}`}
                  className="w-36 h-36 object-contain rounded-xl border border-stone-100 p-1"
                />
              ) : (
                <div className="w-36 h-36 bg-stone-100 rounded-xl flex flex-col items-center justify-center text-stone-400 text-xs p-2">
                  <QrCode className="w-8 h-8 text-stone-300 mb-1" />
                  <span>Generating QR...</span>
                </div>
              )}

              <span className="text-[11px] text-stone-500 mt-2 font-mono">
                Order #{order.orderId}
              </span>
            </div>

            {/* WhatsApp Direct Action */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm font-['Outfit'] mb-1">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Chat Dispatch</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Need to update delivery instructions, request contactless drop, or ask about your order?
                </p>
              </div>

              <div className="space-y-2 mt-4">
                <a
                  id="link-open-whatsapp-order"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Dispatch</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-75" />
                </a>

                <div className="text-[11px] text-emerald-800 text-center font-medium">
                  Dispatch Line: {DEFAULT_WHATSAPP_PHONE}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Items Summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 font-['Outfit'] flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
              Order Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </h4>

            <div className="divide-y divide-stone-100 bg-stone-50 rounded-2xl border border-stone-200 p-3">
              {order.items.map((item) => (
                <div key={item.cartItemId} className="py-2.5 flex items-start justify-between text-xs">
                  <div>
                    <div className="font-bold text-stone-900">
                      {item.quantity}x {item.item.name}
                    </div>
                    {item.selectedOptions.length > 0 && (
                      <div className="text-stone-500 text-[11px]">
                        {item.selectedOptions.map(o => o.optionName).join(', ')}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div className="text-amber-700 text-[10px] italic">
                        Note: {item.specialInstructions}
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-stone-900">
                    {formatCurrency(item.totalPrice)}
                  </div>
                </div>
              ))}

              <div className="pt-3 space-y-1 text-xs border-t border-stone-200 text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({order.promoApplied || 'Promo'})</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.tip > 0 && (
                  <div className="flex justify-between">
                    <span>Courier Tip</span>
                    <span>{formatCurrency(order.tip)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-stone-900 text-sm pt-1 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span>{formatCurrency(order.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5 text-stone-700">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              <span>Delivering to {order.customer.fullName}</span>
            </div>
            <p className="text-stone-600 pl-5">
              {order.customer.deliveryAddress}
            </p>
            {order.customer.deliveryInstructions && (
              <p className="text-stone-500 pl-5 text-[11px] italic">
                "{order.customer.deliveryInstructions}"
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2 shrink-0">
          <button
            id="btn-done-order-confirmation"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done / Browse Menu
          </button>
        </div>
      </div>
    </div>
  );
};
