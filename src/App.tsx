import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Posting, PostingStatus, ViewMode, isTerminalStatus } from '@/types';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { ListView } from '@/components/dashboard/ListView';
import { PostingDetailPanel } from '@/components/dashboard/PostingDetailPanel';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { KeyboardShortcutsModal } from '@/components/common';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { runMigrationIfNeeded } from '@/services/migration';
import {
  getPostings,
  savePostings as persistPostings,
  getViewPreference,
  saveViewPreference,
  getCollapsedColumns,
  saveCollapsedColumns,
  getStatsExpanded,
  saveStatsExpanded,
} from '@/services/storage';

function App() {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<1 | 2 | 3 | null>(null);
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [collapsedColumns, setCollapsedColumns] = useState<PostingStatus[]>(['rejected']);

  // Advanced filters
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineSoon, setDeadlineSoon] = useState(false);
  const [needsAction, setNeedsAction] = useState(false);

  // Keyboard shortcuts
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PostingStatus | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dashboard stats
  const [statsExpanded, setStatsExpanded] = useState(false);
  const dashboardStats = useDashboardStats(postings);

  // Handle stats expanded change with persistence
  const handleStatsExpandedChange = useCallback(async (expanded: boolean) => {
    setStatsExpanded(expanded);
    try {
      await saveStatsExpanded(expanded);
    } catch (err) {
      console.error('Failed to save stats expanded preference:', err);
    }
  }, []);

  // Load postings from storage (after running migration)
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run migration first
        await runMigrationIfNeeded();

        // Load postings, view preference, collapsed columns, and stats expanded
        const [loadedPostings, viewPref, collapsed, statsExp] = await Promise.all([
          getPostings(),
          getViewPreference(),
          getCollapsedColumns(),
          getStatsExpanded(),
        ]);

        setPostings(loadedPostings);
        setCurrentView(viewPref);
        setCollapsedColumns(collapsed);
        setStatsExpanded(statsExp);
      } catch (err) {
        console.error('Failed to initialize app:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.postings) {
        setPostings(changes.postings.newValue || []);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // Check for highlight param (from popup "view existing" link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlightId = params.get('highlight');
    if (highlightId) {
      setSelectedPostingId(highlightId);
      setDetailPanelOpen(true);
    }
  }, []);

  // Save postings to storage
  const savePostings = useCallback(async (newPostings: Posting[]) => {
    try {
      await persistPostings(newPostings);
      setPostings(newPostings);
    } catch (err) {
      console.error('Failed to save postings:', err);
    }
  }, []);

  // Handle view change with persistence
  const handleViewChange = useCallback(async (view: ViewMode) => {
    setCurrentView(view);
    try {
      await saveViewPreference(view);
    } catch (err) {
      console.error('Failed to save view preference:', err);
    }
  }, []);

  // Handle collapsed columns change with persistence
  const handleCollapseChange = useCallback(async (columns: PostingStatus[]) => {
    setCollapsedColumns(columns);
    try {
      await saveCollapsedColumns(columns);
    } catch (err) {
      console.error('Failed to save collapsed columns:', err);
    }
  }, []);

  // Compute available tags and companies from postings
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    postings.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [postings]);

  const availableCompanies = useMemo(() => {
    const companies = new Set<string>();
    postings.forEach((p) => companies.add(p.company));
    return Array.from(companies).sort();
  }, [postings]);

  // Helper: check if posting is stale (no update in 7+ days, non-terminal status)
  const isStale = (posting: Posting): boolean => {
    if (isTerminalStatus(posting.status)) return false;
    const daysSinceUpdate = (Date.now() - posting.dateModified) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate >= 7;
  };

  // Helper: check if deadline is soon (within 7 days)
  const isDeadlineSoon = (posting: Posting): boolean => {
    if (!posting.nextActionDate) return false;
    const deadline = new Date(posting.nextActionDate);
    const now = new Date();
    const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil >= 0 && daysUntil <= 7;
  };

  // Filter postings based on all filters
  const filteredPostings = useMemo(() => {
    return postings.filter((posting) => {
      // Search filter
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        posting.title.toLowerCase().includes(query) ||
        posting.company.toLowerCase().includes(query) ||
        posting.location.toLowerCase().includes(query) ||
        posting.notes.toLowerCase().includes(query) ||
        posting.tags.some((tag) => tag.toLowerCase().includes(query));

      // Priority filter
      const matchesPriority = !priorityFilter || posting.priority === priorityFilter;

      // Status filter
      const matchesStatus = !statusFilter || posting.status === statusFilter;

      // Tags filter (OR logic - match any selected tag)
      const matchesTags =
        tagFilters.length === 0 ||
        tagFilters.some((tag) => posting.tags.includes(tag));

      // Company filter (partial match)
      const matchesCompany =
        !companyFilter ||
        posting.company.toLowerCase().includes(companyFilter.toLowerCase());

      // Date range filter
      const postingDate = new Date(posting.dateAdded);
      const matchesDateFrom = !dateFrom || postingDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || postingDate <= new Date(dateTo + 'T23:59:59');

      // Has deadline filter
      const matchesHasDeadline = !hasDeadline || !!posting.nextActionDate;

      // Deadline soon filter
      const matchesDeadlineSoon = !deadlineSoon || isDeadlineSoon(posting);

      // Needs action filter
      const matchesNeedsAction = !needsAction || isStale(posting);

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesTags &&
        matchesCompany &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesHasDeadline &&
        matchesDeadlineSoon &&
        matchesNeedsAction
      );
    });
  }, [
    postings,
    searchQuery,
    priorityFilter,
    statusFilter,
    tagFilters,
    companyFilter,
    dateFrom,
    dateTo,
    hasDeadline,
    deadlineSoon,
    needsAction,
  ]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (priorityFilter !== null) count++;
    if (statusFilter !== null) count++;
    if (tagFilters.length > 0) count++;
    if (companyFilter) count++;
    if (dateFrom || dateTo) count++;
    if (hasDeadline) count++;
    if (deadlineSoon) count++;
    if (needsAction) count++;
    return count;
  }, [searchQuery, priorityFilter, statusFilter, tagFilters, companyFilter, dateFrom, dateTo, hasDeadline, deadlineSoon, needsAction]);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setSearchQuery('');
    setPriorityFilter(null);
    setStatusFilter(null);
    setTagFilters([]);
    setCompanyFilter('');
    setDateFrom(null);
    setDateTo(null);
    setHasDeadline(false);
    setDeadlineSoon(false);
    setNeedsAction(false);
  }, []);

  // Focus search input
  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  // Cycle priority for selected posting
  const cyclePriority = useCallback(() => {
    if (!selectedPostingId) return;
    const posting = postings.find((p) => p.id === selectedPostingId);
    if (!posting) return;
    const nextPriority = ((posting.priority % 3) + 1) as 1 | 2 | 3;
    handlePriorityChange(selectedPostingId, nextPriority);
  }, [selectedPostingId, postings]);

  // Open URL for selected posting
  const openSelectedUrl = useCallback(() => {
    if (!selectedPostingId) return;
    const posting = postings.find((p) => p.id === selectedPostingId);
    if (posting) window.open(posting.url, '_blank');
  }, [selectedPostingId, postings]);

  // Delete selected posting
  const deleteSelected = useCallback(() => {
    if (!selectedPostingId) return;
    if (confirm('Are you sure you want to delete this posting?')) {
      handleDelete(selectedPostingId);
    }
  }, [selectedPostingId]);

  // Navigate to next/previous card
  const navigateCards = useCallback(
    (direction: 'next' | 'prev') => {
      if (filteredPostings.length === 0) return;

      const currentIndex = selectedPostingId
        ? filteredPostings.findIndex((p) => p.id === selectedPostingId)
        : -1;

      let newIndex: number;
      if (direction === 'next') {
        newIndex = currentIndex < filteredPostings.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : filteredPostings.length - 1;
      }

      setSelectedPostingId(filteredPostings[newIndex].id);
    },
    [filteredPostings, selectedPostingId]
  );

  // Handlers
  const handlePostingSelect = (id: string) => {
    setSelectedPostingId(id);
    setDetailPanelOpen(true);
  };

  const handlePriorityChange = (id: string, priority: 1 | 2 | 3) => {
    const updated = postings.map((p) =>
      p.id === id ? { ...p, priority, dateModified: Date.now() } : p
    );
    savePostings(updated);
  };

  const handleStatusChange = (id: string, status: PostingStatus) => {
    const updated = postings.map((p) =>
      p.id === id
        ? {
            ...p,
            status,
            dateModified: Date.now(),
            dateApplied: status === 'applied' && !p.dateApplied ? Date.now() : p.dateApplied,
          }
        : p
    );
    savePostings(updated);
  };

  const handleUpdate = (id: string, updates: Partial<Posting>) => {
    const updated = postings.map((p) =>
      p.id === id ? { ...p, ...updates, dateModified: Date.now() } : p
    );
    savePostings(updated);
  };

  const handleDelete = (id: string) => {
    const updated = postings.filter((p) => p.id !== id);
    savePostings(updated);
    if (selectedPostingId === id) {
      setSelectedPostingId(null);
      setDetailPanelOpen(false);
    }
  };

  const handleAddClick = useCallback(() => {
    // For now, open extension popup or show a message
    // In future, could open a modal to add manually
    alert('Use the extension popup on a job posting page to add new jobs.');
  }, []);

  // Setup keyboard shortcuts (after all handlers are defined)
  useKeyboardShortcuts([
    // Global shortcuts
    { key: '/', handler: focusSearch },
    { key: 'k', meta: true, handler: focusSearch },
    {
      key: 'Escape',
      allowInInput: true,
      handler: () => {
        if (detailPanelOpen) {
          setDetailPanelOpen(false);
        } else if (searchQuery) {
          setSearchQuery('');
        }
      },
    },
    { key: '?', handler: () => setShortcutsModalOpen(true) },
    { key: 'n', handler: handleAddClick },

    // Status filter shortcuts (1-7 for statuses, 0 to clear)
    { key: '1', handler: () => setStatusFilter('saved') },
    { key: '2', handler: () => setStatusFilter('in_progress') },
    { key: '3', handler: () => setStatusFilter('applied') },
    { key: '4', handler: () => setStatusFilter('interviewing') },
    { key: '5', handler: () => setStatusFilter('offer') },
    { key: '6', handler: () => setStatusFilter('accepted') },
    { key: '7', handler: () => setStatusFilter('rejected') },
    { key: '0', handler: () => setStatusFilter(null) },

    // Card navigation
    { key: 'j', handler: () => navigateCards('next') },
    { key: 'ArrowDown', handler: () => navigateCards('next') },
    { key: 'k', handler: () => navigateCards('prev') },
    { key: 'ArrowUp', handler: () => navigateCards('prev') },
    { key: 'Enter', handler: () => selectedPostingId && setDetailPanelOpen(true) },

    // Card actions
    { key: 's', handler: cyclePriority },
    { key: 'e', handler: () => selectedPostingId && setDetailPanelOpen(true) }, // Edit (opens detail panel)
    { key: 'o', handler: openSelectedUrl },
    { key: 'd', handler: deleteSelected },

    // Panel shortcuts
    { key: 's', meta: true, allowInInput: true, handler: () => setDetailPanelOpen(false) }, // Cmd+S closes panel (saves are automatic)
  ]);

  const selectedPosting = postings.find((p) => p.id === selectedPostingId) || null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        currentView={currentView}
        onViewChange={handleViewChange}
        onAddClick={handleAddClick}
        // Advanced filters
        availableTags={availableTags}
        availableCompanies={availableCompanies}
        tagFilters={tagFilters}
        onTagFiltersChange={setTagFilters}
        companyFilter={companyFilter}
        onCompanyFilterChange={setCompanyFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        hasDeadline={hasDeadline}
        deadlineSoon={deadlineSoon}
        needsAction={needsAction}
        onHasDeadlineChange={setHasDeadline}
        onDeadlineSoonChange={setDeadlineSoon}
        onNeedsActionChange={setNeedsAction}
        onClearAllFilters={handleClearAllFilters}
        activeFilterCount={activeFilterCount}
        searchInputRef={searchInputRef}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <DashboardStats
        stats={dashboardStats}
        expanded={statsExpanded}
        onExpandedChange={handleStatsExpandedChange}
      />

      <main className="flex-1 overflow-hidden">
        {currentView === 'kanban' ? (
          <KanbanBoard
            postings={filteredPostings}
            onPostingSelect={handlePostingSelect}
            onPriorityChange={handlePriorityChange}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            collapsedColumns={collapsedColumns}
            onCollapseChange={handleCollapseChange}
          />
        ) : (
          <ListView
            postings={filteredPostings}
            onPostingSelect={handlePostingSelect}
            onPriorityChange={handlePriorityChange}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}
      </main>

      <PostingDetailPanel
        posting={selectedPosting}
        isOpen={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
}

export default App;
