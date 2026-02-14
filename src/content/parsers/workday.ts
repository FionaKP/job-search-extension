/**
 * Workday Parser
 * Extracts job details from Workday job pages
 *
 * IMPORTANT: Workday implementations vary SIGNIFICANTLY between companies.
 * Each company customizes their Workday instance, so selectors may not
 * work universally. We use data-automation-id attributes when available
 * as these are the most consistent across implementations.
 */

import { SiteParser, ScrapedData } from './types';
import { selectText, selectFirst, selectAttr } from '../utils/selectors';
import { cleanText, truncate, cleanUrl, extractCompanyFromUrl } from '../utils/cleaners';
import { extractSalary } from '../utils/salary';
import { calculateConfidence } from '../utils/confidence';
import { getLogoWithFallback } from '../utils/logo';

/**
 * Extract from JSON-LD (some Workday instances include this)
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
        if (data['@type'] === 'JobPosting') {
          return {
            title: data.title,
            company: data.hiringOrganization?.name,
            location: data.jobLocation?.address?.addressLocality,
            description: data.description,
          };
        }
      } catch { /* invalid JSON */ }
    }
  } catch { /* error */ }
  return {};
}

export const workdayParser: SiteParser = {
  name: 'workday',
  domains: ['myworkdayjobs.com', 'workday.com', 'wd1.myworkdayjobs.com', 'wd5.myworkdayjobs.com'],

  detect(url: string): boolean {
    return url.includes('myworkdayjobs.com') ||
           url.includes('workday.com/') ||
           url.includes('wd1.') ||
           url.includes('wd5.');
  },

  extract(document: Document, url: string): ScrapedData {
    // Try JSON-LD first
    const jsonLd = extractFromJsonLd(document);

    // Job title - data-automation-id is most reliable for Workday
    const title = jsonLd.title || selectFirst(document, [
      // Workday data-automation-id attributes
      '[data-automation-id="jobPostingHeader"]',
      '[data-automation-id="jobPostingTitle"]',
      '[data-automation-id="job-title"]',
      // Common element patterns
      'h2[data-automation-id]',
      'h1[data-automation-id]',
      // Semantic patterns
      '[class*="job-title" i]',
      '[class*="jobTitle"]',
      '[class*="posting-title" i]',
      // Generic
      'main h1',
      'main h2',
      'h1',
      'h2',
    ]);

    // Company name - often in header or can be extracted from URL
    // Workday URLs often contain company name: company.wd5.myworkdayjobs.com
    const company = jsonLd.company || selectFirst(document, [
      '[data-automation-id="jobPostingCompanyName"]',
      '[data-automation-id="companyName"]',
      '[data-automation-id="company"]',
      '[class*="company-name" i]',
      '[class*="companyName"]',
    ]) ||
    selectAttr(document, 'meta[property="og:site_name"]', 'content') ||
    extractCompanyFromUrl(url);

    // Company logo
    const companyLogo = getLogoWithFallback(document, company, [
      '[data-automation-id="companyLogo"] img',
      '[data-automation-id="logo"] img',
      'header img',
      '[class*="logo" i] img',
    ]);

    // Location - Workday often shows multiple locations
    const location = jsonLd.location || selectFirst(document, [
      '[data-automation-id="locations"]',
      '[data-automation-id="jobPostingLocation"]',
      '[data-automation-id="location"]',
      '[data-automation-id="primaryLocation"]',
      // Pattern matching
      '[class*="location" i]',
      '[class*="Location"]',
    ]);

    // Time type (full-time, part-time)
    const timeType = selectFirst(document, [
      '[data-automation-id="time"]',
      '[data-automation-id="timeType"]',
      '[class*="time-type" i]',
    ]);

    // Salary - varies by company
    const salary = extractSalary(document, [
      '[data-automation-id="salary"]',
      '[data-automation-id="compensation"]',
      '[data-automation-id="payRange"]',
      '[class*="salary" i]',
      '[class*="compensation" i]',
    ]);

    // Description - main job content
    const description = jsonLd.description ||
      selectText(document, '[data-automation-id="jobPostingDescription"]') ||
      selectText(document, '[data-automation-id="jobDescription"]') ||
      selectText(document, '[data-automation-id="description"]') ||
      selectText(document, '[class*="job-description" i]') ||
      selectText(document, '[class*="jobDescription"]') ||
      selectText(document, 'main article') ||
      selectText(document, 'main');

    // Build enhanced location
    let locationStr = cleanText(location);
    const timeTypeStr = cleanText(timeType);
    if (timeTypeStr && locationStr) {
      locationStr = `${locationStr} · ${timeTypeStr}`;
    } else if (timeTypeStr) {
      locationStr = timeTypeStr;
    }

    const extractedData: ScrapedData = {
      title: cleanText(title),
      company: cleanText(company),
      companyLogo: cleanUrl(companyLogo),
      location: locationStr,
      salary: cleanText(salary),
      description: truncate(cleanText(description), 5000),
      url: cleanUrl(url) || url,
      scrapedAt: Date.now(),
      source: 'workday',
      confidence: 0,
    };

    // Lower confidence for Workday due to high variability
    const baseConfidence = calculateConfidence({
      title: extractedData.title,
      company: extractedData.company,
      description: extractedData.description,
      location: extractedData.location,
      salary: extractedData.salary,
    });

    extractedData.confidence = jsonLd.title ? baseConfidence : baseConfidence * 0.85;

    return extractedData;
  },
};
