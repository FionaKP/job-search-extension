# Phase 6 Implementation Roadmap
## Visual Design & Final Polish - Unified Plan

This roadmap combines the Phase 6 specifications with the UI design requirements into a structured implementation plan.

---

## Overview

**Goal:** Transform JobFlow from functional to polished with the vintage color palette, consistent design system, smooth interactions, and professional UI patterns.

**Key Themes:**
- Vintage color palette (Native Wine, Flat Red, Pandora, Champagne Brown, Pumpkin Seed, Classic Blue-green)
- Pipeline/roadmap view integration
- Component visual refresh
- Animations & micro-interactions
- Dark mode & accessibility

---

## Phase 6.1: Design System Foundation

### 6.1.1 CSS Custom Properties & Tokens
Create `/src/styles/design-system.css` with:

**Colors (Vintage Palette):**
```
Native Wine:     #4F243E  - Primary brand, sidebar, dark elements
Flat Red:        #CA423B  - CTAs, alerts, urgent status
Pandora:         #E68342  - Secondary accents, count badges, hover
Champagne Brown: #E9C593  - Light backgrounds, highlights
Pumpkin Seed:    #A2A77E  - Neutral accents, borders
Classic Blue-green: #3C9C9A - Success states, secondary CTAs
```

**Tasks:**
- [x] Create CSS variables for all color tokens (base + light/dark variants)
- [x] Define typography scale (Inter font family)
- [x] Define spacing scale (4px base unit)
- [x] Define border radius tokens
- [x] Define shadow tokens
- [x] Define transition/animation tokens

### 6.1.2 Tailwind Configuration
- [x] Update `tailwind.config.js` with design tokens
- [x] Add custom color palette
- [x] Configure typography plugin
- [x] Add animation utilities

### 6.1.3 Base Component Styles
- [x] Create `.btn` base styles (primary, secondary, ghost, success)
- [x] Create `.input` base styles with focus states
- [x] Create `.card` base styles with hover effects
- [x] Create `.badge` styles for status indicators

---

## Phase 6.2: Pipeline/Roadmap View

### 6.2.1 Pipeline Component
Create horizontal stage progression display:

```
BOOKMARKED → APPLYING → APPLIED → INTERVIEWING → NEGOTIATING → ACCEPTED
```

**Tasks:**
- [x] Create `PipelineBar` component
- [x] Implement stage counts with badges
- [x] Add click-to-filter functionality
- [x] Style with vintage palette colors
- [x] Make sticky/fixed on scroll
- [x] Add active stage highlighting

### 6.2.2 Stage Colors
| Stage | Color | Hex |
|-------|-------|-----|
| Bookmarked | Pandora | #E68342 |
| Applying | Champagne Brown | #E9C593 |
| Applied | Classic Blue-green | #3C9C9A |
| Interviewing | Flat Red | #CA423B |
| Negotiating | Pandora (darker) | #D67630 |
| Accepted | Blue-green (darker) | #2A8C8A |

---

## Phase 6.3: Sidebar Navigation Redesign

