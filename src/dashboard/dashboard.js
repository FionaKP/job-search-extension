/**
 * Dashboard script for Job Application Tracker
 */

// State
let allApplications = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'dateAdded-desc';
let selectedJobId = null;
let currentViewMode = 'list'; // 'list' or 'grouped'
let expandedCompanies = new Set();
let editingCardId = null;

// Connections state
let allConnections = [];
let currentSection = 'jobs'; // 'jobs' or 'connections'
let connectionFilter = 'all';
let connectionSearch = '';
let connectionSort = 'dateAdded-desc';
let selectedConnectionId = null;

// DOM Elements
const elements = {
  jobList: document.getElementById('jobList'),
  emptyState: document.getElementById('emptyState'),
  noResults: document.getElementById('noResults'),
  searchInput: document.getElementById('searchInput'),
  sortBy: document.getElementById('sortBy'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  exportBtn: document.getElementById('exportBtn'),
  viewListBtn: document.getElementById('viewListBtn'),
  viewThumbnailBtn: document.getElementById('viewThumbnailBtn'),
  viewGroupedBtn: document.getElementById('viewGroupedBtn'),
  editInterest: document.getElementById('editInterest'),
  // Stats
  statTotal: document.getElementById('statTotal'),
  statSaved: document.getElementById('statSaved'),
  statApplied: document.getElementById('statApplied'),
  statInterviewing: document.getElementById('statInterviewing'),
  statOffer: document.getElementById('statOffer'),
  statRejected: document.getElementById('statRejected'),
  // Modal
  modal: document.getElementById('jobModal'),
  closeModal: document.getElementById('closeModal'),
  editForm: document.getElementById('editForm'),
  deleteBtn: document.getElementById('deleteBtn'),
  editTitle: document.getElementById('editTitle'),
  editCompany: document.getElementById('editCompany'),
  editLocation: document.getElementById('editLocation'),
  editSalary: document.getElementById('editSalary'),
  editStatus: document.getElementById('editStatus'),
  editTags: document.getElementById('editTags'),
  editNotes: document.getElementById('editNotes'),
  editUrl: document.getElementById('editUrl'),
  editCompanyUrl: document.getElementById('editCompanyUrl'),
  editCompanyLink: document.getElementById('editCompanyLink'),
  companyLinkRow: document.getElementById('companyLinkRow'),
  editPortalUrl: document.getElementById('editPortalUrl'),
  editPortalLink: document.getElementById('editPortalLink'),
  portalLinkRow: document.getElementById('portalLinkRow'),
  editDateAdded: document.getElementById('editDateAdded'),
  modalTitle: document.getElementById('modalTitle'),
  // Linked connections in job modal
  jobLinkedConnections: document.getElementById('jobLinkedConnections'),
  jobLinkConnectionSelect: document.getElementById('jobLinkConnectionSelect'),
  jobLinkConnectionBtn: document.getElementById('jobLinkConnectionBtn'),
  // Section nav
  sectionBtns: document.querySelectorAll('.section-btn'),
  jobFilters: document.getElementById('jobFilters'),
  connectionFilters: document.getElementById('connectionFilters'),
  connectionFilterBtns: document.querySelectorAll('#connectionFilters .filter-btn'),
  // Connections section
  connectionsSection: document.getElementById('connectionsSection'),
  connectionSearchInput: document.getElementById('connectionSearchInput'),
  connectionSortBy: document.getElementById('connectionSortBy'),
  addConnectionBtn: document.getElementById('addConnectionBtn'),
  connectionList: document.getElementById('connectionList'),
  connectionsEmpty: document.getElementById('connectionsEmpty'),
  connectionsNoResults: document.getElementById('connectionsNoResults'),
  // Connection modal
  connectionModal: document.getElementById('connectionModal'),
  closeConnectionModal: document.getElementById('closeConnectionModal'),
  connectionModalTitle: document.getElementById('connectionModalTitle'),
  connectionEditForm: document.getElementById('connectionEditForm'),
  deleteConnectionBtn: document.getElementById('deleteConnectionBtn'),
  connName: document.getElementById('connName'),
  connRelationship: document.getElementById('connRelationship'),
  connCompany: document.getElementById('connCompany'),
  connRole: document.getElementById('connRole'),
  connEmail: document.getElementById('connEmail'),
  connPhone: document.getElementById('connPhone'),
  connLinkedin: document.getElementById('connLinkedin'),
  connIndustry: document.getElementById('connIndustry'),
  connTags: document.getElementById('connTags'),
  connLastContacted: document.getElementById('connLastContacted'),
  connNotes: document.getElementById('connNotes'),
  connLinkedJobs: document.getElementById('connLinkedJobs'),
  connLinkJobSelect: document.getElementById('connLinkJobSelect'),
  connLinkJobBtn: document.getElementById('connLinkJobBtn')
};

/**
 * Initialize dashboard
 */
async function init() {
  await loadApplications();
  await loadConnections();
  setupEventListeners();
  checkForHighlight();
}

/**
 * Load all applications and render
 */
async function loadApplications() {
  allApplications = await getAllApplications();
  await updateStats();
  renderJobs();
}

/**
 * Load all connections and render
 */
async function loadConnections() {
  allConnections = await getAllConnections();
  if (currentSection === 'connections') {
    renderConnections();
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Search
  elements.searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderJobs();
  });
  
  // Sort
  elements.sortBy.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderJobs();
  });
  
  // Filter buttons
  elements.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.status;
      renderJobs();
    });
  });
  
  // Export
  elements.exportBtn.addEventListener('click', handleExport);

  // View toggle
  elements.viewListBtn.addEventListener('click', () => setViewMode('list'));
  elements.viewThumbnailBtn.addEventListener('click', () => setViewMode('thumbnail'));
  elements.viewGroupedBtn.addEventListener('click', () => setViewMode('grouped'));

  // Star rating in modal
  elements.editInterest.addEventListener('click', (e) => {
    const starBtn = e.target.closest('.star-btn');
    if (starBtn) {
      const value = parseInt(starBtn.dataset.value);
      setInterestRating(value);
    }
  });

  // Modal
  elements.closeModal.addEventListener('click', closeModal);
  elements.modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  elements.editForm.addEventListener('submit', handleSaveEdit);
  elements.deleteBtn.addEventListener('click', handleDelete);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeConnectionModal();
    }
  });

  // Section navigation
  elements.sectionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.sectionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchSection(btn.dataset.section);
    });
  });

  // Connection filters
  elements.connectionFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.connectionFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      connectionFilter = btn.dataset.relationship;
      renderConnections();
    });
  });

  // Connection search
  elements.connectionSearchInput.addEventListener('input', (e) => {
    connectionSearch = e.target.value.toLowerCase();
    renderConnections();
  });

  // Connection sort
  elements.connectionSortBy.addEventListener('change', (e) => {
    connectionSort = e.target.value;
    renderConnections();
  });

  // Add connection button
  elements.addConnectionBtn.addEventListener('click', () => openConnectionModal(null));

  // Connection modal
  elements.closeConnectionModal.addEventListener('click', closeConnectionModal);
  elements.connectionModal.querySelector('.modal-backdrop').addEventListener('click', closeConnectionModal);
  elements.connectionEditForm.addEventListener('submit', handleSaveConnection);
  elements.deleteConnectionBtn.addEventListener('click', handleDeleteConnection);

  // Link job to connection
  elements.connLinkJobBtn.addEventListener('click', linkJobToConnection);

  // Link connection to job
  elements.jobLinkConnectionBtn.addEventListener('click', linkConnectionToJob);
}

