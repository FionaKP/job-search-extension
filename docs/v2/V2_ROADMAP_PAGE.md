# V2 Roadmap Page

**Parent:** [V2_OVERVIEW.md](./V2_OVERVIEW.md)  
**Branch:** `feature/roadmap-page`  
**Priority:** Medium  
**Estimated Effort:** 2-3 weeks

---

## Overview

The Roadmap Page transforms job searching from reactive tracking into proactive planning. Users can visualize their job search journey on a timeline, set and track goals, manage deadlines, and see how their networking connects to opportunities.

### Core Concept
Think of it as a personal job search command center that answers:
- What should I do this week?
- What deadlines are coming up?
- How is my search progressing over time?
- Where should I focus my energy?

---

## 1. Page Layout

### 1.1 Overall Structure
```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Dashboard] [Roadmap] [Connections]                    [Settings] [?]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ 📅 Your Job Search Roadmap                                    [+ Goal] │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │                         TIMELINE VIEW                               │ │
│ │  (Zoomable: Week / Month / Quarter)                                 │ │
│ │                                                                     │ │
│ │  Feb 10    Feb 17    Feb 24    Mar 3     Mar 10    Mar 17          │ │
│ │    │         │         │         │         │         │              │ │
│ │    ●─────────●         │         │         │         │   Anthropic  │ │
│ │    │         │         ●─────────●─────────●         │   SWE Role   │ │
│ │    │         │         │         │         │         │              │ │
│ │    │    ●────●─────────●         │         │         │   Google PM  │ │
│ │    │         │         │         │         │         │              │ │
│ │    ◆         │         │         ◆         │         ◆   Goals      │ │
│ │  Apply to    │         │       5 Apps      │       Follow up        │ │
│ │  3 roles     │         │       Submitted   │       with refs        │ │
│ │                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌──────────────────────────┐  ┌──────────────────────────────────────┐ │
│ │ 📋 THIS WEEK             │  │ 🎯 ACTIVE GOALS                      │ │
│ │                          │  │                                      │ │
│ │ Today                    │  │ ◆ Apply to 5 roles by Feb 20        │ │
│ │ • Interview @ 2pm (Anthr)│  │   Progress: 3/5 ████████░░ 60%      │ │
│ │ • Follow up with Sarah   │  │                                      │ │
│ │                          │  │ ◆ Reach out to 3 connections         │ │
│ │ Tomorrow                 │  │   Progress: 1/3 ███░░░░░░░ 33%      │ │
│ │ • Offer deadline (Google)│  │                                      │ │
│ │ • Application goal due   │  │ ◆ Complete interview prep (Meta)     │ │
│ │                          │  │   Progress: ✓ Done                   │ │
│ │ This Week                │  │                                      │ │
│ │ • 2 more applications    │  │ [+ Add Goal]  [View Completed]      │ │
│ │ • Prep for Meta onsite   │  │                                      │ │
│ └──────────────────────────┘  └──────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Timeline View Options

**Zoom Levels:**
| Level | Shows | Best For |
|-------|-------|----------|
| Week | 7 days, detailed | Day-to-day planning |
| Month | 4-5 weeks | Application cadence |
| Quarter | 12-13 weeks | Big picture progress |

**Elements on Timeline:**
1. **Posting Tracks** - Horizontal bars showing lifecycle of each posting
2. **Goal Markers** - Diamonds (◆) showing goal deadlines
3. **Events** - Circles (●) showing interviews, follow-ups, etc.
4. **Today Line** - Vertical line indicating current date
5. **Connection Events** - When connected contacts were engaged

---

## 2. Timeline Components

### 2.1 Posting Tracks

Each posting appears as a horizontal track showing its journey:

```
Anthropic SWE        ●──────────●──────────●──────────●
                   Saved     Applied   Interview    Offer
                   Feb 5     Feb 10    Feb 15       Feb 20

Google PM            ●──────────●──────────✗
                   Saved     Applied   Rejected
                   Feb 8     Feb 12    Feb 18
```

**Track Colors:** Match status colors from dashboard
**Interactions:**
- Click track → Opens posting detail
- Drag endpoints → Adjust dates (for goals/deadlines)
- Hover → Shows summary tooltip

### 2.2 Goal Markers

```
◆ Apply to 5 roles
  Due: Feb 20
  Progress: 3/5
