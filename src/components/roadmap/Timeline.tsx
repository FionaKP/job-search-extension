import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Posting, Goal, TimelineEvent, PostingStatus, STATUS_LABELS } from '@/types';

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

// Updated to use design system colors
const STATUS_COLORS: Record<PostingStatus, string> = {
  saved: '#A2A77E',      // sage
  in_progress: '#E68342', // pandora
  applied: '#4F243E',    // wine
  interviewing: '#E9C593', // champagne
  offer: '#3C9C9A',      // teal
  accepted: '#3C9C9A',   // teal
  rejected: '#CA423B',   // flatred
  withdrawn: '#A2A77E',  // sage
};

const ZOOM_CONFIGS: Record<ZoomLevel, { daysToShow: number; labelFormat: 'day' | 'week' | 'month' }> = {
  week: { daysToShow: 7, labelFormat: 'day' },
  month: { daysToShow: 35, labelFormat: 'week' },
  quarter: { daysToShow: 91, labelFormat: 'month' },
};

// SVG Icon Components
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const FlagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
  </svg>
);

const TargetIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ExclamationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

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
  const [, setDraggingGoalId] = useState<string | null>(null);

  const config = ZOOM_CONFIGS[zoomLevel];

  // Calculate date range
  const { startDate, endDate, dates } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(start.getDate() - Math.floor(config.daysToShow / 4));

    const end = new Date(start);
    end.setDate(end.getDate() + config.daysToShow);

    const dateList: TimelineDate[] = [];
    const current = new Date(start);

    while (current <= end) {
      const isToday = current.toDateString() === today.toDateString();
      const isWeekStart = current.getDay() === 1;
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

        const trackEvents: { date: Date; status: PostingStatus; label: string }[] = [
          { date: trackStartDate, status: 'saved', label: 'Saved' },
        ];

        if (posting.dateApplied) {
          const appliedDate = new Date(posting.dateApplied);
          appliedDate.setHours(0, 0, 0, 0);
          trackEvents.push({ date: appliedDate, status: 'applied', label: 'Applied' });
        }

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
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }, [postings, endDate]);

  // Group goals by date for milestone stops
  const milestoneStops = useMemo(() => {
    const stops = new Map<string, { date: Date; goals: Goal[]; events: TimelineEvent[] }>();

    goals.forEach((goal) => {
      const dueDate = new Date(goal.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const dateKey = dueDate.toDateString();

      if (!stops.has(dateKey)) {
        stops.set(dateKey, { date: dueDate, goals: [], events: [] });
      }
      stops.get(dateKey)!.goals.push(goal);
    });

    events.forEach((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const dateKey = eventDate.toDateString();

      if (!stops.has(dateKey)) {
        stops.set(dateKey, { date: eventDate, goals: [], events: [] });
      }
      stops.get(dateKey)!.events.push(event);
    });

    return Array.from(stops.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [goals, events]);

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

  // Generate winding road SVG path
  const generateRoadPath = useCallback((width: number, height: number): string => {
    const segments = 4;
    const segmentWidth = width / segments;
    const amplitude = height * 0.15;
    const centerY = height / 2;

    let path = `M 0 ${centerY}`;

    for (let i = 0; i < segments; i++) {
      const x1 = segmentWidth * i;
      const x2 = segmentWidth * (i + 1);
      const midX = (x1 + x2) / 2;
      const direction = i % 2 === 0 ? 1 : -1;

      path += ` Q ${midX} ${centerY + amplitude * direction} ${x2} ${centerY}`;
    }

    return path;
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
            <div className="text-champagne-200">{posting.company}</div>
            <div className="mt-1 text-xs text-champagne-300">
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
            <div className="text-champagne-200">
              Due: {new Date(goal.dueDate).toLocaleDateString()}
            </div>
            {goal.targetCount && (
              <div className="mt-1 text-xs text-champagne-300">
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
            <div className="text-champagne-200">
              {new Date(event.date).toLocaleDateString()}
            </div>
            {event.notes && (
              <div className="mt-1 text-xs text-champagne-300">{event.notes}</div>
            )}
          </div>
        );
      }
    }

    if (!content) return null;

    return (
      <div
        className="pointer-events-none fixed z-tooltip rounded-lg bg-wine px-3 py-2 text-white shadow-lg"
        style={{
          left: hoveredItem.x + 10,
          top: hoveredItem.y + 10,
        }}
      >
        {content}
      </div>
    );
  };

  // Get milestone stop status
  const getStopStatus = (stop: { date: Date; goals: Goal[]; events: TimelineEvent[] }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allCompleted = stop.goals.every(g => g.completed);
    const hasOverdue = stop.date < today && stop.goals.some(g => !g.completed);
    const isToday = stop.date.toDateString() === today.toDateString();
    const isPast = stop.date < today;

    if (allCompleted && stop.goals.length > 0) return 'completed';
    if (hasOverdue) return 'overdue';
    if (isToday) return 'today';
    if (isPast) return 'past';
    return 'upcoming';
  };

  return (
    <div className="flex flex-col">
      {/* Zoom Controls */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-wine flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Your Journey
        </h2>
        <div className="flex rounded-lg border border-wine/20 bg-champagne-50 p-1">
          {(['week', 'month', 'quarter'] as ZoomLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => onZoomChange(level)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-all duration-base ${
                zoomLevel === level
                  ? 'bg-wine text-white shadow-sm'
                  : 'text-wine/70 hover:bg-wine/10 hover:text-wine'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Winding Road Timeline Container */}
      <div
        ref={containerRef}
        className="relative min-h-[500px] rounded-xl border border-wine/10 bg-gradient-to-b from-champagne-50 to-white p-6 shadow-sm overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDrop={handleTimelineDrop}
        onDragOver={handleDragOver}
      >
        {/* Date Headers */}
        <div className="relative mb-6 h-8 border-b border-sage/30">
          {dates.map((dateInfo) => {
            if (!dateInfo.label) return null;
            const position = getPositionForDate(dateInfo.date);
            if (position < 0 || position > 100) return null;

            return (
              <div
                key={dateInfo.date.toISOString()}
                className={`absolute -translate-x-1/2 text-xs font-medium ${
                  dateInfo.isToday ? 'text-flatred font-semibold' : 'text-wine/60'
                }`}
                style={{ left: `${position}%` }}
              >
                {dateInfo.label}
              </div>
            );
          })}
        </div>

        {/* Winding Road SVG */}
        <svg
          className="absolute left-0 right-0 top-20 h-32 w-full"
          preserveAspectRatio="none"
        >
          {/* Road shadow */}
          <path
            d={generateRoadPath(1000, 128)}
            fill="none"
            stroke="rgba(79, 36, 62, 0.1)"
            strokeWidth="48"
            strokeLinecap="round"
            className="origin-center"
            style={{ transform: 'translateY(4px)' }}
          />
          {/* Main road */}
          <path
            d={generateRoadPath(1000, 128)}
            fill="none"
            stroke="url(#roadGradient)"
            strokeWidth="40"
            strokeLinecap="round"
          />
          {/* Road center line (dashed) */}
          <path
            d={generateRoadPath(1000, 128)}
            fill="none"
            stroke="rgba(233, 197, 147, 0.6)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="12 8"
          />
          <defs>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B896AA" />
              <stop offset="50%" stopColor="#A2A77E" />
              <stop offset="100%" stopColor="#C4C8A8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Today Marker */}
        <div
          className="absolute top-14 bottom-4 z-20 flex flex-col items-center"
          style={{
            left: `${getPositionForDate(new Date())}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="rounded-full bg-flatred px-2.5 py-1 text-xs font-semibold text-white shadow-md">
            Today
          </div>
          <div className="w-0.5 flex-1 bg-gradient-to-b from-flatred to-transparent" />
        </div>

        {/* Milestone Stops on the Road */}
        <div className="relative mt-16 h-40">
          {milestoneStops.map((stop, index) => {
            const position = getPositionForDate(stop.date);
            if (position < 0 || position > 100) return null;

            const status = getStopStatus(stop);
            const yOffset = index % 2 === 0 ? 0 : 80; // Alternate above/below road

            return (
              <div
                key={stop.date.toISOString()}
                className="absolute"
                style={{
                  left: `${position}%`,
                  top: `${yOffset}px`,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Milestone Circle */}
                <div
                  className={`relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-4 shadow-lg transition-all duration-base hover:scale-110 ${
                    status === 'completed'
                      ? 'border-teal bg-teal text-white'
                      : status === 'overdue'
                      ? 'border-flatred bg-flatred text-white'
                      : status === 'today'
                      ? 'border-flatred bg-wine text-white ring-4 ring-flatred/30'
                      : status === 'past'
                      ? 'border-sage-300 bg-champagne-100 text-wine/60'
                      : 'border-champagne-400 bg-champagne-100 text-wine'
                  }`}
                  onClick={() => {
                    if (stop.goals.length > 0) {
                      onGoalClick?.(stop.goals[0].id);
                    } else if (stop.events.length > 0) {
                      onEventClick?.(stop.events[0].id);
                    }
                  }}
                  draggable={stop.goals.length > 0}
                  onDragStart={(e) => {
                    if (stop.goals.length > 0) {
                      handleGoalDragStart(e, stop.goals[0].id);
                    }
                  }}
                  onDragEnd={handleGoalDragEnd}
                  onMouseEnter={(e) => {
                    if (stop.goals.length > 0) {
                      setHoveredItem({
                        type: 'goal',
                        id: stop.goals[0].id,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {status === 'completed' ? (
                    <CheckIcon className="h-6 w-6" />
                  ) : status === 'overdue' ? (
                    <ExclamationIcon className="h-6 w-6" />
                  ) : stop.goals.length > 0 ? (
                    <FlagIcon className="h-6 w-6" />
                  ) : (
                    <TargetIcon className="h-6 w-6" />
                  )}

                  {/* Count badge */}
                  {(stop.goals.length + stop.events.length) > 1 && (
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-wine text-xs font-bold text-white">
                      {stop.goals.length + stop.events.length}
                    </div>
                  )}
                </div>

                {/* Connector line to road */}
                <div
                  className={`absolute left-1/2 h-8 w-0.5 -translate-x-1/2 ${
                    status === 'completed'
                      ? 'bg-teal/50'
                      : status === 'overdue'
                      ? 'bg-flatred/50'
                      : 'bg-sage/50'
                  } ${yOffset === 0 ? 'top-12' : 'bottom-12'}`}
                />

                {/* Card with goal info */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-36 rounded-lg border bg-white p-2 shadow-sm transition-all duration-base ${
                    status === 'completed'
                      ? 'border-teal/30'
                      : status === 'overdue'
                      ? 'border-flatred/30'
                      : status === 'today'
                      ? 'border-wine/30'
                      : 'border-wine/10'
                  } ${yOffset === 0 ? 'top-24' : 'bottom-24'}`}
                >
                  <div className={`text-xs font-medium truncate ${
                    status === 'past' ? 'text-wine/40' : 'text-wine'
                  }`}>
                    {stop.goals.length > 0
                      ? stop.goals[0].title
                      : stop.events[0]?.title || 'Event'}
                  </div>
                  <div className="text-xs text-wine/50 mt-0.5">
                    {stop.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  {stop.goals[0]?.targetCount && (
                    <div className="mt-1.5">
                      <div className="h-1.5 w-full rounded-full bg-champagne-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            status === 'completed' ? 'bg-teal' : 'bg-wine'
                          }`}
                          style={{
                            width: `${Math.min(100, (stop.goals[0].currentCount / stop.goals[0].targetCount) * 100)}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-wine/40 mt-0.5">
                        {stop.goals[0].currentCount}/{stop.goals[0].targetCount}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Posting Tracks Section */}
        <div className="mt-20 space-y-3 border-t border-sage/20 pt-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-wine">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Application Journeys
          </div>
          {postingTracks.slice(0, 10).map((track) => {
            const startPos = Math.max(0, getPositionForDate(track.startDate));
            const endPos = Math.min(100, getPositionForDate(track.endDate));
            const width = endPos - startPos;

            if (width <= 0) return null;

            return (
              <div
                key={track.posting.id}
                className="relative h-10 group"
              >
                {/* Track Label */}
                <div
                  className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 truncate text-xs font-medium text-wine/70 group-hover:text-wine transition-colors"
                  style={{ width: '140px', transform: 'translateX(-100%) translateY(-50%)', paddingRight: '12px' }}
                >
                  {track.posting.company}
                </div>

                {/* Track Bar */}
                <div
                  className="absolute top-1/2 h-3 -translate-y-1/2 cursor-pointer rounded-full transition-all duration-base hover:h-4 hover:shadow-sm"
                  style={{
                    left: `${startPos}%`,
                    width: `${width}%`,
                    backgroundColor: STATUS_COLORS[track.posting.status],
                    opacity: 0.7,
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
                      className="absolute top-1/2 z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-white shadow-md transition-transform duration-base hover:scale-125"
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

        {/* Empty State */}
        {postingTracks.length === 0 && goals.length === 0 && events.length === 0 && (
          <div className="flex h-64 items-center justify-center text-wine/60">
            <div className="text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-wine/30 mb-3" />
              <div className="font-medium text-wine">No timeline data yet</div>
              <div className="text-sm text-wine/50 mt-1">Add postings and goals to see them here</div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {renderTooltip()}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-6 text-xs text-wine/70">
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 rounded-full bg-gradient-to-r from-wine-200 to-sage-300" />
          <span>Application Track</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-champagne-400 bg-champagne-100">
            <FlagIcon className="h-3 w-3 text-wine" />
          </div>
          <span>Goal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-teal bg-teal">
            <CheckIcon className="h-3 w-3 text-white" />
          </div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-flatred bg-flatred">
            <ExclamationIcon className="h-3 w-3 text-white" />
          </div>
          <span>Overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-0.5 bg-flatred rounded" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
