import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Posting, PostingStatus, KANBAN_COLUMNS } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { CollapsedColumn } from './CollapsedColumn';
import { PostingCard } from '@/components/posting';

interface KanbanBoardProps {
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, priority: 1 | 2 | 3) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  collapsedColumns: PostingStatus[];
  onCollapseChange: (columns: PostingStatus[]) => void;
}

export function KanbanBoard({
  postings,
  onPostingSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
  collapsedColumns,
  onCollapseChange,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Configure sensors for both pointer and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getPostingsForStatus = (status: PostingStatus): Posting[] => {
    return postings.filter((p) => p.status === status);
  };

  const activePosting = activeId ? postings.find((p) => p.id === activeId) : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setOverId(null);

      if (!over) return;

      const postingId = active.id as string;
      const newStatus = over.id as PostingStatus;

      // Only update if dropping on a valid status column
      if (KANBAN_COLUMNS.includes(newStatus)) {
        const posting = postings.find((p) => p.id === postingId);
        if (posting && posting.status !== newStatus) {
          onStatusChange(postingId, newStatus);
        }
      }
    },
    [postings, onStatusChange]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  const handleCollapse = useCallback(
    (status: PostingStatus) => {
      if (!collapsedColumns.includes(status)) {
        onCollapseChange([...collapsedColumns, status]);
      }
    },
    [collapsedColumns, onCollapseChange]
  );

  const handleExpand = useCallback(
    (status: PostingStatus) => {
      onCollapseChange(collapsedColumns.filter((s) => s !== status));
    },
    [collapsedColumns, onCollapseChange]
  );

  const isCollapsed = (status: PostingStatus) => collapsedColumns.includes(status);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {KANBAN_COLUMNS.map((status) => (
          <div
            key={status}
            className="flex-shrink-0 transition-all duration-300 ease-in-out"
            style={{ width: isCollapsed(status) ? '48px' : '288px' }}
          >
            {isCollapsed(status) ? (
              <CollapsedColumn
                status={status}
                count={getPostingsForStatus(status).length}
                onExpand={() => handleExpand(status)}
                isOver={overId === status}
              />
            ) : (
              <KanbanColumn
                status={status}
                postings={getPostingsForStatus(status)}
                onPostingSelect={onPostingSelect}
                onPriorityChange={onPriorityChange}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onCollapse={() => handleCollapse(status)}
                isOver={overId === status}
                isDragging={activeId !== null}
              />
            )}
          </div>
        ))}
      </div>

      {/* Drag Overlay - shows card preview while dragging */}
      <DragOverlay dropAnimation={null}>
        {activePosting ? (
          <div className="rotate-3 opacity-90">
            <PostingCard
              posting={activePosting}
              onSelect={() => {}}
              onPriorityChange={() => {}}
              onStatusChange={() => {}}
              onDelete={() => {}}
              variant="kanban"
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