```

**Types of Goals:**
| Type | Icon | Example |
|------|------|---------|
| Application | 📝 | "Apply to 5 roles" |
| Networking | 👥 | "Reach out to 3 people" |
| Interview | 🎯 | "Complete interview prep" |
| Follow-up | 📧 | "Follow up on applications" |
| Custom | ⭐ | User-defined |

### 2.3 Connection Events (Integration)

When connections are linked to postings, show their touchpoints:

```
Sarah Chen (Anthropic)
  ●─────────────●─────────────●
  Intro email   Coffee chat   Referral submitted
  Feb 1         Feb 8         Feb 12
```

---

## 3. Goals System

### 3.1 Goal Types & Templates

**Pre-built Goal Templates:**

| Category | Template | Suggested Timing |
|----------|----------|------------------|
| Applications | "Apply to X roles" | Weekly |
| Applications | "Submit X applications this month" | Monthly |
| Networking | "Reach out to X connections" | Weekly |
| Networking | "Schedule X coffee chats" | Monthly |
| Prep | "Complete interview prep for [posting]" | Before interview |
| Follow-up | "Follow up on X applications" | Weekly |
| Research | "Research X companies" | Weekly |

**Custom Goals:**
- User can create any goal with:
  - Title
  - Due date
  - Target count (optional)
  - Linked postings (optional)
  - Notes

### 3.2 Goal Creation Modal

```
┌──────────────────────────────────────────────────────────┐
│ Create Goal                                         [X]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Quick Start: [Applications ▼]                            │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ • Apply to 5 roles                                 │   │
│ │ • Submit 10 applications this month                │   │
│ │ • Apply to all saved high-priority roles           │   │
│ │ • [+ Custom goal...]                               │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ─────────────── or customize ───────────────             │
│                                                          │
│ Goal                                                     │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Apply to 5 roles                                   │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ Due Date                                                 │
│ [Feb 20, 2026        ▼]                                  │
│                                                          │
│ Target (optional)                                        │
│ [5] applications                                         │
│                                                          │
│ Link to Postings (optional)                              │
│ [Select postings...]                                     │
│                                                          │
│ Reminder                                                 │
│ ☑ Remind me [1 day] before due date                     │
│ ☐ Daily check-in until complete                         │
│                                                          │
│               [Cancel]        [Create Goal]              │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Goal Progress Tracking

**Auto-calculated Progress:**
- "Apply to 5 roles" → Counts postings moved to Applied status
- "Reach out to 3 connections" → Counts contact events logged
- "Interview prep complete" → Checkbox-based

**Manual Progress:**
- User can manually update progress
- Mark as complete anytime

### 3.4 Suggested Goals

Based on user's current state:

```
┌──────────────────────────────────────────────────────────┐
│ 💡 Suggested Goals                                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Based on your job search:                                │
│                                                          │
│ • You have 5 saved postings getting stale                │
│   → "Apply to 3 saved roles by Friday"         [Add]     │
│                                                          │
│ • Interview coming up with Anthropic                     │
│   → "Complete interview prep by Feb 14"        [Add]     │
│                                                          │
│ • No networking activity in 2 weeks                      │
│   → "Reach out to 2 connections"               [Add]     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Notifications & Reminders

### 4.1 Notification Types

| Event | Timing | Channel |
|-------|--------|---------|
| Goal due soon | 1 day before | Push + In-app |
| Interview reminder | 1 hour before | Push |
| Offer deadline | 3 days, 1 day before | Push + In-app |
| Stale posting nudge | After 7 days | In-app only |
| Weekly summary | Monday morning | Push (optional) |

### 4.2 Push Notification Implementation

```typescript
// Request permission on first use
const permission = await Notification.requestPermission();

// Schedule notifications
chrome.alarms.create('goal-reminder', {
  when: Date.now() + MS_UNTIL_REMINDER
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'goal-reminder') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'JobFlow Reminder',
      message: 'Goal due: Apply to 5 roles (2 remaining)'
    });
  }
});
```

### 4.3 In-App Notification Center

```
┌──────────────────────────────────────────────────────────┐
│ 🔔 Notifications                              [Settings] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Today                                                    │
│ ├─ ⚠️ Goal due: Apply to 5 roles (2 remaining)          │
│ ├─ 📅 Interview in 2 hours: Anthropic                   │
│ └─ 💡 5 saved postings are getting stale                │
│                                                          │
│ Yesterday                                                │
│ └─ ✅ Goal completed: Interview prep                    │
│                                                          │
│ Earlier                                                  │
│ └─ 📧 Time to follow up on 3 applications               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4.4 Notification Preferences

