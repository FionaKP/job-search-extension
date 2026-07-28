/**
 * Content script: Gmail connection assistant
 *
 * Watches the open Gmail conversation and surfaces an in-page panel that lets
 * the user log the email as a touchpoint against a connection, add context, or
 * create a new connection. Runs entirely client-side against the DOM — no email
 * data leaves the browser and no OAuth is required (see docs for the planned
 * Gmail-API monitoring phase).
 */

export {};

import { parseOpenEmail, emailKey } from './email/gmailParser';
import { ConnectionPanel } from './email/panel';

declare global {
  interface Window {
    __jobflowGmailLoaded?: boolean;
  }
}

if (typeof window.__jobflowGmailLoaded === 'undefined') {
  window.__jobflowGmailLoaded = true;

  const panel = new ConnectionPanel();
  let lastKey = '';
  let scheduled = false;

  function evaluate(): void {
    scheduled = false;
    let email = null;
    try {
      email = parseOpenEmail(document);
    } catch (err) {
      console.error('JobFlow Gmail: parse error', err);
      return;
    }
    const key = emailKey(email);
    if (key === lastKey) return;
    lastKey = key;
    void panel.update(email, key);
  }

  function schedule(): void {
    if (scheduled) return;
    scheduled = true;
    // Debounce: Gmail mutates the DOM heavily; coalesce bursts into one pass.
    setTimeout(evaluate, 350);
  }

  // Observe the whole document; Gmail is a SPA so navigation is DOM-driven.
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });

  // Also react to Gmail's hash-based navigation between messages/inbox.
  window.addEventListener('hashchange', schedule);

  // Initial pass once the app has had a moment to render.
  setTimeout(evaluate, 1200);
}
