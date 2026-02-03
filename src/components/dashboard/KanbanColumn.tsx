import { Posting, PostingStatus, STATUS_LABELS } from '@/types';
import { PostingCard } from '@/components/posting';

interface KanbanColumnProps {
  status: PostingStatus;
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, priority: 1 | 2 | 3) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
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

export function KanbanColumn({
  status,
  postings,
  onPostingSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
}: KanbanColumnProps) {
  return (
    <div className={`flex h-full w-72 flex-shrink-0 flex-col rounded-lg border ${COLUMN_COLORS[status]}`}>
      <div className={`flex items-center justify-between rounded-t-lg px-3 py-2 ${HEADER_COLORS[status]}`}>
        <h3 className="font-medium">{STATUS_LABELS[status]}</h3>
        <span className="rounded-full bg-white bg-opacity-50 px-2 py-0.5 text-sm font-medium">
          {postings.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {postings.map((posting) => (
          <PostingCard
            key={posting.id}
            posting={posting}
            onSelect={onPostingSelect}
            onPriorityChange={onPriorityChange}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            variant="kanban"
          />
        ))}
        {postings.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">No postings</div>
        )}
      </div>
    </div>
  );
}
