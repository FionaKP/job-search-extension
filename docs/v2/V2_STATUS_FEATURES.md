# V2 Status-Specific Features

**Parent:** [V2_OVERVIEW.md](./V2_OVERVIEW.md)  
**Branches:** `feature/status-saved-goals`, `feature/status-interview-prep`, `feature/status-offer-compare`, `feature/status-rejected-insights`  
**Priority:** Medium  
**Estimated Effort:** 1.5 weeks

---

## Overview

Each job status represents a different mindset and set of needs. V2 adds contextual features that help users at each stage of their job search journey.

**Design Principle:** Features should be easily accessible from the detail panel when viewing a posting in that status, but also discoverable globally (e.g., "Show all interview prep" or "Compare all offers").

---

## 1. Saved Status: Application Goals

**Branch:** `feature/status-saved-goals`

### Problem
Users save jobs but don't act on them. Postings go stale, opportunities are missed.

### Solution
Add goal-setting and timing reminders for saved postings.

### Features

#### 1.1 Application Deadline Tracking
```
┌─────────────────────────────────────────────────────────┐
│ 📅 Application Timeline                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Posted: Jan 15, 2026                                    │
│ Goal: Apply by Jan 25 (3 days left)         [Edit]     │
│                                                         │
│ ⚠️ Similar roles typically close in 2-3 weeks          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 1.2 Goal Suggestions
- Auto-suggest deadline based on:
  - Posting date (if scraped)
  - Historical data (similar roles)
  - User's typical cadence
- Gentle nudges: "You saved this 5 days ago. Ready to apply?"

#### 1.3 Quick Actions
- [ ] "Move to In Progress" - Start working on application
- [ ] "Set Goal Date" - Pick deadline
- [ ] "Snooze" - Remind me later (1 day, 3 days, 1 week)
- [ ] "Archive" - Not interested anymore

#### 1.4 Saved Dashboard Widget
Optional widget showing:
- Postings approaching goal deadline
- Stale postings (no action in 7+ days)
- Quick batch actions

### Data Model Additions
```typescript
interface Posting {
  // ... existing fields
  applicationGoalDate?: string;    // ISO date
  snoozedUntil?: string;           // ISO date
  goalReminders: GoalReminder[];
}

interface GoalReminder {
  id: string;
  type: 'apply' | 'followup' | 'custom';
  date: string;
  message?: string;
  completed: boolean;
}
```

---

## 2. Applied Status: Follow-up Tracking

**Branch:** `feature/status-applied` (or include in saved-goals branch)

### Problem
After applying, users lose track of follow-up timing.

### Solution
Track application date, suggest follow-up timing.

### Features

#### 2.1 Application Tracker
```
┌─────────────────────────────────────────────────────────┐
│ 📨 Application Status                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Applied: Jan 20, 2026 (5 days ago)                      │
│ Method: Easy Apply / Direct / Referral                  │
│                                                         │
│ 📋 Follow-up Reminder                                   │
│ Suggested: Follow up after 1 week (in 2 days)           │
│ [Set Reminder]  [Already Followed Up]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 2.2 Find Similar Jobs
- "Find similar postings" - search by company, title, or keywords
- Link to job board searches
- Compare with other applied roles

---

## 3. Interview Status: Prep & Notes

**Branch:** `feature/status-interview-prep`

### Problem
Interview prep is scattered—notes in docs, questions in email, company research in browser tabs.

### Solution
Centralized interview prep space with templates and easy note-taking.

### Features

