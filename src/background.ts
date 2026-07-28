/**
 * Background service worker
 *
 * Injects the Gmail connection assistant into Gmail tabs via chrome.scripting.
 *
 * Why not a normal manifest content_script? The build tool (crxjs) injects
 * content scripts through a loader that uses a dynamic import(), and Gmail's
 * strict Content-Security-Policy blocks that import — so the script never runs.
 * Injecting a self-contained IIFE bundle with chrome.scripting.executeScript
 * sidesteps the page CSP entirely: the browser runs the file directly rather
 * than the page fetching it. The injected bundle (gmail-inject.js) is built
 * separately by vite.inject.config.ts and guards against double-injection.
 */

export {};

const GMAIL_URL_PATTERN = /^https:\/\/mail\.google\.com\//;
const INJECT_FILE = 'gmail-inject.js';

function injectInto(tabId: number): void {
  chrome.scripting
    .executeScript({ target: { tabId }, files: [INJECT_FILE] })
    .catch((err) => {
      // Expected on tabs we can't touch (discarded, chrome://, etc.) — not fatal.
      console.debug('JobFlow: Gmail inject skipped', err?.message);
    });
}

// Inject when a Gmail tab finishes loading.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && GMAIL_URL_PATTERN.test(tab.url)) {
    injectInto(tabId);
  }
});

// Cover Gmail tabs already open when the extension is installed/updated/reloaded
// or the browser starts — so the user usually doesn't need to refresh Gmail.
function injectExistingTabs(): void {
  chrome.tabs.query({ url: 'https://mail.google.com/*' }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id != null) injectInto(tab.id);
    }
  });
}

chrome.runtime.onInstalled.addListener(injectExistingTabs);
chrome.runtime.onStartup.addListener(injectExistingTabs);

// Open the dashboard when the injected Gmail panel requests it (a content
// script/web page can't navigate to a chrome-extension:// URL itself).
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'jobflow:open-dashboard') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }
});
