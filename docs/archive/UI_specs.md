JobFlow Dashboard & Extension - Design Reference & Best Practices
1. PIPELINE/ROADMAP VIEW (Top Priority)
Visual Design:

Horizontal pipeline display showing job application stages:

BOOKMARKED → APPLYING → APPLIED → INTERVIEWING → NEGOTIATING → ACCEPTED


Count badge on first stage (shows "3 BOOKMARKED") with soft peachy/tan background color
Stage headers with dashes "– –" for empty stages, clear typography
Visual progression - feels like a roadmap/journey through application funnel
Sticky/fixed position - remains visible when scrolling down the table

Design Elements:

Soft, muted colors for each stage
Clear stage names in ALL CAPS
Numbers/counts visible for tracking progress
Can be clickable to filter table below by stage

Why This Works:

Users immediately see their job search progress
Provides quick overview of where they stand
Motivational - seeing "ACCEPTED" column creates goal-oriented feeling
Better than grid-only view for understanding application funnel


2. TABLE/DATA GRID LAYOUT
Structure (Alternative to Pure Grid):

Top bar with metadata:

Checkbox for bulk selection ("0 selected")
Group/sort controls
View options (Columns, Menu)
Primary CTA: "Add a New Job" button (green/teal with icon)



Column Headers:

Job Position | Company | Max. Salary | Location | Status | Date Saved | Deadline | Date Applied | Follow-up

Key Features to Implement:

Sortable columns - Click headers to sort by different fields
Resizable columns - Users can adjust column width
Checkbox selection - Select individual or all jobs for bulk actions
Status badge - "Bookmarked" tag in status column (color-coded)
Horizontal scrolling - For wide tables on smaller screens
Empty state - Clear message when no jobs tracked

Don't Love Grid? Consider Alternatives:

Card view toggle - Show jobs as cards instead of table rows
Kanban view - Drag jobs between pipeline stages (BOOKMARKED → APPLYING, etc.)
List view - Compact, minimal styling with expandable details
Timeline view - Show deadlines and follow-ups chronologically


3. SIDEBAR NAVIGATION (Left Column)
Structure:

Teal icon at top (expandable menu)
Main navigation items with icons:

🏠 Home
📄 Resume Builder
➜ Trackers (Job Tracker)
🔍 Job Search
🤖 AI Job Search
🔗 Extension
🛠️ All Tools
💰 Referrals
📚 Support Center
⚙️ Account Settings



Design Notes:

Vertical icon-based navigation
Icons are clear and recognizable
Hover states should highlight the item
Active state should show different color or background
Expandable/collapsible menu icon at top (hamburger style)


4. TOP NAVIGATION
Tab System:

Three main tabs at page level: Jobs | People | Companies
Tab styling: Light background, underline for active state
Clean, minimalist appearance


5. COLOR PALETTE
see phase6specs.md color pallate section

6. BUTTON STYLES
Primary CTA:

"Add a New Job" button (green/teal)
Style: Solid background, rounded, with icon (+ plus circle)
Text: White, bold, medium weight
Hover state: Slightly darker shade

Secondary Buttons:

"Columns", "Menu" buttons
Style: Outline/border only, light background on hover
Icon + text combination
Gray text

Dropdown/Combobox:

"Group by: None" selector
Style: Simple input field with down arrow
Border: Light gray


7. INFORMATION HIERARCHY
Page Structure:

Tab navigation (top) - Secondary navigation
Pipeline/Roadmap (sticky) - Quick overview and status
Controls bar - Selection, grouping, filtering, view options
Data grid/table - Main content
Empty states - When no data available

Visual Weight:

Stage counts have highest visual weight (bold, colored background)
Column headers are clear and darker
Row data is readable but secondary
Status badges stand out with subtle background color


8. CHROME EXTENSION DESIGN CONSIDERATIONS
Popup Size & Layout:

Width: 400-500px (standard popup width)
Height: 600-700px (scrollable if needed)
Padding: Consistent 16-20px margins

Key Extension Features to Show:

One-click job save - Save current job posting
Quick preview - Show captured job details
Application tracker - Link back to dashboard
Keyboard shortcuts - Quick save (e.g., Cmd+S)
Job details extraction - Auto-fill job title, company, salary, location

Extension UI Elements:

Header with Teal branding
Job details section - Title, company, location, salary
Save button (primary CTA, green/teal)
Skip/Cancel link
Options icon - Settings/preferences


9. SPACING & TYPOGRAPHY
Spacing:

Padding: 16px, 20px, 24px (multiples of 4)
Margin between sections: 20-24px
Row height in table: ~48-56px
Column gap: 16-20px

Typography:

Headings (H1): Bold, 24-28px
Headings (H2): Bold, 18-20px
Body text: Regular, 14-16px
Labels: Medium, 12-14px, gray color
Font: Modern sans-serif (Inter, Roboto, or similar)


10. INTERACTIVE ELEMENTS & FLOW
Selecting a Job:

Checkbox on left side of row
Highlight entire row on hover
Show selected count: "0 selected" → "1 selected"

Adding a New Job:

CTA: Green "+ Add a New Job" button (top right)
Action: Opens modal or new page with job entry form
Fields: Job title, company, location, salary, deadline, link

Filtering/Grouping:

Group by dropdown: None, Company, Status, Location, Salary Range
Sort capability: Click column headers to sort
Search: Search field to find specific jobs

Status Updates:

Click status badge to change stage
Drag job card between pipeline stages (if Kanban view)
Auto-update with timestamps


11. WHAT TO KEEP FROM TEAL HQ
✅ Pipeline roadmap at top - Critical for user engagement
✅ Stage counts/badges - Motivates users
✅ Clean table layout - Easy to scan
✅ Status color coding - Quick visual scanning
✅ Teal + golden yellow color scheme - Professional, energetic
✅ Icon-based sidebar - Clean, minimalist
✅ Bulk selection - Power users appreciate this
✅ Column customization - Let users choose what they see
✅ Clear CTAs - "Add a New Job" is prominent

12. OPPORTUNITIES TO IMPROVE OVER TEAL HQ
🚀 Kanban view - Drag jobs between pipeline stages (more interactive)
🚀 Better mobile layout - Responsive card view on mobile
🚀 Keyboard shortcuts - Power user features
🚀 Dark mode - User preference toggle
🚀 Timeline/calendar view - Visualize deadlines
🚀 Analytics dashboard - Show stats (response rate, average time to interview, etc.)
🚀 Custom stages - Let users create their own pipeline stages
🚀 Notes/comments - Per-job thoughts and follow-up notes
🚀 Integration alerts - Show when company has new positions
🚀 Resume match score - Show how well your resume matches each job

13. EXTENSION INTEGRATION CHECKLIST

 Auto-detect job postings on LinkedIn, Indeed, Glassdoor, etc.
 One-click save to JobFlow dashboard
 Show if job is already in tracker (avoid duplicates)
 Display quick job details in popup (title, company, salary, location)
 Context menu option: "Save to JobFlow"
 Keyboard shortcut for quick save
 Show link to job in original posting
 Extract and pre-fill job details in form
 Notification when job posting is updated


14. RECOMMENDED TECH STACK
Frontend:

React (component-based UI)
TailwindCSS or styled-components (styling)
React Table or TanStack Table (data grid)
Zustand or Redux (state management)

Backend:

Node.js/Express or Python/Flask
PostgreSQL or MongoDB (data storage)
Socket.io (real-time updates)

Chrome Extension:

Manifest v3
Content scripts for page detection
Background workers for data sync
Service workers for lifecycle management