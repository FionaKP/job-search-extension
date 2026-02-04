/**
 * Parser Types
 * Defines interfaces for the modular scraping system
 */

export interface ScrapedData {
  title: string | null;
  company: string | null;
  companyLogo: string | null;
  location: string | null;
  salary: string | null;
  description: string | null;
  url: string;
  scrapedAt: number;
  source: string; // e.g., 'linkedin', 'greenhouse', 'generic'
  confidence: number; // 0-1, how reliable the scrape was
  rawData?: Record<string, unknown>; // For debugging
}

export interface SiteParser {
  name: string;
  domains: string[]; // Matching domain patterns
  pathPatterns?: RegExp[]; // Optional path patterns

  detect(url: string, document: Document): boolean;
  extract(document: Document, url: string): ScrapedData;
}

export interface ConfidenceFactors {
  title?: string | null;
  company?: string | null;
  description?: string | null;
  location?: string | null;
  salary?: string | null;
}
