# Phase 1 Specification: Foundation
## JobFlow Chrome Extension

**Goal:** Migrate from vanilla JS to React/TypeScript, then implement consolidated Kanban-based dashboard.

**Timeline:** 3-4 weeks (solo developer)

**Starting Point:** Vanilla JS Chrome extension with popup, dashboard, and scraper.

---

## 1. Scope Summary

### In Scope

**Migration (Week 1-1.5):**
- Set up React + TypeScript + Vite + Tailwind project
- Configure CRXJS for Chrome extension development
- Port storage utilities to TypeScript
- Port scraper to TypeScript (minimal changes, just add types)
- Create V1 → V2 data migration utility
- Set up state management (Context + useReducer)

**UI Build (Week 1.5-3.5):**
- Implement Kanban board as primary dashboard view
- Implement List mode as secondary toggle
- Create PostingCard component with quick-edit (priority, tags)
- Build slide-over detail panel
- Add search and priority filtering
- Rebuild popup for quick-save flow
- Remove old vanilla JS code

### Out of Scope (Later Phases)
- Drag-and-drop between Kanban columns (Phase 2)
- Advanced filtering (date ranges, deadlines) (Phase 2)
- Keyboard shortcuts (Phase 2)
- Scraper improvements (Phase 3)
- Connections integration improvements (Phase 4)
- Keyword analysis (Phase 5)

---

## 2. Migration Specifications

### 2.1 Project Setup

**Create new project structure using Vite:**

```bash
npm create vite@latest job-tracker-extension -- --template react-ts
cd job-tracker-extension
npm install
npm install -D tailwindcss postcss autoprefixer
npm install -D @crxjs/vite-plugin@beta
npx tailwindcss init -p
```

**Key dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.23",
    "@types/chrome": "^0.0.260",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0",
    "vite": "^5.1.0"
  }
}
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import path from 'path';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Updated manifest.json structure:**
```json
{
  "manifest_version": 3,
  "name": "JobFlow - Job Application Tracker",
  "version": "2.0.0",
  "description": "Track and manage your job applications",
  "permissions": ["storage", "activeTab", "scripting"],
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/scraper.ts"]
    }
  ],
  "options_page": "index.html"
}
```

### 2.2 Data Migration

**V1 to V2 Schema Changes:**

| Change | V1 | V2 | Migration Action |
|--------|----|----|------------------|
| Timestamp format | ISO string | number (ms) | `new Date(v1.dateAdded).getTime()` |
| New field | - | `priority` | Default to `2` |
| New field | - | `companyLogo` | Default to `undefined` |
| New field | - | `dateModified` | Set to `dateAdded` value |
| New field | - | `nextActionDate` | Default to `undefined` |
| New field | - | `connectionIds` | Default to `[]` |
| New status | - | `in_progress` | No migration needed |
| New status | - | `accepted` | No migration needed |
| Storage key | `applications` (?) | `postings` | Check actual V1 key |
| Version flag | - | `schemaVersion: 2` | Add to storage |

**Migration utility (services/migration.ts):**

```typescript
import { V1Application, Posting } from '@/types';
import { STORAGE_KEYS } from '@/services/storage';

export async function runMigrationIfNeeded(): Promise<void> {
  const result = await chrome.storage.local.get(['schemaVersion', 'applications', 'postings']);
  
  // Already migrated
  if (result.schemaVersion === 2) {
    return;
  }
  
  // Has V1 data
  if (result.applications && Array.isArray(result.applications)) {
    const migratedPostings = migrateV1ToV2(result.applications);
    
    await chrome.storage.local.set({
      postings: migratedPostings,
      schemaVersion: 2,
    });
    
    // Optionally keep V1 data as backup
    await chrome.storage.local.set({
      _v1_backup: result.applications,
    });
    
    console.log(`Migrated ${migratedPostings.length} postings from V1 to V2`);
  } else {
    // Fresh install, just set version
    await chrome.storage.local.set({ schemaVersion: 2 });
  }
}

export function migrateV1ToV2(v1Data: V1Application[]): Posting[] {
  return v1Data.map((v1) => ({
    id: v1.id,
    url: v1.url,
    company: v1.company,
    companyLogo: undefined,
    title: v1.title,
    location: v1.location,
    description: v1.description,
    salary: v1.salary,
    status: v1.status, // V1 statuses are subset of V2
    priority: 2, // Default priority
    tags: v1.tags || [],
    notes: v1.notes || '',
    dateAdded: parseTimestamp(v1.dateAdded),
    dateModified: parseTimestamp(v1.dateAdded), // Initialize to dateAdded
    dateApplied: v1.dateApplied ? parseTimestamp(v1.dateApplied) : undefined,
    nextActionDate: undefined,
    connectionIds: [],
  }));
}

function parseTimestamp(value: string | number): number {
  if (typeof value === 'number') return value;
  return new Date(value).getTime();
}
```

