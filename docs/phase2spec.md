# Phase 2 Specification: Core Interaction Polish
## JobFlow Chrome Extension

**Goal:** Make daily workflow smooth and efficient with drag-and-drop, advanced filtering, keyboard shortcuts, and data backup.

**Timeline:** 2-3 weeks (solo developer)

**Predecessor:** Phase 1 complete (React migration, Kanban view, basic filtering, detail panel)

---

## 1. Scope Summary

### In Scope
- Drag-and-drop between Kanban columns
- Collapsible columns (hide terminal statuses)
- Advanced filtering (tags, company, date ranges, deadline alerts)
- Keyboard shortcuts for power users
- Stale posting indicators
- Export/Import functionality (data backup)
- Dashboard summary statistics

### Out of Scope (Later Phases)
- Scraper improvements (Phase 3)
- Connections integration improvements (Phase 4)
- Keyword analysis (Phase 5)
- Cloud sync, calendar integration (Future)

---

## 2. Feature Specifications

### 2.1 Drag-and-Drop Kanban

**Behavior:**
- Drag a card from one column to another to change status
- Visual feedback during drag (card follows cursor, drop zone highlights)
- Card snaps to new position on drop
- Status updates immediately and persists to storage
- Cancel drag with ESC key

**Implementation Approach:**
```
Option A: @dnd-kit/core (recommended)
- Lightweight, accessible, React-first
- Good touch support
- npm install @dnd-kit/core @dnd-kit/sortable

Option B: react-beautiful-dnd
- More opinionated, larger bundle
- Better animations out of box
- Note: maintenance mode, but stable
```

**Component Changes:**
| Component | Changes |
|-----------|---------|
| KanbanBoard | Wrap in DndContext |
| KanbanColumn | Make droppable zone |
| PostingCard | Make draggable |

**Drag Constraints:**
- Cards can move to any status column
- No reordering within columns (sort by dateModified)
- Visual cue for invalid drop (none currently, all drops valid)

**Accessibility:**
- Keyboard drag: focus card, press Space to pick up, arrow keys to move, Space to drop
- Screen reader announcements for drag actions

---

### 2.2 Collapsible Columns

**Behavior:**
- Click column header chevron to collapse/expand
- Collapsed column shows: status name, count badge, expand button
- Collapsed width: 48px
- Default collapsed: "Rejected" column
- Collapse state persists to storage

**Visual Design:**
```
Expanded:                    Collapsed:
┌─────────────────┐         ┌────┐
│ Rejected (5)  ▼ │         │ R  │
├─────────────────┤         │ e  │
│ ┌─────────────┐ │         │ j  │
│ │   Card      │ │    →    │ (5)│
│ └─────────────┘ │         │ ▶  │
│ ┌─────────────┐ │         └────┘
│ │   Card      │ │
│ └─────────────┘ │
└─────────────────┘
```

**State Addition:**
```typescript
interface AppSettings {
  // ... existing
  collapsedColumns: PostingStatus[];  // NEW
}
```

---

### 2.3 Advanced Filtering

**New Filter Options:**

| Filter | Type | UI Element |
|--------|------|------------|
| Tags | Multi-select | Dropdown with checkboxes |
| Company | Text/autocomplete | Input with suggestions |
| Date Added | Range | Date picker (from/to) |
| Has Deadline | Boolean | Checkbox |
| Deadline Soon | Boolean | Checkbox (next 7 days) |
| Needs Action | Boolean | Checkbox (stale > 7 days) |

**Filter Bar Design:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Search...] [Priority ▼] [Tags ▼] [Company ▼] [More Filters ▼]     │
└─────────────────────────────────────────────────────────────────────┘

