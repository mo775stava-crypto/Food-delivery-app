export type StoreMode = 'food' | 'grocery';

export type DietaryTag = 'Veg' | 'Non-Veg' | 'Vegan' | 'Gluten-Free' | 'Halal' | 'Organic' | 'Chef Special' | 'Best Seller';

export interface ItemOption {
  id: string;
  name: string;
  price: number;
}

export interface ItemOptionGroup {
  id: string;
  name: string;
  required?: boolean;
  minSelect?: number;
  maxSelect?: number;
  options: ItemOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  storeType: StoreMode;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  prepTime: string;
  calories?: string;
  unit?: string; // e.g. "500g", "1 bunch", "1 box", "1 serving"
  tags: DietaryTag[];
  optionGroups?: ItemOptionGroup[];
  inStock: boolean;
  badge?: string;
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  item: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryInfo {
  fullName: string;
  phone: string;
  whatsappNumber: string;
  deliveryAddress: string;
  addressType: 'home' | 'work' | 'other';
  deliveryInstructions: string;
  deliveryTimeType: 'asap' | 'scheduled';
  scheduledTime?: string;
  paymentMethod: 'whatsapp' | 'cod' | 'card';
}

export type OrderStatus = 'received' | 'preparing' | 'on_the_way' | 'delivered';

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  promoApplied?: string;
  tip: number;
  grandTotal: number;
  customer: DeliveryInfo;
  status: OrderStatus;
  estimatedDeliveryMinutes: number;
  whatsappMessageText: string;
  qrData: string;
  qrDataUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  storeType: StoreMode;
  iconName: string;
  description?: string;
}

export interface PromoCode {
  code: string;
  discountPercent?: number;
  discountFlat?: number;
  freeDelivery?: boolean;
  minOrder: number;
  description: string;
}
