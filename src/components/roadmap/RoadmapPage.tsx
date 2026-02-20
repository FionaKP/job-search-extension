import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Posting, Goal, TimelineEvent, Connection, GoalAnalytics, RoadmapSettings } from '@/types';
import { Timeline, ZoomLevel } from './Timeline';
import { GoalsList } from './GoalsList';
import { ThisWeek } from './ThisWeek';
import { GoalModal } from './GoalModal';
import {
  getGoals,
  saveGoal,
  deleteGoal,
  completeGoal,
  getTimelineEvents,
  getGoalAnalytics,
  getRoadmapSettings,
  saveRoadmapSettings,
  updateGoalAnalyticsOnCreation,
  recalculateGoalAnalytics,
} from '@/services/roadmapStorage';

interface RoadmapPageProps {
  postings: Posting[];
  connections: Connection[];
  onPostingClick?: (postingId: string) => void;
  onConnectionClick?: (connectionId: string) => void;
}

type ViewMode = 'timeline' | 'board';

export const RoadmapPage: React.FC<RoadmapPageProps> = ({
  postings,
  connections,
  onPostingClick,
  onConnectionClick,
}) => {
  // Data state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [analytics, setAnalytics] = useState<GoalAnalytics | null>(null);
  const [settings, setSettings] = useState<RoadmapSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('month');
  const [showCompleted, setShowCompleted] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [defaultGoalDate, setDefaultGoalDate] = useState<string | undefined>();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedGoals, loadedEvents, loadedAnalytics, loadedSettings] = await Promise.all([
          getGoals(),
          getTimelineEvents(),
          getGoalAnalytics(),
          getRoadmapSettings(),
        ]);

        setGoals(loadedGoals);
        setEvents(loadedEvents);
        setAnalytics(loadedAnalytics);
        setSettings(loadedSettings);
        setZoomLevel(loadedSettings.defaultZoom);
        setViewMode(loadedSettings.defaultView);
        setShowCompleted(loadedSettings.showCompletedGoals);
      } catch (error) {
        console.error('Failed to load roadmap data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save goal handler
  const handleSaveGoal = useCallback(async (goal: Goal) => {
    try {
      const isNew = !goals.find((g) => g.id === goal.id);
      await saveGoal(goal);

      if (isNew) {
        await updateGoalAnalyticsOnCreation(goal);
      }

      // Refresh data
      const [updatedGoals, updatedAnalytics] = await Promise.all([
        getGoals(),
        getGoalAnalytics(),
      ]);
      setGoals(updatedGoals);
      setAnalytics(updatedAnalytics);
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  }, [goals]);

  // Delete goal handler
  const handleDeleteGoal = useCallback(async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  }, []);

  // Complete goal handler
  const handleCompleteGoal = useCallback(async (goalId: string) => {
    try {
      await completeGoal(goalId);

      // Refresh data
      const [updatedGoals, updatedAnalytics] = await Promise.all([
        getGoals(),
        getGoalAnalytics(),
      ]);
      setGoals(updatedGoals);
      setAnalytics(updatedAnalytics);
    } catch (error) {
      console.error('Failed to complete goal:', error);
    }
  }, []);

  // Update goal handler
  const handleUpdateGoal = useCallback(async (goalId: string, updates: Partial<Goal>) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedGoal = { ...goal, ...updates };
    await handleSaveGoal(updatedGoal);
  }, [goals, handleSaveGoal]);

  // Snooze goal handler
  const handleSnoozeGoal = useCallback(async (goalId: string, days: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newDueDate = new Date(goal.dueDate);
    newDueDate.setDate(newDueDate.getDate() + days);

    await handleUpdateGoal(goalId, { dueDate: newDueDate.toISOString() });
  }, [goals, handleUpdateGoal]);

  // Goal drag and drop on timeline
  const handleGoalDrop = useCallback(async (goalId: string, newDate: string) => {
    await handleUpdateGoal(goalId, { dueDate: newDate });
  }, [handleUpdateGoal]);

  // Open goal modal for creation
  const handleAddGoal = useCallback((date?: string) => {
    setEditingGoal(null);
    setDefaultGoalDate(date);
    setGoalModalOpen(true);
  }, []);

  // Open goal modal for editing
  const handleEditGoal = useCallback((goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setEditingGoal(goal);
      setGoalModalOpen(true);
    }
  }, [goals]);

  // Handle zoom change
  const handleZoomChange = useCallback(async (zoom: ZoomLevel) => {
    setZoomLevel(zoom);
    if (settings) {
      const updatedSettings = { ...settings, defaultZoom: zoom };
      await saveRoadmapSettings(updatedSettings);
      setSettings(updatedSettings);
    }
  }, [settings]);

  // Handle show completed change
  const handleShowCompletedChange = useCallback(async (show: boolean) => {
    setShowCompleted(show);
    if (settings) {
      const updatedSettings = { ...settings, showCompletedGoals: show };
      await saveRoadmapSettings(updatedSettings);
      setSettings(updatedSettings);
    }
  }, [settings]);

  // Filter goals based on settings
  const filteredGoals = useMemo(() => {
    if (showCompleted) return goals;
    return goals.filter((g) => !g.completed);
  }, [goals, showCompleted]);

  // Recalculate analytics on demand
  const handleRecalculateAnalytics = useCallback(async () => {
    try {
      const updated = await recalculateGoalAnalytics();
      setAnalytics(updated);
    } catch (error) {
      console.error('Failed to recalculate analytics:', error);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-wine border-t-transparent"></div>
          <p className="mt-2 text-wine/70">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-wine/10 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-wine flex items-center gap-2">
            <svg className="h-6 w-6 text-wine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Your Job Search Roadmap
          </h1>
          <div className="flex rounded-lg border border-wine/20 bg-champagne-50 p-0.5">
            <button
              onClick={() => setViewMode('timeline')}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-wine shadow-sm'
                  : 'text-wine/60 hover:text-wine'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                viewMode === 'board'
                  ? 'bg-white text-wine shadow-sm'
                  : 'text-wine/60 hover:text-wine'
              }`}
            >
              Board
            </button>
          </div>
        </div>
        <button
          onClick={() => handleAddGoal()}
          className="flex items-center gap-2 rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white hover:bg-wine/90 transition-colors"
        >
          <span>+</span>
          <span>Add Goal</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'timeline' ? (
          <div className="h-full flex flex-col lg:flex-row">
            {/* Timeline Section */}
            <div className="flex-1 overflow-auto p-6">
              <Timeline
                postings={postings}
                goals={filteredGoals}
                events={events}
                zoomLevel={zoomLevel}
                onZoomChange={handleZoomChange}
                onPostingClick={onPostingClick}
                onGoalClick={handleEditGoal}
                onEventClick={(eventId) => console.log('Event clicked:', eventId)}
                onCreateGoal={handleAddGoal}
                onGoalDrop={handleGoalDrop}
              />
            </div>

            {/* Side Panels */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-wine/10 bg-champagne-50 overflow-auto">
              <div className="p-4 space-y-6">
                {/* This Week */}
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <ThisWeek
                    postings={postings}
                    goals={filteredGoals}
                    events={events}
                    connections={connections}
                    onPostingClick={onPostingClick}
                    onGoalClick={handleEditGoal}
                    onGoalComplete={handleCompleteGoal}
                    onConnectionClick={onConnectionClick}
                    onSnoozeGoal={handleSnoozeGoal}
                  />
                </div>

                {/* Goals Summary */}
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-end mb-2">
                    <button
                      onClick={handleRecalculateAnalytics}
                      className="text-xs text-wine/60 hover:text-wine"
                      title="Refresh analytics"
                    >
                      Refresh Stats
                    </button>
                  </div>
                  <GoalsList
                    goals={goals}
                    analytics={analytics || undefined}
                    onGoalClick={handleEditGoal}
                    onGoalComplete={handleCompleteGoal}
                    onGoalDelete={handleDeleteGoal}
                    onGoalUpdate={handleUpdateGoal}
                    onAddGoal={() => handleAddGoal()}
                    showCompleted={showCompleted}
                    onShowCompletedChange={handleShowCompletedChange}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Board View - Kanban-style goals */
          <div className="h-full overflow-auto p-6">
            <BoardView
              goals={filteredGoals}
              onGoalClick={handleEditGoal}
              onGoalComplete={handleCompleteGoal}
              onGoalDelete={handleDeleteGoal}
              onGoalUpdate={handleUpdateGoal}
              onAddGoal={handleAddGoal}
            />
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => {
          setGoalModalOpen(false);
          setEditingGoal(null);
          setDefaultGoalDate(undefined);
        }}
        onSave={handleSaveGoal}
        goal={editingGoal}
        postings={postings}
        connections={connections}
        existingGoals={goals}
        defaultDate={defaultGoalDate}
      />
    </div>
  );
};

// Board View Component
interface BoardViewProps {
  goals: Goal[];
  onGoalClick: (goalId: string) => void;
  onGoalComplete: (goalId: string) => void;
  onGoalDelete: (goalId: string) => void;
  onGoalUpdate: (goalId: string, updates: Partial<Goal>) => void;
  onAddGoal: (date?: string) => void;
}

const BoardView: React.FC<BoardViewProps> = ({
  goals,
  onGoalClick,
  onGoalComplete,
  onGoalDelete: _onGoalDelete,
  onGoalUpdate: _onGoalUpdate,
  onAddGoal,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const endOfNextWeek = new Date(endOfWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

  // Categorize goals
  const columns = useMemo(() => {
    const thisWeek: Goal[] = [];
    const nextWeek: Goal[] = [];
    const later: Goal[] = [];
    const completed: Goal[] = [];

    goals.forEach((goal) => {
      if (goal.completed) {
        completed.push(goal);
        return;
      }

      const dueDate = new Date(goal.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < endOfWeek) {
        thisWeek.push(goal);
      } else if (dueDate < endOfNextWeek) {
        nextWeek.push(goal);
      } else {
        later.push(goal);
      }
    });

    // Sort each column by due date
    const sortByDueDate = (a: Goal, b: Goal) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

    return {
      thisWeek: thisWeek.sort(sortByDueDate),
      nextWeek: nextWeek.sort(sortByDueDate),
      later: later.sort(sortByDueDate),
      completed: completed.slice(0, 5), // Show only recent 5 completed
    };
  }, [goals, endOfWeek, endOfNextWeek]);

  const renderColumn = (
    title: string,
    goals: Goal[],
    _columnKey: string,
    showAdd: boolean = true
  ) => (
    <div className="flex flex-col min-w-[280px] max-w-[320px] bg-champagne-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-wine flex items-center gap-2">
          {title}
          <span className="rounded-full bg-wine/10 px-2 py-0.5 text-xs">
            {goals.length}
          </span>
        </h3>
        {showAdd && (
          <button
            onClick={() => onAddGoal()}
            className="rounded p-1 text-wine/60 hover:bg-wine/10 hover:text-wine"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {goals.map((goal) => {
          const dueDate = new Date(goal.dueDate);
          const isOverdue = !goal.completed && dueDate < today;
          const progress = goal.targetCount
            ? Math.round((goal.currentCount / goal.targetCount) * 100)
            : null;

          return (
            <div
              key={goal.id}
              className={`rounded-lg border bg-white p-3 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                isOverdue ? 'border-flatred-200' : 'border-wine/10'
              } ${goal.completed ? 'opacity-60' : ''}`}
              onClick={() => onGoalClick(goal.id)}
            >
              <div className="flex items-start gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!goal.completed) onGoalComplete(goal.id);
                  }}
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    goal.completed
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : 'border-sage-300 hover:border-wine'
                  }`}
                >
                  {goal.completed && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${goal.completed ? 'line-through text-wine/40' : 'text-wine'}`}>
                    {goal.title}
                  </div>
                  <div className={`text-xs mt-1 ${isOverdue ? 'text-flatred' : 'text-wine/60'}`}>
                    {isOverdue ? 'Overdue: ' : ''}
                    {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  {progress !== null && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-champagne-200">
                        <div
                          className={`h-full rounded-full ${
                            goal.completed ? 'bg-teal-500' : isOverdue ? 'bg-flatred-400' : 'bg-wine'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      <div className="text-xs text-wine/50 mt-0.5">
                        {goal.currentCount}/{goal.targetCount}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="py-8 text-center text-sm text-wine/40">
            No goals
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {renderColumn('This Week', columns.thisWeek, 'thisWeek')}
      {renderColumn('Next Week', columns.nextWeek, 'nextWeek')}
      {renderColumn('Later', columns.later, 'later')}
      {renderColumn('Completed', columns.completed, 'completed', false)}
    </div>
  );
};

export default RoadmapPage;
