# JobFlow Extension - Remaining Items to Complete

**Last Updated:** 2026-02-12
**Status Overview:** Phases 1-3 Complete | Phase 4-5 Not Started | Phase 6 ~60% Complete

---

## Quick Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Foundation (React/TypeScript Migration) | COMPLETE |
| Phase 2 | Core Interaction Polish | COMPLETE |
| Phase 3 | Scraper Robustness | COMPLETE (testing only) |
| Phase 4 | Connections Integration | NOT STARTED |
| Phase 5 | Keyword Analysis | NOT STARTED |
| Phase 6 | Visual Design & Final Polish | ~60% Complete |

---

## Phase 3: Scraper - Final Testing (Minor)

Only Section 4.7 remains:
- [ ] S7.1 - Test all parsers on real job pages
- [ ] S7.2 - Document known limitations per site
- [ ] S7.3 - Add debug tools for development
- [ ] S7.4 - Fix edge cases discovered in testing
- [ ] S7.5 - Update CLAUDE.md with parser patterns

---

## Phase 4: Connections Integration (NOT STARTED)

**Estimated Effort:** 1.5-2 weeks

### 4.1 Data Model Updates
- [ ] C1.1 - Update Connection interface with new fields (email, linkedInUrl, relationshipType, relationshipStrength, howWeMet, contactHistory)
- [ ] C1.2 - Create ContactEvent interface
- [ ] C1.3 - Update storage service for connections
- [ ] C1.4 - Create migration for existing connections (add defaults)
- [ ] C1.5 - Add connections to export/import

### 4.2 Connections Management Page
- [ ] C2.1 - Create ConnectionsList component
- [ ] C2.2 - Create ConnectionCard component
- [ ] C2.3 - Add search and filtering
- [ ] C2.4 - Add "follow-up due" indicator
- [ ] C2.5 - Create routing/navigation to connections page

### 4.3 Add/Edit Connection Modal
- [ ] C3.1 - Create ConnectionFormModal component
- [ ] C3.2 - Add all form fields with validation
- [ ] C3.3 - Add relationship type selector
- [ ] C3.4 - Add relationship strength selector
- [ ] C3.5 - Add posting link selector
- [ ] C3.6 - Handle create and edit modes

### 4.4 Connection Detail View
- [ ] C4.1 - Create ConnectionDetailPanel component
- [ ] C4.2 - Display all connection info
- [ ] C4.3 - Add contact history section
- [ ] C4.4 - Add "Log Contact" functionality
- [ ] C4.5 - Show linked postings
- [ ] C4.6 - Add follow-up date management

### 4.5 Posting Integration
- [ ] C5.1 - Add connections section to PostingDetailPanel
- [ ] C5.2 - Create ConnectionBadge for PostingCard
- [ ] C5.3 - Create QuickLinkModal with search
- [ ] C5.4 - Add smart suggestions (same company)
- [ ] C5.5 - Update posting when connections linked/unlinked

### 4.6 Filtering
- [ ] C6.1 - Add "Has connections" filter
- [ ] C6.2 - Add "Needs networking" filter
- [ ] C6.3 - Add "Follow-up due" filter
- [ ] C6.4 - Update filter UI in dashboard header

### 4.7 Polish
- [ ] C7.1 - Test bidirectional linking
- [ ] C7.2 - Handle edge cases (delete connection, delete posting)
- [ ] C7.3 - Add empty states
- [ ] C7.4 - Ensure export/import includes connections properly

---

## Phase 5: Keyword Analysis (NOT STARTED)

**Estimated Effort:** 1.5-2 weeks

### 5.1 Extraction Engine
- [ ] K1.1 - Create keyword extraction service
- [ ] K1.2 - Build comprehensive skill/tool dictionary
- [ ] K1.3 - Implement pattern matching for experience/education
- [ ] K1.4 - Add importance scoring logic
- [ ] K1.5 - Add context extraction (surrounding text)
- [ ] K1.6 - Create deduplication and sorting

### 5.2 Data Model & Storage
- [ ] K2.1 - Add keywords field to Posting interface
- [ ] K2.2 - Update storage service
- [ ] K2.3 - Add keywords to export/import
- [ ] K2.4 - Create migration for existing postings (extract on demand)

### 5.3 Keywords Panel UI
- [ ] K3.1 - Create KeywordsPanel component
- [ ] K3.2 - Create KeywordCategory section component
- [ ] K3.3 - Create KeywordItem with checkbox
- [ ] K3.4 - Add importance indicator (dots)
- [ ] K3.5 - Add coverage progress bar
- [ ] K3.6 - Implement "addressed" toggle with persistence

### 5.4 Context Popover
- [ ] K4.1 - Create KeywordContextPopover component
- [ ] K4.2 - Highlight keyword in context snippets
- [ ] K4.3 - Handle keywords with many occurrences

