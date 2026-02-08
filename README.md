# JobFlow - Job Application Tracker Chrome Extension

A Chrome extension to help job seekers track and manage their job applications directly from job posting pages.

## Project Vision

Job hunting is overwhelming. You apply to dozens of positions across LinkedIn, Indeed, company career pages, and more—and quickly lose track of where you applied, when, and what the status is. This extension solves that by letting you save job postings with one click, automatically extracting key details, and providing a powerful dashboard to manage your entire job search.

## Features

### One-Click Save
- Click the extension icon on any job posting page
- Automatically captures the URL and extracts job details
- Manual override for any auto-detected fields
- Interest rating (1-5 stars) for ranking opportunities
- Add tags and notes before saving

### Smart Scraping
- Extracts job title, company name, location, salary, and full description
- Automatic company logo detection
- **Supported Sites:**
  - LinkedIn
  - Indeed
  - Glassdoor
  - Greenhouse
  - Lever
  - Workday
  - Wellfound (AngelList)
  - Generic job pages (fallback)
- Fallback to manual entry when scraping fails

### Kanban Dashboard
- Visual Kanban board with 8 status columns
- Drag-and-drop cards between columns
- **Collapsible columns** with animated folder-style tabs on the right
- **Resizable column widths** (drag to resize, persisted to localStorage)
- List view alternative for quick scanning
- Real-time search across title, company, location, notes, and tags

### Sidebar Navigation
- Collapsible wine-colored sidebar with navigation
- **Integrated stats panel** showing:
  - Total, Active, and This Week counts
  - Stale posting warnings
  - Expandable status breakdown with progress bars
- Quick access to Jobs and Connections pages
- Keyboard shortcuts hint

### Advanced Filtering
- Filter by interest level, status, tags, and company
- Date range filtering for when jobs were added
- "Has deadline" and "Deadline soon" filters
- "Needs action" filter for stale postings (7+ days without update)
- Connection filters (has connections / no connections)
- Clear all filters with one click

### Connections Tracking
- Track recruiters, employees, referrals, and other contacts
- Link connections to specific job postings
- Log contact history (emails, calls, meetings, LinkedIn messages)
- Relationship strength tracking (weak/moderate/strong)
- Follow-up date reminders
- View all postings linked to a connection

### Keyword Analysis
- Automatic extraction of keywords from job descriptions
- Categorized keywords: required skills, preferred skills, tools, experience, education
- Importance levels (high/medium/low)
- Track which keywords you've addressed in your application

### Stale Posting Indicators
- Visual warning icons on cards that haven't been updated in 7+ days
- Color-coded age indicators (gray: 0-3d, orange: 4-7d, red: 8+d)
- Quick identification of applications needing attention

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `/` or `⌘K` | Focus search |
| `?` | Show shortcuts help |
| `j/k` or `↑/↓` | Navigate cards |
| `Enter` or `e` | Open detail panel |
| `s` | Cycle interest level |
| `o` | Open original URL |
| `d` | Delete posting |
| `n` | Add new posting |
| `1-7` | Filter by status |
| `0` | Clear status filter |
| `Esc` | Close panel / clear search |

### Data Backup
- Export all data (postings + connections) to JSON file
- Import with smart merge (newer entries win)
- V1 format migration support

### Status Workflow

```
[Saved] → [In Progress] → [Applied] → [Interviewing] → [Offer] → [Accepted]
                                  ↘              ↘         ↘
                                [Rejected]   [Rejected]  [Withdrawn]
                                     ↓
                                [Withdrawn] (can happen from any stage)
```

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5 with CRXJS plugin
- **Styling:** Tailwind CSS with custom vintage color palette
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Storage:** Chrome Storage API (local)
- **Chrome Extension:** Manifest V3

### Color Palette
The UI uses a custom "vintage" color palette:
- **Wine** - Primary dark color (sidebar, accents)
- **Champagne** - Light backgrounds
- **Pandora** - Gold/amber accent
- **Teal** - Success/applied states
- **Flatred** - Rejected/danger states
- **Sage** - Neutral/withdrawn states

## Project Structure