#### 3.1 Interview Prep Panel
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Interview Prep                              [Expand] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Interview Date: [Feb 10, 2026] [10:00 AM] [Add to Cal]  │
│ Type: ( ) Phone  (•) Video  ( ) Onsite                  │
│ Round: [1st Round ▼]                                    │
│ Interviewer(s): [Add names/roles]                       │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ 📝 My Notes                                    [+ Add]  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Research their recent product launch...             │ │
│ │ Ask about team structure...                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ❓ Questions to Ask                            [+ Add]  │
│ ☐ What does success look like in 90 days?              │
│ ☐ How does the team handle technical debt?             │
│ ☐ What's the biggest challenge right now?              │
│ ☑ Can you describe the interview process? (asked)      │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ 💡 Suggested Prep                                       │
│ • Review job description keywords                       │
│ • Research recent company news                          │
│ • Prepare STAR stories for: [Python, Leadership]        │
│ • Review your application materials                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.2 Question Bank
- Pre-populated common questions
- User can add custom questions
- Mark as "asked" during/after interview
- Reuse questions across interviews

#### 3.3 Interview History (Multiple Rounds)
```
┌─────────────────────────────────────────────────────────┐
│ 📅 Interview Timeline                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Round 1 - Phone Screen (Feb 5) ✓                        │
│   With: Sarah Chen (Recruiter)                          │
│   Notes: Went well, moving forward...                   │
│                                                         │
│ Round 2 - Technical (Feb 10) ← Current                  │
│   With: Mike Johnson (Sr. Engineer)                     │
│   Prep: System design, coding...                        │
│                                                         │
│ Round 3 - Onsite (TBD)                                  │
│   [Schedule when confirmed]                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.4 Quick Access
- "All Interview Prep" view - see all interviewing postings
- Calendar export for interview dates
- Reminder notifications before interviews

### Data Model Additions
```typescript
interface Posting {
  // ... existing fields
  interviews: Interview[];
  prepNotes: string;
  questionsToAsk: InterviewQuestion[];
}

interface Interview {
  id: string;
  round: number;
  roundName: string;           // "Phone Screen", "Technical", etc.
  date?: string;
  time?: string;
  type: 'phone' | 'video' | 'onsite';
  interviewers: string[];
  notes: string;
  completed: boolean;
  outcome?: 'positive' | 'neutral' | 'negative' | 'unknown';
}

interface InterviewQuestion {
  id: string;
  question: string;
  asked: boolean;
  answer?: string;             // Notes on their answer
}
```

---

## 4. Offer Status: Comparison Tools

**Branch:** `feature/status-offer-compare`

### Problem
Comparing multiple offers requires spreadsheets and mental math. Easy to miss important factors.

### Solution
Side-by-side offer comparison with weighted scoring.

### Features

#### 4.1 Offer Details Entry
```
┌─────────────────────────────────────────────────────────┐
│ 💰 Offer Details                               [Edit]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Base Salary:      $150,000 /year                        │
│ Bonus:            15% target ($22,500)                  │
│ Equity:           10,000 shares over 4 years            │
│ Sign-on:          $20,000                               │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ Benefits:                                               │
│ ☑ Health insurance    ☑ 401k match (4%)                │
│ ☑ Dental/Vision       ☑ Unlimited PTO                  │
│ ☑ Remote work         ☐ Relocation assistance          │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ Deadline: Feb 20, 2026 (5 days left)                    │
│ [Negotiate]  [Accept]  [Decline]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 4.2 Compare Offers
```
┌─────────────────────────────────────────────────────────────────────┐
│ 📊 Compare Offers                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                     │ Anthropic      │ Google         │ Meta        │
│ ────────────────────┼────────────────┼────────────────┼─────────────│
│ Base Salary         │ $150,000       │ $165,000       │ $155,000    │
│ Bonus               │ 15% ($22.5k)   │ 15% ($24.7k)   │ 20% ($31k)  │
│ Equity (annual)     │ ~$30,000       │ ~$50,000       │ ~$45,000    │
│ ────────────────────┼────────────────┼────────────────┼─────────────│
│ Total Comp (Y1)     │ $222,500       │ $259,700       │ $251,000    │
│ ────────────────────┼────────────────┼────────────────┼─────────────│
│ Remote              │ ✓ Full         │ ◐ Hybrid       │ ✗ Onsite    │
│ PTO                 │ Unlimited      │ 20 days        │ 25 days     │
│ 401k Match          │ 4%             │ 50% up to 6%   │ 50% up to 8%│
│ ────────────────────┼────────────────┼────────────────┼─────────────│
│ Your Score          │ ★★★★☆ 4.2     │ ★★★★★ 4.8     │ ★★★★☆ 4.0  │
│ Deadline            │ Feb 20         │ Feb 25         │ Feb 18      │
└─────────────────────────────────────────────────────────────────────┘

[Customize Weights]  [Export to Spreadsheet]
```

