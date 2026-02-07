# Phase 6 Specification: Visual Design & Final Polish
## JobFlow Chrome Extension

**Goal:** Transform JobFlow from functional to polished with consistent design, smooth interactions, and delightful details.

**Timeline:** 2-3 weeks (solo developer)

**Predecessor:** Phase 5 complete (keyword analysis)

---

## 1. Scope Summary

### In Scope
- Design system (colors, typography, spacing, components)
- Visual refresh of all existing components
- Animations and micro-interactions
- Empty, loading, and error states
- Onboarding flow for new users
- Dark mode support
- Accessibility audit and fixes
- Performance optimization
- Final bug fixes and edge cases

### Out of Scope (Future)
- Mobile companion app
- Additional integrations
- New features

---

## 2. Design System

### 2.1 Color Palette

JobFlow Color Palette - Vintage Vibes Edition
PRIMARY COLOR PALETTE
Color NameHexRGBUsageNative Wine#4F243E(79, 36, 62)Primary brand color, sidebar, logo accents, dark elementsFlat Red#CA423B(202, 66, 59)Primary CTAs, alerts, urgent status, highlightsPandora#E68342(230, 131, 66)Secondary accents, count badges, hover statesChampagne Brown#E9C593(233, 197, 147)Light backgrounds, subtle highlights, progress barsPumpkin Seed#A2A77E(162, 167, 126)Neutral accents, borders, secondary UI elementsClassic Blue-green#3C9C9A(60, 156, 154)Success states, stage completion, secondary CTAs

DETAILED COLOR ASSIGNMENTS
Sidebar Navigation

