# CLAUDE.md - JobFlow Chrome Extension

> This file provides context to Claude Code about this project. Keep it updated as the project evolves.

## Project Overview

JobFlow is a Chrome extension for organizing job searches. It allows users to save job postings via web scraping, track application status through a pipeline, manage networking connections linked to opportunities, and get insights to strengthen applications.

**Current Phase:** Phase 1 - Foundation (React Migration + View Consolidation)

**Solo developer project** - prioritize maintainable, straightforward code over clever abstractions.

## Migration Status

⚠️ **This project is migrating from Vanilla JS to React + TypeScript.**

| Component | Status | Notes |
|-----------|--------|-------|
| Project scaffolding | 🔄 In Progress | Vite + React + TS setup |
| Storage utilities | 🔄 Needs port | Port `storage.js` to TypeScript |
| Scraper | 🔄 Needs port | Keep as content script, add types |
| Popup UI | ❌ Not started | Rebuild in React |
| Dashboard UI | ❌ Not started | Rebuild as React Kanban |
| Data migration | ❌ Not started | V1 → V2 schema migration |

**Migration approach:** 
1. Set up new React project structure alongside existing code
2. Port utilities (storage, scraper) to TypeScript
3. Build new React UI components
4. Test with existing V1 data
5. Remove old vanilla JS files once stable

---

## Tech Stack

### Current (V1 - Being Replaced)
- Vanilla JavaScript
- Plain HTML/CSS
- Chrome Storage API

### Target (V2 - Building Now)
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite with CRXJS plugin (for Chrome extension HMR)
- **Styling:** Tailwind CSS (recommended for rapid UI development)
- **State Management:** React Context + useReducer (upgrade to Zustand if needed)
- **Storage:** chrome.storage.local (same as V1)
- **Chrome Extension:** Manifest V3

---

## Project Structure

### Current V1 Structure (Reference Only)
```
job-tracker-extension/
├── manifest.json
├── icons/
├── src/
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── content/
│   │   └── scraper.js
│   ├── dashboard/
│   │   ├── dashboard.html
│   │   ├── dashboard.js
│   │   └── dashboard.css
│   └── utils/
│       └── storage.js
```

### Target V2 Structure (Build This)
```
job-tracker-extension/
├── manifest.json              # Updated for Vite build output
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── index.html                 # Vite entry (for dashboard)
├── icons/
├── src/
│   ├── main.tsx               # React entry point (dashboard)
│   ├── App.tsx                # Main app component
│   ├── popup/
│   │   ├── popup.html         # Popup entry point
│   │   ├── Popup.tsx          # Popup React root
│   │   └── PopupApp.tsx       # Popup UI component
│   ├── content/
│   │   └── scraper.ts         # Content script (ported to TS)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── ListView.tsx
│   │   │   └── ViewToggle.tsx
│   │   ├── posting/
│   │   │   ├── PostingCard.tsx
│   │   │   ├── PostingListRow.tsx
│   │   │   ├── PostingDetailPanel.tsx
│   │   │   ├── PriorityStars.tsx
│   │   │   └── TagPopover.tsx
│   │   └── common/
│   │       ├── SearchInput.tsx
│   │       ├── FilterDropdown.tsx
│   │       ├── ContextMenu.tsx
│   │       └── SlideOverPanel.tsx
│   ├── hooks/
│   │   ├── usePostings.ts
│   │   ├── useConnections.ts
│   │   ├── useFilters.ts
│   │   └── useChromeStorage.ts
│   ├── context/
│   │   └── AppContext.tsx
│   ├── services/
│   │   ├── storage.ts         # Ported from V1 with types
│   │   └── migration.ts       # V1 → V2 data migration
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── search.ts
│       └── dates.ts
└── dist/                      # Build output (load this in Chrome)
```

---

## Data Models

### V1 Schema (Existing Data)
```typescript
// What's currently in chrome.storage.local
interface V1Application {
  id: string;
  url: string;
  company: string;
  title: string;
  location: string;
  description: string;
  salary?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  dateAdded: string;      // ISO timestamp
  dateApplied?: string;   // ISO timestamp
  notes: string;
  tags: string[];
}
```

