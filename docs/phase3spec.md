# Phase 3 Specification: Scraper Robustness
## JobFlow Chrome Extension

**Goal:** Make job capture reliable across major job boards with graceful fallbacks and user correction flow.

**Timeline:** 2-3 weeks (solo developer)

**Predecessor:** Phase 2 complete (drag-drop, export/import, keyboard shortcuts)

---

## Implementation Status

| Section | Task | Status |
|---------|------|--------|
| 4.1 | Architecture Setup (S1.1-S1.6) | ✅ Complete |
| 4.2 | Site-Specific Parsers (S2.1-S2.8) | ✅ Complete |
| 4.3 | Logo Extraction (S3.1-S3.4) | ✅ Complete |
| 4.4 | Preview Modal (S4.1-S4.7) | ✅ Complete (integrated into PopupApp) |
| 4.5 | Manual Entry (S5.1-S5.4) | ✅ Complete |
| 4.6 | Popup Integration (S6.1-S6.5) | ✅ Complete |
| 4.7 | Testing & Polish (S7.1-S7.5) | 🔄 In Progress |

### Files Created/Modified

```
src/content/
├── scraper.ts           # Updated - uses modular parser system
├── parsers/
│   ├── index.ts         # Parser registry and exports
│   ├── types.ts         # SiteParser and ScrapedData interfaces
│   ├── linkedin.ts      # LinkedIn parser
│   ├── indeed.ts        # Indeed parser
│   ├── greenhouse.ts    # Greenhouse parser
│   ├── lever.ts         # Lever parser
│   ├── workday.ts       # Workday parser
│   ├── glassdoor.ts     # Glassdoor parser
│   ├── wellfound.ts     # Wellfound parser
│   └── generic.ts       # Enhanced fallback parser (6 strategies)
└── utils/
    ├── index.ts         # Utility exports
    ├── selectors.ts     # DOM selection helpers
    ├── cleaners.ts      # Text cleaning utilities
    ├── salary.ts        # Salary extraction patterns
    ├── confidence.ts    # Confidence scoring
    └── logo.ts          # Logo extraction

src/popup/
├── PopupApp.tsx         # Updated - manual mode, confidence display
└── popup.css            # Updated - new styles for notices, tags

src/components/popup/
├── index.ts             # Component exports
└── SavePreviewModal.tsx # Standalone modal (for future dashboard use)
```

---

## 1. Scope Summary

### In Scope
- Site-specific parsers for top 10 job boards
- Improved generic/fallback parser
- Pre-save preview modal with editable fields
- Manual entry option when scraping fails
- Company logo extraction
- Salary detection improvements
- Scraper debugging/testing tools

### Out of Scope (Later Phases)
- Connections integration (Phase 4)
- Keyword analysis from job descriptions (Phase 5)
- Visual design polish (Phase 6)

---

## 2. Supported Job Sites

### 2.1 Priority Tier (Must Work Well)

| Site | Domain Pattern | Notes |
|------|----------------|-------|
| LinkedIn | `linkedin.com/jobs` | Most common, complex DOM |
| Indeed | `indeed.com` | High volume |
| Greenhouse | `boards.greenhouse.io`, `*.greenhouse.io` | Common for tech |
| Lever | `jobs.lever.co` | Common for startups |
| Workday | `*.myworkdayjobs.com` | Enterprise companies |

### 2.2 Secondary Tier (Should Work)

| Site | Domain Pattern | Notes |
|------|----------------|-------|
| Glassdoor | `glassdoor.com/job-listing` | Job listings |
| AngelList/Wellfound | `wellfound.com/jobs` | Startup jobs |
| ZipRecruiter | `ziprecruiter.com/jobs` | Aggregator |
| SimplyHired | `simplyhired.com` | Aggregator |
| Company Career Pages | `*/careers/*`, `*/jobs/*` | Generic patterns |

### 2.3 Fallback (Best Effort)

Any page not matching known patterns:
- Try generic selectors
- Fall back to page title + URL
- Always allow manual entry

---

## 3. Feature Specifications

### 3.1 Scraper Architecture

**Current (V1):**
```
popup.js → sends message → scraper.js (content script) → returns data
```

