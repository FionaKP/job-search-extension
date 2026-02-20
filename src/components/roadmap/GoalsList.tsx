import React, { useState, useCallback, useMemo } from 'react';
import { Goal, GoalType, GOAL_TYPE_LABELS, GOAL_TYPE_ICONS, GoalAnalytics } from '@/types';

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
          const progressA = a.targetCount ? a.currentCount / a.targetCount : (a.completed ? 1 : 0);
          const progressB = b.targetCount ? b.currentCount / b.targetCount : (b.completed ? 1 : 0);
          return progressB - progressA;
        case 'type':
          return a.type.localeCompare(b.type);
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
    return Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));
  }, []);

  // Get progress bar color
  const getProgressColor = useCallback((goal: Goal): string => {
    const progress = getProgress(goal);
    const dueDate = new Date(goal.dueDate);
    const isOverdue = !goal.completed && dueDate < new Date();

    if (goal.completed) return 'bg-emerald-500';
    if (isOverdue) return 'bg-red-500';
    if (progress >= 75) return 'bg-emerald-400';
    if (progress >= 50) return 'bg-amber-400';
    if (progress >= 25) return 'bg-amber-300';
    return 'bg-gray-300';
  }, [getProgress]);

  // Get due date label
  const getDueDateLabel = useCallback((goal: Goal): { label: string; color: string } => {
    if (goal.completed) {
      return { label: 'Completed', color: 'text-emerald-600' };
    }

    const dueDate = new Date(goal.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600' };
    }
    if (diffDays === 0) {
      return { label: 'Due today', color: 'text-amber-600' };
    }
    if (diffDays === 1) {
      return { label: 'Due tomorrow', color: 'text-amber-500' };
    }
    if (diffDays <= 7) {
      return { label: `Due in ${diffDays} days`, color: 'text-blue-600' };
    }
    return { label: dueDate.toLocaleDateString(), color: 'text-gray-500' };
  }, []);

  // Increment goal progress
  const handleIncrementProgress = useCallback((goal: Goal) => {
    if (!goal.targetCount || goal.completed) return;
    const newCount = Math.min(goal.currentCount + 1, goal.targetCount);
    onGoalUpdate?.(goal.id, { currentCount: newCount });

    // Auto-complete if target reached
    if (newCount >= goal.targetCount) {
      onGoalComplete?.(goal.id);
    }
  }, [onGoalUpdate, onGoalComplete]);

  // Decrement goal progress
  const handleDecrementProgress = useCallback((goal: Goal) => {
    if (!goal.targetCount || goal.completed || goal.currentCount <= 0) return;
    onGoalUpdate?.(goal.id, { currentCount: goal.currentCount - 1 });
  }, [onGoalUpdate]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-wine flex items-center gap-2">
          <span>🎯</span>
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
          <div className="rounded-lg bg-emerald-50 p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{analytics.totalGoalsCompleted}</div>
            <div className="text-xs text-emerald-700">Completed</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(analytics.completionRate * 100)}%</div>
            <div className="text-xs text-blue-700">Success Rate</div>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{analytics.currentStreak}</div>
            <div className="text-xs text-amber-700">Day Streak</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{analytics.longestStreak}</div>
            <div className="text-xs text-purple-700">Best Streak</div>
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
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                filter === type ? 'bg-wine text-white' : 'text-wine/70 hover:bg-wine/10'
              }`}
            >
              {GOAL_TYPE_ICONS[type]}
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
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <div className="font-medium">No goals yet</div>
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
                className={`rounded-lg border bg-white p-3 transition-all ${
                  goal.completed
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-wine/10 hover:border-wine/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Completion Checkbox / Icon */}
                  <button
                    onClick={() => goal.completed ? null : onGoalComplete?.(goal.id)}
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      goal.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300 hover:border-wine'
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
                      <span className="text-lg">{GOAL_TYPE_ICONS[goal.type]}</span>
                      <h3
                        className={`font-medium cursor-pointer hover:text-wine ${
                          goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}
                        onClick={() => onGoalClick?.(goal.id)}
                      >
                        {goal.title}
                      </h3>
                      {goal.isRecurring && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                          🔄 Recurring
                        </span>
                      )}
                      {goal.dependsOn && goal.dependsOn.length > 0 && (
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
                          🔗 Has Dependencies
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-sm">
                      <span className={dueColor}>{dueLabel}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">{GOAL_TYPE_LABELS[goal.type]}</span>
                    </div>

                    {/* Progress Bar */}
                    {goal.targetCount && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress: {goal.currentCount}/{goal.targetCount}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
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
                              disabled={goal.currentCount <= 0}
                              className="rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleIncrementProgress(goal)}
                              disabled={goal.currentCount >= goal.targetCount}
                              className="rounded bg-wine/10 px-2 py-0.5 text-sm text-wine hover:bg-wine/20 disabled:opacity-50"
                            >
                              +
                            </button>
                            <span className="text-xs text-gray-400">Quick update</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {goal.notes && (
                          <p className="text-sm text-gray-600 mb-2">{goal.notes}</p>
                        )}
                        {goal.linkedPostingIds.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Linked to {goal.linkedPostingIds.length} posting(s)
                          </div>
                        )}
                        {goal.linkedConnectionIds.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Linked to {goal.linkedConnectionIds.length} connection(s)
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          Created: {new Date(goal.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onGoalDelete?.(goal.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
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
