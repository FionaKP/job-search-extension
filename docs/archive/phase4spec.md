# Phase 4 Specification: Connections Integration
## JobFlow Chrome Extension

**Goal:** Make networking a first-class part of the job search workflow by deeply integrating connections with job postings.

**Timeline:** 1.5-2 weeks (solo developer)

**Predecessor:** Phase 3 complete (robust scraper, preview modal)

---

## 1. Scope Summary

### In Scope
- Redesigned connections management
- Link connections to job postings (bidirectional)
- Connection indicators on posting cards
- "Needs networking" filter
- Connection follow-up reminders
- Quick-add connection from posting detail
- Connection notes and history

### Out of Scope (Later Phases)
- Keyword analysis (Phase 5)
- Visual design polish (Phase 6)
- LinkedIn integration / auto-import
- Email integration

---

## 2. Feature Specifications

### 2.1 Connection Data Model

**Current (V1):**
```typescript
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

**Enhanced (V4):**
```typescript
interface Connection {
  id: string;
  name: string;
  email?: string;
  linkedInUrl?: string;
  company: string;
  role?: string;
  
  // Relationship
  relationshipType: 'recruiter' | 'employee' | 'referral' | 'alumni' | 'other';
  howWeMet?: string;
  relationshipStrength: 1 | 2 | 3;  // 1=weak, 2=moderate, 3=strong
  
  // Communication
  notes: string;
  lastContactDate?: string;
  nextFollowUp?: string;
  contactHistory: ContactEvent[];
  
  // Links
  linkedPostingIds: string[];
  
  // Meta
  dateAdded: number;
  dateModified: number;
}

