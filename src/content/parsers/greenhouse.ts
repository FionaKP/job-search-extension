/**
 * Greenhouse Parser
 * Extracts job details from Greenhouse job boards
 *
 * Note: Greenhouse uses Remix framework with dynamic CSS classes.
 * We prioritize JSON-LD, data attributes, and semantic HTML over class names.
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectAttr, selectFirst } from '../utils/selectors';
import { cleanText, truncate, cleanUrl, extractCompanyFromUrl } from '../utils/cleaners';
import { calculateConfidence } from '../utils/confidence';
import { getLogoWithFallback } from '../utils/logo';

/**
 * Extract job data from JSON-LD structured data (most reliable for Greenhouse)
 */
function extractFromJsonLd(doc: Document): Partial<{
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
}> {
  try {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          if (item['@type'] === 'JobPosting' || item['@type']?.includes?.('JobPosting')) {
            const result: ReturnType<typeof extractFromJsonLd> = {};
            result.title = item.title || item.name;
            result.description = item.description;

            if (item.hiringOrganization) {
              result.company = typeof item.hiringOrganization === 'string'
                ? item.hiringOrganization
                : item.hiringOrganization.name;
            }

            if (item.jobLocation) {
              const loc = item.jobLocation;
              if (typeof loc === 'string') {
                result.location = loc;
              } else if (Array.isArray(loc)) {
                result.location = loc.map(l => l.address?.addressLocality || l.name).filter(Boolean).join(', ');
              } else if (loc.address) {
                result.location = [loc.address.addressLocality, loc.address.addressRegion]
                  .filter(Boolean).join(', ');
              }
            }

            if (item.baseSalary?.value) {
              const val = item.baseSalary.value;
              if (val.minValue && val.maxValue) {
                result.salary = `$${val.minValue.toLocaleString()} - $${val.maxValue.toLocaleString()}`;
              }
            }

            return result;
          }
        }
      } catch { /* invalid JSON */ }
    }
  } catch { /* error accessing scripts */ }
  return {};
}

/**
 * Extract the largest text block from the page (fallback for description)
 */
function extractLargestTextBlock(doc: Document): string | null {
  const candidates: { text: string; score: number }[] = [];
  const elements = doc.querySelectorAll('main, article, section, div[class*="content"], div[class*="description"]');

  for (const el of elements) {
    const text = (el as HTMLElement).innerText || el.textContent || '';
    if (text.length < 200) continue;

    // Score by length and job-related content
    let score = text.length;
    const lower = text.toLowerCase();
    const jobKeywords = ['responsibilities', 'requirements', 'qualifications', 'experience', 'skills', 'about', 'role', 'position'];
    for (const kw of jobKeywords) {
      if (lower.includes(kw)) score += 100;
    }
    // Bonus for bullet points
    score += (text.match(/[•\-\*]\s/g) || []).length * 10;

    candidates.push({ text, score });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.length > 0 ? candidates[0].text : null;
}

export const greenhouseParser: SiteParser = {
  name: 'greenhouse',
  domains: ['greenhouse.io', 'boards.greenhouse.io', 'job-boards.greenhouse.io'],

  detect(url: string, document: Document): boolean {
    // Direct Greenhouse URLs
    if (url.includes('greenhouse.io')) {
      return true;
    }

    // Embedded Greenhouse jobs (e.g., company.com/careers?gh_jid=123)
    if (url.includes('gh_jid=') || url.includes('gh_jid/')) {
      return true;
    }

    // Check for Greenhouse iframe or embedded content
    if (document) {
      const hasGreenhouseEmbed =
        document.querySelector('iframe[src*="greenhouse.io"]') ||
        document.querySelector('[data-greenhouse]') ||
        document.querySelector('#grnhse_app') ||
        document.querySelector('[id*="greenhouse"]');
      if (hasGreenhouseEmbed) {
        return true;
      }
    }

    return false;
  },

  extract(document: Document, url: string): ScrapedData {
    // Priority 1: JSON-LD structured data (most reliable)
    const jsonLd = extractFromJsonLd(document);

    // Priority 2: Semantic HTML and stable selectors
    // Avoid dynamic class names like .remix-css-* or hashed classes
    const title = jsonLd.title || selectFirst(document, [
      // Semantic/stable patterns
      'h1[class*="title"]',
      'h1[class*="Title"]',
      '[data-test*="title"]',
      '[data-testid*="title"]',
      '[data-automation-id*="title"]',
      // Common Greenhouse patterns
      '.app-title',
      '.posting-headline h1',
      // Generic fallbacks
      'main h1',
      'article h1',
      '#app h1',
      'h1',
    ]);

    // Company - meta tags are reliable
    const company = jsonLd.company ||
      selectAttr(document, 'meta[property="og:site_name"]', 'content') ||
      selectAttr(document, 'meta[name="author"]', 'content') ||
      selectFirst(document, [
        '[class*="company-name"]',
        '[class*="companyName"]',
        '[data-test*="company"]',
        'a[href*="/company"] img[alt]',
      ]) ||
      selectAttr(document, 'header img', 'alt') ||
      selectAttr(document, '[class*="logo"] img', 'alt') ||
      extractCompanyFromUrl(url);

    // Company logo
    const companyLogo = getLogoWithFallback(document, company, [
      'header img[src*="logo"]',
      '[class*="logo"] img',
      'img[alt*="logo" i]',
    ]);

    // Location - use data attributes and semantic patterns
    const location = jsonLd.location || selectFirst(document, [
      '[data-test*="location"]',
      '[data-testid*="location"]',
      '[class*="location"]',
      '[class*="Location"]',
      // Look for location near job metadata
      '.job-location',
      '.posting-categories .location',
    ]);

    // Salary
    const salary = jsonLd.salary || selectFirst(document, [
      '[class*="salary"]',
      '[class*="Salary"]',
      '[class*="compensation"]',
      '[data-test*="salary"]',
    ]);

    // Description - comprehensive extraction for Greenhouse embeds
    const description = jsonLd.description ||
      // Greenhouse embed containers
      selectText(document, '#grnhse_app') ||
      selectText(document, '[id*="greenhouse"]') ||
      selectText(document, '[class*="greenhouse"]') ||
      // Standard data attributes
      selectText(document, '[data-test*="description"]') ||
      selectText(document, '[data-testid*="description"]') ||
      // Common job description patterns
      selectText(document, '[class*="job-description"]') ||
      selectText(document, '[class*="jobDescription"]') ||
      selectText(document, '[class*="job_description"]') ||
      selectText(document, '[class*="posting-description"]') ||
      // Sections with job content
      selectText(document, '.section-wrapper') ||
      selectText(document, '[class*="responsibilities"]') ||
      selectText(document, '[class*="requirements"]') ||
      // Generic content areas
      selectText(document, '#content') ||
      selectText(document, '#job-details') ||
      selectText(document, 'main article') ||
      selectText(document, 'article') ||
      selectText(document, 'main') ||
      selectText(document, '.content') ||
      // Last resort: any large text block
      extractLargestTextBlock(document);

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

    // Higher confidence if we got JSON-LD data
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
