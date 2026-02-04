import { useDroppable } from '@dnd-kit/core';
import { PostingStatus, STATUS_LABELS } from '@/types';

interface CollapsedColumnProps {
  status: PostingStatus;
  count: number;
  onExpand: () => void;
  isOver?: boolean;
}

const COLLAPSED_COLORS: Record<PostingStatus, string> = {
  saved: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  applied: 'bg-green-100 text-green-800 border-green-200',
  interviewing: 'bg-purple-100 text-purple-800 border-purple-200',
  offer: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-gray-200 text-gray-700 border-gray-300',
  withdrawn: 'bg-gray-200 text-gray-700 border-gray-300',
};

const DROP_HIGHLIGHT_COLORS: Record<PostingStatus, string> = {
  saved: 'ring-blue-400',
  in_progress: 'ring-orange-400',
  applied: 'ring-green-400',
  interviewing: 'ring-purple-400',
  offer: 'ring-yellow-400',
  accepted: 'ring-emerald-400',
  rejected: 'ring-gray-400',
  withdrawn: 'ring-gray-400',
};

export function CollapsedColumn({ status, count, onExpand, isOver = false }: CollapsedColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full w-full flex-col items-center rounded-lg border transition-colors duration-200 ${
        COLLAPSED_COLORS[status]
      } ${isOver ? `ring-2 ${DROP_HIGHLIGHT_COLORS[status]}` : ''}`}
    >
      <button
        onClick={onExpand}
        className="flex h-full w-full flex-col items-center justify-center gap-2 py-3 hover:opacity-80"
        title={`Expand ${STATUS_LABELS[status]} column`}
      >
        {/* Vertical text */}
        <span
          className="text-xs font-medium"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          {STATUS_LABELS[status]}
        </span>

        {/* Count badge */}
        <span className="rounded-full bg-white bg-opacity-50 px-1.5 py-0.5 text-xs font-medium">
          {count}
        </span>

        {/* Expand icon */}
        <svg
          className="h-4 w-4 opacity-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
