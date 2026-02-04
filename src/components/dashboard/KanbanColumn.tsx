import { useDroppable } from '@dnd-kit/core';
import { Posting, PostingStatus, STATUS_LABELS } from '@/types';
import { DraggablePostingCard } from './DraggablePostingCard';

interface KanbanColumnProps {
  status: PostingStatus;
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, priority: 1 | 2 | 3) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  onCollapse: () => void;
  isOver?: boolean;
  isDragging?: boolean;
}

const COLUMN_COLORS: Record<PostingStatus, string> = {
  saved: 'bg-blue-50 border-blue-200',
  in_progress: 'bg-orange-50 border-orange-200',
  applied: 'bg-green-50 border-green-200',
  interviewing: 'bg-purple-50 border-purple-200',
  offer: 'bg-yellow-50 border-yellow-200',
  accepted: 'bg-emerald-50 border-emerald-200',
  rejected: 'bg-gray-50 border-gray-300',
  withdrawn: 'bg-gray-50 border-gray-300',
};

const HEADER_COLORS: Record<PostingStatus, string> = {
  saved: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  applied: 'bg-green-100 text-green-800',
  interviewing: 'bg-purple-100 text-purple-800',
  offer: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-gray-200 text-gray-700',
  withdrawn: 'bg-gray-200 text-gray-700',
};

const DROP_HIGHLIGHT_COLORS: Record<PostingStatus, string> = {
  saved: 'ring-blue-400 bg-blue-100',
  in_progress: 'ring-orange-400 bg-orange-100',
  applied: 'ring-green-400 bg-green-100',
  interviewing: 'ring-purple-400 bg-purple-100',
  offer: 'ring-yellow-400 bg-yellow-100',
  accepted: 'ring-emerald-400 bg-emerald-100',
  rejected: 'ring-gray-400 bg-gray-200',
  withdrawn: 'ring-gray-400 bg-gray-200',
};

export function KanbanColumn({
  status,
  postings,
  onPostingSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
  onCollapse,
  isOver = false,
  isDragging = false,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full w-full flex-col rounded-lg border transition-colors duration-200 ${
        COLUMN_COLORS[status]
      } ${isOver ? `ring-2 ${DROP_HIGHLIGHT_COLORS[status]}` : ''} ${
        isDragging && !isOver ? 'opacity-75' : ''
      }`}
    >
      <div className={`flex items-center justify-between rounded-t-lg px-3 py-2 ${HEADER_COLORS[status]}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onCollapse}
            className="rounded p-0.5 opacity-60 hover:bg-black hover:bg-opacity-10 hover:opacity-100"
            title={`Collapse ${STATUS_LABELS[status]} column`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-medium">{STATUS_LABELS[status]}</h3>
        </div>
        <span className="rounded-full bg-white bg-opacity-50 px-2 py-0.5 text-sm font-medium">
          {postings.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {postings.map((posting) => (
          <DraggablePostingCard
            key={posting.id}
            posting={posting}
            onSelect={onPostingSelect}
            onPriorityChange={onPriorityChange}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
        {postings.length === 0 && (
          <div
            className={`rounded-lg border-2 border-dashed py-8 text-center text-sm transition-colors ${
              isOver ? 'border-gray-400 bg-gray-100 text-gray-600' : 'border-transparent text-gray-400'
            }`}
          >
            {isOver ? 'Drop here' : 'No postings'}
          </div>
        )}
      </div>
    </div>
  );
}
