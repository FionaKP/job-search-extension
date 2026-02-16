/**
 * Parser Registry
 * Central registry for all site-specific parsers
 *
 * Uses a fallback strategy: if a site-specific parser fails to extract
 * sufficient data, the generic parser is used as a backup.
 */

import { SiteParser, ScrapedData } from './types';
import { linkedinParser } from './linkedin';
import { indeedParser } from './indeed';
import { greenhouseParser } from './greenhouse';
import { leverParser } from './lever';
import { workdayParser } from './workday';
import { glassdoorParser } from './glassdoor';
import { wellfoundParser } from './wellfound';
import { genericParser } from './generic';

// Export types
export type { SiteParser, ScrapedData } from './types';

/**
 * Ordered list of site-specific parsers (excludes generic)
 */
export const siteSpecificParsers: SiteParser[] = [
  linkedinParser,
  indeedParser,
  greenhouseParser,
  leverParser,
  workdayParser,
  glassdoorParser,
  wellfoundParser,
];

/**
 * All parsers including generic fallback
 */
export const parsers: SiteParser[] = [
  ...siteSpecificParsers,
  genericParser,
];

/**
 * Check if scraped data has minimum required fields
 * Returns true if we have at least a title AND (company OR description)
 */
function hasMinimumData(data: ScrapedData): boolean {
  const hasTitle = Boolean(data.title && data.title.trim().length > 0);
  const hasCompany = Boolean(data.company && data.company.trim().length > 0);
  const hasDescription = Boolean(data.description && data.description.trim().length > 50);

  return hasTitle && (hasCompany || hasDescription);
}

/**
 * Calculate a quality score for scraped data (0-1)
 */
function calculateQualityScore(data: ScrapedData): number {
  let score = 0;
  const weights = {
    title: 0.3,
    company: 0.25,
    description: 0.25,
    location: 0.1,
    salary: 0.1,
  };

  if (data.title && data.title.trim().length > 0) score += weights.title;
  if (data.company && data.company.trim().length > 0) score += weights.company;
  if (data.description && data.description.trim().length > 100) score += weights.description;
  if (data.location && data.location.trim().length > 0) score += weights.location;
  if (data.salary && data.salary.trim().length > 0) score += weights.salary;

  return score;
}

/**
 * Merge two ScrapedData objects, preferring non-null values from primary
 * Falls back to secondary for any missing fields
 */
function mergeScrapedData(primary: ScrapedData, secondary: ScrapedData): ScrapedData {
  return {
    title: primary.title || secondary.title,
    company: primary.company || secondary.company,
    companyLogo: primary.companyLogo || secondary.companyLogo,
    location: primary.location || secondary.location,
    salary: primary.salary || secondary.salary,
    description: primary.description || secondary.description,
    url: primary.url || secondary.url,
    scrapedAt: primary.scrapedAt,
    source: primary.source, // Keep original source for tracking
    confidence: Math.max(primary.confidence, secondary.confidence),
  };
}

/**
 * Get the appropriate parser for a URL and document
 */
export function getParser(url: string, document: Document): SiteParser {
  for (const parser of siteSpecificParsers) {
    if (parser.detect(url, document)) {
      return parser;
    }
  }
  return genericParser;
}

/**
 * Scrape job data from the current page
 *
 * Strategy:
 * 1. Try site-specific parser first
 * 2. If result has minimum data (title + company/description), use it
 * 3. If not, try generic parser as fallback
 * 4. Return the better result, or merge if both have useful data
 */
export function scrapeJobData(document: Document, url: string): ScrapedData {
  const siteParser = getParser(url, document);

  // If we're already using generic, just return its result
  if (siteParser.name === 'generic') {
    return genericParser.extract(document, url);
  }

  // Try site-specific parser first
  const siteResult = siteParser.extract(document, url);
  const siteQuality = calculateQualityScore(siteResult);

  // If site-specific result is good enough (has title + company/description), use it
  if (hasMinimumData(siteResult) && siteQuality >= 0.5) {
    return siteResult;
  }

  // Try generic parser as fallback
  const genericResult = genericParser.extract(document, url);
  const genericQuality = calculateQualityScore(genericResult);

  // If site result is empty/bad, use generic
  if (!hasMinimumData(siteResult)) {
    // Update source to indicate fallback was used
    return {
      ...genericResult,
      source: `${siteParser.name}+generic`,
    };
  }

  // Both have some data - merge them, preferring site-specific
  if (genericQuality > siteQuality) {
    // Generic found more, but keep site-specific values where available
    return {
      ...mergeScrapedData(siteResult, genericResult),
      source: `${siteParser.name}+generic`,
      confidence: Math.max(siteResult.confidence, genericResult.confidence * 0.9),
    };
  }

  // Site-specific is better or equal, use it but fill gaps from generic
  return mergeScrapedData(siteResult, genericResult);
}

/**
 * List available parser names (for debugging)
 */
export function listParsers(): string[] {
  return parsers.map((p) => p.name);
}

/**
 * Get parser by name (for debugging)
 */
export function getParserByName(name: string): SiteParser | undefined {
  return parsers.find((p) => p.name === name);
}
