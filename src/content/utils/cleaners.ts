/**
 * Text Cleaning Utilities
 * Helpers for normalizing and cleaning scraped text
 */

export function cleanText(text: string | null): string | null {
  if (!text) return null;
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\n\r\t]/g, ' ')
    .trim();
}

export function truncate(text: string | null, maxLength: number): string | null {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function cleanUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    if (url.startsWith('/')) {
      return new URL(url, window.location.origin).href;
    }
    // Remove tracking parameters from URLs
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return url;
  }
}

export function extractCompanyFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const parts = hostname.split('.');

    // Handle Lever/Greenhouse URLs where company is in path
    if (parts.includes('lever') || parts.includes('greenhouse')) {
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        // Convert slug to title case: "my-company" -> "My Company"
        return pathParts[0]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }

    // For other sites, extract company from subdomain or domain
    const companyPart = parts[0] === 'www' ? parts[1] : parts[0];
    if (companyPart && companyPart !== 'jobs' && companyPart !== 'careers') {
      return companyPart.charAt(0).toUpperCase() + companyPart.slice(1);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Remove common job posting prefixes/suffixes from titles
 */
export function cleanJobTitle(title: string | null): string | null {
  if (!title) return null;

  let cleaned = title;

  // Remove common suffixes
  const suffixesToRemove = [
    /\s*[-|]\s*(?:Apply|Apply Now|Job Details).*$/i,
    /\s*[-|]\s*LinkedIn.*$/i,
    /\s*[-|]\s*Indeed.*$/i,
    /\s*\(.*ID:?\s*\d+.*\)$/i,
  ];

  for (const pattern of suffixesToRemove) {
    cleaned = cleaned.replace(pattern, '');
  }

  return cleanText(cleaned);
}
