import { useState, useCallback, useMemo, memo } from 'react';
import type { ListChildComponentProps } from 'react-window';
import { FixedSizeList as List } from 'react-window';
import { Posting, PostingStatus, Connection, InterestLevel } from '@/types';
import { PostingCard } from '@/components/posting';

interface VirtualizedListViewProps {
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, interest: InterestLevel) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  getLinkedConnections?: (postingId: string) => Connection[];
  onConnectionClick?: (postingId: string) => void;
  // Multi-select props
  isMultiSelectMode?: boolean;
  selectedPostingIds?: string[];
  onMultiSelect?: (id: string) => void;
  // Container dimensions
  height: number;
  width: number;
}

type SortField = 'title' | 'company' | 'dateAdded' | 'priority' | 'status' | 'location';
type SortDirection = 'asc' | 'desc';

const ROW_HEIGHT = 64; // Height of each row in pixels

// Memoized row component for better performance
const Row = memo(function Row({
  data,
  index,
  style
}: ListChildComponentProps<{
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, interest: InterestLevel) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  getLinkedConnections?: (postingId: string) => Connection[];
  onConnectionClick?: (postingId: string) => void;
  isMultiSelectMode?: boolean;
  selectedPostingIds: string[];
  onMultiSelect?: (id: string) => void;
}>) {
  const {
    postings,
    onPostingSelect,
    onPriorityChange,
    onStatusChange,
    onDelete,
    getLinkedConnections,
    onConnectionClick,
    isMultiSelectMode,
    selectedPostingIds,
    onMultiSelect
  } = data;

  const posting = postings[index];

  if (!posting) return null;

  return (
    <div style={style} className="border-b border-sage/10">
      <PostingCard
        posting={posting}
        onSelect={onPostingSelect}
        onPriorityChange={onPriorityChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        variant="list"
        linkedConnections={getLinkedConnections?.(posting.id)}
        onConnectionClick={() => onConnectionClick?.(posting.id)}
        isMultiSelectMode={isMultiSelectMode}
        isMultiSelected={selectedPostingIds.includes(posting.id)}
        onMultiSelect={onMultiSelect}
      />
    </div>
  );
});

export const VirtualizedListView = memo(function VirtualizedListView({
  postings,
  onPostingSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
  getLinkedConnections,
  onConnectionClick,
  isMultiSelectMode,
  selectedPostingIds = [],
  onMultiSelect,
  height,
  width,
}: VirtualizedListViewProps) {
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const sortedPostings = useMemo(() => {
    return [...postings].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'company':
          comparison = a.company.localeCompare(b.company);
          break;
        case 'location':
          comparison = (a.location || '').localeCompare(b.location || '');
          break;
        case 'dateAdded':
          comparison = a.dateAdded - b.dateAdded;
          break;
        case 'priority':
          comparison = a.interest - b.interest;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [postings, sortField, sortDirection]);

  const itemData = useMemo(() => ({
    postings: sortedPostings,
    onPostingSelect,
    onPriorityChange,
    onStatusChange,
    onDelete,
    getLinkedConnections,
    onConnectionClick,
    isMultiSelectMode,
    selectedPostingIds,
    onMultiSelect,
  }), [
    sortedPostings,
    onPostingSelect,
    onPriorityChange,
    onStatusChange,
    onDelete,
    getLinkedConnections,
    onConnectionClick,
    isMultiSelectMode,
    selectedPostingIds,
    onMultiSelect,
  ]);

  const SortHeader = useCallback(({ field, label, className = '' }: { field: SortField; label: string; className?: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wide text-wine/50 transition-colors hover:text-wine ${className}`}
    >
      {label}
      <svg
        className={`h-3 w-3 transition-transform ${sortField === field ? 'opacity-100' : 'opacity-0'} ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  ), [handleSort, sortField, sortDirection]);

  const headerHeight = 45;
  const listHeight = height - headerHeight;

  return (
    <div className="h-full">
      {/* Table Header */}
      <div className="sticky top-0 z-10 border-b border-sage/30 bg-champagne-50/95 backdrop-blur-sm">
        <div className="flex items-center px-4 py-2.5">
          {/* Logo spacer */}
          <div className="w-12 flex-shrink-0" />
          {/* Title & Company */}
          <div className="min-w-[200px] flex-1 pr-4">
            <SortHeader field="title" label="Position" />
          </div>
          {/* Location */}
          <div className="w-[120px] flex-shrink-0 px-2">
            <SortHeader field="location" label="Location" />
          </div>
          {/* Status */}
          <div className="w-[100px] flex-shrink-0 px-2">
            <SortHeader field="status" label="Status" />
          </div>
          {/* Tags */}
          <div className="w-[140px] flex-shrink-0 px-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-wine/50">Tags</span>
          </div>
          {/* Priority */}
          <div className="w-[70px] flex-shrink-0 px-2">
            <SortHeader field="priority" label="Priority" />
          </div>
          {/* Updated */}
          <div className="w-[50px] flex-shrink-0 px-2 text-right">
            <SortHeader field="dateAdded" label="Updated" className="justify-end" />
          </div>
          {/* Connections spacer */}
          <div className="w-[36px] flex-shrink-0" />
        </div>
      </div>

      {/* Virtualized Table Body */}
      {sortedPostings.length > 0 ? (
        <List
          height={listHeight}
          width={width}
          itemCount={sortedPostings.length}
          itemSize={ROW_HEIGHT}
          itemData={itemData}
          overscanCount={5}
        >
          {Row}
        </List>
      ) : (
        <div className="py-16 text-center">
          <div className="text-wine/40 text-sm">No postings found</div>
          <div className="text-wine/30 text-xs mt-1">Try adjusting your filters</div>
        </div>
      )}
    </div>
  );
});

export default VirtualizedListView;
