/**
 * Glassdoor Parser
 * Extracts job details from Glassdoor job listings
 *
 * Note: Glassdoor uses both data-test attributes and dynamic CSS classes.
 * We prioritize data-test and avoid specific hashed class names.
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectFirst, selectAttr } from '../utils/selectors';
import { cleanText, truncate, cleanUrl } from '../utils/cleaners';
import { extractSalary } from '../utils/salary';
import { calculateConfidence } from '../utils/confidence';
import { getLogoWithFallback } from '../utils/logo';

/**
 * Extract from JSON-LD
 */
function extractFromJsonLd(doc: Document): Partial<{
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
}> {
  try {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'JobPosting') {
          const result: ReturnType<typeof extractFromJsonLd> = {
            title: data.title,
            company: data.hiringOrganization?.name,
            description: data.description,
          };

          if (data.jobLocation?.address) {
            const addr = data.jobLocation.address;
            result.location = [addr.addressLocality, addr.addressRegion].filter(Boolean).join(', ');
          }

          if (data.baseSalary?.value) {
            const val = data.baseSalary.value;
            if (val.minValue && val.maxValue) {
              result.salary = `$${val.minValue.toLocaleString()} - $${val.maxValue.toLocaleString()}`;
            }
          }

          return result;
        }
      } catch { /* invalid JSON */ }
    }
  } catch { /* error */ }
  return {};
}

export const glassdoorParser: SiteParser = {
  name: 'glassdoor',
  domains: ['glassdoor.com', 'glassdoor.co.uk', 'glassdoor.ca', 'glassdoor.de'],
  pathPatterns: [/\/job-listing\//, /\/Job\//, /\/partner\/jobListing/],

  detect(url: string): boolean {
    return /glassdoor\.(com|co\.uk|ca|de|fr)/.test(url) &&
      (url.includes('/job-listing/') || url.includes('/Job/') || url.includes('/partner/'));
  },

  extract(document: Document, url: string): ScrapedData {
    // Try JSON-LD first
    const jsonLd = extractFromJsonLd(document);

    // Job title - data-test attributes are stable
    const title = jsonLd.title || selectFirst(document, [
      // data-test attributes (most reliable)
      '[data-test="job-title"]',
      '[data-test="jobTitle"]',
      '[data-testid="job-title"]',
      // Semantic patterns
      'h1[class*="title" i]',
      'h1[class*="Title"]',
      '.job-title h1',
      '.jobTitle',
      // Generic
      'main h1',
      'h1',
    ]);

    // Company name
    const company = jsonLd.company || selectFirst(document, [
      '[data-test="employer-name"]',
      '[data-test="employerName"]',
      '[data-testid="employer-name"]',
      // Patterns
      '[class*="employer-name" i]',
      '[class*="employerName"]',
      '[class*="company-name" i]',
      'a[href*="/Overview/"]',
    ]) ||
    selectAttr(document, 'meta[property="og:site_name"]', 'content');

    // Company logo
    const companyLogo = getLogoWithFallback(document, company, [
      '[data-test="employer-logo"] img',
      '[data-testid="employer-logo"] img',
      '[class*="employer-logo" i] img',
      '[class*="employerLogo"] img',
    ]);

    // Location
    const location = jsonLd.location || selectFirst(document, [
      '[data-test="job-location"]',
      '[data-test="location"]',
      '[data-testid="job-location"]',
      '[class*="job-location" i]',
      '[class*="location" i]:not([class*="relocation"])',
    ]);

    // Salary - Glassdoor often shows salary estimates prominently
    const salary = jsonLd.salary || extractSalary(document, [
      '[data-test="detailSalary"]',
      '[data-test="salary"]',
      '[data-testid="salary"]',
      '[class*="SalaryEstimate"]',
      '[class*="salary-estimate" i]',
      '[class*="compensation" i]',
    ]);

    // Rating (bonus info)
    const rating = selectFirst(document, [
      '[data-test="rating"]',
      '[class*="rating" i]',
    ]);

    // Description
    const description = jsonLd.description ||
      selectText(document, '[data-test="job-description"]') ||
      selectText(document, '[data-testid="job-description"]') ||
      selectText(document, '[class*="jobDescription" i]') ||
      selectText(document, '.jobDescriptionContent') ||
      selectText(document, 'article');

    // Enhance company with rating if available
    let companyStr = cleanText(company);
    const ratingStr = cleanText(rating);
    if (ratingStr && companyStr && !companyStr.includes(ratingStr)) {
      companyStr = `${companyStr} (${ratingStr})`;
    }

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: companyStr,
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
      salary: cleanText(salary),
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url) || url,
      scrapedAt: Date.now(),
      source: 'glassdoor',
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
