/**
 * LinkedIn Parser
 * Extracts job details from LinkedIn job postings
 *
 * LinkedIn frequently updates their UI. This parser uses multiple selector
 * strategies to handle different layouts and versions.
 *
 * Known layouts:
 * - job-details-jobs-unified-top-card (2024-2025)
 * - jobs-unified-top-card (older)
 * - topcard (legacy/mobile)
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectFirst } from '../utils/selectors';
import { cleanText, truncate, cleanUrl } from '../utils/cleaners';
import { extractSalary } from '../utils/salary';
import { calculateConfidence } from '../utils/confidence';
import { getLogoWithFallback } from '../utils/logo';

/**
 * Extract from JSON-LD (LinkedIn sometimes includes this)
 */
function extractFromJsonLd(doc: Document): Partial<{
  title: string;
  company: string;
  location: string;
  description: string;
}> {
  try {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'JobPosting') {
          return {
            title: data.title,
            company: data.hiringOrganization?.name,
            location: data.jobLocation?.address?.addressLocality,
            description: data.description,
          };
        }
      } catch { /* invalid JSON */ }
    }
  } catch { /* error */ }
  return {};
}

export const linkedinParser: SiteParser = {
  name: 'linkedin',
  domains: ['linkedin.com'],
  pathPatterns: [/\/jobs\/view\//, /\/jobs\/collections\//, /\/jobs\/search\//],

  detect(url: string, _document: Document): boolean {
    return url.includes('linkedin.com/jobs');
  },

  extract(document: Document, url: string): ScrapedData {
    // Try JSON-LD first
    const jsonLd = extractFromJsonLd(document);

    // Job title - multiple layout patterns
    const title = jsonLd.title || selectFirst(document, [
      // 2025+ unified layout
      '.job-details-jobs-unified-top-card__job-title h1',
      '.job-details-jobs-unified-top-card__job-title a',
      '.job-details-jobs-unified-top-card__job-title',
      // Unified top card variants
      '.jobs-unified-top-card__job-title h1',
      '.jobs-unified-top-card__job-title a',
      '.jobs-unified-top-card__job-title',
      // Data attribute patterns
      '[data-test-job-title]',
      '[data-tracking-control-name="public_jobs_topcard-title"]',
      // Legacy/other layouts
      '.topcard__title',
      '.top-card-layout__title',
      // Aria patterns
      'h1[class*="job"]',
      'h1[class*="title"]',
      // Generic fallback
      'h1.t-24',
      'main h1',
      'h1',
    ]);

    // Company name
    const company = jsonLd.company || selectFirst(document, [
      // 2025+ layout - company is often a link
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.job-details-jobs-unified-top-card__primary-description-without-actions a',
      // Unified top card
      '.jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name',
      // Data attributes
      '[data-test-company-name]',
      '[data-tracking-control-name="public_jobs_topcard-org-name"]',
      // Legacy layouts
      '.topcard__org-name-link',
      '.top-card-layout__card a[data-tracking-control-name*="company"]',
      // Subtitles that contain company
      '.jobs-unified-top-card__subtitle-primary-grouping a',
      // Generic company patterns
      'a[href*="/company/"]',
    ]);

    // Company logo
    const companyLogo = getLogoWithFallback(document, company, [
      '.job-details-jobs-unified-top-card__company-logo img',
      '.jobs-unified-top-card__company-logo img',
      '.artdeco-entity-image[data-entity-type="COMPANY"]',
      '.topcard__org-photo img',
      'img[alt*="logo" i]',
    ]);

    // Location - handle remote/hybrid designations
    const location = jsonLd.location || selectFirst(document, [
      // Primary location in metadata
      '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
      '.job-details-jobs-unified-top-card__primary-description-without-actions .tvm__text',
      '.job-details-jobs-unified-top-card__workplace-type',
      // Bullet-style location
      '.jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__workplace-type',
      // Data attributes
      '[data-test-job-location]',
      // Legacy
      '.topcard__flavor--bullet',
      '.top-card-layout__bullet',
      // Look for location-related text
      '[class*="location"]',
    ]);

    // Salary - LinkedIn shows in insights section
    const salary = extractSalary(document, [
      // Compensation insights
      '.job-details-jobs-unified-top-card__job-insight',
      '.jobs-unified-top-card__job-insight',
      '[class*="compensation"]',
      '[class*="salary"]',
      // Specific salary containers
      '.salary-main-rail__data-body',
      '[data-test-compensation]',
      // Job details section
      '.jobs-description__salary-compensation',
    ]);

    // Description - main job details
    const description = jsonLd.description ||
      selectText(document, '.jobs-description__content') ||
      selectText(document, '.jobs-description-content') ||
      selectText(document, '#job-details') ||
      selectText(document, '.description__text') ||
      selectText(document, '.jobs-box__html-content') ||
      selectText(document, '[class*="job-description"]') ||
      selectText(document, 'article[class*="jobs"]');

    // Also try to get employment type info
    const employmentType = selectFirst(document, [
      '.job-details-jobs-unified-top-card__job-insight--highlight',
      '[class*="employment-type"]',
    ]);

    // Build location with employment type if available
    let locationStr = cleanText(location);
    if (employmentType && locationStr && !locationStr.includes(cleanText(employmentType) || '')) {
      locationStr = `${locationStr} · ${cleanText(employmentType)}`;
    }

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: locationStr,
      salary: cleanText(salary),
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url) || url,
      scrapedAt: Date.now(),
      source: 'linkedin',
      confidence: 0,
    };

    extractedData.confidence = calculateConfidence({
      title: extractedData.title,
      company: extractedData.company,
      description: extractedData.description,
      location: extractedData.location,
      salary: extractedData.salary,
    });

    return extractedData;
  },
};
