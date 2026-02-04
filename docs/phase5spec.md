# Phase 5 Specification: Keyword Analysis
## JobFlow Chrome Extension

**Goal:** Help users tailor their applications by extracting and categorizing keywords from job descriptions.

**Timeline:** 1.5-2 weeks (solo developer)

**Predecessor:** Phase 4 complete (connections integration)

---

## 1. Scope Summary

### In Scope
- Keyword extraction from job descriptions
- Keyword categorization (skills, requirements, values)
- Keyword checklist for application prep
- Keyword frequency/importance scoring
- Compare keywords across similar postings
- Highlight missing keywords (vs. resume - optional)

### Out of Scope
- AI-powered resume writing
- Auto-application features
- ATS scoring/optimization
- Resume parsing (future enhancement)

---

## 2. Feature Specifications

### 2.1 Keyword Extraction

**Process:**
1. When a posting is saved, extract keywords from description
2. Categorize keywords by type
3. Score keywords by importance/frequency
4. Store with posting for later reference

**Keyword Categories:**

| Category | Description | Examples |
|----------|-------------|----------|
| Required Skills | Technical skills explicitly required | Python, React, AWS, SQL |
| Preferred Skills | Nice-to-have technical skills | Kubernetes, GraphQL, TypeScript |
| Soft Skills | Non-technical requirements | Communication, leadership, collaboration |
| Experience | Years/type of experience | 5+ years, senior, lead |
| Education | Degree requirements | BS/MS, Computer Science |
| Values/Culture | Company culture keywords | Fast-paced, innovative, mission-driven |
| Tools | Specific tools/platforms | Jira, Figma, GitHub, Slack |
| Industry | Domain-specific terms | Fintech, healthcare, B2B, SaaS |

**Data Model:**
```typescript
interface ExtractedKeyword {
  term: string;
  category: KeywordCategory;
  importance: 'high' | 'medium' | 'low';
  frequency: number;        // Times mentioned
  context?: string;         // Surrounding text snippet
  addressed?: boolean;      // User marked as addressed in their app
}

type KeywordCategory = 
  | 'required_skill'
  | 'preferred_skill'
  | 'soft_skill'
  | 'experience'
  | 'education'
  | 'values'
  | 'tools'
  | 'industry';

// Added to Posting interface
interface Posting {
  // ... existing fields
  keywords?: ExtractedKeyword[];
  keywordsExtractedAt?: number;
}
```

### 2.2 Extraction Algorithm

**Approach:** Rule-based extraction (no external AI APIs needed)

```typescript
// src/services/keywords/extractor.ts

interface ExtractionConfig {
  skillPatterns: RegExp[];
  toolPatterns: RegExp[];
  experiencePatterns: RegExp[];
  educationPatterns: RegExp[];
  softSkillsList: string[];
  valueKeywords: string[];
}

const TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby',
  'react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'rails',
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
  'git', 'ci/cd', 'agile', 'scrum', 'rest', 'graphql', 'api',
  'machine learning', 'ml', 'ai', 'data science', 'nlp',
  'ios', 'android', 'swift', 'kotlin', 'react native', 'flutter',
  // ... extensive list
];

const SOFT_SKILLS = [
  'communication', 'leadership', 'teamwork', 'collaboration',
  'problem-solving', 'critical thinking', 'adaptability',
  'time management', 'attention to detail', 'creativity',
  'initiative', 'self-motivated', 'mentorship',
  // ... more
];

const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*years?\s*(of\s+)?experience/gi,
  /senior|lead|principal|staff|junior|entry.level/gi,
  /experience\s+(with|in)\s+([^.]+)/gi,
];

const EDUCATION_PATTERNS = [
  /b\.?s\.?|bachelor'?s?|m\.?s\.?|master'?s?|ph\.?d\.?/gi,
  /computer science|software engineering|mathematics/gi,
  /degree\s+in\s+([^.]+)/gi,
];

function extractKeywords(description: string): ExtractedKeyword[] {
  const keywords: ExtractedKeyword[] = [];
  const lowerDesc = description.toLowerCase();
  
  // Extract technical skills
  for (const skill of TECH_SKILLS) {
    const regex = new RegExp(`\\b${skill}\\b`, 'gi');
    const matches = description.match(regex);
    if (matches) {
      keywords.push({
        term: skill,
        category: isInRequiredSection(description, skill) 
          ? 'required_skill' 
          : 'preferred_skill',
        importance: matches.length > 2 ? 'high' : matches.length > 1 ? 'medium' : 'low',
        frequency: matches.length,
        addressed: false,
      });
    }
  }
  
  // Extract soft skills
  for (const skill of SOFT_SKILLS) {
    if (lowerDesc.includes(skill.toLowerCase())) {
      keywords.push({
        term: skill,
        category: 'soft_skill',
        importance: 'medium',
        frequency: countOccurrences(lowerDesc, skill.toLowerCase()),
        addressed: false,
      });
    }
  }
  
  // Extract experience requirements
  for (const pattern of EXPERIENCE_PATTERNS) {
    const matches = description.matchAll(pattern);
    for (const match of matches) {
      keywords.push({
        term: match[0],
        category: 'experience',
        importance: 'high',
        frequency: 1,
        context: getContext(description, match.index),
        addressed: false,
      });
    }
  }
  
  // ... similar for education, tools, values
  
  return deduplicateAndSort(keywords);
}
```

