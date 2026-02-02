/**
 * Content Script: Job Page Scraper
 * Extracts job posting details from various job sites
 */

// Guard against multiple injections
if (typeof window.__jobTrackerScraperLoaded === 'undefined') {
  window.__jobTrackerScraperLoaded = true;

/**
 * Site-specific scraping configurations
 */
const SITE_CONFIGS = {
  linkedin: {
    match: /linkedin\.com\/jobs/,
    selectors: {
      title: [
        '.job-details-jobs-unified-top-card__job-title h1',
        '.jobs-unified-top-card__job-title',
        '.topcard__title',
        'h1.t-24'
      ],
      company: [
        '.job-details-jobs-unified-top-card__company-name a',
        '.jobs-unified-top-card__company-name a',
        '.topcard__org-name-link',
        '.jobs-unified-top-card__company-name'
      ],
      location: [
        '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
        '.jobs-unified-top-card__bullet',
        '.topcard__flavor--bullet'
      ],
      description: [
        '.jobs-description__content',
        '.jobs-box__html-content',
        '.description__text'
      ]
    }
  },
  
  indeed: {
    match: /indeed\.com\/viewjob|indeed\.com\/jobs/,
    selectors: {
      title: [
        '.jobsearch-JobInfoHeader-title',
        'h1[data-testid="jobTitle"]',
        '.icl-u-xs-mb--xs h1'
      ],
      company: [
        '[data-testid="inlineHeader-companyName"] a',
        '[data-company-name="true"]',
        '.jobsearch-InlineCompanyRating-companyHeader a',
        '.icl-u-lg-mr--sm a'
      ],
      location: [
        '[data-testid="inlineHeader-companyLocation"]',
        '.jobsearch-JobInfoHeader-subtitle > div:last-child',
        '.icl-u-xs-mt--xs'
      ],
      description: [
        '#jobDescriptionText',
        '.jobsearch-jobDescriptionText'
      ]
    }
  },
  
  greenhouse: {
    match: /boards\.greenhouse\.io|.*\.greenhouse\.io/,
    selectors: {
      title: [
        '.app-title',
        'h1.heading'
      ],
      company: [
        '.company-name',
        '.logo img[alt]' // Will need special handling for alt text
      ],
      location: [
        '.location',
        '.body--metadata'
      ],
      description: [
        '#content',
        '.content'
      ]
    }
  },
  
  lever: {
    match: /jobs\.lever\.co/,
    selectors: {
      title: [
        '.posting-headline h2',
        'h2'
      ],
      company: [
        '.posting-headline .sort-by-time',
        '.main-header-logo img[alt]'
      ],
      location: [
        '.posting-categories .location',
        '.sort-by-time.posting-category'
      ],
      description: [
        '.posting-page [data-qa="job-description"]',
        '.section-wrapper.page-full-width'
      ]
    }
  },
  
  workday: {
    match: /myworkdayjobs\.com|workday\.com/,
    selectors: {
      title: [
        '[data-automation-id="jobPostingHeader"]',
        'h2[data-automation-id="jobPostingTitle"]'
      ],
      company: [
        '[data-automation-id="jobPostingCompanyName"]'
      ],
      location: [
        '[data-automation-id="locations"]',
        '[data-automation-id="jobPostingLocation"]'
      ],
      description: [
        '[data-automation-id="jobPostingDescription"]'
      ]
    }
  }
};

/**
 * Generic selectors as fallback
 */
const GENERIC_SELECTORS = {
  title: [
    'h1',
    '[class*="job-title"]',
    '[class*="jobTitle"]',
    '[class*="position-title"]',
    '[id*="job-title"]',
    'title'
  ],
  company: [
    '[class*="company-name"]',
    '[class*="companyName"]',
    '[class*="employer"]',
    '[class*="organization"]'
  ],
  location: [
    '[class*="location"]',
    '[class*="job-location"]',
    '[class*="jobLocation"]'
  ],
  description: [
    '[class*="job-description"]',
    '[class*="jobDescription"]',
    '[class*="description"]',
    '[id*="job-description"]',
    'article',
    'main'
  ]
};

/**
 * Try multiple selectors and return first match
 */
function trySelectors(selectors) {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        // Handle image alt text for company names
        if (element.tagName === 'IMG' && element.alt) {
          return element.alt.trim();
        }
        return element.textContent?.trim() || '';
      }
    } catch (e) {
      // Invalid selector, continue to next
    }
  }
  return '';
}

/**
 * Detect which job site we're on
 */
function detectSite() {
  const url = window.location.href;
  for (const [siteName, config] of Object.entries(SITE_CONFIGS)) {
    if (config.match.test(url)) {
      return { name: siteName, config };
    }
  }
  return null;
}

/**
 * Clean up extracted text
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[\n\r]+/g, ' ')  // Remove line breaks
    .trim()
    .substring(0, 1000);  // Limit length
}

/**
 * Extract job details from the current page
 */
function scrapeJobDetails() {
  const site = detectSite();
  const selectors = site ? site.config.selectors : GENERIC_SELECTORS;
  
  // Merge site-specific with generic as fallback
  const allSelectors = {
    title: [...(selectors.title || []), ...GENERIC_SELECTORS.title],
    company: [...(selectors.company || []), ...GENERIC_SELECTORS.company],
    location: [...(selectors.location || []), ...GENERIC_SELECTORS.location],
    description: [...(selectors.description || []), ...GENERIC_SELECTORS.description]
  };
  
  // Extract data
  const data = {
    url: window.location.href,
    title: cleanText(trySelectors(allSelectors.title)),
    company: cleanText(trySelectors(allSelectors.company)),
    location: cleanText(trySelectors(allSelectors.location)),
    description: cleanText(trySelectors(allSelectors.description)),
    detectedSite: site?.name || 'generic',
    scrapedAt: new Date().toISOString()
  };
  
  // Try to get title from page title if not found
  if (!data.title && document.title) {
    // Often page titles are like "Job Title - Company Name | Site"
    const titleParts = document.title.split(/[-|–—]/);
    if (titleParts.length > 0) {
      data.title = titleParts[0].trim();
    }
  }
  
  // Try to extract company from page title if not found
  if (!data.company && document.title) {
    const titleParts = document.title.split(/[-|–—]/);
    if (titleParts.length > 1) {
      data.company = titleParts[1].trim();
    }
  }
  
  // Look for salary in common patterns
  const salaryPatterns = [
    /\$[\d,]+\s*[-–to]+\s*\$[\d,]+/gi,
    /\$[\d,]+\s*(?:per\s+)?(?:year|yr|annually|hour|hr)/gi,
    /(?:salary|compensation|pay):\s*\$[\d,]+/gi
  ];
  
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

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeJob') {
    const jobData = scrapeJobDetails();
    sendResponse(jobData);
  }
  return true; // Keep channel open for async response
});

// Log that content script is loaded (for debugging)
console.log('Job Tracker: Content script loaded on', window.location.hostname);

} // End of guard block
