import React from 'react';
import { StoreMode, DietaryTag } from '../types';
import { Sparkles, Clock, ShieldCheck, Tag, Zap, Copy, Check } from 'lucide-react';

interface StoreBannerProps {
  storeMode: StoreMode;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  onApplyPromo: (code: string) => void;
  appliedPromo?: string;
}

export const StoreBanner: React.FC<StoreBannerProps> = ({
  storeMode,
  selectedTag,
  onSelectTag,
  onApplyPromo,
  appliedPromo,
}) => {
  const isFood = storeMode === 'food';
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (code: string) => {
    onApplyPromo(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const dietaryTags = isFood
    ? ['All', 'Best Seller', 'Chef Special', 'Veg', 'Halal', 'Gluten-Free', 'Vegan']
    : ['All', 'Best Seller', 'Organic', 'Veg', 'Vegan', 'Chef Special'];

  return (
    <section className="mb-6">
      {/* Visual Feature Card */}
      <div 
        id="store-hero-banner"
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300 border ${
          isFood
            ? 'bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50/50 border-amber-200/60 shadow-xs'
            : 'bg-gradient-to-br from-emerald-50 via-stone-50 to-teal-50/50 border-emerald-200/60 shadow-xs'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-white/80 backdrop-blur-xs border border-stone-200 text-stone-700">
              <Zap className={`w-3.5 h-3.5 ${isFood ? 'text-amber-500' : 'text-emerald-600'}`} />
              <span>{isFood ? 'Gourmet Kitchens & Cafes' : 'Same-Day Supermarket Freshness'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-['Outfit'] text-stone-900 leading-tight">
              {isFood ? (
                <>
                  Craving delicious food? <span className="text-amber-500">Delivered piping hot</span>.
                </>
              ) : (
                <>
                  Farm fresh groceries, <span className="text-emerald-600">handpicked daily</span>.
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {isFood
                ? 'Order artisanal burgers, wood-fired pizzas, healthy bowls, and sweet bakery treats with direct WhatsApp confirmation.'
                : '100% organic produce, grass-fed dairy, fresh-baked sourdough, and pantry essentials delivered straight to your door.'}
            </p>

            {/* Quick Promo Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Promo:
              </span>

              <button
                id="promo-pill-welcome20"
                type="button"
                onClick={() => handleCopy('WELCOME20')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  appliedPromo === 'WELCOME20'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-800 border-stone-300 hover:border-stone-400'
                }`}
              >
                <span>WELCOME20 (20% OFF)</span>
                {copiedCode === 'WELCOME20' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-stone-400" />
                )}
              </button>

              <button
                id="promo-pill-freeship"
                type="button"
                onClick={() => handleCopy('FREESHIP')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  appliedPromo === 'FREESHIP'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-800 border-stone-300 hover:border-stone-400'
                }`}
              >
                <span>FREESHIP (Free Delivery)</span>
                {copiedCode === 'FREESHIP' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-stone-400" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto shrink-0">
            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isFood ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-stone-500">Speedy ETA</div>
                <div className="text-sm font-bold text-stone-900">{isFood ? '20-30 min' : '15-25 min'}</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-stone-500">Verified</div>
                <div className="text-sm font-bold text-stone-900">WhatsApp & QR</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dietary / Specialty Tag Filter Scroll */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider pl-1 shrink-0">Filter:</span>
        {dietaryTags.map((tag) => {
          const isSelected = (tag === 'All' && !selectedTag) || selectedTag === tag;
          return (
            <button
              key={tag}
              id={`filter-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => onSelectTag(tag === 'All' ? '' : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? isFood
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </section>
  );
};
