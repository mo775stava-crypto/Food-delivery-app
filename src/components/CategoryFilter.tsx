import React from 'react';
import { Category, StoreMode } from '../types';
import { 
  Utensils, 
  Beef, 
  Pizza, 
  Soup, 
  Salad, 
  Coffee, 
  ShoppingBag, 
  Carrot, 
  Apple, 
  Milk, 
  Wheat, 
  Wine 
} from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  storeMode: StoreMode;
  itemCountsByCategory: Record<string, number>;
}

// Icon mapping dictionary
const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Beef,
  Pizza,
  Soup,
  Salad,
  Coffee,
  ShoppingBag,
  Carrot,
  Apple,
  Milk,
  Wheat,
  Wine,
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  storeMode,
  itemCountsByCategory,
}) => {
  const isFood = storeMode === 'food';

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-stone-900 font-['Outfit']">
          {isFood ? 'Explore Menu Categories' : 'Supermarket Departments'}
        </h2>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.iconName] || ShoppingBag;
          const isActive = activeCategoryId === cat.id;
          const count = itemCountsByCategory[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              id={`category-btn-${cat.id}`}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                isActive
                  ? isFood
                    ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                    : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                isActive
                  ? isFood ? 'bg-black/10 text-stone-950' : 'bg-white/20 text-white'
                  : isFood ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <span>{cat.name}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? isFood ? 'bg-black/15 text-stone-950' : 'bg-white/25 text-white'
                    : 'bg-stone-100 text-stone-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
