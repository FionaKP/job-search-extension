/**
 * Generic Parser (Fallback)
 * Uses multiple strategies to extract job data from unknown sites:
 * 1. JSON-LD structured data
 * 2. Meta tags (OpenGraph, etc.)
 * 3. Common CSS class/attribute patterns
 * 4. Heading hierarchy analysis
 * 5. Page title parsing
 * 6. Full-page salary scan
 */

import { SiteParser, ScrapedData } from './types';
import { selectAttr, selectFirst, selectAll } from '../utils/selectors';
import { cleanText, truncate, cleanUrl, extractCompanyFromUrl, cleanJobTitle } from '../utils/cleaners';
import { extractSalaryFromText } from '../utils/salary';
import { calculateConfidence } from '../utils/confidence';
import { getLogoWithFallback } from '../utils/logo';

export const genericParser: SiteParser = {
  name: 'generic',
  domains: ['*'],

  detect(): boolean {
    return true; // Always matches as fallback
  },

  extract(document: Document, url: string): ScrapedData {
    // Strategy 1: Try JSON-LD structured data first (most reliable)
    const jsonLdData = extractFromJsonLd(document);

    // Strategy 2: Try meta tags
    const metaData = extractFromMetaTags(document);

    // Strategy 3: Try common CSS selectors
    const selectorData = extractFromSelectors(document);

    // Strategy 4: Try heading hierarchy
    const headingData = extractFromHeadings(document);

    // Strategy 5: Page title fallback
    const titleData = extractFromPageTitle(document);

    // Merge all strategies (prefer in order: JSON-LD > selectors > headings > meta > title)
    const title =
      jsonLdData.title ??
      selectorData.title ??
      headingData.title ??
      metaData.title ??
      titleData.title ??
      null;

    const company =
      jsonLdData.company ??
      selectorData.company ??
      metaData.company ??
      titleData.company ??
      extractCompanyFromUrl(url);

    const location =
      jsonLdData.location ??
      selectorData.location ??
      metaData.location ??
      null;

    const description =
      jsonLdData.description ??
      selectorData.description ??
      metaData.description ??
      null;

    // Strategy 6: Full page salary scan
    const salary =
      jsonLdData.salary ??
      selectorData.salary ??
      extractSalaryFromFullPage(document);

    // Try to find logo (with Clearbit fallback)
    const companyLogo = getLogoWithFallback(document, company);

    const extractedData: ScrapedData = {
      title: cleanJobTitle(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
      salary: cleanText(salary),
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url) || url,
      scrapedAt: Date.now(),
      source: 'generic',
      confidence: 0,
    };

    // Calculate confidence with penalty for generic parsing
    // Less penalty if we found JSON-LD data (more reliable)
    const basePenalty = jsonLdData.title ? 0.85 : 0.7;
    extractedData.confidence =
      calculateConfidence({
        title: extractedData.title,
        company: extractedData.company,
        description: extractedData.description,
        location: extractedData.location,
        salary: extractedData.salary,
      }) * basePenalty;

    return extractedData;
  },
};

interface ExtractedFields {
  title: string | null;
  company: string | null;
  location: string | null;
  description: string | null;
  salary: string | null;
}

/**
 * Extract job data from JSON-LD structured data
 * Many modern career pages use schema.org JobPosting
 */
