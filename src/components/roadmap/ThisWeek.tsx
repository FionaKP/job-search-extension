import React, { useMemo, useCallback } from 'react';
import { Posting, Goal, TimelineEvent, Connection, GoalType } from '@/types';

// SVG Icon components
const GoalTypeIcon: React.FC<{ type: GoalType; className?: string }> = ({ type, className = "h-5 w-5" }) => {
  switch (type) {
    case 'application':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'networking':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'interview':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'followup':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'custom':
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
  }
};

// Item type icons
const InterviewIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DeadlineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SleepIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const PinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

interface ThisWeekProps {
  postings: Posting[];
  goals: Goal[];
  events: TimelineEvent[];
  connections: Connection[];
  onPostingClick?: (postingId: string) => void;
  onGoalClick?: (goalId: string) => void;
  onGoalComplete?: (goalId: string) => void;
  onEventClick?: (eventId: string) => void;
  onConnectionClick?: (connectionId: string) => void;
  onSnoozeGoal?: (goalId: string, days: number) => void;
}

interface AgendaItem {
  id: string;
  type: 'interview' | 'goal' | 'deadline' | 'followup' | 'stale';
  date: Date;
  title: string;
  subtitle?: string;
  iconType: 'interview' | 'deadline' | 'document' | 'mail' | 'sleep' | 'pin' | 'goal';
  goalType?: GoalType;
  color: string;
  postingId?: string;
  goalId?: string;
  connectionId?: string;
  eventId?: string;
  isOverdue?: boolean;
  progress?: { current: number; target: number };
}

