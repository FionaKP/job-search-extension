import { ExtractedKeyword, KeywordCategory, KeywordImportance } from '@/types';
import {
  ALL_TECH_SKILLS,
  SOFT_SKILLS,
  VALUES,
  TOOLS,
  INDUSTRY,
  EXPERIENCE_PATTERNS,
  EDUCATION_PATTERNS,
} from './dictionary';

/**
 * Extracts and categorizes keywords from a job description
 * Uses rule-based extraction (no external APIs needed)
 */
export function extractKeywords(description: string): ExtractedKeyword[] {
  if (!description || description.trim().length === 0) {
    return [];
  }

  const keywords: ExtractedKeyword[] = [];
  const seenTerms = new Set<string>();
  const lowerDesc = description.toLowerCase();

  // Detect "required" vs "preferred" sections
  const requiredSection = detectRequiredSection(lowerDesc);
  const preferredSection = detectPreferredSection(lowerDesc);

  // Extract technical skills
  for (const skill of ALL_TECH_SKILLS) {
    const result = extractTerm(description, skill, seenTerms);
    if (result) {
      const isRequired = isInSection(lowerDesc, skill, requiredSection);
      const isPreferred = isInSection(lowerDesc, skill, preferredSection);

      keywords.push({
        ...result,
        category: isRequired ? 'required_skill' : isPreferred ? 'preferred_skill' : 'required_skill',
      });
    }
  }

  // Extract tools
  for (const tool of TOOLS) {
    const result = extractTerm(description, tool, seenTerms);
    if (result) {
      keywords.push({
        ...result,
        category: 'tools',
      });
    }
  }

  // Extract soft skills
  for (const skill of SOFT_SKILLS) {
    const result = extractTerm(description, skill, seenTerms);
    if (result) {
      keywords.push({
        ...result,
        category: 'soft_skill',
      });
    }
  }

  // Extract values/culture
  for (const value of VALUES) {
    const result = extractTerm(description, value, seenTerms);
    if (result) {
      keywords.push({
        ...result,
        category: 'values',
      });
    }
  }

  // Extract industry terms
  for (const term of INDUSTRY) {
    const result = extractTerm(description, term, seenTerms);
    if (result) {
      keywords.push({
        ...result,
        category: 'industry',
      });
    }
  }

  // Extract experience requirements (regex patterns)
  const experienceKeywords = extractPatterns(description, EXPERIENCE_PATTERNS, 'experience');
  for (const kw of experienceKeywords) {
    if (!seenTerms.has(kw.term.toLowerCase())) {
      seenTerms.add(kw.term.toLowerCase());
      keywords.push(kw);
    }
  }

  // Extract education requirements (regex patterns)
  const educationKeywords = extractPatterns(description, EDUCATION_PATTERNS, 'education');
  for (const kw of educationKeywords) {
    if (!seenTerms.has(kw.term.toLowerCase())) {
      seenTerms.add(kw.term.toLowerCase());
      keywords.push(kw);
    }
  }

  // Sort by importance (high first) then frequency
  return keywords.sort((a, b) => {
    const importanceOrder = { high: 0, medium: 1, low: 2 };
    const impDiff = importanceOrder[a.importance] - importanceOrder[b.importance];
    if (impDiff !== 0) return impDiff;
    return b.frequency - a.frequency;
  });
}

/**
 * Extract a single term from description
 */
function extractTerm(
  description: string,
  term: string,
  seenTerms: Set<string>
): Omit<ExtractedKeyword, 'category'> | null {
  const normalizedTerm = term.toLowerCase();

  // Skip if already seen
  if (seenTerms.has(normalizedTerm)) {
    return null;
  }

  // Create regex for word boundary matching
  // Escape special regex characters
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
  const matches = description.match(regex);

  if (!matches || matches.length === 0) {
    return null;
  }

  seenTerms.add(normalizedTerm);

  const frequency = matches.length;
  const importance = calculateImportance(frequency, description, term);
  const contexts = getContexts(description, term, 3); // Get up to 3 contexts

  return {
    term: normalizeTermCase(term, matches[0]),
    importance,
    frequency,
    contexts: contexts.length > 0 ? contexts : undefined,
    addressed: false,
  };
}

/**
 * Extract keywords using regex patterns
 */
function extractPatterns(
  description: string,
  patterns: RegExp[],
  category: KeywordCategory
): ExtractedKeyword[] {
  const keywords: ExtractedKeyword[] = [];
  const seen = new Set<string>();

  for (const pattern of patterns) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    const matches = description.matchAll(pattern);

    for (const match of matches) {
      const term = match[0].trim();
      const normalizedTerm = term.toLowerCase();

      if (seen.has(normalizedTerm) || term.length < 3) {
        continue;
      }

      seen.add(normalizedTerm);

      keywords.push({
        term,
        category,
        importance: category === 'experience' ? 'high' : 'medium',
        frequency: 1,
        contexts: [getContext(description, match.index || 0)],
        addressed: false,
      });
    }
  }

  return keywords;
}

/**
 * Detect the "required" section boundaries
 */
function detectRequiredSection(text: string): { start: number; end: number } | null {
  const requiredHeaders = [
    /required\s*(?:skills|qualifications|requirements)/i,
    /must\s*have/i,
    /minimum\s*qualifications/i,
    /basic\s*qualifications/i,
    /what\s+you['']?ll\s+need/i,
    /requirements:/i,
  ];

  for (const pattern of requiredHeaders) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      const start = match.index;
      // Find next section header or end of text
      const end = findNextSectionEnd(text, start + match[0].length);
      return { start, end };
    }
  }

  return null;
}