```
job-tracker-extension/
├── manifest.json              # Chrome extension manifest (V3)
├── vite.config.ts             # Vite + CRXJS configuration
├── tailwind.config.js         # Tailwind with custom colors
├── package.json
├── src/
│   ├── main.tsx               # Dashboard entry point
│   ├── App.tsx                # Main app component
│   ├── index.css              # Global styles + animations
│   ├── styles/
│   │   └── design-system.css  # CSS custom properties
│   ├── popup/                 # Extension popup
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── PopupApp.tsx
│   ├── content/
│   │   ├── scraper.ts         # Content script
│   │   ├── parsers/           # Site-specific parsers
│   │   │   ├── linkedin.ts
│   │   │   ├── indeed.ts
│   │   │   ├── glassdoor.ts
│   │   │   ├── greenhouse.ts
│   │   │   ├── lever.ts
│   │   │   ├── workday.ts
│   │   │   ├── wellfound.ts
│   │   │   └── generic.ts     # Fallback parser
│   │   └── utils/
│   │       └── logo.ts        # Logo extraction utilities
│   ├── components/
│   │   ├── layout/            # Sidebar, SidebarStats
│   │   ├── dashboard/         # Kanban, ListView, Header, etc.
│   │   ├── posting/           # PostingCard, EditPostingModal
│   │   ├── connections/       # Connection management
│   │   ├── keywords/          # Keyword analysis
│   │   └── common/            # Shared UI components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useDashboardStats.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── services/
│   │   ├── storage.ts         # Chrome storage operations
│   │   ├── migration.ts       # V1→V2→V3 migrations
│   │   └── keywords.ts        # Keyword extraction
│   ├── types/                 # TypeScript interfaces
│   └── utils/
│       ├── backup.ts          # Export/Import
│       └── logo.ts            # Logo URL helpers
└── dist/                      # Build output (load this in Chrome)
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
npm run lint
```

### Loading the Extension

1. Run `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `dist/` folder
5. The extension icon should appear in your toolbar

### Testing

1. Navigate to any job posting (LinkedIn, Indeed, Glassdoor, etc.)
2. Click the extension icon
3. Review/edit the auto-detected job details
4. Set your interest level (1-5 stars)
5. Add tags and notes
6. Click "Save to JobFlow"
7. Click the dashboard icon to see your saved applications

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
  interest: 1 | 2 | 3 | 4 | 5;  // Interest level (stars)
  tags: string[];
  notes: string;
  dateAdded: number;
  dateModified: number;
  dateApplied?: number;
  nextActionDate?: string;
  connectionIds: string[];
  keywords?: ExtractedKeyword[];
  keywordsExtractedAt?: number;
}

interface Connection {
  id: string;
  name: string;
  email?: string;
  linkedInUrl?: string;
  company: string;
  role?: string;
  relationshipType: 'recruiter' | 'employee' | 'referral' | 'alumni' | 'other';
  relationshipStrength: 1 | 2 | 3;
  notes: string;
  lastContactDate?: string;
  nextFollowUp?: string;
  contactHistory: ContactEvent[];
  linkedPostingIds: string[];
  dateAdded: number;
  dateModified: number;
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
- No external servers or accounts required
- No tracking or analytics
- Job posting content is only processed locally
- Company logos are fetched from public favicon/logo services

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
- [x] Collapsible columns with folder-style tabs
- [x] Resizable column widths
- [x] Advanced filtering (tags, company, dates)
- [x] Stale posting indicators
- [x] Keyboard shortcuts
- [x] Export/Import functionality
- [x] Dashboard summary statistics

### Phase 3: Scraper Improvements ✅
- [x] Update selectors for job sites
- [x] Add Glassdoor, Workday, Wellfound parsers
- [x] Company logo extraction
- [x] Better confidence scoring

### Phase 4: Connections ✅
- [x] Contact/recruiter tracking
- [x] Link connections to postings
- [x] Contact history logging
- [x] Relationship strength tracking
- [x] Connections page with filtering

### Phase 5: Keywords & Analytics (Partial)
- [x] Keyword extraction from descriptions
- [x] Keyword categorization
- [ ] Application statistics dashboard
- [ ] Success rate tracking

### Phase 6: UI Polish ✅
- [x] Vintage color palette design system
- [x] Sidebar navigation with integrated stats
- [x] Fixed sidebar tabs with hover animations
- [x] Responsive column resizing

### Future Ideas
- [ ] Calendar integration
- [ ] Browser notifications for follow-ups
- [ ] Resume keyword matching
- [ ] Interview scheduling
- [ ] Salary comparison tools

## License

MIT License - Use freely for your own job search!

---

*Built to make the job hunt a little less chaotic.* 🎯
