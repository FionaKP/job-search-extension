/**
 * Touchpoint suggestions
 *
 * Pure functions that decide who the user should reach out to and when, based
 * purely on locally stored connection data (last contact, explicit follow-up
 * dates, and a cadence derived from relationship strength). No email access
 * required — this works even before any email integration is connected.
 */

import {
  Connection,
  TouchpointSuggestion,
  DEFAULT_CADENCE_BY_STRENGTH,
} from '@/types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Effective cadence in days for a connection (explicit, else strength-derived). */
export function getCadenceDays(connection: Connection): number {
  if (connection.cadenceDays && connection.cadenceDays > 0) {
    return connection.cadenceDays;
  }
  return DEFAULT_CADENCE_BY_STRENGTH[connection.relationshipStrength];
}

/** The most recent contact date for a connection (from history or lastContactDate). */
export function getLastContactDate(connection: Connection): string | undefined {
  const dates: number[] = [];
  if (connection.lastContactDate) dates.push(new Date(connection.lastContactDate).getTime());
  for (const event of connection.contactHistory) {
    const t = new Date(event.date).getTime();
    if (!Number.isNaN(t)) dates.push(t);
  }
  if (dates.length === 0) return undefined;
  return new Date(Math.max(...dates)).toISOString();
}

function daysBetween(a: number, b: number): number {
  return Math.floor((a - b) / MS_PER_DAY);
}

/**
 * Compute a touchpoint suggestion for one connection, or null if nothing is due.
 * `now` is injectable for testing/determinism.
 */
export function suggestTouchpoint(
  connection: Connection,
  now: number = Date.now()
): TouchpointSuggestion | null {
  // Respect snooze.
  if (connection.touchpointSnoozeUntil) {
    const snoozeUntil = new Date(connection.touchpointSnoozeUntil).getTime();
    if (!Number.isNaN(snoozeUntil) && snoozeUntil > now) return null;
  }

  // 1) An explicit follow-up date that has passed always wins.
  if (connection.nextFollowUp) {
    const due = new Date(connection.nextFollowUp).getTime();
    if (!Number.isNaN(due) && due <= now) {
      return {
        connectionId: connection.id,
        reason: 'overdue_followup',
        daysOverdue: daysBetween(now, due),
        dueDate: new Date(due).toISOString(),
        lastContactDate: getLastContactDate(connection),
      };
    }
  }

  const lastContact = getLastContactDate(connection);

  // 2) Never contacted — gentle nudge to make first contact.
  if (!lastContact) {
    return {
      connectionId: connection.id,
      reason: 'never_contacted',
      daysOverdue: 0,
      dueDate: new Date(now).toISOString(),
    };
  }

  // 3) Cadence exceeded since last contact.
  const cadence = getCadenceDays(connection);
  const lastMs = new Date(lastContact).getTime();
  const dueMs = lastMs + cadence * MS_PER_DAY;
  if (dueMs <= now) {
    return {
      connectionId: connection.id,
      reason: 'cadence_due',
      daysOverdue: daysBetween(now, dueMs),
      dueDate: new Date(dueMs).toISOString(),
      lastContactDate: lastContact,
    };
  }

  return null;
}

/**
 * All due touchpoints across the given connections, most overdue first.
 * `never_contacted` items sort after genuinely overdue ones.
 */
export function computeTouchpoints(
  connections: Connection[],
  now: number = Date.now()
): TouchpointSuggestion[] {
  const suggestions: TouchpointSuggestion[] = [];
  for (const connection of connections) {
    const s = suggestTouchpoint(connection, now);
    if (s) suggestions.push(s);
  }
  return suggestions.sort((a, b) => {
    // Overdue items (daysOverdue > 0) come before never-contacted (0).
    if (a.daysOverdue !== b.daysOverdue) return b.daysOverdue - a.daysOverdue;
    return 0;
  });
}
