/**
 * Lever Parser
 * Extracts job details from Lever job pages
 *
 * Lever uses consistent class naming but we still prioritize
 * data attributes and semantic patterns for reliability.
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectAttr, selectFirst } from '../utils/selectors';
import { cleanText, truncate, cleanUrl, extractCompanyFromUrl } from '../utils/cleaners';
import { calculateConfidence } from '../utils/confidence';
import { getLogoWithFallback } from '../utils/logo';

/**
 * Extract job data from JSON-LD structured data
 */
function extractFromJsonLd(doc: Document): Partial<{
  title: string;
  company: string;
  location: string;
  description: string;
}> {
  try {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          if (item['@type'] === 'JobPosting') {
            return {
              title: item.title || item.name,
              company: typeof item.hiringOrganization === 'string'
                ? item.hiringOrganization
                : item.hiringOrganization?.name,
              location: typeof item.jobLocation === 'string'
                ? item.jobLocation
                : item.jobLocation?.address?.addressLocality,
              description: item.description,
            };
          }
        }
      } catch { /* invalid JSON */ }
    }
  } catch { /* error */ }
  return {};
}

export const leverParser: SiteParser = {
  name: 'lever',
  domains: ['lever.co', 'jobs.lever.co'],

  detect(url: string, document: Document): boolean {
    // Direct Lever URLs
    if (url.includes('lever.co')) {
      return true;
    }

    // Check for Lever embedded content
    const hasLeverEmbed =
      document.querySelector('iframe[src*="lever.co"]') ||
      document.querySelector('[data-lever]') ||
      document.querySelector('#lever-jobs-container');

    return Boolean(hasLeverEmbed);
  },

  extract(document: Document, url: string): ScrapedData {
    // Priority 1: JSON-LD
    const jsonLd = extractFromJsonLd(document);

    // Job title - Lever uses consistent patterns
    const title = jsonLd.title || selectFirst(document, [
      // Lever-specific selectors
      '[data-qa="posting-name"]',
      '.posting-headline h2',
      '.posting-headline [class*="title"]',
      // Fallback patterns
      'h1[class*="posting"]',
      'h2[class*="posting"]',
      'main h1',
      'main h2',
      'h1',
    ]);

    // Company name
    const company = jsonLd.company ||
      selectAttr(document, 'meta[property="og:site_name"]', 'content') ||
      selectAttr(document, '.main-header-logo img', 'alt') ||
      selectAttr(document, 'header img', 'alt') ||
      selectAttr(document, '[class*="logo"] img', 'alt') ||
      extractCompanyFromUrl(url);

    // Company logo
    const companyLogo = getLogoWithFallback(document, company, [
      '.main-header-logo img',
      'header img[src*="logo"]',
      '[class*="header"] img',
    ]);

    // Location - Lever has location in categories
    const location = jsonLd.location || selectFirst(document, [
      '[data-qa="posting-location"]',
      '.posting-categories .location',
      '.posting-category.location',
      '[class*="location"]',
      '.workplaceTypes',
    ]);

    // Commitment/work type (full-time, remote, etc.)
    const commitment = selectFirst(document, [
      '.posting-categories .commitment',
      '.posting-category.commitment',
      '[class*="commitment"]',
      '.workplaceTypes',
    ]);

    // Team/department info
    const team = selectFirst(document, [
      '.posting-categories .team',
      '.posting-category.team',
      '[class*="department"]',
    ]);

    // Description
    const description = jsonLd.description ||
      selectText(document, '[data-qa="job-description"]') ||
      selectText(document, '.posting-description') ||
      selectText(document, '.section-wrapper.page-full-width') ||
      selectText(document, 'main article') ||
      selectText(document, '.content');

    // Build enhanced location string
    let locationStr = cleanText(location);
    const extras: string[] = [];
    if (commitment) extras.push(cleanText(commitment) || '');
    if (team) extras.push(cleanText(team) || '');
    const extraInfo = extras.filter(Boolean).join(', ');

    if (extraInfo && locationStr) {
      locationStr = `${locationStr} (${extraInfo})`;
    } else if (extraInfo) {
      locationStr = extraInfo;
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

    const baseConfidence = calculateConfidence({
      title: extractedData.title,
      company: extractedData.company,
      description: extractedData.description,
      location: extractedData.location,
      salary: extractedData.salary,
    });

    extractedData.confidence = jsonLd.title ? baseConfidence : baseConfidence * 0.9;

    return extractedData;
  },
};