### 2.3 Storage Service (TypeScript Port)

**services/storage.ts:**

```typescript
import { Posting, Connection, AppSettings } from '@/types';

export const STORAGE_KEYS = {
  POSTINGS: 'postings',
  CONNECTIONS: 'connections',
  SETTINGS: 'settings',
  SCHEMA_VERSION: 'schemaVersion',
} as const;

// Postings
export async function getPostings(): Promise<Posting[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.POSTINGS);
  return result[STORAGE_KEYS.POSTINGS] || [];
}

export async function savePostings(postings: Posting[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.POSTINGS]: postings });
}

export async function savePosting(posting: Posting): Promise<void> {
  const postings = await getPostings();
  const index = postings.findIndex((p) => p.id === posting.id);
  
  if (index >= 0) {
    postings[index] = { ...posting, dateModified: Date.now() };
  } else {
    postings.push(posting);
  }
  
  await savePostings(postings);
}

export async function deletePosting(id: string): Promise<void> {
  const postings = await getPostings();
  const filtered = postings.filter((p) => p.id !== id);
  await savePostings(filtered);
}

// Connections
export async function getConnections(): Promise<Connection[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CONNECTIONS);
  return result[STORAGE_KEYS.CONNECTIONS] || [];
}

export async function saveConnections(connections: Connection[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.CONNECTIONS]: connections });
}

// Settings
export async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return result[STORAGE_KEYS.SETTINGS] || getDefaultSettings();
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

function getDefaultSettings(): AppSettings {
  return {
    defaultView: 'kanban',
    theme: 'light',
  };
}
```

### 2.4 Type Definitions

**types/index.ts:**

```typescript
// ============ Postings ============

export type PostingStatus =
  | 'saved'
  | 'in_progress'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export const POSTING_STATUSES: PostingStatus[] = [
  'saved',
  'in_progress',
  'applied',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
  'withdrawn',
];

export const STATUS_LABELS: Record<PostingStatus, string> = {
  saved: 'Saved',
  in_progress: 'In Progress',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

// Kanban column order (excludes terminal statuses from main flow)
export const KANBAN_COLUMNS: PostingStatus[] = [
  'saved',
  'in_progress',
  'applied',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
];

export interface Posting {
  id: string;
  url: string;
  company: string;
  companyLogo?: string;
  title: string;
  location: string;
  description: string;
  salary?: string;
  status: PostingStatus;
  priority: 1 | 2 | 3;
  tags: string[];
  notes: string;
  dateAdded: number;
  dateModified: number;
  dateApplied?: number;
  nextActionDate?: string;
  connectionIds: string[];
}

// ============ Connections ============

export interface Connection {
  id: string;
  name: string;
  company: string;
  role?: string;
  relationshipNotes: string;
  lastContactDate?: string;
  nextFollowUp?: string;
  linkedPostingIds: string[];
}

// ============ App State ============

export type ViewMode = 'kanban' | 'list';

export interface AppSettings {
  defaultView: ViewMode;
  theme: 'light' | 'dark';
}

export interface FilterState {
  searchQuery: string;
  priorityFilter: 1 | 2 | 3 | null;
  statusFilter: PostingStatus | null;
}

export interface AppState {
  postings: Posting[];
  connections: Connection[];
  settings: AppSettings;
  filters: FilterState;
  ui: {
    currentView: ViewMode;
    selectedPostingId: string | null;
    detailPanelOpen: boolean;
    isLoading: boolean;
  };
}

// ============ V1 Types (for migration) ============

export interface V1Application {
  id: string;
  url: string;
  company: string;
  title: string;
  location: string;
  description: string;
  salary?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  dateAdded: string;
  dateApplied?: string;
  notes: string;
  tags: string[];
}
```