### 2.3 Keywords Panel in Posting Detail

**Location:** New tab/section in PostingDetailPanel

**Design:**
```
┌──────────────────────────────────────────────────────────┐
│ [Details] [Keywords] [Connections]                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Keywords Analysis                          [↻ Refresh]   │
│ Extracted from job description                           │
│                                                          │
│ ─────────────────────────────────────────────────────── │
│ Required Skills (5)                        4/5 addressed │
│ ─────────────────────────────────────────────────────── │
│ ☑ Python ●●● mentioned 4x                               │
│ ☑ React ●●○ mentioned 2x                                │
│ ☑ AWS ●●○ mentioned 2x                                  │
│ ☑ SQL ●○○ mentioned 1x                                  │
│ ☐ Kubernetes ●○○ mentioned 1x                           │
│                                                          │
│ ─────────────────────────────────────────────────────── │
│ Preferred Skills (3)                       1/3 addressed │
│ ─────────────────────────────────────────────────────── │
│ ☐ TypeScript ●○○                                        │
│ ☑ GraphQL ●○○                                           │
│ ☐ Terraform ●○○                                         │
│                                                          │
│ ─────────────────────────────────────────────────────── │
│ Soft Skills (4)                            2/4 addressed │
│ ─────────────────────────────────────────────────────── │
│ ☐ Communication ●●○                                     │
│ ☑ Leadership ●○○                                        │
│ ☑ Collaboration ●○○                                     │
│ ☐ Problem-solving ●○○                                   │
│                                                          │
│ ─────────────────────────────────────────────────────── │
│ Experience                                               │
│ ─────────────────────────────────────────────────────── │
│ ☐ 5+ years experience                                   │
│ ☐ Senior level                                          │
│                                                          │
│ ─────────────────────────────────────────────────────── │
│ Values/Culture                                           │
│ ─────────────────────────────────────────────────────── │
│ • Fast-paced environment                                │
│ • Mission-driven                                        │
│ • Innovative                                            │
│                                                          │
│ ─────────────────────────────────────────────────────── │
│                                                          │
│ Coverage: 7/12 keywords addressed (58%)                  │
│ [█████████░░░░░░░]                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Interactions:**
| Element | Action |
|---------|--------|
| Checkbox | Toggle "addressed" status |
| Keyword | Click to see context (where it appears) |
| ↻ Refresh | Re-extract keywords from description |
| Importance dots | Visual indicator (●●● = high) |

### 2.4 Keyword Context Popover

When clicking a keyword, show where it appears:

```
┌──────────────────────────────────────────────────────────┐
│ "Python" appears 4 times                            [X]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 1. "...strong proficiency in Python and modern..."       │
│                                                          │
│ 2. "...build data pipelines using Python, SQL..."        │
│                                                          │
│ 3. "...Required: Python, React, AWS..."                  │
│                                                          │
│ 4. "...Python-based microservices..."                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.5 Keywords Summary on Card

