/**
 * LinkedIn Parser
 * Extracts job details from LinkedIn job postings
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectFirst } from '../utils/selectors';
import { cleanText, truncate, cleanUrl } from '../utils/cleaners';
import { extractSalary } from '../utils/salary';
import { calculateConfidence } from '../utils/confidence';
import { getLogoWithFallback } from '../utils/logo';

export const linkedinParser: SiteParser = {
  name: 'linkedin',
  domains: ['linkedin.com'],
  pathPatterns: [/\/jobs\/view\//, /\/jobs\/collections\//, /\/jobs\/search\//],

  detect(url: string): boolean {
    return url.includes('linkedin.com/jobs');
  },

  extract(document: Document, url: string): ScrapedData {
    // LinkedIn has multiple layouts - try each pattern
    // New layout (2024+)
    const title =
      selectFirst(document, [
        '.job-details-jobs-unified-top-card__job-title h1',
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-unified-top-card__job-title',
        '[data-test-job-title]',
        '.topcard__title',
        'h1.t-24',
        'h1',
      ]);

    const company =
      selectFirst(document, [
        '.job-details-jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name',
        '.jobs-unified-top-card__company-name a',
        '.jobs-unified-top-card__company-name',
        '[data-test-company-name]',
        '.topcard__org-name-link',
        '.company-name',
      ]);

    // Company logo with Clearbit fallback
    const companyLogo = getLogoWithFallback(document, company, [
      '.job-details-jobs-unified-top-card__company-logo img',
      '.jobs-unified-top-card__company-logo img',
      '.company-logo img',
      '.topcard__org-photo img',
    ]);

    // Location - often includes "Remote" designation
    const location =
      selectFirst(document, [
        '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
        '.jobs-unified-top-card__bullet',
        '.job-details-jobs-unified-top-card__primary-description-without-actions .tvm__text',
        '[data-test-job-location]',
        '.topcard__flavor--bullet',
      ]);

    // Salary - LinkedIn sometimes shows this in insights
    const salary = extractSalary(document, [
      '.job-details-jobs-unified-top-card__job-insight',
      '.jobs-unified-top-card__job-insight',
      '.salary-main-rail__data-body',
      '[data-test-compensation]',
      '.compensation__salary',
    ]);

    // Description
    const description =
      selectText(document, '.jobs-description__content') ||
      selectText(document, '#job-details') ||
      selectText(document, '.description__text') ||
      selectText(document, '.jobs-box__html-content');

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
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