Background: Native Wine (#4F243E)
Icon color: Champagne Brown (#E9C593) - creates nice contrast
Active state: Flat Red (#CA423B) with slight background highlight
Hover state: Pandora (#E68342)
Text: Off-white (#F5F5F5)

Pipeline/Roadmap Bar (At Top)

Stage background (default): Light Champagne Brown (#F0E8D8 - lightened version)
Stage background (active): Flat Red (#CA423B)
Count badge (BOOKMARKED): Pandora (#E68342) with white text
Stage text: Native Wine (#4F243E)
Dividers between stages: Pumpkin Seed (#A2A77E)

Main Header/Branding

Logo accent: Native Wine (#4F243E) or Flat Red (#CA423B)
Page title: Native Wine (#4F243E)

Buttons
Primary CTA (Add a New Job)

Background: Flat Red (#CA423B)
Text: White (#FFFFFF)
Hover: Darker red (use RGB 178, 56, 50 - darkened version)
Active: Even darker (RGB 140, 40, 35)
Icon: White

Secondary Buttons (Columns, Menu)

Background: Light Champagne Brown (#F5EDD8)
Border: Pumpkin Seed (#A2A77E)
Text: Native Wine (#4F243E)
Hover: Pandora (#E68342)

Success Actions (Save, Accept)

Background: Classic Blue-green (#3C9C9A)
Text: White (#FFFFFF)
Hover: Darker teal (RGB 45, 130, 128)

Status Badges & Pipeline
StatusColorHexNotesBookmarkedPandora#E68342Warm, invitingApplyingChampagne Brown#E9C593Light, hopefulAppliedClassic Blue-green#3C9C9ACool, neutralInterviewingFlat Red#CA423BAttention-grabbingNegotiatingPandora (darker)#D67630Active engagementAcceptedClassic Blue-green (darker)#2A8C8ASuccess!
Data Grid/Table

Header background: Light Champagne Brown (#F5EDD8)
Header text: Native Wine (#4F243E)
Row background: White (#FFFFFF)
Row hover: Very light Champagne Brown (#FAF7F0)
Borders: Light gray with touch of Pumpkin Seed (#E8E8E8 or #E0DDD4)
Status badge background: Soft version of status color (e.g., light Pandora: #F5D7C3)
Striped rows (optional): Alternate white with #FEFDFB

Chrome Extension Popup

Header background: Native Wine (#4F243E)
Header text: Champagne Brown (#E9C593) or white
Main background: Light Champagne Brown (#F5EDD8)
Save button: Flat Red (#CA423B)
Details section: White background
Accent line: Pandora (#E68342)

Progress Indicators & Charts

Progress bar (incomplete): Pumpkin Seed (#A2A77E)
Progress bar (complete): Classic Blue-green (#3C9C9A)
Donut chart segments:

Resume Structure: Flat Red (#CA423B)
Measurable Results: Pandora (#E68342)
Keyword Usage: Classic Blue-green (#3C9C9A)



Backgrounds

Page background: Off-white (#F9F7F3)
Card background: White (#FFFFFF)
Subtle background (hover): Very light Champagne Brown (#F5EDD8)
Dark background sections: Native Wine (#4F243E)

Text

Primary text: Native Wine (#4F243E)
Secondary text: Pumpkin Seed (#A2A77E) or gray (#666666)
Disabled text: Light gray (#CCCCCC)
On dark backgrounds: Champagne Brown (#E9C593) or white

Borders & Dividers

Light border: Pumpkin Seed (#A2A77E) at 30% opacity
Subtle divider: Champagne Brown (#E9C593) at 20% opacity
Dark border: Native Wine (#4F243E) at 20% opacity

Interactive States
Hover States

Buttons: +10-15% brightness
Links: Underline with Pandora (#E68342)
Table rows: Light Champagne Brown background (#F5EDD8)
Sidebar items: Pandora (#E68342) with Native Wine background

Active/Focused States

Focus ring: Flat Red (#CA423B) with 2px border
Tab active indicator: Flat Red (#CA423B) underline
Selected checkbox: Flat Red (#CA423B)

Disabled States

Background: Very light gray (#E8E8E8)
Text: Light gray (#999999)
Border: Light gray (#CCCCCC)

Error States

Border: Flat Red (#CA423B)
Text: Flat Red (#CA423B)
Background: Light version of Flat Red (#F5DEDE or #FCEEEC)

Success States

Border: Classic Blue-green (#3C9C9A)
Text: Classic Blue-green (#3C9C9A)
Background: Light version of Blue-green (#E8F5F4 or #F0FEFE)

Warning/Alert States

Border: Pandora (#E68342)
Text: Pandora (#E68342)
Background: Light version of Pandora (#F5E8D8 or #FCF0E8)


COLOR VARIATION GUIDE
For lighter/darker versions of colors (for different accent needs):
Native Wine (#4F243E)

Lighter: #7A4A63 (add lightness)
Much lighter: #B896AA (for backgrounds)
Darker: #3A1A2E (for emphasis)

Flat Red (#CA423B)

Lighter: #E67A72 (for hover)
Much lighter: #F5DEDE (for backgrounds)
Darker: #8B2820 (for active/pressed)

Pandora (#E68342)

Lighter: #F0A56B (for hover)
Much lighter: #F5D7C3 (for backgrounds)
Darker: #C96E2A (for active/pressed)

Champagne Brown (#E9C593)

Lighter: #F0D9B4 (for subtle backgrounds)
Much lighter: #F5EDD8 (for section backgrounds)
Darker: #D4B07D (for emphasis)

Pumpkin Seed (#A2A77E)

Lighter: #C4C8A8 (for hover)
Much lighter: #E8E9DD (for backgrounds)
Darker: #7F8364 (for emphasis)

Classic Blue-green (#3C9C9A)

Lighter: #6BB9B7 (for hover)
Much lighter: #E8F5F4 (for backgrounds)
Darker: #2A6B6A (for active/pressed)


COLOR COMBINATIONS FOR HARMONY
Recommended Pairings:

Primary accent: Flat Red (#CA423B) with Native Wine (#4F243E) backgrounds
Success action: Classic Blue-green (#3C9C9A) with Champagne Brown backgrounds
Warm warning: Pandora (#E68342) with light Champagne Brown
Subtle accents: Pumpkin Seed (#A2A77E) with off-white backgrounds

Typography Color Combos:

Dark text on light: Native Wine on Champagne Brown = excellent contrast
Light text on dark: Champagne Brown on Native Wine = excellent contrast
Accent text: Flat Red or Pandora for emphasis


ACCESSIBILITY NOTES

Contrast ratio (WCAG AA): Native Wine + Champagne Brown ✅ Good (>4.5:1)
Contrast ratio (WCAG AA): Flat Red + white ✅ Good (>4.5:1)
Contrast ratio (WCAG AA): Pandora + Native Wine ✅ Acceptable (4.2:1)
Consider: Use text labels with colored badges for colorblind users
Don't rely solely on color to indicate status; use icons, text, and shapes too


USAGE SUMMARY TABLE
ElementPrimary ColorSecondaryAccentLogo/BrandNative Wine--SidebarNative Wine-PandoraPipeline barChampagne BrownFlat Red (active)PandoraPrimary CTAFlat Red--Success CTAClassic Blue-green--Status badges(see table)--Table headersChampagne BrownNative Wine-Table rowsWhite-Pumpkin Seed (border)LinksNative Wine-Pandora (hover)BackgroundsChampagne BrownOff-whiteNative WineBordersPumpkin Seed--ErrorFlat Red--SuccessClassic Blue-green--WarningPandora--

### 2.2 Typography

```css
:root {
  /* Font Family */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

**Typography Scale:**

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page title | text-2xl | semibold | neutral-900 |
| Section heading | text-lg | semibold | neutral-900 |
| Card title | text-base | medium | neutral-900 |
| Body text | text-sm | normal | neutral-700 |
| Secondary text | text-sm | normal | neutral-500 |
| Caption | text-xs | normal | neutral-500 |
| Button | text-sm | medium | varies |

### 2.3 Spacing

**Base unit:** 4px

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
}
```

### 2.4 Border Radius

```css
:root {
  --radius-sm: 0.25rem;   /* 4px - small elements */
  --radius-md: 0.5rem;    /* 8px - buttons, inputs */
  --radius-lg: 0.75rem;   /* 12px - cards */
  --radius-xl: 1rem;      /* 16px - modals */
  --radius-full: 9999px;  /* Pills, avatars */
}
```

### 2.5 Component Tokens

**Buttons:**
```css
.btn {
  height: 36px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all 150ms ease;
}

.btn-primary {
  background: var(--color-primary-500);
  color: white;
}
.btn-primary:hover { background: var(--color-primary-600); }
.btn-primary:active { background: var(--color-primary-700); }

.btn-secondary {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-200);
}

.btn-ghost {
  background: transparent;
  color: var(--color-neutral-600);
}
.btn-ghost:hover { background: var(--color-neutral-100); }
```

**Inputs:**
```css
.input {
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  transition: border-color 150ms, box-shadow 150ms;
}
.input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
  outline: none;
}
```

**Cards:**
```css
.card {
  background: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 150ms, transform 150ms;
}
.card:hover {
  box-shadow: var(--shadow-md);
}
.card-clickable:hover {
  transform: translateY(-1px);
}
```

---

## 3. Component Visual Refresh

### 3.1 PostingCard Redesign

**Current:**
Basic functional card

**New Design:**
```
┌─────────────────────────────────────────┐
│ ┌──────┐                                │
│ │      │  Software Engineer         ★★★ │
│ │ LOGO │  Anthropic                     │
│ │      │  📍 San Francisco (Remote)     │
│ └──────┘                                │
├─────────────────────────────────────────┤
│ [Python] [React] [AWS]           👥2    │
│                                         │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   3d ago │
│ Keywords: 7/12 matched                  │
└─────────────────────────────────────────┘

Visual changes:
- Larger logo (48x48 → 64x64)
- Softer shadows, rounded corners
- Status color as subtle left border accent
- Smoother hover state with slight lift
- Tags with better spacing
- Subtle progress bar for keywords
```

### 3.2 Kanban Column Redesign

```
┌─────────────────────────────────────────┐
│  ● Applied                          (8) │  ← Colored dot + count
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │         Card 1                      │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │         Card 2                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│      + Add posting to this status       │  ← Ghost add button
│                                         │
└─────────────────────────────────────────┘

Visual changes:
- Header with status dot, not full background
- More whitespace between cards
- Ghost "add" button at column bottom
- Subtle drop zone highlight on drag
```

### 3.3 Detail Panel Redesign

```
┌────────────────────────────────────────────────────────────┐
│                                                       [X]  │
│  ┌────────┐                                                │
│  │  LOGO  │  Software Engineer                             │
│  │        │  Anthropic · San Francisco                     │
│  └────────┘                                                │
│                                                            │
│  ┌──────────┐ ┌────────────┐ ┌──────────────────────────┐  │
│  │ ● Applied │ │ ★★★ High   │ │ [Python] [React] [+]    │  │
│  └──────────┘ └────────────┘ └──────────────────────────┘  │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  [Overview] [Keywords] [Connections] [Notes]               │
│  ─────────────────────────────────────────                 │
│                                                            │
│  Next Action                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📅 Feb 15, 2025 · Follow up on application         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
│  Description                                               │
│  We're looking for a talented engineer to join our...      │
│  [Read more]                                               │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  Added Jan 15 · Modified Feb 1                             │
│                                        [🔗 Open] [🗑 Delete] │
└────────────────────────────────────────────────────────────┘

Visual changes:
- Tabbed interface for sections
- Better visual hierarchy
- Inline status/priority editing
- Softer dividers
- Sticky header on scroll
```

### 3.4 Popup Redesign

```
┌──────────────────────────────────────┐
│  JobFlow                   ⚙️  📊    │
├──────────────────────────────────────┤
│                                      │
│  ┌────┐  Software Engineer           │
│  │logo│  Anthropic                   │
│  └────┘  San Francisco               │
│                                      │
│  ✓ Auto-detected from LinkedIn       │
│                                      │
│  Title                               │
│  ┌────────────────────────────────┐  │
│  │ Software Engineer              │  │
│  └────────────────────────────────┘  │
│                                      │
│  Company                             │
│  ┌────────────────────────────────┐  │
│  │ Anthropic                      │  │
│  └────────────────────────────────┘  │
│                                      │
│  [━━━━━ Save to JobFlow ━━━━━]       │
│                                      │
├──────────────────────────────────────┤
│  Recent                              │
│  ├─ PM @ Google            ★★★ · 2d  │
│  ├─ Designer @ Meta        ★★☆ · 3d  │
│  └─ Engineer @ Apple       ★☆☆ · 5d  │
└──────────────────────────────────────┘

Visual changes:
- Cleaner header
- Confidence indicator for scrape
- Better form styling
- Primary action button prominence
- Tighter recent list
```

---

## 4. Animations & Micro-interactions

### 4.1 Transitions

```css
/* Standard transitions */
--transition-fast: 100ms ease;
--transition-base: 150ms ease;
--transition-slow: 300ms ease;
--transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 4.2 Specific Animations

**Card Hover:**
```css
.posting-card {
  transition: transform var(--transition-base), 
              box-shadow var(--transition-base);
}
.posting-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

**Panel Slide-in:**
```css
.detail-panel {
  transform: translateX(100%);
  transition: transform var(--transition-slow);
}
.detail-panel.open {
  transform: translateX(0);
}
```

**Button Press:**
```css
.btn:active {
  transform: scale(0.98);
}
```

**Checkbox Check:**
```css
.checkbox-icon {
  transform: scale(0);
  transition: transform var(--transition-spring);
}
.checkbox:checked .checkbox-icon {
  transform: scale(1);
}
```

**Drag Preview:**
```css
.dragging {
  opacity: 0.8;
  transform: rotate(3deg) scale(1.02);
  box-shadow: var(--shadow-lg);
}
```

**Success Flash:**
```css
@keyframes success-flash {
  0% { background-color: var(--color-success); }
  100% { background-color: transparent; }
}
.save-success {
  animation: success-flash 500ms ease;
}
```

### 4.3 Loading States

**Skeleton Loading:**
```
┌─────────────────────────────────────────┐
│ ┌──────┐  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ │░░░░░░│  ░░░░░░░░░░░░░░░              │
│ │░░░░░░│  ░░░░░░░░░░░░░░░░░            │
│ └──────┘                                │
├─────────────────────────────────────────┤
│ ░░░░░░░  ░░░░░░                    ░░░  │
└─────────────────────────────────────────┘
```

**Spinner:**
- Use for actions (saving, loading)
- Subtle, doesn't dominate UI
- Include label: "Saving..." / "Loading..."

### 4.4 Empty States

**No Postings:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                      📋                                 │
│                                                         │
│              No job postings yet                        │
│                                                         │
│     Start by browsing job boards and clicking           │
│     the JobFlow icon to save interesting positions.     │
│                                                         │
│              [Browse LinkedIn Jobs]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**No Search Results:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                      🔍                                 │
│                                                         │
│           No postings match "Kubernetes"                │
│                                                         │
│     Try adjusting your search or filters.               │
│              [Clear Search]                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**No Connections:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                      👥                                 │
│                                                         │
│             No connections linked                       │
│                                                         │
│     Adding connections can help you track referrals     │
│     and networking contacts for this opportunity.       │
│                                                         │
│              [+ Add Connection]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Onboarding Flow

### 5.1 First-Time User Experience

**Step 1: Welcome**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                     🎯 JobFlow                          │
│                                                         │
│            Your job search, organized.                  │
│                                                         │
│   Track applications, manage connections, and           │
│   never lose track of an opportunity again.             │
│                                                         │
│              [Get Started →]                            │
│                                                         │
│                    1 ○ ○ ○                              │
└─────────────────────────────────────────────────────────┘
```

**Step 2: Save Your First Job**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    📥 Save Jobs                         │
│                                                         │
│   When you find an interesting job posting:             │
│                                                         │
│   1. Click the JobFlow icon in your toolbar             │
│   2. Review the auto-detected details                   │
│   3. Click "Save to JobFlow"                            │
│                                                         │
│              [← Back]  [Next →]                         │
│                                                         │
│                    ● ○ ○ ○                              │
└─────────────────────────────────────────────────────────┘
```

**Step 3: Track Progress**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                  📊 Track Progress                      │
│                                                         │
│   Drag jobs between columns as you progress:            │
│                                                         │
│   Saved → In Progress → Applied → Interviewing          │
│                                                         │
│   Add tags, set priorities, and never lose track.       │
│                                                         │
│              [← Back]  [Next →]                         │
│                                                         │
│                    ● ● ○ ○                              │
└─────────────────────────────────────────────────────────┘
```

**Step 4: Ready!**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ✅ You're Ready!                     │
│                                                         │
│   Your dashboard is set up. Start saving jobs           │
│   and organizing your search.                           │
│                                                         │
│   💡 Tip: Press ? anytime to see keyboard shortcuts     │
│                                                         │
│              [Open Dashboard]                           │
│                                                         │
│                    ● ● ● ●                              │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Feature Hints

Show contextual hints for new features:

**First Drag:**
```
┌────────────────────────────────────────┐
│ 💡 Drag cards between columns to       │
│    update their status!                │
│                          [Got it]      │
└────────────────────────────────────────┘
```

**First Export:**
```
┌────────────────────────────────────────┐
│ 💡 Export your data regularly to       │
│    keep a backup of your job search.   │
│                          [Got it]      │
└────────────────────────────────────────┘
```

---

## 6. Dark Mode

### 6.1 Implementation

```typescript
// src/hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  });
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return { theme, setTheme, toggle: () => setTheme(t => t === 'light' ? 'dark' : 'light') };
}
```

### 6.2 Toggle UI

Add to settings/header:
```
[☀️ / 🌙] Theme toggle button
```

---

## 7. Accessibility

### 7.1 Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Screen reader labels on icons
- [ ] Form labels properly associated
- [ ] Error messages announced
- [ ] Reduced motion support
- [ ] Skip links where appropriate

### 7.2 Focus Management

```css
/* Visible focus rings */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 7.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Implementation Tasks

### 8.1 Design System Setup (Days 1-2)

- [ ] **P1.1** Create CSS custom properties for tokens
- [ ] **P1.2** Set up Tailwind config with design tokens
- [ ] **P1.3** Create base component styles
- [ ] **P1.4** Add Inter font
- [ ] **P1.5** Create color palette documentation

### 8.2 Component Refresh (Days 3-8)

- [ ] **P2.1** Redesign PostingCard
- [ ] **P2.2** Redesign KanbanColumn
- [ ] **P2.3** Redesign DetailPanel with tabs
- [ ] **P2.4** Redesign Popup
- [ ] **P2.5** Redesign ConnectionCard
- [ ] **P2.6** Update all form elements
- [ ] **P2.7** Update all buttons
- [ ] **P2.8** Update modals

### 8.3 Animations (Days 9-10)

- [ ] **P3.1** Add card hover animations
- [ ] **P3.2** Add panel slide transitions
- [ ] **P3.3** Add button micro-interactions
- [ ] **P3.4** Add drag animations
- [ ] **P3.5** Add success/error feedback animations

### 8.4 States (Days 10-11)

- [ ] **P4.1** Design and implement skeleton loading
- [ ] **P4.2** Create all empty state illustrations
- [ ] **P4.3** Design error states
- [ ] **P4.4** Add loading spinners where needed

### 8.5 Onboarding (Days 11-12)

- [ ] **P5.1** Create onboarding modal flow
- [ ] **P5.2** Add first-time detection
- [ ] **P5.3** Create feature hint tooltips
- [ ] **P5.4** Add "skip" option

### 8.6 Dark Mode (Days 12-13)

- [ ] **P6.1** Define dark mode color palette
- [ ] **P6.2** Update all components for dark mode
- [ ] **P6.3** Add theme toggle UI
- [ ] **P6.4** Persist theme preference
- [ ] **P6.5** Respect system preference

### 8.7 Accessibility (Days 13-14)

- [ ] **P7.1** Audit keyboard navigation
- [ ] **P7.2** Add focus indicators
- [ ] **P7.3** Check color contrast
- [ ] **P7.4** Add aria labels
- [ ] **P7.5** Test with screen reader
- [ ] **P7.6** Add reduced motion support

### 8.8 Final Polish (Days 14-17)

- [ ] **P8.1** Performance audit and fixes
- [ ] **P8.2** Fix any remaining bugs
- [ ] **P8.3** Test all flows end-to-end
- [ ] **P8.4** Update README with screenshots
- [ ] **P8.5** Create demo GIF
- [ ] **P8.6** Final cross-browser testing

---

## 9. Acceptance Criteria

### 9.1 Visual Quality
- [ ] Consistent spacing throughout
- [ ] Consistent typography hierarchy
- [ ] All colors from defined palette
- [ ] No visual glitches or misalignments

### 9.2 Interactions
- [ ] All animations smooth (60fps)
- [ ] Hover states on all interactive elements
- [ ] Loading states prevent double-actions
- [ ] Feedback for all user actions

### 9.3 Dark Mode
- [ ] All screens work in dark mode
- [ ] No contrast issues
- [ ] Theme persists across sessions

### 9.4 Accessibility
- [ ] Full keyboard navigation
- [ ] Screen reader compatible
- [ ] WCAG AA compliant

### 9.5 Performance
- [ ] Dashboard loads < 500ms
- [ ] Smooth scrolling with 200+ postings
- [ ] No memory leaks

---

## 10. Definition of Done

Phase 6 is complete when:
1. Design system fully implemented
2. All components visually refreshed
3. Animations smooth and purposeful
4. Empty, loading, error states in place
5. Onboarding flow complete
6. Dark mode fully working
7. Accessibility audit passed
8. Performance optimized
9. All bugs fixed
10. README and documentation updated

---

## Appendix: Design Resources

### Inspiration
- Linear (clean, minimal, great dark mode)
- Notion (good typography, whitespace)
- Vercel Dashboard (subtle animations)
- Raycast (smooth interactions)

### Tools
- Figma for mockups (optional)
- Chrome DevTools for testing
- Lighthouse for performance
- axe DevTools for accessibility

### Assets Needed
- App icon (multiple sizes)
- Empty state illustrations (or use emoji)
- Onboarding illustrations (optional)