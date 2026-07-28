/**
 * Gmail DOM parser
 *
 * Extracts an EmailContext from the currently-open Gmail conversation. Gmail's
 * markup is obfuscated and changes over time, so every field is parsed
 * defensively with fallbacks; when a field can't be found we return null for it
 * rather than throwing. The one selector we rely on heavily — `span.gD[email]`
 * for the sender — has been stable for years and is what most Gmail extensions use.
 */

import { EmailContext, ContactDirection } from '@/types';

/** Read the signed-in user's own email address from the account chrome, if present. */
export function getSelfEmail(doc: Document = document): string | null {
  // The account switcher button exposes the address in its aria-label / title.
  const candidates = Array.from(
    doc.querySelectorAll<HTMLElement>(
      'a[aria-label*="@"], a[title*="@"], [aria-label*="Google Account"]'
    )
  );
  for (const el of candidates) {
    const text = `${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''}`;
    const match = text.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
    if (match) return match[0].toLowerCase();
  }
  return null;
}

function getSubject(doc: Document): string | null {
  const h2 = doc.querySelector<HTMLElement>('h2.hP, h2[data-thread-perm-id]');
  const text = h2?.textContent?.trim();
  return text || null;
}

/** Find the header element of the last (most recently expanded) open message. */
function getActiveSenderSpan(doc: Document): HTMLElement | null {
  const senders = Array.from(doc.querySelectorAll<HTMLElement>('span.gD[email]'));
  if (senders.length === 0) return null;
  // Prefer one inside an expanded message; otherwise take the last in the thread.
  const expanded = senders.filter((s) => !s.closest('.kQ, .kv')); // .kQ/.kv = collapsed
  const pool = expanded.length ? expanded : senders;
  return pool[pool.length - 1];
}

function getMessageContainer(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  return (
    el.closest<HTMLElement>('[data-message-id]') ||
    el.closest<HTMLElement>('[data-legacy-message-id]') ||
    el.closest<HTMLElement>('.adn') ||
    null
  );
}

function getMessageId(container: HTMLElement | null): string | null {
  if (!container) return null;
  return (
    container.getAttribute('data-message-id') ||
    container.getAttribute('data-legacy-message-id') ||
    null
  );
}

/** Parse a full date from the message header's tooltip/title (e.g. "Mon, Jul 28, 2026, 9:41 AM"). */
function getMessageDate(container: HTMLElement | null): string | null {
  if (!container) return null;
  const dateEl = container.querySelector<HTMLElement>('.g3[title], span.g3, [data-tooltip*=":"]');
  const raw =
    dateEl?.getAttribute('title') ||
    dateEl?.getAttribute('data-tooltip') ||
    dateEl?.textContent ||
    '';
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }
  return null;
}

function getSnippet(container: HTMLElement | null): string | null {
  if (!container) return null;
  const body = container.querySelector<HTMLElement>('.a3s, div[dir="ltr"]');
  const text = body?.textContent?.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  return text.slice(0, 200);
}

/** Collect participant addresses (from + to + cc) for the active message. */
function getParticipants(container: HTMLElement | null, senderEmail: string | null): string[] {
  const addrs = new Set<string>();
  if (senderEmail) addrs.add(senderEmail.toLowerCase());
  if (container) {
    container.querySelectorAll<HTMLElement>('span[email], .g2[email]').forEach((el) => {
      const e = el.getAttribute('email');
      if (e) addrs.add(e.toLowerCase());
    });
  }
  return Array.from(addrs);
}

/**
 * Parse the open Gmail conversation. Returns null when no email is open
 * (e.g. the user is in the inbox list view rather than reading a message).
 */
export function parseOpenEmail(doc: Document = document): EmailContext | null {
  const senderSpan = getActiveSenderSpan(doc);
  if (!senderSpan) return null;

  const senderEmail = (senderSpan.getAttribute('email') || '').toLowerCase() || null;
  const senderName = senderSpan.getAttribute('name') || senderSpan.textContent?.trim() || null;

  const container = getMessageContainer(senderSpan);
  const selfEmail = getSelfEmail(doc);

  // Direction: if the "sender" of the active message is the user, it's outbound.
  const direction: ContactDirection =
    selfEmail && senderEmail && selfEmail === senderEmail ? 'outbound' : 'inbound';

  const participants = getParticipants(container, senderEmail).filter(
    (e) => !selfEmail || e !== selfEmail
  );

  // For an outbound email the "other party" is the recipient, not the sender.
  let otherName = senderName;
  let otherEmail = senderEmail;
  if (direction === 'outbound') {
    const recipient = container?.querySelector<HTMLElement>('span.g2[email], span[email]:not(.gD)');
    otherEmail = recipient?.getAttribute('email')?.toLowerCase() || participants[0] || null;
    otherName = recipient?.getAttribute('name') || recipient?.textContent?.trim() || null;
  }

  return {
    name: otherName,
    email: otherEmail,
    participants,
    subject: getSubject(doc),
    date: getMessageDate(container),
    snippet: getSnippet(container),
    direction,
    messageId: getMessageId(container),
    selfEmail,
  };
}

/**
 * A stable key for the currently-open email so the panel only re-renders when
 * the user navigates to a different message.
 */
export function emailKey(email: EmailContext | null): string {
  if (!email) return '';
  return email.messageId || `${email.email || ''}|${email.subject || ''}|${email.date || ''}`;
}
