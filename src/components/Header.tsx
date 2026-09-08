import React, { useState } from 'react';
import { ShoppingBag, Utensils, MapPin, Search, ChevronDown, Clock, Sparkles } from 'lucide-react';
import { StoreMode } from '../types';
import { formatCurrency } from '../utils/orderUtils';

interface HeaderProps {
  storeMode: StoreMode;
  onSelectStoreMode: (mode: StoreMode) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  deliveryAddress: string;
  onChangeAddress: () => void;
  onOpenHistory: () => void;
  recentOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  storeMode,
  onSelectStoreMode,
  cartCount,
  cartTotal,
  onOpenCart,
  searchQuery,
  onSearchChange,
  deliveryAddress,
  onChangeAddress,
  onOpenHistory,
  recentOrdersCount,
}) => {
  const isFood = storeMode === 'food';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top Banner Alert / Value Prop */}
      <div className={`py-1.5 px-4 text-xs font-medium text-center transition-colors duration-300 ${
        isFood 
          ? 'bg-amber-500 text-stone-950' 
          : 'bg-emerald-600 text-white'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {isFood
              ? 'Free Delivery on gourmet food orders over $25 with code WELCOME20'
              : '⚡ Supermarket Flash Delivery: Fresh produce delivered in 15-25 mins!'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Logo & Store Mode Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              id="app-logo-badge"
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 ${
                isFood 
                  ? 'bg-amber-500 text-white shadow-amber-500/20' 
                  : 'bg-emerald-600 text-white shadow-emerald-600/20'
              }`}
            >
              {isFood ? <Utensils className="w-5 h-5 sm:w-6 sm:h-6" /> : <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight font-['Outfit'] text-stone-900 leading-none">
                Fresh<span className={isFood ? 'text-amber-500' : 'text-emerald-600'}>Drop</span>
              </span>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mt-0.5">
                {isFood ? 'Restaurants & Cafe' : 'Supermarket Mart'}
              </span>
            </div>
          </div>

          {/* Dual Store Toggle Center Pill */}
          <div 
            id="dual-store-toggle-container"
            className="hidden md:flex items-center p-1 bg-stone-100/90 rounded-2xl border border-stone-200"
          >
            <button
              id="toggle-food-store-desktop"
              onClick={() => onSelectStoreMode('food')}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isFood
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Utensils className={`w-4 h-4 ${isFood ? 'text-amber-500' : 'text-stone-400'}`} />
              <span>Restaurants</span>
            </button>
            <button
              id="toggle-grocery-store-desktop"
              onClick={() => onSelectStoreMode('grocery')}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                !isFood
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className={`w-4 h-4 ${!isFood ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span>Supermarket</span>
            </button>
          </div>

          {/* Delivery Location Selector */}
          <div className="hidden lg:flex items-center gap-2 border-l border-stone-200 pl-4">
            <button
              id="header-delivery-address-btn"
              onClick={onChangeAddress}
              type="button"
              className="flex items-center gap-2 text-left text-xs text-stone-600 hover:text-stone-900 transition-colors py-1 px-2 rounded-lg hover:bg-stone-100"
            >
              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                <MapPin className="w-4 h-4 text-stone-700" />
              </div>
              <div className="flex flex-col max-w-[150px]">
                <span className="font-bold text-stone-900 text-xs truncate">Deliver to</span>
                <span className="truncate text-[11px] text-stone-500">{deliveryAddress || 'Select Address'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-1" />
            </button>
          </div>

          {/* Right Action Icons & Cart */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Recent Orders Button */}
            {recentOrdersCount > 0 && (
              <button
                id="btn-header-order-history"
                onClick={onOpenHistory}
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all cursor-pointer"
                title="View recent orders & track status"
              >
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Orders</span>
                <span className="w-4 h-4 rounded-full bg-stone-800 text-white text-[10px] flex items-center justify-center">
                  {recentOrdersCount}
                </span>
              </button>
            )}

            {/* Cart Trigger Button */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              type="button"
              className={`flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer ${
                isFood
                  ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <div className="relative flex items-center">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span 
                    id="cart-badge-count"
                    className="absolute -top-2 -right-2 bg-stone-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse"
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[11px] font-medium opacity-80 hidden sm:inline">Cart</span>
                <span className="text-xs sm:text-sm font-bold">
                  {cartCount === 0 ? 'Empty' : formatCurrency(cartTotal)}
                </span>
              </div>
            </button>
          </div>

        </div>

        {/* Mobile Dual-Store Switcher & Search Row */}
        <div className="py-2.5 pb-3 flex flex-col sm:flex-row items-stretch gap-2.5">
          {/* Mobile Switcher */}
          <div 
            id="mobile-dual-store-switch" 
            className="flex md:hidden w-full p-1 bg-stone-100 rounded-xl border border-stone-200"
          >
            <button
              id="toggle-food-store-mobile"
              type="button"
              onClick={() => onSelectStoreMode('food')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all ${
                isFood
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500'
              }`}
            >
              <Utensils className={`w-3.5 h-3.5 ${isFood ? 'text-amber-500' : 'text-stone-400'}`} />
              <span>Food & Dining</span>
            </button>
            <button
              id="toggle-grocery-store-mobile"
              type="button"
              onClick={() => onSelectStoreMode('grocery')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all ${
                !isFood
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500'
              }`}
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${!isFood ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span>Supermarket</span>
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="main-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                isFood
                  ? 'Search dishes, burgers, pizza, ramen, desserts...'
                  : 'Search fresh vegetables, fruits, farm eggs, bakery...'
              }
              className="w-full pl-9 pr-8 py-2 text-sm bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-stone-800 placeholder-stone-400 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                id="btn-clear-search"
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
