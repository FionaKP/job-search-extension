/**
 * Injected connection panel
 *
 * A self-contained, shadow-DOM card that appears while the user is reading an
 * email in Gmail. It matches the sender against existing connections and lets
 * the user log the email as a touchpoint, add context, or create a new
 * connection — all written straight to chrome.storage via the shared services,
 * so the dashboard reflects it immediately.
 *
 * Deliberately vanilla DOM (no React) to keep the content-script bundle small
 * and to avoid Gmail's styles leaking in or ours leaking out.
 */

import { EmailContext } from '@/types';
import { getConnections } from '@/services/storage';
import {
  matchConnections,
  logEmailToConnection,
  createConnectionFromEmail,
  companyFromEmail,
  ConnectionMatch,
} from '@/services/connections';

const STYLES = `
  :host { all: initial; }
  * { box-sizing: border-box; font-family: 'Google Sans', Roboto, Arial, sans-serif; }
  .card {
    position: fixed; right: 20px; bottom: 20px; width: 320px; z-index: 2147483000;
    background: #fff; border: 1px solid #e3e3e3; border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0,0,0,.16); overflow: hidden; color: #202124;
  }
  .header {
    display: flex; align-items: center; gap: 8px; padding: 12px 14px;
    background: #4b2138; color: #f6e9df;
  }
  .header .dot { width: 8px; height: 8px; border-radius: 50%; background: #e07a5f; }
  .header .title { font-size: 13px; font-weight: 600; flex: 1; }
  .header button { background: transparent; border: 0; color: #f6e9df; cursor: pointer; font-size: 16px; line-height: 1; padding: 2px 4px; border-radius: 4px; }
  .header button:hover { background: rgba(255,255,255,.15); }
  .body { padding: 14px; }
  .person { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .avatar { width: 34px; height: 34px; border-radius: 50%; background: #efe3d9; color: #4b2138; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 15px; flex-shrink: 0; }
  .person .name { font-size: 14px; font-weight: 600; }
  .person .email { font-size: 12px; color: #5f6368; word-break: break-all; }
  .badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 999px; margin-bottom: 8px; }
  .badge.match { background: #e6f4ea; color: #137333; }
  .badge.new { background: #fce8e6; color: #a50e0e; }
  .badge.dir { background: #f1f3f4; color: #5f6368; margin-left: 6px; }
  .subject { font-size: 12px; color: #3c4043; margin-bottom: 10px; background: #f8f9fa; border-radius: 6px; padding: 6px 8px; max-height: 48px; overflow: hidden; }
  label { display: block; font-size: 11px; color: #5f6368; margin: 8px 0 3px; }
  input, textarea { width: 100%; border: 1px solid #dadce0; border-radius: 6px; padding: 6px 8px; font-size: 13px; }
  textarea { resize: vertical; min-height: 46px; }
  .row { display: flex; gap: 8px; }
  .actions { display: flex; gap: 8px; margin-top: 12px; }
  button.btn { flex: 1; border: 0; border-radius: 8px; padding: 8px 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
  button.primary { background: #4b2138; color: #fff; }
  button.primary:hover { background: #5c2a46; }
  button.ghost { background: #f1f3f4; color: #3c4043; }
  button.ghost:hover { background: #e8eaed; }
  .alt { margin-top: 10px; font-size: 12px; }
  .alt a { color: #4b2138; cursor: pointer; text-decoration: underline; }
  .success { text-align: center; padding: 8px 0; }
  .success .check { width: 40px; height: 40px; border-radius: 50%; background: #e6f4ea; color: #137333; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 20px; }
  .muted { font-size: 12px; color: #5f6368; }
  .matchlist { margin-top: 6px; }
  .matchitem { display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 6px; cursor: pointer; }
  .matchitem:hover { background: #f8f9fa; }
  .matchitem.sel { background: #f3e9f0; }
  .matchitem .mname { font-size: 13px; font-weight: 500; }
  .matchitem .mmeta { font-size: 11px; color: #5f6368; }
  .hidden { display: none; }
  .jf-error { display: none; margin-top: 10px; padding: 8px 10px; border-radius: 6px; background: #fce8e6; color: #a50e0e; font-size: 12px; }
`;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

