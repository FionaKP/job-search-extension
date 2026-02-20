import { useCallback } from 'react';
import { GoalStop as GoalStopType, GoalStopItem, SnoozeDuration } from '@/types';
import { ActionCard } from './ActionCard';

interface GoalStopProps {
  stop: GoalStopType;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (item: GoalStopItem) => void;
  onItemComplete: (item: GoalStopItem) => void;
  onItemSnooze: (item: GoalStopItem, days: SnoozeDuration) => void;
}

export function GoalStop({
  stop,
  isExpanded,
  onToggle,
  onItemClick,
  onItemComplete,
  onItemSnooze,
}: GoalStopProps) {
  const { weekLabel, items, progress } = stop;
  const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  // Check if this is the current week
  const now = new Date();
  const weekStart = new Date(stop.date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const isCurrentWeek = now >= weekStart && now <= weekEnd;

  // Check if this week is in the past
  const isPastWeek = weekEnd < now;

  // Check if there are overdue items
  const hasOverdue = items.some((item) => !item.completed && item.date < now);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle]
  );

  return (
    <div className="relative">
      {/* Timeline connector line */}
      <div
        className={`absolute left-4 top-0 bottom-0 w-0.5 ${
          isPastWeek ? 'bg-gray-300' : 'bg-wine/30'
        }`}
        aria-hidden="true"
      />

      {/* Goal stop marker */}
      <div className="relative flex items-start gap-4 pb-6">
        {/* Circle marker with count */}
        <button
          onClick={onToggle}
          onKeyDown={handleKeyDown}
          className={`
            relative z-10 flex h-8 w-8 items-center justify-center rounded-full
            border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-wine/50
            ${
              isCurrentWeek
                ? 'border-wine bg-wine text-white'
                : isPastWeek
                ? 'border-gray-400 bg-gray-200 text-gray-600'
                : hasOverdue
                ? 'border-flatred bg-flatred/10 text-flatred'
                : 'border-wine/50 bg-champagne-50 text-wine'
            }
          `}
          aria-expanded={isExpanded}
          aria-label={`${weekLabel}, ${progress.completed} of ${progress.total} completed. Click to ${isExpanded ? 'collapse' : 'expand'}.`}
        >
          <span className="text-sm font-semibold">{items.length}</span>
        </button>

        {/* Content card */}
        <div className="flex-1 min-w-0">
          {/* Header - always visible */}
          <button
            onClick={onToggle}
            className={`
              w-full text-left rounded-lg border p-3 transition-colors
              hover:bg-champagne-100 focus:outline-none focus:ring-2 focus:ring-wine/50
              ${
                isCurrentWeek
                  ? 'border-wine bg-wine/5'
                  : isPastWeek
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-champagne-200 bg-white'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`font-medium ${
                    isCurrentWeek ? 'text-wine' : isPastWeek ? 'text-gray-600' : 'text-gray-900'
                  }`}
                >
                  {weekLabel}
                  {isCurrentWeek && (
                    <span className="ml-2 text-xs font-normal text-wine/70">(This week)</span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {progress.completed}/{progress.total} completed
                </p>
              </div>

              {/* Expand/collapse icon */}
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all ${
                  hasOverdue ? 'bg-flatred' : 'bg-wine'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </button>

          {/* Expanded content - item cards */}
          {isExpanded && (
            <div className="mt-2 space-y-2 pl-2">
              {items.map((item) => (
                <ActionCard
                  key={item.id}
                  item={item}
                  onClick={() => onItemClick(item)}
                  onComplete={() => onItemComplete(item)}
                  onSnooze={(days) => onItemSnooze(item, days)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoalStop;
