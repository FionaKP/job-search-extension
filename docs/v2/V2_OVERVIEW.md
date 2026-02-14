# JobFlow V2 - Overview

**Version:** 2.0.0  
**Started:** 2026-02-12  
**Status:** Planning  
**Last Updated:** 2026-02-12 (post-audit)

---

## Vision

V2 transforms JobFlow from a job tracking tool into a **complete job search command center**. V1 delivered more than documented—the foundation is solid. V2 adds:

1. **Intelligent Guidance** - Status-specific features that help users know what to do next at each stage
2. **Visual Planning** - A roadmap page that turns job searching from a list into a strategic timeline
3. **Proactive Reminders** - Push notifications and goal tracking to keep momentum
4. **Production Quality** - Accessibility, performance, and polish for Chrome Store excellence

---

## V1 Actual Completion Status

*Updated based on 2026-02-12 code audit*

| V1 Phase | Doc Status | **Actual Status** | V2 Action |
|----------|------------|-------------------|-----------|
| Phase 1: Foundation | Complete | **COMPLETE** | N/A |
| Phase 2: Core Interaction | Complete | **COMPLETE** | N/A |
| Phase 3: Scraper | Complete (testing) | **~98% COMPLETE** | Testing only |
| Phase 4: Connections | ~~NOT STARTED~~ | **~95% COMPLETE** | Minor polish |
| Phase 5: Keywords | ~~NOT STARTED~~ | **~90% COMPLETE** | Add comparison |
| Phase 6: Visual Polish | ~60% | **~75% COMPLETE** | A11y, perf, dark mode |

**Key Finding:** Documentation was outdated. Phases 4-5 are nearly complete, not "not started."

---

## V2 Scope: Three Tracks

### Track 1: Production Quality (Required)
*Must-haves for Chrome Store quality*

| Item | Source | Effort | Priority |
|------|--------|--------|----------|
| Accessibility audit & fixes | Phase 6.10 | 3-4 days | **CRITICAL** |
| Performance optimization | Phase 6.12 | 2-3 days | **CRITICAL** |
| Scraper testing & edge cases | Phase 3 S7 | 2 days | HIGH |
| Cross-browser testing | Phase 6.12 | 1 day | HIGH |

### Track 2: Feature Completion (Important)
*Finish what's 90% done*

| Item | Source | Effort | Priority |
|------|--------|--------|----------|
| Keyword comparison modal | Phase 5 K7 | 2-3 days | MEDIUM |
| Keywords on PostingCard | Phase 5 K6 | 1 day | LOW |
| Connections edge case polish | Phase 4 C7 | 1 day | LOW |

### Track 3: New Features (V2 Headline)
*What makes V2 exciting*

| Item | Doc | Effort | Priority |
|------|-----|--------|----------|
| Status-specific features | [V2_STATUS_FEATURES.md](./V2_STATUS_FEATURES.md) | 1.5 weeks | MEDIUM |
| Roadmap page | [V2_ROADMAP_PAGE.md](./V2_ROADMAP_PAGE.md) | 2-3 weeks | MEDIUM |

### Deferred to V2.1
| Item | Reason |
|------|--------|
| Dark mode | Nice-to-have, not blocking |
| Onboarding flow | Can add post-launch |
| Full keyword dictionary expansion | Works well enough |

---

## Updated Feature Categories

| Category | Doc | Branch(es) | Priority | Est. Effort |
|----------|-----|------------|----------|-------------|
| Production Quality | [V2_BUGFIXES.md](./V2_BUGFIXES.md) | `fix/*` | **CRITICAL** | 1 week |
| Feature Completion | (inline above) | `fix/keyword-compare`, `fix/polish` | MEDIUM | 3-4 days |
| Status Features | [V2_STATUS_FEATURES.md](./V2_STATUS_FEATURES.md) | `feature/status-*` | MEDIUM | 1.5 weeks |
| Roadmap Page | [V2_ROADMAP_PAGE.md](./V2_ROADMAP_PAGE.md) | `feature/roadmap-page` | MEDIUM | 2-3 weeks |

**Total Estimated V2 Effort:** 5-6 weeks

---

## What's Actually Left (Detailed)

### From Phase 3: Scraper (~2 days)
- [ ] S7.1 - Test all parsers on real job pages
- [ ] S7.2 - Document known limitations per site
- [ ] S7.4 - Fix edge cases discovered in testing

### From Phase 5: Keywords (~3 days)
- [ ] K6.1 - Add top keywords as tags on PostingCard
- [ ] K7.1 - Add multi-select mode to dashboard
- [ ] K7.2 - Create CompareKeywordsModal
- [ ] K7.3 - Implement comparison logic
- [ ] K7.4 - Display common and unique keywords

### From Phase 6: Visual Polish (~1.5 weeks)

**Accessibility (CRITICAL - ~3-4 days)**
- [ ] Keyboard navigation audit - all elements reachable
- [ ] Proper tabindex ordering
- [ ] Focus trap in modals
- [ ] Visible focus rings (`:focus-visible`)
- [ ] Aria-labels on icon buttons
- [ ] Form label associations
- [ ] WCAG AA contrast verification
- [ ] `prefers-reduced-motion` support

