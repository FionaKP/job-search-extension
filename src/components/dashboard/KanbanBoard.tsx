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
import { Posting, PostingStatus, VISUAL_COLUMNS, VisualColumn, VisualColumnId, Connection, InterestLevel } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { CollapsedColumn } from './CollapsedColumn';
import { WithdrawnDrawer } from './WithdrawnDrawer';
import { PostingCard } from '@/components/posting';

interface KanbanBoardProps {
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, interest: InterestLevel) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  onAdd?: (status: PostingStatus) => void;
  collapsedColumns: VisualColumnId[];
  onCollapseChange: (columns: VisualColumnId[]) => void;
  getLinkedConnections?: (postingId: string) => Connection[];
  onConnectionClick?: (postingId: string) => void;
  selectedPostingId?: string | null;
  // Multi-select props
  isMultiSelectMode?: boolean;
  selectedPostingIds?: string[];
  onMultiSelect?: (id: string) => void;
}

// Default and min/max column widths
const DEFAULT_COLUMN_WIDTH = 280;
const MIN_COLUMN_WIDTH = 220;
const MAX_COLUMN_WIDTH = 500;

// Color mapping for collapsed tab vertical bar (folder effect)
const TAB_BG_COLORS: Record<VisualColumnId, string> = {
  saved: 'bg-pandora',
  applied: 'bg-teal',
  interviewing: 'bg-wine',
  offer: 'bg-champagne-400',
  rejected: 'bg-flatred',
};

