import { useState, useRef, useEffect, MutableRefObject } from 'react';
import { ViewMode, PostingStatus, STATUS_LABELS, KANBAN_COLUMNS } from '@/types';
import {
  SearchInput,
  FilterDropdown,
  ExportButton,
  ImportButton,
  TagFilterDropdown,
  CompanyFilterInput,
  MoreFiltersPanel,
} from '@/components/common';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: 1 | 2 | 3 | null;
  onPriorityFilterChange: (priority: 1 | 2 | 3 | null) => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onAddClick: () => void;
  // Advanced filters
  availableTags: string[];
  availableCompanies: string[];
  tagFilters: string[];
  onTagFiltersChange: (tags: string[]) => void;
  companyFilter: string;
  onCompanyFilterChange: (company: string) => void;
  dateFrom: string | null;
  dateTo: string | null;
  onDateFromChange: (date: string | null) => void;
  onDateToChange: (date: string | null) => void;
  hasDeadline: boolean;
  deadlineSoon: boolean;
  needsAction: boolean;
  hasConnections: boolean;
  noConnections: boolean;
  onHasDeadlineChange: (value: boolean) => void;
  onDeadlineSoonChange: (value: boolean) => void;
  onNeedsActionChange: (value: boolean) => void;
  onHasConnectionsChange: (value: boolean) => void;
  onNoConnectionsChange: (value: boolean) => void;
  onClearAllFilters: () => void;
  activeFilterCount: number;
  // Keyboard shortcuts
  searchInputRef?: MutableRefObject<HTMLInputElement | null>;
  statusFilter: PostingStatus | null;
  onStatusFilterChange: (status: PostingStatus | null) => void;
}

const priorityOptions = [
  { value: 3 as const, label: 'High Priority' },
  { value: 2 as const, label: 'Medium Priority' },
  { value: 1 as const, label: 'Low Priority' },
];

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  currentView,
  onViewChange,
  onAddClick,
  // Advanced filters
  availableTags,
  availableCompanies,
  tagFilters,
  onTagFiltersChange,
  companyFilter,
  onCompanyFilterChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  hasDeadline,
  deadlineSoon,
  needsAction,
  hasConnections,
  noConnections,
  onHasDeadlineChange,
  onDeadlineSoonChange,
  onNeedsActionChange,
  onHasConnectionsChange,
  onNoConnectionsChange,
  onClearAllFilters,
  activeFilterCount,
  // Keyboard shortcuts
  searchInputRef,
  statusFilter,
  onStatusFilterChange,
}: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <h1 className="text-xl font-bold text-gray-900">JobFlow</h1>
      <div className="flex items-center gap-3">
        <div className="w-64">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search jobs... (Press /)"
            inputRef={searchInputRef}
          />
        </div>
        <FilterDropdown
          label="Priority"
          options={priorityOptions}
          value={priorityFilter}
          onChange={onPriorityFilterChange}
        />
        <FilterDropdown
          label="Status"
          options={KANBAN_COLUMNS.map((status) => ({
            value: status,
            label: STATUS_LABELS[status],
          }))}
          value={statusFilter}
          onChange={onStatusFilterChange}
        />
        <TagFilterDropdown
          availableTags={availableTags}
          selectedTags={tagFilters}
          onChange={onTagFiltersChange}
        />
        <CompanyFilterInput
          availableCompanies={availableCompanies}
          value={companyFilter}
          onChange={onCompanyFilterChange}
        />
        <MoreFiltersPanel
          dateFrom={dateFrom}
          dateTo={dateTo}
          hasDeadline={hasDeadline}
          deadlineSoon={deadlineSoon}
          needsAction={needsAction}
          hasConnections={hasConnections}
          noConnections={noConnections}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
          onHasDeadlineChange={onHasDeadlineChange}
          onDeadlineSoonChange={onDeadlineSoonChange}
          onNeedsActionChange={onNeedsActionChange}
          onHasConnectionsChange={onHasConnectionsChange}
          onNoConnectionsChange={onNoConnectionsChange}
          onClearAll={onClearAllFilters}
        />
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAllFilters}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all ({activeFilterCount})
          </button>
        )}
        <div className="flex rounded-md border border-gray-300">
          <button
            onClick={() => onViewChange('kanban')}
            className={`px-3 py-2 text-sm ${
              currentView === 'kanban'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="Kanban view"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`border-l border-gray-300 px-3 py-2 text-sm ${
              currentView === 'list'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="List view"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Settings Menu with Export/Import */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
            title="Settings (? for shortcuts)"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
              <ExportButton
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              />
              <ImportButton
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onImportComplete={() => setMenuOpen(false)}
              />
            </div>
          )}
        </div>

        <button
          onClick={onAddClick}
          className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          title="Add new posting (N)"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>
    </header>
  );
}