export const ThisWeek: React.FC<ThisWeekProps> = ({
  postings,
  goals,
  events,
  connections,
  onPostingClick,
  onGoalClick,
  onGoalComplete,
  onEventClick,
  onConnectionClick,
  onSnoozeGoal,
}) => {
  // Get dates for the week
  const { today, endOfWeek, dayLabels } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const eow = new Date(now);
    eow.setDate(eow.getDate() + 7);

    const labels: { date: Date; label: string }[] = [];
    for (let i = 0; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      labels.push({
        date: d,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      });
    }

    return { today: now, endOfWeek: eow, dayLabels: labels };
  }, []);

  // Build agenda items
  const agendaItems = useMemo((): AgendaItem[] => {
    const items: AgendaItem[] = [];

    // Add interviews from postings
    postings.forEach((posting) => {
      posting.interviews?.forEach((interview) => {
        if (!interview.date || interview.completed) return;
        const interviewDate = new Date(interview.date);
        if (interviewDate < today || interviewDate > endOfWeek) return;

        items.push({
          id: `interview-${posting.id}-${interview.id}`,
          type: 'interview',
          date: interviewDate,
          title: `Interview: ${posting.company}`,
          subtitle: `${interview.roundName}${interview.time ? ` at ${interview.time}` : ''}`,
          iconType: 'interview',
          color: 'bg-wine',
          postingId: posting.id,
        });
      });

      // Add posting deadlines
      if (posting.nextActionDate) {
        const deadlineDate = new Date(posting.nextActionDate);
        deadlineDate.setHours(0, 0, 0, 0);
        if (deadlineDate >= today && deadlineDate <= endOfWeek) {
          items.push({
            id: `deadline-${posting.id}`,
            type: 'deadline',
            date: deadlineDate,
            title: `Deadline: ${posting.title}`,
            subtitle: posting.company,
            iconType: 'deadline',
            color: 'bg-flatred',
            postingId: posting.id,
            isOverdue: deadlineDate < today,
          });
        }
      }

      // Add application goals that are due
      if (posting.applicationGoalDate) {
        const goalDate = new Date(posting.applicationGoalDate);
        goalDate.setHours(0, 0, 0, 0);
        if (goalDate >= today && goalDate <= endOfWeek && posting.status === 'saved') {
          items.push({
            id: `app-goal-${posting.id}`,
            type: 'goal',
            date: goalDate,
            title: `Apply to: ${posting.title}`,
            subtitle: posting.company,
            iconType: 'document',
            color: 'bg-pandora',
            postingId: posting.id,
          });
        }
      }

      // Add stale postings (7+ days in saved/in_progress without update)
      const daysSinceUpdate = (today.getTime() - posting.dateModified) / (1000 * 60 * 60 * 24);
      if (
        (posting.status === 'saved' || posting.status === 'in_progress') &&
        daysSinceUpdate >= 7
      ) {
        items.push({
          id: `stale-${posting.id}`,
          type: 'stale',
          date: today, // Show stale items on today
          title: `Stale: ${posting.title}`,
          subtitle: `${posting.company} - No update in ${Math.floor(daysSinceUpdate)} days`,
          iconType: 'sleep',
          color: 'bg-sage',
          postingId: posting.id,
        });
      }
    });

    // Add goals
    goals.forEach((goal) => {
      if (goal.completed) return;
      const dueDate = new Date(goal.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate > endOfWeek) return;

      items.push({
        id: `goal-${goal.id}`,
        type: 'goal',
        date: dueDate < today ? today : dueDate, // Show overdue goals on today
        title: goal.title,
        subtitle: goal.targetCount ? `${goal.currentCount ?? 0}/${goal.targetCount} completed` : undefined,
        iconType: 'goal',
        goalType: goal.type ?? 'custom',
        color: dueDate < today ? 'bg-flatred' : 'bg-teal',
        goalId: goal.id,
        isOverdue: dueDate < today,
        progress: goal.targetCount ? { current: goal.currentCount ?? 0, target: goal.targetCount } : undefined,
      });
    });

    // Add connection follow-ups
    connections.forEach((connection) => {
      if (!connection.nextFollowUp) return;
      const followUpDate = new Date(connection.nextFollowUp);
      followUpDate.setHours(0, 0, 0, 0);
      if (followUpDate > endOfWeek) return;

      items.push({
        id: `followup-${connection.id}`,
        type: 'followup',
        date: followUpDate < today ? today : followUpDate,
        title: `Follow up: ${connection.name}`,
        subtitle: `${connection.company}${connection.role ? ` - ${connection.role}` : ''}`,
        iconType: 'mail',
        color: 'bg-pandora',
        connectionId: connection.id,
        isOverdue: followUpDate < today,
      });
    });

    // Add timeline events
    events.forEach((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate < today || eventDate > endOfWeek) return;

      items.push({
        id: `event-${event.id}`,
        type: event.type as AgendaItem['type'],
        date: eventDate,
        title: event.title,
        subtitle: event.notes,
        iconType: event.type === 'interview' ? 'interview' : event.type === 'deadline' ? 'deadline' : 'pin',
        color: 'bg-sage',
        eventId: event.id,
        postingId: event.postingId,
        goalId: event.goalId,
        connectionId: event.connectionId,
      });
    });

    // Sort by date, then by priority (interviews first, then deadlines, then goals)
    return items.sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;

      const priorityOrder = { interview: 0, deadline: 1, goal: 2, followup: 3, stale: 4 };
      return priorityOrder[a.type] - priorityOrder[b.type];
    });
  }, [postings, goals, events, connections, today, endOfWeek]);

  // Group items by day
  const itemsByDay = useMemo(() => {
    const grouped: Map<string, AgendaItem[]> = new Map();

    dayLabels.forEach(({ date }) => {
      const dateKey = date.toDateString();
      grouped.set(dateKey, []);
    });

    agendaItems.forEach((item) => {
      const dateKey = item.date.toDateString();
      const items = grouped.get(dateKey) || [];
      items.push(item);
      grouped.set(dateKey, items);
    });

    return grouped;
  }, [agendaItems, dayLabels]);

  // Handle item click
  const handleItemClick = useCallback((item: AgendaItem) => {
    if (item.postingId) {
      onPostingClick?.(item.postingId);
    } else if (item.goalId) {
      onGoalClick?.(item.goalId);
    } else if (item.connectionId) {
      onConnectionClick?.(item.connectionId);
    } else if (item.eventId) {
      onEventClick?.(item.eventId);
    }
  }, [onPostingClick, onGoalClick, onConnectionClick, onEventClick]);

  // Get count of items needing attention
  const attentionCount = useMemo(() => {
    return agendaItems.filter((item) => item.isOverdue || item.type === 'stale').length;
  }, [agendaItems]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-wine flex items-center gap-2">
          <svg className="h-5 w-5 text-wine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          This Week
          {attentionCount > 0 && (
            <span className="ml-1 rounded-full bg-flatred px-2 py-0.5 text-xs text-white">
              {attentionCount} needs attention
            </span>
          )}
        </h2>
      </div>

      {/* Agenda List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {dayLabels.map(({ date, label }) => {
          const dateKey = date.toDateString();
          const items = itemsByDay.get(dateKey) || [];
          const isToday = date.toDateString() === today.toDateString();

          return (
            <div key={dateKey} className="space-y-2">
              {/* Day Header */}
              <div className={`flex items-center gap-2 ${isToday ? 'text-wine font-semibold' : 'text-wine/70 font-medium'}`}>
                <div className={`h-2 w-2 rounded-full ${isToday ? 'bg-flatred' : 'bg-sage-300'}`} />
                <span className="text-sm">{label}</span>
                {items.length > 0 && (
                  <span className="text-xs text-wine/40">({items.length})</span>
                )}
              </div>

              {/* Day Items */}
              {items.length === 0 ? (
                <div className="ml-4 py-2 text-sm text-wine/40 italic">
                  Nothing scheduled
                </div>
              ) : (
                <div className="ml-4 space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 rounded-lg p-2 transition-all duration-base cursor-pointer hover:bg-champagne-50 ${
                        item.isOverdue ? 'bg-flatred-50' : ''
                      }`}
                      onClick={() => handleItemClick(item)}
                    >
                      {/* Icon */}
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${item.color} text-white`}>
                        {item.iconType === 'goal' && item.goalType ? (
                          <GoalTypeIcon type={item.goalType} className="h-4 w-4" />
                        ) : item.iconType === 'interview' ? (
                          <InterviewIcon className="h-4 w-4" />
                        ) : item.iconType === 'deadline' ? (
                          <DeadlineIcon className="h-4 w-4" />
                        ) : item.iconType === 'document' ? (
                          <DocumentIcon className="h-4 w-4" />
                        ) : item.iconType === 'mail' ? (
                          <MailIcon className="h-4 w-4" />
                        ) : item.iconType === 'sleep' ? (
                          <SleepIcon className="h-4 w-4" />
                        ) : (
                          <PinIcon className="h-4 w-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${item.isOverdue ? 'text-flatred' : 'text-wine'}`}>
                            {item.title}
                          </span>
                          {item.isOverdue && (
                            <span className="rounded bg-flatred-100 px-1.5 py-0.5 text-xs text-flatred">
                              Overdue
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="text-sm text-wine/60 truncate">{item.subtitle}</div>
                        )}
                        {item.progress && (
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-champagne-200">
                              <div
                                className="h-full rounded-full bg-teal-500 transition-all"
                                style={{ width: `${Math.min(100, (item.progress.current / item.progress.target) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-wine/50">
                              {item.progress.current}/{item.progress.target}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.goalId && !item.isOverdue && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onGoalComplete?.(item.goalId!);
                              }}
                              className="rounded p-1 text-teal-600 hover:bg-teal-50 transition-colors"
                              title="Complete"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSnoozeGoal?.(item.goalId!, 1);
                              }}
                              className="rounded p-1 text-wine/40 hover:bg-wine/10 hover:text-wine transition-colors"
                              title="Snooze 1 day"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-wine/10">
        <div className="flex items-center justify-between text-sm text-wine/60">
          <span>{agendaItems.filter((i) => i.type === 'interview').length} interviews</span>
          <span>{agendaItems.filter((i) => i.type === 'goal').length} goals</span>
          <span>{agendaItems.filter((i) => i.type === 'deadline').length} deadlines</span>
          <span>{agendaItems.filter((i) => i.type === 'followup').length} follow-ups</span>
        </div>
      </div>
    </div>
  );
};

export default ThisWeek;
