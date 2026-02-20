import { Goal, NotificationSettings, Posting } from '@/types';
import { getNotificationSettings, getGoals, saveGoal } from './roadmapStorage';

// ============ Chrome Notifications API ============

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function isNotificationPermissionGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

// ============ Notification Scheduling ============

interface ScheduledNotification {
  id: string;
  type: 'goal' | 'interview' | 'deadline';
  title: string;
  message: string;
  scheduledTime: number;
  goalId?: string;
  postingId?: string;
}

// Schedule a notification using Chrome alarms
export async function scheduleNotification(notification: ScheduledNotification): Promise<void> {
  try {
    // Create an alarm
    await chrome.alarms.create(notification.id, {
      when: notification.scheduledTime,
    });

    // Store notification data
    const key = `notification_${notification.id}`;
    await chrome.storage.local.set({ [key]: notification });
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}

// Cancel a scheduled notification
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await chrome.alarms.clear(notificationId);
    const key = `notification_${notificationId}`;
    await chrome.storage.local.remove(key);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

// ============ Goal Reminders ============

export async function scheduleGoalReminders(): Promise<void> {
  const [goals, settings] = await Promise.all([
    getGoals(),
    getNotificationSettings(),
  ]);

  if (!settings.enabled || !settings.goalReminders) {
    return;
  }

  const now = Date.now();

  for (const goal of goals) {
    if (goal.completed) continue;

    for (const reminder of goal.reminders) {
      if (reminder.sent || reminder.dismissed) continue;

      const dueDate = new Date(goal.dueDate).getTime();
      const reminderTime = dueDate - (reminder.timing * 60 * 1000);

      // Only schedule if in the future
      if (reminderTime > now) {
        // Check quiet hours
        if (settings.quietHoursEnabled && isInQuietHours(reminderTime, settings)) {
          continue;
        }

        await scheduleNotification({
          id: `goal-reminder-${goal.id}-${reminder.id}`,
          type: 'goal',
          title: 'Goal Reminder',
          message: `${goal.title} is due soon!`,
          scheduledTime: reminderTime,
          goalId: goal.id,
        });
      }
    }
  }
}

// ============ Interview Reminders ============

export async function scheduleInterviewReminders(postings: Posting[]): Promise<void> {
  const settings = await getNotificationSettings();

  if (!settings.enabled || !settings.interviewReminders) {
    return;
  }

  const now = Date.now();

  for (const posting of postings) {
    if (!posting.interviews) continue;

    for (const interview of posting.interviews) {
      if (interview.completed || !interview.date) continue;

      const interviewDate = new Date(interview.date);
      if (interview.time) {
        const [hours, minutes] = interview.time.split(':').map(Number);
        interviewDate.setHours(hours, minutes, 0, 0);
      }

      const interviewTime = interviewDate.getTime();
      const reminderTime = interviewTime - (settings.interviewReminderTiming * 60 * 1000);

      // Only schedule if in the future
      if (reminderTime > now) {
        // Check quiet hours
        if (settings.quietHoursEnabled && isInQuietHours(reminderTime, settings)) {
          continue;
        }

        await scheduleNotification({
          id: `interview-reminder-${posting.id}-${interview.id}`,
          type: 'interview',
          title: 'Interview Reminder',
          message: `Interview with ${posting.company} - ${interview.roundName} in ${Math.round(settings.interviewReminderTiming / 60)} hour(s)`,
          scheduledTime: reminderTime,
          postingId: posting.id,
        });
      }
    }
  }
}

// ============ Deadline Reminders ============

export async function scheduleDeadlineReminders(postings: Posting[]): Promise<void> {
  const settings = await getNotificationSettings();

  if (!settings.enabled || !settings.offerDeadlines) {
    return;
  }

  const now = Date.now();

  for (const posting of postings) {
    if (!posting.nextActionDate) continue;
    if (posting.status === 'accepted' || posting.status === 'rejected' || posting.status === 'withdrawn') {
      continue;
    }

    const deadlineDate = new Date(posting.nextActionDate).getTime();

    // Schedule 3 days before
    const threeDaysBefore = deadlineDate - (3 * 24 * 60 * 60 * 1000);
    if (threeDaysBefore > now) {
      await scheduleNotification({
        id: `deadline-3d-${posting.id}`,
        type: 'deadline',
        title: 'Deadline Approaching',
        message: `${posting.title} at ${posting.company} - deadline in 3 days`,
        scheduledTime: threeDaysBefore,
        postingId: posting.id,
      });
    }

    // Schedule 1 day before
    const oneDayBefore = deadlineDate - (24 * 60 * 60 * 1000);
    if (oneDayBefore > now) {
      await scheduleNotification({
        id: `deadline-1d-${posting.id}`,
        type: 'deadline',
        title: 'Deadline Tomorrow',
        message: `${posting.title} at ${posting.company} - deadline tomorrow!`,
        scheduledTime: oneDayBefore,
        postingId: posting.id,
      });
    }
  }
}

// ============ Show Notification ============

export async function showNotification(
  title: string,
  message: string,
  options?: {
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    data?: Record<string, unknown>;
  }
): Promise<void> {
  if (!isNotificationPermissionGranted()) {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    // Use Chrome notifications API for extension
    await chrome.notifications.create(options?.tag || `notification-${Date.now()}`, {
      type: 'basic',
      iconUrl: options?.icon || chrome.runtime.getURL('icons/icon128.png'),
      title,
      message,
      requireInteraction: options?.requireInteraction,
      priority: 2,
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

// ============ Quiet Hours ============

function isInQuietHours(timestamp: number, settings: NotificationSettings): boolean {
  if (!settings.quietHoursEnabled) return false;

  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const currentTime = hours * 60 + minutes;

  const [startHours, startMinutes] = settings.quietHoursStart.split(':').map(Number);
  const [endHours, endMinutes] = settings.quietHoursEnd.split(':').map(Number);

  const startTime = startHours * 60 + startMinutes;
  const endTime = endHours * 60 + endMinutes;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  }

  return currentTime >= startTime && currentTime < endTime;
}

// ============ Alarm Handler ============

// This should be called from the background script
export async function handleAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
  const key = `notification_${alarm.name}`;
  const result = await chrome.storage.local.get(key);
  const notification = result[key] as ScheduledNotification | undefined;

  if (!notification) {
    console.warn('No notification data found for alarm:', alarm.name);
    return;
  }

  // Show the notification
  await showNotification(notification.title, notification.message, {
    tag: notification.id,
    requireInteraction: true,
    data: {
      goalId: notification.goalId,
      postingId: notification.postingId,
    },
  });

  // Mark reminder as sent if it's a goal reminder
  if (notification.goalId) {
    const goals = await getGoals();
    const goal = goals.find((g) => g.id === notification.goalId);

    if (goal) {
      const reminderIndex = goal.reminders.findIndex(
        (r) => notification.id.includes(r.id)
      );

      if (reminderIndex >= 0) {
        goal.reminders[reminderIndex].sent = true;
        await saveGoal(goal);
      }
    }
  }

  // Clean up notification data
  await chrome.storage.local.remove(key);
}

// ============ Weekly Summary ============

export async function sendWeeklySummary(
  postings: Posting[],
  goals: Goal[]
): Promise<void> {
  const settings = await getNotificationSettings();

  if (!settings.enabled || !settings.weeklySummary) {
    return;
  }

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Calculate stats
  const applicationsThisWeek = postings.filter((p) => {
    if (!p.dateApplied) return false;
    const applied = new Date(p.dateApplied);
    return applied >= weekAgo && applied <= now;
  }).length;

  const goalsCompletedThisWeek = goals.filter((g) => {
    if (!g.completed || !g.completedAt) return false;
    const completed = new Date(g.completedAt);
    return completed >= weekAgo && completed <= now;
  }).length;

  const upcomingInterviews = postings.reduce((count, p) => {
    if (!p.interviews) return count;
    return count + p.interviews.filter((i) => {
      if (i.completed || !i.date) return false;
      const interviewDate = new Date(i.date);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return interviewDate >= now && interviewDate <= nextWeek;
    }).length;
  }, 0);

  const message = [
    `Applications: ${applicationsThisWeek}`,
    `Goals completed: ${goalsCompletedThisWeek}`,
    `Upcoming interviews: ${upcomingInterviews}`,
  ].join(' | ');

  await showNotification('Weekly Job Search Summary', message, {
    tag: 'weekly-summary',
  });
}

// ============ Stale Posting Nudge ============

export async function checkStalePostings(postings: Posting[]): Promise<void> {
  const settings = await getNotificationSettings();

  if (!settings.enabled) {
    return;
  }

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const stalePostings = postings.filter((p) => {
    if (p.status === 'accepted' || p.status === 'rejected' || p.status === 'withdrawn') {
      return false;
    }
    if (p.status !== 'saved' && p.status !== 'in_progress') {
      return false;
    }
    return now - p.dateModified >= sevenDaysMs;
  });

  if (stalePostings.length > 0) {
    await showNotification(
      'Job Postings Need Attention',
      `${stalePostings.length} saved posting(s) haven't been updated in 7+ days`,
      {
        tag: 'stale-postings',
      }
    );
  }
}

// ============ Initialize Notifications ============

export async function initializeNotifications(postings: Posting[]): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return;
  }

  // Schedule all reminders
  await Promise.all([
    scheduleGoalReminders(),
    scheduleInterviewReminders(postings),
    scheduleDeadlineReminders(postings),
  ]);
}