function esc(s: string | null | undefined): string {
  return (s || '').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string)
  );
}

export class ConnectionPanel {
  private host: HTMLElement;
  private root: ShadowRoot;
  private currentEmail: EmailContext | null = null;
  private matches: ConnectionMatch[] = [];
  private selectedMatchId: string | null = null;
  private dismissedKeys = new Set<string>();

  constructor() {
    this.host = document.createElement('div');
    this.host.id = 'jobflow-connection-panel';
    this.root = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = STYLES;
    this.root.appendChild(style);
    document.documentElement.appendChild(this.host);
  }

  /** Update the panel for the currently-open email. */
  async update(email: EmailContext | null, key: string): Promise<void> {
    if (!email || !email.email) {
      this.clear();
      return;
    }
    if (this.dismissedKeys.has(key)) {
      this.clear();
      return;
    }
    this.currentEmail = email;
    const connections = await getConnections();
    this.matches = matchConnections(email, connections);
    this.selectedMatchId = this.matches[0]?.connection.id || null;
    this.renderMatchOrCreate(key);
  }

  private clear(): void {
    const existing = this.root.querySelector('.card');
    if (existing) existing.remove();
    this.currentEmail = null;
  }

  private mount(html: string): HTMLElement {
    this.clear();
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const card = wrap.firstElementChild as HTMLElement;
    this.root.appendChild(card);
    return card;
  }

  private renderMatchOrCreate(key: string): void {
    const email = this.currentEmail!;
    const hasMatch = this.matches.length > 0;
    const dirLabel = email.direction === 'outbound' ? 'You emailed' : 'Emailed you';
    const displayName = email.name || email.email || 'Unknown';

    const matchListHtml = hasMatch
      ? `<div class="matchlist">${this.matches
          .slice(0, 3)
          .map(
            (m) => `
          <div class="matchitem ${m.connection.id === this.selectedMatchId ? 'sel' : ''}" data-mid="${m.connection.id}">
            <div class="avatar" style="width:26px;height:26px;font-size:12px">${initials(m.connection.name)}</div>
            <div>
              <div class="mname">${esc(m.connection.name)}</div>
              <div class="mmeta">${esc(m.connection.company)} · ${esc(m.reason)}</div>
            </div>
          </div>`
          )
          .join('')}</div>`
      : '';

    const card = this.mount(`
      <div class="card">
        <div class="header">
          <span class="dot"></span>
          <span class="title">${hasMatch ? 'Log this touchpoint' : 'New connection?'}</span>
          <button data-act="dismiss" title="Dismiss">×</button>
        </div>
        <div class="body">
          <div class="person">
            <div class="avatar">${initials(displayName)}</div>
            <div>
              <div class="name">${esc(displayName)}</div>
              <div class="email">${esc(email.email)}</div>
            </div>
          </div>
          <div>
            <span class="badge ${hasMatch ? 'match' : 'new'}">${hasMatch ? 'Known connection' : 'Not in your connections'}</span>
            <span class="badge dir">${dirLabel}</span>
          </div>
          ${email.subject ? `<div class="subject">${esc(email.subject)}</div>` : ''}
          ${matchListHtml}
          ${
            hasMatch
              ? ''
              : `
            <label>Name</label>
            <input id="f-name" value="${esc(displayName)}" />
            <div class="row">
              <div style="flex:1"><label>Company</label><input id="f-company" value="${esc(companyFromEmail(email.email))}" /></div>
            </div>`
          }
          <label>Add a note (optional)</label>
          <textarea id="f-note" placeholder="Context for this touchpoint..."></textarea>
          <div class="jf-error"></div>
          <div class="actions">
            <button class="btn ghost" data-act="snooze">Not now</button>
            <button class="btn primary" data-act="${hasMatch ? 'log' : 'create'}">
              ${hasMatch ? 'Log email' : 'Add connection'}
            </button>
          </div>
        </div>
      </div>
    `);

    this.wireEvents(card, key);
  }

