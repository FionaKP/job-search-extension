# Chrome Web Store Listing Content

## Short Description (132 chars max - in manifest.json)
Save jobs with one click, track applications on a Kanban board, and manage your entire job search in one place.

## Full Store Description

JobFlow – Personal Job Application Tracker

JobFlow is a Chrome extension that helps you track and manage job applications directly in your browser.

Save job postings with one click. The extension extracts key details such as job title, company, location, salary (if available), and description, and stores them locally in your browser.

Applications are organized in a Kanban-style board with the following stages:
Saved → In Progress → Applied → Interviewing → Offer → Accepted

Features include:
• Drag-and-drop status updates
• Interest rating (1–5 stars)
• Custom tags for filtering
• Notes for each application
• Contact tracking
• Stale application indicators

Search and filter by status, tags, company, interest level, or date range.

Keyboard shortcuts:
• / to search
• ? to view shortcuts
• Number keys to filter by status

All data is stored locally in your browser. No account is required. Data can be exported as JSON for backup.

---

## Category
**Productivity**

## Language
**English**

---

## Privacy Practices Tab

### Single Purpose Description
JobFlow helps users save, organize, and track job applications from any job posting website using a visual Kanban board dashboard.

### Permission Justifications

#### activeTab
"activeTab is required to read job posting content from the current tab when the user clicks the extension icon. This allows JobFlow to extract job details (title, company, location, description) from the page the user is viewing. The permission is only activated when the user explicitly clicks the extension icon."

#### Host Permissions (<all_urls>)
"Host permission for all URLs is required because job postings appear on thousands of different websites (company career pages, job boards, applicant tracking systems). JobFlow needs to run its content script on any page to detect and extract job posting information when the user wants to save a job. No data is collected or transmitted - all extraction happens locally."

#### Storage
"Storage permission is used to save the user's job applications, connections, and preferences locally in Chrome's storage. All data remains on the user's device and is never transmitted to external servers. Users can export their data at any time."

#### Remote Code
"This extension does NOT use remote code. All JavaScript is bundled within the extension package. Select 'No' for remote code usage if this is a dropdown, or clarify: No remote code is loaded or executed."

### Data Usage Certification
- This extension does NOT collect any user data
- This extension does NOT transmit any data to external servers
- All data is stored locally in the user's browser using Chrome's storage API
- Users can export all their data as JSON at any time
- No analytics, tracking, or third-party services are used

---

## Required Assets Checklist

### Icon (Required)
- [x] 128x128 PNG icon - already in extension

### Screenshots (Required - at least 1)
Recommended: 1280x800 or 640x400 PNG/JPG
Suggested screenshots:
1. Kanban board dashboard with job cards
2. Extension popup saving a job
3. Job detail panel open
4. Filtering/search in action
5. Connections page

### Promotional Images (Optional but recommended)
- Small promo tile: 440x280
- Marquee: 1400x560

---

## Additional Store Settings

### Visibility
- Public (visible to everyone)

### Distribution
- All regions (or select specific countries)

### Mature Content
- No mature content

### Google Analytics
- Not required (we don't track users)
