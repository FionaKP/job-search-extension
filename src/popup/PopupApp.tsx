import React, { useState, useEffect, useCallback } from 'react';
import type { ScrapedJobData, Stats, Posting } from '../types';

interface FormData {
  url: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string;
  notes: string;
  companyUrl: string;
  portalUrl: string;
}

const PRIORITY_LABELS = [
  'Not rated',
  'Low priority',
  'Medium priority',
  'High priority',
];

const STORAGE_KEY = 'postings';

// Storage helpers (inline for popup simplicity)
async function getAllPostings(): Promise<Posting[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

async function savePosting(jobData: Partial<Posting>): Promise<Posting> {
  const postings = await getAllPostings();
  const now = Date.now();
  const newJob: Posting = {
    id: `job_${now}_${Math.random().toString(36).substring(2, 9)}`,
    url: jobData.url || '',
    company: jobData.company || '',
    title: jobData.title || '',
    location: jobData.location || '',
    description: jobData.description || '',
    salary: jobData.salary,
    status: 'saved',
    priority: jobData.priority || 2,
    dateAdded: now,
    dateModified: now,
    notes: jobData.notes || '',
    tags: jobData.tags || [],
    connectionIds: [],
  };
  postings.unshift(newJob);
  await chrome.storage.local.set({ [STORAGE_KEY]: postings });
  return newJob;
}

async function updatePosting(
  id: string,
  updates: Partial<Posting>
): Promise<Posting | null> {
  const postings = await getAllPostings();
  const index = postings.findIndex((job) => job.id === id);
  if (index === -1) return null;
  postings[index] = { ...postings[index], ...updates, dateModified: Date.now() };
  await chrome.storage.local.set({ [STORAGE_KEY]: postings });
  return postings[index];
}

async function findByUrl(url: string): Promise<Posting | null> {
  const postings = await getAllPostings();
  const normalizeUrl = (u: string): string => {
    try {
      const parsed = new URL(u);
      return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
    } catch {
      return u;
    }
  };
  const normalizedUrl = normalizeUrl(url);
  return postings.find((job) => normalizeUrl(job.url) === normalizedUrl) || null;
}

export default function PopupApp() {
  const [formData, setFormData] = useState<FormData>({
    url: '',
    title: '',
    company: '',
    location: '',
    salary: '',
    tags: '',
    notes: '',
    companyUrl: '',
    portalUrl: '',
  });
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    saved: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
  });
  const [recentPostings, setRecentPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingJobId, setExistingJobId] = useState<string | null>(null);
  const [currentTabUrl, setCurrentTabUrl] = useState('');
  const [isPopout, setIsPopout] = useState(false);

  const updateStats = useCallback(async () => {
    const postings = await getAllPostings();
    const newStats: Stats = {
      total: postings.length,
      saved: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    };
    postings.forEach((job) => {
      if (job.status in newStats) {
        newStats[job.status as keyof Omit<Stats, 'total'>]++;
      }
    });
    setStats(newStats);
    // Get 3 most recent postings (already sorted by dateAdded desc from unshift)
    setRecentPostings(postings.slice(0, 3));
  }, []);

  const populateForm = useCallback((data: Partial<ScrapedJobData & Posting>) => {
    setFormData((prev) => ({
      ...prev,
      title: data.title || prev.title,
      company: data.company || prev.company,
      location: data.location || prev.location,
      salary: data.salary || prev.salary,
      notes: data.notes || prev.notes,
      tags: Array.isArray(data.tags) ? data.tags.join(', ') : prev.tags,
    }));
    if (data.priority) {
      setPriority(data.priority);
    }
  }, []);

  const scrapeCurrentPage = useCallback(
    async (tabId: number) => {
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['src/content/scraper.ts'],
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        const response = await chrome.tabs.sendMessage(tabId, { action: 'scrapeJob' });
        if (response) {
          populateForm(response);
        }
      } catch (err) {
        console.log('Scraping not available on this page:', err);
      }
    },
    [populateForm]
  );

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sourceUrl = urlParams.get('sourceUrl');
        let tabId: number | null = null;
        let url: string;

        if (sourceUrl) {
          url = sourceUrl;
          setIsPopout(true);
        } else {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          url = tab.url || '';
          tabId = tab.id || null;
        }

        setCurrentTabUrl(url);
        setFormData((prev) => ({ ...prev, url }));

        const existingJob = await findByUrl(url);
        if (existingJob) {
          setExistingJobId(existingJob.id);
          populateForm(existingJob);
        } else if (tabId) {
          await scrapeCurrentPage(tabId);
        }

        await updateStats();
      } catch (err) {
        console.error('Init error:', err);
        setError('Could not load page information');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [populateForm, scrapeCurrentPage, updateStats]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.company.trim()) {
      setError('Please enter job title and company');
      return;
    }

    try {
      const jobData = {
        url: currentTabUrl,
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        salary: formData.salary.trim(),
        notes: formData.notes.trim(),
        priority,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0),
      };

      if (existingJobId) {
        await updatePosting(existingJobId, jobData);
      } else {
        await savePosting(jobData);
      }

      setSuccess(true);
      setError(null);
      await updateStats();

      if (!isPopout) {
        setTimeout(() => window.close(), 1500);
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save application');
    }
  };

  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  };

  const openPopout = () => {
    const popoutUrl =
      chrome.runtime.getURL('src/popup/popup.html') +
      '?sourceUrl=' +
      encodeURIComponent(currentTabUrl);
    chrome.tabs.create({ url: popoutUrl });
    window.close();
  };

  const viewExistingJob = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`index.html?highlight=${existingJobId}`),
    });
  };

  const displayUrl = (() => {
    try {
      const urlObj = new URL(currentTabUrl);
      const path = urlObj.pathname.slice(0, 30);
      return urlObj.hostname + path + (urlObj.pathname.length > 30 ? '...' : '');
    } catch {
      return currentTabUrl.slice(0, 40) + '...';
    }
  })();

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="header">
        <h1>Job Tracker</h1>
        <div className="header-actions">
          {!isPopout && (
            <button
              className="btn-icon"
              title="Open in new tab (stays open while you copy/paste)"
              onClick={openPopout}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          )}
          <button className="btn-icon" title="Open Dashboard" onClick={openDashboard}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Current URL Display */}
      <div className="current-url">
        <span className="url-label">Saving from:</span>
        <span className="url-text" title={currentTabUrl}>
          {displayUrl}
        </span>
      </div>

      {/* Already Saved Notice */}
      {existingJobId && (
        <div className="notice notice-info">
          <span>This job is already saved</span>
          <button className="btn-link" onClick={viewExistingJob}>
            View in Dashboard
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div className="spinner" />
          <span>Scanning page...</span>
        </div>
      )}

      {/* Main Form */}
      {!loading && (
        <form className="job-form" onSubmit={handleSubmit}>
          <input type="hidden" name="url" value={formData.url} />

          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., Software Engineer"
              required
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company *</label>
            <input
              type="text"
              id="company"
              name="company"
              placeholder="e.g., Acme Corp"
              required
              value={formData.company}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="e.g., Remote"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                type="text"
                id="salary"
                name="salary"
                placeholder="e.g., $100k"
                value={formData.salary}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Priority Rating */}
          <div className="form-group">
            <label>Priority Level</label>
            <div className="star-rating">
              {([1, 2, 3] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`star-btn ${value <= priority ? 'active' : ''}`}
                  title={PRIORITY_LABELS[value]}
                  onClick={() => setPriority(value)}
                >
                  ★
                </button>
              ))}
              <span className="star-label">{PRIORITY_LABELS[priority]}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="e.g., remote, startup, fintech"
              value={formData.tags}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Any notes about this position..."
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {existingJobId ? 'Update Application' : 'Save Application'}
            </button>
          </div>

          <details className="additional-urls">
            <summary>Additional Links (optional)</summary>
            <div className="form-group">
              <label htmlFor="companyUrl">Company Website</label>
              <input
                type="url"
                id="companyUrl"
                name="companyUrl"
                placeholder="e.g., https://company.com"
                value={formData.companyUrl}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="portalUrl">Application Portal</label>
              <input
                type="url"
                id="portalUrl"
                name="portalUrl"
                placeholder="e.g., https://workday.company.com"
                value={formData.portalUrl}
                onChange={handleInputChange}
              />
            </div>
          </details>
        </form>
      )}

      {/* Quick Stats */}
      <div className="stats">
        <div className="stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Tracked</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.applied}</span>
          <span className="stat-label">Applied</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.interviewing}</span>
          <span className="stat-label">Interviewing</span>
        </div>
      </div>

      {/* Recent Postings */}
      {recentPostings.length > 0 && (
        <div className="recent-postings">
          <div className="recent-header">Recent ({recentPostings.length})</div>
          <ul className="recent-list">
            {recentPostings.map((posting) => (
              <li
                key={posting.id}
                className="recent-item"
                onClick={() => {
                  chrome.tabs.create({
                    url: chrome.runtime.getURL(`index.html?highlight=${posting.id}`),
                  });
                }}
              >
                <span className="recent-title">{posting.title}</span>
                <span className="recent-company">@ {posting.company}</span>
                <span className="recent-priority">
                  {'★'.repeat(posting.priority)}{'☆'.repeat(3 - posting.priority)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {success && <div className="notice notice-success">Job saved successfully!</div>}

      {/* Error Message */}
      {error && (
        <div className="notice notice-error">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
