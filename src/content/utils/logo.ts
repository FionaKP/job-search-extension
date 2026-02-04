/**
 * Logo Extraction Utilities
 * Helpers for finding company logos on job pages
 */

import { selectAttr, selectFirstAttr } from './selectors';
import { cleanUrl } from './cleaners';

/**
 * Common selectors for company logos
 */
const LOGO_SELECTORS = [
  '[class*="company-logo"] img',
  '[class*="companyLogo"] img',
  '[class*="company_logo"] img',
  '[class*="employer-logo"] img',
  '[class*="employerLogo"] img',
  '.logo img',
  'header img[alt*="logo" i]',
  'img[alt*="company" i][alt*="logo" i]',
];

/**
 * Extract company logo from page
 */
export function extractLogo(doc: Document, customSelectors?: string[]): string | null {
  const selectors = customSelectors ? [...customSelectors, ...LOGO_SELECTORS] : LOGO_SELECTORS;

  // Try src attribute first
  let logoUrl = selectFirstAttr(doc, selectors, 'src');

  // Try data-src for lazy-loaded images
  if (!logoUrl) {
    logoUrl = selectFirstAttr(doc, selectors, 'data-src');
  }

  // Try og:image as fallback
  if (!logoUrl) {
    logoUrl = selectAttr(doc, 'meta[property="og:image"]', 'content');
  }

  return cleanUrl(logoUrl);
}

/**
 * Get favicon as last resort logo
 */
export function getFaviconUrl(doc: Document): string | null {
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
  ];

  for (const selector of selectors) {
    const href = selectAttr(doc, selector, 'href');
    if (href) {
      return cleanUrl(href);
    }
  }

  // Default favicon location
  try {
    return new URL('/favicon.ico', window.location.origin).href;
  } catch {
    return null;
  }
}