/**
 * Detect the "preferred/nice-to-have" section boundaries
 */
function detectPreferredSection(text: string): { start: number; end: number } | null {
  const preferredHeaders = [
    /preferred\s*(?:skills|qualifications)/i,
    /nice\s*to\s*have/i,
    /bonus\s*(?:points|skills|qualifications)/i,
    /preferred:/i,
    /plus\s*if\s+you\s+have/i,
    /additional\s*(?:skills|qualifications)/i,
  ];

  for (const pattern of preferredHeaders) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      const start = match.index;
      const end = findNextSectionEnd(text, start + match[0].length);
      return { start, end };
    }
  }

  return null;
}

/**
 * Find where the next section starts (or end of text)
 */
function findNextSectionEnd(text: string, startFrom: number): number {
  const sectionHeaders = [
    /\n\s*(?:about|responsibilities|what\s+you|requirements|qualifications|benefits|perks|who\s+you)/i,
    /\n\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:\s*\n/,
  ];

  let minEnd = text.length;

  for (const pattern of sectionHeaders) {
    const remaining = text.slice(startFrom);
    const match = remaining.match(pattern);
    if (match && match.index !== undefined) {
      const end = startFrom + match.index;
      if (end < minEnd) {
        minEnd = end;
      }
    }
  }

  return minEnd;
}

/**
 * Check if a term appears within a section
 */
function isInSection(
  text: string,
  term: string,
  section: { start: number; end: number } | null
): boolean {
  if (!section) return false;

  const sectionText = text.slice(section.start, section.end);
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
  return regex.test(sectionText);
}

/**
 * Calculate importance based on frequency and context
 */
function calculateImportance(frequency: number, description: string, term: string): KeywordImportance {
  // High importance: appears 3+ times OR appears in title/header
  if (frequency >= 3) return 'high';

  const lowerDesc = description.toLowerCase();
  const lowerTerm = term.toLowerCase();

  // Check if in prominent positions
  const prominentPatterns = [
    new RegExp(`(?:required|must have|essential)[^.]*${lowerTerm}`, 'i'),
    new RegExp(`^[^.]*${lowerTerm}`, 'i'), // Near beginning
    new RegExp(`\\*\\*[^*]*${lowerTerm}[^*]*\\*\\*`, 'i'), // Bold text
  ];

  for (const pattern of prominentPatterns) {
    if (pattern.test(lowerDesc)) {
      return 'high';
    }
  }

  // Medium importance: appears 2 times
  if (frequency >= 2) return 'medium';

  // Low importance: appears once
  return 'low';
}

/**
 * Get context snippets around a term
 */
function getContexts(description: string, term: string, maxContexts: number): string[] {
  const contexts: string[] = [];
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');

  let match;
  while ((match = regex.exec(description)) !== null && contexts.length < maxContexts) {
    const context = getContext(description, match.index);
    if (context && !contexts.includes(context)) {
      contexts.push(context);
    }
  }

  return contexts;
}

/**
 * Get a single context snippet around an index
 */
function getContext(description: string, index: number, radius: number = 50): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(description.length, index + radius);

  let context = description.slice(start, end).trim();

  // Add ellipsis if truncated
  if (start > 0) context = '...' + context;
  if (end < description.length) context = context + '...';

  // Clean up whitespace
  context = context.replace(/\s+/g, ' ');

  return context;
}

/**
 * Normalize term case (preserve original casing from match)
 */
function normalizeTermCase(originalTerm: string, matchedTerm: string): string {
  // If the matched term is all caps, prefer title case
  if (matchedTerm === matchedTerm.toUpperCase() && matchedTerm.length > 2) {
    return originalTerm.charAt(0).toUpperCase() + originalTerm.slice(1).toLowerCase();
  }
  // Otherwise use the matched casing (e.g., "JavaScript" instead of "javascript")
  return matchedTerm;
}

/**
 * Group keywords by category
 */
export function groupKeywordsByCategory(
  keywords: ExtractedKeyword[]
): Record<KeywordCategory, ExtractedKeyword[]> {
  const grouped: Record<KeywordCategory, ExtractedKeyword[]> = {
    required_skill: [],
    preferred_skill: [],
    soft_skill: [],
    experience: [],
    education: [],
    values: [],
    tools: [],
    industry: [],
  };

  for (const keyword of keywords) {
    grouped[keyword.category].push(keyword);
  }

  return grouped;
}

/**
 * Calculate coverage statistics
 */
export function calculateCoverage(keywords: ExtractedKeyword[]): {
  total: number;
  addressed: number;
  percentage: number;
  byCategory: Record<KeywordCategory, { total: number; addressed: number }>;
} {
  const byCategory: Record<KeywordCategory, { total: number; addressed: number }> = {
    required_skill: { total: 0, addressed: 0 },
    preferred_skill: { total: 0, addressed: 0 },
    soft_skill: { total: 0, addressed: 0 },
    experience: { total: 0, addressed: 0 },
    education: { total: 0, addressed: 0 },
    values: { total: 0, addressed: 0 },
    tools: { total: 0, addressed: 0 },
    industry: { total: 0, addressed: 0 },
  };

  let total = 0;
  let addressed = 0;

  for (const keyword of keywords) {
    total++;
    byCategory[keyword.category].total++;

    if (keyword.addressed) {
      addressed++;
      byCategory[keyword.category].addressed++;
    }
  }

  return {
    total,
    addressed,
    percentage: total > 0 ? Math.round((addressed / total) * 100) : 0,
    byCategory,
  };
}
