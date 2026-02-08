/**
 * Greenhouse Parser
 * Extracts job details from Greenhouse job boards
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectAttr, selectFirst } from '../utils/selectors';
import { cleanText, truncate, cleanUrl, extractCompanyFromUrl } from '../utils/cleaners';
import { calculateConfidence } from '../utils/confidence';
import { getLogoWithFallback } from '../utils/logo';

export const greenhouseParser: SiteParser = {
  name: 'greenhouse',
  domains: ['greenhouse.io', 'boards.greenhouse.io'],

  detect(url: string): boolean {
    return url.includes('greenhouse.io');
  },

  extract(document: Document, url: string): ScrapedData {
    // Job title
    const title = selectFirst(document, [
      '.app-title',
      'h1.job-title',
      '.posting-headline h1',
      'h1.heading',
      'h1',
    ]);

    // Company - try to extract from multiple sources
    const company =
      selectText(document, '.company-name') ||
      selectAttr(document, 'meta[property="og:site_name"]', 'content') ||
      selectAttr(document, '.company-logo img', 'alt') ||
      extractCompanyFromUrl(url);

    // Company logo with Clearbit fallback
    const companyLogo = getLogoWithFallback(document, company, [
      '.company-logo img',
      '.logo img',
    ]);

    // Location
    const location = selectFirst(document, [
      '.location',
      '.body--metadata .location',
      '[data-test="job-location"]',
      '.posting-categories .location',
    ]);

    // Greenhouse rarely shows salary, but try anyway
    const salary = selectFirst(document, ['.salary', '.compensation', '[class*="salary"]']);

    // Description
    const description =
      selectText(document, '#content') ||
      selectText(document, '.content') ||
      selectText(document, '.job-description') ||
      selectText(document, '.section-wrapper');

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: cleanText(location),
      salary: cleanText(salary),
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url) || url,
      scrapedAt: Date.now(),
      source: 'greenhouse',
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
