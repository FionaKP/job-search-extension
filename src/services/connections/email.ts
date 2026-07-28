/**
 * Email → Connection operations
 *
 * High-level actions used by both the Gmail content-script panel and the
 * dashboard: turn an EmailContext into a contact event, log it against an
 * existing connection (de-duplicated), or create a new connection from it.
 *
 * These read/write through the shared storage layer so behaviour is identical
 * whether invoked from the injected panel or the app.
 */

import {
  Connection,
  ContactEvent,
  EmailContext,
  RelationshipType,
} from '@/types';
import { getConnections, saveConnection } from '@/services/storage';
import { normalizeEmail } from './matching';

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Best-effort human name from an email address local-part, e.g. "jane.doe" → "Jane Doe". */
export function nameFromEmail(email: string | null | undefined): string {
  if (!email) return 'Unknown';
  const local = email.split('@')[0] || '';
  const words = local
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return email;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** Best-effort company from an email domain, e.g. "anthropic.com" → "Anthropic". */
export function companyFromEmail(email: string | null | undefined): string {
  if (!email) return '';
  const domain = (email.split('@')[1] || '').toLowerCase();
  // Ignore common personal-mail providers — no company signal there.
  const personal = new Set([
    'gmail.com', 'googlemail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'me.com', 'live.com',
  ]);
  if (!domain || personal.has(domain)) return '';
  const base = domain.split('.')[0];
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : '';
}

/** Build a contact event from an email the user is viewing. */
export function buildContactEvent(email: EmailContext, notes?: string): ContactEvent {
  const note = notes?.trim() || (email.subject ? undefined : email.snippet || undefined);
  return {
    id: newId('contact'),
    date: email.date || new Date().toISOString().split('T')[0],
    type: 'email',
    direction: email.direction,
    subject: email.subject || undefined,
    source: 'gmail',
    externalId: email.messageId || undefined,
    notes: note,
  };
}

/** Build a brand-new connection object from an email (not yet persisted). */
export function buildConnectionFromEmail(
  email: EmailContext,
  overrides: Partial<Connection> = {}
): Connection {
  const now = Date.now();
  const addr = email.email || undefined;
  const relationshipType: RelationshipType = 'other';
  return {
    id: newId('conn'),
    name: email.name || nameFromEmail(addr),
    email: addr,
    emailAddresses: addr ? [addr] : [],
    company: companyFromEmail(addr),
    relationshipType,
    relationshipStrength: 2,
    notes: '',
    contactHistory: [],
    linkedPostingIds: [],
    dateAdded: now,
    dateModified: now,
    ...overrides,
  };
}

/** True when this connection already has an event with the given externalId. */
function hasEvent(connection: Connection, externalId?: string): boolean {
  if (!externalId) return false;
  return connection.contactHistory.some((e) => e.externalId === externalId);
}

function withMergedEmail(connection: Connection, email?: string | null): Connection {
  const normalized = normalizeEmail(email);
  if (!normalized) return connection;
  const existing = new Set(
    [connection.email, ...(connection.emailAddresses || [])]
      .map((e) => normalizeEmail(e))
      .filter(Boolean)
  );
  if (existing.has(normalized)) return connection;
  return {
    ...connection,
    email: connection.email || email || undefined,
    emailAddresses: [...(connection.emailAddresses || []), email as string],
  };
}

/**
 * Log an email against an existing connection. De-duplicates by messageId so the
 * same email can't be logged twice. Also merges the sender address and advances
 * lastContactDate. Returns the updated connection, or the unchanged one if the
 * email was already logged.
 */
export async function logEmailToConnection(
  connectionId: string,
  email: EmailContext,
  options: { notes?: string } = {}
): Promise<{ connection: Connection; wasNew: boolean } | null> {
  const connections = await getConnections();
  const connection = connections.find((c) => c.id === connectionId);
  if (!connection) return null;

  if (hasEvent(connection, email.messageId || undefined)) {
    return { connection, wasNew: false };
  }

  const event = buildContactEvent(email, options.notes);
  let updated: Connection = withMergedEmail(connection, email.email);
  updated = {
    ...updated,
    contactHistory: [...updated.contactHistory, event],
    lastContactDate: maxDate(updated.lastContactDate, event.date),
  };

  await saveConnection(updated);
  return { connection: updated, wasNew: true };
}

/** Create a new connection from an email and log the email as its first event. */
export async function createConnectionFromEmail(
  email: EmailContext,
  overrides: Partial<Connection> = {},
  options: { notes?: string } = {}
): Promise<Connection> {
  const base = buildConnectionFromEmail(email, overrides);
  const event = buildContactEvent(email, options.notes);
  const connection: Connection = {
    ...base,
    contactHistory: [event],
    lastContactDate: event.date,
  };
  await saveConnection(connection);
  return connection;
}

function maxDate(a: string | undefined, b: string): string {
  if (!a) return b;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}
