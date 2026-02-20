import { Goal, TimelineEvent, GoalAnalytics, NotificationSettings, RoadmapSettings } from '@/types';

export const ROADMAP_STORAGE_KEYS = {
  GOALS: 'jobflow_goals',
  COMPLETED_GOALS: 'jobflow_completed_goals',
  TIMELINE_EVENTS: 'jobflow_timeline_events',
  NOTIFICATION_SETTINGS: 'jobflow_notification_settings',
  ROADMAP_SETTINGS: 'jobflow_roadmap_settings',
  GOAL_ANALYTICS: 'jobflow_goal_analytics',
} as const;

// ============ Goals ============

export async function getGoals(): Promise<Goal[]> {
  const result = await chrome.storage.local.get(ROADMAP_STORAGE_KEYS.GOALS);
  return result[ROADMAP_STORAGE_KEYS.GOALS] || [];
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await chrome.storage.local.set({ [ROADMAP_STORAGE_KEYS.GOALS]: goals });
}

export async function saveGoal(goal: Goal): Promise<void> {
  const goals = await getGoals();
  const index = goals.findIndex((g) => g.id === goal.id);

  if (index >= 0) {
    goals[index] = goal;
  } else {
    goals.push(goal);
  }

  await saveGoals(goals);
}

export async function deleteGoal(id: string): Promise<void> {
  const goals = await getGoals();
  const filtered = goals.filter((g) => g.id !== id);
  await saveGoals(filtered);
}

export async function completeGoal(id: string): Promise<void> {
  const goals = await getGoals();
  const goalIndex = goals.findIndex((g) => g.id === id);

  if (goalIndex >= 0) {
    const goal = goals[goalIndex];
    const completedGoal = {
      ...goal,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    // Update in active goals
    goals[goalIndex] = completedGoal;
    await saveGoals(goals);

    // Also add to completed goals archive
    const completedGoals = await getCompletedGoals();
    completedGoals.push(completedGoal);
    await saveCompletedGoals(completedGoals);

    // Update analytics
    await updateGoalAnalyticsOnCompletion(completedGoal);
  }
}

// ============ Completed Goals Archive ============

export async function getCompletedGoals(): Promise<Goal[]> {
  const result = await chrome.storage.local.get(ROADMAP_STORAGE_KEYS.COMPLETED_GOALS);
  return result[ROADMAP_STORAGE_KEYS.COMPLETED_GOALS] || [];
}

export async function saveCompletedGoals(goals: Goal[]): Promise<void> {
  await chrome.storage.local.set({ [ROADMAP_STORAGE_KEYS.COMPLETED_GOALS]: goals });
}

// ============ Timeline Events ============

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const result = await chrome.storage.local.get(ROADMAP_STORAGE_KEYS.TIMELINE_EVENTS);
  return result[ROADMAP_STORAGE_KEYS.TIMELINE_EVENTS] || [];
}

export async function saveTimelineEvents(events: TimelineEvent[]): Promise<void> {
  await chrome.storage.local.set({ [ROADMAP_STORAGE_KEYS.TIMELINE_EVENTS]: events });
}

export async function addTimelineEvent(event: TimelineEvent): Promise<void> {
  const events = await getTimelineEvents();
  events.push(event);
  await saveTimelineEvents(events);
}

export async function deleteTimelineEvent(id: string): Promise<void> {
  const events = await getTimelineEvents();
  const filtered = events.filter((e) => e.id !== id);
  await saveTimelineEvents(filtered);
}

// ============ Notification Settings ============

export function getDefaultNotificationSettings(): NotificationSettings {
  return {
    enabled: true,
    goalReminders: true,
    interviewReminders: true,
    offerDeadlines: true,
    weeklySummary: false,
    networkingNudges: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    goalReminderTiming: 1440,  // 1 day = 1440 minutes
    interviewReminderTiming: 60,  // 1 hour
  };
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const result = await chrome.storage.local.get(ROADMAP_STORAGE_KEYS.NOTIFICATION_SETTINGS);
  return result[ROADMAP_STORAGE_KEYS.NOTIFICATION_SETTINGS] || getDefaultNotificationSettings();
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await chrome.storage.local.set({ [ROADMAP_STORAGE_KEYS.NOTIFICATION_SETTINGS]: settings });
}