### 6.3.1 Visual Updates
- [x] Apply Native Wine (#4F243E) background
- [x] Champagne Brown (#E9C593) icons for contrast
- [x] Flat Red (#CA423B) active state
- [x] Pandora (#E68342) hover state
- [x] Off-white (#F5F5F5) text

### 6.3.2 Navigation Items
- [x] Add icon-based navigation items
- [x] Implement expandable/collapsible behavior
- [x] Add tooltip labels on collapsed state
- [x] Create smooth expand/collapse animation

---

## Phase 6.4: Component Visual Refresh

### 6.4.1 PostingCard Redesign
**Changes:**
- [x] Increase logo size (48x48 → 64x64 on wide columns)
- [x] Add softer shadows and rounded corners
- [x] Subtle selection highlight (champagne instead of red)
- [x] Smoother hover state with lift effect
- [x] Edit button on hover
- [x] Responsive layout based on column width
- [ ] Keyword match progress bar
- [ ] Star rating display

### 6.4.2 KanbanColumn Redesign
**Changes:**
- [x] Resizable columns (drag to widen/narrow)
- [x] Column widths persist to localStorage
- [x] Collapsed columns moved to right side as binder tabs
- [x] Drop zone highlight on drag
- [x] Header with colored dot + count (not full background)
- [x] Ghost "add" button at column bottom
- [ ] Smooth reorder animations

### 6.4.3 DetailPanel Redesign
**Changes:**
- [x] Tabbed interface (Overview, Keywords, Connections, Notes)
- [x] Better visual hierarchy
- [x] Inline status/priority editing
- [x] Softer dividers
- [x] Sticky header on scroll
- [x] Action buttons at bottom

### 6.4.4 Popup Redesign
**Changes:**
- [x] Cleaner header with Native Wine background
- [x] Scrape confidence indicator
- [x] Better form styling with Champagne Brown accents
- [x] Prominent save button (Flat Red)
- [x] Tighter recent jobs list
- [x] Settings/dashboard quick links

### 6.4.5 Form Elements
- [x] Update all inputs with design system styles
- [x] Add focus states with Flat Red ring
- [x] Style select dropdowns
- [x] Update checkbox/radio styles
- [x] Add form validation styling

### 6.4.6 Buttons
- [x] Primary CTA: Flat Red background
- [x] Secondary: Light Champagne Brown + Pumpkin Seed border
- [x] Success: Classic Blue-green
- [x] Ghost: Transparent with hover background
- [x] Add press/active scale effect
- [x] Migrated components to use .btn design system classes

### 6.4.7 Modals
- [x] Update modal backgrounds and borders
- [x] Add slide-in/fade animations
- [x] Consistent header/footer styling
- [x] Close button with proper states

---

## Phase 6.5: Data Grid/Table Improvements

### 6.5.1 Table Styling
- [x] Light Champagne Brown (#F5EDD8) header background
- [x] Native Wine (#4F243E) header text
- [x] White row background with hover state (#FAF7F0)
- [x] Pumpkin Seed borders
- [x] Optional striped rows

### 6.5.2 Table Features
- [x] Sortable column headers with indicators
- [ ] Resizable columns
- [ ] Checkbox selection with count display
- [x] Status badges in cells
- [x] Horizontal scroll on small screens

### 6.5.3 List View Updates
- [x] Compact layout styling
- [ ] Expandable row details
- [x] Consistent with card styling

---

## Phase 6.6: Animations & Micro-interactions

### 6.6.1 Transition Tokens
```css
--transition-fast: 100ms ease
--transition-base: 150ms ease
--transition-slow: 300ms ease
--transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1)
```

### 6.6.2 Card Animations
- [x] Hover: translateY(-2px) + shadow increase
- [x] Active: scale(0.98)
- [x] Drag: rotate(3deg) + scale(1.02) + shadow

### 6.6.3 Panel Animations
- [x] Slide-in from right for detail panel
- [x] Fade backdrop on modal open
- [x] Smooth height transitions

### 6.6.4 Button Animations
- [x] Press: scale(0.98)
- [x] Success flash on save
- [x] Loading spinner integration

### 6.6.5 Drag & Drop
- [x] Smooth card pickup effect
- [x] Column drop zone highlight
- [x] Reorder animation on drop

---

## Phase 6.7: Loading, Empty & Error States

### 6.7.1 Skeleton Loading
- [x] Create skeleton component for cards
- [x] Skeleton for table rows
- [x] Skeleton for detail panel
- [x] Shimmer animation effect

### 6.7.2 Empty States
Create illustrated empty states for:
- [x] No postings yet
- [x] No search results
- [x] No connections
- [x] No notes
- [x] No keywords matched

### 6.7.3 Error States
- [x] Error boundary with friendly message
- [x] Form validation errors (Flat Red borders)
- [x] Network error states
- [x] Retry actions

### 6.7.4 Loading Indicators
- [x] Subtle spinner for actions
- [x] Progress bar for bulk operations
- [x] Inline loading for saves

---

## Phase 6.8: Onboarding Flow

### 6.8.1 First-Time Experience
Create 4-step onboarding modal:
- [ ] Step 1: Welcome screen
- [ ] Step 2: Save Your First Job
- [ ] Step 3: Track Progress
- [ ] Step 4: Ready!

### 6.8.2 Implementation
- [ ] Detect first-time users
- [ ] Store onboarding completion in storage
- [ ] Add progress indicators (dots)
- [ ] Skip option for returning users

### 6.8.3 Feature Hints
- [ ] First drag hint tooltip
- [ ] First export hint
- [ ] Keyboard shortcuts hint (press ?)
- [ ] Dismissable with "Got it" button

---

## Phase 6.9: Dark Mode

### 6.9.1 Dark Color Palette
Define inverted/adjusted colors for dark mode:
- [ ] Dark backgrounds (near black, dark gray)
- [ ] Adjusted text colors for contrast
- [ ] Muted accent colors
- [ ] Preserved status colors with adjustments

### 6.9.2 Implementation
- [ ] Create `useTheme` hook
- [ ] Add `data-theme` attribute to root
- [ ] Define dark mode CSS variables
- [ ] Update all components for dark mode support

### 6.9.3 Theme Toggle
- [ ] Add toggle in header/settings
- [ ] Sun/moon icon toggle
- [ ] Persist preference to localStorage
- [ ] Respect system preference on first visit

---

## Phase 6.10: Accessibility

### 6.10.1 Keyboard Navigation
- [ ] Audit all interactive elements
- [ ] Add proper tabindex
- [ ] Implement keyboard shortcuts
- [ ] Focus trap in modals

### 6.10.2 Focus Management
- [ ] Visible focus rings (2px Flat Red outline)
- [ ] Remove focus for mouse users (:focus-visible)
- [ ] Focus return after modal close

### 6.10.3 Screen Reader Support
- [ ] Add aria-labels to icons
- [ ] Proper form labels
- [ ] Announce dynamic content changes
- [ ] Meaningful alt text

### 6.10.4 Color & Motion
- [ ] Verify WCAG AA contrast (4.5:1 text, 3:1 UI)
- [ ] Add prefers-reduced-motion support
- [ ] Don't rely solely on color for meaning

---

## Phase 6.11: Chrome Extension Polish

### 6.11.1 Popup Styling
- [x] Header: Native Wine background
- [x] Body: Light Champagne Brown (#F5EDD8)
- [x] Save button: Flat Red (#CA423B)
- [x] Accent line: Pandora (#E68342)

### 6.11.2 Extension Features
- [x] Scrape confidence indicator
- [x] Already tracked indicator
- [x] Recent saves list
- [x] Quick link to dashboard
- [x] Settings access

---

## Phase 6.12: Performance & Final Polish

### 6.12.1 Performance
- [ ] Dashboard load < 500ms
- [ ] Smooth scrolling with 200+ postings
- [ ] Lazy load images
- [ ] Virtualize long lists
- [ ] Memory leak audit

### 6.12.2 Cross-Browser Testing
- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if applicable)

### 6.12.3 Final Bug Fixes
- [ ] Address any visual glitches
- [ ] Fix edge cases
- [ ] Test all user flows end-to-end

---

## Implementation Order (Recommended)

| Order | Phase | Description | Effort |
|-------|-------|-------------|--------|
| 1 | 6.1 | Design System Foundation | Medium |
| 2 | 6.4.5-6.4.7 | Form/Button/Modal Base Styles | Medium |
| 3 | 6.2 | Pipeline/Roadmap View | Medium |
| 4 | 6.3 | Sidebar Navigation | Small |
| 5 | 6.4.1 | PostingCard Redesign | Medium |
| 6 | 6.4.2 | KanbanColumn Redesign | Medium |
| 7 | 6.5 | Data Grid/Table | Medium |
| 8 | 6.4.3 | DetailPanel Redesign | Large |
| 9 | 6.6 | Animations | Medium |
| 10 | 6.7 | Loading/Empty/Error States | Medium |
| 11 | 6.4.4, 6.11 | Popup/Extension Polish | Medium |
| 12 | 6.8 | Onboarding | Medium |
| 13 | 6.9 | Dark Mode | Large |
| 14 | 6.10 | Accessibility | Medium |
| 15 | 6.12 | Performance & Final Polish | Medium |

---

## Acceptance Criteria

### Visual Quality
- [ ] Consistent spacing throughout (4px base)
- [ ] Consistent typography hierarchy
- [ ] All colors from vintage palette
- [ ] No visual glitches or misalignments

### Interactions
- [ ] All animations smooth (60fps)
- [ ] Hover states on all interactive elements
- [ ] Loading states prevent double-actions
- [ ] Feedback for all user actions

### Dark Mode
- [ ] All screens work in dark mode
- [ ] No contrast issues
- [ ] Theme persists across sessions

### Accessibility
- [ ] Full keyboard navigation
- [ ] Screen reader compatible
- [ ] WCAG AA compliant

### Performance
- [ ] Dashboard loads < 500ms
- [ ] Smooth scrolling with 200+ postings
- [ ] No memory leaks

---

## Definition of Done

Phase 6 is complete when:
1. ✅ Design system fully implemented with vintage palette
2. ✅ Pipeline/roadmap view integrated
3. ✅ All components visually refreshed
4. ✅ Sidebar navigation redesigned
5. ✅ Animations smooth and purposeful
6. ✅ Empty, loading, error states in place
7. ✅ Onboarding flow complete
8. ✅ Dark mode fully working
9. ✅ Accessibility audit passed
10. ✅ Performance optimized
11. ✅ Extension popup polished
12. ✅ All bugs fixed
