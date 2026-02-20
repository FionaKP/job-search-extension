import { useDroppable } from '@dnd-kit/core';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Posting, PostingStatus, Connection, InterestLevel, VisualColumn, VisualColumnId } from '@/types';
import { DraggablePostingCard } from './DraggablePostingCard';

interface KanbanColumnProps {
  column: VisualColumn;
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, interest: InterestLevel) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  onAdd?: (status: PostingStatus) => void;
  onCollapse: () => void;
  isOver?: boolean;
  isDragging?: boolean;
  getLinkedConnections?: (postingId: string) => Connection[];
  onConnectionClick?: (postingId: string) => void;
  selectedPostingId?: string | null;
  columnWidth?: number;
  // Multi-select props
  isMultiSelectMode?: boolean;
  selectedPostingIds?: string[];
  onMultiSelect?: (id: string) => void;
}

// Vintage palette colors for each visual column
const COLUMN_COLORS: Record<VisualColumnId, string> = {
  saved: 'bg-champagne-50/50 border-sage/20',
  applied: 'bg-champagne-50/50 border-sage/20',
  interviewing: 'bg-champagne-50/50 border-sage/20',
  offer: 'bg-champagne-50/50 border-sage/20',
  rejected: 'bg-champagne-50/50 border-sage/20',
};

// Header background colors (solid color header)
const HEADER_BAR_COLORS: Record<VisualColumnId, string> = {
  saved: 'bg-pandora',
  applied: 'bg-teal',
  interviewing: 'bg-wine',
  offer: 'bg-champagne-400',
  rejected: 'bg-flatred',
};

const DROP_HIGHLIGHT_COLORS: Record<VisualColumnId, string> = {
  saved: 'ring-pandora bg-pandora-100',
  applied: 'ring-teal bg-teal-100',
  interviewing: 'ring-wine bg-wine-100',
  offer: 'ring-champagne-400 bg-champagne-100',
  rejected: 'ring-flatred bg-flatred-100',
};

export function KanbanColumn({
  column,
  postings,
  onPostingSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
  onEdit,
  onAdd,
  onCollapse,
  isOver = false,
  isDragging = false,
  getLinkedConnections,
  onConnectionClick,
  selectedPostingId,
  columnWidth,
  isMultiSelectMode,
  selectedPostingIds = [],
  onMultiSelect,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const isScrollable = el.scrollHeight > el.clientHeight;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    setHasMoreBelow(isScrollable && !isAtBottom);
  }, []);

  useEffect(() => {
    checkScroll();
    // Re-check when postings change
  }, [postings.length, checkScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Throttle scroll checks for better performance
    let ticking = false;
    const throttledCheck = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener('scroll', throttledCheck, { passive: true });
    window.addEventListener('resize', throttledCheck);

    return () => {
      el.removeEventListener('scroll', throttledCheck);
      window.removeEventListener('resize', throttledCheck);
    };
  }, [checkScroll]);

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full w-full flex-col rounded-lg border overflow-hidden transition-colors duration-200 ${
        COLUMN_COLORS[column.id]
      } ${isOver ? `ring-2 ${DROP_HIGHLIGHT_COLORS[column.id]}` : ''} ${
        isDragging && !isOver ? 'opacity-75' : ''
      }`}
    >
      {/* Solid color header */}
      <div className={`flex items-center justify-between px-3 py-2.5 ${HEADER_BAR_COLORS[column.id]}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onCollapse}
            className="btn btn-icon btn-ghost !h-6 !w-6 text-white/60 hover:text-white hover:bg-white/20"
            title={`Collapse ${column.label} column`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-medium text-white">{column.label}</h3>
        </div>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
          {postings.length}
        </span>
      </div>
      <div className="relative flex-1">
        <div
          ref={scrollRef}
          className="absolute inset-0 space-y-2 overflow-y-auto p-2 scrollbar-subtle"
        >
          {postings.map((posting) => (
            <DraggablePostingCard
              key={posting.id}
              posting={posting}
              onSelect={onPostingSelect}
              onPriorityChange={onPriorityChange}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onEdit={onEdit}
              linkedConnections={getLinkedConnections?.(posting.id)}
              onConnectionClick={() => onConnectionClick?.(posting.id)}
              isSelected={selectedPostingId === posting.id}
              columnWidth={columnWidth}
              isMultiSelectMode={isMultiSelectMode}
              isMultiSelected={selectedPostingIds.includes(posting.id)}
              onMultiSelect={onMultiSelect}
            />
          ))}
          {postings.length === 0 && (
            <div
              className={`rounded-lg border-2 border-dashed py-8 text-center text-sm transition-colors ${
                isOver ? 'border-sage bg-champagne-100 text-wine' : 'border-transparent text-wine/40'
              }`}
            >
              {isOver ? 'Drop here' : 'No postings'}
            </div>
          )}
        </div>

        {/* Scroll indicator - shows when there's more content below */}
        {hasMoreBelow && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1 pointer-events-none">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/80 shadow-sm border border-sage/20">
              <svg className="w-3 h-3 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Ghost add button at bottom */}
      {onAdd && (
        <button
          onClick={() => onAdd(column.primaryStatus)}
          className="group flex items-center justify-center gap-1.5 border-t border-sage/20 bg-white/50 px-3 py-2 text-sm text-wine/30 transition-all hover:bg-champagne-50 hover:text-wine/60 rounded-b-lg"
        >
          <svg className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">Add posting</span>
        </button>
      )}
    </div>
  );
}
