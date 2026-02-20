import { useState, useCallback, useMemo } from 'react';
import { GoalStopItem, SnoozeDuration } from '@/types';

interface ActionCardProps {
  item: GoalStopItem;
  onClick: () => void;
  onComplete: () => void;
  onSnooze: (days: SnoozeDuration) => void;
}

/**
 * Get display information for a GoalStopItem
 */
function getItemDisplay(item: GoalStopItem): {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  companyLogo?: string;
  initials?: string;
} {
  switch (item.type) {
    case 'application-goal':
      return {
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        title: item.posting.title,
        subtitle: item.posting.company,
        actionLabel: 'Apply by',
        companyLogo: item.posting.companyLogo,
      };

    case 'interview':
      return {
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
        title: `${item.interview.roundName}`,
        subtitle: `${item.posting.company} - ${item.posting.title}`,
        actionLabel: 'Interview',
        companyLogo: item.posting.companyLogo,
      };

    case 'offer-deadline':
      return {
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        title: item.posting.title,
        subtitle: item.posting.company,
        actionLabel: 'Offer deadline',
        companyLogo: item.posting.companyLogo,
      };

    case 'follow-up':
      const initials = item.connection.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return {
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ),
        title: item.connection.name,
        subtitle: `${item.connection.role || ''} at ${item.connection.company}`.trim(),
        actionLabel: 'Follow up',
        initials,
      };

    case 'goal':
      return {
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        ),
        title: item.goal.title,
        subtitle: item.goal.notes || 'No description',
        actionLabel: 'Goal due',
      };
  }
}

/**
 * Format a date relative to now
 */
function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays < 7) return `In ${diffDays} days`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActionCard({ item, onClick, onComplete, onSnooze }: ActionCardProps) {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);

  const display = useMemo(() => getItemDisplay(item), [item]);
  const dateLabel = useMemo(() => formatDate(item.date), [item.date]);

  const isOverdue = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return !item.completed && item.date < now;
  }, [item.date, item.completed]);

  const handleSnoozeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSnoozeMenu((prev) => !prev);
  }, []);

  const handleSnooze = useCallback(
    (days: SnoozeDuration) => {
      setShowSnoozeMenu(false);
      onSnooze(days);
    },
    [onSnooze]
  );

  const handleCompleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onComplete();
    },
    [onComplete]
  );

  const handleCardClick = useCallback(() => {
    onClick();
  }, [onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <div
      className={`
        relative rounded-lg border p-3 transition-colors cursor-pointer
        hover:border-wine/50 focus-within:ring-2 focus-within:ring-wine/50
        ${item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-champagne-200'}
        ${isOverdue ? 'border-flatred/50 bg-flatred/5' : ''}
      `}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${display.actionLabel}: ${display.title} at ${display.subtitle}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar/Logo */}
        <div
          className={`
            flex h-10 w-10 items-center justify-center rounded-lg shrink-0
            ${item.completed ? 'bg-gray-200 text-gray-400' : 'bg-wine/10 text-wine'}
          `}
        >
          {display.companyLogo ? (
            <img
              src={display.companyLogo}
              alt=""
              className="h-8 w-8 rounded object-contain"
              onError={(e) => {
                // Fallback to icon if logo fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : display.initials ? (
            <span className="text-sm font-medium">{display.initials}</span>
          ) : (
            display.icon
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`font-medium truncate ${
                  item.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                }`}
              >
                {display.title}
              </p>
              <p className="text-sm text-gray-500 truncate">{display.subtitle}</p>
            </div>

            {/* Action label and date */}
            <div className="text-right shrink-0">
              <span
                className={`
                  inline-block rounded px-1.5 py-0.5 text-xs font-medium
                  ${
                    isOverdue
                      ? 'bg-flatred/10 text-flatred'
                      : item.completed
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-wine/10 text-wine'
                  }
                `}
              >
                {display.actionLabel}
              </span>
              <p
                className={`mt-0.5 text-xs ${
                  isOverdue ? 'text-flatred font-medium' : 'text-gray-500'
                }`}
              >
                {dateLabel}
              </p>
            </div>
          </div>

          {/* Goal progress if applicable */}
          {item.type === 'goal' && item.goal.targetCount && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {item.goal.currentCount || 0}/{item.goal.targetCount}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-wine transition-all"
                  style={{
                    width: `${Math.min(((item.goal.currentCount || 0) / item.goal.targetCount) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-2 flex items-center gap-2">
            {/* Complete checkbox */}
            {!item.completed && (
              <button
                onClick={handleCompleteClick}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-wine/50"
                aria-label="Mark as complete"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Complete
              </button>
            )}

            {/* Snooze button */}
            {!item.completed && (
              <div className="relative">
                <button
                  onClick={handleSnoozeClick}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-wine/50"
                  aria-label="Snooze"
                  aria-expanded={showSnoozeMenu}
                  aria-haspopup="true"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Snooze
                </button>

                {/* Snooze menu */}
                {showSnoozeMenu && (
                  <div className="absolute left-0 top-full mt-1 z-10 rounded-lg border border-champagne-200 bg-white py-1 shadow-lg">
                    {[1, 3, 7].map((days) => (
                      <button
                        key={days}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSnooze(days as SnoozeDuration);
                        }}
                        className="block w-full px-4 py-1.5 text-left text-sm text-gray-700 hover:bg-champagne-50"
                      >
                        {days} day{days > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed indicator */}
            {item.completed && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Completed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActionCard;