/**
 * Check URL for job to highlight
 */
function checkForHighlight() {
  const params = new URLSearchParams(window.location.search);
  const highlightId = params.get('highlight');
  if (highlightId) {
    setTimeout(() => {
      const card = document.querySelector(`[data-job-id="${highlightId}"]`);
      if (card) {
        card.classList.add('highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
}

/**
 * Update statistics display
 */
async function updateStats() {
  const stats = await getStats();
  elements.statTotal.textContent = stats.total;
  elements.statSaved.textContent = stats.saved;
  elements.statApplied.textContent = stats.applied;
  elements.statInterviewing.textContent = stats.interviewing;
  elements.statOffer.textContent = stats.offer;
  elements.statRejected.textContent = stats.rejected;
}

/**
 * Filter and sort applications
 */
function getFilteredApplications() {
  let filtered = [...allApplications];
  
  // Apply status filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(job => job.status === currentFilter);
  }
  
  // Apply search filter
  if (currentSearch) {
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(currentSearch) ||
      job.company.toLowerCase().includes(currentSearch) ||
      job.location?.toLowerCase().includes(currentSearch) ||
      job.tags?.some(tag => tag.includes(currentSearch))
    );
  }
  
  // Apply sort
  const [sortField, sortDir] = currentSort.split('-');
  filtered.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    // Handle special cases
    if (sortField === 'dateAdded') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else if (sortField === 'status') {
      const statusOrder = ['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'];
      valA = statusOrder.indexOf(valA);
      valB = statusOrder.indexOf(valB);
    } else if (sortField === 'interest') {
      valA = valA || 0;
      valB = valB || 0;
    } else {
      valA = (valA || '').toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (sortDir === 'asc') {
      return valA > valB ? 1 : -1;
    }
    return valA < valB ? 1 : -1;
  });
  
  return filtered;
}

/**
 * Set view mode
 */
function setViewMode(mode) {
  currentViewMode = mode;
  elements.viewListBtn.classList.toggle('active', mode === 'list');
  elements.viewThumbnailBtn.classList.toggle('active', mode === 'thumbnail');
  elements.viewGroupedBtn.classList.toggle('active', mode === 'grouped');

  // Update job list class for grid layout
  elements.jobList.classList.toggle('thumbnail-grid', mode === 'thumbnail');

  renderJobs();
}

/**
 * Get company domain guess from job
 */
function getCompanyDomain(job) {
  try {
    const url = new URL(job.url);
    let domain = url.hostname;

    // Handle common job board domains - try to extract company domain
    if (domain.includes('greenhouse.io')) {
      const match = job.url.match(/greenhouse\.io\/([^\/]+)/);
      if (match) return `${match[1]}.com`;
    } else if (domain.includes('lever.co')) {
      const match = job.url.match(/jobs\.lever\.co\/([^\/]+)/);
      if (match) return `${match[1]}.com`;
    } else if (domain.includes('linkedin.com') || domain.includes('indeed.com') || domain.includes('workday')) {
      // Use company name for generic job boards
      const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]/g, '');
      return `${companySlug}.com`;
    } else {
      return domain;
    }
  } catch (e) {
    // Fallback: try company name
    const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${companySlug}.com`;
  }
}

/**
 * Get multiple logo URL sources to try (in order of preference)
 */
function getLogoSources(job) {
  const domain = getCompanyDomain(job);
  const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]/g, '');

  return [
    // Clearbit - high quality logos
    `https://logo.clearbit.com/${domain}`,
    // Unavatar - aggregates multiple sources (Clearbit, Google, Gravatar, etc.)
    `https://unavatar.io/${domain}?fallback=false`,
    // Google Favicon - very reliable, works for most domains
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    // Try with just company name slug
    `https://logo.clearbit.com/${companySlug}.com`,
    `https://unavatar.io/${companySlug}.com?fallback=false`,
  ];
}

