/**
 * Injected connection panel
 *
 * While reading an email in Gmail, this shows a small, unobtrusive launcher
 * bubble whose status dot reflects the sender's state (new person, known
 * connection, or a connection who's due for a touchpoint / follow-up). Clicking
 * it expands the full card to log the email, add a connection, or schedule a
 * follow-up. Writes go straight to chrome.storage via the shared services so the
 * dashboard reflects them immediately.
 *
 * Vanilla DOM in a shadow root — keeps the content-script bundle small and
 * isolates styles from Gmail. Colours mirror the app's palette.
 */

import { EmailContext, Connection, TouchpointSuggestion } from '@/types';
import { getConnections } from '@/services/storage';
import {
  matchConnections,
  logEmailToConnection,
  createConnectionFromEmail,
  setConnectionFollowUp,
  companyFromEmail,
  suggestTouchpoint,
  ConnectionMatch,
} from '@/services/connections';

// Brand palette (mirrors tailwind.config.js)
const C = {
  wine: '#4F243E',
  wine600: '#3A1A2E',
  wine100: '#D4C5CD',
  flatred: '#CA423B',
  flatred600: '#A33630',
  pandora: '#E68342',
  champagne: '#F5EDD8',
  champagne300: '#E9C593',
  teal: '#3C9C9A',
  ink: '#2B1322',
  muted: '#7A4A63',
  line: '#EADFE4',
};

