# Scraper Known Limitations & Notes

**Last Updated:** 2026-02-13
**Parser Version:** 2.0.0

---

## Overview

JobFlow uses site-specific parsers to extract job posting data. Each parser is optimized for a particular job board but faces challenges due to:

1. **Dynamic CSS classes** - Sites like LinkedIn, Glassdoor, and Wellfound use hashed class names that change on every deployment
2. **Varied implementations** - Workday instances are highly customized per company
3. **Anti-scraping measures** - Some sites block or alter content for extensions
4. **Dynamic content loading** - Content may load after initial page render via JavaScript

### Parser Priority Strategy

All parsers now follow this priority order:

1. **JSON-LD structured data** (most reliable - schema.org JobPosting)
2. **data-* attributes** (stable across deployments)
3. **ARIA labels and semantic HTML** (accessibility patterns)
4. **Pattern matching** (e.g., `[class*="title"]` instead of `.css-1abc123`)
5. **Generic fallbacks** (h1, main, article)

---

## LinkedIn

**Parser:** `linkedin.ts`
**Detection:** URLs containing `linkedin.com/jobs`

### Known Limitations

- **Login required** - Most job details only visible when logged in
- **"Show more" content** - Full description may be hidden behind expand buttons
- **Easy Apply variations** - Easy Apply jobs may have different DOM structure
- **Rate limiting** - LinkedIn may throttle rapid requests
- **Multiple layouts** - Different layouts for job search results vs. individual job pages

### What Works Well

- Job title extraction
- Company name from links
- Location including remote/hybrid badges
- Salary when displayed in insights section

### What May Fail

- Company logo (often lazy-loaded)
- Full description if "Show more" not clicked
- Salary estimates (not always present)

### Tips

- Ensure user is logged in for best results
- Click "Show more" on description before saving

---

## Indeed

**Parser:** `indeed.ts`
**Detection:** URLs containing `indeed.com`, `indeed.co.uk`, `indeed.ca`, etc.

### Known Limitations

- **403 errors** - Indeed sometimes blocks extension access
- **Sponsored listings** - May have different structure
- **Job preview panels** - Side panel previews vs. full page views differ
- **Regional variations** - Class names may differ between indeed.com and regional sites

### What Works Well

- Uses `data-testid` attributes consistently (most reliable)
- Job title, company, location extraction
- Salary information when displayed

### What May Fail

- Full description from preview panel (may be truncated)
- Logo extraction (often placeholder images)

### Tips

- Click through to full job page for best extraction
- Indeed has good JSON-LD support - we leverage this

---

## Greenhouse

**Parser:** `greenhouse.ts`
**Detection:** URLs containing `greenhouse.io`

### Known Limitations

- **Remix framework** - Uses dynamic CSS classes like `.remix-css-*`
- **No standard structure** - Companies customize their Greenhouse boards
- **Company name** - Often only in logo alt text or meta tags

### What Works Well

- JSON-LD JobPosting data (many Greenhouse boards include this)
- Job title from h1 elements
- Meta tag extraction for company name

### What May Fail

- Direct CSS class selectors (classes are hashed)
- Location if not in JSON-LD
- Salary (rarely displayed)

### Tips

- JSON-LD is our primary strategy - if a Greenhouse board doesn't include it, results may be limited
- Company name often extracted from URL pattern: `boards.greenhouse.io/{company}`

---

## Lever

**Parser:** `lever.ts`
**Detection:** URLs containing `lever.co`

### Known Limitations

- **Consistent but basic** - Lever has simpler job pages than others
- **Salary never shown** - Lever doesn't display salary on job postings
- **Team/department info** - May not be present

### What Works Well

- `.posting-headline` selectors are stable
- Location in `.posting-categories`
- Description in `.posting-description`
- `data-qa` attributes available

### What May Fail

- Salary (never available)
- Company logo (depends on company setup)

### Tips

- Lever is one of the more reliable parsers
- Company name often extracted from URL: `jobs.lever.co/{company}`

---

## Workday

**Parser:** `workday.ts`
**Detection:** URLs containing `myworkdayjobs.com`, `workday.com`

### Known Limitations

- **HIGHLY VARIABLE** - Each company customizes their Workday instance significantly
- **Dynamic content** - Heavy JavaScript rendering
- **Multiple subdomains** - `wd1.`, `wd5.`, etc.
- **Company-specific CSS** - No universal selectors

### What Works Well

- `data-automation-id` attributes (when present)
- Company name extraction from URL subdomain
- Basic title/description when standard Workday layout is used

