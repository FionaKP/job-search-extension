/**
 * Confidence Calculation
 * Calculates how reliable a scrape result is
 */

import { ConfidenceFactors } from '../parsers/types';

/**
 * Calculate confidence score based on extracted data
 * Returns a value between 0 and 1
 */
export function calculateConfidence(data: ConfidenceFactors): number {
  let score = 0;
  let total = 0;

  // Title is most important (3 points)
  total += 3;
  if (data.title && data.title.length > 3) {
    score += 3;
  } else if (data.title && data.title.length > 0) {
    score += 1;
  }

  // Company is very important (2 points)
  total += 2;
  if (data.company && data.company.length > 1) {
    score += 2;
  } else if (data.company) {
    score += 1;
  }

  // Description adds confidence (2 points)
  total += 2;
  if (data.description && data.description.length > 100) {
    score += 2;
  } else if (data.description && data.description.length > 20) {
    score += 1;
  }

  // Location is nice to have (1 point)
  total += 1;
  if (data.location && data.location.length > 2) {
    score += 1;
  }

  // Salary is a bonus (1 point)
  total += 1;
  if (data.salary) {
    score += 1;
  }

  // Round to 2 decimal places
  return Math.round((score / total) * 100) / 100;
}

/**
 * Get a human-readable confidence label
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
}
