import { useMemo } from 'react';
import { Connection, TOUCHPOINT_REASON_LABELS } from '@/types';
import { computeTouchpoints } from '@/services/connections';

interface TouchpointsBannerProps {
  connections: Connection[];
  onSelectConnection: (id: string) => void;
  onSnooze: (id: string) => void;
}

/**
 * Surfaces who the user should reach out to and when, derived from local
 * connection data (follow-up dates + cadence). Independent of any email
 * integration, so it's useful even before Gmail is connected.
 */
export function TouchpointsBanner({
  connections,
  onSelectConnection,
  onSnooze,
}: TouchpointsBannerProps) {
  const byId = useMemo(() => {
    const map = new Map<string, Connection>();
    connections.forEach((c) => map.set(c.id, c));
    return map;
  }, [connections]);

  const suggestions = useMemo(() => computeTouchpoints(connections), [connections]);

  if (suggestions.length === 0) return null;

  const formatOverdue = (days: number, reason: string) => {
    if (reason === 'never_contacted') return 'no contact logged yet';
    if (days <= 0) return 'due today';
    if (days === 1) return '1 day overdue';
    if (days < 14) return `${days} days overdue`;
    return `${Math.round(days / 7)} weeks overdue`;
  };

  return (
    <div className="mb-4 rounded-xl border border-pandora/30 bg-pandora/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-5 w-5 text-pandora" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <h2 className="text-sm font-semibold text-wine">
          Suggested touchpoints
          <span className="ml-2 rounded-full bg-pandora/20 px-2 py-0.5 text-xs font-bold text-pandora">
            {suggestions.length}
          </span>
        </h2>
      </div>

      <div className="space-y-1.5">
        {suggestions.slice(0, 5).map((s) => {
          const connection = byId.get(s.connectionId);
          if (!connection) return null;
          return (
            <div
              key={s.connectionId}
              className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2"
            >
              <button
                onClick={() => onSelectConnection(s.connectionId)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-champagne-100 text-sm font-semibold text-wine">
                  {connection.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-wine">{connection.name}</p>
                  <p className="truncate text-xs text-wine/60">
                    {TOUCHPOINT_REASON_LABELS[s.reason]} · {formatOverdue(s.daysOverdue, s.reason)}
                  </p>
                </div>
              </button>
              <button
                onClick={() => onSelectConnection(s.connectionId)}
                className="rounded-md bg-flatred px-2.5 py-1 text-xs font-medium text-white hover:bg-flatred-600"
              >
                Reach out
              </button>
              <button
                onClick={() => onSnooze(s.connectionId)}
                className="rounded-md px-2 py-1 text-xs text-wine/50 hover:bg-champagne-100 hover:text-wine"
                title="Snooze for a week"
              >
                Snooze
              </button>
            </div>
          );
        })}
      </div>

      {suggestions.length > 5 && (
        <p className="mt-2 text-xs text-wine/50">+{suggestions.length - 5} more due</p>
      )}
    </div>
  );
}

export default TouchpointsBanner;