---

## 3. Information Architecture

*(Same as original spec - keeping for reference)*

### Target State (Phase 1)
```
Dashboard
├── Kanban View (default)
│   └── Columns: Saved | In Progress | Applied | Interviewing | Offer | Accepted | Rejected
├── List View (toggle)
└── Detail Panel (slide-over, not separate page)

Popup
└── Quick Save UI (rebuilt in React)
```

---

## 4. Component Specifications

### 4.1 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  JobFlow                    [Search...] [Filter ▼] [═ ▤] [+ Add]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Saved (12)  │ In Progress (3) │ Applied (8) │ Interviewing (2)│
│  ─────────── │ ──────────────  │ ─────────── │ ────────────────│
│  ┌─────────┐ │ ┌─────────┐     │ ┌─────────┐ │ ┌─────────┐     │
│  │  Card   │ │ │  Card   │     │ │  Card   │ │ │  Card   │     │
│  └─────────┘ │ └─────────┘     │ └─────────┘ │ └─────────┘     │
│  ┌─────────┐ │ ┌─────────┐     │ ┌─────────┐ │ ┌─────────┐     │
│  │  Card   │ │ │  Card   │     │ │  Card   │ │ │  Card   │     │
│  └─────────┘ │ └─────────┘     │ └─────────┘ │ └─────────┘     │
│      ...     │                 │     ...     │    ┌─────────┐  │
│              │                 │             │    │Offer (1)│  │
│              │                 │             │    └─────────┘  │
└─────────────────────────────────────────────────────────────────┘

[+ Add] = Manual add posting (opens modal)
[═ ▤]   = View toggle (Kanban | List)
```

### 4.2 PostingCard Component

```
┌─────────────────────────────┐
│ ┌────┐  Software Engineer   │
│ │logo│  Anthropic          │
│ └────┘  San Francisco, CA   │
├─────────────────────────────┤
│ ★★★☆  [tag1] [tag2]    •3d │
└─────────────────────────────┘
```

**Props:**
```typescript
interface PostingCardProps {
  posting: Posting;
  onSelect: (id: string) => void;
  onPriorityChange: (id: string, priority: 1 | 2 | 3) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  variant: 'kanban' | 'list';
}
```

**Quick-edit interactions:**
| Element | Action | Handler |
|---------|--------|---------|
| Priority stars | Click star N | `onPriorityChange(id, n)` |
| Tag chip | Click | Opens TagPopover |
| Card body | Click | `onSelect(id)` → opens detail panel |
| Card | Right-click | Opens context menu (status change, delete, open URL) |

**Tailwind classes (example):**
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 
               hover:shadow-md transition-shadow cursor-pointer">
  {/* content */}
</div>
```

### 4.3 KanbanColumn Component

**Props:**
```typescript
interface KanbanColumnProps {
  status: PostingStatus;
  postings: Posting[];
  onPostingSelect: (id: string) => void;
  onPriorityChange: (id: string, priority: 1 | 2 | 3) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
}
```

**Column styling by status:**
```typescript
const COLUMN_COLORS: Record<PostingStatus, string> = {
  saved: 'bg-blue-50 border-blue-200',
  in_progress: 'bg-orange-50 border-orange-200',
  applied: 'bg-green-50 border-green-200',
  interviewing: 'bg-purple-50 border-purple-200',
  offer: 'bg-yellow-50 border-yellow-200',
  accepted: 'bg-gray-100 border-gray-300',
  rejected: 'bg-gray-100 border-gray-300',
  withdrawn: 'bg-gray-100 border-gray-300',
};
```