### What May Fail

- Highly customized implementations
- Logo extraction
- Location formatting
- Salary (rarely displayed)

### Tips

- Results vary significantly by company
- Use manual entry for heavily customized Workday sites
- Confidence score is automatically reduced for Workday

---

## Glassdoor

**Parser:** `glassdoor.ts`
**Detection:** URLs containing `glassdoor.com` with `/job-listing/` or `/Job/`

### Known Limitations

- **Login walls** - Some content hidden without login
- **Partner listings** - Third-party embedded jobs may differ
- **Hashed CSS classes** - Like `.css-1abc123`
- **Salary estimates vs. actual** - Shows estimates, not actual salary

### What Works Well

- `data-test` attributes (when present)
- Job title and company extraction
- Glassdoor ratings integration
- Salary estimates

### What May Fail

- Full job description (may be behind login)
- Company logo
- Actual salary (only shows estimates)

### Tips

- Being logged in helps with extraction
- Use `data-test` selectors when available

---

## Wellfound (AngelList)

**Parser:** `wellfound.ts`
**Detection:** URLs containing `wellfound.com` or `angel.co` with `/jobs/` or `/role/`

### Known Limitations

- **Hashed CSS classes** - Uses `styles_*` pattern that changes
- **Startup focus** - May show equity instead of/alongside salary
- **Rebranding** - Some URLs still use `angel.co`

### What Works Well

- `data-test` attributes
- Pattern matching for job title, company
- Equity extraction

### What May Fail

- Specific CSS class selectors
- Company logo (startup logos vary)

### Tips

- Wellfound often shows equity - we combine this with salary
- Confidence may be lower due to varied layouts

---

## Generic Parser (Fallback)

**Parser:** `generic.ts`
**Detection:** Always matches (used when no specific parser matches)

### Strategy

Uses 6 extraction strategies in order:

1. **JSON-LD structured data** - Looks for JobPosting schema
2. **Meta tags** - OpenGraph, Twitter Cards, standard meta
3. **Common CSS patterns** - `[class*="job-title"]`, `[class*="company"]`
4. **Heading hierarchy** - Analyzes h1/h2/h3 content for job keywords
5. **Page title parsing** - Extracts from patterns like "Title at Company"
6. **Full page salary scan** - Regex search for salary patterns

### Confidence Penalty

Generic parser applies a 15-30% confidence penalty since extraction is less reliable.

### Best For

- Company career pages
- Unknown job boards
- Single-job landing pages

---

## Testing Checklist

When testing parsers on real pages:

### Per Site Verification

- [ ] Title extracted correctly
- [ ] Company name extracted correctly
- [ ] Location extracted (if present on page)
- [ ] Salary extracted (if present on page)
- [ ] Description has reasonable content
- [ ] Logo URL valid (or Clearbit fallback used)
- [ ] Confidence score seems accurate
- [ ] No JavaScript console errors

### Cross-Site Comparison

| Site | Title | Company | Location | Salary | Description | Confidence |
|------|-------|---------|----------|--------|-------------|------------|
| LinkedIn | - | - | - | - | - | - |
| Indeed | - | - | - | - | - | - |
| Greenhouse | - | - | - | - | - | - |
| Lever | - | - | - | - | - | - |
| Workday | - | - | - | - | - | - |
| Glassdoor | - | - | - | - | - | - |
| Wellfound | - | - | - | - | - | - |

---

## Debugging Tips

### Check Which Parser Was Used

The `source` field in scraped data indicates which parser:
- `linkedin`, `indeed`, `greenhouse`, `lever`, `workday`, `glassdoor`, `wellfound`
- `generic` - fallback parser was used

### Low Confidence Score

If confidence is low (< 0.5):
1. Check if JSON-LD is available (inspect page source for `application/ld+json`)
2. Try manual entry mode
3. Check if site requires login

### No Data Extracted

1. Is the page a job posting or a search results page?
2. Is content behind a login wall?
3. Does the page use heavy JavaScript rendering?
4. Check browser console for errors

### Updating Selectors

If a parser stops working:
1. Inspect the page to find current selectors
2. Prioritize `data-*` attributes over class names
3. Use pattern matching `[class*="keyword"]` over exact classes
4. Test on 5+ different job listings from that site
5. Update this document with findings

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-02-13 | Added JSON-LD extraction to all parsers, removed hashed CSS classes, improved fallback patterns |
| 1.0.0 | 2026-01-xx | Initial parsers with CSS class-based extraction |