// ============ Roadmap Settings ============

export function getDefaultRoadmapSettings(): RoadmapSettings {
  return {
    defaultZoom: 'month',
    showConnections: true,
    showCompletedGoals: false,
    defaultView: 'timeline',
  };
}

export async function getRoadmapSettings(): Promise<RoadmapSettings> {
  const result = await chrome.storage.local.get(ROADMAP_STORAGE_KEYS.ROADMAP_SETTINGS);
  return result[ROADMAP_STORAGE_KEYS.ROADMAP_SETTINGS] || getDefaultRoadmapSettings();
}

export async function saveRoadmapSettings(settings: RoadmapSettings): Promise<void> {
  await chrome.storage.local.set({ [ROADMAP_STORAGE_KEYS.ROADMAP_SETTINGS]: settings });
}

// ============ Goal Analytics ============

export function getDefaultGoalAnalytics(): GoalAnalytics {
  return {
    totalGoalsCreated: 0,
    totalGoalsCompleted: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageCompletionTime: 0,
    goalsByType: {
      application: { created: 0, completed: 0 },
      networking: { created: 0, completed: 0 },
      interview: { created: 0, completed: 0 },
      followup: { created: 0, completed: 0 },
      custom: { created: 0, completed: 0 },
    },
    weeklyCompletions: [],
  };
}

export async function getGoalAnalytics(): Promise<GoalAnalytics> {
  const result = await chrome.storage.local.get(ROADMAP_STORAGE_KEYS.GOAL_ANALYTICS);
  return result[ROADMAP_STORAGE_KEYS.GOAL_ANALYTICS] || getDefaultGoalAnalytics();
}

export async function saveGoalAnalytics(analytics: GoalAnalytics): Promise<void> {
  await chrome.storage.local.set({ [ROADMAP_STORAGE_KEYS.GOAL_ANALYTICS]: analytics });
}

export async function updateGoalAnalyticsOnCreation(goal: Goal): Promise<void> {
  const analytics = await getGoalAnalytics();

  analytics.totalGoalsCreated++;
  analytics.goalsByType[goal.type].created++;
  analytics.completionRate = analytics.totalGoalsCompleted / analytics.totalGoalsCreated;

  await saveGoalAnalytics(analytics);
}

