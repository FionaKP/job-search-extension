import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Posting, Goal, TimelineEvent, PostingStatus, TIMELINE_EVENT_COLORS, STATUS_LABELS } from '@/types';

export type ZoomLevel = 'week' | 'month' | 'quarter';

interface TimelineProps {
  postings: Posting[];
  goals: Goal[];
  events: TimelineEvent[];
  zoomLevel: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  onPostingClick?: (postingId: string) => void;
  onGoalClick?: (goalId: string) => void;
  onEventClick?: (eventId: string) => void;
  onCreateGoal?: (date: string) => void;
  onGoalDrop?: (goalId: string, newDate: string) => void;
}

interface TimelineDate {
  date: Date;
  label: string;
  isToday: boolean;
  isWeekStart: boolean;
  isMonthStart: boolean;
}

interface PostingTrack {
  posting: Posting;
  startDate: Date;
  endDate: Date;
  events: { date: Date; status: PostingStatus; label: string }[];
}

const STATUS_COLORS: Record<PostingStatus, string> = {
  saved: '#64748B',
  in_progress: '#3B82F6',
  applied: '#8B5CF6',
  interviewing: '#F59E0B',
  offer: '#10B981',
  accepted: '#059669',
  rejected: '#EF4444',
  withdrawn: '#6B7280',
};

const ZOOM_CONFIGS: Record<ZoomLevel, { daysToShow: number; labelFormat: 'day' | 'week' | 'month' }> = {
  week: { daysToShow: 7, labelFormat: 'day' },
  month: { daysToShow: 35, labelFormat: 'week' },
  quarter: { daysToShow: 91, labelFormat: 'month' },
};

