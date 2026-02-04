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
      <span className="text-sm text-gray-600">Date added:</span>
      <input
        type="date"
        value={fromDate || ''}
        onChange={(e) => onFromChange(e.target.value || null)}
        className={`rounded-md border px-2 py-1.5 text-sm ${
          fromDate
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
        }`}
      />
      <span className="text-sm text-gray-500">to</span>
      <input
        type="date"
        value={toDate || ''}
        onChange={(e) => onToChange(e.target.value || null)}
        className={`rounded-md border px-2 py-1.5 text-sm ${
          toDate
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
        }`}
      />
      {hasValue && (
        <button
          onClick={handleClear}
          className="text-gray-400 hover:text-gray-600"
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
