import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { GoalStop as GoalStopType, GoalStopItem, SnoozeDuration } from '@/types';
import { GoalStop } from './GoalStop';

interface TimelineProps {
  goalStops: GoalStopType[];
  onItemClick: (item: GoalStopItem) => void;
  onItemComplete: (item: GoalStopItem) => void;
  onItemSnooze: (item: GoalStopItem, days: SnoozeDuration) => void;
}

export function Timeline({
  goalStops,
  onItemClick,
  onItemComplete,
  onItemSnooze,
}: TimelineProps) {
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);
  const stopRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Find the current week's stop
  const currentWeekStopId = useMemo(() => {
    const now = new Date();
    for (const stop of goalStops) {
      const weekStart = new Date(stop.date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (now >= weekStart && now <= weekEnd) {
        return stop.id;
      }
    }
    // If no current week, return the nearest future week
    for (const stop of goalStops) {
      if (stop.date >= now) {
        return stop.id;
      }
    }
    return goalStops.length > 0 ? goalStops[goalStops.length - 1].id : null;
  }, [goalStops]);

  // Auto-expand current week on mount
  useEffect(() => {
    if (currentWeekStopId) {
      setExpandedStops(new Set([currentWeekStopId]));
    }
  }, [currentWeekStopId]);

  // Scroll to current week on mount
  useEffect(() => {
    if (currentWeekStopId) {
      const element = stopRefs.current.get(currentWeekStopId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentWeekStopId]);

  const handleToggle = useCallback((stopId: string) => {
    setExpandedStops((prev) => {
      const next = new Set(prev);
      if (next.has(stopId)) {
        next.delete(stopId);
      } else {
        next.add(stopId);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedStops(new Set(goalStops.map((s) => s.id)));
  }, [goalStops]);

  const handleCollapseAll = useCallback(() => {
    setExpandedStops(new Set());
  }, []);

  const handleScrollToStop = useCallback((stopId: string) => {
    const element = stopRefs.current.get(stopId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setExpandedStops((prev) => new Set([...prev, stopId]));
    }
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;
    let overdueItems = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    goalStops.forEach((stop) => {
      stop.items.forEach((item) => {
        totalItems++;
        if (item.completed) {
          completedItems++;
        } else if (item.date < now) {
          overdueItems++;
        }
      });
    });

    return { totalItems, completedItems, overdueItems };
  }, [goalStops]);

  if (goalStops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="h-16 w-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No upcoming items</h3>
        <p className="mt-1 text-sm text-gray-500">
          Set application goals, schedule interviews, or add follow-up reminders to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Timeline header with stats and controls */}
      <div className="flex items-center justify-between border-b border-champagne-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">
              <span className="font-medium text-gray-900">{stats.totalItems}</span> items
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              <span className="font-medium text-wine">{stats.completedItems}</span> done
            </span>
            {stats.overdueItems > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-flatred">
                  <span className="font-medium">{stats.overdueItems}</span> overdue
                </span>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Quick navigation */}
          {currentWeekStopId && (
            <button
              onClick={() => handleScrollToStop(currentWeekStopId)}
              className="rounded px-2 py-1 text-sm text-wine hover:bg-wine/10 focus:outline-none focus:ring-2 focus:ring-wine/50"
            >
              Jump to this week
            </button>
          )}

          <span className="text-gray-300">|</span>

          {/* Expand/Collapse all */}
          <button
            onClick={handleExpandAll}
            className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-wine/50"
            aria-label="Expand all weeks"
          >
            Expand all
          </button>
          <button
            onClick={handleCollapseAll}
            className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-wine/50"
            aria-label="Collapse all weeks"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Week quick navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-champagne-200 bg-champagne-50 px-4 py-2">
        {goalStops.map((stop) => {
          const isCurrentWeek = stop.id === currentWeekStopId;
          const hasOverdue = stop.items.some(
            (item) => !item.completed && item.date < new Date()
          );

          return (
            <button
              key={stop.id}
              onClick={() => handleScrollToStop(stop.id)}
              className={`
                shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-wine/50
                ${
                  isCurrentWeek
                    ? 'bg-wine text-white'
                    : hasOverdue
                    ? 'bg-flatred/10 text-flatred hover:bg-flatred/20'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {stop.weekLabel.replace('Week of ', '')}
              {stop.items.length > 0 && (
                <span className="ml-1 opacity-70">({stop.items.length})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timeline content */}
      <div ref={timelineRef} className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          {goalStops.map((stop) => (
            <div
              key={stop.id}
              ref={(el) => {
                if (el) {
                  stopRefs.current.set(stop.id, el);
                } else {
                  stopRefs.current.delete(stop.id);
                }
              }}
            >
              <GoalStop
                stop={stop}
                isExpanded={expandedStops.has(stop.id)}
                onToggle={() => handleToggle(stop.id)}
                onItemClick={onItemClick}
                onItemComplete={onItemComplete}
                onItemSnooze={onItemSnooze}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
