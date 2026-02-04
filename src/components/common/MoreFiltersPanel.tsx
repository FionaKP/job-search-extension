import { useState, useRef, useEffect } from 'react';
import { DateRangePicker } from './DateRangePicker';

interface MoreFiltersPanelProps {
  dateFrom: string | null;
  dateTo: string | null;
  hasDeadline: boolean;
  deadlineSoon: boolean;
  needsAction: boolean;
  onDateFromChange: (date: string | null) => void;
  onDateToChange: (date: string | null) => void;
  onHasDeadlineChange: (value: boolean) => void;
  onDeadlineSoonChange: (value: boolean) => void;
  onNeedsActionChange: (value: boolean) => void;
  onClearAll: () => void;
}

export function MoreFiltersPanel({
  dateFrom,
  dateTo,
  hasDeadline,
  deadlineSoon,
  needsAction,
  onDateFromChange,
  onDateToChange,
  onHasDeadlineChange,
  onDeadlineSoonChange,
  onNeedsActionChange,
  onClearAll,
}: MoreFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCount = [
    dateFrom !== null || dateTo !== null,
    hasDeadline,
    deadlineSoon,
    needsAction,
  ].filter(Boolean).length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
          activeCount > 0
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>More Filters</span>
        {activeCount > 0 && (
          <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
            {activeCount}
          </span>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-96 rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="space-y-4">
            {/* Date Range */}
            <DateRangePicker
              fromDate={dateFrom}
              toDate={dateTo}
              onFromChange={onDateFromChange}
              onToChange={onDateToChange}
            />

            {/* Checkbox Filters */}
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasDeadline}
                  onChange={(e) => onHasDeadlineChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Has deadline</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={deadlineSoon}
                  onChange={(e) => onDeadlineSoonChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Deadline within 7 days</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={needsAction}
                  onChange={(e) => onNeedsActionChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Needs action (stale)</span>
              </label>
            </div>

            {/* Clear All */}
            {activeCount > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <button
                  onClick={() => {
                    onClearAll();
                    setIsOpen(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
