import React from 'react';
import { MenuItem } from '../types';
import { formatCurrency } from '../utils/orderUtils';
import { SafeImage } from './SafeImage';
import { Star, Clock, Plus, Minus, Flame, Scale, Sparkles } from 'lucide-react';

interface ItemCardProps {
  item: MenuItem;
  quantityInCart: number;
  onAddToCart: (item: MenuItem) => void;
  onIncrement: (item: MenuItem) => void;
  onDecrement: (item: MenuItem) => void;
  onOpenDetail: (item: MenuItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  quantityInCart,
  onAddToCart,
  onIncrement,
  onDecrement,
  onOpenDetail,
}) => {
  const hasOptions = item.optionGroups && item.optionGroups.length > 0;
  const isFood = item.storeType === 'food';
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
  const discountPercent = hasDiscount
    ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasOptions) {
      onOpenDetail(item);
    } else {
      onAddToCart(item);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasOptions) {
      onOpenDetail(item);
    } else {
      onIncrement(item);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecrement(item);
  };

  return (
    <div
      id={`item-card-${item.id}`}
      onClick={() => onOpenDetail(item)}
      className="group relative bg-white rounded-3xl border border-stone-200/80 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <SafeImage
          src={item.image}
          alt={item.name}
          fallbackType={isFood ? 'food' : 'grocery'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {item.badge && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold shadow-xs text-white ${
              isFood ? 'bg-amber-500' : 'bg-emerald-600'
            }`}>
              <Sparkles className="w-3 h-3" />
              {item.badge}
            </span>
          )}

          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-500 text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Dietary Badges Top Right */}
        <div className="absolute top-2.5 right-2.5 flex flex-wrap justify-end gap-1 z-10">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/95 text-stone-700 backdrop-blur-xs shadow-xs border border-stone-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Prep Time / Unit Floating Pill */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-stone-900/80 text-white backdrop-blur-xs">
            {isFood ? (
              <>
                <Clock className="w-3 h-3 text-amber-400" />
                {item.prepTime}
              </>
            ) : (
              <>
                <Scale className="w-3 h-3 text-emerald-400" />
                {item.unit || item.prepTime}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Calories/Meta */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <div className="flex items-center gap-1 font-semibold text-stone-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{item.rating.toFixed(1)}</span>
              <span className="text-stone-400 font-normal">({item.reviewCount})</span>
            </div>

            {item.calories && (
              <div className="flex items-center gap-0.5 text-stone-400 text-[11px]">
                <Flame className="w-3 h-3 text-orange-500" />
                <span>{item.calories}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-stone-900 leading-snug group-hover:text-amber-600 transition-colors line-clamp-1 mb-1 font-['Outfit']">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-stone-400">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-stone-900 font-['Outfit']">
                {formatCurrency(item.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through">
                  {formatCurrency(item.originalPrice!)}
                </span>
              )}
            </div>
          </div>

          {/* Cart Controls */}
          <div>
            {quantityInCart > 0 && !hasOptions ? (
              <div 
                id={`cart-stepper-${item.id}`}
                className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  id={`btn-decrement-${item.id}`}
                  type="button"
                  onClick={handleDecrement}
                  className="w-7 h-7 rounded-lg bg-white text-stone-800 hover:bg-stone-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  title="Remove one"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-stone-900">
                  {quantityInCart}
                </span>
                <button
                  id={`btn-increment-${item.id}`}
                  type="button"
                  onClick={handleIncrement}
                  className={`w-7 h-7 rounded-lg text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
                    isFood ? 'bg-amber-500 hover:bg-amber-600 text-stone-950' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title="Add another"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id={`btn-add-${item.id}`}
                type="button"
                onClick={handleQuickAdd}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer ${
                  quantityInCart > 0
                    ? 'bg-stone-900 text-white hover:bg-stone-800'
                    : isFood
                    ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {quantityInCart > 0 
                    ? `In Cart (${quantityInCart})`
                    : hasOptions 
                    ? 'Customize' 
                    : 'Add'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
