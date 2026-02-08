import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Posting, PostingStatus, Connection, InterestLevel } from '@/types';
import { PostingCard } from '@/components/posting';

interface DraggablePostingCardProps {
  posting: Posting;
  onSelect: (id: string) => void;
  onPriorityChange: (id: string, interest: InterestLevel) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  linkedConnections?: Connection[];
  onConnectionClick?: () => void;
  isSelected?: boolean;
  columnWidth?: number;
}

export function DraggablePostingCard({
  posting,
  onSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
  onEdit,
  linkedConnections,
  onConnectionClick,
  isSelected,
  columnWidth,
}: DraggablePostingCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: posting.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`touch-none ${isDragging ? 'opacity-50' : ''}`}
    >
      <PostingCard
        posting={posting}
        onSelect={onSelect}
        onPriorityChange={onPriorityChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onEdit={onEdit}
        variant="kanban"
        linkedConnections={linkedConnections}
        onConnectionClick={onConnectionClick}
        isSelected={isSelected}
        columnWidth={columnWidth}
      />
    </div>
  );
}
