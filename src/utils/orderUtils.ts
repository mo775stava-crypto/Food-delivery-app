import QRCode from 'qrcode';
import { CartItem, DeliveryInfo, StoreMode } from '../types';
import { sanitizePhone, sanitizeText, safeCurrencyRound } from './securityUtils';

export const formatCurrency = (amount: number): string => {
  const safeAmount = safeCurrencyRound(amount);
  return `$${safeAmount.toFixed(2)}`;
};

export const generateOrderId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timestamp = Date.now().toString().slice(-4);
  return `FD-${randomPart}${timestamp}`;
};

export const buildWhatsAppMessage = (
  orderId: string,
  customer: DeliveryInfo,
  items: CartItem[],
  subtotal: number,
  deliveryFee: number,
  discount: number,
  tip: number,
  grandTotal: number,
  activeStore: StoreMode
): string => {
  const safeOrderId = sanitizeText(orderId, 20);
  const safeCustomerName = sanitizeText(customer.fullName, 60);
  const safePhone = sanitizePhone(customer.phone);
  const safeWhatsApp = sanitizePhone(customer.whatsappNumber || customer.phone);
  const safeAddress = sanitizeText(customer.deliveryAddress, 200);
  const safeInstructions = customer.deliveryInstructions ? sanitizeText(customer.deliveryInstructions, 150) : '';

  const safeSubtotal = safeCurrencyRound(subtotal);
  const safeDeliveryFee = safeCurrencyRound(deliveryFee);
  const safeDiscount = safeCurrencyRound(discount);
  const safeTip = safeCurrencyRound(tip);
  const safeGrandTotal = safeCurrencyRound(grandTotal);

  const storeLabel = activeStore === 'food' ? '🍔 Restaurant Delivery' : '🥦 Supermarket Grocery';
  const hasMixed = items.some(i => i.item.storeType === 'food') && items.some(i => i.item.storeType === 'grocery');
  const finalStoreLabel = hasMixed ? '🛍️ Combined Food & Grocery Order' : storeLabel;

  const itemLines = items
    .map((cartItem) => {
      const optionsText = cartItem.selectedOptions.length > 0
        ? ` (${cartItem.selectedOptions.map(o => sanitizeText(o.optionName, 40)).join(', ')})`
        : '';
      const notes = cartItem.specialInstructions ? ` [Note: ${sanitizeText(cartItem.specialInstructions, 100)}]` : '';
      const safeQty = Math.max(1, Math.min(99, Math.floor(cartItem.quantity)));
      return `▫️ *${safeQty}x* ${sanitizeText(cartItem.item.name, 80)}${optionsText} - ${formatCurrency(cartItem.totalPrice)}${notes}`;
    })
    .join('\n');

  const paymentText =
    customer.paymentMethod === 'whatsapp'
      ? '📲 Confirm & Pay via WhatsApp / Link'
      : customer.paymentMethod === 'cod'
      ? '💵 Cash on Delivery'
      : '💳 Online Payment / Card at Door';

  const scheduleText =
    customer.deliveryTimeType === 'asap'
      ? '⚡ ASAP (approx. 20-30 min)'
      : `🕒 Scheduled: ${sanitizeText(customer.scheduledTime || 'Preferred slot', 40)}`;

  const message = `*🔔 NEW ORDER: ${safeOrderId}*
${finalStoreLabel}
────────────────────
*👤 CUSTOMER DETAILS:*
• Name: ${safeCustomerName}
• Phone: ${safePhone}
• WhatsApp: ${safeWhatsApp}
• Delivery Address: ${safeAddress} (${customer.addressType.toUpperCase()})
${safeInstructions ? `• Instructions: ${safeInstructions}\n` : ''}• Delivery Time: ${scheduleText}
• Payment: ${paymentText}

────────────────────
*📦 ORDER SUMMARY:*
${itemLines}

────────────────────
*💰 BILLING BREAKDOWN:*
• Subtotal: ${formatCurrency(safeSubtotal)}
• Delivery: ${safeDeliveryFee === 0 ? 'FREE' : formatCurrency(safeDeliveryFee)}
${safeDiscount > 0 ? `• Discount: -${formatCurrency(safeDiscount)}\n` : ''}${safeTip > 0 ? `• Rider Tip: ${formatCurrency(safeTip)}\n` : ''}*👉 TOTAL DUE: ${formatCurrency(safeGrandTotal)}*

────────────────────
*QR / Verification Code:* ${safeOrderId}
Please confirm my order and share live preparation status. Thank you!`;

  return message;
};

export const createWhatsAppUrl = (phoneNumber: string, message: string): string => {
  // Strip non-digit characters
  const cleanPhone = (phoneNumber || '').replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length >= 7 ? cleanPhone : '15553492810';
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${targetPhone}?text=${encodedMessage}`;
};

export const generateQRCodeDataUrl = async (text: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
};
