import React, { useState } from 'react';
import { Utensils, ShoppingBag } from 'lucide-react';
import { StoreMode } from '../types';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackStoreMode?: StoreMode;
  fallbackType?: StoreMode;
  fallbackText?: string;
  containerClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Product image',
  className = '',
  fallbackStoreMode,
  fallbackType,
  fallbackText,
  containerClassName = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const resolvedMode: StoreMode = fallbackType || fallbackStoreMode || 'food';

  if (!src || hasError) {
    const isFood = resolvedMode === 'food';
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-4 select-none ${
          isFood ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
        } ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-2xs ${
            isFood ? 'bg-amber-200/80 text-amber-900' : 'bg-emerald-200/80 text-emerald-900'
          }`}
        >
          {isFood ? <Utensils className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
        </div>
        <span className="text-xs font-bold text-center line-clamp-1 max-w-[85%]">
          {fallbackText || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${containerClassName}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-stone-100 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
};