export async function updateGoalAnalyticsOnCompletion(goal: Goal): Promise<void> {
  const analytics = await getGoalAnalytics();

  analytics.totalGoalsCompleted++;
  analytics.goalsByType[goal.type].completed++;
  analytics.completionRate = analytics.totalGoalsCompleted / analytics.totalGoalsCreated;

  // Calculate completion time
  if (goal.completedAt && goal.createdAt) {
    const completionTime = (new Date(goal.completedAt).getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const totalCompletionTime = analytics.averageCompletionTime * (analytics.totalGoalsCompleted - 1) + completionTime;
    analytics.averageCompletionTime = totalCompletionTime / analytics.totalGoalsCompleted;
  }

  // Update weekly completions
  const weekStart = getWeekStart(new Date());
  const weekKey = weekStart.toISOString().split('T')[0];
  const weekIndex = analytics.weeklyCompletions.findIndex((w) => w.week === weekKey);

  if (weekIndex >= 0) {
    analytics.weeklyCompletions[weekIndex].count++;
  } else {
    analytics.weeklyCompletions.push({ week: weekKey, count: 1 });
    // Keep only last 12 weeks
    if (analytics.weeklyCompletions.length > 12) {
      analytics.weeklyCompletions = analytics.weeklyCompletions.slice(-12);
    }
  }

  // Update streak
  analytics.currentStreak = await calculateCurrentStreak();
  if (analytics.currentStreak > analytics.longestStreak) {
    analytics.longestStreak = analytics.currentStreak;
  }

  await saveGoalAnalytics(analytics);
}

async function calculateCurrentStreak(): Promise<number> {
  const completedGoals = await getCompletedGoals();
  if (completedGoals.length === 0) return 0;

  // Group completions by date
  const completionDates = new Set<string>();
  completedGoals.forEach((goal) => {
    if (goal.completedAt) {
      completionDates.add(goal.completedAt.split('T')[0]);
    }
  });

  // Sort dates descending
  const sortedDates = Array.from(completionDates).sort().reverse();

  // Count consecutive days from today
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === i) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ============ Recurring Goals ============

export async function processRecurringGoals(): Promise<Goal[]> {
  const goals = await getGoals();
  const newGoals: Goal[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const goal of goals) {
    if (!goal.isRecurring || !goal.recurringPattern || !goal.completed) continue;

    // Check if it's time to create a new instance
    const { frequency, interval, endDate } = goal.recurringPattern;

    // Don't create if past end date
    if (endDate && new Date(endDate) < today) continue;

    const completedDate = goal.completedAt ? new Date(goal.completedAt) : today;
    let nextDueDate: Date;

    switch (frequency) {
      case 'daily':
        nextDueDate = new Date(completedDate);
        nextDueDate.setDate(nextDueDate.getDate() + interval);
        break;
      case 'weekly':
        nextDueDate = new Date(completedDate);
        nextDueDate.setDate(nextDueDate.getDate() + (interval * 7));
        break;
      case 'monthly':
        nextDueDate = new Date(completedDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + interval);
        break;
      default:
        continue;
    }

    // If next due date is today or in the past, create new goal
    if (nextDueDate <= today) {
      const newGoal: Goal = {
        ...goal,
        id: `${goal.id}-${Date.now()}`,
        completed: false,
        completedAt: undefined,
        currentCount: 0,
        createdAt: new Date().toISOString(),
        dueDate: nextDueDate.toISOString(),
        reminders: goal.reminders.map((r) => ({ ...r, sent: false, dismissed: false })),
      };
      newGoals.push(newGoal);
    }
  }

  if (newGoals.length > 0) {
    const updatedGoals = [...goals, ...newGoals];
    await saveGoals(updatedGoals);
  }

  return newGoals;
}

// ============ Recalculate Analytics ============

export async function recalculateGoalAnalytics(): Promise<GoalAnalytics> {
  const goals = await getGoals();
  const completedGoals = await getCompletedGoals();
  const allGoals = [...goals, ...completedGoals];

  const analytics: GoalAnalytics = getDefaultGoalAnalytics();

  // Count goals
  allGoals.forEach((goal) => {
    analytics.totalGoalsCreated++;
    analytics.goalsByType[goal.type].created++;

    if (goal.completed) {
      analytics.totalGoalsCompleted++;
      analytics.goalsByType[goal.type].completed++;
    }
  });

  // Calculate completion rate
  analytics.completionRate = analytics.totalGoalsCreated > 0
    ? analytics.totalGoalsCompleted / analytics.totalGoalsCreated
    : 0;

  // Calculate average completion time
  const completionTimes: number[] = [];
  completedGoals.forEach((goal) => {
    if (goal.completedAt && goal.createdAt) {
      const time = (new Date(goal.completedAt).getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      completionTimes.push(time);
    }
  });

  analytics.averageCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
    : 0;

  // Calculate weekly completions (last 12 weeks)
  const weeklyMap = new Map<string, number>();
  completedGoals.forEach((goal) => {
    if (goal.completedAt) {
      const weekStart = getWeekStart(new Date(goal.completedAt));
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1);
    }
  });

  analytics.weeklyCompletions = Array.from(weeklyMap.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12);

  // Calculate streak
  analytics.currentStreak = await calculateCurrentStreak();

  // For longest streak, we need to iterate through all completion dates
  const completionDates = new Set<string>();
  completedGoals.forEach((goal) => {
    if (goal.completedAt) {
      completionDates.add(goal.completedAt.split('T')[0]);
    }
  });

  const sortedDates = Array.from(completionDates).sort();
  let currentStreak = 1;
  let maxStreak = sortedDates.length > 0 ? 1 : 0;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  analytics.longestStreak = maxStreak;

  await saveGoalAnalytics(analytics);
  return analytics;
}