#### 4.3 Weighted Scoring
User can weight factors by importance:
- Compensation (default: 30%)
- Work-life balance (default: 25%)
- Growth opportunity (default: 20%)
- Company culture (default: 15%)
- Location/Remote (default: 10%)

#### 4.4 Deadline Tracking
- Show days remaining on each offer
- Urgent indicator when < 3 days
- Reminder notifications

### Data Model Additions
```typescript
interface Posting {
  // ... existing fields
  offerDetails?: OfferDetails;
}

interface OfferDetails {
  baseSalary?: number;
  bonus?: { type: 'percentage' | 'fixed'; value: number };
  equity?: { shares?: number; value?: number; vestingYears?: number };
  signOn?: number;
  benefits: string[];
  deadline?: string;
  notes: string;
  negotiationHistory?: NegotiationNote[];
}

interface NegotiationNote {
  date: string;
  note: string;
}
```

---

## 5. Rejected Status: Insights & Similar Search

**Branch:** `feature/status-rejected-insights`

### Problem
Rejections feel like dead ends. No learning, no next steps.

### Solution
Extract learnings, find similar opportunities.

### Features

#### 5.1 Rejection Notes
```
┌─────────────────────────────────────────────────────────┐
│ 📋 Rejection Notes                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Stage: [Technical Interview ▼]                          │
│ Reason (if known):                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Feedback: Strong on system design but need more     │ │
│ │ experience with distributed systems...              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 💡 Takeaway for next time:                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Study distributed systems patterns, practice        │ │
│ │ consistency/partition tolerance trade-offs          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 5.2 Find Similar Roles
- Button: "Find similar jobs"
- Opens search with same title/company type
- Links to job board searches

#### 5.3 Rejection Analytics (Optional)
If enough data:
- "You've been rejected at [Technical Interview] stage 3 times"
- "Consider focusing on: [distributed systems, ML fundamentals]"

### Data Model Additions
```typescript
interface Posting {
  // ... existing fields
  rejectionDetails?: {
    stage: 'application' | 'phone' | 'technical' | 'onsite' | 'offer' | 'unknown';
    reason?: string;
    feedback?: string;
    takeaway?: string;
    rejectedAt: string;      // ISO date
  };
}
```

---

## Global Access Pattern

### Status Features Should Be Accessible:

1. **From Detail Panel** - Primary location when viewing a specific posting
2. **From Dashboard Widgets** - Quick access cards:
   - "Upcoming Interviews (3)"
   - "Offers to Review (2)"
   - "Goals Due This Week (5)"
3. **From Filters** - "Show all with interview prep needed"
4. **From Roadmap Page** - Timeline view of all status activities

---

## Implementation Order

1. **Saved Goals** (most impactful for engagement)
2. **Interview Prep** (high value for users in active search)
3. **Offer Compare** (critical for decision-making)
4. **Rejected Insights** (nice to have, lower priority)

---

## Acceptance Criteria

### Saved Status
- [ ] Can set application goal date
- [ ] See suggested deadlines
- [ ] Snooze/reminder functionality works
- [ ] Stale indicators visible

### Interview Status
- [ ] Can add interview details (date, type, round)
- [ ] Can add/manage questions to ask
- [ ] Can take notes per interview round
- [ ] Interview history shows timeline

### Offer Status
- [ ] Can enter offer details
- [ ] Can compare 2+ offers side by side
- [ ] Weighted scoring works
- [ ] Deadline tracking visible

### Rejected Status
- [ ] Can record rejection stage and notes
- [ ] Can add takeaways
- [ ] "Find similar" opens relevant search