**Target (V3):**
```
PopupApp.tsx 
  → sends message 
  → scraper.ts (content script)
      → detectSite()
      → getSiteParser(site)
      → parser.extract()
      → validateAndClean()
  → returns ScrapedData
  → PreviewModal (user can edit)
  → save to storage
```

**File Structure:**
```
src/content/
├── scraper.ts           # Main entry, message handling
├── detector.ts          # Site detection logic
├── parsers/
│   ├── index.ts         # Parser registry
│   ├── types.ts         # Parser interfaces
│   ├── linkedin.ts
│   ├── indeed.ts
│   ├── greenhouse.ts
│   ├── lever.ts
│   ├── workday.ts
│   ├── glassdoor.ts
│   ├── wellfound.ts
│   └── generic.ts       # Fallback parser
└── utils/
    ├── selectors.ts     # Common selector helpers
    ├── cleaners.ts      # Text cleaning utilities
    └── logo.ts          # Logo extraction
```

### 3.2 Parser Interface

```typescript
// src/content/parsers/types.ts

interface ScrapedData {
  title: string | null;
  company: string | null;
  companyLogo: string | null;
  location: string | null;
  salary: string | null;
  description: string | null;
  url: string;
  scrapedAt: number;
  source: string;           // e.g., 'linkedin', 'greenhouse', 'generic'
  confidence: number;       // 0-1, how reliable the scrape was
  rawData?: Record<string, unknown>;  // For debugging
}

interface SiteParser {
  name: string;
  domains: string[];        // Matching domain patterns
  pathPatterns?: RegExp[];  // Optional path patterns
  
  detect(url: string, document: Document): boolean;
  extract(document: Document, url: string): ScrapedData;
}

// Parser registry
const parsers: SiteParser[] = [
  linkedinParser,
  indeedParser,
  greenhouseParser,
  leverParser,
  workdayParser,
  glassdoorParser,
  wellfoundParser,
  genericParser,  // Always last (fallback)
];

function getParser(url: string, document: Document): SiteParser {
  return parsers.find(p => p.detect(url, document)) || genericParser;
}
```

### 3.3 Site-Specific Parsers

#### LinkedIn Parser
```typescript
// src/content/parsers/linkedin.ts

export const linkedinParser: SiteParser = {
  name: 'linkedin',
  domains: ['linkedin.com'],
  pathPatterns: [/\/jobs\/view\//, /\/jobs\/collections\//],

  detect(url: string): boolean {
    return url.includes('linkedin.com/jobs');
  },

  extract(document: Document, url: string): ScrapedData {
    // LinkedIn has multiple layouts - try each
    const title = 
      selectText(document, 'h1.job-title') ||
      selectText(document, '.jobs-unified-top-card__job-title') ||
      selectText(document, '[data-test-job-title]') ||
      selectText(document, 'h1');

    const company =
      selectText(document, '.jobs-unified-top-card__company-name') ||
      selectText(document, '[data-test-company-name]') ||
      selectText(document, '.company-name');

    const companyLogo =
      selectAttr(document, '.jobs-unified-top-card__company-logo img', 'src') ||
      selectAttr(document, '.company-logo img', 'src');

    const location =
      selectText(document, '.jobs-unified-top-card__bullet') ||
      selectText(document, '[data-test-job-location]');

    const salary = extractSalary(document, [
      '.jobs-unified-top-card__job-insight',
      '.salary-main-rail__data-body',
      '[data-test-compensation]',
    ]);

    const description =
      selectText(document, '.jobs-description__content') ||
      selectText(document, '#job-details') ||
      selectText(document, '.description__text');

    return {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
      salary: cleanText(salary),
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url),
      scrapedAt: Date.now(),
      source: 'linkedin',
      confidence: calculateConfidence({ title, company, description }),
    };
  },
};
```

