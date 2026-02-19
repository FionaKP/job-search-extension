# JobFlow - Chrome Extension for Job Search Tracking

## Tech Stack

- **Framework:** React 18.3 with TypeScript 5.9
- **Build:** Vite 5.4 with @crxjs/vite-plugin for Chrome Extension bundling
- **Styling:** Tailwind CSS 3.4 with PostCSS
- **Drag & Drop:** @dnd-kit/core and @dnd-kit/sortable
- **Storage:** Chrome Extension Storage API (chrome.storage.local)
- **Target:** Chrome Extension (Manifest V3)

## Project Structure

```
src/
├── App.tsx                 # Main dashboard application
├── main.tsx                # React entry point
├── index.css               # Global styles + Tailwind
├── components/
│   ├── common/             # Shared UI components (buttons, modals, filters)
│   ├── dashboard/          # Kanban board, list view, posting cards
│   ├── connections/        # Contact/networking management
│   ├── keywords/           # Keyword extraction and comparison
│   ├── goals/              # Application goals panel (IN PROGRESS)
│   ├── interview/          # Interview prep panel (IN PROGRESS)
│   ├── rejection/          # Rejection insights panel (IN PROGRESS)
│   ├── posting/            # Posting card and edit modal
│   ├── layout/             # Sidebar, stats
│   └── popup/              # Extension popup UI
├── content/
│   ├── scraper.ts          # Content script for job page scraping
│   ├── parsers/            # Site-specific parsers (LinkedIn, Indeed, etc.)
│   └── utils/              # Scraping utilities (cleaners, selectors)
├── hooks/                  # Custom React hooks
├── services/               # Storage and data services
├── types/                  # TypeScript interfaces
└── utils/                  # General utilities (backup, export)
docs/
├── v2/                     # V2 planning documents
└── archive/                # V1 phase specs
```

## Build & Test Commands

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Type checking (lint)
npm run lint

# Preview production build
npm run preview
```

After building, load `dist/` folder as unpacked extension in Chrome.

## Coding Conventions

- Use TypeScript strict mode; all public APIs need typed interfaces
- Prefer functional components with hooks
- Use Tailwind utility classes; avoid custom CSS unless necessary
- Keep components under 500 lines; extract when larger
- Use `useMemo` and `useCallback` for expensive computations
- Storage operations go through `src/services/storage.ts`
- Site parsers follow the pattern in `src/content/parsers/`

## V2 Completion Status

### Completed

- **V1 Core:** Kanban board, list view, drag-and-drop, posting detail panel
- **Connections:** Full networking/contact management with linking to postings (~95%)
- **Keywords:** Extraction, categorization, percentage tags, comparison modal (~90%)
- **Scraper:** Parsers for LinkedIn, Indeed, Greenhouse, Lever, Workday, Glassdoor, Wellfound, generic (~98%)
- **Visual Polish:** Collapsible columns, stale indicators, date coding, empty states (~75%)
- **Accessibility:** Initial pass completed and verified (recent commit)
- **Application Goals Panel:** Added to detail panel for Saved status
- **Interview Prep Panel:** Added to detail panel for Interview status
- **Rejection Insights Panel:** Added to detail panel for Rejected status

### Current Branch: `feature/status-rejected-insights`

## Do Not Touch (Active Development)

The following files are actively being worked on in the current feature branch. Do not modify:

```
src/components/goals/ApplicationGoalsPanel.tsx
src/components/goals/index.ts
src/components/interview/InterviewPrepPanel.tsx
src/components/interview/index.ts
src/components/rejection/RejectionInsightsPanel.tsx
src/components/rejection/index.ts
src/components/dashboard/PostingDetailPanel.tsx  # Integrates status panels
```

## Available for Parallel Work

### 1. Roadmap Page (New Feature)
- **Doc:** `docs/v2/V2_ROADMAP_PAGE.md`
- **Branch:** `feature/roadmap-page`
- **Scope:** Timeline visualization, goal system, notifications, weekly agenda
- **Files to create:** `src/components/roadmap/*`, route in App.tsx

### 2. Scraper Testing
- **Doc:** `docs/v2/V2_BUGFIXES.md` (Section 3)
- **Branch:** `fix/scraper-testing`
- **Scope:** Test all parsers on real job pages, document limitations, fix edge cases
- **Files:** `src/content/parsers/*`, create `docs/SCRAPER_NOTES.md`

### 3. Performance Optimization
- **Doc:** `docs/v2/V2_BUGFIXES.md` (Section 2)
- **Branch:** `fix/performance`
- **Scope:** List virtualization, lazy loading, render optimization, memory audit
- **Files:** Components NOT in the "do not touch" list above
- **Targets:** Dashboard < 500ms load, smooth scroll with 200+ postings

### 4. Accessibility Improvements
- **Doc:** `docs/v2/V2_BUGFIXES.md` (Section 1)
- **Branch:** `fix/accessibility`
- **Scope:** Focus management, aria labels, keyboard nav, screen reader support
- **Files:** Components NOT in the "do not touch" list above
- **Target:** Lighthouse accessibility > 90

### 5. Keyword Comparison Polish
- **Doc:** `docs/v2/V2_BUGFIXES.md` (Section 4)
- **Branch:** `fix/keyword-compare`
- **Scope:** Multi-select mode on dashboard, keyword tags on PostingCard
- **Files:** `src/components/keywords/*`, `src/components/posting/PostingCard.tsx`

### 6. Offer Comparison (Status Feature - Not Started)
- **Doc:** `docs/v2/V2_STATUS_FEATURES.md` (Section 4)
- **Branch:** `feature/status-offer-compare`
- **Scope:** Offer details entry, side-by-side comparison, weighted scoring
- **Files to create:** `src/components/offer/*`

## File Organization

- Source code: `src/`
- Tests: `tests/` (not yet configured)
- Documentation: `docs/`
- Build output: `dist/`
- Do not save working files to root

## Git Workflow

- Main branch: `main`
- Feature branches: `feature/*`
- Fix branches: `fix/*`
- Always run `npm run build` before committing to verify no type errors
