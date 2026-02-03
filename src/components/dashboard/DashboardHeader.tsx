import { ViewMode } from '@/types';
import { SearchInput, FilterDropdown } from '@/components/common';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: 1 | 2 | 3 | null;
  onPriorityFilterChange: (priority: 1 | 2 | 3 | null) => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onAddClick: () => void;
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
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <h1 className="text-xl font-bold text-gray-900">JobFlow</h1>
      <div className="flex items-center gap-3">
        <div className="w-64">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search jobs..."
          />
        </div>
        <FilterDropdown
          label="Priority"
          options={priorityOptions}
          value={priorityFilter}
          onChange={onPriorityFilterChange}
        />
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
        <button
          onClick={onAddClick}
          className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
