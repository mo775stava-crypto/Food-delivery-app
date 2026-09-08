import React, { useEffect } from 'react';
import { OrderRecord } from '../types';
import { formatCurrency } from '../utils/orderUtils';
import { X, Clock, QrCode, ShoppingBag, ArrowRight } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  onSelectOrder: (order: OrderRecord) => void;
  onReorder: (order: OrderRecord) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
  onReorder,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="order-history-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="order-history-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Outfit'] text-stone-900">
                Order History & Verification
              </h2>
              <p className="text-xs text-stone-500">
                {orders.length} saved {orders.length === 1 ? 'order' : 'orders'} in this session
              </p>
            </div>
          </div>

          <button
            id="btn-close-order-history"
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-sm font-semibold text-stone-700">No orders yet</p>
              <p className="text-xs text-stone-400">Your placed orders and QR codes will show up here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                id={`history-card-${order.orderId}`}
                className="p-4 bg-stone-50 hover:bg-stone-100/80 rounded-2xl border border-stone-200 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                        #{order.orderId}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-stone-700 mt-1">
                      {order.items.map(i => `${i.quantity}x ${i.item.name}`).join(', ')}
                    </p>
                  </div>

                  <span className="text-sm font-extrabold text-stone-900 font-['Outfit']">
                    {formatCurrency(order.grandTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                  <span className="capitalize font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    {order.status.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-view-qr-${order.orderId}`}
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-semibold hover:bg-stone-100 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Show QR & Track</span>
                    </button>

                    <button
                      id={`btn-reorder-${order.orderId}`}
                      type="button"
                      onClick={() => onReorder(order)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 text-white font-semibold hover:bg-stone-800 cursor-pointer"
                    >
                      <span>Reorder</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