function getTopTabColor(columnId: VisualColumnId | undefined): string {
  if (!columnId) return 'bg-sage/30';
  return TAB_BG_COLORS[columnId];
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
  isMultiSelectMode,
  selectedPostingIds = [],
  onMultiSelect,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Track recently animated columns for slide effects
  const [recentlyExpanded, setRecentlyExpanded] = useState<VisualColumnId | null>(null);
  const [recentlyCollapsed, setRecentlyCollapsed] = useState<VisualColumnId | null>(null);
  const [collapsingColumn, setCollapsingColumn] = useState<VisualColumnId | null>(null);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<VisualColumnId, number>>(() => {
    // Load saved widths from localStorage
    const saved = localStorage.getItem('kanban-column-widths-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to default
      }
    }
    return VISUAL_COLUMNS.reduce((acc, col) => {
      acc[col.id] = DEFAULT_COLUMN_WIDTH;
      return acc;
    }, {} as Record<VisualColumnId, number>);
  });

  // Save column widths when they change
  useEffect(() => {
    localStorage.setItem('kanban-column-widths-v2', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // Resizing state
  const [resizingColumn, setResizingColumn] = useState<VisualColumnId | null>(null);
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

  // Get postings for a visual column (may include multiple statuses)
  const getPostingsForColumn = (column: VisualColumn): Posting[] => {
    return postings.filter((p) => column.statuses.includes(p.status));
  };

  // Get withdrawn postings
  const withdrawnPostings = postings.filter((p) => p.status === 'withdrawn');

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
      const dropId = over.id as string;

      // Parse the column from the droppable ID
      // IDs can be:
      // - 'columnId' (from KanbanColumn) -> use primaryStatus
      // - 'collapsed-columnId' (from CollapsedColumn) -> use primaryStatus
      // - 'withdrawn' (from WithdrawnDrawer) -> set to withdrawn
      let newStatus: PostingStatus | null = null;

      // Check if dropped on withdrawn drawer
      if (dropId === 'withdrawn') {
        newStatus = 'withdrawn';
      } else {
        // Find the visual column by ID
        const columnId = dropId.startsWith('collapsed-')
          ? dropId.replace('collapsed-', '')
          : dropId;

        const column = VISUAL_COLUMNS.find((c) => c.id === columnId);
        if (column) {
          newStatus = column.primaryStatus;
        }
      }

      // Only update if dropping on a valid column
      if (newStatus) {
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
    (columnId: VisualColumnId) => {
      if (!collapsedColumns.includes(columnId) && collapsingColumn === null) {
        // Start slide-out animation on the column
        setCollapsingColumn(columnId);

        // After animation, actually collapse and show tab with slide-in
        setTimeout(() => {
          setCollapsingColumn(null);
          setRecentlyCollapsed(columnId);
          onCollapseChange([...collapsedColumns, columnId]);

          // Clear tab animation state
          setTimeout(() => setRecentlyCollapsed(null), 250);
        }, 200);
      }
    },
    [collapsedColumns, collapsingColumn, onCollapseChange]
  );

  const handleExpand = useCallback(
    (columnId: VisualColumnId) => {
      setRecentlyExpanded(columnId);
      onCollapseChange(collapsedColumns.filter((id) => id !== columnId));
      // Clear animation state after animation completes
      setTimeout(() => setRecentlyExpanded(null), 200);
    },
    [collapsedColumns, onCollapseChange]
  );

  // Get collapsed and expanded columns
  const collapsedColumnsOrdered = VISUAL_COLUMNS.filter((c) => collapsedColumns.includes(c.id));
  const expandedColumns = VISUAL_COLUMNS.filter((c) => !collapsedColumns.includes(c.id));

  // Resize handlers
  const handleResizeStart = useCallback((columnId: VisualColumnId, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnId);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[columnId];
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
          {expandedColumns.map((column) => (
            <div
              key={column.id}
              className={`relative flex-shrink-0 group origin-right ${
                recentlyExpanded === column.id ? 'animate-slide-in-right' : ''
              } ${collapsingColumn === column.id ? 'animate-slide-out-right' : ''}`}
              style={{ width: columnWidths[column.id] }}
            >
              <KanbanColumn
                column={column}
                postings={getPostingsForColumn(column)}
                onPostingSelect={onPostingSelect}
                onPriorityChange={onPriorityChange}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onEdit={onEdit}
                onAdd={onAdd}
                onCollapse={() => handleCollapse(column.id)}
                isOver={overId === column.id}
                isDragging={activeId !== null}
                getLinkedConnections={getLinkedConnections}
                onConnectionClick={onConnectionClick}
                selectedPostingId={selectedPostingId}
                columnWidth={columnWidths[column.id]}
                isMultiSelectMode={isMultiSelectMode}
                selectedPostingIds={selectedPostingIds}
                onMultiSelect={onMultiSelect}
              />

              {/* Resize handle */}
              <div
                className={`absolute top-0 right-0 w-1 h-full cursor-col-resize
                  ${resizingColumn === column.id ? 'bg-flatred' : 'bg-transparent hover:bg-sage/50'}
                  transition-colors`}
                onMouseDown={(e) => handleResizeStart(column.id, e)}
              />
            </div>
          ))}
        </div>

        {/* Right-side fixed column tabs - always visible */}
        <div className="flex h-full flex-shrink-0">
          {/* Fixed tabs container - all columns have a slot */}
          <div className="flex flex-col w-12 h-full py-1">
            {VISUAL_COLUMNS.map((column) => {
              const isCollapsed = collapsedColumns.includes(column.id);
              return (
                <CollapsedColumn
                  key={column.id}
                  column={column}
                  count={getPostingsForColumn(column).length}
                  onExpand={() => handleExpand(column.id)}
                  onCollapse={() => handleCollapse(column.id)}
                  isOver={overId === `collapsed-${column.id}`}
                  isAnimating={recentlyCollapsed === column.id}
                  isCollapsed={isCollapsed}
                />
              );
            })}

            {/* Withdrawn drawer - at bottom of tabs column */}
            <WithdrawnDrawer
              postings={withdrawnPostings}
              onPostingSelect={onPostingSelect}
              onPriorityChange={onPriorityChange}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              getLinkedConnections={getLinkedConnections}
              onConnectionClick={onConnectionClick}
              isOver={overId === 'withdrawn'}
            />
          </div>
          {/* Vertical color bar matching top-most collapsed tab (folder effect) */}
          <div className={`w-2.5 h-full transition-colors duration-200 ${getTopTabColor(collapsedColumnsOrdered[0]?.id)}`} />
        </div>
      </div>

      {/* Drag Overlay - shows card preview while dragging */}
      <DragOverlay dropAnimation={null}>
        {activePosting ? (
          <div
            className={`
              transition-all duration-300 ease-out
              ${overId === 'withdrawn'
                ? 'rotate-6 scale-95 opacity-75'
                : 'rotate-3 opacity-90'
              }
            `}
          >
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