### 4.4 Detail Panel (SlideOver)

**Width:** 480px (or 40% viewport, min 400px, max 560px)

**Sections:**
1. Header (title, company, close button, open URL button)
2. Quick fields (status dropdown, priority stars, tags)
3. Next action date picker
4. Description (read-only, scrollable)
5. Notes (textarea, auto-save on blur)
6. Connections placeholder (Phase 4)
7. Footer (dates, delete button)

**Props:**
```typescript
interface PostingDetailPanelProps {
  posting: Posting | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Posting>) => void;
  onDelete: (id: string) => void;
}
```

### 4.5 Popup (Quick Save)

Simplified for Phase 1—just port existing functionality to React:

```
┌─────────────────────────────┐
│ JobFlow            [⚙️] [📊] │
├─────────────────────────────┤
│                             │
│ Title: [Software Engineer ] │
│ Company: [Anthropic       ] │
│ Location: [San Francisco  ] │
│                             │
│ [Save to JobFlow]           │
│                             │
│ ─────────────────────────── │
│ Recent (3)                  │
│ • PM @ Google          ★★★  │
│ • Eng @ Meta           ★★☆  │
│ • Design @ Apple       ★☆☆  │
└─────────────────────────────┘

[⚙️] = Settings (future)
[📊] = Open full dashboard
```

---

## 5. State Management

### 5.1 AppContext Structure

**context/AppContext.tsx:**

```typescript
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Posting, PostingStatus, ViewMode, FilterState } from '@/types';
import { getPostings, savePostings, getSettings } from '@/services/storage';
import { runMigrationIfNeeded } from '@/services/migration';

type Action =
  | { type: 'SET_POSTINGS'; payload: Posting[] }
  | { type: 'UPDATE_POSTING'; payload: { id: string; updates: Partial<Posting> } }
  | { type: 'DELETE_POSTING'; payload: string }
  | { type: 'ADD_POSTING'; payload: Posting }
  | { type: 'SET_VIEW'; payload: ViewMode }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'SELECT_POSTING'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  postings: [],
  connections: [],
  settings: { defaultView: 'kanban', theme: 'light' },
  filters: { searchQuery: '', priorityFilter: null, statusFilter: null },
  ui: {
    currentView: 'kanban',
    selectedPostingId: null,
    detailPanelOpen: false,
    isLoading: true,
  },
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_POSTINGS':
      return { ...state, postings: action.payload };
    
    case 'UPDATE_POSTING':
      return {
        ...state,
        postings: state.postings.map((p) =>
          p.id === action.payload.id
            ? { ...p, ...action.payload.updates, dateModified: Date.now() }
            : p
        ),
      };
    
    case 'DELETE_POSTING':
      return {
        ...state,
        postings: state.postings.filter((p) => p.id !== action.payload),
        ui: {
          ...state.ui,
          selectedPostingId: state.ui.selectedPostingId === action.payload 
            ? null 
            : state.ui.selectedPostingId,
          detailPanelOpen: state.ui.selectedPostingId === action.payload 
            ? false 
            : state.ui.detailPanelOpen,
        },
      };
    
    case 'ADD_POSTING':
      return { ...state, postings: [...state.postings, action.payload] };
    
    case 'SET_VIEW':
      return { ...state, ui: { ...state.ui, currentView: action.payload } };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'SELECT_POSTING':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedPostingId: action.payload,
          detailPanelOpen: action.payload !== null,
        },
      };
    
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, isLoading: action.payload } };
    
    default:
      return state;
  }
}

// Context and Provider implementation...
```

### 5.2 Persistence Strategy

- Load from chrome.storage on mount (after migration check)
- Save to chrome.storage on every meaningful change
- Debounce rapid updates (notes editing) with 500ms delay
- Optimistic UI updates (change state immediately, persist async)

---

## 6. Implementation Tasks

### 6.1 Migration Tasks (Week 1 - 1.5)