### 5.5 Auto-Extraction Integration
- [ ] K5.1 - Add extraction call after posting save
- [ ] K5.2 - Add "Refresh" button to re-extract
- [ ] K5.3 - Handle extraction errors gracefully
- [ ] K5.4 - Add loading state during extraction

### 5.6 Card Integration
- [ ] K6.1 - Add top keywords as auto-tags on card
- [ ] K6.2 - Optional: Add coverage indicator to card
- [ ] K6.3 - Ensure performance with many postings

### 5.7 Comparison Feature
- [ ] K7.1 - Add multi-select mode to dashboard
- [ ] K7.2 - Create CompareKeywordsModal
- [ ] K7.3 - Implement comparison logic
- [ ] K7.4 - Display common and unique keywords

### 5.8 Polish
- [ ] K8.1 - Performance testing with long descriptions
- [ ] K8.2 - Fine-tune skill dictionary
- [ ] K8.3 - Add empty states
- [ ] K8.4 - Test export/import with keywords

---

## Phase 6: Visual Design - Remaining Items

### 6.4 Component Visual Refresh (Remaining)
- [ ] PostingCard: Keyword match progress bar
- [ ] PostingCard: Star rating display
- [ ] KanbanColumn: Smooth reorder animations
- [ ] Table: Resizable columns
- [ ] Table: Checkbox selection with count display
- [ ] List View: Expandable row details

### 6.8 Onboarding Flow (NOT STARTED)
- [ ] Step 1: Welcome screen
- [ ] Step 2: Save Your First Job
- [ ] Step 3: Track Progress
- [ ] Step 4: Ready!
- [ ] Detect first-time users
- [ ] Store onboarding completion in storage
- [ ] Add progress indicators (dots)
- [ ] Skip option for returning users
- [ ] First drag hint tooltip
- [ ] First export hint
- [ ] Keyboard shortcuts hint (press ?)
- [ ] Dismissable with "Got it" button

### 6.9 Dark Mode (NOT STARTED)
- [ ] Define dark color palette
- [ ] Create `useTheme` hook
- [ ] Add `data-theme` attribute to root
- [ ] Define dark mode CSS variables
- [ ] Update all components for dark mode support
- [ ] Add toggle in header/settings
- [ ] Sun/moon icon toggle
- [ ] Persist preference to localStorage
- [ ] Respect system preference on first visit

### 6.10 Accessibility (NOT STARTED)
- [ ] Audit all interactive elements
- [ ] Add proper tabindex
- [ ] Implement keyboard shortcuts
- [ ] Focus trap in modals
- [ ] Visible focus rings (2px Flat Red outline)
- [ ] Remove focus for mouse users (:focus-visible)
- [ ] Focus return after modal close
- [ ] Add aria-labels to icons
- [ ] Proper form labels
- [ ] Announce dynamic content changes
- [ ] Meaningful alt text
- [ ] Verify WCAG AA contrast (4.5:1 text, 3:1 UI)
- [ ] Add prefers-reduced-motion support
- [ ] Don't rely solely on color for meaning

### 6.12 Performance & Final Polish (NOT STARTED)
- [ ] Dashboard load < 500ms
- [ ] Smooth scrolling with 200+ postings
- [ ] Lazy load images
- [ ] Virtualize long lists
- [ ] Memory leak audit
- [ ] Cross-browser testing (Chrome, Firefox, Edge, Safari)
- [ ] Address any visual glitches
- [ ] Fix edge cases
- [ ] Test all user flows end-to-end

---

## UI Ideas & Future Enhancements

From ui_todo.md:

### High Priority
- [ ] Keyboard shortcuts need to work everywhere (including connections page)
- [ ] Get rid of the red highlight when on a detail of a posting (use gray shade instead)
- [ ] Consider making "in-progress" a tag/mark on saved, not a separate column

### Medium Priority
- [ ] Compare action words from job description with user's resume to highlight optimization opportunities
- [ ] Update scraping/keyword function to get technical and action words
- [ ] Connection form: Add initial contact field

### Lower Priority / Future
- [ ] Get profile image from LinkedIn for connections
- [ ] Graph view or card view for connections where people can be moved around and connected to each other
- [ ] Kanban: Add slight tab with right arrows to stay continuous with side tabs

---

## Recommended Implementation Order

1. **Phase 3 Testing** - Quick win, finish remaining testing
2. **Phase 6 Accessibility** - Important for production quality
3. **Phase 6 Performance** - Essential for good UX
4. **Phase 4 Connections** - Major feature addition
5. **Phase 5 Keywords** - Major feature addition
6. **Phase 6 Dark Mode** - Nice to have
7. **Phase 6 Onboarding** - Nice to have for new users

---

## Files Archived

The following completed documentation has been moved to `docs/archive/`:
- `phase1spec.md` - Foundation (COMPLETE)
- `phase2spec.md` - Core Interaction Polish (COMPLETE)
- `ui-fixes-plan.md` - UI fixes tracking (COMPLETE)
- `UI_specs.md` - Original design reference (superseded by phase6spec)
