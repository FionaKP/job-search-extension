import React, { useState, useEffect, useCallback } from 'react';
import type { ScrapedData, Stats, Posting } from '../types';
import { extractKeywords } from '../services/keywords';

interface ScrapeStatus {
  source: string;
  confidence: number;
  isLoading: boolean;
  error: string | null;
}

const PRIORITY_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
};

const SUGGESTED_TAGS = ['remote', 'hybrid', 'onsite', 'startup', 'enterprise', 'contract'];
const STORAGE_KEY = 'postings';

// Storage helpers
async function getAllPostings(): Promise<Posting[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

async function savePosting(jobData: Partial<Posting>): Promise<Posting> {
  const postings = await getAllPostings();
  const now = Date.now();

  // Auto-extract keywords from description if available
  let keywords = undefined;
  let keywordsExtractedAt = undefined;
  if (jobData.description) {
    try {
      keywords = extractKeywords(jobData.description);
      keywordsExtractedAt = now;
    } catch (err) {
      console.warn('Failed to extract keywords:', err);
    }
  }

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
    keywords,
    keywordsExtractedAt,
  };
  postings.unshift(newJob);
  await chrome.storage.local.set({ [STORAGE_KEY]: postings });
  return newJob;
}

async function updatePosting(id: string, updates: Partial<Posting>): Promise<Posting | null> {
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
  // Form fields
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [showDescription, setShowDescription] = useState(false);

  // Scrape status
  const [, setScrapedData] = useState<ScrapedData | null>(null);
  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus>({
    source: '',
    confidence: 0,
    isLoading: false,
    error: null,
  });
  const [isManualMode, setIsManualMode] = useState(false);

  // UI state
  const [stats, setStats] = useState<Stats>({
    total: 0, saved: 0, applied: 0, interviewing: 0, offer: 0, rejected: 0, withdrawn: 0,
  });
  const [recentPostings, setRecentPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingJob, setExistingJob] = useState<Posting | null>(null);
  const [currentTabUrl, setCurrentTabUrl] = useState('');
  const [isPopout, setIsPopout] = useState(false);

  const updateStats = useCallback(async () => {
    const postings = await getAllPostings();
    const newStats: Stats = {
      total: postings.length, saved: 0, applied: 0, interviewing: 0, offer: 0, rejected: 0, withdrawn: 0,
    };
    postings.forEach((job) => {
      if (job.status in newStats) {
        newStats[job.status as keyof Omit<Stats, 'total'>]++;
      }
    });
    setStats(newStats);
    setRecentPostings(postings.slice(0, 3));
  }, []);

  const populateForm = useCallback((data: ScrapedData | Posting) => {
    setTitle(data.title || '');
    setCompany(data.company || '');
    setLocation(data.location || '');
    setSalary(data.salary || '');
    setDescription(data.description || '');

    if ('tags' in data && Array.isArray(data.tags)) {
      setTags(data.tags);
    }
    if ('notes' in data) {
      setNotes(data.notes || '');
    }
    if ('priority' in data) {
      setPriority(data.priority);
    }

    // Update scrape status if this is scraped data
    if ('source' in data && 'confidence' in data) {
      setScrapedData(data);
      setScrapeStatus({
        source: data.source || '',
        confidence: data.confidence || 0,
        isLoading: false,
        error: (!data.title && !data.company)
          ? 'Could not detect job details. Please fill in manually.'
          : null,
      });
    }
  }, []);

  const scrapeCurrentPage = useCallback(async (tabId: number) => {
    setScrapeStatus((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const response: ScrapedData = await chrome.tabs.sendMessage(tabId, { action: 'scrapeJob' });

      if (response) {
        populateForm(response);
      }
    } catch (err) {
      console.log('Scraping not available:', err);
      setScrapeStatus({
        source: '',
        confidence: 0,
        isLoading: false,
        error: 'This page cannot be scraped. Please fill in manually.',
      });
    }
  }, [populateForm]);

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

        const existing = await findByUrl(url);
        if (existing) {
          setExistingJob(existing);
          populateForm(existing);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!company.trim()) {
      setError('Company name is required');
      return;
    }

    setSaving(true);
    try {
      const jobData = {
        url: currentTabUrl,
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salary.trim() || undefined,
        description: description.trim(),
        notes: notes.trim(),
        priority,
        tags,
      };

      if (existingJob) {
        await updatePosting(existingJob.id, jobData);
      } else {
        await savePosting(jobData);
      }

      setSuccess(true);
      await updateStats();

      if (!isPopout) {
        setTimeout(() => window.close(), 1500);
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save application');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (normalized && !tags.includes(normalized)) {
      setTags([...tags, normalized]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const switchToManualMode = () => {
    setIsManualMode(true);
    setScrapeStatus({ source: '', confidence: 0, isLoading: false, error: null });
    // Clear form for fresh manual entry (keep URL)
    setTitle('');
    setCompany('');
    setLocation('');
    setSalary('');
    setDescription('');
    setTags([]);
    setNotes('');
    setPriority(2);
  };

  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  };

  const openPopout = () => {
    const popoutUrl = chrome.runtime.getURL('src/popup/popup.html') + '?sourceUrl=' + encodeURIComponent(currentTabUrl);
    chrome.tabs.create({ url: popoutUrl });
    window.close();
  };

  const displayUrl = (() => {
    try {
      const urlObj = new URL(currentTabUrl);
      const path = urlObj.pathname.slice(0, 25);
      return urlObj.hostname + path + (urlObj.pathname.length > 25 ? '...' : '');
    } catch {
      return currentTabUrl.slice(0, 35) + '...';
    }
  })();

  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 0.6) return 'notice-success';
    if (confidence >= 0.3) return 'notice-warning';
    return 'notice-error';
  };

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="header">
        <h1>JobFlow</h1>
        <div className="header-actions">
          {!isPopout && (
            <button className="btn-icon" title="Open in new tab" onClick={openPopout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          )}
          <button className="btn-icon" title="Open Dashboard" onClick={openDashboard}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </header>

      {/* URL Display */}
      <div className="current-url">
        <span className="url-label">From:</span>
        <span className="url-text" title={currentTabUrl}>{displayUrl}</span>
      </div>

      {/* Scrape Status / Manual Mode */}
      {scrapeStatus.isLoading && (
        <div className="notice notice-loading">
          <div className="spinner-small" />
          <span>Scanning page...</span>
        </div>
      )}
      {isManualMode && !scrapeStatus.isLoading && (
        <div className="notice notice-info">
          <span>Manual entry mode</span>
          <button
            className="btn-link"
            onClick={async () => {
              setIsManualMode(false);
              const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
              if (tab.id) {
                scrapeCurrentPage(tab.id);
              }
            }}
          >
            Try auto-detect
          </button>
        </div>
      )}
      {!isManualMode && scrapeStatus.source && !scrapeStatus.isLoading && scrapeStatus.confidence > 0 && (
        <div className={`notice ${getConfidenceClass(scrapeStatus.confidence)}`}>
          <span>
            <strong>{scrapeStatus.source}</strong> • {Math.round(scrapeStatus.confidence * 100)}% confidence
          </span>
          <button className="btn-link" onClick={switchToManualMode}>
            Edit manually
          </button>
        </div>
      )}
      {!isManualMode && scrapeStatus.error && (
        <div className="notice notice-warning">
          <span>{scrapeStatus.error}</span>
          <button className="btn-link" onClick={switchToManualMode}>
            Enter manually
          </button>
        </div>
      )}
      {/* Show manual entry prompt when no scrape data and not loading */}
      {!isManualMode && !scrapeStatus.isLoading && !scrapeStatus.source && !scrapeStatus.error && !existingJob && !loading && (
        <div className="notice notice-info">
          <span>No job detected on this page</span>
          <button className="btn-link" onClick={switchToManualMode}>
            Enter manually
          </button>
        </div>
      )}

      {/* Existing Job Notice */}
      {existingJob && (
        <div className="notice notice-info">
          <span>Already saved</span>
          <button
            className="btn-link"
            onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL(`index.html?highlight=${existingJob.id}`) })}
          >
            View
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading">
          <div className="spinner" />
          <span>Loading...</span>
        </div>
      )}

      {/* Form */}
      {!loading && (
        <form className="job-form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Software Engineer"
              className={error?.includes('title') ? 'error' : ''}
            />
          </div>

          {/* Company */}
          <div className="form-group">
            <label htmlFor="company">Company *</label>
            <input
              type="text"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Acme Corp"
              className={error?.includes('Company') ? 'error' : ''}
            />
          </div>

          {/* Location & Salary */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Remote"
              />
            </div>
            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                type="text"
                id="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g., $150k"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label>Priority</label>
            <div className="star-rating">
              {([1, 2, 3] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`star-btn ${value <= priority ? 'active' : ''}`}
                  onClick={() => setPriority(value)}
                >
                  ★
                </button>
              ))}
              <span className="star-label">{PRIORITY_LABELS[priority]}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tags-container">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="tag-remove">×</button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? 'Add tags...' : ''}
                className="tag-input"
              />
            </div>
            {tags.length === 0 && (
              <div className="suggested-tags">
                {SUGGESTED_TAGS.slice(0, 4).map((tag) => (
                  <button key={tag} type="button" onClick={() => handleAddTag(tag)} className="suggested-tag">
                    + {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description Preview */}
          {description && (
            <div className="form-group">
              <div className="description-header">
                <label>Description</label>
                <button type="button" onClick={() => setShowDescription(!showDescription)} className="btn-link">
                  {showDescription ? 'Hide' : 'Show'}
                </button>
              </div>
              {showDescription && (
                <div className="description-preview">{description}</div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Personal notes..."
            />
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : existingJob ? 'Update' : 'Save to JobFlow'}
            </button>
          </div>
        </form>
      )}

      {/* Stats */}
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
          <span className="stat-label">Interviews</span>
        </div>
      </div>

      {/* Recent */}
      {recentPostings.length > 0 && (
        <div className="recent-postings">
          <div className="recent-header">Recent</div>
          <ul className="recent-list">
            {recentPostings.map((posting) => (
              <li
                key={posting.id}
                className="recent-item"
                onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL(`index.html?highlight=${posting.id}`) })}
              >
                <span className="recent-title">{posting.title}</span>
                <span className="recent-company">@ {posting.company}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages */}
      {success && <div className="notice notice-success">Saved successfully!</div>}
      {error && <div className="notice notice-error">{error}</div>}
    </div>
  );
}