/**
 * Get company logo URL (primary source)
 */
function getCompanyLogoUrl(job) {
  const sources = getLogoSources(job);
  return sources[0]; // Return first source, fallbacks handled in JS
}

/**
 * Get company initials as fallback
 */
function getCompanyInitials(company) {
  return company
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Render star rating HTML
 */
function renderStars(interest, interactive = false) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (interactive) {
      stars.push(`<button type="button" class="star-btn ${i <= interest ? 'active' : ''}" data-value="${i}">★</button>`);
    } else {
      stars.push(`<span class="star ${i <= interest ? 'active' : ''}">★</span>`);
    }
  }
  return stars.join('');
}

/**
 * Set interest rating in modal
 */
let currentInterest = 0;
function setInterestRating(value) {
  currentInterest = value;
  const stars = elements.editInterest.querySelectorAll('.star-btn');
  stars.forEach((star, index) => {
    star.classList.toggle('active', index < value);
  });
}

/**
 * Toggle company group expansion
 */
function toggleCompanyGroup(company) {
  if (expandedCompanies.has(company)) {
    expandedCompanies.delete(company);
  } else {
    expandedCompanies.add(company);
  }
  renderJobs();
}

/**
 * Start inline editing mode for a card
 */
function startInlineEdit(jobId) {
  editingCardId = jobId;
  renderJobs();
  setTimeout(() => {
    const firstInput = document.querySelector(`[data-job-id="${jobId}"] .inline-title`);
    if (firstInput) firstInput.focus();
  }, 50);
}

/**
 * Cancel inline editing
 */
function cancelInlineEdit() {
  editingCardId = null;
  renderJobs();
}

/**
 * Save inline edits
 */
async function saveInlineEdit(jobId) {
  const card = document.querySelector(`.job-card[data-job-id="${jobId}"]`);
  if (!card) return;

  const titleInput = card.querySelector('[data-field="title"]');
  const companyInput = card.querySelector('[data-field="company"]');
  const statusSelect = card.querySelector('[data-field="status"]');

  const updates = {
    title: titleInput?.value.trim() || '',
    company: companyInput?.value.trim() || '',
    status: statusSelect?.value || 'saved'
  };

  if (!updates.title || !updates.company) {
    alert('Title and company are required');
    return;
  }

  await updateApplication(jobId, updates);
  editingCardId = null;
  await loadApplications();
}

/**
 * Render a single job card
 */