#### Greenhouse Parser
```typescript
// src/content/parsers/greenhouse.ts

export const greenhouseParser: SiteParser = {
  name: 'greenhouse',
  domains: ['greenhouse.io', 'boards.greenhouse.io'],

  detect(url: string): boolean {
    return url.includes('greenhouse.io');
  },

  extract(document: Document, url: string): ScrapedData {
    const title =
      selectText(document, '.app-title') ||
      selectText(document, 'h1.job-title') ||
      selectText(document, 'h1');

    const company =
      selectText(document, '.company-name') ||
      selectAttr(document, 'meta[property="og:site_name"]', 'content') ||
      extractCompanyFromUrl(url);

    const companyLogo =
      selectAttr(document, '.company-logo img', 'src') ||
      selectAttr(document, 'meta[property="og:image"]', 'content');

    const location =
      selectText(document, '.location') ||
      selectText(document, '[data-test="job-location"]');

    const description =
      selectText(document, '#content') ||
      selectText(document, '.job-description');

    return {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
      salary: null,  // Greenhouse rarely shows salary
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url),
      scrapedAt: Date.now(),
      source: 'greenhouse',
      confidence: calculateConfidence({ title, company, description }),
    };
  },
};
```

#### Lever Parser
```typescript
// src/content/parsers/lever.ts

export const leverParser: SiteParser = {
  name: 'lever',
  domains: ['lever.co', 'jobs.lever.co'],

  detect(url: string): boolean {
    return url.includes('lever.co');
  },

  extract(document: Document, url: string): ScrapedData {
    const title =
      selectText(document, '.posting-headline h2') ||
      selectText(document, 'h1');

    const company =
      selectText(document, '.posting-headline .company-name') ||
      selectText(document, '.main-header-logo img', 'alt') ||
      extractCompanyFromUrl(url);

    const companyLogo =
      selectAttr(document, '.main-header-logo img', 'src');

    const location =
      selectText(document, '.posting-categories .location') ||
      selectText(document, '.posting-headline .location');

    const commitment =
      selectText(document, '.posting-categories .commitment');

    const description =
      selectText(document, '.posting-description') ||
      selectText(document, '[data-qa="job-description"]');

    return {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location) + (commitment ? ` (${commitment})` : ''),
      salary: null,
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url),
      scrapedAt: Date.now(),
      source: 'lever',
      confidence: calculateConfidence({ title, company, description }),
    };
  },
};
```

#### Generic Parser (Fallback)
```typescript
// src/content/parsers/generic.ts

export const genericParser: SiteParser = {
  name: 'generic',
  domains: ['*'],

  detect(): boolean {
    return true;  // Always matches as fallback
  },

  extract(document: Document, url: string): ScrapedData {
    // Try common patterns across sites
    const title =
      selectText(document, '[class*="job-title"]') ||
      selectText(document, '[class*="jobTitle"]') ||
      selectText(document, '[data-test*="title"]') ||
      selectText(document, 'h1') ||
      document.title.split('|')[0].split('-')[0].trim();

    const company =
      selectText(document, '[class*="company-name"]') ||
      selectText(document, '[class*="companyName"]') ||
      selectText(document, '[class*="employer"]') ||
      selectAttr(document, 'meta[property="og:site_name"]', 'content') ||
      extractCompanyFromUrl(url);

    const companyLogo =
      selectAttr(document, '[class*="company"] img', 'src') ||
      selectAttr(document, '[class*="logo"] img', 'src') ||
      selectAttr(document, 'meta[property="og:image"]', 'content');

    const location =
      selectText(document, '[class*="location"]') ||
      selectText(document, '[class*="Location"]') ||
      selectText(document, 'address');

    const salary = extractSalaryFromPage(document);

    const description =
      selectText(document, '[class*="description"]') ||
      selectText(document, '[class*="Description"]') ||
      selectText(document, 'article') ||
      selectText(document, 'main');

    return {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
      salary: cleanText(salary),
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url),
      scrapedAt: Date.now(),
      source: 'generic',
      confidence: calculateConfidence({ title, company, description }) * 0.7,
    };
  },
};
```

### 3.4 Utility Functions

