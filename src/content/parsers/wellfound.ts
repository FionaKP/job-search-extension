/**
 * Wellfound (formerly AngelList) Parser
 * Extracts job details from Wellfound startup job listings
 *
 * Note: Wellfound uses hashed CSS classes (e.g., styles_title__Ovpy8)
 * that change on rebuilds. We use data-test attributes and pattern
 * matching instead of specific hashed classes.
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectFirst, selectAttr } from '../utils/selectors';
import { cleanText, truncate, cleanUrl, extractCompanyFromUrl } from '../utils/cleaners';
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

export const wellfoundParser: SiteParser = {
  name: 'wellfound',
  domains: ['wellfound.com', 'angel.co'],
  pathPatterns: [/\/jobs\//, /\/company\/.+\/jobs/, /\/role\//],

  detect(url: string): boolean {
    return (
      (url.includes('wellfound.com') || url.includes('angel.co')) &&
      (url.includes('/jobs') || url.includes('/role/') || url.includes('/company/'))
    );
  },

  extract(document: Document, url: string): ScrapedData {
    // Try JSON-LD first
    const jsonLd = extractFromJsonLd(document);

    // Job title - data-test attributes are stable
    const title = jsonLd.title || selectFirst(document, [
      // data-test attributes (stable)
      '[data-test="JobTitle"]',
      '[data-test="job-title"]',
      '[data-testid="job-title"]',
      // Pattern matching (avoids hashed classes)
      '[class*="jobTitle" i] h1',
      '[class*="job-title" i]',
      '[class*="JobHeader"] h1',
      'h1[class*="title" i]',
      // Generic fallbacks
      'main h1',
      'article h1',
      'h1',
    ]);

    // Company name
    const company = jsonLd.company || selectFirst(document, [
      '[data-test="StartupLink"]',
      '[data-test="company-name"]',
      '[data-testid="company-name"]',
      // Pattern matching
      '[class*="StartupHeader"] a',
      '[class*="company" i] a',
      'a[href*="/company/"]',
      // Meta fallback
    ]) ||
    selectAttr(document, 'meta[property="og:site_name"]', 'content') ||
    extractCompanyFromUrl(url);

    // Company logo
    const companyLogo = getLogoWithFallback(document, company, [
      '[data-test="StartupLogo"] img',
      '[data-testid="company-logo"] img',
      '[class*="StartupHeader"] img',
      '[class*="logo" i] img',
    ]);

    // Location
    const location = jsonLd.location || selectFirst(document, [
      '[data-test="Location"]',
      '[data-test="location"]',
      '[data-testid="location"]',
      '[class*="LocationTag"]',
      '[class*="location" i]',
    ]);

    // Salary - Wellfound often shows equity too
    const salary = extractSalary(document, [
      '[data-test="Salary"]',
      '[data-test="compensation"]',
      '[data-testid="salary"]',
      '[class*="CompensationTag"]',
      '[class*="compensation" i]',
      '[class*="salary" i]',
    ]);

    // Equity (bonus info for startups)
    const equity = selectFirst(document, [
      '[data-test="Equity"]',
      '[class*="equity" i]',
    ]);

    // Description
    const description = jsonLd.description ||
      selectText(document, '[data-test="JobDescription"]') ||
      selectText(document, '[data-testid="job-description"]') ||
      selectText(document, '[class*="jobDescription" i]') ||
      selectText(document, '[class*="JobDescription"]') ||
      selectText(document, 'article') ||
      selectText(document, 'main');

    // Combine salary and equity if both present
    let salaryStr = cleanText(salary);
    const equityStr = cleanText(equity);
    if (equityStr && salaryStr) {
      salaryStr = `${salaryStr} + ${equityStr}`;
    } else if (equityStr) {
      salaryStr = equityStr;
    }

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
      salary: salaryStr,
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url) || url,
      scrapedAt: Date.now(),
      source: 'wellfound',
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