function renderJobCard(job) {
  const isEditing = editingCardId === job.id;

  if (isEditing) {
    return `
      <div class="job-card editing" data-job-id="${job.id}">
        <div class="job-card-header">
          <div class="job-card-info">
            <input type="text" class="inline-edit-input inline-title"
                   value="${escapeHtml(job.title)}"
                   data-field="title" data-job-id="${job.id}">
            <input type="text" class="inline-edit-input inline-company"
                   value="${escapeHtml(job.company)}"
                   data-field="company" data-job-id="${job.id}">
          </div>
          <div class="job-card-right">
            <select class="inline-status-select" data-field="status" data-job-id="${job.id}">
              <option value="saved" ${job.status === 'saved' ? 'selected' : ''}>Saved</option>
              <option value="applied" ${job.status === 'applied' ? 'selected' : ''}>Applied</option>
              <option value="interviewing" ${job.status === 'interviewing' ? 'selected' : ''}>Interviewing</option>
              <option value="offer" ${job.status === 'offer' ? 'selected' : ''}>Offer</option>
              <option value="rejected" ${job.status === 'rejected' ? 'selected' : ''}>Rejected</option>
              <option value="withdrawn" ${job.status === 'withdrawn' ? 'selected' : ''}>Withdrawn</option>
            </select>
            <div class="job-card-controls">
              <button class="btn-inline btn-save-inline" data-job-id="${job.id}">Save</button>
              <button class="btn-inline btn-cancel-inline" data-job-id="${job.id}">Cancel</button>
            </div>
          </div>
        </div>
        <div class="job-card-meta">
          ${job.location ? `<span>📍 ${escapeHtml(job.location)}</span>` : ''}
          ${job.salary ? `<span>💰 ${escapeHtml(job.salary)}</span>` : ''}
          <span>📅 ${formatDate(job.dateAdded)}</span>
        </div>
      </div>
    `;
  }

  const interest = job.interest || 0;

  return `
    <div class="job-card" data-job-id="${job.id}">
      <div class="job-card-header">
        <div class="job-card-info">
          <h3 class="job-card-title">${escapeHtml(job.title)}</h3>
          <div class="job-card-company">${escapeHtml(job.company)}</div>
        </div>
        <div class="job-card-right">
          ${interest > 0 ? `<span class="star-display">${renderStars(interest)}</span>` : ''}
          <span class="job-card-status status-${job.status}">${formatStatus(job.status)}</span>
          <div class="job-card-controls">
            <button class="btn-inline btn-edit-inline" data-job-id="${job.id}">Quick Edit</button>
            <button class="btn-inline btn-details" data-job-id="${job.id}">Details</button>
          </div>
        </div>
      </div>
      <div class="job-card-meta">
        ${job.location ? `<span>📍 ${escapeHtml(job.location)}</span>` : ''}
        ${job.salary ? `<span>💰 ${escapeHtml(job.salary)}</span>` : ''}
        <span>📅 ${formatDate(job.dateAdded)}</span>
        ${job.portalUrl ? `<span class="portal-indicator" title="Has application portal">🔗 Portal</span>` : ''}
        ${getConnectionCountForJob(job.id) > 0 ? `<span class="connection-count-badge" title="Linked connections">👤 ${getConnectionCountForJob(job.id)}</span>` : ''}
      </div>
      ${job.tags && job.tags.length > 0 ? `
        <div class="job-card-tags">
          ${job.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Get status summary badges for a company
 */
function getCompanyStatusSummary(jobs) {
  const counts = {};
  jobs.forEach(job => {
    counts[job.status] = (counts[job.status] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([status, count]) => `<span class="status-badge status-${status}">${count}</span>`)
    .join('');
}

/**
 * Render flat list view
 */
function renderListView(jobs) {
  elements.jobList.innerHTML = jobs.map(job => renderJobCard(job)).join('');
}

/**
 * Render thumbnail card
 */
function renderThumbnailCard(job) {
  const logoUrl = getCompanyLogoUrl(job);
  const initials = getCompanyInitials(job.company);
  const interest = job.interest || 0;

  const logoContent = `
    <img class="company-logo" src="${logoUrl}" alt="${escapeHtml(job.company)}">
    <div class="thumbnail-initials">${initials}</div>
  `;

  const logoHtml = job.companyUrl
    ? `<a href="${escapeHtml(job.companyUrl)}" target="_blank" class="thumbnail-logo thumbnail-logo-link" title="Visit ${escapeHtml(job.company)} website">${logoContent}</a>`
    : `<div class="thumbnail-logo">${logoContent}</div>`;

  return `
    <div class="thumbnail-card" data-job-id="${job.id}">
      ${logoHtml}
      <div class="thumbnail-content">
        <h4 class="thumbnail-title">${escapeHtml(job.title)}</h4>
        <div class="thumbnail-company">${escapeHtml(job.company)}</div>
        ${job.location ? `<div class="thumbnail-location">📍 ${escapeHtml(job.location)}</div>` : ''}
        <div class="thumbnail-meta">
          <span class="thumbnail-status status-${job.status}" title="${formatStatusWithDate(job)}">${formatStatusShort(job.status)}</span>
          <span class="thumbnail-date">${formatDate(getStatusDate(job))}</span>
        </div>
      </div>
      ${interest > 0 ? `<div class="thumbnail-stars-overlay">${renderStars(interest)}</div>` : ''}
      <div class="thumbnail-actions">
        <button class="btn-inline btn-details" data-job-id="${job.id}" title="View Details">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * Format status short (for thumbnail view) - icon only
 */
function formatStatusShort(status) {
  return STATUS_ICONS[status] || status;
}

/**
 * Get the relevant date for a job's current status
 */
function getStatusDate(job) {
  if (job.status === 'applied' && job.dateApplied) {
    return job.dateApplied;
  }
  return job.dateAdded;
}

/**
 * Format status with date
 */
function formatStatusWithDate(job) {
  const date = getStatusDate(job);
  const statusLabels = {
    saved: 'Saved',
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
  };
  return `${statusLabels[job.status] || job.status} ${formatDate(date)}`;
}

/**
 * Render thumbnail view
 */
function renderThumbnailView(jobs) {
  elements.jobList.innerHTML = jobs.map(job => renderThumbnailCard(job)).join('');
}

/**
 * Render company-grouped view
 */
function renderGroupedView(jobs) {
  // Group jobs by company
  const grouped = {};
  jobs.forEach(job => {
    const company = job.company || 'Unknown Company';
    if (!grouped[company]) {
      grouped[company] = [];
    }
    grouped[company].push(job);
  });

  // Sort companies alphabetically
  const sortedCompanies = Object.keys(grouped).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  // Render grouped HTML
  elements.jobList.innerHTML = sortedCompanies.map(company => {
    const companyJobs = grouped[company];
    const isExpanded = expandedCompanies.has(company);
    const statusSummary = getCompanyStatusSummary(companyJobs);
    const hasWebsite = companyJobs.some(job => job.companyUrl);
    const websiteUrl = companyJobs.find(job => job.companyUrl)?.companyUrl || '';
    const hasPortal = companyJobs.some(job => job.portalUrl);
    const portalUrl = companyJobs.find(job => job.portalUrl)?.portalUrl || '';

    return `
      <div class="company-group ${isExpanded ? 'expanded' : 'collapsed'}" data-company="${escapeHtml(company)}">
        <div class="company-group-header">
          <div class="company-group-info">
            <span class="company-group-toggle">${isExpanded ? '▼' : '▶'}</span>
            <h3 class="company-group-name">${escapeHtml(company)}</h3>
            <span class="company-group-count">${companyJobs.length} job${companyJobs.length !== 1 ? 's' : ''}</span>
            ${hasWebsite ? `<span class="company-group-link-indicator" title="${escapeHtml(websiteUrl)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></span>` : ''}
            ${hasPortal ? `<span class="company-group-link-indicator" title="${escapeHtml(portalUrl)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></span>` : ''}
          </div>
          <div class="company-group-actions">
            <button class="btn-inline btn-set-website" data-company="${escapeHtml(company)}" title="${hasWebsite ? 'Update' : 'Set'} website for all ${escapeHtml(company)} jobs">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              ${hasWebsite ? 'Edit' : 'Set'}
            </button>
            <button class="btn-inline btn-set-portal" data-company="${escapeHtml(company)}" title="${hasPortal ? 'Update' : 'Set'} portal for all ${escapeHtml(company)} jobs">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              ${hasPortal ? 'Edit' : 'Set'}
            </button>
            <div class="company-group-status-summary">
              ${statusSummary}
            </div>
          </div>
        </div>
        ${isExpanded ? `
          <div class="company-group-jobs">
            ${companyJobs.map(job => renderJobCard(job)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

/**
 * Render job cards
 */
function renderJobs() {
  const filtered = getFilteredApplications();

  // Handle empty states
  if (allApplications.length === 0) {
    elements.jobList.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
    elements.noResults.classList.add('hidden');
    return;
  }

  if (filtered.length === 0) {
    elements.jobList.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
    elements.noResults.classList.remove('hidden');
    return;
  }

  elements.jobList.classList.remove('hidden');
  elements.emptyState.classList.add('hidden');
  elements.noResults.classList.add('hidden');

  // Render based on view mode
  if (currentViewMode === 'grouped') {
    renderGroupedView(filtered);
  } else if (currentViewMode === 'thumbnail') {
    renderThumbnailView(filtered);
  } else {
    renderListView(filtered);
  }

  // Set up event delegation for card buttons
  setupCardEventListeners();

  // Handle logo load errors for thumbnail view
  if (currentViewMode === 'thumbnail') {
    setupLogoErrorHandlers();
  }
}

/**
 * Set up error handlers for company logos with fallback sources
 */
function setupLogoErrorHandlers() {
  const cards = elements.jobList.querySelectorAll('.thumbnail-card');

  cards.forEach(card => {
    const img = card.querySelector('.company-logo');
    const initials = card.querySelector('.thumbnail-initials');
    const jobId = card.dataset.jobId;
    const job = allApplications.find(j => j.id === jobId);

    if (!img || !job) return;

    // Get all possible logo sources
    const sources = getLogoSources(job);
    let sourceIndex = 0;

    // Store sources on the image for fallback attempts
    img._logoSources = sources;
    img._sourceIndex = 0;

    img.addEventListener('error', function() {
      this._sourceIndex++;

      if (this._sourceIndex < this._logoSources.length) {
        // Try next source
        this.src = this._logoSources[this._sourceIndex];
      } else {
        // All sources failed, show initials
        this.style.display = 'none';
        if (initials) {
          initials.style.display = 'flex';
        }
      }
    });

    img.addEventListener('load', function() {
      // Check if it's a valid image (some services return tiny placeholder images)
      if (this.naturalWidth > 1 && this.naturalHeight > 1) {
        this.style.display = 'block';
        if (initials) {
          initials.style.display = 'none';
        }
      } else {
        // Tiny image, try next source
        this.dispatchEvent(new Event('error'));
      }
    });
  });
}

/**
 * Set company website URL for all jobs in a company group
 */
async function setCompanyWebsite(company) {
  const companyJobs = allApplications.filter(job => job.company === company);
  const existingUrl = companyJobs.find(job => job.companyUrl)?.companyUrl || '';

  const companyUrl = prompt(`Enter the company website URL for all ${company} jobs:`, existingUrl);
  if (companyUrl === null) return; // User cancelled

  for (const job of companyJobs) {
    await updateApplication(job.id, { companyUrl: companyUrl.trim() });
  }
  await loadApplications();
}

/**
 * Set portal URL for all jobs in a company group
 */
async function setCompanyPortal(company) {
  const companyJobs = allApplications.filter(job => job.company === company);
  const existingPortal = companyJobs.find(job => job.portalUrl)?.portalUrl || '';

  const portalUrl = prompt(`Enter the application portal URL for all ${company} jobs:`, existingPortal);
  if (portalUrl === null) return; // User cancelled

  for (const job of companyJobs) {
    await updateApplication(job.id, { portalUrl: portalUrl.trim() });
  }
  await loadApplications();
}

/**
 * Set up event listeners for card buttons
 */
function setupCardEventListeners() {
  // Handle clicks on job cards and buttons
  elements.jobList.onclick = (e) => {
    const saveBtn = e.target.closest('.btn-save-inline');
    const cancelBtn = e.target.closest('.btn-cancel-inline');
    const editBtn = e.target.closest('.btn-edit-inline');
    const detailsBtn = e.target.closest('.btn-details');
    const setPortalBtn = e.target.closest('.btn-set-portal');
    const companyHeader = e.target.closest('.company-group-header');
    const card = e.target.closest('.job-card');

    if (saveBtn) {
      e.stopPropagation();
      saveInlineEdit(saveBtn.dataset.jobId);
    } else if (cancelBtn) {
      e.stopPropagation();
      cancelInlineEdit();
    } else if (editBtn) {
      e.stopPropagation();
      startInlineEdit(editBtn.dataset.jobId);
    } else if (detailsBtn) {
      e.stopPropagation();
      openJobModal(detailsBtn.dataset.jobId);
    } else if (setPortalBtn) {
      e.stopPropagation();
      setCompanyPortal(setPortalBtn.dataset.company);
    } else if (e.target.closest('.btn-set-website')) {
      e.stopPropagation();
      setCompanyWebsite(e.target.closest('.btn-set-website').dataset.company);
    } else if (companyHeader && !e.target.closest('.btn-inline')) {
      // Toggle company group when clicking header (but not buttons)
      const companyGroup = companyHeader.closest('.company-group');
      if (companyGroup) {
        toggleCompanyGroup(companyGroup.dataset.company);
      }
    } else if (card && !editingCardId) {
      // Only open modal on card click if not editing
      openJobModal(card.dataset.jobId);
    } else {
      // Handle thumbnail card clicks
      const thumbnailCard = e.target.closest('.thumbnail-card');
      const logoLink = e.target.closest('.thumbnail-logo-link');

      // Don't open modal if clicking the logo link
      if (logoLink) {
        return; // Let the link handle the click naturally
      }

      if (thumbnailCard && !e.target.closest('.btn-inline')) {
        openJobModal(thumbnailCard.dataset.jobId);
      }
    }
  };

  // Handle Enter/Escape in inline edit inputs
  elements.jobList.onkeydown = (e) => {
    if (!editingCardId) return;

    if (e.key === 'Enter' && e.target.classList.contains('inline-edit-input')) {
      e.preventDefault();
      saveInlineEdit(editingCardId);
    } else if (e.key === 'Escape') {
      cancelInlineEdit();
    }
  };
}

/**
 * Open job detail modal
 */
function openJobModal(jobId) {
  selectedJobId = jobId;
  const job = allApplications.find(j => j.id === jobId);
  if (!job) return;
  
  // Populate form
  elements.modalTitle.textContent = job.title;
  elements.editTitle.value = job.title;
  elements.editCompany.value = job.company;
  elements.editLocation.value = job.location || '';
  elements.editSalary.value = job.salary || '';
  elements.editStatus.value = job.status;
  elements.editTags.value = job.tags?.join(', ') || '';
  elements.editNotes.value = job.notes || '';
  elements.editUrl.href = job.url;
  elements.editUrl.textContent = job.url;
  elements.editCompanyUrl.value = job.companyUrl || '';
  elements.editPortalUrl.value = job.portalUrl || '';

  // Show/hide company link based on whether it exists
  if (job.companyUrl) {
    elements.editCompanyLink.href = job.companyUrl;
    elements.companyLinkRow.classList.remove('hidden');
  } else {
    elements.companyLinkRow.classList.add('hidden');
  }

  // Show/hide portal link based on whether it exists
  if (job.portalUrl) {
    elements.editPortalLink.href = job.portalUrl;
    elements.portalLinkRow.classList.remove('hidden');
  } else {
    elements.portalLinkRow.classList.add('hidden');
  }

  // Set interest rating
  setInterestRating(job.interest || 0);

  elements.editDateAdded.textContent = new Date(job.dateAdded).toLocaleString();

  renderLinkedConnectionsInJobModal(jobId);

  elements.modal.classList.remove('hidden');
}

/**
 * Close modal
 */
function closeModal() {
  elements.modal.classList.add('hidden');
  selectedJobId = null;
}

/**
 * Handle save edit
 */
async function handleSaveEdit(e) {
  e.preventDefault();
  if (!selectedJobId) return;
  
  const updates = {
    title: elements.editTitle.value.trim(),
    company: elements.editCompany.value.trim(),
    location: elements.editLocation.value.trim(),
    salary: elements.editSalary.value.trim(),
    companyUrl: elements.editCompanyUrl.value.trim(),
    portalUrl: elements.editPortalUrl.value.trim(),
    status: elements.editStatus.value,
    interest: currentInterest,
    notes: elements.editNotes.value.trim(),
    tags: elements.editTags.value
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)
  };
  
  await updateApplication(selectedJobId, updates);
  closeModal();
  await loadApplications();
}

/**
 * Handle delete
 */
async function handleDelete() {
  if (!selectedJobId) return;
  
  const job = allApplications.find(j => j.id === selectedJobId);
  if (!confirm(`Are you sure you want to delete "${job.title}" at ${job.company}?`)) {
    return;
  }
  
  await deleteApplication(selectedJobId);
  closeModal();
  await loadApplications();
}

/**
 * Handle export
 */
async function handleExport() {
  const data = await exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `job-applications-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Status icons as SVG
 */
const STATUS_ICONS = {
  saved: '<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
  applied: '<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>',
  interviewing: '<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
  offer: '<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
  rejected: '<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
  withdrawn: '<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>'
};

/**
 * Helper: Format status with icon
 */
function formatStatus(status) {
  const statusLabels = {
    saved: 'Saved',
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
  };
  const icon = STATUS_ICONS[status] || '';
  return `${icon}<span>${statusLabels[status] || status}</span>`;
}

/**
 * Helper: Format date
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();

  // Compare dates by resetting time to midnight for accurate day comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((nowOnly - dateOnly) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Helper: Escape HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Section Switching =====

function switchSection(section) {
  currentSection = section;
  const jobsContent = document.getElementById('jobsHeader');
  const jobList = elements.jobList;
  const emptyState = elements.emptyState;
  const noResults = elements.noResults;

  if (section === 'connections') {
    // Hide jobs UI
    jobsContent.classList.add('hidden');
    jobList.classList.add('hidden');
    emptyState.classList.add('hidden');
    noResults.classList.add('hidden');
    elements.jobFilters.classList.add('hidden');
    elements.connectionFilters.classList.remove('hidden');
    // Show connections
    elements.connectionsSection.classList.remove('hidden');
    renderConnections();
  } else {
    // Show jobs UI
    jobsContent.classList.remove('hidden');
    elements.jobFilters.classList.remove('hidden');
    elements.connectionFilters.classList.add('hidden');
    // Hide connections
    elements.connectionsSection.classList.add('hidden');
    renderJobs();
  }
}

// ===== Connection Rendering =====

function getFilteredConnections() {
  let filtered = [...allConnections];

  if (connectionFilter !== 'all') {
    filtered = filtered.filter(c => c.relationship === connectionFilter);
  }

  if (connectionSearch) {
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(connectionSearch) ||
      c.company.toLowerCase().includes(connectionSearch) ||
      c.role.toLowerCase().includes(connectionSearch) ||
      c.email.toLowerCase().includes(connectionSearch) ||
      c.tags?.some(tag => tag.includes(connectionSearch))
    );
  }

  const [sortField, sortDir] = connectionSort.split('-');
  filtered.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'dateAdded' || sortField === 'lastContactedDate') {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
    } else {
      valA = (valA || '').toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    return sortDir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  return filtered;
}

function renderConnections() {
  const filtered = getFilteredConnections();

  if (allConnections.length === 0) {
    elements.connectionList.classList.add('hidden');
    elements.connectionsEmpty.classList.remove('hidden');
    elements.connectionsNoResults.classList.add('hidden');
    return;
  }

  if (filtered.length === 0) {
    elements.connectionList.classList.add('hidden');
    elements.connectionsEmpty.classList.add('hidden');
    elements.connectionsNoResults.classList.remove('hidden');
    return;
  }

  elements.connectionList.classList.remove('hidden');
  elements.connectionsEmpty.classList.add('hidden');
  elements.connectionsNoResults.classList.add('hidden');

  elements.connectionList.innerHTML = filtered.map(conn => renderConnectionCard(conn)).join('');

  // Event delegation for connection cards
  elements.connectionList.onclick = (e) => {
    const card = e.target.closest('.connection-card');
    if (card) {
      openConnectionModal(card.dataset.connectionId);
    }
  };
}

const RELATIONSHIP_LABELS = {
  recruiter: 'Recruiter',
  referral: 'Referral',
  colleague: 'Colleague',
  mentor: 'Mentor',
  other: 'Other'
};

function renderConnectionCard(conn) {
  const linkedCount = conn.linkedJobIds ? conn.linkedJobIds.length : 0;
  const initials = conn.name.split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return `
    <div class="connection-card" data-connection-id="${conn.id}">
      <div class="connection-card-avatar">
        <div class="connection-initials">${initials}</div>
      </div>
      <div class="connection-card-body">
        <div class="connection-card-header">
          <h3 class="connection-card-name">${escapeHtml(conn.name)}</h3>
          <span class="connection-relationship relationship-${conn.relationship}">${RELATIONSHIP_LABELS[conn.relationship] || conn.relationship}</span>
        </div>
        <div class="connection-card-meta">
          ${conn.role ? `<span>${escapeHtml(conn.role)}</span>` : ''}
          ${conn.company ? `<span>at ${escapeHtml(conn.company)}</span>` : ''}
        </div>
        <div class="connection-card-footer">
          ${conn.email ? `<span class="connection-detail">${escapeHtml(conn.email)}</span>` : ''}
          ${conn.lastContactedDate ? `<span class="connection-detail">Last contact: ${formatDate(conn.lastContactedDate)}</span>` : ''}
          ${linkedCount > 0 ? `<span class="connection-detail connection-job-count">${linkedCount} linked job${linkedCount !== 1 ? 's' : ''}</span>` : ''}
        </div>
        ${conn.tags && conn.tags.length > 0 ? `
          <div class="connection-card-tags">
            ${conn.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ===== Connection Modal =====

function openConnectionModal(connectionId) {
  selectedConnectionId = connectionId;

  if (connectionId) {
    const conn = allConnections.find(c => c.id === connectionId);
    if (!conn) return;
    elements.connectionModalTitle.textContent = conn.name;
    elements.connName.value = conn.name;
    elements.connRelationship.value = conn.relationship || 'other';
    elements.connCompany.value = conn.company || '';
    elements.connRole.value = conn.role || '';
    elements.connEmail.value = conn.email || '';
    elements.connPhone.value = conn.phone || '';
    elements.connLinkedin.value = conn.linkedinUrl || '';
    elements.connIndustry.value = conn.industry || '';
    elements.connTags.value = conn.tags?.join(', ') || '';
    elements.connLastContacted.value = conn.lastContactedDate ? conn.lastContactedDate.split('T')[0] : '';
    elements.connNotes.value = conn.notes || '';
    elements.deleteConnectionBtn.classList.remove('hidden');
    renderLinkedJobsInConnectionModal(conn.linkedJobIds || []);
  } else {
    elements.connectionModalTitle.textContent = 'Add Connection';
    elements.connName.value = '';
    elements.connRelationship.value = 'other';
    elements.connCompany.value = '';
    elements.connRole.value = '';
    elements.connEmail.value = '';
    elements.connPhone.value = '';
    elements.connLinkedin.value = '';
    elements.connIndustry.value = '';
    elements.connTags.value = '';
    elements.connLastContacted.value = '';
    elements.connNotes.value = '';
    elements.deleteConnectionBtn.classList.add('hidden');
    renderLinkedJobsInConnectionModal([]);
  }

  populateLinkJobSelect(connectionId);
  elements.connectionModal.classList.remove('hidden');
}

function closeConnectionModal() {
  elements.connectionModal.classList.add('hidden');
  selectedConnectionId = null;
}

function renderLinkedJobsInConnectionModal(jobIds) {
  if (!jobIds || jobIds.length === 0) {
    elements.connLinkedJobs.innerHTML = '<span class="meta-text">No linked jobs</span>';
    return;
  }
  elements.connLinkedJobs.innerHTML = jobIds.map(jobId => {
    const job = allApplications.find(j => j.id === jobId);
    if (!job) return '';
    return `<div class="linked-item">
      <span>${escapeHtml(job.title)} at ${escapeHtml(job.company)}</span>
      <button type="button" class="btn-unlink" data-job-id="${jobId}" onclick="unlinkJobFromConnection('${jobId}')">&times;</button>
    </div>`;
  }).join('');
}

function populateLinkJobSelect(connectionId) {
  const conn = connectionId ? allConnections.find(c => c.id === connectionId) : null;
  const linkedIds = conn?.linkedJobIds || [];
  const available = allApplications.filter(j => !linkedIds.includes(j.id));

  elements.connLinkJobSelect.innerHTML = '<option value="">-- Link a job --</option>' +
    available.map(j => `<option value="${j.id}">${escapeHtml(j.title)} - ${escapeHtml(j.company)}</option>`).join('');
}

async function linkJobToConnection() {
  const jobId = elements.connLinkJobSelect.value;
  if (!jobId || !selectedConnectionId) return;

  const conn = allConnections.find(c => c.id === selectedConnectionId);
  if (!conn) return;

  const linkedJobIds = [...(conn.linkedJobIds || []), jobId];
  await updateConnection(selectedConnectionId, { linkedJobIds });
  allConnections = await getAllConnections();

  renderLinkedJobsInConnectionModal(linkedJobIds);
  populateLinkJobSelect(selectedConnectionId);
}

function unlinkJobFromConnection(jobId) {
  if (!selectedConnectionId) return;
  const conn = allConnections.find(c => c.id === selectedConnectionId);
  if (!conn) return;

  const linkedJobIds = (conn.linkedJobIds || []).filter(id => id !== jobId);
  updateConnection(selectedConnectionId, { linkedJobIds }).then(async () => {
    allConnections = await getAllConnections();
    renderLinkedJobsInConnectionModal(linkedJobIds);
    populateLinkJobSelect(selectedConnectionId);
  });
}

async function handleSaveConnection(e) {
  e.preventDefault();

  const data = {
    name: elements.connName.value.trim(),
    relationship: elements.connRelationship.value,
    company: elements.connCompany.value.trim(),
    role: elements.connRole.value.trim(),
    email: elements.connEmail.value.trim(),
    phone: elements.connPhone.value.trim(),
    linkedinUrl: elements.connLinkedin.value.trim(),
    industry: elements.connIndustry.value.trim(),
    tags: elements.connTags.value.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0),
    lastContactedDate: elements.connLastContacted.value || '',
    notes: elements.connNotes.value.trim()
  };

  if (!data.name) {
    alert('Name is required');
    return;
  }

  if (selectedConnectionId) {
    await updateConnection(selectedConnectionId, data);
  } else {
    await saveConnection(data);
  }

  closeConnectionModal();
  allConnections = await getAllConnections();
  renderConnections();
}

async function handleDeleteConnection() {
  if (!selectedConnectionId) return;
  const conn = allConnections.find(c => c.id === selectedConnectionId);
  if (!confirm(`Delete connection "${conn.name}"?`)) return;

  await deleteConnection(selectedConnectionId);
  closeConnectionModal();
  allConnections = await getAllConnections();
  renderConnections();
}

// ===== Linked Connections in Job Modal =====

function renderLinkedConnectionsInJobModal(jobId) {
  const linked = allConnections.filter(c => c.linkedJobIds && c.linkedJobIds.includes(jobId));

  if (linked.length === 0) {
    elements.jobLinkedConnections.innerHTML = '<span class="meta-text">No linked connections</span>';
  } else {
    elements.jobLinkedConnections.innerHTML = linked.map(c =>
      `<div class="linked-item">
        <span>${escapeHtml(c.name)}${c.company ? ` (${escapeHtml(c.company)})` : ''}</span>
        <button type="button" class="btn-unlink" onclick="unlinkConnectionFromJob('${c.id}')">&times;</button>
      </div>`
    ).join('');
  }

  // Populate select with unlinked connections
  const linkedIds = linked.map(c => c.id);
  const available = allConnections.filter(c => !linkedIds.includes(c.id));
  elements.jobLinkConnectionSelect.innerHTML = '<option value="">-- Link a connection --</option>' +
    available.map(c => `<option value="${c.id}">${escapeHtml(c.name)}${c.company ? ` (${escapeHtml(c.company)})` : ''}</option>`).join('');
}

async function linkConnectionToJob() {
  const connId = elements.jobLinkConnectionSelect.value;
  if (!connId || !selectedJobId) return;

  const conn = allConnections.find(c => c.id === connId);
  if (!conn) return;

  const linkedJobIds = [...(conn.linkedJobIds || []), selectedJobId];
  await updateConnection(connId, { linkedJobIds });
  allConnections = await getAllConnections();
  renderLinkedConnectionsInJobModal(selectedJobId);
}

function unlinkConnectionFromJob(connId) {
  if (!selectedJobId) return;
  const conn = allConnections.find(c => c.id === connId);
  if (!conn) return;

  const linkedJobIds = (conn.linkedJobIds || []).filter(id => id !== selectedJobId);
  updateConnection(connId, { linkedJobIds }).then(async () => {
    allConnections = await getAllConnections();
    renderLinkedConnectionsInJobModal(selectedJobId);
  });
}

// ===== Connection count helper for job cards =====

function getConnectionCountForJob(jobId) {
  return allConnections.filter(c => c.linkedJobIds && c.linkedJobIds.includes(jobId)).length;
}

// Make functions available globally (for onclick)
window.openJobModal = openJobModal;
window.toggleCompanyGroup = toggleCompanyGroup;
window.startInlineEdit = startInlineEdit;
window.cancelInlineEdit = cancelInlineEdit;
window.saveInlineEdit = saveInlineEdit;
window.unlinkJobFromConnection = unlinkJobFromConnection;
window.unlinkConnectionFromJob = unlinkConnectionFromJob;
window.openConnectionModal = openConnectionModal;

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