```typescript
// src/content/utils/selectors.ts

export function selectText(doc: Document, selector: string): string | null {
  const el = doc.querySelector(selector);
  return el?.textContent?.trim() || null;
}

export function selectAttr(doc: Document, selector: string, attr: string): string | null {
  const el = doc.querySelector(selector);
  return el?.getAttribute(attr) || null;
}

export function selectAll(doc: Document, selector: string): string[] {
  return Array.from(doc.querySelectorAll(selector))
    .map(el => el.textContent?.trim())
    .filter(Boolean) as string[];
}

// src/content/utils/cleaners.ts

export function cleanText(text: string | null): string | null {
  if (!text) return null;
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\n\r\t]/g, ' ')
    .trim();
}

export function truncate(text: string | null, maxLength: number): string | null {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function cleanUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    if (url.startsWith('/')) {
      return new URL(url, window.location.origin).href;
    }
    return url;
  } catch {
    return url;
  }
}

export function extractCompanyFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.includes('lever') || parts.includes('greenhouse')) {
      const pathParts = new URL(url).pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        return pathParts[0].replace(/-/g, ' ');
      }
    }
    return parts[0] === 'www' ? parts[1] : parts[0];
  } catch {
    return null;
  }
}

// src/content/utils/salary.ts

const SALARY_PATTERNS = [
  /\$[\d,]+\s*[-–]\s*\$[\d,]+/,
  /\$[\d,]+\s*(?:k|K)\s*[-–]\s*\$?[\d,]+\s*(?:k|K)?/,
  /\$[\d,]+(?:\.\d{2})?\s*(?:\/\s*(?:hr|hour|yr|year))?/,
  /[\d,]+\s*[-–]\s*[\d,]+\s*(?:USD|CAD|EUR|GBP)/,
];

export function extractSalary(doc: Document, selectors: string[]): string | null {
  for (const selector of selectors) {
    const text = selectText(doc, selector);
    if (text) {
      const salary = extractSalaryFromText(text);
      if (salary) return salary;
    }
  }
  return extractSalaryFromPage(doc);
}

export function extractSalaryFromText(text: string): string | null {
  for (const pattern of SALARY_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

export function extractSalaryFromPage(doc: Document): string | null {
  const candidates = [
    '[class*="salary"]',
    '[class*="Salary"]',
    '[class*="compensation"]',
    '[class*="Compensation"]',
    '[class*="pay"]',
  ];
  
  for (const selector of candidates) {
    const text = selectText(doc, selector);
    if (text) {
      const salary = extractSalaryFromText(text);
      if (salary) return salary;
    }
  }
  
  return null;
}

// src/content/utils/confidence.ts

export function calculateConfidence(data: Partial<ScrapedData>): number {
  let score = 0;
  let total = 0;

  total += 3;
  if (data.title && data.title.length > 3) score += 3;

  total += 2;
  if (data.company && data.company.length > 1) score += 2;

  total += 2;
  if (data.description && data.description.length > 100) score += 2;
  else if (data.description && data.description.length > 20) score += 1;

  total += 1;
  if (data.location) score += 1;

  return Math.round((score / total) * 100) / 100;
}
```

### 3.5 Pre-Save Preview Modal

**Trigger:** After scraping, before saving

**Design:**
```
┌──────────────────────────────────────────────────────────┐
│ Save Job Posting                                    [X]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Scraped from: LinkedIn (85% confidence)                 │
│                                                          │
│  Title *                                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Senior Software Engineer                           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Company *                                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Anthropic                                          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Location                                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │ San Francisco, CA (Remote)                         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Salary                                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ $180,000 - $250,000                                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Tags                                                    │
│  [remote] [startup] [+ Add tag]                          │
│                                                          │
│  Priority                                                │
│  ★★☆ Medium                                             │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│  Description Preview                              [Edit] │
│  ┌────────────────────────────────────────────────────┐  │
│  │ We're looking for a Senior Software Engineer to    │  │
│  │ join our team working on Claude...                 │  │
│  │ [truncated - click Edit to see full]               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│               [Cancel]        [Save to JobFlow]          │
└──────────────────────────────────────────────────────────┘
```

**Component Props:**
```typescript
interface SavePreviewModalProps {
  scrapedData: ScrapedData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (posting: Omit<Posting, 'id' | 'dateAdded' | 'dateModified'>) => void;
}
```

### 3.6 Manual Entry Mode

When scraping fails or user chooses manual:

