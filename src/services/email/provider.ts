/**
 * Email provider abstraction (Phase 2 scaffold — not yet active)
 *
 * Phase 1 captures touchpoints from the email the user is *currently viewing*
 * via the Gmail DOM content script (see src/content/gmail.ts). That flow is
 * synchronous and needs no OAuth or backend.
 *
 * Phase 2 adds *background* monitoring: periodically scanning recent mail to
 * suggest touchpoints without the user opening each message. That requires the
 * Gmail API (OAuth via chrome.identity + the gmail.readonly scope), which is a
 * larger, separately-reviewable change.
 *
 * This module defines the seam between the two so the rest of the app never
 * needs to know which source produced an EmailContext. Both the DOM parser and
 * a future Gmail-API client produce the same `EmailContext` shape, and both the
 * matching (services/connections/matching) and logging (services/connections/email)
 * layers already operate purely on that shape — so wiring in a provider later
 * requires no changes to those consumers.
 *
 * IMPORTANT: The stub below intentionally does not implement network access.
 * Activating Phase 2 will require, at minimum:
 *   - manifest: add "identity" permission and an "oauth2" block with the
 *     gmail.readonly scope + a Google Cloud OAuth client id
 *   - a background service worker to schedule scans (chrome.alarms)
 *   - Google OAuth app verification before public release
 */

import { EmailContext } from '@/types';

/** A source of emails that can be turned into EmailContext objects. */
export interface EmailProvider {
  /** Stable identifier, e.g. 'gmail-dom' or 'gmail-api'. */
  readonly id: string;

  /** Whether the provider is authorized/ready to read mail. */
  isConnected(): Promise<boolean>;

  /** Begin authorization (no-op for the DOM provider). */
  connect(): Promise<boolean>;

  /**
   * Recent messages since the given ISO timestamp, newest first.
   * Used by background monitoring to find touchpoints proactively.
   */
  listRecentMessages(sinceIso: string): Promise<EmailContext[]>;
}

/** Configuration for the (future) background touchpoint scan. */
export interface MonitorConfig {
  enabled: boolean;
  /** How often to scan, in minutes. */
  intervalMinutes: number;
  /** Only consider mail newer than this many days on each scan. */
  lookbackDays: number;
}

export const DEFAULT_MONITOR_CONFIG: MonitorConfig = {
  enabled: false,
  intervalMinutes: 180,
  lookbackDays: 14,
};

class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not available in Phase 1. See services/email/provider.ts.`);
    this.name = 'NotImplementedError';
  }
}

/**
 * Placeholder Gmail-API provider. Implements the interface so the wiring exists,
 * but every network method throws until Phase 2 supplies OAuth + the API client.
 */
export const gmailApiProviderStub: EmailProvider = {
  id: 'gmail-api',

  async isConnected(): Promise<boolean> {
    return false;
  },

  async connect(): Promise<boolean> {
    throw new NotImplementedError('Gmail API connection');
  },

  async listRecentMessages(): Promise<EmailContext[]> {
    throw new NotImplementedError('Background email monitoring');
  },
};

/**
 * The active provider. Phase 1 has no background provider (the DOM content
 * script pushes EmailContext directly to the panel), so this is null until
 * Phase 2 swaps in `gmailApiProviderStub`'s real implementation.
 */
export function getActiveProvider(): EmailProvider | null {
  return null;
}
