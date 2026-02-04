import { DashboardStats as Stats } from '@/hooks/useDashboardStats';
import { STATUS_LABELS, PostingStatus, KANBAN_COLUMNS } from '@/types';

interface DashboardStatsProps {
  stats: Stats;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const STATUS_COLORS: Record<PostingStatus, string> = {
  saved: 'bg-blue-500',
  in_progress: 'bg-orange-500',
  applied: 'bg-green-500',
  interviewing: 'bg-purple-500',
  offer: 'bg-yellow-500',
  accepted: 'bg-emerald-500',
  rejected: 'bg-gray-400',
  withdrawn: 'bg-gray-400',
};

function StatCard({
  icon,
  label,
  value,
  color = 'text-gray-600',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`${color}`}>{icon}</span>
      <div>
        <span className="text-lg font-semibold text-gray-900">{value}</span>
        <span className="ml-1 text-sm text-gray-500">{label}</span>
      </div>
    </div>
  );
}

function StatusBar({ status, count, total }: { status: PostingStatus; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-gray-600">{STATUS_LABELS[status]}</span>
      <div className="flex-1">
        <div className="h-4 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full ${STATUS_COLORS[status]} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="w-8 text-right text-sm font-medium text-gray-700">{count}</span>
    </div>
  );
}

export function DashboardStats({ stats, expanded, onExpandedChange }: DashboardStatsProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Compact view */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6">
          <StatCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            label="total"
            value={stats.total}
          />

          <StatCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            label="active"
            value={stats.active}
            color="text-blue-600"
          />

          <StatCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            label="this week"
            value={stats.thisWeek}
            color="text-green-600"
          />

          {stats.stale > 0 && (
            <StatCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              label="stale"
              value={stats.stale}
              color="text-orange-600"
            />
          )}
        </div>

        <button
          onClick={() => onExpandedChange(!expanded)}
          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <span>{expanded ? 'Hide' : 'Details'}</span>
          <svg
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3">
          <h4 className="mb-3 text-sm font-medium text-gray-500">BY STATUS</h4>
          <div className="space-y-2">
            {KANBAN_COLUMNS.map((status) => (
              <StatusBar
                key={status}
                status={status}
                count={stats.byStatus[status]}
                total={stats.total}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
