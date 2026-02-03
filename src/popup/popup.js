/**
 * Popup script for Job Application Tracker
 */

// DOM Elements
const elements = {
  form: document.getElementById('jobForm'),
  url: document.getElementById('url'),
  urlDisplay: document.getElementById('urlDisplay'),
  companyUrl: document.getElementById('companyUrl'),
  portalUrl: document.getElementById('portalUrl'),
  title: document.getElementById('title'),
  company: document.getElementById('company'),
  location: document.getElementById('location'),
  salary: document.getElementById('salary'),
  tags: document.getElementById('tags'),
  notes: document.getElementById('notes'),
  saveBtn: document.getElementById('saveBtn'),
  dashboardBtn: document.getElementById('dashboardBtn'),
  popoutBtn: document.getElementById('popoutBtn'),
  loading: document.getElementById('loading'),
  success: document.getElementById('success'),
  error: document.getElementById('error'),
  errorMessage: document.getElementById('errorMessage'),
  alreadySaved: document.getElementById('alreadySaved'),
  viewExisting: document.getElementById('viewExisting'),
  statTotal: document.getElementById('statTotal'),
  statApplied: document.getElementById('statApplied'),
  statInterviewing: document.getElementById('statInterviewing'),
  interestRating: document.getElementById('interestRating'),
  starLabel: document.getElementById('starLabel')
};

let currentTabUrl = '';
let existingJobId = null;
let currentInterest = 0;

const INTEREST_LABELS = ['Not rated', 'Low interest', 'Somewhat interested', 'Interested', 'Very interested', 'Top choice'];

/**
 * Set up interest rating star buttons
 */
function setupInterestRating() {
  const starBtns = elements.interestRating.querySelectorAll('.star-btn');

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.value);
      setInterest(value);
    });
  });
}

/**
 * Set interest level and update UI
 */
function setInterest(value) {
  currentInterest = value;
  const starBtns = elements.interestRating.querySelectorAll('.star-btn');

  starBtns.forEach(btn => {
    const btnValue = parseInt(btn.dataset.value);
    btn.classList.toggle('active', btnValue <= value);
  });

  elements.starLabel.textContent = INTEREST_LABELS[value];
}

/**
 * Open popup content in a new tab (popout mode)
 * Passes the current URL as a query parameter so we can track which page we're saving from
 */
function openPopout() {
  const popoutUrl = chrome.runtime.getURL('src/popup/popup.html') + '?sourceUrl=' + encodeURIComponent(currentTabUrl);
  chrome.tabs.create({
    url: popoutUrl
  });
  window.close(); // Close the popup
}

/**
 * Initialize the popup
 */
async function init() {
  showLoading(true);
  setupInterestRating();

  try {
    // Check if opened in popout mode with a source URL
    const urlParams = new URLSearchParams(window.location.search);
    const sourceUrl = urlParams.get('sourceUrl');

    let tabId = null;

    if (sourceUrl) {
      // Popout mode - use the passed URL
      currentTabUrl = sourceUrl;
      // Hide popout button since we're already popped out
      elements.popoutBtn.style.display = 'none';
    } else {
      // Normal popup mode - get current tab info
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      currentTabUrl = tab.url;
      tabId = tab.id;
    }

    elements.url.value = currentTabUrl;

    // Display truncated URL
    try {
      const urlObj = new URL(currentTabUrl);
      elements.urlDisplay.textContent = urlObj.hostname + urlObj.pathname.slice(0, 30) + (urlObj.pathname.length > 30 ? '...' : '');
      elements.urlDisplay.title = currentTabUrl;
    } catch {
      elements.urlDisplay.textContent = currentTabUrl.slice(0, 40) + '...';
      elements.urlDisplay.title = currentTabUrl;
    }

    // Check if already saved
    const existingJob = await findByUrl(currentTabUrl);
    if (existingJob) {
      existingJobId = existingJob.id;
      elements.alreadySaved.classList.remove('hidden');
      // Pre-fill with existing data
      populateForm(existingJob);
      elements.saveBtn.textContent = 'Update Application';
    } else if (tabId) {
      // Only try to scrape if we have a tab ID (not in popout mode)
      await scrapeCurrentPage(tabId);
    }
    
    // Load stats
    await updateStats();
    
  } catch (err) {
    console.error('Init error:', err);
    showError('Could not load page information');
  } finally {
    showLoading(false);
  }
}