function extractFromJsonLd(doc: Document): Partial<ExtractedFields> {
  const result: ReturnType<typeof extractFromJsonLd> = {};

  try {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');

    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');

        // Handle both single objects and arrays
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          // Look for JobPosting schema
          if (item['@type'] === 'JobPosting' || item['@type']?.includes?.('JobPosting')) {
            result.title = item.title || item.name;
            result.description = item.description;

            // Company can be nested
            if (item.hiringOrganization) {
              result.company =
                typeof item.hiringOrganization === 'string'
                  ? item.hiringOrganization
                  : item.hiringOrganization.name;
            }

            // Location can be complex
            if (item.jobLocation) {
              const loc = item.jobLocation;
              if (typeof loc === 'string') {
                result.location = loc;
              } else if (loc.address) {
                const addr = loc.address;
                result.location = [addr.addressLocality, addr.addressRegion, addr.addressCountry]
                  .filter(Boolean)
                  .join(', ');
              }
            }

            // Salary
            if (item.baseSalary) {
              const sal = item.baseSalary;
              if (typeof sal === 'string') {
                result.salary = sal;
              } else if (sal.value) {
                const value = sal.value;
                if (typeof value === 'object' && value.minValue && value.maxValue) {
                  result.salary = `$${value.minValue.toLocaleString()} - $${value.maxValue.toLocaleString()}`;
                } else {
                  result.salary = `$${value.toLocaleString()}`;
                }
              }
            }

            break; // Found job posting, stop looking
          }

          // Also check for nested @graph structure
          if (item['@graph']) {
            for (const graphItem of item['@graph']) {
              if (graphItem['@type'] === 'JobPosting') {
                return extractFromJsonLd({
                  querySelectorAll: () => [{
                    textContent: JSON.stringify(graphItem)
                  }]
                } as unknown as Document);
              }
            }
          }
        }
      } catch {
        // Invalid JSON, continue to next script
      }
    }
  } catch {
    // Error accessing scripts
  }

  return result;
}

/**
 * Extract from meta tags (OpenGraph, Twitter Cards, standard meta)
 */
function extractFromMetaTags(doc: Document): Partial<ExtractedFields> {
  return {
    title:
      selectAttr(doc, 'meta[property="og:title"]', 'content') ||
      selectAttr(doc, 'meta[name="twitter:title"]', 'content') ||
      selectAttr(doc, 'meta[name="title"]', 'content'),
    company:
      selectAttr(doc, 'meta[property="og:site_name"]', 'content') ||
      selectAttr(doc, 'meta[name="author"]', 'content'),
    description:
      selectAttr(doc, 'meta[property="og:description"]', 'content') ||
      selectAttr(doc, 'meta[name="description"]', 'content') ||
      selectAttr(doc, 'meta[name="twitter:description"]', 'content'),
    location: null, // Meta tags rarely have location
  };
}

/**
 * Extract from common CSS selectors
 */
function extractFromSelectors(doc: Document): Partial<ExtractedFields> {
  // Title selectors - ordered by specificity
  const title = selectFirst(doc, [
    // Specific job-related classes
    '[class*="job-title"]',
    '[class*="jobTitle"]',
    '[class*="job_title"]',
    '[class*="position-title"]',
    '[class*="positionTitle"]',
    '[class*="posting-title"]',
    '[class*="vacancy-title"]',
    '[class*="role-title"]',
    // Data attributes
    '[data-testid*="title"]',
    '[data-automation-id*="title"]',
    '[data-qa*="title"]',
    // ID patterns
    '#job-title',
    '#jobTitle',
    '#position-title',
    // Aria labels
    '[aria-label*="job title" i]',
    // Generic heading (last resort)
    'main h1',
    'article h1',
    '.content h1',
    'h1',
  ]);

  // Company selectors
  const company = selectFirst(doc, [
    '[class*="company-name"]',
    '[class*="companyName"]',
    '[class*="company_name"]',
    '[class*="employer-name"]',
    '[class*="employerName"]',
    '[class*="organization-name"]',
    '[class*="hiring-company"]',
    '[data-testid*="company"]',
    '[data-testid*="employer"]',
    '[data-automation-id*="company"]',
    '#company-name',
    '#companyName',
    '[aria-label*="company" i]',
  ]);

  // Location selectors
  const location = selectFirst(doc, [
    '[class*="job-location"]',
    '[class*="jobLocation"]',
    '[class*="job_location"]',
    '[class*="work-location"]',
    '[class*="position-location"]',
    '[class*="location"]',
    '[data-testid*="location"]',
    '[data-automation-id*="location"]',
    '#job-location',
    '#location',
    'address',
    '[aria-label*="location" i]',
  ]);

  // Description selectors
  const description = selectFirst(doc, [
    '[class*="job-description"]',
    '[class*="jobDescription"]',
    '[class*="job_description"]',
    '[class*="position-description"]',
    '[class*="role-description"]',
    '[class*="posting-description"]',
    '[data-testid*="description"]',
    '[data-automation-id*="description"]',
    '#job-description',
    '#jobDescription',
    '[aria-label*="description" i]',
    'article',
    'main .content',
    'main',
  ]);

  // Salary selectors
  const salary = selectFirst(doc, [
    '[class*="salary"]',
    '[class*="Salary"]',
    '[class*="compensation"]',
    '[class*="Compensation"]',
    '[class*="pay-range"]',
    '[class*="payRange"]',
    '[data-testid*="salary"]',
    '[data-testid*="compensation"]',
    '#salary',
    '#compensation',
  ]);

  return { title, company, location, description, salary };
}