### V2 Schema (Target)
```typescript
interface Posting {
  id: string;
  url: string;
  company: string;
  companyLogo?: string;        // NEW: for card thumbnails
  title: string;
  location: string;
  description: string;
  salary?: string;
  status: PostingStatus;
  priority: 1 | 2 | 3;         // NEW: default 2
  tags: string[];
  notes: string;
  dateAdded: number;           // CHANGED: timestamp (number)
  dateModified: number;        // NEW: timestamp
  dateApplied?: number;        // CHANGED: timestamp (number)
  nextActionDate?: string;     // NEW: ISO date string (YYYY-MM-DD)
  connectionIds: string[];     // NEW: linked connections
}

type PostingStatus = 
  | 'saved'        // Just captured, haven't started
  | 'in_progress'  // NEW: Working on application
  | 'applied'      // Submitted
  | 'interviewing' // In interview process
  | 'offer'        // Received offer
  | 'accepted'     // NEW: Accepted offer (terminal)
  | 'rejected'     // Rejected by company (terminal)
  | 'withdrawn';   // User withdrew (terminal)

interface Connection {
  id: string;
  name: string;
  company: string;
  role?: string;
  relationshipNotes: string;
  lastContactDate?: string;
  nextFollowUp?: string;
  linkedPostingIds: string[];
}
```

### Migration Function Signature
```typescript
// In services/migration.ts
function migrateV1ToV2(v1Data: V1Application[]): Posting[];
function detectDataVersion(data: unknown): 'v1' | 'v2';
function runMigrationIfNeeded(): Promise<void>;
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/context/AppContext.tsx` | Global state (postings, filters, UI state) |
| `src/services/storage.ts` | Chrome storage read/write with types |
| `src/services/migration.ts` | V1 → V2 data migration |
| `src/content/scraper.ts` | Job posting scraper (content script) |
| `src/components/posting/PostingCard.tsx` | Card for Kanban/List views |
| `src/components/dashboard/KanbanBoard.tsx` | Main Kanban view |
| `vite.config.ts` | Build config with CRXJS |

---

## Current Work Context

### Active Tasks (Phase 1)

**Migration (do first):**
- [ ] Set up Vite + React + TypeScript + Tailwind project
- [ ] Configure CRXJS for Chrome extension builds
- [ ] Port storage.ts with TypeScript types
- [ ] Port scraper.ts with TypeScript types  
- [ ] Create data migration utility (V1 → V2)
- [ ] Set up AppContext with initial state shape

**UI Build (after migration foundation):**
- [ ] Implement KanbanBoard component
- [ ] Implement PostingCard with quick-edit
- [ ] Implement ListView as toggle option
- [ ] Build PostingDetailPanel (slide-over)
- [ ] Add DashboardHeader with search/filter
- [ ] Rebuild Popup for quick-save flow

### Recently Completed
- [x] Project planning (PRD, Phase 1 spec)

### Known Issues / Tech Debt
- V1 scraper selectors may be outdated for some job sites (fix in Phase 3)
- No error boundaries in place yet
- No loading states designed yet

---

## Commands

```bash
# Development
npm install              # Install dependencies (run first!)
npm run dev              # Start Vite dev server with HMR
npm run build            # Production build to dist/
npm run lint             # Run ESLint
npm run type-check       # TypeScript check

# Extension loading (after build)
# 1. Run `npm run build`
# 2. Open chrome://extensions
# 3. Enable Developer Mode
# 4. Click "Load unpacked" and select the dist/ folder

# During development with Vite + CRXJS
# The extension auto-reloads on changes
```

---

## Code Conventions

