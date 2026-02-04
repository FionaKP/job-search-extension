/**
 * Content Script: Job Page Scraper
 * Uses modular parsers to extract job posting details from various job sites
 */

export {};

import { scrapeJobData, getParser, listParsers, ScrapedData } from './parsers';

declare global {
  interface Window {
    __jobTrackerScraperLoaded?: boolean;
    __JOBFLOW_DEBUG__?: {
      testScraper: () => ScrapedData;
      listParsers: () => string[];
      getParserForPage: () => string;
    };
  }
}

// Prevent multiple loads
if (typeof window.__jobTrackerScraperLoaded === 'undefined') {
  window.__jobTrackerScraperLoaded = true;

  /**
   * Scrape job details from the current page
   */
  function scrapeJobDetails(): ScrapedData {
    return scrapeJobData(document, window.location.href);
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'scrapeJob') {
      try {
        const jobData = scrapeJobDetails();
        sendResponse(jobData);
      } catch (error) {
        console.error('JobFlow: Scraper error', error);
        // Return minimal data on error
        sendResponse({
          url: window.location.href,
          title: null,
          company: null,
          companyLogo: null,
          location: null,
          salary: null,
          description: null,
          scrapedAt: Date.now(),
          source: 'error',
          confidence: 0,
        } as ScrapedData);
      }
    }
    return true; // Keep message channel open for async response
  });

  // Debug tools (always available in console for testing)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof window !== 'undefined') {
    window.__JOBFLOW_DEBUG__ = {
      testScraper: () => {
        const parser = getParser(window.location.href, document);
        const data = parser.extract(document, window.location.href);
        console.log('Parser:', parser.name);
        console.log('Data:', data);
        console.log('Confidence:', Math.round(data.confidence * 100) + '%');
        return data;
      },
      listParsers: () => {
        const names = listParsers();
        console.log('Available parsers:', names);
        return names;
      },
      getParserForPage: () => {
        const parser = getParser(window.location.href, document);
        console.log('Parser for this page:', parser.name);
        return parser.name;
      },
    };
    console.log(
      'JobFlow Debug: Use window.__JOBFLOW_DEBUG__.testScraper() to test the scraper'
    );
  }

  console.log('JobFlow: Content script loaded on', window.location.hostname);
}