export const Timeline: React.FC<TimelineProps> = ({
  postings,
  goals,
  events,
  zoomLevel,
  onZoomChange,
  onPostingClick,
  onGoalClick,
  onEventClick,
  onCreateGoal,
  onGoalDrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<{ type: 'posting' | 'goal' | 'event'; id: string; x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; date: Date } | null>(null);
  const [draggingGoalId, setDraggingGoalId] = useState<string | null>(null);

  const config = ZOOM_CONFIGS[zoomLevel];

  // Calculate date range
  const { startDate, endDate, dates } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start a few days before today based on zoom level
    const start = new Date(today);
    start.setDate(start.getDate() - Math.floor(config.daysToShow / 4));

    const end = new Date(start);
    end.setDate(end.getDate() + config.daysToShow);

    const dateList: TimelineDate[] = [];
    const current = new Date(start);

    while (current <= end) {
      const isToday = current.toDateString() === today.toDateString();
      const isWeekStart = current.getDay() === 1; // Monday
      const isMonthStart = current.getDate() === 1;

      let label = '';
      if (config.labelFormat === 'day') {
        label = current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (config.labelFormat === 'week' && isWeekStart) {
        label = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (config.labelFormat === 'month' && isMonthStart) {
        label = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }

      dateList.push({
        date: new Date(current),
        label,
        isToday,
        isWeekStart,
        isMonthStart,
      });

      current.setDate(current.getDate() + 1);
    }

    return { startDate: start, endDate: end, dates: dateList };
  }, [zoomLevel, config]);

  // Convert postings to tracks
  const postingTracks = useMemo((): PostingTrack[] => {
    return postings
      .filter((p) => {
        const addedDate = new Date(p.dateAdded);
        return addedDate <= endDate;
      })
      .map((posting) => {
        const trackStartDate = new Date(posting.dateAdded);
        trackStartDate.setHours(0, 0, 0, 0);

        const trackEndDate = posting.dateModified
          ? new Date(posting.dateModified)
          : new Date();
        trackEndDate.setHours(0, 0, 0, 0);

        // Build events from posting history
        const trackEvents: { date: Date; status: PostingStatus; label: string }[] = [
          { date: trackStartDate, status: 'saved', label: 'Saved' },
        ];

        if (posting.dateApplied) {
          const appliedDate = new Date(posting.dateApplied);
          appliedDate.setHours(0, 0, 0, 0);
          trackEvents.push({ date: appliedDate, status: 'applied', label: 'Applied' });
        }

        // Add interview events
        posting.interviews?.forEach((interview) => {
          if (interview.date) {
            const interviewDate = new Date(interview.date);
            interviewDate.setHours(0, 0, 0, 0);
            trackEvents.push({
              date: interviewDate,
              status: 'interviewing',
              label: interview.roundName || `Round ${interview.round}`,
            });
          }
        });

        // Add current status as final event
        if (posting.status !== 'saved') {
          trackEvents.push({
            date: trackEndDate,
            status: posting.status,
            label: STATUS_LABELS[posting.status],
          });
        }

        return {
          posting,
          startDate: trackStartDate,
          endDate: trackEndDate,
          events: trackEvents.sort((a, b) => a.date.getTime() - b.date.getTime()),
        };
      })
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime()); // Most recent first
  }, [postings, endDate]);

  // Calculate position for a date
  const getPositionForDate = useCallback((date: Date): number => {
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceStart = (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return (daysSinceStart / totalDays) * 100;
  }, [startDate, endDate]);

  // Get date from position
  const getDateForPosition = useCallback((xPercent: number): Date => {
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const days = (xPercent / 100) * totalDays;
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.round(days));
    return date;
  }, [startDate, endDate]);

  // Handle drag to create goal
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const xPercent = (x / rect.width) * 100;
    const date = getDateForPosition(xPercent);

    setDragStart({ x, date });
    setIsDragging(true);
  }, [getDateForPosition]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !containerRef.current) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // If barely moved, treat as a click to create goal
    if (Math.abs(x - dragStart.x) < 5) {
      onCreateGoal?.(dragStart.date.toISOString());
    }

    setIsDragging(false);
    setDragStart(null);
  }, [isDragging, dragStart, onCreateGoal]);

  // Handle goal drag and drop
  const handleGoalDragStart = useCallback((e: React.DragEvent, goalId: string) => {
    setDraggingGoalId(goalId);
    e.dataTransfer.setData('goalId', goalId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleGoalDragEnd = useCallback(() => {
    setDraggingGoalId(null);
  }, []);

  const handleTimelineDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const goalId = e.dataTransfer.getData('goalId');
    if (!goalId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const xPercent = (x / rect.width) * 100;
    const newDate = getDateForPosition(xPercent);

    onGoalDrop?.(goalId, newDate.toISOString());
    setDraggingGoalId(null);
  }, [getDateForPosition, onGoalDrop]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Render tooltip
  const renderTooltip = () => {
    if (!hoveredItem) return null;

    let content: React.ReactNode = null;

    if (hoveredItem.type === 'posting') {
      const posting = postings.find((p) => p.id === hoveredItem.id);
      if (posting) {
        content = (
          <div className="text-sm">
            <div className="font-medium">{posting.title}</div>
            <div className="text-gray-300">{posting.company}</div>
            <div className="mt-1 text-xs text-gray-400">
              Status: {STATUS_LABELS[posting.status]}
            </div>
          </div>
        );
      }
    } else if (hoveredItem.type === 'goal') {
      const goal = goals.find((g) => g.id === hoveredItem.id);
      if (goal) {
        content = (
          <div className="text-sm">
            <div className="font-medium">{goal.title}</div>
            <div className="text-gray-300">
              Due: {new Date(goal.dueDate).toLocaleDateString()}
            </div>
            {goal.targetCount && (
              <div className="mt-1 text-xs text-gray-400">
                Progress: {goal.currentCount}/{goal.targetCount}
              </div>
            )}
          </div>
        );
      }
    } else if (hoveredItem.type === 'event') {
      const event = events.find((e) => e.id === hoveredItem.id);
      if (event) {
        content = (
          <div className="text-sm">
            <div className="font-medium">{event.title}</div>
            <div className="text-gray-300">
              {new Date(event.date).toLocaleDateString()}
            </div>
            {event.notes && (
              <div className="mt-1 text-xs text-gray-400">{event.notes}</div>
            )}
          </div>
        );
      }
    }

    if (!content) return null;

    return (
      <div
        className="pointer-events-none fixed z-50 rounded-lg bg-gray-800 px-3 py-2 text-white shadow-lg"
        style={{
          left: hoveredItem.x + 10,
          top: hoveredItem.y + 10,
        }}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Zoom Controls */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-wine">Timeline</h2>
        <div className="flex rounded-lg border border-wine/20 bg-white p-1">
          {(['week', 'month', 'quarter'] as ZoomLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => onZoomChange(level)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                zoomLevel === level
                  ? 'bg-wine text-white'
                  : 'text-wine/70 hover:bg-wine/10'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={containerRef}
        className="relative min-h-[400px] rounded-lg border border-wine/20 bg-white p-4"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDrop={handleTimelineDrop}
        onDragOver={handleDragOver}
      >
        {/* Date Headers */}
        <div className="relative mb-4 h-8 border-b border-gray-200">
          {dates.map((dateInfo) => {
            if (!dateInfo.label) return null;
            const position = getPositionForDate(dateInfo.date);
            if (position < 0 || position > 100) return null;

            return (
              <div
                key={dateInfo.date.toISOString()}
                className="absolute -translate-x-1/2 text-xs font-medium text-gray-600"
                style={{ left: `${position}%` }}
              >
                {dateInfo.label}
              </div>
            );
          })}
        </div>

        {/* Today Line */}
        <div
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-flatred"
          style={{
            left: `${getPositionForDate(new Date())}%`,
          }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-flatred px-1.5 py-0.5 text-xs font-medium text-white">
            Today
          </div>
        </div>

        {/* Posting Tracks */}
        <div className="space-y-3 pt-4">
          {postingTracks.slice(0, 10).map((track) => {
            const startPos = Math.max(0, getPositionForDate(track.startDate));
            const endPos = Math.min(100, getPositionForDate(track.endDate));
            const width = endPos - startPos;

            if (width <= 0) return null;

            return (
              <div
                key={track.posting.id}
                className="relative h-8"
              >
                {/* Track Label */}
                <div className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 truncate text-xs font-medium text-gray-700"
                     style={{ width: '150px', transform: 'translateX(-100%) translateY(-50%)', paddingRight: '8px' }}>
                  {track.posting.company}
                </div>

                {/* Track Bar */}
                <div
                  className="absolute top-1/2 h-2 -translate-y-1/2 cursor-pointer rounded-full transition-all hover:h-3"
                  style={{
                    left: `${startPos}%`,
                    width: `${width}%`,
                    backgroundColor: STATUS_COLORS[track.posting.status],
                    opacity: 0.6,
                  }}
                  onClick={() => onPostingClick?.(track.posting.id)}
                  onMouseEnter={(e) =>
                    setHoveredItem({
                      type: 'posting',
                      id: track.posting.id,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onMouseLeave={() => setHoveredItem(null)}
                />

                {/* Track Events */}
                {track.events.map((event, eventIndex) => {
                  const eventPos = getPositionForDate(event.date);
                  if (eventPos < 0 || eventPos > 100) return null;

                  return (
                    <div
                      key={`${track.posting.id}-${eventIndex}`}
                      className="absolute top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-white shadow-md transition-transform hover:scale-125"
                      style={{
                        left: `${eventPos}%`,
                        backgroundColor: STATUS_COLORS[event.status],
                      }}
                      onClick={() => onPostingClick?.(track.posting.id)}
                      title={event.label}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Goal Markers */}
        <div className="mt-8 border-t border-gray-200 pt-4">
          <div className="mb-2 text-sm font-medium text-gray-600">Goals</div>
          <div className="relative h-12">
            {goals.map((goal) => {
              const dueDate = new Date(goal.dueDate);
              const position = getPositionForDate(dueDate);
              if (position < 0 || position > 100) return null;

              const isCompleted = goal.completed;
              const isOverdue = !isCompleted && dueDate < new Date();

              return (
                <div
                  key={goal.id}
                  className={`absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                    draggingGoalId === goal.id ? 'opacity-50' : ''
                  }`}
                  style={{ left: `${position}%` }}
                  draggable
                  onDragStart={(e) => handleGoalDragStart(e, goal.id)}
                  onDragEnd={handleGoalDragEnd}
                  onClick={() => onGoalClick?.(goal.id)}
                  onMouseEnter={(e) =>
                    setHoveredItem({
                      type: 'goal',
                      id: goal.id,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div
                    className={`flex h-8 w-8 rotate-45 items-center justify-center border-2 transition-transform hover:scale-110 ${
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-100'
                        : isOverdue
                        ? 'border-red-500 bg-red-100'
                        : 'border-amber-500 bg-amber-100'
                    }`}
                  >
                    <span className="-rotate-45 text-sm">
                      {isCompleted ? '✓' : '◆'}
                    </span>
                  </div>
                  <div className="absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap text-xs text-gray-600">
                    {goal.title.length > 15 ? goal.title.slice(0, 15) + '...' : goal.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Events */}
        {events.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-4">
            <div className="mb-2 text-sm font-medium text-gray-600">Events</div>
            <div className="relative h-8">
              {events.map((event) => {
                const eventDate = new Date(event.date);
                const position = getPositionForDate(eventDate);
                if (position < 0 || position > 100) return null;

                return (
                  <div
                    key={event.id}
                    className="absolute top-1/2 z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-white shadow-md transition-transform hover:scale-125"
                    style={{
                      left: `${position}%`,
                      backgroundColor: TIMELINE_EVENT_COLORS[event.type],
                    }}
                    onClick={() => onEventClick?.(event.id)}
                    onMouseEnter={(e) =>
                      setHoveredItem({
                        type: 'event',
                        id: event.id,
                        x: e.clientX,
                        y: e.clientY,
                      })
                    }
                    onMouseLeave={() => setHoveredItem(null)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {postingTracks.length === 0 && goals.length === 0 && events.length === 0 && (
          <div className="flex h-64 items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📅</div>
              <div className="font-medium">No timeline data yet</div>
              <div className="text-sm">Add postings and goals to see them here</div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {renderTooltip()}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="h-2 w-4 rounded-full bg-gray-400" />
          <span>Posting Track</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rotate-45 border-2 border-amber-500 bg-amber-100" />
          <span>Goal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-500" />
          <span>Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-0.5 bg-flatred" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
