import { Posting, PostingStatus, KANBAN_COLUMNS } from '@/types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, priority: 1 | 2 | 3) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
}

export function KanbanBoard({
  postings,
  onPostingSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
}: KanbanBoardProps) {
  const getPostingsForStatus = (status: PostingStatus): Posting[] => {
    return postings.filter((p) => p.status === status);
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4">
      {KANBAN_COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          postings={getPostingsForStatus(status)}
          onPostingSelect={onPostingSelect}
          onPriorityChange={onPriorityChange}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
