import React, { useMemo, useCallback } from 'react';
import { Posting, Goal, TimelineEvent, Connection, GOAL_TYPE_ICONS } from '@/types';

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
  icon: string;
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
          icon: '🎯',
          color: 'bg-purple-500',
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
            icon: '⚠️',
            color: 'bg-red-500',
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
            icon: '📝',
            color: 'bg-blue-500',
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
          icon: '💤',
          color: 'bg-gray-400',
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
        subtitle: goal.targetCount ? `${goal.currentCount}/${goal.targetCount} completed` : undefined,
        icon: GOAL_TYPE_ICONS[goal.type],
        color: dueDate < today ? 'bg-red-500' : 'bg-emerald-500',
        goalId: goal.id,
        isOverdue: dueDate < today,
        progress: goal.targetCount ? { current: goal.currentCount, target: goal.targetCount } : undefined,
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
        icon: '📧',
        color: 'bg-amber-500',
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
        icon: event.type === 'interview' ? '🎯' : event.type === 'deadline' ? '⚠️' : '📌',
        color: 'bg-gray-500',
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
          <span>📋</span>
          This Week
          {attentionCount > 0 && (
            <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
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
              <div className={`flex items-center gap-2 ${isToday ? 'text-wine font-semibold' : 'text-gray-600 font-medium'}`}>
                <div className={`h-2 w-2 rounded-full ${isToday ? 'bg-wine' : 'bg-gray-300'}`} />
                <span className="text-sm">{label}</span>
                {items.length > 0 && (
                  <span className="text-xs text-gray-400">({items.length})</span>
                )}
              </div>

              {/* Day Items */}
              {items.length === 0 ? (
                <div className="ml-4 py-2 text-sm text-gray-400 italic">
                  Nothing scheduled
                </div>
              ) : (
                <div className="ml-4 space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 rounded-lg p-2 transition-colors cursor-pointer hover:bg-gray-50 ${
                        item.isOverdue ? 'bg-red-50' : ''
                      }`}
                      onClick={() => handleItemClick(item)}
                    >
                      {/* Icon */}
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${item.color} text-white text-sm`}>
                        {item.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${item.isOverdue ? 'text-red-700' : 'text-gray-900'}`}>
                            {item.title}
                          </span>
                          {item.isOverdue && (
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                              Overdue
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="text-sm text-gray-500 truncate">{item.subtitle}</div>
                        )}
                        {item.progress && (
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${Math.min(100, (item.progress.current / item.progress.target) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">
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
                              className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
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
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
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
