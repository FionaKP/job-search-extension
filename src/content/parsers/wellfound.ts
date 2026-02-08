/**
 * Wellfound (formerly AngelList) Parser
 * Extracts job details from Wellfound startup job listings
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectFirst } from '../utils/selectors';
import { cleanText, truncate, cleanUrl } from '../utils/cleaners';
import { extractSalary } from '../utils/salary';
import { calculateConfidence } from '../utils/confidence';
import { getLogoWithFallback } from '../utils/logo';

export const wellfoundParser: SiteParser = {
  name: 'wellfound',
  domains: ['wellfound.com', 'angel.co'],
  pathPatterns: [/\/jobs\//, /\/company\/.+\/jobs/],

  detect(url: string): boolean {
    return (
      (url.includes('wellfound.com') || url.includes('angel.co')) &&
      (url.includes('/jobs') || url.includes('/role/'))
    );
  },

  extract(document: Document, url: string): ScrapedData {
    // Job title
    const title = selectFirst(document, [
      '[data-test="JobTitle"]',
      '.styles_title__Ovpy8',
      'h1.job-title',
      '.styles_jobHeader__aXm_G h1',
      'h1',
    ]);

    // Company name
    const company = selectFirst(document, [
      '[data-test="StartupLink"]',
      '.styles_company__jNhMv a',
      '.styles_component__dKIYE a',
      '.company-name',
      '[class*="StartupHeader"] a',
    ]);

    // Company logo with Clearbit fallback
    const companyLogo = getLogoWithFallback(document, company, [
      '[data-test="StartupLogo"] img',
      '.styles_logo__JlBpT img',
      '[class*="StartupHeader"] img',
    ]);

    // Location
    const location = selectFirst(document, [
      '[data-test="Location"]',
      '.styles_location__2VOQX',
      '.location',
      '[class*="LocationTag"]',
    ]);

    // Salary - Wellfound often shows equity too
    const salary = extractSalary(document, [
      '[data-test="Salary"]',
      '.styles_compensation__lUBBT',
      '.compensation',
      '[class*="CompensationTag"]',
    ]);

    // Description
    const description =
      selectText(document, '[data-test="JobDescription"]') ||
      selectText(document, '.styles_description__nBQw2') ||
      selectText(document, '.job-description') ||
      selectText(document, '[class*="JobDescription"]');

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
      salary: cleanText(salary),
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
