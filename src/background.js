/**
 * Background Service Worker for Job Application Tracker
 * Handles extension lifecycle events and optional background tasks
 */

// Extension installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Job Tracker extension installed!');
    
    // Initialize storage with empty array if needed
    chrome.storage.local.get(['jobApplications', 'connections'], (result) => {
      if (!result.jobApplications) {
        chrome.storage.local.set({ jobApplications: [] });
      }
      if (!result.connections) {
        chrome.storage.local.set({ connections: [] });
      }
    });
  }
  
  // Create context menu (runs on install and update)
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'saveJob',
      title: 'Save to Job Tracker',
      contexts: ['page']
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveJob') {
    // Open the extension popup programmatically isn't directly possible,
    // so we'll just log for now - the user can click the icon
    console.log('Context menu clicked on:', tab.url);
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openDashboard') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/dashboard/dashboard.html')
    });
    sendResponse({ success: true });
  }
  return true;
});