# Job Application Tracker Chrome Extension

A Chrome extension to help job seekers track and manage their job applications directly from job posting pages.

## Project Vision

Job hunting is overwhelming. You apply to dozens of positions across LinkedIn, Indeed, company career pages, and more—and quickly lose track of where you applied, when, and what the status is. This extension solves that by letting you save job postings with one click, automatically extracting key details, and providing a dashboard to manage your entire job search.

## Features

### Core Features (MVP)

**One-Click Save**
- Click the extension icon on any job posting page
- Automatically captures the URL and attempts to extract job details
- Manual override for any auto-detected fields

**Smart Scraping**
- Extracts job title, company name, and description from common job sites
- Supports LinkedIn, Indeed, Greenhouse, Lever, and generic job pages
- Fallback to manual entry when scraping fails

**Application Dashboard**
- View all saved applications in one place
- Filter by status (Saved, Applied, Interviewing, Offer, Rejected, Withdrawn)
- Search by company or job title
- Sort by date added or company name

**Status Tracking**
- Update application status as you progress
- Add notes to each application
- Track application date

### Future Enhancements (Post-MVP)

- Export to CSV/spreadsheet
- Application statistics and analytics
- Reminder notifications for follow-ups
- Integration with calendar for interviews
- Browser sync across devices
- Salary range tracking
- Contact/recruiter info storage

## Technical Architecture

```
job-tracker-extension/
├── manifest.json           # Chrome extension manifest (v3)
├── README.md
├── icons/                  # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── popup/              # Extension popup UI
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── content/            # Content scripts for page scraping
│   │   └── scraper.js
│   ├── dashboard/          # Full dashboard page
│   │   ├── dashboard.html
│   │   ├── dashboard.js
│   │   └── dashboard.css
│   └── utils/              # Shared utilities
│       └── storage.js
```

## Data Model

```javascript
// Single job application
{
  id: "uuid-string",
  url: "https://company.com/jobs/123",
  company: "Company Name",
  title: "Software Engineer",
  location: "Remote / City, State",
  description: "First ~500 chars of job description",
  salary: "Range if available",
  status: "saved" | "applied" | "interviewing" | "offer" | "rejected" | "withdrawn",
  dateAdded: "ISO timestamp",
  dateApplied: "ISO timestamp or null",
  notes: "User notes",
  tags: ["remote", "startup", "fintech"]  // User-defined categories
}
```

## Status Workflow

```
[Saved] → [Applied] → [Interviewing] → [Offer] → [Accepted]
                   ↘              ↘         ↘
                  [Rejected]   [Rejected]  [Declined]
                       ↓
                  [Withdrawn] (can happen from any stage)
```

## Getting Started

### Development Setup

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `job-tracker-extension` folder
5. The extension icon should appear in your toolbar

### Testing

1. Navigate to any job posting (LinkedIn, Indeed, etc.)
2. Click the extension icon
3. Review/edit the auto-detected job details
4. Click "Save Application"
5. Click "View Dashboard" to see your saved applications

## Supported Job Sites

The scraper includes specific selectors for:

| Site | Title | Company | Location | Description |
|------|-------|---------|----------|-------------|
| LinkedIn | ✅ | ✅ | ✅ | ✅ |
| Indeed | ✅ | ✅ | ✅ | ✅ |
| Greenhouse | ✅ | ✅ | ✅ | ✅ |
| Lever | ✅ | ✅ | ✅ | ✅ |
| Generic | 🔄 | 🔄 | 🔄 | 🔄 |

✅ = Specific selectors | 🔄 = Best-effort detection

## Storage

Uses Chrome's `storage.local` API for persistence:
- Data stays on your device
- No account required
- Survives browser restarts
- Can be synced if you switch to `storage.sync` (with size limits)

## Privacy

- All data is stored locally in your browser
- No external servers or accounts
- No tracking or analytics
- Job posting content is only processed locally

## Contributing

This is a personal project, but feel free to fork and adapt for your own use!

## Roadmap

### Phase 1: Foundation ✅
- [x] Project structure
- [x] Basic manifest and extension setup
- [x] Popup UI for adding jobs
- [x] Content script for scraping
- [x] Dashboard page
- [x] Local storage utilities

### Phase 2: Core Functionality
- [ ] Refine scraping for major job sites
- [ ] Add filtering and search to dashboard
- [ ] Implement status update flow
- [ ] Add notes functionality
- [ ] Polish UI/UX

### Phase 3: Enhancements
- [ ] Export functionality
- [ ] Statistics/analytics view
- [ ] Tags and categorization
- [ ] Keyboard shortcuts

### Phase 4: Advanced
- [ ] Cross-device sync
- [ ] Reminder system
- [ ] Calendar integration

## License

MIT License - Use freely for your own job search!

---

*Built to make the job hunt a little less chaotic.* 🎯
