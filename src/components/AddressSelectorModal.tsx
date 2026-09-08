import React, { useState, useEffect } from 'react';
import { sanitizeText } from '../utils/securityUtils';
import { X, MapPin, Check, Home, Briefcase, Navigation } from 'lucide-react';

interface AddressSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSaveAddress: (address: string) => void;
}

const SAVED_PRESETS = [
  { id: 'home', label: 'Home', address: '742 Evergreen Terrace, Apt 4B, Springfield', icon: Home },
  { id: 'work', label: 'Office HQ', address: 'Innovation Tower, 12th Floor, Tech Hub', icon: Briefcase },
  { id: 'parents', label: 'Lake Villa', address: '88 Whispering Pines Boulevard, Riverside', icon: MapPin },
];

export const AddressSelectorModal: React.FC<AddressSelectorModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onSaveAddress,
}) => {
  const [inputAddress, setInputAddress] = useState(currentAddress);

  useEffect(() => {
    if (!isOpen) return;
    setInputAddress(currentAddress);
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
  }, [isOpen, currentAddress, onClose]);

  if (!isOpen) return null;

  const handleSelectPreset = (addr: string) => {
    const cleanAddr = sanitizeText(addr, 200);
    setInputAddress(cleanAddr);
    onSaveAddress(cleanAddr);
    onClose();
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = sanitizeText(inputAddress, 200);
    if (cleanAddr) {
      onSaveAddress(cleanAddr);
      onClose();
    }
  };

  const handleUseCurrentLocation = () => {
    const loc = 'Current Location: 402 Lexington Ave, Midtown Central';
    setInputAddress(loc);
    onSaveAddress(loc);
    onClose();
  };

  return (
    <div
      id="address-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="address-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-stone-900 font-['Outfit'] text-base sm:text-lg">
              Select Delivery Address
            </h3>
          </div>
          <button
            id="btn-close-address-modal"
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Use current GPS location button */}
          <button
            id="btn-use-gps-location"
            type="button"
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-amber-600" />
            <span>Use Current Detected Location (Midtown Central)</span>
          </button>

          {/* Preset list */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Saved Locations
            </span>
            <div className="space-y-1.5">
              {SAVED_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isCurrent = currentAddress === preset.address;
                return (
                  <button
                    key={preset.id}
                    id={`btn-preset-address-${preset.id}`}
                    type="button"
                    onClick={() => handleSelectPreset(preset.address)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100/80 text-stone-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isCurrent ? 'text-amber-400' : 'text-stone-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs">{preset.label}</div>
                      <div className={`text-[11px] truncate ${isCurrent ? 'text-stone-300' : 'text-stone-500'}`}>
                        {preset.address}
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Address Input */}
          <form onSubmit={handleSaveCustom} className="space-y-3 pt-2 border-t border-stone-100">
            <label 
              htmlFor="input-custom-modal-address"
              className="text-xs font-bold uppercase tracking-wider text-stone-400 block"
            >
              Enter New Address
            </label>
            <input
              id="input-custom-modal-address"
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              placeholder="Type your street, apartment, landmark..."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-stone-400 focus:outline-none"
            />
            <button
              id="btn-save-custom-address"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Deliver to This Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
