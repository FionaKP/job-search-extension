interface DateRangePickerProps {
  fromDate: string | null;
  toDate: string | null;
  onFromChange: (date: string | null) => void;
  onToChange: (date: string | null) => void;
}

export function DateRangePicker({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
}: DateRangePickerProps) {
  const hasValue = fromDate !== null || toDate !== null;

  const handleClear = () => {
    onFromChange(null);
    onToChange(null);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-wine/70">Date added:</span>
      <input
        type="date"
        value={fromDate || ''}
        onChange={(e) => onFromChange(e.target.value || null)}
        className={`rounded-md border px-2 py-1.5 text-sm ${
          fromDate
            ? 'border-wine bg-champagne-50 text-wine'
            : 'border-sage/30 text-wine focus:border-wine focus:ring-1 focus:ring-wine'
        }`}
      />
      <span className="text-sm text-sage">to</span>
      <input
        type="date"
        value={toDate || ''}
        onChange={(e) => onToChange(e.target.value || null)}
        className={`rounded-md border px-2 py-1.5 text-sm ${
          toDate
            ? 'border-wine bg-champagne-50 text-wine'
            : 'border-sage/30 text-wine focus:border-wine focus:ring-1 focus:ring-wine'
        }`}
      />
      {hasValue && (
        <button
          onClick={handleClear}
          className="text-sage hover:text-wine"
          title="Clear date range"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
