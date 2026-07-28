/**
 * Connection matching
 *
 * Pure functions that decide whether an email the user is viewing belongs to an
 * existing connection. Source-agnostic: works on the EmailContext shape produced
 * by the Gmail content-script parser today and, later, by a Gmail-API layer.
 */

import { Connection, EmailContext } from '@/types';

export type MatchConfidence = 'exact' | 'strong' | 'weak';

export interface ConnectionMatch {
  connection: Connection;
  confidence: MatchConfidence;
  /** 0–1 score used for ranking. */
  score: number;
  /** Human-readable reason, e.g. "Email matches" or "Same name". */
  reason: string;
}

/** Normalize an email address for comparison (lowercase, trimmed, no +tag). */
export function normalizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf('@');
  if (at < 0) return trimmed;
  const local = trimmed.slice(0, at).split('+')[0];
  const domain = trimmed.slice(at + 1);
  return `${local}@${domain}`;
}

/** All known email addresses for a connection (primary + aliases), normalized. */
export function connectionEmails(connection: Connection): string[] {
  const all = [connection.email, ...(connection.emailAddresses || [])]
    .map((e) => normalizeEmail(e))
    .filter(Boolean);
  return Array.from(new Set(all));
}

function normalizeName(name: string | null | undefined): string {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Rank existing connections against an email. Returns matches sorted best-first.
 * An empty array means "no plausible match — offer to create a new connection".
 */
export function matchConnections(
  email: EmailContext,
  connections: Connection[]
): ConnectionMatch[] {
  const emailAddrs = new Set(
    [email.email, ...email.participants].map((e) => normalizeEmail(e)).filter(Boolean)
  );
  const targetName = normalizeName(email.name);

  const matches: ConnectionMatch[] = [];

  for (const connection of connections) {
    const emails = connectionEmails(connection);
    const emailHit = emails.some((e) => emailAddrs.has(e));

    if (emailHit) {
      matches.push({
        connection,
        confidence: 'exact',
        score: 1,
        reason: 'Email address matches',
      });
      continue;
    }

    // Name-based fallback (weaker). Only when we have a name to compare.
    if (targetName && normalizeName(connection.name) === targetName) {
      matches.push({
        connection,
        confidence: 'weak',
        score: 0.5,
        reason: 'Name matches',
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}

/** Convenience: the single best match, or null. */
export function bestMatch(
  email: EmailContext,
  connections: Connection[]
): ConnectionMatch | null {
  const [top] = matchConnections(email, connections);
  return top || null;
}