**PostingCard Enhancement:**

Show keyword coverage indicator:

```
┌─────────────────────────────────┐
│ ┌────┐  Software Engineer       │
│ │logo│  Anthropic              │
│ └────┘  San Francisco, CA       │
├─────────────────────────────────┤
│ ★★★  [python] [react]  👥1  •3d │
│ Keywords: 7/12 (58%) ████░░     │  ← Optional: show on card
└─────────────────────────────────┘
```

Or more subtle - just tags from top keywords:
```
│ ★★★  [python] [react] [aws]  👥1 │  ← Auto-tags from keywords
```

### 2.6 Compare Keywords Across Postings

**Feature:** See common keywords across multiple postings to identify skill gaps

**Access:** Select multiple postings → "Compare Keywords"

**Design:**
```
┌──────────────────────────────────────────────────────────────────────┐
│ Keyword Comparison                                              [X]  │
│ 3 postings selected                                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Common Keywords (appear in 2+ postings)                              │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Python        ████████████ 3/3 postings                         │ │
│ │ AWS           ████████░░░░ 2/3 postings                         │ │
│ │ SQL           ████████░░░░ 2/3 postings                         │ │
│ │ React         ████████░░░░ 2/3 postings                         │ │
│ │ Communication ████████░░░░ 2/3 postings                         │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ 💡 Focus on these skills - they're in high demand for your targets  │
│                                                                      │
│ Unique to Each Posting                                               │
│ • Anthropic SWE: Kubernetes, Terraform                               │
│ • Google PM: Product sense, SQL analytics                            │
│ • Meta Engineer: GraphQL, Real-time systems                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.7 Auto-Extraction on Save

**Behavior:**
1. User saves posting (via popup)
2. After save, keywords extracted automatically in background
3. Keywords available when user opens posting detail
4. Show subtle indicator: "✓ 15 keywords extracted"

**Performance:**
- Extraction happens client-side (no API calls)
- Should complete in < 500ms for typical job description
- Don't block the save operation

---

## 3. Implementation Tasks

### 3.1 Extraction Engine (Days 1-3)

- [ ] **K1.1** Create keyword extraction service
- [ ] **K1.2** Build comprehensive skill/tool dictionary
- [ ] **K1.3** Implement pattern matching for experience/education
- [ ] **K1.4** Add importance scoring logic
- [ ] **K1.5** Add context extraction (surrounding text)
- [ ] **K1.6** Create deduplication and sorting

### 3.2 Data Model & Storage (Days 3-4)

- [ ] **K2.1** Add keywords field to Posting interface
- [ ] **K2.2** Update storage service
- [ ] **K2.3** Add keywords to export/import
- [ ] **K2.4** Create migration for existing postings (extract on demand)

### 3.3 Keywords Panel UI (Days 4-6)

- [ ] **K3.1** Create KeywordsPanel component
- [ ] **K3.2** Create KeywordCategory section component
- [ ] **K3.3** Create KeywordItem with checkbox
- [ ] **K3.4** Add importance indicator (dots)
- [ ] **K3.5** Add coverage progress bar
- [ ] **K3.6** Implement "addressed" toggle with persistence

### 3.4 Context Popover (Days 6-7)

- [ ] **K4.1** Create KeywordContextPopover component
- [ ] **K4.2** Highlight keyword in context snippets
- [ ] **K4.3** Handle keywords with many occurrences

### 3.5 Auto-Extraction Integration (Days 7-8)

- [ ] **K5.1** Add extraction call after posting save
- [ ] **K5.2** Add "Refresh" button to re-extract
- [ ] **K5.3** Handle extraction errors gracefully
- [ ] **K5.4** Add loading state during extraction

### 3.6 Card Integration (Days 8-9)

- [ ] **K6.1** Add top keywords as auto-tags on card
- [ ] **K6.2** Optional: Add coverage indicator to card
- [ ] **K6.3** Ensure performance with many postings

### 3.7 Comparison Feature (Days 9-11)

- [ ] **K7.1** Add multi-select mode to dashboard
- [ ] **K7.2** Create CompareKeywordsModal
- [ ] **K7.3** Implement comparison logic
- [ ] **K7.4** Display common and unique keywords

### 3.8 Polish (Days 11-12)

- [ ] **K8.1** Performance testing with long descriptions
- [ ] **K8.2** Fine-tune skill dictionary
- [ ] **K8.3** Add empty states
- [ ] **K8.4** Test export/import with keywords

---

## 4. Acceptance Criteria

### 4.1 Extraction
- [ ] Keywords extracted from job descriptions automatically
- [ ] Keywords categorized correctly (skills, experience, etc.)
- [ ] Importance scored based on frequency/context
- [ ] Extraction completes in < 500ms

### 4.2 Keywords Panel
- [ ] Keywords displayed by category
- [ ] Checkboxes work to mark as addressed
- [ ] Addressed state persists
- [ ] Coverage percentage calculated correctly
- [ ] Refresh button re-extracts keywords

### 4.3 Context
- [ ] Can see where keyword appears in description
- [ ] Context snippets are readable

### 4.4 Card Integration
- [ ] Top keywords show as tags on card
- [ ] Performance acceptable with 200+ postings

### 4.5 Comparison
- [ ] Can select multiple postings
- [ ] Common keywords identified correctly
- [ ] Unique keywords shown per posting

---

## 5. Keyword Dictionary

**Maintained in:** `src/services/keywords/dictionary.ts`

**Structure:**
```typescript
export const KEYWORD_DICTIONARY = {
  // Technical skills - programming languages
  languages: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#',
    'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin',
    'scala', 'r', 'matlab', 'perl', 'haskell', 'elixir',
  ],
  
  // Frontend
  frontend: [
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'webpack', 'vite', 'babel', 'redux', 'mobx',
  ],
  
  // Backend
  backend: [
    'node', 'express', 'fastify', 'django', 'flask', 'rails',
    'spring', 'spring boot', '.net', 'asp.net', 'laravel',
    'fastapi', 'gin', 'echo', 'fiber',
  ],
  
  // Cloud & Infrastructure
  cloud: [
    'aws', 'amazon web services', 'gcp', 'google cloud', 'azure',
    'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
    'jenkins', 'circleci', 'github actions', 'gitlab ci',
    'nginx', 'apache', 'linux', 'unix',
  ],
  
  // Databases
  databases: [
    'sql', 'postgresql', 'postgres', 'mysql', 'mariadb',
    'mongodb', 'dynamodb', 'cassandra', 'redis', 'memcached',
    'elasticsearch', 'solr', 'neo4j', 'graphdb',
  ],
  
  // Data & ML
  data: [
    'machine learning', 'ml', 'deep learning', 'ai',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn',
    'pandas', 'numpy', 'spark', 'hadoop', 'kafka',
    'data science', 'data engineering', 'etl', 'data pipeline',
  ],
  
  // Tools
  tools: [
    'git', 'github', 'gitlab', 'bitbucket',
    'jira', 'confluence', 'trello', 'asana',
    'figma', 'sketch', 'adobe xd',
    'postman', 'swagger', 'openapi',
    'datadog', 'splunk', 'new relic', 'grafana',
  ],
  
  // Soft skills
  softSkills: [
    'communication', 'leadership', 'teamwork', 'collaboration',
    'problem-solving', 'critical thinking', 'analytical',
    'adaptability', 'flexibility', 'initiative', 'proactive',
    'attention to detail', 'organized', 'time management',
    'mentorship', 'coaching', 'presentation',
  ],
  
  // Values/Culture
  values: [
    'fast-paced', 'startup', 'innovative', 'cutting-edge',
    'mission-driven', 'impact', 'growth mindset',
    'diversity', 'inclusive', 'remote-friendly',
    'work-life balance', 'collaborative environment',
  ],
};
```

---

## 6. Definition of Done

Phase 5 is complete when:
1. Keywords automatically extracted on save
2. Keywords panel shows categorized keywords with checkboxes
3. Coverage tracking works correctly
4. Context popover shows keyword occurrences
5. Comparison feature identifies common keywords
6. Export/import preserves keyword data
7. Performance acceptable (< 500ms extraction)
8. All acceptance criteria met