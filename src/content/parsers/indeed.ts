/**
 * Indeed Parser
 * Extracts job details from Indeed job postings
 *
 * Indeed uses data-testid attributes consistently which makes
 * parsing more reliable. We prioritize these over class names.
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectFirst } from '../utils/selectors';
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

export const indeedParser: SiteParser = {
  name: 'indeed',
  domains: ['indeed.com', 'indeed.co.uk', 'indeed.ca', 'indeed.de', 'indeed.fr'],
  pathPatterns: [/\/viewjob/, /\/jobs/, /\/rc\/clk/],

  detect(url: string, _document: Document): boolean {
    return /indeed\.(com|co\.uk|ca|de|fr|in|au)/.test(url);
  },

  extract(document: Document, url: string): ScrapedData {
    // Try JSON-LD first
    const jsonLd = extractFromJsonLd(document);

    // Job title - prioritize data-testid attributes
    const title = jsonLd.title || selectFirst(document, [
      // Indeed's data-testid pattern (most reliable)
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      '[data-testid="jobTitle"]',
      '[data-testid="job-title"]',
      // Class-based selectors
      '.jobsearch-JobInfoHeader-title',
      '.jobsearch-JobInfoHeader-title-container h1',
      // Common class patterns
      'h1.jobTitle',
      '.jobTitle',
      'h1.icl-u-xs-mb--xs',
      // Generic fallbacks
      'main h1',
      'h1',
    ]);

    // Company name
    const company = jsonLd.company || selectFirst(document, [
      // data-testid patterns
      '[data-testid="inlineHeader-companyName"] a',
      '[data-testid="inlineHeader-companyName"]',
      '[data-testid="company-name"] a',
      '[data-testid="company-name"]',
      // Data attributes
      '[data-company-name="true"]',
      '[data-tn-element="companyName"]',
      // Class patterns
      '.jobsearch-InlineCompanyRating-companyHeader a',
      '.jobsearch-InlineCompanyRating-companyHeader',
      '.jobsearch-CompanyInfoContainer a',
      // Generic
      'a[href*="/cmp/"]',
    ]);

    // Company logo
    const companyLogo = getLogoWithFallback(document, company, [
      '[data-testid="companyAvatar"] img',
      '.jobsearch-CompanyAvatar-image',
      'img[alt*="logo" i]',
    ]);

    // Location
    const location = jsonLd.location || selectFirst(document, [
      '[data-testid="inlineHeader-companyLocation"]',
      '[data-testid="job-location"]',
      '[data-testid="jobsearch-JobInfoHeader-companyLocation"]',
      // Class patterns
      '.jobsearch-JobInfoHeader-subtitle [class*="location"]',
      '.jobsearch-JobInfoHeader-subtitle > div:last-child',
      // Icon-based patterns
      '.icl-IconFunctional--location + span',
      // Generic
      '[class*="companyLocation"]',
    ]);

    // Salary - Indeed often shows salary prominently
    const salary = jsonLd.salary || extractSalary(document, [
      // data-testid patterns
      '[data-testid="attribute_snippet_testid"]',
      '[data-testid="jobsearch-SalaryInfoAndJobType"]',
      // ID-based
      '#salaryInfoAndJobType',
      // Class patterns
      '.jobsearch-JobMetadataHeader-item',
      '.salary-snippet-container',
      '.attribute_snippet',
      '.jobsearch-SalaryCompensationInfoContainer',
      // Generic salary patterns
      '[class*="salary"]',
      '[class*="compensation"]',
    ]);

    // Employment type (full-time, part-time, etc.)
    const jobType = selectFirst(document, [
      '[data-testid="jobsearch-JobInfoHeader-jobType"]',
      '.jobsearch-JobMetadataHeader-item:not([class*="salary"])',
    ]);

    // Description
    const description = jsonLd.description ||
      selectText(document, '[data-testid="jobDescriptionText"]') ||
      selectText(document, '#jobDescriptionText') ||
      selectText(document, '.jobsearch-jobDescriptionText') ||
      selectText(document, '.jobsearch-JobComponent-description') ||
      selectText(document, '[class*="jobDescription"]');

    // Build location with job type if available
    let locationStr = cleanText(location);
    const jobTypeStr = cleanText(jobType);
    if (jobTypeStr && locationStr && !locationStr.toLowerCase().includes(jobTypeStr.toLowerCase())) {
      locationStr = `${locationStr} · ${jobTypeStr}`;
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
      source: 'indeed',
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
