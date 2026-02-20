import { useState, useEffect, useCallback, useMemo } from 'react';
import { Posting, Connection, Goal, GoalStopItem, SnoozeDuration } from '@/types';
import { Timeline } from './Timeline';
import {
  aggregateGoalStops,
  completeApplicationGoal,
  completeInterview,
  completeFollowUp,
  completeGoal,
  snoozeItem,
  getGoals,
  saveGoals,
  getRoadmapStats,
} from '@/services/roadmapStorage';
import { getPostings, savePosting, getConnections, saveConnection } from '@/services/storage';

interface RoadmapPageProps {
  postings: Posting[];
  connections: Connection[];
  onPostingsChange: (postings: Posting[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
  onNavigateToPosting: (postingId: string) => void;
  onNavigateToConnection: (connectionId: string) => void;
}

export function RoadmapPage({
  postings,
  connections,
  onPostingsChange,
  onConnectionsChange,
  onNavigateToPosting,
  onNavigateToConnection,
}: RoadmapPageProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load goals on mount
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const loadedGoals = await getGoals();
        setGoals(loadedGoals);
      } catch (err) {
        console.error('Failed to load goals:', err);
        setError('Failed to load goals');
      } finally {
        setIsLoading(false);
      }
    };

    loadGoals();
  }, []);

  // Aggregate goal stops from all data sources
  const goalStops = useMemo(() => {
    return aggregateGoalStops(postings, connections, goals);
  }, [postings, connections, goals]);

  // Get roadmap stats
  const stats = useMemo(() => {
    return getRoadmapStats(goalStops);
  }, [goalStops]);

  // Handle item click - navigate to the relevant detail view
  const handleItemClick = useCallback(
    (item: GoalStopItem) => {
      switch (item.type) {
        case 'application-goal':
        case 'interview':
        case 'offer-deadline':
          onNavigateToPosting(item.posting.id);
          break;
        case 'follow-up':
          onNavigateToConnection(item.connection.id);
          break;
        case 'goal':
          // Could open a goal detail modal here
          console.log('Goal clicked:', item.goal);
          break;
      }
    },
    [onNavigateToPosting, onNavigateToConnection]
  );

  // Handle item completion
  const handleItemComplete = useCallback(
    async (item: GoalStopItem) => {
      try {
        switch (item.type) {
          case 'application-goal': {
            const updates = completeApplicationGoal(item.posting);
            const updatedPosting = { ...item.posting, ...updates };
            await savePosting(updatedPosting);
            const freshPostings = await getPostings();
            onPostingsChange(freshPostings);
            break;
          }

          case 'interview': {
            const updates = completeInterview(item.posting, item.interview.id);
            const updatedPosting = { ...item.posting, ...updates };
            await savePosting(updatedPosting);
            const freshPostings = await getPostings();
            onPostingsChange(freshPostings);
            break;
          }

          case 'offer-deadline': {
            // For offer deadlines, we might want to advance to accepted/rejected
            // For now, just navigate to the posting for manual handling
            onNavigateToPosting(item.posting.id);
            break;
          }

          case 'follow-up': {
            const updates = completeFollowUp(item.connection);
            const updatedConnection = { ...item.connection, ...updates };
            await saveConnection(updatedConnection);
            const freshConnections = await getConnections();
            onConnectionsChange(freshConnections);
            break;
          }

          case 'goal': {
            const updates = completeGoal(item.goal);
            const updatedGoal = { ...item.goal, ...updates };
            const updatedGoals = goals.map((g) =>
              g.id === updatedGoal.id ? updatedGoal : g
            );
            await saveGoals(updatedGoals);
            setGoals(updatedGoals);
            break;
          }
        }
      } catch (err) {
        console.error('Failed to complete item:', err);
        setError('Failed to complete item');
      }
    },
    [goals, onPostingsChange, onConnectionsChange, onNavigateToPosting]
  );

  // Handle item snooze
  const handleItemSnooze = useCallback(
    async (item: GoalStopItem, days: SnoozeDuration) => {
      try {
        const snoozeResult = snoozeItem(item, days);

        switch (snoozeResult.type) {
          case 'posting': {
            const posting = postings.find((p) => p.id === snoozeResult.id);
            if (posting) {
              const updatedPosting = { ...posting, ...snoozeResult.updates, dateModified: Date.now() };
              await savePosting(updatedPosting);
              const freshPostings = await getPostings();
              onPostingsChange(freshPostings);
            }
            break;
          }

          case 'connection': {
            const connection = connections.find((c) => c.id === snoozeResult.id);
            if (connection) {
              const updatedConnection = { ...connection, ...snoozeResult.updates, dateModified: Date.now() };
              await saveConnection(updatedConnection);
              const freshConnections = await getConnections();
              onConnectionsChange(freshConnections);
            }
            break;
          }

          case 'goal': {
            const goal = goals.find((g) => g.id === snoozeResult.id);
            if (goal) {
              const updatedGoal = { ...goal, ...snoozeResult.updates };
              const updatedGoals = goals.map((g) =>
                g.id === updatedGoal.id ? updatedGoal : g
              );
              await saveGoals(updatedGoals);
              setGoals(updatedGoals);
            }
            break;
          }
        }
      } catch (err) {
        console.error('Failed to snooze item:', err);
        setError('Failed to snooze item');
      }
    },
    [postings, connections, goals, onPostingsChange, onConnectionsChange]
  );

  // Handle adding a new goal
  const handleAddGoal = useCallback(async () => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: 'New Goal',
      notes: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
      completed: false,
      createdAt: Date.now(),
    };

    try {
      const updatedGoals = [...goals, newGoal];
      await saveGoals(updatedGoals);
      setGoals(updatedGoals);
    } catch (err) {
      console.error('Failed to add goal:', err);
      setError('Failed to add goal');
    }
  }, [goals]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-wine border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-champagne-50">
      {/* Page header */}
      <div className="border-b border-champagne-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roadmap</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your job search milestones and upcoming actions
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-wine">{stats.upcomingThisWeek}</p>
              <p className="text-xs text-gray-500">This week</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.completedItems}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            {stats.overdueItems > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-flatred">{stats.overdueItems}</p>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
            )}
          </div>

          {/* Add goal button */}
          <button
            onClick={handleAddGoal}
            className="flex items-center gap-2 rounded-lg bg-wine px-4 py-2 text-white hover:bg-wine/90 focus:outline-none focus:ring-2 focus:ring-wine/50 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Goal
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg bg-flatred/10 px-4 py-3 text-flatred">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-hidden">
        <Timeline
          goalStops={goalStops}
          onItemClick={handleItemClick}
          onItemComplete={handleItemComplete}
          onItemSnooze={handleItemSnooze}
        />
      </div>
    </div>
  );
}

export default RoadmapPage;