```
┌──────────────────────────────────────────────────────────┐
│ Notification Settings                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Push Notifications                                       │
│ ☑ Goal reminders                                        │
│ ☑ Interview reminders                                   │
│ ☑ Offer deadline alerts                                 │
│ ☐ Weekly summary                                        │
│ ☐ Networking nudges                                     │
│                                                          │
│ Reminder Timing                                          │
│ Goals: [1 day before ▼]                                  │
│ Interviews: [1 hour before ▼]                            │
│                                                          │
│ Quiet Hours                                              │
│ ☐ Don't notify between [10 PM] and [8 AM]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Weekly/Daily Agenda

### 5.1 "This Week" Panel

Shows upcoming items grouped by day:

```
┌──────────────────────────────────────────────────────────┐
│ 📋 This Week                                [Full View]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ TODAY - Monday, Feb 10                                   │
│ ├─ 🎯 2:00 PM - Interview with Anthropic                │
│ ├─ 📧 Follow up with Sarah Chen (overdue)               │
│ └─ ◆ Goal: Apply to 3 roles (1/3 done)                  │
│                                                          │
│ TOMORROW - Tuesday, Feb 11                               │
│ ├─ ⚠️ Offer deadline: Google PM                         │
│ └─ ◆ Goal: Complete interview prep                      │
│                                                          │
│ WEDNESDAY - Feb 12                                       │
│ └─ (nothing scheduled)                                   │
│                                                          │
│ LATER THIS WEEK                                          │
│ ├─ Thu: Phone screen with Meta                          │
│ └─ Fri: Goal due - Reach out to 3 connections           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Quick Actions from Agenda

- Click item → Opens relevant detail
- Check off → Marks complete
- Snooze → Postpone to tomorrow/next week
- Add note → Quick note entry

---

## 6. Historical View

### 6.1 Completed Goals Archive

```
┌──────────────────────────────────────────────────────────┐
│ ✅ Completed Goals                           [Filter ▼]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ February 2026                                            │
│ ├─ ✅ Apply to 5 roles (Feb 7)                          │
│ ├─ ✅ Interview prep - Anthropic (Feb 9)                │
│ └─ ✅ Reach out to 3 connections (Feb 10)               │
│                                                          │
│ January 2026                                             │
│ ├─ ✅ Apply to 10 roles (Jan 20)                        │
│ ├─ ✅ Research 5 companies (Jan 15)                     │
│ └─ ✅ Update resume (Jan 5)                             │
│                                                          │
│ Statistics                                               │
│ ├─ 15 goals completed this month                        │
│ ├─ 23 applications submitted                            │
│ └─ 8 interviews scheduled                               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Search Progress Over Time

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📊 Job Search Progress                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Applications Over Time                                              │
│                                                                     │
│   8 │                    ████                                       │
│   6 │               ████ ████                                       │
│   4 │          ████ ████ ████ ████                                  │
│   2 │     ████ ████ ████ ████ ████                                  │
│   0 └────────────────────────────────                               │
│      Week 1  Week 2  Week 3  Week 4  Week 5                         │
│                                                                     │
│ Status Breakdown                                                    │
│ Applied: 23 → Interviewing: 8 → Offer: 2 → Accepted: 1              │
│ Response Rate: 35%                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Movable/Interactive Elements

### 7.1 Drag-and-Drop on Timeline

**What can be moved:**
- Goal markers (change due date)
- Interview dates (reschedule)
- Follow-up reminders

**Visual Feedback:**
- Ghost preview while dragging
- Snap to day boundaries
- Highlight conflicts

### 7.2 Resize Tracks

- Drag posting track endpoints to adjust expected timeline
- "Expecting offer by March 1" → Extends track

### 7.3 Kanban-Style Goal Cards

Goals can be organized in columns too:

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   This Week    │  │   Next Week    │  │    Later       │
├────────────────┤  ├────────────────┤  ├────────────────┤
│ ◆ Apply to 3   │  │ ◆ Follow up    │  │ ◆ Reach out    │
│   roles        │  │   on apps      │  │   to alumni    │
│                │  │                │  │                │
│ ◆ Interview    │  │ ◆ Research     │  │ ◆ Update       │
│   prep         │  │   new roles    │  │   portfolio    │
└────────────────┘  └────────────────┘  └────────────────┘

[Timeline View]  [Board View]  ← Toggle
```

---

## 8. Data Model

### 8.1 New Types

