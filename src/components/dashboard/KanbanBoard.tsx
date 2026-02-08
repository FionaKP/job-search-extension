import { useState, useCallback, useRef, useEffect } from 'react';
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
import { Posting, PostingStatus, KANBAN_COLUMNS, Connection, InterestLevel } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { CollapsedColumn } from './CollapsedColumn';
import { PostingCard } from '@/components/posting';

interface KanbanBoardProps {
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, interest: InterestLevel) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  onAdd?: (status: PostingStatus) => void;
  collapsedColumns: PostingStatus[];
  onCollapseChange: (columns: PostingStatus[]) => void;
  getLinkedConnections?: (postingId: string) => Connection[];
  onConnectionClick?: (postingId: string) => void;
  selectedPostingId?: string | null;
}

// Default and min/max column widths
const DEFAULT_COLUMN_WIDTH = 280;
const MIN_COLUMN_WIDTH = 220;
const MAX_COLUMN_WIDTH = 500;

// Color mapping for collapsed tab vertical bar (folder effect)
const TAB_BG_COLORS: Record<PostingStatus, string> = {
  saved: 'bg-pandora',
  in_progress: 'bg-champagne-400',
  applied: 'bg-teal',
  interviewing: 'bg-wine',
  offer: 'bg-pandora-500',
  accepted: 'bg-teal-600',
  rejected: 'bg-flatred',
  withdrawn: 'bg-sage',
};

function getTopTabColor(status: PostingStatus | undefined): string {
  if (!status) return 'bg-sage/30';
  return TAB_BG_COLORS[status];
}

export function KanbanBoard({
  postings,
  onPostingSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
  onEdit,
  onAdd,
  collapsedColumns,
  onCollapseChange,
  getLinkedConnections,
  onConnectionClick,
  selectedPostingId,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Track recently animated columns for slide effects
  const [recentlyExpanded, setRecentlyExpanded] = useState<PostingStatus | null>(null);
  const [recentlyCollapsed, setRecentlyCollapsed] = useState<PostingStatus | null>(null);
  const [collapsingColumn, setCollapsingColumn] = useState<PostingStatus | null>(null);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<PostingStatus, number>>(() => {
    // Load saved widths from localStorage
    const saved = localStorage.getItem('kanban-column-widths');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to default
      }
    }
    return KANBAN_COLUMNS.reduce((acc, status) => {
      acc[status] = DEFAULT_COLUMN_WIDTH;
      return acc;
    }, {} as Record<PostingStatus, number>);
  });

  // Save column widths when they change
  useEffect(() => {
    localStorage.setItem('kanban-column-widths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // Resizing state
  const [resizingColumn, setResizingColumn] = useState<PostingStatus | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

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
      if (!collapsedColumns.includes(status) && collapsingColumn === null) {
        // Start slide-out animation on the column
        setCollapsingColumn(status);

        // After animation, actually collapse and show tab with slide-in
        setTimeout(() => {
          setCollapsingColumn(null);
          setRecentlyCollapsed(status);
          onCollapseChange([...collapsedColumns, status]);

          // Clear tab animation state
          setTimeout(() => setRecentlyCollapsed(null), 250);
        }, 200);
      }
    },
    [collapsedColumns, collapsingColumn, onCollapseChange]
  );

  const handleExpand = useCallback(
    (status: PostingStatus) => {
      setRecentlyExpanded(status);
      onCollapseChange(collapsedColumns.filter((s) => s !== status));
      // Clear animation state after animation completes
      setTimeout(() => setRecentlyExpanded(null), 200);
    },
    [collapsedColumns, onCollapseChange]
  );

  // Get collapsed columns in their original order
  const collapsedColumnsOrdered = KANBAN_COLUMNS.filter((s) => collapsedColumns.includes(s));
  const expandedColumns = KANBAN_COLUMNS.filter((s) => !collapsedColumns.includes(s));

  // Resize handlers
  const handleResizeStart = useCallback((status: PostingStatus, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(status);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[status];
  }, [columnWidths]);

  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX.current;
      const newWidth = Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, resizeStartWidth.current + delta));
      setColumnWidths((prev) => ({ ...prev, [resizingColumn]: newWidth }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full">
        {/* Main columns area */}
        <div className="flex flex-1 gap-3 overflow-x-auto p-4">
          {expandedColumns.map((status) => (
            <div
              key={status}
              className={`relative flex-shrink-0 group origin-right ${
                recentlyExpanded === status ? 'animate-slide-in-right' : ''
              } ${collapsingColumn === status ? 'animate-slide-out-right' : ''}`}
              style={{ width: columnWidths[status] }}
            >
              <KanbanColumn
                status={status}
                postings={getPostingsForStatus(status)}
                onPostingSelect={onPostingSelect}
                onPriorityChange={onPriorityChange}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onEdit={onEdit}
                onAdd={onAdd}
                onCollapse={() => handleCollapse(status)}
                isOver={overId === status}
                isDragging={activeId !== null}
                getLinkedConnections={getLinkedConnections}
                onConnectionClick={onConnectionClick}
                selectedPostingId={selectedPostingId}
                columnWidth={columnWidths[status]}
              />

              {/* Resize handle */}
              <div
                className={`absolute top-0 right-0 w-1 h-full cursor-col-resize
                  ${resizingColumn === status ? 'bg-flatred' : 'bg-transparent hover:bg-sage/50'}
                  transition-colors`}
                onMouseDown={(e) => handleResizeStart(status, e)}
              />
            </div>
          ))}
        </div>

        {/* Right-side fixed column tabs - always visible */}
        <div className="flex h-full flex-shrink-0">
          {/* Fixed tabs container - all columns have a slot */}
          <div className="flex flex-col w-12 h-full py-1">
            {KANBAN_COLUMNS.map((status) => {
              const isCollapsed = collapsedColumns.includes(status);
              return (
                <CollapsedColumn
                  key={status}
                  status={status}
                  count={getPostingsForStatus(status).length}
                  onExpand={() => handleExpand(status)}
                  onCollapse={() => handleCollapse(status)}
                  isOver={overId === status}
                  isAnimating={recentlyCollapsed === status}
                  isCollapsed={isCollapsed}
                />
              );
            })}
          </div>
          {/* Vertical color bar matching top-most collapsed tab (folder effect) */}
          <div className={`w-2.5 h-full transition-colors duration-200 ${getTopTabColor(collapsedColumnsOrdered[0])}`} />
        </div>
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
