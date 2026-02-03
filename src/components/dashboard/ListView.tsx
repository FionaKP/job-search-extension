import { useState } from 'react';
import { Posting, PostingStatus } from '@/types';
import { PostingCard } from '@/components/posting';

interface ListViewProps {
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, priority: 1 | 2 | 3) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
}

type SortField = 'title' | 'company' | 'dateAdded' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

export function ListView({
  postings,
  onPostingSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
}: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPostings = [...postings].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'company':
        comparison = a.company.localeCompare(b.company);
        break;
      case 'dateAdded':
        comparison = a.dateAdded - b.dateAdded;
        break;
      case 'priority':
        comparison = a.priority - b.priority;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
    >
      {label}
      {sortField === field && (
        <svg className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="h-full overflow-auto">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="w-10" />
        <div className="min-w-0 flex-1">
          <SortHeader field="title" label="Title / Company" />
        </div>
        <div className="w-32">
          <SortHeader field="status" label="Status" />
        </div>
        <div className="w-24">
          <SortHeader field="priority" label="Priority" />
        </div>
        <div className="w-16">
          <SortHeader field="dateAdded" label="Added" />
        </div>
      </div>
      <div>
        {sortedPostings.map((posting) => (
          <PostingCard
            key={posting.id}
            posting={posting}
            onSelect={onPostingSelect}
            onPriorityChange={onPriorityChange}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            variant="list"
          />
        ))}
        {postings.length === 0 && (
          <div className="py-12 text-center text-gray-500">No postings found</div>
        )}
      </div>
    </div>
  );
}