  private wireEvents(card: HTMLElement, key: string): void {
    card.querySelectorAll<HTMLElement>('.matchitem').forEach((el) => {
      el.addEventListener('click', () => {
        this.selectedMatchId = el.getAttribute('data-mid');
        this.renderMatchOrCreate(key);
      });
    });

    card.querySelector('[data-act="dismiss"]')?.addEventListener('click', () => {
      this.dismissedKeys.add(key);
      this.clear();
    });
    card.querySelector('[data-act="snooze"]')?.addEventListener('click', () => {
      this.dismissedKeys.add(key);
      this.clear();
    });
    card.querySelector('[data-act="log"]')?.addEventListener('click', () => this.handleLog());
    card.querySelector('[data-act="create"]')?.addEventListener('click', () => this.handleCreate());
  }

  private getNote(): string | undefined {
    const el = this.root.querySelector<HTMLTextAreaElement>('#f-note');
    return el?.value.trim() || undefined;
  }

  private async handleLog(): Promise<void> {
    if (!this.currentEmail || !this.selectedMatchId) return;
    try {
      const note = this.getNote();
      const result = await logEmailToConnection(this.selectedMatchId, this.currentEmail, {
        notes: note,
      });
      if (!result) return;
      const name = result.connection.name;
      this.renderSuccess(
        result.wasNew ? `Logged to ${name}` : `Already logged to ${name}`
      );
    } catch (err) {
      this.reportError(err);
    }
  }

  private async handleCreate(): Promise<void> {
    if (!this.currentEmail) return;
    try {
      const nameEl = this.root.querySelector<HTMLInputElement>('#f-name');
      const companyEl = this.root.querySelector<HTMLInputElement>('#f-company');
      const note = this.getNote();
      const connection = await createConnectionFromEmail(
        this.currentEmail,
        {
          name: nameEl?.value.trim() || this.currentEmail.name || 'Unknown',
          company: companyEl?.value.trim() || '',
        },
        { notes: note }
      );
      this.renderSuccess(`Added ${connection.name}`);
    } catch (err) {
      this.reportError(err);
    }
  }

  /** Surface a write failure both in the panel and the console for debugging. */
  private reportError(err: unknown): void {
    const raw = err instanceof Error ? err.message : String(err);
    console.error('[JobFlow] Failed to save connection:', err);
    // This orphaned-content-script error happens when the extension is
    // reloaded/updated while Gmail is already open — the fix is a page refresh.
    const isStale = /context invalidated/i.test(raw);
    const message = isStale
      ? 'JobFlow was updated — refresh this Gmail tab to reconnect.'
      : `Couldn't save: ${raw}`;
    const banner = this.root.querySelector<HTMLElement>('.jf-error');
    if (banner) {
      banner.textContent = message;
      banner.style.display = 'block';
    } else {
      alert(`JobFlow: ${message}`);
    }
  }

  private renderSuccess(message: string): void {
    const card = this.mount(`
      <div class="card">
        <div class="header">
          <span class="dot"></span>
          <span class="title">JobFlow Connections</span>
          <button data-act="close" title="Close">×</button>
        </div>
        <div class="body">
          <div class="success">
            <div class="check">✓</div>
            <div style="font-size:14px;font-weight:600">${esc(message)}</div>
            <div class="muted" style="margin-top:4px">Saved to your connections.</div>
          </div>
          <div class="actions">
            <button class="btn ghost" data-act="close">Close</button>
            <button class="btn primary" data-act="open">Open in JobFlow</button>
          </div>
        </div>
      </div>
    `);
    card.querySelector('[data-act="close"]')?.addEventListener('click', () => this.clear());
    card.querySelector('[data-act="open"]')?.addEventListener('click', () => {
      try {
        window.open(chrome.runtime.getURL('index.html'), '_blank');
      } catch {
        /* no-op if not available */
      }
    });
  }

  destroy(): void {
    this.host.remove();
  }
}
