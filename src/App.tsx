import { useState, useEffect, useCallback } from 'react';
import { Posting, PostingStatus, ViewMode } from '@/types';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { ListView } from '@/components/dashboard/ListView';
import { PostingDetailPanel } from '@/components/dashboard/PostingDetailPanel';
import { exportDataToFile, promptImportFile } from '@/utils/dataTransfer';
import { runMigrationIfNeeded } from '@/services/migration';
import { getPostings, savePostings as persistPostings, getViewPreference, saveViewPreference } from '@/services/storage';

function App() {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<1 | 2 | 3 | null>(null);
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Load postings from storage (after running migration)
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run migration first
        await runMigrationIfNeeded();

        // Load postings and view preference
        const [loadedPostings, viewPref] = await Promise.all([
          getPostings(),
          getViewPreference(),
        ]);

        setPostings(loadedPostings);
        setCurrentView(viewPref);
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

  // Filter postings based on search and priority
  const filteredPostings = postings.filter((posting) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      posting.title.toLowerCase().includes(query) ||
      posting.company.toLowerCase().includes(query) ||
      posting.location.toLowerCase().includes(query) ||
      posting.tags.some((tag) => tag.toLowerCase().includes(query));

    const matchesPriority = !priorityFilter || posting.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

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

  const handleAddClick = () => {
    // For now, open extension popup or show a message
    // In future, could open a modal to add manually
    alert('Use the extension popup on a job posting page to add new jobs.');
  };

  const handleExport = () => {
    exportDataToFile(postings);
  };

  const handleImport = async () => {
    const result = await promptImportFile();
    if (!result.success) {
      alert(result.error || 'Import failed');
      return;
    }

    const confirmMessage = `Import ${result.postings.length} job posting(s)?\n\nThis will merge with your existing data. Duplicates (same URL) will be skipped.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    // Merge imported postings, skip duplicates based on URL
    const existingUrls = new Set(postings.map((p) => p.url));
    const newPostings = result.postings.filter((p) => !existingUrls.has(p.url));
    const merged = [...postings, ...newPostings];

    savePostings(merged);
    alert(`Imported ${newPostings.length} new posting(s). ${result.postings.length - newPostings.length} duplicate(s) skipped.`);
  };

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
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="flex-1 overflow-hidden">
        {currentView === 'kanban' ? (
          <KanbanBoard
            postings={filteredPostings}
            onPostingSelect={handlePostingSelect}
            onPriorityChange={handlePriorityChange}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
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
    </div>
  );
}

export default App;
