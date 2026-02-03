/**
 * Storage utilities for Job Application Tracker
 * Uses Chrome's storage.local API
 */

const STORAGE_KEY = 'jobApplications';
const CONNECTIONS_KEY = 'connections';

/**
 * Generate a unique ID for each application
 */
function generateId() {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get all saved job applications
 * @returns {Promise<Array>} Array of job applications
 */
async function getAllApplications() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
  } catch (error) {
    console.error('Error getting applications:', error);
    return [];
  }
}

/**
 * Save a new job application
 * @param {Object} jobData - The job application data
 * @returns {Promise<Object>} The saved job with generated ID
 */
async function saveApplication(jobData) {
  const applications = await getAllApplications();
  
  const newJob = {
    id: generateId(),
    url: jobData.url || '',
    portalUrl: jobData.portalUrl || '',
    companyUrl: jobData.companyUrl || '',
    company: jobData.company || '',
    title: jobData.title || '',
    location: jobData.location || '',
    description: jobData.description || '',
    salary: jobData.salary || '',
    status: 'saved',
    interest: jobData.interest || 0, // 0-5 stars, 0 = not rated
    dateAdded: new Date().toISOString(),
    dateApplied: null,
    notes: jobData.notes || '',
    tags: jobData.tags || []
  };
  
  applications.unshift(newJob); // Add to beginning of array
  
  await chrome.storage.local.set({ [STORAGE_KEY]: applications });
  return newJob;
}

/**
 * Update an existing job application
 * @param {string} id - The job ID to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object|null>} The updated job or null if not found
 */
async function updateApplication(id, updates) {
  const applications = await getAllApplications();
  const index = applications.findIndex(job => job.id === id);
  
  if (index === -1) {
    console.error('Application not found:', id);
    return null;
  }
  
  // If status is being updated to 'applied' and no dateApplied, set it
  if (updates.status === 'applied' && !applications[index].dateApplied) {
    updates.dateApplied = new Date().toISOString();
  }
  
  applications[index] = { ...applications[index], ...updates };
  
  await chrome.storage.local.set({ [STORAGE_KEY]: applications });
  return applications[index];
}

/**
 * Delete a job application
 * @param {string} id - The job ID to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteApplication(id) {
  const applications = await getAllApplications();
  const filtered = applications.filter(job => job.id !== id);
  
  if (filtered.length === applications.length) {
    return false; // Nothing was deleted
  }
  
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
  return true;
}

/**
 * Get a single application by ID
 * @param {string} id - The job ID
 * @returns {Promise<Object|null>} The job or null if not found
 */
async function getApplication(id) {
  const applications = await getAllApplications();
  return applications.find(job => job.id === id) || null;
}

/**
 * Check if a URL is already saved
 * @param {string} url - The URL to check
 * @returns {Promise<Object|null>} The existing job or null
 */
async function findByUrl(url) {
  const applications = await getAllApplications();
  // Normalize URLs for comparison (remove trailing slashes, query params, etc.)
  const normalizeUrl = (u) => {
    try {
      const parsed = new URL(u);
      return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
    } catch {
      return u;
    }
  };
  
  const normalizedUrl = normalizeUrl(url);
  return applications.find(job => normalizeUrl(job.url) === normalizedUrl) || null;
}

/**
 * Get applications filtered by status
 * @param {string} status - The status to filter by
 * @returns {Promise<Array>} Filtered array of applications
 */
async function getByStatus(status) {
  const applications = await getAllApplications();
  return applications.filter(job => job.status === status);
}

/**
 * Get application statistics
 * @returns {Promise<Object>} Stats object with counts by status
 */
async function getStats() {
  const applications = await getAllApplications();
  
  const stats = {
    total: applications.length,
    saved: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0
  };
  
  applications.forEach(job => {
    if (stats.hasOwnProperty(job.status)) {
      stats[job.status]++;
    }
  });
  
  return stats;
}

/**
 * Export all applications as JSON
 * @returns {Promise<string>} JSON string of all applications
 */
async function exportData() {
  const applications = await getAllApplications();
  return JSON.stringify(applications, null, 2);
}

/**
 * Clear all applications (use with caution!)
 * @returns {Promise<void>}
 */
async function clearAllApplications() {
  await chrome.storage.local.set({ [STORAGE_KEY]: [] });
}

// ===== Connection Storage Functions =====

function generateConnectionId() {
  return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function getAllConnections() {
  try {
    const result = await chrome.storage.local.get(CONNECTIONS_KEY);
    return result[CONNECTIONS_KEY] || [];
  } catch (error) {
    console.error('Error getting connections:', error);
    return [];
  }
}

async function saveConnection(data) {
  const connections = await getAllConnections();

  const newConnection = {
    id: generateConnectionId(),
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    linkedinUrl: data.linkedinUrl || '',
    company: data.company || '',
    role: data.role || '',
    industry: data.industry || '',
    relationship: data.relationship || 'other',
    notes: data.notes || '',
    tags: data.tags || [],
    dateAdded: new Date().toISOString(),
    lastContactedDate: data.lastContactedDate || '',
    linkedJobIds: data.linkedJobIds || []
  };

  connections.unshift(newConnection);
  await chrome.storage.local.set({ [CONNECTIONS_KEY]: connections });
  return newConnection;
}

async function updateConnection(id, updates) {
  const connections = await getAllConnections();
  const index = connections.findIndex(c => c.id === id);

  if (index === -1) {
    console.error('Connection not found:', id);
    return null;
  }

  connections[index] = { ...connections[index], ...updates };
  await chrome.storage.local.set({ [CONNECTIONS_KEY]: connections });
  return connections[index];
}

async function deleteConnection(id) {
  const connections = await getAllConnections();
  const filtered = connections.filter(c => c.id !== id);

  if (filtered.length === connections.length) return false;

  await chrome.storage.local.set({ [CONNECTIONS_KEY]: filtered });
  return true;
}

async function getConnection(id) {
  const connections = await getAllConnections();
  return connections.find(c => c.id === id) || null;
}

async function getConnectionsForJob(jobId) {
  const connections = await getAllConnections();
  return connections.filter(c => c.linkedJobIds && c.linkedJobIds.includes(jobId));
}

async function getConnectionStats() {
  const connections = await getAllConnections();
  const relationships = {};
  connections.forEach(c => {
    relationships[c.relationship] = (relationships[c.relationship] || 0) + 1;
  });
  return { total: connections.length, relationships };
}

// Export for use in other files
// Note: In content scripts, these will be available globally
// In modules, use: export { ... }
if (typeof window !== 'undefined') {
  window.JobStorage = {
    getAllApplications,
    saveApplication,
    updateApplication,
    deleteApplication,
    getApplication,
    findByUrl,
    getByStatus,
    getStats,
    exportData,
    clearAllApplications,
    getAllConnections,
    saveConnection,
    updateConnection,
    deleteConnection,
    getConnection,
    getConnectionsForJob,
    getConnectionStats
  };
}