const STYLES = `
  :host { all: initial; }
  * { box-sizing: border-box; font-family: 'Google Sans', Roboto, Arial, sans-serif; }

  /* Collapsed launcher */
  .launcher {
    position: fixed; right: 22px; bottom: 22px; z-index: 2147483000;
    width: 46px; height: 46px; border-radius: 50%; cursor: pointer;
    background: ${C.wine}; color: ${C.champagne};
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; font-weight: 600;
    box-shadow: 0 4px 14px rgba(43,19,34,.32); border: 2px solid ${C.champagne300};
    transition: transform .12s ease, box-shadow .12s ease;
  }
  .launcher:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 6px 18px rgba(43,19,34,.4); }
  .launcher .status {
    position: absolute; right: -3px; top: -3px; width: 17px; height: 17px; border-radius: 50%;
    border: 2px solid #fff; display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #fff; line-height: 1;
  }
  .status.new { background: ${C.pandora}; }
  .status.due { background: ${C.flatred}; }
  .status.known { background: ${C.teal}; }
  .launcher .pulse {
    position: absolute; inset: -2px; border-radius: 50%; border: 2px solid ${C.flatred};
    animation: jfpulse 1.8s ease-out infinite; opacity: 0;
  }
  @keyframes jfpulse { 0% { transform: scale(1); opacity: .5; } 100% { transform: scale(1.5); opacity: 0; } }

  /* Expanded card */
  .card {
    position: fixed; right: 22px; bottom: 22px; width: 336px; z-index: 2147483000;
    background: #fff; border: 1px solid ${C.line}; border-radius: 14px;
    box-shadow: 0 10px 30px rgba(43,19,34,.22); overflow: hidden; color: ${C.ink};
  }
  .header {
    display: flex; align-items: center; gap: 8px; padding: 12px 14px;
    background: ${C.wine}; color: ${C.champagne};
  }
  .header .title { font-size: 13px; font-weight: 600; flex: 1; letter-spacing: .01em; }
  .header button {
    background: transparent; border: 0; color: ${C.champagne}; cursor: pointer;
    font-size: 16px; line-height: 1; padding: 3px 5px; border-radius: 6px;
  }
  .header button:hover { background: rgba(255,255,255,.15); }
  .body { padding: 14px; }

  .person { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .avatar {
    width: 36px; height: 36px; border-radius: 50%; background: ${C.wine}; color: ${C.champagne};
    display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 15px; flex-shrink: 0;
  }
  .person .name { font-size: 14px; font-weight: 600; color: ${C.ink}; }
  .person .email { font-size: 12px; color: ${C.muted}; word-break: break-all; }

  .badges { margin-bottom: 8px; }
  .badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 999px; margin-right: 6px; margin-bottom: 4px; font-weight: 500; }
  .badge.match { background: #E8F5F4; color: #2A6B6A; }
  .badge.new { background: #FBEBDD; color: #A65A22; }
  .badge.dir { background: #F4EFF1; color: ${C.muted}; }

  .subject { font-size: 12px; color: #3c4043; margin-bottom: 10px; background: #FAF6F8; border-radius: 8px; padding: 7px 9px; max-height: 48px; overflow: hidden; }

  label { display: block; font-size: 11px; color: ${C.muted}; margin: 8px 0 3px; font-weight: 500; }
  input, textarea { width: 100%; border: 1px solid ${C.line}; border-radius: 8px; padding: 7px 9px; font-size: 13px; color: ${C.ink}; }
  input:focus, textarea:focus { outline: none; border-color: ${C.wine}; box-shadow: 0 0 0 2px rgba(79,36,62,.12); }
  textarea { resize: vertical; min-height: 44px; }
  .row { display: flex; gap: 8px; align-items: flex-end; }

  /* Follow-up */
  .fu { margin-top: 10px; padding: 10px; border-radius: 10px; background: #FAF6F8; border: 1px solid ${C.line}; }
  .fu .fu-head { display: flex; align-items: center; justify-content: space-between; }
  .fu .fu-title { font-size: 12px; font-weight: 600; color: ${C.wine}; }
  .fu .fu-state { font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 999px; }
  .fu-state.overdue { background: #F7DCDA; color: ${C.flatred600}; }
  .fu-state.due { background: #FBEBDD; color: #A65A22; }
  .fu-state.set { background: #E8F5F4; color: #2A6B6A; }
  .fu-state.none { background: #F1ECEE; color: ${C.muted}; }
  .fu .row { margin-top: 8px; }
  .fu .saved { font-size: 11px; color: #2A6B6A; margin-top: 6px; }

  .actions { display: flex; gap: 8px; margin-top: 12px; }
  button.btn { flex: 1; border: 0; border-radius: 9px; padding: 9px 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .12s ease; }
  button.btn.small { flex: 0 0 auto; padding: 8px 12px; }
  button.primary { background: ${C.flatred}; color: #fff; }
  button.primary:hover { background: ${C.flatred600}; }
  button.ghost { background: #F1ECEE; color: ${C.wine}; }
  button.ghost:hover { background: #E7DEE2; }

  .matchlist { margin: 4px 0 2px; }
  .matchitem { display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 8px; cursor: pointer; }
  .matchitem:hover { background: #FAF6F8; }
  .matchitem.sel { background: #F3E9EF; }
  .matchitem .avatar { width: 26px; height: 26px; font-size: 12px; }
  .matchitem .mname { font-size: 13px; font-weight: 500; color: ${C.ink}; }
  .matchitem .mmeta { font-size: 11px; color: ${C.muted}; }

  .success { text-align: center; padding: 10px 0 4px; }
  .success .check { width: 42px; height: 42px; border-radius: 50%; background: #E8F5F4; color: #2A6B6A; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 20px; }
  .success .msg { font-size: 14px; font-weight: 600; color: ${C.ink}; }
  .muted { font-size: 12px; color: ${C.muted}; }

  .jf-error { display: none; margin-top: 10px; padding: 8px 10px; border-radius: 8px; background: #F7DCDA; color: ${C.flatred600}; font-size: 12px; }
`;

type StatusKind = 'new' | 'known' | 'due';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

