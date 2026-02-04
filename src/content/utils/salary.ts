/**
 * Salary Extraction Utilities
 * Helpers for finding and parsing salary information
 */

import { selectText } from './selectors';

const SALARY_PATTERNS = [
  // Range formats: $100,000 - $150,000
  /\$[\d,]+\s*[-–—]\s*\$[\d,]+(?:\s*(?:per\s+)?(?:year|yr|annually|hour|hr))?/gi,
  // K format: $100K - $150K
  /\$[\d,]+\s*[kK]\s*[-–—]\s*\$?[\d,]+\s*[kK]?/g,
  // Single salary with period: $100,000/year
  /\$[\d,]+(?:\.\d{2})?\s*(?:\/\s*(?:hr|hour|yr|year|mo|month|week|wk|annual|annually))/gi,
  // Currency with range: 100,000 - 150,000 USD
  /[\d,]+\s*[-–—]\s*[\d,]+\s*(?:USD|CAD|EUR|GBP|AUD)/gi,
  // Simple dollar amount: $150,000
  /\$[\d,]+(?:\.\d{2})?/g,
];

/**
 * Extract salary from specific selectors
 */
export function extractSalary(doc: Document, selectors: string[]): string | null {
  for (const selector of selectors) {
    const text = selectText(doc, selector);
    if (text) {
      const salary = extractSalaryFromText(text);
      if (salary) return salary;
    }
  }
  return extractSalaryFromPage(doc);
}

/**
 * Extract salary from text content
 */
export function extractSalaryFromText(text: string): string | null {
  if (!text) return null;

  for (const pattern of SALARY_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    const match = text.match(pattern);
    if (match) {
      // Return the first valid-looking salary
      const salary = match[0].trim();
      // Validate it looks like a salary (has numbers)
      if (/\d/.test(salary)) {
        return salary;
      }
    }
  }
  return null;
}

/**
 * Search common salary-related elements on the page
 */
export function extractSalaryFromPage(doc: Document): string | null {
  const candidates = [
    '[class*="salary"]',
    '[class*="Salary"]',
    '[class*="compensation"]',
    '[class*="Compensation"]',
    '[class*="pay-"]',
    '[class*="Pay"]',
    '[data-testid*="salary"]',
    '[data-automation-id*="salary"]',
  ];

  for (const selector of candidates) {
    try {
      const text = selectText(doc, selector);
      if (text) {
        const salary = extractSalaryFromText(text);
        if (salary) return salary;
      }
    } catch {
      // Invalid selector, continue
    }
  }

  return null;
}