```
┌──────────────────────────────────────────────────────────┐
│ Add Job Posting                                     [X]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ⚠️ Couldn't auto-detect job details.                   │
│  Please fill in the information below.                   │
│                                                          │
│  URL                                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │ https://example.com/jobs/123 (auto-filled)         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Title *                                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Company *                                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [More fields collapsed...]                              │
│                                                          │
│               [Cancel]        [Save to JobFlow]          │
└──────────────────────────────────────────────────────────┘
```

### 3.7 Scraper Testing/Debug Tools

For development:

```typescript
if (process.env.NODE_ENV === 'development') {
  (window as any).__JOBFLOW_DEBUG__ = {
    testScraper: () => {
      const parser = getParser(window.location.href, document);
      const data = parser.extract(document, window.location.href);
      console.log('Parser:', parser.name);
      console.log('Data:', data);
      return data;
    },
    listParsers: () => parsers.map(p => p.name),
  };
}
```

---

## 4. Implementation Tasks

### 4.1 Architecture Setup (Days 1-2)

- [ ] **S1.1** Create `src/content/parsers/` folder structure
- [ ] **S1.2** Define `SiteParser` interface and types
- [ ] **S1.3** Create parser registry with detection logic
- [ ] **S1.4** Create utility functions (selectors, cleaners, salary)
- [ ] **S1.5** Update main scraper.ts to use new architecture
- [ ] **S1.6** Add confidence calculation

### 4.2 Site-Specific Parsers (Days 3-7)

- [ ] **S2.1** LinkedIn parser (most complex, spend extra time)
- [ ] **S2.2** Indeed parser
- [ ] **S2.3** Greenhouse parser
- [ ] **S2.4** Lever parser
- [ ] **S2.5** Workday parser
- [ ] **S2.6** Glassdoor parser
- [ ] **S2.7** Wellfound parser
- [ ] **S2.8** Improve generic fallback parser

### 4.3 Logo Extraction (Day 8)

- [ ] **S3.1** Add logo extraction to each parser
- [ ] **S3.2** Handle relative URLs
- [ ] **S3.3** Add fallback to favicon
- [ ] **S3.4** Store logo URL in posting

### 4.4 Preview Modal (Days 9-10)

- [ ] **S4.1** Create SavePreviewModal component
- [ ] **S4.2** Pre-fill from scraped data
- [ ] **S4.3** Add field validation (required fields)
- [ ] **S4.4** Add tag management
- [ ] **S4.5** Add priority selector
- [ ] **S4.6** Add description expand/edit
- [ ] **S4.7** Show confidence and source

### 4.5 Manual Entry (Day 11)

- [ ] **S5.1** Create ManualEntryModal component
- [ ] **S5.2** Auto-fill URL from current page
- [ ] **S5.3** Add "Can't scrape? Enter manually" option
- [ ] **S5.4** Reuse form components from preview modal

### 4.6 Popup Integration (Days 12-13)

- [ ] **S6.1** Update popup to show preview modal after scrape
- [ ] **S6.2** Handle scrape failures gracefully
- [ ] **S6.3** Add loading state during scrape
- [ ] **S6.4** Add "Enter manually" button
- [ ] **S6.5** Show scrape source and confidence

### 4.7 Testing & Polish (Days 14-15)

- [ ] **S7.1** Test all parsers on real job pages
- [ ] **S7.2** Document known limitations per site
- [ ] **S7.3** Add debug tools for development
- [ ] **S7.4** Fix edge cases discovered in testing
- [ ] **S7.5** Update CLAUDE.md with parser patterns

---

## 5. Acceptance Criteria

### 5.1 Parser Coverage
- [ ] LinkedIn: Extracts title, company, location, description
- [ ] Indeed: Extracts title, company, location, salary, description
- [ ] Greenhouse: Extracts title, company, location, description
- [ ] Lever: Extracts title, company, location, description
- [ ] Workday: Extracts title, company, location, description
- [ ] Generic: Reasonable extraction from unknown sites

### 5.2 Logo Extraction
- [ ] Logos extracted from supported sites
- [ ] Fallback to company initial when no logo
- [ ] Logos display in PostingCard

