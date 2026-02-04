/**
 * Workday Parser
 * Extracts job details from Workday job pages
 * Note: Workday implementations vary significantly between companies
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectAttr, selectFirst } from '../utils/selectors';
import { cleanText, truncate, cleanUrl, extractCompanyFromUrl } from '../utils/cleaners';
import { extractSalary } from '../utils/salary';
import { calculateConfidence } from '../utils/confidence';

export const workdayParser: SiteParser = {
  name: 'workday',
  domains: ['myworkdayjobs.com', 'workday.com'],

  detect(url: string): boolean {
    return url.includes('myworkdayjobs.com') || url.includes('workday.com');
  },

  extract(document: Document, url: string): ScrapedData {
    // Job title - Workday uses data-automation-id attributes
    const title = selectFirst(document, [
      '[data-automation-id="jobPostingHeader"]',
      '[data-automation-id="jobPostingTitle"]',
      'h2[data-automation-id="jobPostingTitle"]',
      '.css-1q2dra3', // Common Workday class
      'h1',
      'h2',
    ]);

    // Company name
    const company =
      selectFirst(document, [
        '[data-automation-id="jobPostingCompanyName"]',
        '[data-automation-id="companyName"]',
      ]) || extractCompanyFromUrl(url);

    // Company logo
    const companyLogo =
      selectAttr(document, '[data-automation-id="companyLogo"] img', 'src') ||
      selectAttr(document, '.company-logo img', 'src') ||
      selectAttr(document, 'meta[property="og:image"]', 'content');

    // Location
    const location = selectFirst(document, [
      '[data-automation-id="locations"]',
      '[data-automation-id="jobPostingLocation"]',
      '[data-automation-id="location"]',
      '.css-129m7dg', // Common Workday location class
    ]);

    // Salary - some Workday implementations show salary
    const salary = extractSalary(document, [
      '[data-automation-id="salary"]',
      '[data-automation-id="compensation"]',
      '.salary-range',
    ]);

    // Description
    const description =
      selectText(document, '[data-automation-id="jobPostingDescription"]') ||
      selectText(document, '[data-automation-id="jobDescription"]') ||
      selectText(document, '.job-description');

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
      salary: cleanText(salary),
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url) || url,
      scrapedAt: Date.now(),
      source: 'workday',
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
