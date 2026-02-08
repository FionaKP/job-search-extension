/**
 * Glassdoor Parser
 * Extracts job details from Glassdoor job listings
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectFirst } from '../utils/selectors';
import { cleanText, truncate, cleanUrl } from '../utils/cleaners';
import { extractSalary } from '../utils/salary';
import { calculateConfidence } from '../utils/confidence';
import { getLogoWithFallback } from '../utils/logo';

export const glassdoorParser: SiteParser = {
  name: 'glassdoor',
  domains: ['glassdoor.com', 'glassdoor.co.uk', 'glassdoor.ca'],
  pathPatterns: [/\/job-listing\//, /\/Job\//],

  detect(url: string): boolean {
    return (
      (url.includes('glassdoor.com') ||
        url.includes('glassdoor.co.uk') ||
        url.includes('glassdoor.ca')) &&
      (url.includes('/job-listing/') || url.includes('/Job/'))
    );
  },

  extract(document: Document, url: string): ScrapedData {
    // Job title
    const title = selectFirst(document, [
      '[data-test="job-title"]',
      '.job-title',
      '.css-1vg6q84', // Glassdoor job title class
      'h1',
    ]);

    // Company name
    const company = selectFirst(document, [
      '[data-test="employer-name"]',
      '.css-87uc0g', // Glassdoor company name class
      '.employer-name',
      '.company-name',
    ]);

    // Company logo with Clearbit fallback
    const companyLogo = getLogoWithFallback(document, company, [
      '[data-test="employer-logo"] img',
      '.employer-logo img',
    ]);

    // Location
    const location = selectFirst(document, [
      '[data-test="job-location"]',
      '.css-56kyx5', // Glassdoor location class
      '.location',
    ]);

    // Salary - Glassdoor often shows salary estimates
    const salary = extractSalary(document, [
      '[data-test="detailSalary"]',
      '.css-1bluz6i', // Glassdoor salary class
      '.salary-estimate',
      '.css-1xe2xww',
    ]);

    // Description
    const description =
      selectText(document, '[data-test="job-description"]') ||
      selectText(document, '.jobDescriptionContent') ||
      selectText(document, '.desc');

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: cleanText(company),
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
