/**
 * Indeed Parser
 * Extracts job details from Indeed job postings
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectFirst, selectFirstAttr } from '../utils/selectors';
import { cleanText, truncate, cleanUrl } from '../utils/cleaners';
import { extractSalary } from '../utils/salary';
import { calculateConfidence } from '../utils/confidence';

export const indeedParser: SiteParser = {
  name: 'indeed',
  domains: ['indeed.com', 'indeed.co.uk', 'indeed.ca'],
  pathPatterns: [/\/viewjob/, /\/jobs/],

  detect(url: string): boolean {
    return url.includes('indeed.com') || url.includes('indeed.co.uk') || url.includes('indeed.ca');
  },

  extract(document: Document, url: string): ScrapedData {
    // Job title
    const title = selectFirst(document, [
      'h1[data-testid="jobsearch-JobInfoHeader-title"]',
      '.jobsearch-JobInfoHeader-title',
      'h1.icl-u-xs-mb--xs',
      '[data-testid="jobTitle"]',
      '.jobTitle',
      'h1',
    ]);

    // Company name
    const company = selectFirst(document, [
      '[data-testid="inlineHeader-companyName"] a',
      '[data-testid="inlineHeader-companyName"]',
      '[data-company-name="true"]',
      '.jobsearch-InlineCompanyRating-companyHeader a',
      '.jobsearch-InlineCompanyRating-companyHeader',
      '.icl-u-lg-mr--sm a',
    ]);

    // Company logo - Indeed usually has logos
    const companyLogo = selectFirstAttr(
      document,
      [
        '.jobsearch-CompanyAvatar-image',
        '[data-testid="companyAvatar"] img',
        '.company-logo img',
      ],
      'src'
    );

    // Location
    const location = selectFirst(document, [
      '[data-testid="inlineHeader-companyLocation"]',
      '[data-testid="job-location"]',
      '.jobsearch-JobInfoHeader-subtitle > div:last-child',
      '.icl-u-xs-mt--xs .icl-IconFunctional--location + span',
    ]);

    // Salary - Indeed often shows salary info
    const salary = extractSalary(document, [
      '[data-testid="attribute_snippet_testid"]',
      '.jobsearch-JobMetadataHeader-item',
      '.salary-snippet-container',
      '.attribute_snippet',
      '#salaryInfoAndJobType',
    ]);

    // Description
    const description =
      selectText(document, '#jobDescriptionText') ||
      selectText(document, '.jobsearch-jobDescriptionText') ||
      selectText(document, '[data-testid="jobDescriptionText"]');

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
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