interface ContactEvent {
  id: string;
  date: string;
  type: 'email' | 'call' | 'meeting' | 'linkedin' | 'other';
  notes?: string;
}
```

### 2.2 Connections Panel in Posting Detail

**Location:** Section in PostingDetailPanel, below notes

**Design:**
```
┌──────────────────────────────────────────────────────────┐
│ Connections (2)                              [+ Add]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 👤 Sarah Chen                                      │  │
│  │    Recruiter @ Anthropic                           │  │
│  │    Last contact: Jan 15 · Follow up: Feb 1 ⚠️     │  │
│  │    [Message] [View] [Unlink]                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 👤 Mike Johnson                                    │  │
│  │    Senior Engineer @ Anthropic                     │  │
│  │    Last contact: Dec 20 · Referral contact         │  │
│  │    [Message] [View] [Unlink]                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  💡 No referral yet? Find connections at this company   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Actions:**
| Action | Behavior |
|--------|----------|
| + Add | Opens connection search/create modal |
| Message | Opens email client with pre-filled template (future) |
| View | Opens connection detail panel |
| Unlink | Removes link (doesn't delete connection) |

### 2.3 Connection Card on Dashboard

**PostingCard Enhancement:**
```
┌─────────────────────────────┐
│ ┌────┐  Software Engineer   │
│ │logo│  Anthropic          │
│ └────┘  San Francisco, CA   │
├─────────────────────────────┤
│ ★★★☆  [tag1]  👥2      •3d │  ← 👥2 = 2 connections linked
└─────────────────────────────┘
```

**Behavior:**
- Show connection count badge if > 0
- Hover shows connection names tooltip
- Click badge opens posting detail to connections section

### 2.4 "Needs Networking" Filter

**Location:** Filter bar, under "More Filters"

**Options:**
- ☐ Has connections (postings with 1+ linked connections)
- ☐ Needs networking (postings with 0 connections, non-terminal status)
- ☐ Follow-up due (connections with overdue nextFollowUp)

**Use Case:** Identify opportunities where you should find a referral or contact.

### 2.5 Connections Management Page

**Access:** Settings menu → "Manage Connections" or dedicated nav item

**Design:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Connections                                    [Search] [+ Add]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Filter: [All ▼] [Company ▼] [Follow-up Due ▼]                      │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤 Sarah Chen                                                   │ │
│ │    Recruiter @ Anthropic · Strong connection                    │ │
│ │    Linked to: 2 postings · Last contact: Jan 15                 │ │
│ │    ⚠️ Follow-up due: Feb 1                                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤 Mike Johnson                                                 │ │
│ │    Senior Engineer @ Anthropic · Moderate connection            │ │
│ │    Linked to: 1 posting · Last contact: Dec 20                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤 Lisa Park                                                    │ │
│ │    Hiring Manager @ Google · Weak connection                    │ │
│ │    Linked to: 0 postings · Last contact: Nov 5                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.6 Add/Edit Connection Modal

**Design:**
```
┌──────────────────────────────────────────────────────────┐
│ Add Connection                                      [X]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Name *                                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Sarah Chen                                         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Company *                                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Anthropic                                          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Role                                                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Technical Recruiter                                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Type                                                    │
│  ( ) Recruiter  (•) Employee  ( ) Referral              │
│  ( ) Alumni     ( ) Other                                │
│                                                          │
│  Relationship Strength                                   │
│  ○○● Strong (met in person, ongoing relationship)        │
│                                                          │
│  How did you meet?                                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Career fair at WPI, Oct 2024                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  LinkedIn URL                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ https://linkedin.com/in/sarahchen                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Email                                                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │ sarah.chen@anthropic.com                           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  Link to Postings                                        │
│  [Anthropic - SWE ✓] [Anthropic - PM ✓] [+ Link more]   │
│                                                          │
│               [Cancel]        [Save Connection]          │
└──────────────────────────────────────────────────────────┘
```

### 2.7 Connection Detail View

**Design:**
```
┌──────────────────────────────────────────────────────────┐
│ ← Back                                     [Edit] [Delete]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  👤 Sarah Chen                                           │
│     Technical Recruiter @ Anthropic                      │
│     ●●● Strong connection                                │
│                                                          │
│  📧 sarah.chen@anthropic.com                             │
│  🔗 linkedin.com/in/sarahchen                            │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│  How we met                                              │
│  Career fair at WPI, Oct 2024                            │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│  Contact History                              [+ Add]    │
│                                                          │
│  Feb 1, 2025 · Email                                     │
│  Followed up on application status                       │
│                                                          │
│  Jan 15, 2025 · LinkedIn                                 │
│  She reached out about open positions                    │
│                                                          │
│  Oct 10, 2024 · Meeting                                  │
│  Met at WPI career fair, discussed engineering roles     │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│  Linked Postings (2)                                     │
│                                                          │
│  • Senior Software Engineer @ Anthropic (Applied)        │
│  • Product Manager @ Anthropic (Saved)                   │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│  Next Follow-up                                          │
│  [Feb 15, 2025] ⚠️ In 3 days                            │
│                                                          │
│  Notes                                                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Very responsive, seems genuinely interested in     │  │
│  │ helping. Mentioned they're expanding the team.     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.8 Quick Link Connection (From Posting)

When clicking "+ Add" in the posting's connection section:

```
┌──────────────────────────────────────────────────────────┐
│ Link Connection                                     [X]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Search existing connections:                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🔍 Type to search...                               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Suggestions (same company):                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ○ Sarah Chen - Recruiter @ Anthropic               │  │
│  │ ○ Mike Johnson - Engineer @ Anthropic              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ─────────────── or ───────────────                      │
│                                                          │
│  [+ Create New Connection]                               │
│                                                          │
│               [Cancel]        [Link Selected]            │
└──────────────────────────────────────────────────────────┘
```

**Smart Suggestions:** Auto-suggest connections at the same company as the posting.

---

## 3. Implementation Tasks

### 3.1 Data Model Updates (Days 1-2)

- [ ] **C1.1** Update Connection interface with new fields
- [ ] **C1.2** Create ContactEvent interface
- [ ] **C1.3** Update storage service for connections
- [ ] **C1.4** Create migration for existing connections (add defaults)
- [ ] **C1.5** Add connections to export/import

### 3.2 Connections Management Page (Days 3-5)

- [ ] **C2.1** Create ConnectionsList component
- [ ] **C2.2** Create ConnectionCard component
- [ ] **C2.3** Add search and filtering
- [ ] **C2.4** Add "follow-up due" indicator
- [ ] **C2.5** Create routing/navigation to connections page

### 3.3 Add/Edit Connection Modal (Days 5-6)

- [ ] **C3.1** Create ConnectionFormModal component
- [ ] **C3.2** Add all form fields with validation
- [ ] **C3.3** Add relationship type selector
- [ ] **C3.4** Add relationship strength selector
- [ ] **C3.5** Add posting link selector
- [ ] **C3.6** Handle create and edit modes

### 3.4 Connection Detail View (Days 7-8)

- [ ] **C4.1** Create ConnectionDetailPanel component
- [ ] **C4.2** Display all connection info
- [ ] **C4.3** Add contact history section
- [ ] **C4.4** Add "Log Contact" functionality
- [ ] **C4.5** Show linked postings
- [ ] **C4.6** Add follow-up date management

### 3.5 Posting Integration (Days 9-10)

- [ ] **C5.1** Add connections section to PostingDetailPanel
- [ ] **C5.2** Create ConnectionBadge for PostingCard
- [ ] **C5.3** Create QuickLinkModal with search
- [ ] **C5.4** Add smart suggestions (same company)
- [ ] **C5.5** Update posting when connections linked/unlinked

### 3.6 Filtering (Days 10-11)

- [ ] **C6.1** Add "Has connections" filter
- [ ] **C6.2** Add "Needs networking" filter
- [ ] **C6.3** Add "Follow-up due" filter
- [ ] **C6.4** Update filter UI in dashboard header

### 3.7 Polish (Days 11-12)

- [ ] **C7.1** Test bidirectional linking
- [ ] **C7.2** Handle edge cases (delete connection, delete posting)
- [ ] **C7.3** Add empty states
- [ ] **C7.4** Ensure export/import includes connections properly

---

## 4. Acceptance Criteria

### 4.1 Connection Management
- [ ] Can create new connections with all fields
- [ ] Can edit existing connections
- [ ] Can delete connections (with confirmation)
- [ ] Can search connections by name/company
- [ ] Can filter by relationship type
- [ ] Can see follow-up due indicators

### 4.2 Contact History
- [ ] Can log contact events (type, date, notes)
- [ ] History displays in chronological order
- [ ] Can set next follow-up date

### 4.3 Posting Integration
- [ ] Connection count shows on PostingCard
- [ ] Can link connections from posting detail
- [ ] Smart suggestions show same-company connections
- [ ] Can unlink connections from posting
- [ ] Unlinking doesn't delete the connection

### 4.4 Filtering
- [ ] "Has connections" filter works
- [ ] "Needs networking" filter shows 0-connection postings
- [ ] "Follow-up due" filter shows overdue connections

### 4.5 Data Integrity
- [ ] Deleting a connection removes it from linked postings
- [ ] Deleting a posting removes it from linked connections
- [ ] Export includes full connection data
- [ ] Import restores connection-posting links

---

## 5. Definition of Done

Phase 4 is complete when:
1. Connections can be created, edited, deleted
2. Connections can be linked/unlinked to postings
3. Contact history can be logged
4. Follow-up reminders are visible
5. Networking filters work
6. Export/import includes connections
7. All acceptance criteria met