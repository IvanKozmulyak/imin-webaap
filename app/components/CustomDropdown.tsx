'use client';

import { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  className = '',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue: string) => {
    if (!options.find(opt => opt.value === optionValue)?.disabled) {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const hasError = className?.includes('border-red-500');
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-[45px] px-5 rounded-[27px] border bg-white/5 backdrop-blur-[15px] text-white text-[13px] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${!selectedOption ? 'text-white/50' : ''} ${
          hasError ? 'border-red-500' : 'border-white/30'
        }`}
      >
        <span className="truncate">{displayValue}</span>
        <svg
          className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          width="21"
          height="21"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.4998 13.9999C10.615 14.0006 10.7291 13.9785 10.8358 13.935C10.9424 13.8914 11.0393 13.8273 11.1211 13.7462L16.3711 8.49617C16.5359 8.3314 16.6284 8.10793 16.6284 7.87492C16.6284 7.64191 16.5359 7.41844 16.3711 7.25367C16.2063 7.0889 15.9829 6.99634 15.7498 6.99634C15.5168 6.99634 15.2934 7.0889 15.1286 7.25367L10.4998 11.8912L5.87109 7.26242C5.7037 7.11907 5.48838 7.04417 5.26817 7.05267C5.04795 7.06118 4.83905 7.15247 4.68322 7.3083C4.52739 7.46413 4.4361 7.67303 4.42759 7.89325C4.41909 8.11346 4.49399 8.32878 4.63734 8.49617L9.88734 13.7462C10.0503 13.9078 10.2703 13.999 10.4998 13.9999Z"
            fill="white"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 rounded-[27px] border border-white bg-black/95 backdrop-blur-[15px] overflow-hidden shadow-lg">
          <div className="max-h-[200px] overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-5 py-3 text-white/50 text-[13px] text-center">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`w-full px-5 py-3 text-left text-[13px] font-medium transition-all ${
                    value === option.value
                      ? 'bg-white/20 text-white'
                      : option.disabled
                      ? 'text-white/30 cursor-not-allowed'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {required && !value && (
        <input
          type="text"
          value=""
          onChange={() => {}}
          required
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
