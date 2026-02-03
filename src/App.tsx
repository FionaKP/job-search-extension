import { useState, useEffect, useCallback } from 'react';
import { Posting, PostingStatus, ViewMode } from '@/types';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { ListView } from '@/components/dashboard/ListView';
import { PostingDetailPanel } from '@/components/dashboard/PostingDetailPanel';

function App() {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<1 | 2 | 3 | null>(null);
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Load postings from storage
  useEffect(() => {
    const loadPostings = async () => {
      try {
        const result = await chrome.storage.local.get(['postings']);
        setPostings(result.postings || []);
      } catch (err) {
        console.error('Failed to load postings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPostings();

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
      await chrome.storage.local.set({ postings: newPostings });
      setPostings(newPostings);
    } catch (err) {
      console.error('Failed to save postings:', err);
    }
  }, []);

  // Filter postings based on search and priority
  const filteredPostings = postings.filter((posting) => {
    const matchesSearch =
      !searchQuery ||
      posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      posting.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      posting.location.toLowerCase().includes(searchQuery.toLowerCase());

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
        onViewChange={setCurrentView}
        onAddClick={handleAddClick}
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
