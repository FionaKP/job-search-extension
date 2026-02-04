/**
 * Lever Parser
 * Extracts job details from Lever job pages
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectAttr, selectFirst } from '../utils/selectors';
import { cleanText, truncate, cleanUrl, extractCompanyFromUrl } from '../utils/cleaners';
import { calculateConfidence } from '../utils/confidence';

export const leverParser: SiteParser = {
  name: 'lever',
  domains: ['lever.co', 'jobs.lever.co'],

  detect(url: string): boolean {
    return url.includes('lever.co');
  },

  extract(document: Document, url: string): ScrapedData {
    // Job title
    const title = selectFirst(document, [
      '.posting-headline h2',
      '.posting-headline .posting-title',
      'h2',
      'h1',
    ]);

    // Company name - often in the logo or header
    const company =
      selectAttr(document, '.main-header-logo img', 'alt') ||
      selectText(document, '.posting-headline .company-name') ||
      extractCompanyFromUrl(url);

    // Company logo
    const companyLogo = selectAttr(document, '.main-header-logo img', 'src');

    // Location - Lever often has location in categories
    const location = selectFirst(document, [
      '.posting-categories .location',
      '.posting-headline .location',
      '.sort-by-time.posting-category.location',
      '[data-qa="posting-location"]',
    ]);

    // Commitment type (full-time, etc.) - useful context
    const commitment = selectFirst(document, [
      '.posting-categories .commitment',
      '.posting-category.commitment',
    ]);

    // Description
    const description =
      selectText(document, '.posting-description') ||
      selectText(document, '[data-qa="job-description"]') ||
      selectText(document, '.section-wrapper.page-full-width') ||
      selectText(document, '.content');

    // Build location string with commitment if available
    let locationStr = cleanText(location);
    if (commitment && locationStr) {
      locationStr = `${locationStr} (${cleanText(commitment)})`;
    } else if (commitment) {
      locationStr = cleanText(commitment);
    }

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: locationStr,
      salary: null, // Lever rarely shows salary
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url) || url,
      scrapedAt: Date.now(),
      source: 'lever',
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
