import { useDroppable } from '@dnd-kit/core';
import { PostingStatus, STATUS_LABELS } from '@/types';

interface CollapsedColumnProps {
  status: PostingStatus;
  count: number;
  onExpand: () => void;
  onCollapse?: () => void;
  isOver?: boolean;
  isAnimating?: boolean; // Recently collapsed - show slide animation
  isCollapsed?: boolean; // Whether this column is currently collapsed
}

// Vintage palette colors for collapsed column tabs
// Red = rejected, Green = applied, Wine = interviewing
const TAB_COLORS: Record<PostingStatus, { bg: string; text: string; border: string; hover: string }> = {
  saved: { bg: 'bg-pandora', text: 'text-white', border: 'border-pandora-600', hover: 'hover:bg-pandora-500' },
  in_progress: { bg: 'bg-champagne-400', text: 'text-wine', border: 'border-champagne-500', hover: 'hover:bg-champagne-300' },
  applied: { bg: 'bg-teal', text: 'text-white', border: 'border-teal-600', hover: 'hover:bg-teal-400' },
  interviewing: { bg: 'bg-wine', text: 'text-white', border: 'border-wine-700', hover: 'hover:bg-wine-400' },
  offer: { bg: 'bg-pandora-500', text: 'text-white', border: 'border-pandora-600', hover: 'hover:bg-pandora-400' },
  accepted: { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-700', hover: 'hover:bg-teal-500' },
  rejected: { bg: 'bg-flatred', text: 'text-white', border: 'border-flatred-700', hover: 'hover:bg-flatred-400' },
  withdrawn: { bg: 'bg-sage', text: 'text-wine', border: 'border-sage-600', hover: 'hover:bg-sage-300' },
};

const DROP_HIGHLIGHT_COLORS: Record<PostingStatus, string> = {
  saved: 'ring-pandora',
  in_progress: 'ring-champagne-400',
  applied: 'ring-teal',
  interviewing: 'ring-wine',
  offer: 'ring-pandora-500',
  accepted: 'ring-teal-600',
  rejected: 'ring-flatred',
  withdrawn: 'ring-sage',
};

export function CollapsedColumn({
  status,
  count,
  onExpand,
  onCollapse,
  isOver = false,
  isAnimating = false,
  isCollapsed = true,
}: CollapsedColumnProps) {
  // Only enable droppable when collapsed - KanbanColumn handles drops when expanded
  const { setNodeRef } = useDroppable({
    id: `collapsed-${status}`,
    disabled: !isCollapsed,
  });

  const colors = TAB_COLORS[status];

  // Get short label for the tab
  const shortLabels: Record<PostingStatus, string> = {
    saved: 'SAVED',
    in_progress: 'IN PROG',
    applied: 'APPLIED',
    interviewing: 'INTRVW',
    offer: 'OFFER',
    accepted: 'ACCEPT',
    rejected: 'REJECT',
    withdrawn: 'WTHDRN',
  };

  // When column is expanded, show a minimal placeholder/gap
  if (!isCollapsed) {
    return (
      <div
        className={`
          group relative flex-1 flex items-center justify-center cursor-pointer
          bg-champagne-100/50 hover:bg-champagne-200/70
          border-l border-champagne-200/50
          transition-all duration-200
        `}
        onClick={onCollapse}
        title={`Collapse ${STATUS_LABELS[status]} column`}
      >
        {/* Small indicator dot showing the column's color */}
        <div className={`w-2 h-2 rounded-full ${colors.bg} opacity-40 group-hover:opacity-70 transition-opacity`} />
      </div>
    );
  }

  // Collapsed state - full tab
  return (
    <div
      ref={setNodeRef}
      className={`
        group relative flex-1 flex items-center justify-center cursor-pointer
        ${colors.bg} ${colors.hover}
        ${isOver ? `ring-2 ${DROP_HIGHLIGHT_COLORS[status]} ring-inset` : ''}
        rounded-l-lg
        transition-all duration-200 ease-out
        hover:flex-[1.5] hover:shadow-lg hover:z-10
        hover:-ml-3
        ${isAnimating ? 'animate-tab-slide-in' : ''}
      `}
      onClick={onExpand}
      title={`Expand ${STATUS_LABELS[status]} column (${count})`}
    >
      <div className="flex flex-col items-center justify-center h-full py-2 gap-1">
        {/* Count badge - prominent at top */}
        <span className={`flex items-center justify-center min-w-[20px] h-[20px] rounded-full bg-white/30 ${colors.text} text-[11px] font-bold`}>
          {count}
        </span>

        {/* Vertical text label */}
        <span
          className={`text-[9px] font-bold tracking-wider whitespace-nowrap ${colors.text} opacity-90 flex-1 flex items-center`}
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
        >
          {shortLabels[status]}
        </span>

        {/* Right arrow indicator - shows on hover */}
        <svg
          className={`h-3 w-3 ${colors.text} opacity-0 group-hover:opacity-80 transition-opacity duration-200 flex-shrink-0`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