function esc(s: string | null | undefined): string {
  return (s || '').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string)
  );
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export class ConnectionPanel {
  private host: HTMLElement;
  private root: ShadowRoot;
  private currentEmail: EmailContext | null = null;
  private matches: ConnectionMatch[] = [];
  private selectedMatchId: string | null = null;
  private dismissedKeys = new Set<string>();
  private collapsed = true;
  private currentKey = '';
  private flash: string | null = null;

  constructor() {
    this.host = document.createElement('div');
    this.host.id = 'jobflow-connection-panel';
    this.root = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = STYLES;
    this.root.appendChild(style);
    document.documentElement.appendChild(this.host);
  }

  /** Update for the currently-open email. Each new email starts collapsed. */
  async update(email: EmailContext | null, key: string): Promise<void> {
    if (!email || !email.email || this.dismissedKeys.has(key)) {
      this.clear();
      return;
    }
    this.currentEmail = email;
    if (key !== this.currentKey) {
      this.currentKey = key;
      this.collapsed = true;
      this.flash = null;
    }
    const connections = await getConnections();
    this.matches = matchConnections(email, connections);
    this.selectedMatchId = this.matches[0]?.connection.id || null;
    this.render();
  }

  private selectedConnection(): Connection | null {
    return this.matches.find((m) => m.connection.id === this.selectedMatchId)?.connection || null;
  }

  private status(): { kind: StatusKind; suggestion: TouchpointSuggestion | null } {
    const connection = this.matches[0]?.connection;
    if (!connection) return { kind: 'new', suggestion: null };
    const suggestion = suggestTouchpoint(connection);
    return { kind: suggestion ? 'due' : 'known', suggestion };
  }

  private clear(): void {
    const card = this.root.querySelector('.card');
    if (card) card.remove();
    const launcher = this.root.querySelector('.launcher');
    if (launcher) launcher.remove();
    this.currentEmail = null;
    this.currentKey = '';
  }

  private mount(html: string): HTMLElement {
    // Swap the visible node only — must NOT reset currentEmail.
    this.root.querySelector('.card')?.remove();
    this.root.querySelector('.launcher')?.remove();
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const node = wrap.firstElementChild as HTMLElement;
    this.root.appendChild(node);
    return node;
  }

  private render(): void {
    if (this.collapsed) this.renderLauncher();
    else this.renderCard();
  }

  // ---- Collapsed launcher -------------------------------------------------

  private renderLauncher(): void {
    const email = this.currentEmail!;
    const { kind } = this.status();
    const displayName = email.name || email.email || '?';
    const statusChar = kind === 'new' ? '+' : kind === 'due' ? '!' : '✓';
    const tip =
      kind === 'new'
        ? `Add ${displayName} as a connection`
        : kind === 'due'
          ? `${displayName} — due for a touchpoint`
          : `Log this touchpoint with ${displayName}`;

    const node = this.mount(`
      <div class="launcher" title="${esc(tip)}">
        ${kind === 'due' ? '<span class="pulse"></span>' : ''}
        <span>${initials(displayName)}</span>
        <span class="status ${kind}">${statusChar}</span>
      </div>
    `);
    node.addEventListener('click', () => {
      this.collapsed = false;
      this.render();
    });
  }

  // ---- Expanded card ------------------------------------------------------

  private renderCard(): void {
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
            <div class="avatar">${initials(m.connection.name)}</div>
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
          <span class="title">${hasMatch ? 'Log touchpoint' : 'New connection?'}</span>
          <button data-act="minimize" title="Minimize">–</button>
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
          <div class="badges">
            <span class="badge ${hasMatch ? 'match' : 'new'}">${hasMatch ? 'Known connection' : 'Not in your connections'}</span>
            <span class="badge dir">${dirLabel}</span>
          </div>
          ${email.subject ? `<div class="subject">${esc(email.subject)}</div>` : ''}
          ${matchListHtml}
          ${hasMatch ? this.followUpHtml() : this.createFieldsHtml(email)}
          <label>Add a note (optional)</label>
          <textarea id="f-note" placeholder="Context for this touchpoint..."></textarea>
          <div class="jf-error"></div>
          <div class="actions">
            <button class="btn ghost" data-act="minimize">Not now</button>
            <button class="btn primary" data-act="${hasMatch ? 'log' : 'create'}">
              ${hasMatch ? 'Log email' : 'Add connection'}
            </button>
          </div>
        </div>
      </div>
    `);

    this.wireCard(card);
  }

  private createFieldsHtml(email: EmailContext): string {
    return `
      <label>Name</label>
      <input id="f-name" value="${esc(email.name || email.email || '')}" />
      <div class="row">
        <div style="flex:1"><label>Company</label><input id="f-company" value="${esc(companyFromEmail(email.email))}" /></div>
        <div style="flex:1"><label>Follow-up (optional)</label><input type="date" id="f-followup" /></div>
      </div>`;
  }

  private followUpHtml(): string {
    const connection = this.selectedConnection();
    const followUp = connection?.nextFollowUp;
    const { suggestion } = this.status();

    let stateClass = 'none';
    let stateLabel = 'None set';
    if (followUp) {
      const overdue = new Date(followUp) <= new Date();
      stateClass = overdue ? 'overdue' : 'set';
      stateLabel = overdue ? `Overdue · ${formatDate(followUp)}` : `${formatDate(followUp)}`;
    } else if (suggestion) {
      stateClass = 'due';
      stateLabel = suggestion.reason === 'never_contacted' ? 'Reach out' : 'Time to reconnect';
    }

    return `
      <div class="fu">
        <div class="fu-head">
          <span class="fu-title">Follow-up</span>
          <span class="fu-state ${stateClass}">${stateLabel}</span>
        </div>
        <div class="row">
          <div style="flex:1"><input type="date" id="f-followup" value="${followUp || ''}" /></div>
          <button class="btn ghost small" data-act="save-followup">Set</button>
        </div>
        ${this.flash ? `<div class="saved">${esc(this.flash)}</div>` : ''}
      </div>`;
  }

  private wireCard(card: HTMLElement): void {
    card.querySelectorAll<HTMLElement>('.matchitem').forEach((el) => {
      el.addEventListener('click', () => {
        this.selectedMatchId = el.getAttribute('data-mid');
        this.flash = null;
        this.renderCard();
      });
    });
    card.querySelector('[data-act="dismiss"]')?.addEventListener('click', () => {
      this.dismissedKeys.add(this.currentKey);
      this.clear();
    });
    card.querySelectorAll('[data-act="minimize"]').forEach((el) =>
      el.addEventListener('click', () => {
        this.collapsed = true;
        this.render();
      })
    );
    card.querySelector('[data-act="log"]')?.addEventListener('click', () => this.handleLog());
    card.querySelector('[data-act="create"]')?.addEventListener('click', () => this.handleCreate());
    card.querySelector('[data-act="save-followup"]')?.addEventListener('click', () =>
      this.handleSetFollowUp()
    );
  }

  private getNote(): string | undefined {
    return this.root.querySelector<HTMLTextAreaElement>('#f-note')?.value.trim() || undefined;
  }

  private getFollowUp(): string | undefined {
    return this.root.querySelector<HTMLInputElement>('#f-followup')?.value || undefined;
  }

  private async handleLog(): Promise<void> {
    if (!this.currentEmail || !this.selectedMatchId) return;
    try {
      const result = await logEmailToConnection(this.selectedMatchId, this.currentEmail, {
        notes: this.getNote(),
      });
      if (!result) return;
      // Persist a follow-up date too, if one was entered.
      const followUp = this.getFollowUp();
      if (followUp) await setConnectionFollowUp(this.selectedMatchId, followUp);
      const name = result.connection.name;
      this.renderSuccess(result.wasNew ? `Logged to ${name}` : `Already logged to ${name}`);
    } catch (err) {
      this.reportError(err);
    }
  }

  private async handleCreate(): Promise<void> {
    if (!this.currentEmail) return;
    try {
      const nameEl = this.root.querySelector<HTMLInputElement>('#f-name');
      const companyEl = this.root.querySelector<HTMLInputElement>('#f-company');
      const connection = await createConnectionFromEmail(
        this.currentEmail,
        {
          name: nameEl?.value.trim() || this.currentEmail.name || 'Unknown',
          company: companyEl?.value.trim() || '',
          nextFollowUp: this.getFollowUp(),
        },
        { notes: this.getNote() }
      );
      this.renderSuccess(`Added ${connection.name}`);
    } catch (err) {
      this.reportError(err);
    }
  }

  private async handleSetFollowUp(): Promise<void> {
    if (!this.selectedMatchId) return;
    try {
      await setConnectionFollowUp(this.selectedMatchId, this.getFollowUp());
      // Refresh matches so the new date/state shows, and confirm inline.
      if (this.currentEmail) {
        const connections = await getConnections();
        this.matches = matchConnections(this.currentEmail, connections);
      }
      this.flash = 'Follow-up saved';
      this.renderCard();
    } catch (err) {
      this.reportError(err);
    }
  }

  private reportError(err: unknown): void {
    const raw = err instanceof Error ? err.message : String(err);
    console.error('[JobFlow] Failed to save connection:', err);
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
          <span class="title">JobFlow Connections</span>
          <button data-act="close" title="Close">×</button>
        </div>
        <div class="body">
          <div class="success">
            <div class="check">✓</div>
            <div class="msg">${esc(message)}</div>
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
        chrome.runtime.sendMessage({ type: 'jobflow:open-dashboard' });
      } catch {
        /* extension context gone — ignore */
      }
    });
  }

  destroy(): void {
    this.host.remove();
  }
}
