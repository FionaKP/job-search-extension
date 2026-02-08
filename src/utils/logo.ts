/**
 * Logo Utilities for Dashboard Components
 * Provides Clearbit fallback for company logos
 */

/**
 * Well-known company domain mappings
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
 * This is a free, no-auth-required service
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
 * Get the best available logo URL for a posting
 * Returns existing logo if available, otherwise Google favicon fallback
 */
export function getLogoUrl(companyLogo: string | null | undefined, company: string): string | null {
  if (companyLogo) return companyLogo;
  return getCompanyLogoUrl(company);
}
