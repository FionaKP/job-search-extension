import React, { useState, useCallback, useMemo } from 'react';
import { Goal, GoalType, GOAL_TYPE_LABELS, GoalAnalytics } from '@/types';

// SVG Icon components for goal types
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

// Small icon for filter buttons
const GoalTypeIconSmall: React.FC<{ type: GoalType }> = ({ type }) => (
  <GoalTypeIcon type={type} className="h-4 w-4" />
);

interface GoalsListProps {
  goals: Goal[];
  analytics?: GoalAnalytics;
  onGoalClick?: (goalId: string) => void;
  onGoalComplete?: (goalId: string) => void;
  onGoalDelete?: (goalId: string) => void;
  onGoalUpdate?: (goalId: string, updates: Partial<Goal>) => void;
  onAddGoal?: () => void;
  showCompleted?: boolean;
  onShowCompletedChange?: (show: boolean) => void;
}

type GoalFilter = 'all' | GoalType;
type GoalSort = 'dueDate' | 'progress' | 'type' | 'created';

export const GoalsList: React.FC<GoalsListProps> = ({
  goals,
  analytics,
  onGoalClick,
  onGoalComplete,
  onGoalDelete,
  onGoalUpdate,
  onAddGoal,
  showCompleted = false,
  onShowCompletedChange,
}) => {
  const [filter, setFilter] = useState<GoalFilter>('all');
  const [sort, setSort] = useState<GoalSort>('dueDate');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    let filtered = goals;

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter((g) => !g.completed);
    }

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter((g) => g.type === filter);
    }

    // Sort
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'progress':
          const progressA = a.targetCount ? (a.currentCount ?? 0) / a.targetCount : (a.completed ? 1 : 0);
          const progressB = b.targetCount ? (b.currentCount ?? 0) / b.targetCount : (b.completed ? 1 : 0);
          return progressB - progressA;
        case 'type':
          return (a.type ?? 'custom').localeCompare(b.type ?? 'custom');
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [goals, filter, sort, showCompleted]);

  // Calculate progress percentage
  const getProgress = useCallback((goal: Goal): number => {
    if (goal.completed) return 100;
    if (!goal.targetCount) return 0;
    return Math.min(100, Math.round(((goal.currentCount ?? 0) / goal.targetCount) * 100));
  }, []);

  // Get progress bar color
  const getProgressColor = useCallback((goal: Goal): string => {
    const progress = getProgress(goal);
    const dueDate = new Date(goal.dueDate);
    const isOverdue = !goal.completed && dueDate < new Date();

    if (goal.completed) return 'bg-teal-500';
    if (isOverdue) return 'bg-flatred';
    if (progress >= 75) return 'bg-teal-400';
    if (progress >= 50) return 'bg-pandora-400';
    if (progress >= 25) return 'bg-champagne-400';
    return 'bg-sage-300';
  }, [getProgress]);

  // Get due date label
  const getDueDateLabel = useCallback((goal: Goal): { label: string; color: string } => {
    if (goal.completed) {
      return { label: 'Completed', color: 'text-teal-600' };
    }

    const dueDate = new Date(goal.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `${Math.abs(diffDays)} days overdue`, color: 'text-flatred' };
    }
    if (diffDays === 0) {
      return { label: 'Due today', color: 'text-pandora-600' };
    }
    if (diffDays === 1) {
      return { label: 'Due tomorrow', color: 'text-pandora-500' };
    }
    if (diffDays <= 7) {
      return { label: `Due in ${diffDays} days`, color: 'text-wine' };
    }
    return { label: dueDate.toLocaleDateString(), color: 'text-wine/60' };
  }, []);

  // Increment goal progress
  const handleIncrementProgress = useCallback((goal: Goal) => {
    if (!goal.targetCount || goal.completed) return;
    const newCount = Math.min((goal.currentCount ?? 0) + 1, goal.targetCount);
    onGoalUpdate?.(goal.id, { currentCount: newCount });

    // Auto-complete if target reached
    if (newCount >= goal.targetCount) {
      onGoalComplete?.(goal.id);
    }
  }, [onGoalUpdate, onGoalComplete]);

  // Decrement goal progress
  const handleDecrementProgress = useCallback((goal: Goal) => {
    if (!goal.targetCount || goal.completed || (goal.currentCount ?? 0) <= 0) return;
    onGoalUpdate?.(goal.id, { currentCount: (goal.currentCount ?? 0) - 1 });
  }, [onGoalUpdate]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-wine flex items-center gap-2">
          <svg className="h-5 w-5 text-wine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Active Goals
          <span className="ml-1 rounded-full bg-wine/10 px-2 py-0.5 text-sm text-wine">
            {filteredGoals.filter((g) => !g.completed).length}
          </span>
        </h2>
        <button
          onClick={onAddGoal}
          className="flex items-center gap-1 rounded-lg bg-wine px-3 py-1.5 text-sm font-medium text-white hover:bg-wine/90 transition-colors"
        >
          <span>+</span> Add Goal
        </button>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          <div className="rounded-lg bg-teal-50 p-3 text-center">
            <div className="text-2xl font-bold text-teal-600">{analytics.totalGoalsCompleted}</div>
            <div className="text-xs text-teal-700">Completed</div>
          </div>
          <div className="rounded-lg bg-wine/5 p-3 text-center">
            <div className="text-2xl font-bold text-wine">{Math.round(analytics.completionRate * 100)}%</div>
            <div className="text-xs text-wine/70">Success Rate</div>
          </div>
          <div className="rounded-lg bg-pandora-50 p-3 text-center">
            <div className="text-2xl font-bold text-pandora-600">{analytics.currentStreak}</div>
            <div className="text-xs text-pandora-700">Day Streak</div>
          </div>
          <div className="rounded-lg bg-champagne-100 p-3 text-center">
            <div className="text-2xl font-bold text-wine">{analytics.longestStreak}</div>
            <div className="text-xs text-wine/70">Best Streak</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex rounded-lg border border-wine/20 bg-white p-0.5">
          <button
            onClick={() => setFilter('all')}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              filter === 'all' ? 'bg-wine text-white' : 'text-wine/70 hover:bg-wine/10'
            }`}
          >
            All
          </button>
          {(['application', 'networking', 'interview', 'followup', 'custom'] as GoalType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors flex items-center justify-center ${
                filter === type ? 'bg-wine text-white' : 'text-wine/70 hover:bg-wine/10'
              }`}
              title={GOAL_TYPE_LABELS[type]}
            >
              <GoalTypeIconSmall type={type} />
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as GoalSort)}
          className="rounded-lg border border-wine/20 bg-white px-2 py-1 text-xs text-wine"
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="progress">Sort by Progress</option>
          <option value="type">Sort by Type</option>
          <option value="created">Sort by Created</option>
        </select>

        <label className="flex items-center gap-1 text-xs text-wine/70">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => onShowCompletedChange?.(e.target.checked)}
            className="rounded border-wine/30"
          />
          Show Completed
        </label>
      </div>

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-wine/50">
            <svg className="h-12 w-12 text-wine/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="font-medium text-wine">No goals yet</div>
            <div className="text-sm">Create your first goal to start tracking progress</div>
            <button
              onClick={onAddGoal}
              className="mt-4 rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white hover:bg-wine/90"
            >
              + Create Goal
            </button>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const progress = getProgress(goal);
            const { label: dueLabel, color: dueColor } = getDueDateLabel(goal);
            const isExpanded = expandedGoalId === goal.id;

            return (
              <div
                key={goal.id}
                className={`rounded-lg border bg-white p-3 transition-all duration-base ${
                  goal.completed
                    ? 'border-teal-200 bg-teal-50/50'
                    : 'border-wine/10 hover:border-wine/30 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Completion Checkbox / Icon */}
                  <button
                    onClick={() => goal.completed ? null : onGoalComplete?.(goal.id)}
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-base ${
                      goal.completed
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : 'border-sage-300 hover:border-wine hover:bg-wine/5'
                    }`}
                    disabled={goal.completed}
                  >
                    {goal.completed && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Goal Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-wine/70"><GoalTypeIcon type={goal.type ?? 'custom'} className="h-5 w-5" /></span>
                      <h3
                        className={`font-medium cursor-pointer hover:text-wine transition-colors ${
                          goal.completed ? 'text-wine/40 line-through' : 'text-wine'
                        }`}
                        onClick={() => onGoalClick?.(goal.id)}
                      >
                        {goal.title}
                      </h3>
                      {goal.isRecurring && (
                        <span className="rounded bg-pandora-100 px-1.5 py-0.5 text-xs text-pandora-700 flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Recurring
                        </span>
                      )}
                      {goal.dependsOn && goal.dependsOn.length > 0 && (
                        <span className="rounded bg-wine/10 px-1.5 py-0.5 text-xs text-wine flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Has Dependencies
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-sm">
                      <span className={dueColor}>{dueLabel}</span>
                      <span className="text-wine/30">|</span>
                      <span className="text-wine/60">{GOAL_TYPE_LABELS[goal.type ?? 'custom']}</span>
                    </div>

                    {/* Progress Bar */}
                    {goal.targetCount && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-wine/60 mb-1">
                          <span>Progress: {goal.currentCount ?? 0}/{goal.targetCount}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-champagne-200">
                          <div
                            className={`h-full rounded-full transition-all ${getProgressColor(goal)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {/* Progress Controls */}
                        {!goal.completed && (
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => handleDecrementProgress(goal)}
                              disabled={(goal.currentCount ?? 0) <= 0}
                              className="rounded bg-champagne-100 px-2 py-0.5 text-sm text-wine hover:bg-champagne-200 disabled:opacity-50 transition-colors"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleIncrementProgress(goal)}
                              disabled={(goal.currentCount ?? 0) >= (goal.targetCount ?? 0)}
                              className="rounded bg-wine/10 px-2 py-0.5 text-sm text-wine hover:bg-wine/20 disabled:opacity-50 transition-colors"
                            >
                              +
                            </button>
                            <span className="text-xs text-wine/40">Quick update</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-wine/10">
                        {goal.notes && (
                          <p className="text-sm text-wine/70 mb-2">{goal.notes}</p>
                        )}
                        {(goal.linkedPostingIds ?? []).length > 0 && (
                          <div className="text-xs text-wine/50">
                            Linked to {(goal.linkedPostingIds ?? []).length} posting(s)
                          </div>
                        )}
                        {(goal.linkedConnectionIds ?? []).length > 0 && (
                          <div className="text-xs text-wine/50">
                            Linked to {(goal.linkedConnectionIds ?? []).length} connection(s)
                          </div>
                        )}
                        <div className="text-xs text-wine/40 mt-2">
                          Created: {new Date(goal.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                      className="rounded p-1 text-wine/40 hover:bg-wine/10 hover:text-wine transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        className={`h-4 w-4 transition-transform duration-base ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onGoalDelete?.(goal.id)}
                      className="rounded p-1 text-wine/40 hover:bg-flatred-50 hover:text-flatred transition-colors"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Completed Link */}
      {!showCompleted && goals.some((g) => g.completed) && (
        <button
          onClick={() => onShowCompletedChange?.(true)}
          className="mt-4 text-sm text-wine/70 hover:text-wine"
        >
          View {goals.filter((g) => g.completed).length} completed goal(s)
        </button>
      )}
    </div>
  );
};

export default GoalsList;