### 5.3 Preview Modal
- [ ] Shows after successful scrape
- [ ] All fields editable
- [ ] Validation prevents save without title/company
- [ ] Tags and priority configurable before save
- [ ] Shows confidence score

### 5.4 Manual Entry
- [ ] Available when scrape fails
- [ ] Available as explicit option
- [ ] URL auto-filled
- [ ] Creates valid posting

### 5.5 Error Handling
- [ ] Scrape failure shows friendly message
- [ ] Offers manual entry fallback
- [ ] No crashes on malformed pages
- [ ] Timeout handling for slow pages

---

## 6. Testing Checklist

Test each parser on real job listings:

### LinkedIn
- [ ] Standard job page (`/jobs/view/`)
- [ ] Easy Apply job
- [ ] Job with salary shown

### Indeed
- [ ] Standard job page
- [ ] Sponsored listing
- [ ] Job with salary

### Greenhouse
- [ ] `boards.greenhouse.io/company/jobs/123`

### Lever
- [ ] `jobs.lever.co/company/job-id`

### Workday
- [ ] `company.myworkdayjobs.com`

### Generic
- [ ] Random company career page
- [ ] Page with minimal job info

---

## 7. Known Limitations

| Site | Limitation | Workaround |
|------|------------|------------|
| LinkedIn | Requires being logged in; some fields behind "Show more"; Multiple DOM layouts | Parser tries 3+ selector patterns for each field |
| Indeed | Sponsored listings have different structure; salary not always visible | Full page salary scan as fallback |
| Greenhouse | Company-customized layouts; salary rarely shown | Extract company from URL path; meta tag fallback |
| Lever | Commitment type (full-time/contract) in separate field | Append commitment to location field |
| Workday | Highly variable between companies; complex iframe structures | Multiple selector patterns; JSON-LD extraction |
| Glassdoor | Heavy JavaScript rendering; login walls | Meta tag fallbacks; JSON-LD structured data |
| Wellfound | Salary ranges use special formatting; dynamic content loading | Custom salary regex patterns |
| Generic | Low confidence (70% penalty); often missing fields | 6-strategy extraction: JSON-LD → meta → selectors → headings → page title → full-page salary scan |

### Parser Implementation Details

| Parser | Primary Selectors | Fallbacks | Confidence Modifier |
|--------|-------------------|-----------|---------------------|
| LinkedIn | `.jobs-unified-top-card__*`, `.jobs-description__content` | `h1`, `[data-test-*]` | 1.0 (no penalty) |
| Indeed | `.jobsearch-*`, `#jobDescriptionText` | `[data-testid="*"]`, meta tags | 1.0 |
| Greenhouse | `.app-title`, `.company-name` | `h1`, og:site_name meta, URL parsing | 1.0 |
| Lever | `.posting-headline`, `.posting-categories` | `.main-header-logo`, URL parsing | 1.0 |
| Workday | `[data-automation-id="*"]`, JSON-LD | `.css-*`, og:* meta tags | 0.9 (10% penalty) |
| Glassdoor | `[data-test="*"]`, `.e1tk4kwz*` | JSON-LD, meta tags | 1.0 |
| Wellfound | `[class*="styles_title"]`, `[class*="styles_component"]` | `h1`, company link text | 1.0 |
| Generic | 40+ CSS patterns, JSON-LD | Page title parsing, heading analysis | 0.7-0.85 |

### Generic Parser Extraction Strategies (in priority order)

1. **JSON-LD Structured Data** - Most reliable; looks for `schema.org/JobPosting`
2. **Meta Tags** - OpenGraph, Twitter Cards, standard meta
3. **CSS Selectors** - 40+ patterns for common job site classes
4. **Heading Hierarchy** - Scans h1-h3 for job title keywords
5. **Page Title Parsing** - Extracts from patterns like "Title | Company"
6. **Full-Page Salary Scan** - Regex search of first 10,000 chars

---

## 8. Definition of Done

Phase 3 is complete when:
1. All priority tier sites extract core fields
2. Preview modal allows editing before save
3. Manual entry works as fallback
4. Logo extraction works on most sites
5. Confidence score reflects extraction quality
6. Error states handled gracefully
7. Testing checklist passes