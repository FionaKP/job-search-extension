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
- [ ] Create CSS variables for all color tokens (base + light/dark variants)
- [ ] Define typography scale (Inter font family)
- [ ] Define spacing scale (4px base unit)
- [ ] Define border radius tokens
- [ ] Define shadow tokens
- [ ] Define transition/animation tokens

### 6.1.2 Tailwind Configuration
- [ ] Update `tailwind.config.js` with design tokens
- [ ] Add custom color palette
- [ ] Configure typography plugin
- [ ] Add animation utilities

### 6.1.3 Base Component Styles
- [ ] Create `.btn` base styles (primary, secondary, ghost, success)
- [ ] Create `.input` base styles with focus states
- [ ] Create `.card` base styles with hover effects
- [ ] Create `.badge` styles for status indicators

---

## Phase 6.2: Pipeline/Roadmap View

### 6.2.1 Pipeline Component
Create horizontal stage progression display:

```
BOOKMARKED → APPLYING → APPLIED → INTERVIEWING → NEGOTIATING → ACCEPTED
```

**Tasks:**
- [ ] Create `PipelineBar` component
- [ ] Implement stage counts with badges
- [ ] Add click-to-filter functionality
- [ ] Style with vintage palette colors
- [ ] Make sticky/fixed on scroll
- [ ] Add active stage highlighting

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
- [ ] Apply Native Wine (#4F243E) background
- [ ] Champagne Brown (#E9C593) icons for contrast
- [ ] Flat Red (#CA423B) active state
- [ ] Pandora (#E68342) hover state
- [ ] Off-white (#F5F5F5) text

### 6.3.2 Navigation Items
- [ ] Add icon-based navigation items
- [ ] Implement expandable/collapsible behavior
- [ ] Add tooltip labels on collapsed state
- [ ] Create smooth expand/collapse animation

---

## Phase 6.4: Component Visual Refresh

### 6.4.1 PostingCard Redesign
**Changes:**
- [ ] Increase logo size (48x48 → 64x64)
- [ ] Add softer shadows and rounded corners
- [ ] Status color as subtle left border accent
- [ ] Smoother hover state with lift effect
- [ ] Better tag spacing
- [ ] Keyword match progress bar
- [ ] Star rating display

### 6.4.2 KanbanColumn Redesign
**Changes:**
- [ ] Header with colored dot + count (not full background)
- [ ] More whitespace between cards
- [ ] Ghost "add" button at column bottom
- [ ] Drop zone highlight on drag
- [ ] Smooth reorder animations

### 6.4.3 DetailPanel Redesign
**Changes:**
- [ ] Tabbed interface (Overview, Keywords, Connections, Notes)
- [ ] Better visual hierarchy
- [ ] Inline status/priority editing
- [ ] Softer dividers
- [ ] Sticky header on scroll
- [ ] Action buttons at bottom

### 6.4.4 Popup Redesign
**Changes:**
- [ ] Cleaner header with Native Wine background
- [ ] Scrape confidence indicator
- [ ] Better form styling with Champagne Brown accents
- [ ] Prominent save button (Flat Red)
- [ ] Tighter recent jobs list
- [ ] Settings/dashboard quick links

### 6.4.5 Form Elements
- [ ] Update all inputs with design system styles
- [ ] Add focus states with Flat Red ring
- [ ] Style select dropdowns
- [ ] Update checkbox/radio styles
- [ ] Add form validation styling

### 6.4.6 Buttons
- [ ] Primary CTA: Flat Red background
- [ ] Secondary: Light Champagne Brown + Pumpkin Seed border
- [ ] Success: Classic Blue-green
- [ ] Ghost: Transparent with hover background
- [ ] Add press/active scale effect

### 6.4.7 Modals
- [ ] Update modal backgrounds and borders
- [ ] Add slide-in/fade animations
- [ ] Consistent header/footer styling
- [ ] Close button with proper states

---

## Phase 6.5: Data Grid/Table Improvements

### 6.5.1 Table Styling
- [ ] Light Champagne Brown (#F5EDD8) header background
- [ ] Native Wine (#4F243E) header text
- [ ] White row background with hover state (#FAF7F0)
- [ ] Pumpkin Seed borders
- [ ] Optional striped rows

### 6.5.2 Table Features
- [ ] Sortable column headers with indicators
- [ ] Resizable columns
- [ ] Checkbox selection with count display
- [ ] Status badges in cells
- [ ] Horizontal scroll on small screens

### 6.5.3 List View Updates
- [ ] Compact layout styling
- [ ] Expandable row details
- [ ] Consistent with card styling

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
- [ ] Hover: translateY(-2px) + shadow increase
- [ ] Active: scale(0.98)
- [ ] Drag: rotate(3deg) + scale(1.02) + shadow

### 6.6.3 Panel Animations
- [ ] Slide-in from right for detail panel
- [ ] Fade backdrop on modal open
- [ ] Smooth height transitions

### 6.6.4 Button Animations
- [ ] Press: scale(0.98)
- [ ] Success flash on save
- [ ] Loading spinner integration

### 6.6.5 Drag & Drop
- [ ] Smooth card pickup effect
- [ ] Column drop zone highlight
- [ ] Reorder animation on drop

---

## Phase 6.7: Loading, Empty & Error States

### 6.7.1 Skeleton Loading
- [ ] Create skeleton component for cards
- [ ] Skeleton for table rows
- [ ] Skeleton for detail panel
- [ ] Shimmer animation effect

### 6.7.2 Empty States
Create illustrated empty states for:
- [ ] No postings yet
- [ ] No search results
- [ ] No connections
- [ ] No notes
- [ ] No keywords matched

### 6.7.3 Error States
- [ ] Error boundary with friendly message
- [ ] Form validation errors (Flat Red borders)
- [ ] Network error states
- [ ] Retry actions

### 6.7.4 Loading Indicators
- [ ] Subtle spinner for actions
- [ ] Progress bar for bulk operations
- [ ] Inline loading for saves

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
- [ ] Header: Native Wine background
- [ ] Body: Light Champagne Brown (#F5EDD8)
- [ ] Save button: Flat Red (#CA423B)
- [ ] Accent line: Pandora (#E68342)

### 6.11.2 Extension Features
- [ ] Scrape confidence indicator
- [ ] Already tracked indicator
- [ ] Recent saves list
- [ ] Quick link to dashboard
- [ ] Settings access

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