#### Project Setup (Days 1-2)
- [ ] **M1.1** Create new Vite + React + TypeScript project
- [ ] **M1.2** Install and configure Tailwind CSS
- [ ] **M1.3** Install and configure CRXJS vite plugin
- [ ] **M1.4** Set up path aliases (@/) in tsconfig
- [ ] **M1.5** Create manifest.json for V2
- [ ] **M1.6** Copy icons from V1 project
- [ ] **M1.7** Verify extension loads in Chrome (empty state)

#### Type Definitions (Day 2)
- [ ] **M2.1** Create `types/index.ts` with all interfaces
- [ ] **M2.2** Define status constants and labels
- [ ] **M2.3** Define V1Application type for migration

#### Storage & Migration (Days 3-4)
- [ ] **M3.1** Create `services/storage.ts` with typed functions
- [ ] **M3.2** Create `services/migration.ts` with V1→V2 logic
- [ ] **M3.3** Test migration with sample V1 data
- [ ] **M3.4** Add migration call to app initialization

#### State Management (Days 4-5)
- [ ] **M4.1** Create `context/AppContext.tsx` with reducer
- [ ] **M4.2** Implement all action types
- [ ] **M4.3** Add persistence hooks (save on state change)
- [ ] **M4.4** Create `usePostings` hook for common operations

#### Scraper Port (Day 5)
- [ ] **M5.1** Port `scraper.js` to `scraper.ts`
- [ ] **M5.2** Add type definitions for scraped data
- [ ] **M5.3** Verify scraper still works on test pages

### 6.2 UI Build Tasks (Week 1.5 - 3.5)

#### Common Components (Days 6-7)
- [ ] **U1.1** Create `SlideOverPanel` component (reusable)
- [ ] **U1.2** Create `SearchInput` component
- [ ] **U1.3** Create `FilterDropdown` component
- [ ] **U1.4** Create `PriorityStars` component
- [ ] **U1.5** Create `TagPopover` component
- [ ] **U1.6** Create `ContextMenu` component (right-click)

#### PostingCard Component (Days 7-8)
- [ ] **U2.1** Create base `PostingCard` layout
- [ ] **U2.2** Add company logo with fallback (initials)
- [ ] **U2.3** Integrate `PriorityStars` with quick-edit
- [ ] **U2.4** Add tag display with overflow handling
- [ ] **U2.5** Add days-since indicator
- [ ] **U2.6** Add context menu integration
- [ ] **U2.7** Create list row variant

#### Kanban Board (Days 9-10)
- [ ] **U3.1** Create `KanbanColumn` component
- [ ] **U3.2** Create `KanbanBoard` layout with horizontal scroll
- [ ] **U3.3** Wire up card rendering per column
- [ ] **U3.4** Add column header with count
- [ ] **U3.5** Style columns with status colors

#### List View (Day 11)
- [ ] **U4.1** Create `ListView` component
- [ ] **U4.2** Add sortable column headers
- [ ] **U4.3** Implement sorting logic
- [ ] **U4.4** Add inline status dropdown

#### Dashboard Header (Day 12)
- [ ] **U5.1** Create `DashboardHeader` layout
- [ ] **U5.2** Wire up search with debounce
- [ ] **U5.3** Wire up priority filter
- [ ] **U5.4** Implement view toggle (Kanban/List)
- [ ] **U5.5** Add "Add Posting" button (opens modal or panel)

#### Detail Panel (Days 13-14)
- [ ] **U6.1** Create `PostingDetailPanel` using `SlideOverPanel`
- [ ] **U6.2** Build header section (title, company, actions)
- [ ] **U6.3** Build quick-edit fields (status, priority, tags)
- [ ] **U6.4** Add next action date picker
- [ ] **U6.5** Build description section (read-only)
- [ ] **U6.6** Build notes textarea with auto-save
- [ ] **U6.7** Add connections placeholder
- [ ] **U6.8** Add delete with confirmation

#### Popup Rebuild (Days 15-16)
- [ ] **U7.1** Create popup HTML entry point
- [ ] **U7.2** Create `PopupApp` component
- [ ] **U7.3** Build save form with editable fields
- [ ] **U7.4** Wire up scraper communication
- [ ] **U7.5** Add recent postings list
- [ ] **U7.6** Add link to full dashboard