"More Filters" expands to:
┌─────────────────────────────────────────────────────────────────────┐
│ Date Added: [From] - [To]                                           │
│ ☐ Has deadline  ☐ Deadline within 7 days  ☐ Needs action (stale)   │
│                                              [Clear All] [Apply]    │
└─────────────────────────────────────────────────────────────────────┘
```

**Filter State:**
```typescript
interface FilterState {
  searchQuery: string;
  priorityFilter: 1 | 2 | 3 | null;
  statusFilter: PostingStatus | null;
  // NEW:
  tagFilters: string[];           // Match ANY selected tag
  companyFilter: string;          // Partial match
  dateRange: {
    from: string | null;          // ISO date
    to: string | null;
  };
  hasDeadline: boolean;
  deadlineSoon: boolean;          // Within 7 days
  needsAction: boolean;           // No update in 7+ days
}
```

**Filter Logic:**
- All filters are AND (must match all active filters)
- Tags filter is OR (match any selected tag)
- Search query searches across: title, company, location, tags, notes

---

### 2.4 Stale Posting Indicators

**Definition:** A posting is "stale" if:
- Status is NOT terminal (not accepted, rejected, withdrawn)
- No update (dateModified) in 7+ days

**Visual Indicator:**
```
┌─────────────────────────────┐
│ ┌────┐  Software Engineer   │
│ │logo│  Anthropic          │
│ │ ⚠️ │  San Francisco, CA   │  ← Warning icon on stale cards
│ └────┘                      │
├─────────────────────────────┤
│ ★★★☆  [tag1] [tag2]   •14d │  ← Days shown in orange/red
└─────────────────────────────┘
```

**Color Coding for Days:**
| Age | Color | Style |
|-----|-------|-------|
| 0-3 days | Gray | Normal |
| 4-7 days | Orange | Normal |
| 8+ days | Red | Bold, warning icon |

**Configurable Threshold (future):**
```typescript
interface AppSettings {
  // ... existing
  staleThresholdDays: number;  // Default: 7
}
```

---

### 2.5 Keyboard Shortcuts

**Global Shortcuts (when dashboard focused):**

| Key | Action |
|-----|--------|
| `/` or `Cmd+K` | Focus search |
| `Escape` | Close panel / clear search / cancel drag |
| `?` | Show keyboard shortcuts help modal |
| `n` | New posting (open add modal) |
| `1-7` | Filter to status column (1=Saved, etc.) |
| `0` | Clear status filter (show all) |

**Card Navigation (when card focused):**

| Key | Action |
|-----|--------|
| `j` / `↓` | Next card |
| `k` / `↑` | Previous card |
| `Enter` | Open detail panel |
| `s` | Cycle priority (1→2→3→1) |
| `e` | Edit tags |
| `o` | Open original URL |
| `d` | Delete (with confirmation) |

**Detail Panel Shortcuts:**

| Key | Action |
|-----|--------|
| `Escape` | Close panel |
| `Cmd+S` | Save and close |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |

**Implementation:**
```typescript
// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        if (e.key !== 'Escape') return;
      }
      
      const key = [
        e.metaKey && 'Cmd',
        e.ctrlKey && 'Ctrl', 
        e.shiftKey && 'Shift',
        e.key
      ].filter(Boolean).join('+');
      
      shortcuts[key]?.();
    };
    
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
```

**Help Modal:**
- Triggered by `?` key
- Shows all available shortcuts organized by context
- Dismissible with ESC or click outside

---

### 2.6 Export/Import Functionality

**Export:**

```typescript
// src/utils/backup.ts
interface BackupData {
  version: 2;
  exportDate: string;
  postings: Posting[];
  connections: Connection[];
  settings: AppSettings;
}

export function exportData(data: BackupData): void {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)], 
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `jobflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}
```

**Import:**

```typescript
export async function importData(file: File): Promise<{
  postings: number;
  connections: number;
  errors: string[];
}> {
  const text = await file.text();
  const data = JSON.parse(text) as BackupData;
  
  const errors: string[] = [];
  
  // Validate version
  if (data.version !== 2) {
    // Attempt migration from v1
    data.postings = migrateV1ToV2(data.postings);
  }
  
  // Validate postings
  const validPostings = data.postings.filter(p => {
    if (!p.id || !p.title) {
      errors.push(`Invalid posting: missing id or title`);
      return false;
    }
    return true;
  });
  
  // Merge strategy: import adds/updates, doesn't delete
  const existing = await getPostings();
  const merged = mergePostings(existing, validPostings);
  
  await savePostings(merged);
  await saveConnections(data.connections || []);
  
  return {
    postings: validPostings.length,
    connections: data.connections?.length || 0,
    errors,
  };
}

function mergePostings(existing: Posting[], imported: Posting[]): Posting[] {
  const map = new Map(existing.map(p => [p.id, p]));
  
  for (const p of imported) {
    const current = map.get(p.id);
    // Import wins if newer, or if doesn't exist
    if (!current || p.dateModified > current.dateModified) {
      map.set(p.id, p);
    }
  }
  
  return Array.from(map.values());
}
```