### Naming
- Components: PascalCase (`PostingCard.tsx`)
- Hooks: camelCase with `use` prefix (`usePostings.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types/Interfaces: PascalCase, no `I` prefix (`Posting`, not `IPosting`)
- Constants: SCREAMING_SNAKE_CASE (`DEFAULT_STATUS`)

### Component Patterns
```typescript
// Props interface above component
interface PostingCardProps {
  posting: Posting;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onPriorityChange: (id: string, priority: 1 | 2 | 3) => void;
}

// Destructure props, use explicit return for JSX
export function PostingCard({ posting, onStatusChange, onPriorityChange }: PostingCardProps) {
  return (
    <div>...</div>
  );
}
```

### State Management
- Use Context + useReducer for global state (postings, connections, filters)
- Local component state with useState for UI-only state (hover, open/closed)
- Never mutate state directly
- Debounce chrome.storage writes (300ms) for frequent updates

### File Organization
- One component per file
- Colocate tests: `PostingCard.tsx` + `PostingCard.test.tsx` (when adding tests)
- Index files for clean imports: `components/posting/index.ts`
- Keep files under 250 lines; extract sub-components if larger

### Tailwind Conventions
- Use Tailwind classes directly in JSX
- Extract repeated patterns to component variants, not @apply
- Use design tokens: `text-gray-600` not arbitrary `text-[#666]`
- Responsive: mobile-first (`sm:`, `md:`, `lg:` for larger)

---

## Chrome Extension Specifics

### Storage Access
```typescript
// Always use typed utilities from services/storage.ts
import { getPostings, savePostings, getConnections } from '@/services/storage';

// Never use chrome.storage directly in components
// ❌ chrome.storage.local.get('postings', ...)
// ✅ const postings = await getPostings();
```

### Content Script (Scraper)
- Runs in page context, separate from extension
- Communicates via chrome.runtime.sendMessage
- Keep dependencies minimal (no React in content script)
- Must be plain JS/TS, bundled separately

### Popup vs Dashboard
- **Popup:** Quick actions (save current page, view recent). Separate React root.
- **Dashboard:** Full app (Kanban, detail view, search). Main React app.
- Both share the same storage and types

### Manifest Permissions
Current: `storage`, `activeTab`, `scripting`

Do not add permissions without:
1. Updating manifest.json
2. Documenting why in this file
3. Testing that Chrome accepts the new permission set

---

## Build Configuration Notes

### Vite + CRXJS Setup
```typescript
// vite.config.ts key points
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  // CRXJS handles multiple entry points (popup, dashboard, content scripts)
});
```

### Path Aliases
```typescript
// tsconfig.json - use @ for src imports
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Testing Approach

Manual testing checklist (run after significant changes):

1. **Fresh install:** Load unpacked, verify empty state UI
2. **V1 data migration:** 
   - Manually add V1-format data to storage
   - Reload extension, verify migration runs
   - Verify all fields mapped correctly
3. **Save flow:** Navigate to LinkedIn job, click extension, save works
4. **Kanban:** Cards appear in correct columns
5. **Quick-edit:** Priority stars update and persist
6. **Status change:** Move posting between statuses, verify persistence
7. **Search/filter:** Results filter correctly
8. **Detail panel:** Opens, edits save, closes cleanly

---

## Don'ts / Gotchas

### Don'ts
- **Don't** use `localStorage`—use `chrome.storage.local`
- **Don't** import React into content scripts—they run in page context
- **Don't** add drag-and-drop yet—Phase 2, use dropdowns/context menu for now
- **Don't** modify scraper selectors in Phase 1—that's Phase 3
- **Don't** use `any` type—always define proper types
- **Don't** put business logic in components—extract to hooks or utils

### Gotchas
- `chrome.storage` is async—always await or use callbacks
- Extension popup closes when losing focus—save state frequently
- Content scripts can't access chrome.storage.local directly—use message passing
- Vite HMR may not always reload content scripts—manual reload sometimes needed
- CRXJS requires manifest.json to be valid JSON (no comments)

---

## Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| PRD | `docs/PRD.md` | Product vision and full roadmap |
| Phase 1 Spec | `docs/PHASE1_SPEC.md` | Current phase requirements |
| V1 README | `README.md` | Original project documentation |

---

## How to Update This File

Update CLAUDE.md when:
1. Completing migration milestones (update Migration Status table)
2. Moving tasks between Active/Completed
3. Adding new dependencies
4. Discovering gotchas
5. Changing conventions

Keep this file accurate—it's the source of truth for Claude Code sessions.