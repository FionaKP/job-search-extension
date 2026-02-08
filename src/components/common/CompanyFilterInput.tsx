import { useState, useRef, useEffect } from 'react';

interface CompanyFilterInputProps {
  availableCompanies: string[];
  value: string;
  onChange: (value: string) => void;
}

export function CompanyFilterInput({
  availableCompanies,
  value,
  onChange,
}: CompanyFilterInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCompanies = availableCompanies
    .filter((company) => company.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 10);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectCompany = (company: string) => {
    setInputValue(company);
    onChange(company);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  };

  const hasValue = value.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Company..."
          className={`w-36 rounded-md border px-3 py-2 pr-8 text-sm ${
            hasValue
              ? 'border-wine bg-champagne-50 text-wine'
              : 'border-sage/30 text-wine focus:border-wine focus:ring-1 focus:ring-wine'
          }`}
        />
        {hasValue && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sage hover:text-wine"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && filteredCompanies.length > 0 && inputValue.length > 0 && (
        <div className="absolute left-0 z-20 mt-1 w-full rounded-md bg-white py-1 shadow-lg ring-1 ring-sage/20">
          <div className="max-h-48 overflow-y-auto">
            {filteredCompanies.map((company) => (
              <button
                key={company}
                onClick={() => handleSelectCompany(company)}
                className="w-full px-4 py-2 text-left text-sm text-wine hover:bg-champagne-50"
              >
                {company}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
