# V2 Production Quality & Polish

**Parent:** [V2_OVERVIEW.md](./V2_OVERVIEW.md)  
**Branches:** `fix/accessibility`, `fix/performance`, `fix/scraper-testing`, `fix/keyword-compare`  
**Priority:** CRITICAL  
**Estimated Effort:** 1 week  
**Last Updated:** 2026-02-12 (post-audit)

---

## Overview

Based on the V1 audit, most "bugfix" items are already done. This doc focuses on the **actual remaining work** needed for production quality.

---

## 1. Accessibility (CRITICAL)

**Branch:** `fix/accessibility`  
**Effort:** 3-4 days  
**Status:** 0% complete

### 1.1 Keyboard Navigation
- [ ] Audit all interactive elements for Tab reachability
- [ ] Ensure logical tab order (left→right, top→bottom)
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes modals and panels
- [ ] Arrow keys navigate within lists/grids
- [ ] Keyboard shortcuts work on all pages (including Connections)

### 1.2 Focus Management
- [ ] Add visible focus rings (2px, primary color)
```css
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
:focus:not(:focus-visible) {
  outline: none;
}
```
- [ ] Focus trap in modals (Tab cycles within modal)
- [ ] Focus returns to trigger element when modal closes
- [ ] Focus moves to panel when slide-over opens

### 1.3 Screen Reader Support
- [ ] Add `aria-label` to all icon-only buttons
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Form inputs have associated labels
- [ ] Dynamic content changes announced (`aria-live`)
- [ ] Status badges have text alternatives

### 1.4 Visual Accessibility
- [ ] Verify WCAG AA contrast (4.5:1 text, 3:1 UI)
- [ ] Don't rely solely on color (add icons/text)
- [ ] Add `prefers-reduced-motion` support
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Acceptance Criteria
- [ ] Lighthouse accessibility score > 90
- [ ] Can complete all tasks with keyboard only
- [ ] Screen reader can navigate and understand all content

---

## 2. Performance (CRITICAL)

**Branch:** `fix/performance`  
**Effort:** 2-3 days  
**Status:** 0% complete

### 2.1 Load Time
- [ ] Benchmark: Dashboard loads < 500ms with 50 postings
- [ ] Benchmark: Dashboard loads < 1000ms with 200 postings
- [ ] Defer non-critical JavaScript
- [ ] Lazy load images (company logos)

### 2.2 List Virtualization
- [ ] Install `@tanstack/react-virtual` or `react-window`
- [ ] Virtualize Kanban columns with 20+ cards
- [ ] Virtualize List view
- [ ] Virtualize Connections list

### 2.3 Render Optimization
- [ ] Debounce search input (already 200ms, verify)
- [ ] Debounce filter changes
- [ ] Memoize expensive computations (useMemo)
- [ ] Memoize callback functions (useCallback)
- [ ] Avoid unnecessary re-renders (React.memo where needed)

### 2.4 Memory
- [ ] Audit for memory leaks (Chrome DevTools)
- [ ] Clean up event listeners on unmount
- [ ] Verify storage usage is reasonable

### Acceptance Criteria
- [ ] Dashboard loads < 500ms (empty to interactive)
- [ ] Smooth scrolling with 200+ postings (60fps)
- [ ] No memory leaks after 30 minutes of use

---

## 3. Scraper Testing

**Branch:** `fix/scraper-testing`  
**Effort:** 2 days  
**Status:** 0% complete (parsers exist, untested on real pages)

### 3.1 Test Matrix

| Site | Test Pages | Pass | Notes |
|------|------------|------|-------|
| LinkedIn | 5+ job pages | ☐ | Test Easy Apply vs standard |
| Indeed | 5+ job pages | ☐ | Test sponsored vs organic |
| Greenhouse | 3+ job pages | ☐ | Test boards.greenhouse.io |
| Lever | 3+ job pages | ☐ | Test jobs.lever.co |
| Workday | 3+ job pages | ☐ | Test *.myworkdayjobs.com |
| Glassdoor | 3+ job pages | ☐ | Test job-listing pages |
| Wellfound | 3+ job pages | ☐ | Test wellfound.com/jobs |
| Generic | 5+ random pages | ☐ | Test company career pages |

### 3.2 Test Checklist Per Parser
For each site, verify:
- [ ] Title extracted correctly
- [ ] Company name extracted correctly
- [ ] Location extracted (if present)
- [ ] Salary extracted (if present)
- [ ] Description extracted (reasonable length)
- [ ] Logo URL extracted (if present)
- [ ] Confidence score seems accurate
- [ ] No JavaScript errors in console

