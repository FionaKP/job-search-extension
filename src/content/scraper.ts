/**
 * Content Script: Job Page Scraper
 * Uses modular parsers to extract job posting details from various job sites
 */

export {};

import { scrapeJobData, ScrapedData } from './parsers';

declare global {
  interface Window {
    __jobTrackerScraperLoaded?: boolean;
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

}