**Performance (CRITICAL - ~2-3 days)**
- [ ] Dashboard load < 500ms benchmark
- [ ] List virtualization for 200+ postings
- [ ] Lazy load images
- [ ] Memory leak audit
- [ ] Debounce optimizations

**Minor Polish (~1 day)**
- [ ] PostingCard: Keyword match progress bar
- [ ] KanbanColumn: Smooth reorder animations
- [ ] Table: Resizable columns

### NEW in V2

**Status Features (~1.5 weeks)**
- Saved: Application goals and deadlines
- Interview: Prep panel with questions and notes
- Offer: Side-by-side comparison tool
- Rejected: Insights and similar job search

**Roadmap Page (~2-3 weeks)**
- Timeline visualization
- Goal setting and tracking
- Notifications and reminders
- Weekly agenda view

---

## Implementation Order

### Week 1: Production Quality
1. **Accessibility fixes** - Keyboard nav, focus management, aria labels
2. **Performance optimization** - Virtualization, lazy loading
3. **Scraper testing** - Real job pages, fix edge cases

### Week 2: Feature Completion + Status Features Start
4. **Keyword comparison** - Multi-select, compare modal
5. **Status: Saved goals** - Application deadlines, reminders
6. **Status: Interview prep** - Questions, notes, rounds

### Week 3-4: Status Features + Roadmap Start
7. **Status: Offer compare** - Side-by-side tool
8. **Roadmap: Foundation** - Page layout, goal model, storage

### Week 5-6: Roadmap Completion
9. **Roadmap: Timeline** - Visual timeline with posting tracks
10. **Roadmap: Goals** - Templates, progress tracking
11. **Roadmap: Notifications** - Chrome notifications, reminders
12. **Final polish** - Testing, bug fixes, Chrome Store prep

---

## Branch Strategy

```
main (V1.0.0 - production, tag it!)
  │
  └── develop (V2 integration)
        │
        │── fix/accessibility          # Week 1
        │── fix/performance            # Week 1
        │── fix/scraper-testing        # Week 1
        │── fix/keyword-compare        # Week 2
        │
        │── feature/status-saved-goals      # Week 2
        │── feature/status-interview-prep  # Week 2-3
        │── feature/status-offer-compare   # Week 3
        │── feature/status-rejected-insights  # Week 3 (lower priority)
        │
        └── feature/roadmap-page           # Week 3-6
```

### Pre-V2 Setup
```bash
# Tag V1 for reference
git tag -a v1.0.0 -m "V1 Release"
git push origin v1.0.0

# Create develop branch
git checkout -b develop
git push -u origin develop
```

---

## Success Criteria

### Production Quality
- [ ] Lighthouse accessibility score > 90
- [ ] Dashboard loads < 500ms with 200+ postings
- [ ] Full keyboard navigation
- [ ] All scrapers tested on 5+ real pages each

### Feature Completion
- [ ] Keyword comparison works for 2+ selected postings
- [ ] No Phase 4/5/6 items marked incomplete

### V2 Features
- [ ] Can set and track application goals
- [ ] Interview prep panel functional
- [ ] Offer comparison works
- [ ] Roadmap page with timeline and goals
- [ ] At least basic notifications working

### Release
- [ ] Chrome Store listing updated
- [ ] Screenshots reflect V2 features
- [ ] README updated

---

## Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| V1 Tagged | 2026-02-13 | Not Started |
| V2 Planning Complete | 2026-02-14 | In Progress |
| Production Quality Merged | 2026-02-21 | Not Started |
| Feature Completion Merged | 2026-02-25 | Not Started |
| Status Features Merged | 2026-03-07 | Not Started |
| Roadmap Page MVP | 2026-03-21 | Not Started |
| V2 Beta Testing | 2026-03-25 | Not Started |
| V2 Release | 2026-04-01 | Not Started |

---

## Open Questions

- [ ] **Keyword comparison:** Modal or slide-over panel?
- [ ] **Notifications:** Request permission on first goal, or in settings?
- [ ] **Roadmap primary view:** Timeline (Gantt) vs Board (Kanban goals)?
- [ ] **Status features:** All inline in detail panel, or separate sub-pages?

---

## Files

### V2 Planning
- [V2_OVERVIEW.md](./V2_OVERVIEW.md) - This file
- [V2_BUGFIXES.md](./V2_BUGFIXES.md) - Production quality items
- [V2_STATUS_FEATURES.md](./V2_STATUS_FEATURES.md) - Status enhancements
- [V2_ROADMAP_PAGE.md](./V2_ROADMAP_PAGE.md) - Roadmap page spec

### Reference
- [V1_AUDIT_REPORT.md](./V1_AUDIT_REPORT.md) - Implementation audit (this audit)
- [v1-remaining-items.md](../v1/v1-remaining-items.md) - Original V1 tracker

### V1 Archive
- `docs/archive/phase1spec.md` through `phase6spec.md`