### 3.3 Document Limitations
Create `docs/SCRAPER_NOTES.md`:
```markdown
# Scraper Known Limitations

## LinkedIn
- Requires being logged in
- Some fields behind "Show more" not captured
- Easy Apply jobs may have different structure

## Indeed
- Sponsored listings may vary
- Salary not always in consistent location

## Workday
- Highly variable between companies
- May need company-specific adjustments

...
```

### 3.4 Fix Edge Cases
- [ ] Handle missing fields gracefully (no crashes)
- [ ] Handle timeout (5s max wait)
- [ ] Handle dynamic content (retry once)
- [ ] Improve generic parser for unknown sites

---

## 4. Keyword Comparison (Feature Completion)

**Branch:** `fix/keyword-compare`  
**Effort:** 2-3 days  
**Status:** 0% complete (extraction exists, comparison doesn't)

### 4.1 Multi-Select Mode
- [ ] Add checkbox to PostingCard (visible on hover or always?)
- [ ] Track selected posting IDs in state
- [ ] Show selection count: "3 selected"
- [ ] Add "Compare Keywords" button when 2+ selected
- [ ] Add "Clear Selection" button

### 4.2 CompareKeywordsModal
```
┌────────────────────────────────────────────────────────────────┐
│ Compare Keywords (3 postings)                             [X]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Common Keywords (appear in 2+ postings)                        │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Python         ████████████ 3/3    Required skill         │ │
│ │ AWS            ████████░░░░ 2/3    Required skill         │ │
│ │ Communication  ████████░░░░ 2/3    Soft skill             │ │
│ │ React          ████████░░░░ 2/3    Required skill         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ 💡 Focus on these skills - they're in high demand              │
│                                                                │
│ Unique to Each Posting                                         │
│ • Anthropic SWE: Kubernetes, Terraform, Go                     │
│ • Google PM: Product sense, A/B testing                        │
│ • Meta Engineer: GraphQL, Real-time systems                    │
│                                                                │
│                                              [Done]            │
└────────────────────────────────────────────────────────────────┘
```

### 4.3 Comparison Logic
```typescript
interface ComparisonResult {
  common: {
    keyword: ExtractedKeyword;
    count: number;      // How many postings have it
    postings: string[]; // Which posting IDs
  }[];
  unique: {
    postingId: string;
    postingTitle: string;
    keywords: ExtractedKeyword[];
  }[];
}

function compareKeywords(postings: Posting[]): ComparisonResult {
  // Count keyword occurrences across postings
  // Group by term (case-insensitive)
  // Common = appears in 2+ postings
  // Unique = appears in only 1 posting
}
```

### 4.4 Optional: Keywords on PostingCard
- [ ] Show top 2-3 keywords as tags (e.g., `[Python] [AWS]`)
- [ ] Only show for postings with keywords extracted
- [ ] Click tag → filters by that skill?

---

## 5. Minor UI Polish

**Branch:** `fix/ui-polish` (or include in other branches)  
**Effort:** 0.5-1 day

### Already Done (per audit)
- ✅ Drag-and-drop working
- ✅ Collapsible columns
- ✅ Stale indicators
- ✅ Date color coding
- ✅ Empty states
- ✅ Loading states

### Remaining Polish
- [ ] PostingCard: Add keyword coverage bar (optional)
- [ ] KanbanColumn: Smoother reorder animations
- [ ] Table: Resizable columns (nice-to-have, can defer)
- [ ] Remove any red highlight on detail panel (use gray)

---

## Implementation Order

1. **Accessibility** - Most critical for production quality
2. **Performance** - Essential for good UX
3. **Scraper Testing** - Verify core functionality works
4. **Keyword Comparison** - Completes Phase 5

---

## Checklist Summary

### Must Have for V2 Release
- [ ] Lighthouse accessibility > 90
- [ ] Full keyboard navigation
- [ ] Dashboard loads < 500ms
- [ ] Virtualized lists for 200+ items
- [ ] All parsers tested on real pages
- [ ] Keyword comparison modal

### Nice to Have (Can Defer)
- [ ] Keywords on PostingCard
- [ ] Resizable table columns
- [ ] Scraper debug tools

---

## Testing Checklist

### Accessibility Testing
- [ ] Navigate entire app with keyboard only
- [ ] Test with macOS VoiceOver
- [ ] Run Lighthouse accessibility audit
- [ ] Run axe DevTools extension
- [ ] Verify color contrast with contrast checker

### Performance Testing
- [ ] Create test dataset with 200 postings
- [ ] Measure initial load time
- [ ] Measure scroll performance (FPS)
- [ ] Monitor memory over 30 minutes
- [ ] Test on slower hardware (throttle CPU in DevTools)

### Cross-Browser Testing
- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if possible)