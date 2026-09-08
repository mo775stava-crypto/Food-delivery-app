import React, { useState, useEffect, useMemo } from 'react';
import { 
  StoreMode, 
  MenuItem, 
  CartItem, 
  SelectedOption, 
  PromoCode, 
  OrderRecord, 
  OrderStatus 
} from './types';
import { 
  FOOD_CATEGORIES, 
  GROCERY_CATEGORIES, 
  MENU_ITEMS, 
  AVAILABLE_PROMO_CODES,
  DEFAULT_WHATSAPP_PHONE 
} from './data/mockData';
import { formatCurrency } from './utils/orderUtils';
import { Header } from './components/Header';
import { StoreBanner } from './components/StoreBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ItemCard } from './components/ItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AddressSelectorModal } from './components/AddressSelectorModal';
import { 
  ShoppingBag, 
  Search, 
  Utensils, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const LOCAL_CART_KEY = 'freshdrop_cart_v1';
const LOCAL_ORDERS_KEY = 'freshdrop_orders_v1';
const LOCAL_ADDRESS_KEY = 'freshdrop_address_v1';

export default function App() {
  // Store Mode (food vs grocery)
  const [storeMode, setStoreMode] = useState<StoreMode>('food');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(2);

  // Modals & Panels
  const [activeItemForDetail, setActiveItemForDetail] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Address
  const [deliveryAddress, setDeliveryAddress] = useState<string>(() => {
    return localStorage.getItem(LOCAL_ADDRESS_KEY) || '742 Evergreen Terrace, Apt 4B, Springfield';
  });

  // Order history
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Save Orders to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  // Save Address to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_ADDRESS_KEY, deliveryAddress);
  }, [deliveryAddress]);

  // When switching storeMode, reset category filter to 'all'
  const handleSelectStoreMode = (mode: StoreMode) => {
    setStoreMode(mode);
    setSelectedCategory('all');
    setSelectedTag('');
  };

  // Categories list based on current active store
  const currentCategories = storeMode === 'food' ? FOOD_CATEGORIES : GROCERY_CATEGORIES;

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Must match active store type
      if (item.storeType !== storeMode) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Dietary tag filter
      if (selectedTag && !item.tags.includes(selectedTag as any)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(query));
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesTags && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [storeMode, selectedCategory, selectedTag, searchQuery]);

  // Item counts by category for badge numbers
  const itemCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    MENU_ITEMS.filter((i) => i.storeType === storeMode).forEach((item) => {
      counts.all = (counts.all || 0) + 1;
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [storeMode]);

  // Cart helper functions
  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, i) => acc + i.totalPrice, 0);

  const getQuantityInCart = (itemId: string): number => {
    const matching = cartItems.filter((i) => i.item.id === itemId);
    return matching.reduce((sum, i) => sum + i.quantity, 0);
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity = 1,
    selectedOptions: SelectedOption[] = [],
    specialInstructions?: string
  ) => {
    // Generate unique key based on item id and selected options
    const optionsKey = selectedOptions
      .map((o) => o.optionId)
      .sort()
      .join('-');
    const instructionsKey = specialInstructions || '';
    const cartItemId = `${item.id}_${optionsKey}_${instructionsKey}`;

    const extrasTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const unitPrice = item.price + extrasTotal;
    const totalPrice = unitPrice * quantity;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: unitPrice * newQty,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            item,
            quantity,
            selectedOptions,
            specialInstructions,
            unitPrice,
            totalPrice,
          },
        ];
      }
    });
  };

  const handleIncrementCartItem = (cartItemId: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + 1;
          return {
            ...item,
            quantity: newQty,
            totalPrice: item.unitPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleDecrementCartItem = (cartItemId: string) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity - 1;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleIncrementSimpleItem = (item: MenuItem) => {
    // For items without custom options added directly from card
    handleAddToCart(item, 1);
  };

  const handleDecrementSimpleItem = (item: MenuItem) => {
    // Decrement the first matching item
    const match = cartItems.find((i) => i.item.id === item.id);
    if (match) {
      handleDecrementCartItem(match.cartItemId);
    }
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedPromo(null);
  };

  const handleApplyPromoCode = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.toUpperCase().trim();
    const found = AVAILABLE_PROMO_CODES.find((p) => p.code === cleanCode);

    if (!found) {
      return { success: false, message: `Promo code "${cleanCode}" is invalid.` };
    }

    if (cartSubtotal < found.minOrder) {
      return {
        success: false,
        message: `Order must be at least ${formatCurrency(found.minOrder)} for this promo.`,
      };
    }

    setAppliedPromo(found);
    return { success: true, message: `Code ${found.code} applied! ${found.description}` };
  };

  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
  };

  // Calculations for checkout
  const isFreeDelivery = cartSubtotal >= 25.0 || appliedPromo?.freeDelivery === true;
  const deliveryFee = cartSubtotal === 0 ? 0 : isFreeDelivery ? 0 : 3.5;

  let promoDiscount = 0;
  if (appliedPromo && cartSubtotal >= appliedPromo.minOrder) {
    if (appliedPromo.discountPercent) {
      promoDiscount = (cartSubtotal * appliedPromo.discountPercent) / 100;
    } else if (appliedPromo.discountFlat) {
      promoDiscount = appliedPromo.discountFlat;
    }
  }

  const grandTotal = Math.max(0, cartSubtotal - promoDiscount + deliveryFee + tipAmount);

  // Order Complete Flow
  const handleOrderCompleted = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    setConfirmedOrder(newOrder);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCartItems([]);
    setAppliedPromo(null);
  };

  const handleAdvanceOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
    if (confirmedOrder && confirmedOrder.orderId === orderId) {
      setConfirmedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleReorder = (pastOrder: OrderRecord) => {
    // Add all items from past order to cart
    pastOrder.items.forEach((pastItem) => {
      handleAddToCart(
        pastItem.item,
        pastItem.quantity,
        pastItem.selectedOptions,
        pastItem.specialInstructions
      );
    });
    setIsOrderHistoryOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col">
      {/* Navigation Header */}
      <Header
        storeMode={storeMode}
        onSelectStoreMode={handleSelectStoreMode}
        cartCount={totalCartCount}
        cartTotal={grandTotal}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        deliveryAddress={deliveryAddress}
        onChangeAddress={() => setIsAddressModalOpen(true)}
        onOpenHistory={() => setIsOrderHistoryOpen(true)}
        recentOrdersCount={orders.length}
      />

      {/* Main Catalog View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dynamic Hero Banner */}
        <StoreBanner
          storeMode={storeMode}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          onApplyPromo={(code) => handleApplyPromoCode(code)}
          appliedPromo={appliedPromo?.code}
        />

        {/* Category Filter Chips */}
        <CategoryFilter
          categories={currentCategories}
          activeCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
          storeMode={storeMode}
          itemCountsByCategory={itemCountsByCategory}
        />

        {/* Items Grid & Content */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold font-['Outfit'] text-stone-900">
                {selectedCategory === 'all'
                  ? storeMode === 'food'
                    ? 'Featured Gourmet Dishes'
                    : 'Daily Supermarket Harvest'
                  : currentCategories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <span className="text-xs font-bold text-stone-400 bg-stone-200/70 px-2 py-0.5 rounded-full">
                {filteredItems.length}
              </span>
            </div>

            {searchQuery && (
              <button
                id="btn-reset-filters"
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTag('');
                }}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Cards Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-2xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg font-['Outfit'] text-stone-800">
                No items found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                We couldn't find any {storeMode === 'food' ? 'dishes' : 'groceries'} matching "{searchQuery || selectedTag}". Try another search or filter!
              </p>
              <button
                id="btn-clear-all-filters"
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTag('');
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
              >
                View Full Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  quantityInCart={getQuantityInCart(item.id)}
                  onAddToCart={(it) => handleAddToCart(it, 1)}
                  onIncrement={handleIncrementSimpleItem}
                  onDecrement={handleDecrementSimpleItem}
                  onOpenDetail={(it) => setActiveItemForDetail(it)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Sticky Cart Bar (Mobile-friendly) */}
      {cartItems.length > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-30 md:hidden animate-in slide-in-from-bottom duration-300">
          <button
            id="btn-mobile-floating-cart"
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3 px-4 bg-stone-900 text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs cursor-pointer border border-stone-800"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-extrabold text-[11px]">
                {totalCartCount}
              </span>
              <span>View Basket</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm">{formatCurrency(grandTotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-8 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 font-['Outfit']">FreshDrop Food & Grocery Delivery</span>
            <span>•</span>
            <span>Instant WhatsApp & QR Ordering</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>WhatsApp Dispatch: {DEFAULT_WHATSAPP_PHONE}</span>
            <span>•</span>
            <span>Operating Hours: 7:00 AM - 11:30 PM</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      {activeItemForDetail && (
        <ItemDetailModal
          item={activeItemForDetail}
          onClose={() => setActiveItemForDetail(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onIncrement={handleIncrementCartItem}
          onDecrement={handleDecrementCartItem}
          onRemove={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          appliedPromo={appliedPromo}
          onApplyPromoCode={handleApplyPromoCode}
          onRemovePromoCode={handleRemovePromoCode}
          tipAmount={tipAmount}
          onSetTipAmount={setTipAmount}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          subtotal={cartSubtotal}
          deliveryFee={deliveryFee}
          discount={promoDiscount}
          tipAmount={tipAmount}
          grandTotal={grandTotal}
          activeStore={storeMode}
          appliedPromo={appliedPromo}
          initialDeliveryAddress={deliveryAddress}
          onOrderCompleted={handleOrderCompleted}
        />
      )}

      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onAdvanceStatus={handleAdvanceOrderStatus}
        />
      )}

      {isOrderHistoryOpen && (
        <OrderHistoryModal
          isOpen={isOrderHistoryOpen}
          onClose={() => setIsOrderHistoryOpen(false)}
          orders={orders}
          onSelectOrder={(ord) => {
            setIsOrderHistoryOpen(false);
            setConfirmedOrder(ord);
          }}
          onReorder={handleReorder}
        />
      )}

      {isAddressModalOpen && (
        <AddressSelectorModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          currentAddress={deliveryAddress}
          onSaveAddress={setDeliveryAddress}
        />
      )}
    </div>
  );
}
