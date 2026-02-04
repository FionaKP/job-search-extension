# JobFlow - Job Application Tracker Chrome Extension

A Chrome extension to help job seekers track and manage their job applications directly from job posting pages.

## Project Vision

Job hunting is overwhelming. You apply to dozens of positions across LinkedIn, Indeed, company career pages, and more—and quickly lose track of where you applied, when, and what the status is. This extension solves that by letting you save job postings with one click, automatically extracting key details, and providing a powerful dashboard to manage your entire job search.

## Features

### Core Features

**One-Click Save**
- Click the extension icon on any job posting page
- Automatically captures the URL and extracts job details
- Manual override for any auto-detected fields
- Priority rating (1-3 stars) for ranking opportunities

**Smart Scraping**
- Extracts job title, company name, location, and description from common job sites
- Supports LinkedIn, Indeed, Greenhouse, Lever, and generic job pages
- Fallback to manual entry when scraping fails

**Kanban Dashboard**
- Visual Kanban board with drag-and-drop between status columns
- Collapsible columns (default: Rejected column collapsed)
- List view alternative for quick scanning
- Real-time search across title, company, location, notes, and tags

**Advanced Filtering**
- Filter by priority, status, tags, and company
- Date range filtering for when jobs were added
- "Has deadline" and "Deadline soon" filters
- "Needs action" filter for stale postings (7+ days without update)

**Stale Posting Indicators**
- Visual warning icons on cards that haven't been updated in 7+ days
- Color-coded age indicators (gray: 0-3d, orange: 4-7d, red: 8+d)
- Quick identification of applications needing attention

**Keyboard Shortcuts**
- `/` or `⌘K` - Focus search
- `?` - Show shortcuts help
- `j/k` or `↑/↓` - Navigate cards
- `Enter` or `e` - Open detail panel
- `s` - Cycle priority
- `o` - Open original URL
- `d` - Delete posting
- `1-7` - Filter by status
- `0` - Clear status filter
- `Esc` - Close panel/clear search
- `⌘S` - Save and close panel

**Dashboard Statistics**
- Summary bar showing total, active, this week, and stale counts
- Expandable breakdown by status with visual bars
- Real-time updates as data changes

**Data Backup**
- Export all data to JSON file
- Import with smart merge (newer entries win)
- V1 format migration support

### Status Workflow

```
[Saved] → [In Progress] → [Applied] → [Interviewing] → [Offer] → [Accepted]
                                  ↘              ↘         ↘
                                [Rejected]   [Rejected]  [Declined]
                                     ↓
                                [Withdrawn] (can happen from any stage)
```

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite with CRXJS plugin
- **Styling:** Tailwind CSS
- **Drag & Drop:** @dnd-kit/core
- **Storage:** Chrome Storage API (local)
- **Chrome Extension:** Manifest V3

## Project Structure

```
job-tracker-extension/
├── manifest.json
├── vite.config.ts
├── tailwind.config.js
├── package.json
├── src/
│   ├── main.tsx                 # Dashboard entry
│   ├── App.tsx                  # Main app component
│   ├── popup/                   # Extension popup
│   │   ├── popup.html
│   │   ├── Popup.tsx
│   │   └── PopupApp.tsx
│   ├── content/
│   │   └── scraper.ts           # Content script
│   ├── components/
│   │   ├── dashboard/           # Dashboard components
│   │   ├── posting/             # Posting card components
│   │   └── common/              # Shared components
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # Storage, migration
│   ├── types/                   # TypeScript interfaces
│   └── utils/                   # Utilities (backup, etc.)
└── dist/                        # Build output
```

## Getting Started

### Development Setup

```bash
# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

### Loading the Extension

1. Run `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `dist/` folder
5. The extension icon should appear in your toolbar

### Testing

1. Navigate to any job posting (LinkedIn, Indeed, etc.)
2. Click the extension icon
3. Review/edit the auto-detected job details
4. Click "Save Posting"
5. Click "Open Dashboard" to see your saved applications

## Data Model

```typescript
interface Posting {
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

type PostingStatus =
  | 'saved'
  | 'in_progress'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';
```

## Privacy

- All data is stored locally in your browser
- No external servers or accounts
- No tracking or analytics
- Job posting content is only processed locally

## Roadmap

### Phase 1: Foundation ✅
- [x] React + TypeScript migration
- [x] Vite + CRXJS build setup
- [x] Kanban board with columns
- [x] List view alternative
- [x] Detail panel for editing
- [x] V1 → V2 data migration

### Phase 2: Core Interaction Polish ✅
- [x] Drag-and-drop between columns
- [x] Collapsible columns
- [x] Advanced filtering (tags, company, dates)
- [x] Stale posting indicators
- [x] Keyboard shortcuts
- [x] Export/Import functionality
- [x] Dashboard summary statistics

### Phase 3: Scraper Improvements (Planned)
- [ ] Update selectors for job sites
- [ ] Add more job site support
- [ ] Better error handling

### Phase 4: Connections (Planned)
- [ ] Contact/recruiter tracking
- [ ] Link connections to postings
- [ ] Follow-up reminders

### Phase 5: Analytics (Planned)
- [ ] Application statistics
- [ ] Keyword analysis
- [ ] Success rate tracking

## License

MIT License - Use freely for your own job search!

---

*Built to make the job hunt a little less chaotic.* 🎯
