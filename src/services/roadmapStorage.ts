import {
  Posting,
  Connection,
  Goal,
  GoalStop,
  GoalStopItem,
  GoalStopProgress,
  ApplicationGoalItem,
  InterviewItem,
  OfferDeadlineItem,
  FollowUpItem,
  GoalItem,
  SnoozeDuration,
} from '@/types';

// Storage key for goals
export const GOALS_STORAGE_KEY = 'goals';

// ============ Date Utilities ============

/**
 * Get the start of the week (Monday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format a week label like "Week of Feb 24"
 */
function formatWeekLabel(date: Date): string {
  const weekStart = getWeekStart(date);
  const month = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const day = weekStart.getDate();
  return `Week of ${month} ${day}`;
}

/**
 * Get a unique key for a week (YYYY-WW format)
 */
function getWeekKey(date: Date): string {
  const weekStart = getWeekStart(date);
  const year = weekStart.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((weekStart.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNum.toString().padStart(2, '0')}`;
}

/**
 * Parse an ISO date string to Date object
 */
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// ============ Item Extraction Functions ============

/**
 * Extract application goal items from postings with applicationGoalDate
 */
function extractApplicationGoals(postings: Posting[]): ApplicationGoalItem[] {
  return postings
    .filter((p) => p.applicationGoalDate && (p.status === 'saved' || p.status === 'in_progress'))
    .map((p) => {
      const date = parseDate(p.applicationGoalDate);
      if (!date) return null;

      // Check if snoozed
      if (p.snoozedUntil) {
        const snoozedUntil = parseDate(p.snoozedUntil);
        if (snoozedUntil && snoozedUntil > new Date()) {
          return null; // Item is snoozed
        }
      }

      return {
        id: `app-goal-${p.id}`,
        type: 'application-goal' as const,
        date,
        completed: false, // Application goals aren't completed until status changes
        posting: p,
      };
    })
    .filter((item): item is ApplicationGoalItem => item !== null);
}

/**
 * Extract interview items from postings with scheduled interviews
 */
function extractInterviews(postings: Posting[]): InterviewItem[] {
  const items: InterviewItem[] = [];

  postings
    .filter((p) => p.status === 'interviewing' && p.interviews && p.interviews.length > 0)
    .forEach((p) => {
      p.interviews?.forEach((interview) => {
        if (!interview.date) return;

        const date = parseDate(interview.date);
        if (!date) return;

        items.push({
          id: `interview-${p.id}-${interview.id}`,
          type: 'interview' as const,
          date,
          completed: interview.completed,
          posting: p,
          interview,
        });
      });
    });

  return items;
}

/**
 * Extract offer deadline items from postings with offers
 */
function extractOfferDeadlines(postings: Posting[]): OfferDeadlineItem[] {
  return postings
    .filter((p) => p.status === 'offer')
    .map((p) => {
      // Look for nextActionDate as offer deadline
      const deadlineStr = p.nextActionDate;
      if (!deadlineStr) return null;

      const date = parseDate(deadlineStr);
      if (!date) return null;

      return {
        id: `offer-deadline-${p.id}`,
        type: 'offer-deadline' as const,
        date,
        completed: false,
        posting: p,
        deadline: deadlineStr,
      };
    })
    .filter((item): item is OfferDeadlineItem => item !== null);
}

/**
 * Extract follow-up items from connections with nextFollowUp
 */
function extractFollowUps(connections: Connection[]): FollowUpItem[] {
  return connections
    .filter((c) => c.nextFollowUp)
    .map((c) => {
      const date = parseDate(c.nextFollowUp);
      if (!date) return null;

      return {
        id: `followup-${c.id}`,
        type: 'follow-up' as const,
        date,
        completed: false,
        connection: c,
      };
    })
    .filter((item): item is FollowUpItem => item !== null);
}

/**
 * Extract goal items from standalone goals
 */
function extractGoals(goals: Goal[]): GoalItem[] {
  return goals
    .map((g) => {
      const date = parseDate(g.dueDate);
      if (!date) return null;

      return {
        id: `goal-${g.id}`,
        type: 'goal' as const,
        date,
        completed: g.completed,
        goal: g,
      };
    })
    .filter((item): item is GoalItem => item !== null);
}

// ============ Main Aggregation Function ============

/**
 * Aggregate all timed items into weekly goal stops
 */
export function aggregateGoalStops(
  postings: Posting[],
  connections: Connection[],
  goals: Goal[]
): GoalStop[] {
  // Extract all items
  const applicationGoals = extractApplicationGoals(postings);
  const interviews = extractInterviews(postings);
  const offerDeadlines = extractOfferDeadlines(postings);
  const followUps = extractFollowUps(connections);
  const goalItems = extractGoals(goals);

  // Combine all items
  const allItems: GoalStopItem[] = [
    ...applicationGoals,
    ...interviews,
    ...offerDeadlines,
    ...followUps,
    ...goalItems,
  ];

  // Group items by week
  const weekGroups = new Map<string, GoalStopItem[]>();

  allItems.forEach((item) => {
    const weekKey = getWeekKey(item.date);
    const existing = weekGroups.get(weekKey) || [];
    existing.push(item);
    weekGroups.set(weekKey, existing);
  });

  // Convert groups to GoalStop objects
  const goalStops: GoalStop[] = [];

  weekGroups.forEach((items, weekKey) => {
    // Sort items within the week by date
    items.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate progress
    const progress: GoalStopProgress = {
      completed: items.filter((i) => i.completed).length,
      total: items.length,
    };

    // Use the first item's date for the week label
    const firstItemDate = items[0].date;

    goalStops.push({
      id: weekKey,
      date: getWeekStart(firstItemDate),
      weekLabel: formatWeekLabel(firstItemDate),
      items,
      progress,
    });
  });

  // Sort goal stops by date
  goalStops.sort((a, b) => a.date.getTime() - b.date.getTime());

  return goalStops;
}

// ============ Item Action Functions ============

/**
 * Mark an application goal as complete (advances posting status)
 */
export function completeApplicationGoal(
  posting: Posting
): Partial<Posting> {
  return {
    applicationGoalDate: undefined,
    status: posting.status === 'saved' ? 'in_progress' : 'applied',
    dateModified: Date.now(),
    dateApplied: posting.status === 'in_progress' ? Date.now() : posting.dateApplied,
  };
}

/**
 * Mark an interview as complete
 */
export function completeInterview(
  posting: Posting,
  interviewId: string
): Partial<Posting> {
  const interviews = posting.interviews?.map((i) =>
    i.id === interviewId ? { ...i, completed: true } : i
  );
  return {
    interviews,
    dateModified: Date.now(),
  };
}

/**
 * Mark a follow-up as complete (adds to contact history, clears nextFollowUp)
 */
export function completeFollowUp(
  connection: Connection
): Partial<Connection> {
  const now = new Date().toISOString().split('T')[0];
  return {
    contactHistory: [
      ...connection.contactHistory,
      {
        id: `event-${Date.now()}`,
        date: now,
        type: 'other',
        notes: 'Follow-up completed',
      },
    ],
    lastContactDate: now,
    nextFollowUp: undefined,
    dateModified: Date.now(),
  };
}

/**
 * Mark a goal as complete
 */
export function completeGoal(_goal: Goal): Partial<Goal> {
  return {
    completed: true,
    completedAt: Date.now(),
  };
}

/**
 * Snooze an item by pushing its date forward
 */
export function snoozeItem(
  item: GoalStopItem,
  days: SnoozeDuration
): { type: 'posting' | 'connection' | 'goal'; id: string; updates: Record<string, unknown> } {
  const newDate = new Date(item.date);
  newDate.setDate(newDate.getDate() + days);
  const newDateStr = newDate.toISOString().split('T')[0];

  switch (item.type) {
    case 'application-goal':
      return {
        type: 'posting',
        id: item.posting.id,
        updates: { snoozedUntil: newDateStr },
      };
    case 'interview':
      // Can't really snooze interviews, but we can update the date
      return {
        type: 'posting',
        id: item.posting.id,
        updates: {
          interviews: item.posting.interviews?.map((i) =>
            i.id === item.interview.id ? { ...i, date: newDateStr } : i
          ),
        },
      };
    case 'offer-deadline':
      return {
        type: 'posting',
        id: item.posting.id,
        updates: { nextActionDate: newDateStr },
      };
    case 'follow-up':
      return {
        type: 'connection',
        id: item.connection.id,
        updates: { nextFollowUp: newDateStr },
      };
    case 'goal':
      return {
        type: 'goal',
        id: item.goal.id,
        updates: { dueDate: newDateStr },
      };
  }
}

// ============ Goals Storage Functions ============

/**
 * Get all goals from storage
 */
export async function getGoals(): Promise<Goal[]> {
  const result = await chrome.storage.local.get(GOALS_STORAGE_KEY);
  return result[GOALS_STORAGE_KEY] || [];
}

/**
 * Save all goals to storage
 */
export async function saveGoals(goals: Goal[]): Promise<void> {
  await chrome.storage.local.set({ [GOALS_STORAGE_KEY]: goals });
}

/**
 * Save a single goal (creates or updates)
 */
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

/**
 * Delete a goal
 */
export async function deleteGoal(id: string): Promise<void> {
  const goals = await getGoals();
  const filtered = goals.filter((g) => g.id !== id);
  await saveGoals(filtered);
}

// ============ Utility Functions ============

/**
 * Get items that are due soon (within specified days)
 */
export function getUpcomingItems(
  goalStops: GoalStop[],
  withinDays: number = 7
): GoalStopItem[] {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  const items: GoalStopItem[] = [];

  goalStops.forEach((stop) => {
    stop.items.forEach((item) => {
      if (!item.completed && item.date >= now && item.date <= cutoff) {
        items.push(item);
      }
    });
  });

  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get overdue items (past due date, not completed)
 */
export function getOverdueItems(goalStops: GoalStop[]): GoalStopItem[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const items: GoalStopItem[] = [];

  goalStops.forEach((stop) => {
    stop.items.forEach((item) => {
      if (!item.completed && item.date < now) {
        items.push(item);
      }
    });
  });

  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get summary stats for the roadmap
 */
export function getRoadmapStats(goalStops: GoalStop[]): {
  totalItems: number;
  completedItems: number;
  overdueItems: number;
  upcomingThisWeek: number;
} {
  let totalItems = 0;
  let completedItems = 0;

  goalStops.forEach((stop) => {
    totalItems += stop.items.length;
    completedItems += stop.progress.completed;
  });

  const overdueItems = getOverdueItems(goalStops).length;
  const upcomingThisWeek = getUpcomingItems(goalStops, 7).length;

  return {
    totalItems,
    completedItems,
    overdueItems,
    upcomingThisWeek,
  };
}
