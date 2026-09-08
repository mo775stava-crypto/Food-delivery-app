import React, { useState, useEffect } from 'react';
import { MenuItem, SelectedOption } from '../types';
import { formatCurrency } from '../utils/orderUtils';
import { sanitizeText } from '../utils/securityUtils';
import { SafeImage } from './SafeImage';
import { X, Star, Clock, Plus, Minus, Check, Flame, Scale, Sparkles, MessageSquare } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    selectedOptions: SelectedOption[],
    specialInstructions?: string
  ) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [instructions, setInstructions] = useState('');

  // Auto-select required first options when modal opens
  useEffect(() => {
    if (!item) return;
    setQuantity(1);
    setInstructions('');
    if (item.optionGroups) {
      const defaults: SelectedOption[] = [];
      item.optionGroups.forEach((group) => {
        if (group.required && group.options.length > 0) {
          const firstOpt = group.options[0];
          defaults.push({
            groupId: group.id,
            groupName: group.name,
            optionId: firstOpt.id,
            optionName: firstOpt.name,
            price: firstOpt.price,
          });
        }
      });
      setSelectedOptions(defaults);
    } else {
      setSelectedOptions([]);
    }
  }, [item]);

  // Handle body scroll lock & escape key
  useEffect(() => {
    if (!item) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  const isFood = item.storeType === 'food';

  const handleSelectRadio = (groupId: string, groupName: string, optionId: string, optionName: string, price: number) => {
    setSelectedOptions((prev) => {
      const filtered = prev.filter((o) => o.groupId !== groupId);
      return [...filtered, { groupId, groupName, optionId, optionName, price }];
    });
  };

  const handleToggleCheckbox = (groupId: string, groupName: string, optionId: string, optionName: string, price: number) => {
    setSelectedOptions((prev) => {
      const exists = prev.some((o) => o.groupId === groupId && o.optionId === optionId);
      if (exists) {
        return prev.filter((o) => !(o.groupId === groupId && o.optionId === optionId));
      } else {
        return [...prev, { groupId, groupName, optionId, optionName, price }];
      }
    });
  };

  const extrasTotal = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
  const singleUnitPrice = item.price + extrasTotal;
  const totalPrice = singleUnitPrice * quantity;

  const handleAdd = () => {
    const cleanedInstructions = sanitizeText(instructions, 150);
    onAddToCart(item, quantity, selectedOptions, cleanedInstructions || undefined);
    onClose();
  };

  return (
    <div
      id="item-detail-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="item-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="btn-close-detail-modal"
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-900/70 text-white hover:bg-stone-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image Banner */}
        <div className="relative aspect-[16/9] w-full bg-stone-100 shrink-0">
          <SafeImage
            src={item.image}
            alt={item.name}
            fallbackType={isFood ? 'food' : 'grocery'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {item.badge && (
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                    isFood ? 'bg-amber-500 text-stone-950' : 'bg-emerald-600 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.rating.toFixed(1)}</span>
                  <span className="text-stone-300">({item.reviewCount})</span>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-['Outfit'] drop-shadow-xs">
                {item.name}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-['Outfit'] text-amber-400">
                {formatCurrency(item.price)}
              </span>
              {item.originalPrice && (
                <div className="text-xs text-stone-300 line-through">
                  {formatCurrency(item.originalPrice)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Metadata & Description */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                {item.prepTime}
              </span>
              {item.calories && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  {item.calories}
                </span>
              )}
              {item.unit && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  {item.unit}
                </span>
              )}
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Option Groups (if applicable) */}
          {item.optionGroups && item.optionGroups.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-stone-100">
              {item.optionGroups.map((group) => (
                <div key={group.id} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700 font-['Outfit']">
                      {group.name}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-500">
                      {group.required ? 'Required • Choose 1' : 'Optional'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {group.options.map((opt) => {
                      const isSelected = selectedOptions.some(
                        (o) => o.groupId === group.id && o.optionId === opt.id
                      );

                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50/60 border-amber-400 text-stone-900 shadow-2xs'
                              : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100/80 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type={group.required ? 'radio' : 'checkbox'}
                              name={`group-${group.id}`}
                              checked={isSelected}
                              onChange={() => {
                                if (group.required) {
                                  handleSelectRadio(group.id, group.name, opt.id, opt.name, opt.price);
                                } else {
                                  handleToggleCheckbox(group.id, group.name, opt.id, opt.name, opt.price);
                                }
                              }}
                              className="w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500"
                            />
                            <span className="text-sm font-medium">{opt.name}</span>
                          </div>
                          {opt.price > 0 && (
                            <span className="text-xs font-bold text-stone-600">
                              +{formatCurrency(opt.price)}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Instructions Note Input */}
          <div className="pt-2 border-t border-stone-100">
            <label 
              htmlFor="special-instructions-input"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 font-['Outfit'] mb-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
              <span>Special Instructions / Allergen Note</span>
            </label>
            <input
              id="special-instructions-input"
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Dressing on the side, extra spicy, contactless drop..."
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-stone-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Modal Bottom Footer with Stepper & Add Button */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          {/* Stepper */}
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl p-1 shadow-2xs">
            <button
              id="btn-detail-decrement"
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center font-bold text-stone-900 text-sm">
              {quantity}
            </span>
            <button
              id="btn-detail-increment"
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            id="btn-detail-submit-add"
            type="button"
            onClick={handleAdd}
            className={`flex-1 flex items-center justify-between px-5 py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer ${
              isFood
                ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <span>Add to Cart</span>
            <span>{formatCurrency(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
