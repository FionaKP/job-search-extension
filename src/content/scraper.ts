/**
 * Content Script: Job Page Scraper
 * TypeScript port - extracts job posting details from various job sites
 */

export {};

interface SiteConfig {
  match: RegExp;
  selectors: {
    title: string[];
    company: string[];
    location: string[];
    description: string[];
  };
}

interface ScrapedJobData {
  url: string;
  title: string;
  company: string;
  location: string;
  description: string;
  detectedSite: string;
  scrapedAt: string;
  salary?: string;
}

declare global {
  interface Window {
    __jobTrackerScraperLoaded?: boolean;
  }
}

if (typeof (window as Window).__jobTrackerScraperLoaded === 'undefined') {
  (window as Window).__jobTrackerScraperLoaded = true;

  const SITE_CONFIGS: Record<string, SiteConfig> = {
    linkedin: {
      match: /linkedin\.com\/jobs/,
      selectors: {
        title: ['.job-details-jobs-unified-top-card__job-title h1', '.jobs-unified-top-card__job-title', '.topcard__title', 'h1.t-24'],
        company: ['.job-details-jobs-unified-top-card__company-name a', '.jobs-unified-top-card__company-name a', '.topcard__org-name-link'],
        location: ['.job-details-jobs-unified-top-card__primary-description-container .tvm__text', '.jobs-unified-top-card__bullet'],
        description: ['.jobs-description__content', '.jobs-box__html-content', '.description__text'],
      },
    },
    indeed: {
      match: /indeed\.com\/viewjob|indeed\.com\/jobs/,
      selectors: {
        title: ['.jobsearch-JobInfoHeader-title', 'h1[data-testid="jobTitle"]', '.icl-u-xs-mb--xs h1'],
        company: ['[data-testid="inlineHeader-companyName"] a', '[data-company-name="true"]'],
        location: ['[data-testid="inlineHeader-companyLocation"]', '.jobsearch-JobInfoHeader-subtitle > div:last-child'],
        description: ['#jobDescriptionText', '.jobsearch-jobDescriptionText'],
      },
    },
    greenhouse: {
      match: /boards\.greenhouse\.io|.*\.greenhouse\.io/,
      selectors: {
        title: ['.app-title', 'h1.heading'],
        company: ['.company-name', '.logo img[alt]'],
        location: ['.location', '.body--metadata'],
        description: ['#content', '.content'],
      },
    },
    lever: {
      match: /jobs\.lever\.co/,
      selectors: {
        title: ['.posting-headline h2', 'h2'],
        company: ['.posting-headline .sort-by-time', '.main-header-logo img[alt]'],
        location: ['.posting-categories .location', '.sort-by-time.posting-category'],
        description: ['.posting-page [data-qa="job-description"]', '.section-wrapper.page-full-width'],
      },
    },
    workday: {
      match: /myworkdayjobs\.com|workday\.com/,
      selectors: {
        title: ['[data-automation-id="jobPostingHeader"]', 'h2[data-automation-id="jobPostingTitle"]'],
        company: ['[data-automation-id="jobPostingCompanyName"]'],
        location: ['[data-automation-id="locations"]', '[data-automation-id="jobPostingLocation"]'],
        description: ['[data-automation-id="jobPostingDescription"]'],
      },
    },
  };

  const GENERIC_SELECTORS = {
    title: ['h1', '[class*="job-title"]', '[class*="jobTitle"]', '[class*="position-title"]', 'title'],
    company: ['[class*="company-name"]', '[class*="companyName"]', '[class*="employer"]'],
    location: ['[class*="location"]', '[class*="job-location"]', '[class*="jobLocation"]'],
    description: ['[class*="job-description"]', '[class*="jobDescription"]', '[class*="description"]', 'article', 'main'],
  };

  function trySelectors(selectors: string[]): string {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          if (element instanceof HTMLImageElement && element.alt) {
            return element.alt.trim();
          }
          return element.textContent?.trim() || '';
        }
      } catch {
        // Invalid selector
      }
    }
    return '';
  }

  function detectSite(): { name: string; config: SiteConfig } | null {
    const url = window.location.href;
    for (const [siteName, config] of Object.entries(SITE_CONFIGS)) {
      if (config.match.test(url)) {
        return { name: siteName, config };
      }
    }
    return null;
  }

  function cleanText(text: string): string {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').replace(/[\n\r]+/g, ' ').trim().substring(0, 1000);
  }

  function scrapeJobDetails(): ScrapedJobData {
    const site = detectSite();
    const selectors = site ? site.config.selectors : GENERIC_SELECTORS;

    const allSelectors = {
      title: [...(selectors.title || []), ...GENERIC_SELECTORS.title],
      company: [...(selectors.company || []), ...GENERIC_SELECTORS.company],
      location: [...(selectors.location || []), ...GENERIC_SELECTORS.location],
      description: [...(selectors.description || []), ...GENERIC_SELECTORS.description],
    };

    const data: ScrapedJobData = {
      url: window.location.href,
      title: cleanText(trySelectors(allSelectors.title)),
      company: cleanText(trySelectors(allSelectors.company)),
      location: cleanText(trySelectors(allSelectors.location)),
      description: cleanText(trySelectors(allSelectors.description)),
      detectedSite: site?.name || 'generic',
      scrapedAt: new Date().toISOString(),
    };

    if (!data.title && document.title) {
      const titleParts = document.title.split(/[-|–—]/);
      if (titleParts.length > 0) data.title = titleParts[0].trim();
    }

    if (!data.company && document.title) {
      const titleParts = document.title.split(/[-|–—]/);
      if (titleParts.length > 1) data.company = titleParts[1].trim();
    }

    const salaryPatterns = [/\$[\d,]+\s*[-–to]+\s*\$[\d,]+/gi, /\$[\d,]+\s*(?:per\s+)?(?:year|yr|annually|hour|hr)/gi];
    const pageText = document.body?.innerText || '';
    for (const pattern of salaryPatterns) {
      const match = pageText.match(pattern);
      if (match) {
        data.salary = match[0];
        break;
      }
    }

    return data;
  }

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'scrapeJob') {
      const jobData = scrapeJobDetails();
      sendResponse(jobData);
    }
    return true;
  });

  console.log('Job Tracker: Content script loaded on', window.location.hostname);
}
