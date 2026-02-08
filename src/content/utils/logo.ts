/**
 * Logo Extraction Utilities
 * Helpers for finding company logos on job pages
 * Includes Clearbit fallback for when scraping fails
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
 * Well-known company domain mappings for common companies
 * that don't follow the simple "companyname.com" pattern
 */
const KNOWN_COMPANY_DOMAINS: Record<string, string> = {
  'google': 'google.com',
  'alphabet': 'abc.xyz',
  'meta': 'meta.com',
  'facebook': 'facebook.com',
  'amazon': 'amazon.com',
  'apple': 'apple.com',
  'microsoft': 'microsoft.com',
  'netflix': 'netflix.com',
  'airbnb': 'airbnb.com',
  'uber': 'uber.com',
  'lyft': 'lyft.com',
  'spotify': 'spotify.com',
  'slack': 'slack.com',
  'salesforce': 'salesforce.com',
  'stripe': 'stripe.com',
  'shopify': 'shopify.com',
  'twilio': 'twilio.com',
  'zoom': 'zoom.us',
  'dropbox': 'dropbox.com',
  'linkedin': 'linkedin.com',
  'twitter': 'twitter.com',
  'x': 'x.com',
  'snap': 'snap.com',
  'snapchat': 'snapchat.com',
  'pinterest': 'pinterest.com',
  'reddit': 'reddit.com',
  'discord': 'discord.com',
  'github': 'github.com',
  'gitlab': 'gitlab.com',
  'atlassian': 'atlassian.com',
  'jira': 'atlassian.com',
  'confluence': 'atlassian.com',
  'notion': 'notion.so',
  'figma': 'figma.com',
  'canva': 'canva.com',
  'adobe': 'adobe.com',
  'oracle': 'oracle.com',
  'ibm': 'ibm.com',
  'intel': 'intel.com',
  'nvidia': 'nvidia.com',
  'amd': 'amd.com',
  'cisco': 'cisco.com',
  'vmware': 'vmware.com',
  'dell': 'dell.com',
  'hp': 'hp.com',
  'hewlett packard': 'hp.com',
  'samsung': 'samsung.com',
  'sony': 'sony.com',
  'lg': 'lg.com',
  'paypal': 'paypal.com',
  'square': 'squareup.com',
  'block': 'block.xyz',
  'robinhood': 'robinhood.com',
  'coinbase': 'coinbase.com',
  'plaid': 'plaid.com',
  'doordash': 'doordash.com',
  'instacart': 'instacart.com',
  'grubhub': 'grubhub.com',
  'postmates': 'postmates.com',
  'peloton': 'onepeloton.com',
  'tesla': 'tesla.com',
  'spacex': 'spacex.com',
  'palantir': 'palantir.com',
  'databricks': 'databricks.com',
  'snowflake': 'snowflake.com',
  'datadog': 'datadoghq.com',
  'splunk': 'splunk.com',
  'elastic': 'elastic.co',
  'mongodb': 'mongodb.com',
  'redis': 'redis.com',
  'cloudflare': 'cloudflare.com',
  'fastly': 'fastly.com',
  'akamai': 'akamai.com',
  'okta': 'okta.com',
  'auth0': 'auth0.com',
  'hashicorp': 'hashicorp.com',
  'docker': 'docker.com',
  'kubernetes': 'kubernetes.io',
  'redhat': 'redhat.com',
  'red hat': 'redhat.com',
  'canonical': 'canonical.com',
  'ubuntu': 'ubuntu.com',
  'suse': 'suse.com',
  'vercel': 'vercel.com',
  'netlify': 'netlify.com',
  'heroku': 'heroku.com',
  'digitalocean': 'digitalocean.com',
  'linode': 'linode.com',
  'vultr': 'vultr.com',
  'aws': 'aws.amazon.com',
  'amazon web services': 'aws.amazon.com',
  'gcp': 'cloud.google.com',
  'google cloud': 'cloud.google.com',
  'azure': 'azure.microsoft.com',
  'deloitte': 'deloitte.com',
  'mckinsey': 'mckinsey.com',
  'bcg': 'bcg.com',
  'bain': 'bain.com',
  'accenture': 'accenture.com',
  'kpmg': 'kpmg.com',
  'pwc': 'pwc.com',
  'ey': 'ey.com',
  'ernst & young': 'ey.com',
  'jpmorgan': 'jpmorgan.com',
  'goldman sachs': 'goldmansachs.com',
  'morgan stanley': 'morganstanley.com',
  'bank of america': 'bankofamerica.com',
  'wells fargo': 'wellsfargo.com',
  'citi': 'citi.com',
  'citibank': 'citi.com',
  'chase': 'chase.com',
  'capital one': 'capitalone.com',
  'american express': 'americanexpress.com',
  'amex': 'americanexpress.com',
  'visa': 'visa.com',
  'mastercard': 'mastercard.com',
};

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

/**
 * Convert company name to a likely domain
 */
function companyToDomain(company: string): string | null {
  if (!company) return null;

  const normalized = company.toLowerCase().trim();

  // Check known mappings first
  if (KNOWN_COMPANY_DOMAINS[normalized]) {
    return KNOWN_COMPANY_DOMAINS[normalized];
  }

  // Check partial matches (e.g., "Google Inc" should match "google")
  for (const [key, domain] of Object.entries(KNOWN_COMPANY_DOMAINS)) {
    if (normalized.startsWith(key + ' ') || normalized.startsWith(key + ',')) {
      return domain;
    }
  }

  // Generate domain from company name
  // Remove common suffixes and clean up
  const cleaned = normalized
    .replace(/\s*(inc\.?|llc\.?|ltd\.?|corp\.?|corporation|company|co\.?|limited|gmbh|ag|sa|plc)\.?\s*$/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '');

  if (cleaned.length < 2) return null;

  return `${cleaned}.com`;
}

/**
 * Get logo URL for a company using Google's favicon API
 * This is a free, no-auth-required service (Clearbit API is being sunset)
 * https://dev.to/derlin/get-favicons-from-any-website-using-a-hidden-google-api-3p1e
 */
export function getCompanyLogoUrl(company: string, size: number = 128): string | null {
  const domain = companyToDomain(company);
  if (!domain) return null;

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

/**
 * @deprecated Use getCompanyLogoUrl instead - Clearbit API is being sunset
 */
export function getClearbitLogoUrl(company: string): string | null {
  return getCompanyLogoUrl(company);
}

/**
 * Get logo URL using multiple fallback strategies
 * 1. Try to scrape from page
 * 2. Try Google favicon API for company domain
 * 3. Fall back to page favicon
 */
export function getLogoWithFallback(
  doc: Document,
  company: string | null,
  customSelectors?: string[]
): string | null {
  // Try scraping first
  const scrapedLogo = extractLogo(doc, customSelectors);
  if (scrapedLogo) return scrapedLogo;

  // Try Google favicon API if we have a company name
  if (company) {
    const companyLogo = getCompanyLogoUrl(company);
    if (companyLogo) return companyLogo;
  }

  // Fall back to page favicon
  return getFaviconUrl(doc);
}