```typescript
interface Goal {
  id: string;
  title: string;
  type: 'application' | 'networking' | 'interview' | 'followup' | 'custom';
  
  // Progress tracking
  targetCount?: number;
  currentCount: number;
  completed: boolean;
  completedAt?: string;
  
  // Timing
  dueDate: string;
  createdAt: string;
  
  // Links
  linkedPostingIds: string[];
  linkedConnectionIds: string[];
  
  // Reminders
  reminders: Reminder[];
  
  notes?: string;
}

interface Reminder {
  id: string;
  goalId: string;
  type: 'before_due' | 'daily' | 'custom';
  timing: number;          // Minutes before (e.g., 1440 = 1 day)
  sent: boolean;
  dismissed: boolean;
}

interface TimelineEvent {
  id: string;
  type: 'interview' | 'followup' | 'deadline' | 'goal' | 'connection';
  date: string;
  postingId?: string;
  connectionId?: string;
  goalId?: string;
  title: string;
  notes?: string;
}

// Settings addition
interface AppSettings {
  // ... existing
  notifications: {
    enabled: boolean;
    goalReminders: boolean;
    interviewReminders: boolean;
    offerDeadlines: boolean;
    weeklySummary: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;    // "22:00"
    quietHoursEnd: string;      // "08:00"
    goalReminderTiming: number; // Minutes before
    interviewReminderTiming: number;
  };
  roadmap: {
    defaultZoom: 'week' | 'month' | 'quarter';
    showConnections: boolean;
    showCompletedGoals: boolean;
  };
}
```

### 8.2 Storage Structure

```typescript
// Stored separately from postings for performance
const STORAGE_KEYS = {
  goals: 'jobflow_goals',
  reminders: 'jobflow_reminders', 
  timelineEvents: 'jobflow_timeline_events',
  completedGoals: 'jobflow_completed_goals',
};
```

---

## 9. Implementation Tasks

### 9.1 Foundation (Days 1-3)
- [ ] Create Roadmap page route and navigation
- [ ] Define Goal and TimelineEvent interfaces
- [ ] Create storage service for goals
- [ ] Basic page layout with placeholder sections

### 9.2 Goals System (Days 4-7)
- [ ] Goal creation modal with templates
- [ ] Goal list component
- [ ] Progress tracking logic
- [ ] Goal completion flow
- [ ] Completed goals archive

### 9.3 Timeline View (Days 8-12)
- [ ] Timeline component with zoom levels
- [ ] Posting tracks visualization
- [ ] Goal markers
- [ ] Today line indicator
- [ ] Drag-and-drop for goals
- [ ] Connection events (if time permits)

### 9.4 Agenda Panel (Days 10-11)
- [ ] "This Week" component
- [ ] Group items by day
- [ ] Quick actions (complete, snooze)
- [ ] Link to details

### 9.5 Notifications (Days 12-14)
- [ ] Chrome notifications API integration
- [ ] Notification scheduling with alarms
- [ ] In-app notification center
- [ ] Notification preferences

### 9.6 Polish (Days 15-17)
- [ ] Historical view and stats
- [ ] Board view toggle (Kanban goals)
- [ ] Suggested goals logic
- [ ] Performance optimization
- [ ] Mobile responsiveness

---

## 10. Acceptance Criteria

### Goals
- [ ] Can create goals from templates or custom
- [ ] Progress auto-updates based on actions
- [ ] Can manually complete goals
- [ ] Completed goals archived with history

### Timeline
- [ ] Posting tracks show correctly
- [ ] Can zoom (week/month/quarter)
- [ ] Goals appear as markers
- [ ] Can drag goals to reschedule
- [ ] Today line visible

### Agenda
- [ ] Shows items for current week
- [ ] Grouped by day
- [ ] Can complete/snooze from agenda
- [ ] Updates in real-time

### Notifications
- [ ] Push notifications work (when permitted)
- [ ] Can configure preferences
- [ ] Reminders fire at correct times
- [ ] Quiet hours respected

### Historical
- [ ] Can view completed goals
- [ ] Basic stats displayed
- [ ] Filter by date range

---

## 11. Open Questions for Design

1. **Timeline vs Board:** Primary view? Or equal toggle?
2. **Connection depth:** Full connection events on timeline, or just indicators?
3. **Goal auto-creation:** Should system create goals automatically based on activity?
4. **Weekly summary:** Email digest option, or only push/in-app?
5. **Gamification:** Progress streaks, achievements, or keep it simple?

---

## 12. Future Enhancements (V2.1+)

- Calendar sync (Google Calendar, Outlook)
- Email integration for follow-up reminders
- AI-suggested goals based on job search patterns
- Team/accountability partner sharing
- Mobile companion app with push notifications