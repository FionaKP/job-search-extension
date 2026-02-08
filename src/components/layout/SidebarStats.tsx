import { useState, useEffect } from 'react';
import { DashboardStats as Stats } from '@/hooks/useDashboardStats';
import { STATUS_LABELS, PostingStatus, KANBAN_COLUMNS } from '@/types';

interface SidebarStatsProps {
  stats: Stats;
  isExpanded: boolean; // Whether sidebar is expanded
}

// Vintage palette status colors
const STATUS_COLORS: Record<PostingStatus, string> = {
  saved: 'bg-pandora',
  in_progress: 'bg-champagne-400',
  applied: 'bg-teal',
  interviewing: 'bg-wine',
  offer: 'bg-pandora-500',
  accepted: 'bg-teal-600',
  rejected: 'bg-flatred',
  withdrawn: 'bg-sage',
};

function MiniStatusBar({ status, count, total }: { status: PostingStatus; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="w-16 truncate text-xs text-champagne/70">{STATUS_LABELS[status]}</span>
      <div className="flex-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-wine-400/30">
          <div
            className={`h-full ${STATUS_COLORS[status]} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="w-5 text-right text-xs font-medium text-champagne/80">{count}</span>
    </div>
  );
}

export function SidebarStats({ stats, isExpanded }: SidebarStatsProps) {
  const [isStatsExpanded, setIsStatsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar-stats-expanded');
    return saved !== null ? saved === 'true' : false;
  });

  // Save preference when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-stats-expanded', String(isStatsExpanded));
  }, [isStatsExpanded]);

  // Don't render anything if sidebar is collapsed
  if (!isExpanded) {
    return (
      <div className="flex flex-col items-center gap-1 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wine-400/20">
          <span className="text-sm font-bold text-champagne">{stats.total}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      {/* Header with toggle */}
      <button
        onClick={() => setIsStatsExpanded(!isStatsExpanded)}
        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-champagne/70 transition-colors hover:bg-wine-400/20 hover:text-champagne"
      >
        <span className="text-xs font-medium uppercase tracking-wider">Stats</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isStatsExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Compact stats - always visible */}
      <div className="mt-2 grid grid-cols-3 gap-1">
        <div className="rounded-lg bg-wine-400/20 px-2 py-1.5 text-center">
          <div className="text-lg font-bold text-champagne">{stats.total}</div>
          <div className="text-[10px] text-champagne/60">Total</div>
        </div>
        <div className="rounded-lg bg-wine-400/20 px-2 py-1.5 text-center">
          <div className="text-lg font-bold text-pandora">{stats.active}</div>
          <div className="text-[10px] text-champagne/60">Active</div>
        </div>
        <div className="rounded-lg bg-wine-400/20 px-2 py-1.5 text-center">
          <div className="text-lg font-bold text-teal-400">{stats.thisWeek}</div>
          <div className="text-[10px] text-champagne/60">Week</div>
        </div>
      </div>

      {/* Stale indicator if any */}
      {stats.stale > 0 && (
        <div className="mt-1.5 flex items-center justify-center gap-1 rounded-lg bg-flatred/20 px-2 py-1">
          <svg className="h-3 w-3 text-flatred" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-xs text-flatred">{stats.stale} stale</span>
        </div>
      )}

      {/* Expanded status breakdown */}
      {isStatsExpanded && (
        <div className="mt-3 space-y-1.5 border-t border-wine-400/30 pt-3">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-champagne/50">By Status</div>
          {KANBAN_COLUMNS.map((status) => (
            <MiniStatusBar
              key={status}
              status={status}
              count={stats.byStatus[status]}
              total={stats.total}
            />
          ))}
        </div>
      )}
    </div>
  );
}
