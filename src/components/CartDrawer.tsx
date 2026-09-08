import React, { useState, useEffect } from 'react';
import { CartItem, PromoCode } from '../types';
import { formatCurrency } from '../utils/orderUtils';
import { sanitizePromoCode, safeCurrencyRound } from '../utils/securityUtils';
import { SafeImage } from './SafeImage';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  HeartHandshake, 
  Sparkles,
  Utensils
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onIncrement: (cartItemId: string) => void;
  onDecrement: (cartItemId: string) => void;
  onRemove: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  appliedPromo: PromoCode | null;
  onApplyPromoCode: (code: string) => { success: boolean; message: string };
  onRemovePromoCode: () => void;
  tipAmount: number;
  onSetTipAmount: (amount: number) => void;
}

const FREE_DELIVERY_THRESHOLD = 25.00;
const STANDARD_DELIVERY_FEE = 3.50;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onIncrement,
  onDecrement,
  onRemove,
  onClearCart,
  onProceedToCheckout,
  appliedPromo,
  onApplyPromoCode,
  onRemovePromoCode,
  tipAmount,
  onSetTipAmount,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Real-time calculations with safe precision rounding
  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const subtotal = safeCurrencyRound(rawSubtotal);

  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD || (appliedPromo?.freeDelivery === true);
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE;

  let rawDiscount = 0;
  if (appliedPromo && subtotal >= appliedPromo.minOrder) {
    if (appliedPromo.discountPercent) {
      rawDiscount = (subtotal * appliedPromo.discountPercent) / 100;
    } else if (appliedPromo.discountFlat) {
      rawDiscount = appliedPromo.discountFlat;
    }
  }
  const discount = safeCurrencyRound(rawDiscount);

  const grandTotal = safeCurrencyRound(Math.max(0, subtotal - discount + deliveryFee + tipAmount));
  const amountToFreeDelivery = Math.max(0, safeCurrencyRound(FREE_DELIVERY_THRESHOLD - subtotal));
  const freeDeliveryProgress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizePromoCode(promoInput);
    if (!cleanCode) return;
    const result = onApplyPromoCode(cleanCode);
    setPromoMessage({
      text: result.message,
      isError: !result.success,
    });
    if (result.success) {
      setPromoInput('');
    }
  };

  const foodItemsCount = cartItems.filter(i => i.item.storeType === 'food').length;
  const groceryItemsCount = cartItems.filter(i => i.item.storeType === 'grocery').length;

  return (
    <div
      id="cart-drawer-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end"
    >
      <div
        id="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-hidden border-l border-stone-200 animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg font-['Outfit'] text-stone-900 leading-tight">
                Your Basket
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <span>{cartItems.reduce((sum, i) => sum + i.quantity, 0)} items</span>
                {foodItemsCount > 0 && groceryItemsCount > 0 && (
                  <span className="font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                    Dual Cart (Food & Grocery)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                id="btn-clear-cart"
                type="button"
                onClick={onClearCart}
                className="text-xs text-stone-400 hover:text-rose-500 font-medium px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
                title="Empty shopping cart"
              >
                Clear
              </button>
            )}
            <button
              id="btn-close-cart-drawer"
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Free Delivery Bar */}
        {cartItems.length > 0 && (
          <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                {isFreeDelivery ? (
                  <span className="text-emerald-700">🎉 Congratulations! You unlocked FREE Delivery!</span>
                ) : (
                  <span>Add {formatCurrency(amountToFreeDelivery)} more for <strong className="text-amber-700">FREE Delivery</strong></span>
                )}
              </span>
              <span className="text-[11px] font-extrabold text-stone-600">{Math.round(freeDeliveryProgress)}%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isFreeDelivery ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg font-['Outfit']">Your basket is empty</h3>
              <p className="text-xs text-stone-500 max-w-xs">
                Explore our restaurant chef specials or fresh supermarket produce to fill your basket!
              </p>
              <button
                id="btn-cart-start-shopping"
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            cartItems.map((cartItem) => {
              const isFood = cartItem.item.storeType === 'food';
              return (
                <div
                  key={cartItem.cartItemId}
                  id={`cart-item-${cartItem.cartItemId}`}
                  className="flex items-start gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 transition-all hover:bg-stone-100/70"
                >
                  {/* Item Image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                    <SafeImage
                      src={cartItem.item.image}
                      alt={cartItem.item.name}
                      fallbackType={isFood ? 'food' : 'grocery'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1">
                      <span className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[8px] text-white ${
                        isFood ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}>
                        {isFood ? <Utensils className="w-2.5 h-2.5" /> : <ShoppingBag className="w-2.5 h-2.5" />}
                      </span>
                    </div>
                  </div>

                  {/* Title & Options */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate font-['Outfit']">
                        {cartItem.item.name}
                      </h4>
                      <button
                        id={`btn-remove-${cartItem.cartItemId}`}
                        type="button"
                        onClick={() => onRemove(cartItem.cartItemId)}
                        className="text-stone-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Selected Options text */}
                    {cartItem.selectedOptions.length > 0 && (
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                        {cartItem.selectedOptions.map(o => o.optionName).join(', ')}
                      </p>
                    )}

                    {/* Note */}
                    {cartItem.specialInstructions && (
                      <p className="text-[10px] text-amber-700 italic mt-0.5">
                        Note: {cartItem.specialInstructions}
                      </p>
                    )}

                    {/* Stepper and Price Row */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/60">
                      <span className="font-extrabold text-xs sm:text-sm text-stone-900 font-['Outfit']">
                        {formatCurrency(cartItem.totalPrice)}
                      </span>

                      <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                        <button
                          id={`btn-cart-dec-${cartItem.cartItemId}`}
                          type="button"
                          onClick={() => onDecrement(cartItem.cartItemId)}
                          className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-stone-800">
                          {cartItem.quantity}
                        </span>
                        <button
                          id={`btn-cart-inc-${cartItem.cartItemId}`}
                          type="button"
                          onClick={() => onIncrement(cartItem.cartItemId)}
                          className="w-6 h-6 rounded-md bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Promo Code Box */}
          {cartItems.length > 0 && (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-cart-promo"
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Enter promo (e.g. WELCOME20)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl uppercase font-semibold text-stone-800 placeholder:normal-case placeholder-stone-400 focus:outline-none focus:border-stone-400"
                  />
                </div>
                <button
                  id="btn-apply-promo"
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-white text-xs font-bold hover:bg-stone-900 transition-colors shrink-0 cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Promo <strong>{appliedPromo.code}</strong> applied ({appliedPromo.description})
                  </span>
                  <button
                    id="btn-remove-promo"
                    type="button"
                    onClick={onRemovePromoCode}
                    className="text-stone-400 hover:text-stone-700 ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              {promoMessage && (
                <p className={`text-[11px] font-medium ${promoMessage.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {promoMessage.text}
                </p>
              )}
            </div>
          )}

          {/* Courier Tip Selection */}
          {cartItems.length > 0 && (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
                <span className="flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-stone-500" />
                  Courier Tip
                </span>
                <span className="text-[11px] text-stone-400">100% goes to driver</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 2, 3, 5].map((tip) => (
                  <button
                    key={tip}
                    id={`btn-tip-${tip}`}
                    type="button"
                    onClick={() => onSetTipAmount(tip)}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      tipAmount === tip
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {tip === 0 ? 'No Tip' : `$${tip}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-white shrink-0 space-y-3">
            {/* Bill summary */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">FREE</span>
                ) : (
                  <span className="font-semibold text-stone-800">{formatCurrency(deliveryFee)}</span>
                )}
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              {tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>Courier Tip</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(tipAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900 font-['Outfit']">Total Due</span>
                <span className="text-xl font-extrabold text-stone-900 font-['Outfit']">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="btn-proceed-to-checkout"
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-sm flex items-center justify-between shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <div className="flex items-center gap-1.5">
                <span>{formatCurrency(grandTotal)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