#### Integration & Polish (Days 17-18)
- [ ] **U8.1** Wire all components together in main App
- [ ] **U8.2** Test full flow: save → dashboard → edit → persist
- [ ] **U8.3** Add loading states
- [ ] **U8.4** Add empty states
- [ ] **U8.5** Responsive testing
- [ ] **U8.6** Fix any visual bugs
- [ ] **U8.7** Remove old V1 vanilla JS files

---

## 7. Acceptance Criteria

### 7.1 Migration Complete
- [ ] Extension loads without errors
- [ ] V1 data migrates correctly to V2 schema
- [ ] All V1 postings appear in new dashboard
- [ ] Storage operations are typed and working
- [ ] No vanilla JS UI code remains

### 7.2 Dashboard Functional
- [ ] Kanban view shows postings in correct status columns
- [ ] List view shows all postings in sortable table
- [ ] View toggle switches between Kanban and List
- [ ] View preference persists across sessions
- [ ] Search filters postings by title, company, tags
- [ ] Priority filter works correctly

### 7.3 Quick-Edit Working
- [ ] Priority stars update on click and persist
- [ ] Tags can be added/removed via popover
- [ ] Status can be changed via context menu
- [ ] Changes reflect immediately in UI
- [ ] Changes persist to storage

### 7.4 Detail Panel Working
- [ ] Panel opens when clicking a card
- [ ] Panel closes via X button, ESC key, or overlay click
- [ ] All fields display correctly
- [ ] Status, priority, tags editable
- [ ] Notes save on blur
- [ ] Next action date saves on change
- [ ] Delete works with confirmation

### 7.5 Popup Working
- [ ] Popup opens when clicking extension icon
- [ ] Current page data scraped and shown
- [ ] User can edit fields before saving
- [ ] Save creates new posting in dashboard
- [ ] Recent postings display correctly
- [ ] Dashboard link works

---

## 8. Testing Checklist

Run through these scenarios after major changes:

### Migration
- [ ] Fresh install (no V1 data) → empty dashboard loads
- [ ] Existing V1 data → migration runs, all postings appear
- [ ] V1 with various statuses → all map correctly
- [ ] V1 with tags/notes → preserved in migration

### Core Flows
- [ ] Save via popup → appears in Saved column
- [ ] Change status via context menu → card moves to new column
- [ ] Change priority → stars update, persists on reload
- [ ] Search "anthropic" → only matching cards shown
- [ ] Filter high priority → only 3-star cards shown

### Detail Panel
- [ ] Click card → panel opens with correct data
- [ ] Edit notes → auto-saves after blur
- [ ] Change status in panel → card moves in Kanban
- [ ] Delete → card removed, panel closes
- [ ] Press ESC → panel closes

### Edge Cases
- [ ] 100+ postings → performance acceptable
- [ ] Very long title/description → truncates gracefully
- [ ] No company logo → fallback initials display
- [ ] Special characters in search → no errors

---

## 9. Definition of Done

Phase 1 is complete when:

1. ✅ All acceptance criteria met
2. ✅ All V1 vanilla JS UI code removed
3. ✅ Testing checklist passes
4. ✅ No TypeScript errors
5. ✅ No console errors in normal usage
6. ✅ Extension works in both popup and dashboard contexts
7. ✅ README updated to reflect new tech stack
8. ✅ CLAUDE.md migration status updated

---

## Appendix: Quick Reference

### Status Flow
```
[Saved] → [In Progress] → [Applied] → [Interviewing] → [Offer] → [Accepted]
                                 ↘                ↘          ↘
                               [Withdrawn]    [Rejected]  [Declined]
```

### Priority Levels
- ★☆☆ (1) = Low interest / backup option
- ★★☆ (2) = Medium interest / solid option  
- ★★★ (3) = High interest / dream job

### Keyboard Shortcuts (Phase 2 - Document for Reference)
- `ESC` - Close detail panel
- (More in Phase 2)