/**
 * Scrape job details from current page
 */
async function scrapeCurrentPage(tabId) {
  try {
    // First inject the content script if needed
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['src/content/scraper.js']
    });
    
    // Small delay to ensure script is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tabId, { action: 'scrapeJob' });
    
    if (response) {
      populateForm(response);
    }
  } catch (err) {
    console.log('Scraping not available on this page:', err.message);
    // This is fine - user can enter manually
  }
}

/**
 * Populate form with job data
 */
function populateForm(data) {
  if (data.title) elements.title.value = data.title;
  if (data.company) elements.company.value = data.company;
  if (data.location) elements.location.value = data.location;
  if (data.salary) elements.salary.value = data.salary;
  if (data.companyUrl) elements.companyUrl.value = data.companyUrl;
  if (data.portalUrl) elements.portalUrl.value = data.portalUrl;
  if (data.tags && Array.isArray(data.tags)) {
    elements.tags.value = data.tags.join(', ');
  }
  if (data.notes) elements.notes.value = data.notes;
  if (data.interest) setInterest(data.interest);
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
  e.preventDefault();
  
  // Validate required fields
  if (!elements.title.value.trim() || !elements.company.value.trim()) {
    showError('Please enter job title and company');
    return;
  }
  
  elements.saveBtn.disabled = true;
  
  try {
    const jobData = {
      url: currentTabUrl,
      companyUrl: elements.companyUrl.value.trim(),
      portalUrl: elements.portalUrl.value.trim(),
      title: elements.title.value.trim(),
      company: elements.company.value.trim(),
      location: elements.location.value.trim(),
      salary: elements.salary.value.trim(),
      notes: elements.notes.value.trim(),
      interest: currentInterest,
      tags: elements.tags.value
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0)
    };
    
    if (existingJobId) {
      // Update existing
      await updateApplication(existingJobId, jobData);
    } else {
      // Save new
      await saveApplication(jobData);
    }
    
    showSuccess();
    await updateStats();

    // Check if in popout mode
    const urlParams = new URLSearchParams(window.location.search);
    const isPopout = urlParams.has('sourceUrl');

    // Close popup after short delay (only if not in popout mode)
    if (!isPopout) {
      setTimeout(() => window.close(), 1500);
    }
    
  } catch (err) {
    console.error('Save error:', err);
    showError('Failed to save application');
  } finally {
    elements.saveBtn.disabled = false;
  }
}

/**
 * Update statistics display
 */
async function updateStats() {
  const stats = await getStats();
  elements.statTotal.textContent = stats.total;
  elements.statApplied.textContent = stats.applied;
  elements.statInterviewing.textContent = stats.interviewing;
}

/**
 * Open dashboard in new tab
 */
function openDashboard() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
}

/**
 * View existing job in dashboard
 */
function viewExistingJob() {
  chrome.tabs.create({
    url: chrome.runtime.getURL(`index.html?highlight=${existingJobId}`)
  });
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
  elements.loading.classList.toggle('hidden', !show);
  elements.form.classList.toggle('hidden', show);
}

/**
 * Show success message
 */
function showSuccess() {
  elements.success.classList.remove('hidden');
  elements.error.classList.add('hidden');
}

/**
 * Show error message
 */
function showError(message) {
  elements.errorMessage.textContent = message;
  elements.error.classList.remove('hidden');
  elements.success.classList.add('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    elements.error.classList.add('hidden');
  }, 5000);
}

// Event Listeners
elements.form.addEventListener('submit', handleSubmit);
elements.dashboardBtn.addEventListener('click', openDashboard);
elements.viewExisting.addEventListener('click', viewExistingJob);
elements.popoutBtn.addEventListener('click', openPopout);

// Initialize on popup open
document.addEventListener('DOMContentLoaded', init);