**UI Location:**
- Settings/menu dropdown in header
- Options: "Export Data", "Import Data"
- Import shows file picker, then confirmation with count

**Import Confirmation Modal:**
```
┌─────────────────────────────────────────┐
│ Import Backup                           │
├─────────────────────────────────────────┤
│                                         │
│ File: jobflow-backup-2025-02-01.json    │
│                                         │
│ Found:                                  │
│   • 47 postings                         │
│   • 12 connections                      │
│                                         │
│ Import will merge with existing data.   │
│ Newer entries will overwrite older.     │
│                                         │
│           [Cancel]  [Import]            │
└─────────────────────────────────────────┘
```

---

### 2.7 Dashboard Summary Statistics

**Location:** Top of dashboard, below header

**Design:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 47 total  │  🆕 12 saved  │  📝 8 applied  │  💬 3 interviewing │
└─────────────────────────────────────────────────────────────────────┘
```

**Alternative - Collapsible:**
```
┌──────────────────────────────────────────────────────────────┐
│ 📊 Overview                                              [▼] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Total: 47    Active: 23    This Week: +5    Stale: 3 ⚠️    │
│                                                              │
│  By Status:                                                  │
│  Saved ████████████ 12                                       │
│  In Progress ████ 4                                          │
│  Applied ████████ 8                                          │
│  Interviewing ███ 3                                          │
│  Offer █ 1                                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Stats to Show:**
| Stat | Calculation |
|------|-------------|
| Total | All postings |
| Active | Non-terminal statuses |
| This Week | Added in last 7 days |
| Stale | Needs action (7+ days, non-terminal) |
| By Status | Count per status |

**Collapsible:** 
- Collapsed by default (just show key numbers)
- Expand for full breakdown
- Remember preference in settings

---

## 3. Implementation Tasks

### 3.1 Drag-and-Drop (Days 1-3)

- [ ] **D1.1** Install @dnd-kit/core and @dnd-kit/sortable
- [ ] **D1.2** Create DndContext wrapper in KanbanBoard
- [ ] **D1.3** Make KanbanColumn a droppable zone
- [ ] **D1.4** Make PostingCard draggable
- [ ] **D1.5** Implement onDragEnd handler (status update)
- [ ] **D1.6** Add drag overlay (card preview while dragging)
- [ ] **D1.7** Add drop zone highlighting
- [ ] **D1.8** Keyboard accessibility for drag
- [ ] **D1.9** Test across browsers

### 3.2 Collapsible Columns (Days 3-4)

- [ ] **D2.1** Add collapsedColumns to AppSettings
- [ ] **D2.2** Create CollapsedColumn component
- [ ] **D2.3** Add collapse/expand toggle to column header
- [ ] **D2.4** Persist collapse state to storage
- [ ] **D2.5** Default collapse "Rejected" column
- [ ] **D2.6** Animate collapse/expand transition

### 3.3 Advanced Filtering (Days 4-6)

- [ ] **D3.1** Extend FilterState with new fields
- [ ] **D3.2** Create TagFilterDropdown (multi-select)
- [ ] **D3.3** Create CompanyFilterInput (autocomplete)
- [ ] **D3.4** Create DateRangePicker component
- [ ] **D3.5** Create "More Filters" expandable panel
- [ ] **D3.6** Implement filter logic in usePostings hook
- [ ] **D3.7** Add "Clear All Filters" button
- [ ] **D3.8** Show active filter count badge

### 3.4 Stale Indicators (Day 6)

- [ ] **D4.1** Add isStale computed property to posting utils
- [ ] **D4.2** Add warning icon to PostingCard when stale
- [ ] **D4.3** Color-code days indicator based on age
- [ ] **D4.4** Add "Needs Action" filter option

### 3.5 Keyboard Shortcuts (Days 7-8)