/**
 * Analyze heading hierarchy to find job title
 */
function extractFromHeadings(doc: Document): Partial<ExtractedFields> {
  // Get all headings in order
  const headings = selectAll(doc, 'h1, h2, h3');

  for (const heading of headings) {
    const text = heading?.trim();
    if (!text) continue;

    // Check if this looks like a job title
    // Job titles often contain certain keywords
    const jobKeywords = [
      'engineer', 'developer', 'manager', 'analyst', 'designer',
      'director', 'coordinator', 'specialist', 'consultant', 'lead',
      'senior', 'junior', 'associate', 'intern', 'head of',
      'vp', 'vice president', 'architect', 'administrator',
    ];

    const lowerText = text.toLowerCase();
    if (jobKeywords.some(kw => lowerText.includes(kw))) {
      return { title: text };
    }

    // Check if heading is inside a job-related container
    // (would need DOM traversal, keeping simple for now)
  }

  return {};
}

/**
 * Extract from page title
 */
function extractFromPageTitle(doc: Document): Partial<ExtractedFields> {
  const pageTitle = doc.title;
  if (!pageTitle) return {};

  // Common patterns:
  // "Job Title | Company Name"
  // "Job Title - Company Name"
  // "Job Title at Company Name"
  // "Company Name: Job Title"

  // Try "at" pattern first
  const atMatch = pageTitle.match(/^(.+?)\s+at\s+(.+?)(?:\s*[-|]|$)/i);
  if (atMatch) {
    return {
      title: atMatch[1].trim(),
      company: atMatch[2].trim(),
    };
  }

  // Try colon pattern (company first)
  const colonMatch = pageTitle.match(/^([^:]+):\s*(.+?)(?:\s*[-|]|$)/);
  if (colonMatch && colonMatch[2].length > 5) {
    return {
      title: colonMatch[2].trim(),
      company: colonMatch[1].trim(),
    };
  }

  // Try separator pattern
  const parts = pageTitle.split(/\s*[-|–—]\s*/);
  if (parts.length >= 2) {
    // First part is usually the title
    const potentialTitle = parts[0].trim();
    const potentialCompany = parts[1].trim();

    // Validate they look reasonable
    if (potentialTitle.length > 3 && potentialTitle.length < 100) {
      return {
        title: potentialTitle,
        company: potentialCompany.length > 1 && potentialCompany.length < 50
          ? potentialCompany
          : null,
      };
    }
  }

  return {};
}

/**
 * Scan full page text for salary patterns (last resort)
 */
function extractSalaryFromFullPage(doc: Document): string | null {
  try {
    // Get visible text content
    const bodyText = doc.body?.innerText || '';

    // Look for salary in the first portion of the page (more likely to be relevant)
    const searchText = bodyText.substring(0, 10000);

    return extractSalaryFromText(searchText);
  } catch {
    return null;
  }
}
