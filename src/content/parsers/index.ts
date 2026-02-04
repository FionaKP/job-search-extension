/**
 * Parser Registry
 * Central registry for all site-specific parsers
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
 * Ordered list of parsers to try
 * More specific parsers first, generic last
 */
export const parsers: SiteParser[] = [
  linkedinParser,
  indeedParser,
  greenhouseParser,
  leverParser,
  workdayParser,
  glassdoorParser,
  wellfoundParser,
  genericParser, // Always last (fallback)
];

/**
 * Get the appropriate parser for a URL and document
 */
export function getParser(url: string, document: Document): SiteParser {
  for (const parser of parsers) {
    if (parser.detect(url, document)) {
      return parser;
    }
  }
  // Should never reach here since genericParser always matches
  return genericParser;
}

/**
 * Scrape job data from the current page
 */
export function scrapeJobData(document: Document, url: string): ScrapedData {
  const parser = getParser(url, document);
  return parser.extract(document, url);
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
