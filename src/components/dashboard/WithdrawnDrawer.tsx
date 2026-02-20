import { useState, useCallback, useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Posting, PostingStatus, Connection, InterestLevel } from '@/types';
import { PostingCard } from '@/components/posting';

interface WithdrawnDrawerProps {
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, interest: InterestLevel) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  getLinkedConnections?: (postingId: string) => Connection[];
  onConnectionClick?: (postingId: string) => void;
  // Drag-over state from parent
  isOver?: boolean;
}

export function WithdrawnDrawer({
  postings,
  onPostingSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
  getLinkedConnections,
  onConnectionClick,
  isOver: isOverProp = false,
}: WithdrawnDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimatingDrop, setIsAnimatingDrop] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Make the drawer droppable
  const { setNodeRef, isOver: isOverLocal } = useDroppable({
    id: 'withdrawn',
  });

  // Use either local or prop isOver
  const isOver = isOverProp || isOverLocal;

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Show visual feedback when dragging over
  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Trigger drop animation effect
  const triggerDropAnimation = useCallback(() => {
    setIsAnimatingDrop(true);
    setTimeout(() => {
      setIsAnimatingDrop(false);
    }, 400);
  }, []);

  // Watch for isOver changes to trigger animation
  useEffect(() => {
    if (isOver) {
      triggerDropAnimation();
    }
  }, [isOver, triggerDropAnimation]);

  return (
    <div ref={drawerRef} className="relative flex-shrink-0 mt-auto mb-1">
      {/* Large pop-out box when dragging over - aligned to bottom-right with padding */}
      <div
        className={`
          fixed rounded-xl pointer-events-none
          border-4 border-sage-700
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${isOver
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-75'
          }
        `}
        style={{
          width: '200px',
          height: '160px',
          bottom: '16px',
          right: '16px',
          transform: isOver
            ? 'rotate(-2deg)'
            : 'rotate(0deg)',
          background: 'rgba(101, 105, 80, 0.12)',
          boxShadow: isOver ? '0 8px 32px rgba(101, 105, 80, 0.35)' : 'none',
        }}
      >
        {/* Large archive icon in center */}
        <svg
          className="w-14 h-14 transition-all duration-300"
          style={{ color: '#4C4F3C' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      </div>

      {/* Outer glow layer - corners align with inner box */}
      <div
        className={`
          fixed rounded-xl pointer-events-none
          border-2 border-sage-600/30
          transition-all duration-200 ease-out delay-75
          ${isOver
            ? 'opacity-50 scale-100'
            : 'opacity-0 scale-50'
          }
        `}
        style={{
          width: '220px',
          height: '180px',
          bottom: '6px',
          right: '6px',
          transform: isOver
            ? 'rotate(1deg)'
            : 'rotate(0deg)',
        }}
      />

      {/* Tab-style button matching collapsed columns - also droppable */}
      <div
        ref={setNodeRef}
        className={`
          group relative flex items-center justify-center cursor-pointer
          rounded-l-lg h-14 w-full
          transition-all duration-200 ease-out
          ${isExpanded
            ? 'bg-sage text-white'
            : isOver
              ? 'bg-sage text-white scale-105'
              : 'bg-sage/70 hover:bg-sage text-white'
          }
          ${isAnimatingDrop ? 'animate-pulse' : ''}
        `}
        onClick={handleToggle}
        title={`Withdrawn (${postings.length})`}
        aria-label={`Withdrawn postings: ${postings.length}`}
        aria-expanded={isExpanded}
      >
        <div className="flex flex-col items-center gap-0.5">
          {/* Archive/bin icon */}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>

          {/* Count */}
          <span className="text-[10px] font-bold">
            {postings.length > 99 ? '99+' : postings.length}
          </span>
        </div>
      </div>

      {/* Expanded drawer - opens upward from bottom */}
      {isExpanded && (
        <div
          className={`
            absolute right-0 bottom-16 w-80 max-h-[calc(100vh-200px)]
            bg-white rounded-lg shadow-xl border border-sage/20
            overflow-hidden z-30
            animate-in slide-in-from-bottom-2 fade-in duration-200
          `}
        >
          {/* Header */}
          <div className="bg-sage px-4 py-3 text-white flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span className="font-medium">Withdrawn</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {postings.length}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="hover:bg-white/20 rounded p-1 transition-colors"
              aria-label="Close drawer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(100vh-280px)] p-3 space-y-2 bg-champagne-50/50">
            {postings.length === 0 ? (
              <div className="py-8 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-sage/30 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <p className="text-wine/40 text-sm">No withdrawn postings</p>
                <p className="text-wine/30 text-xs mt-1">Drag cards here to archive them</p>
              </div>
            ) : (
              postings.map((posting) => (
                <div
                  key={posting.id}
                  className="transform transition-all duration-200 hover:scale-[1.02]"
                >
                  <PostingCard
                    posting={posting}
                    onSelect={onPostingSelect}
                    onPriorityChange={onPriorityChange}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    variant="kanban"
                    linkedConnections={getLinkedConnections?.(posting.id)}
                    onConnectionClick={onConnectionClick ? () => onConnectionClick(posting.id) : undefined}
                  />
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          {postings.length > 0 && (
            <div className="px-3 py-2 bg-sage/5 border-t border-sage/10 text-xs text-wine/50">
              Tip: Change status from card menu to restore
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WithdrawnDrawer;