- [ ] **D5.1** Create useKeyboardShortcuts hook
- [ ] **D5.2** Implement global shortcuts (search, new, escape)
- [ ] **D5.3** Implement card navigation (j/k)
- [ ] **D5.4** Implement card actions (s, e, o, d)
- [ ] **D5.5** Implement panel shortcuts
- [ ] **D5.6** Create KeyboardShortcutsModal
- [ ] **D5.7** Add keyboard hints to tooltips

### 3.6 Export/Import (Days 8-9)

- [ ] **D6.1** Create backup.ts utility functions
- [ ] **D6.2** Create ExportButton component
- [ ] **D6.3** Create ImportButton with file picker
- [ ] **D6.4** Create ImportConfirmationModal
- [ ] **D6.5** Add merge logic for imports
- [ ] **D6.6** Handle v1 backup format migration
- [ ] **D6.7** Add to settings/menu dropdown
- [ ] **D6.8** Test round-trip (export then import)

### 3.7 Summary Statistics (Days 9-10)

- [ ] **D7.1** Create useDashboardStats hook
- [ ] **D7.2** Create DashboardStats component (compact)
- [ ] **D7.3** Create expanded stats view
- [ ] **D7.4** Add collapse/expand toggle
- [ ] **D7.5** Persist expanded preference

### 3.8 Polish & Integration (Days 10-12)

- [ ] **D8.1** Integration testing all features together
- [ ] **D8.2** Performance testing with 200+ postings
- [ ] **D8.3** Accessibility audit (keyboard nav, screen readers)
- [ ] **D8.4** Responsive design check
- [ ] **D8.5** Update CLAUDE.md with new patterns
- [ ] **D8.6** Update README with new features

---

## 4. Acceptance Criteria

### 4.1 Drag-and-Drop
- [ ] User can drag card from one column to another
- [ ] Status updates on drop and persists
- [ ] Visual feedback during drag (overlay, highlight)
- [ ] Keyboard drag works (Space to grab, arrows, Space to drop)
- [ ] ESC cancels drag

### 4.2 Collapsible Columns
- [ ] User can collapse any column by clicking header
- [ ] Collapsed column shows count badge
- [ ] Collapse state persists across sessions
- [ ] Can still drag cards into collapsed columns

### 4.3 Advanced Filtering
- [ ] Can filter by multiple tags (OR logic)
- [ ] Can filter by company (partial match)
- [ ] Can filter by date range
- [ ] Can filter "has deadline" and "deadline soon"
- [ ] Can filter "needs action" (stale postings)
- [ ] Clear all filters works
- [ ] Active filter count shown

### 4.4 Stale Indicators
- [ ] Cards older than 7 days show warning icon
- [ ] Days indicator is color-coded
- [ ] "Needs action" filter shows only stale cards

### 4.5 Keyboard Shortcuts
- [ ] `/` focuses search
- [ ] `?` opens help modal
- [ ] `j/k` navigates cards
- [ ] `Enter` opens detail panel
- [ ] `Escape` closes panels/cancels actions
- [ ] All shortcuts work without conflicts

### 4.6 Export/Import
- [ ] Export downloads JSON file with all data
- [ ] Import reads JSON and merges with existing
- [ ] Import shows confirmation with counts
- [ ] Round-trip works (export → import → same data)
- [ ] V1 format imports correctly

### 4.7 Summary Statistics
- [ ] Shows total, active, this week, stale counts
- [ ] Can expand for detailed breakdown
- [ ] Updates in real-time as data changes

---

## 5. Dependencies

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0"
  }
}
```

---

## 6. Definition of Done

Phase 2 is complete when:
1. All acceptance criteria met
2. All features work together without conflicts
3. Keyboard navigation is fully functional
4. Export/Import successfully round-trips data
5. Performance acceptable with 200+ postings
6. No accessibility regressions
7. Documentation updated

---

## Appendix: Keyboard Shortcuts Quick Reference

```
GLOBAL
  /        Focus search
  Escape   Close/cancel
  ?        Show shortcuts
  n        New posting

NAVIGATION  
  j / ↓    Next card
  k / ↑    Previous card
  Enter    Open detail

CARD ACTIONS
  s        Cycle priority
  e        Edit tags
  o        Open URL
  d        Delete

STATUS FILTER
  1-7      Filter to status
  0        Show all
```