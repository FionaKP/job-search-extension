import { useState, useEffect } from 'react';
import { Posting, PostingStatus, STATUS_LABELS, POSTING_STATUSES, Connection } from '@/types';
import { SlideOverPanel, PriorityStars, TagPopover, TagChip } from '@/components/common';
import { ConnectionCard, QuickLinkModal } from '@/components/connections';
import { KeywordsPanel } from '@/components/keywords';

type Tab = 'details' | 'keywords' | 'connections';

interface PostingDetailPanelProps {
  posting: Posting | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Posting>) => void;
  onDelete: (id: string) => void;
  // Connections props
  connections?: Connection[];
  linkedConnections?: Connection[];
  onLinkConnection?: (connectionId: string) => void;
  onUnlinkConnection?: (connectionId: string) => void;
  onViewConnection?: (connectionId: string) => void;
  onAddConnection?: () => void;
  // Keywords props
  onExtractKeywords?: (postingId: string) => void;
  isExtractingKeywords?: boolean;
}

export function PostingDetailPanel({
  posting,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  connections = [],
  linkedConnections = [],
  onLinkConnection,
  onUnlinkConnection,
  onViewConnection,
  onAddConnection,
  onExtractKeywords,
  isExtractingKeywords = false,
}: PostingDetailPanelProps) {
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQuickLinkModal, setShowQuickLinkModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('details');

  useEffect(() => {
    if (posting) {
      setNotes(posting.notes);
    }
  }, [posting?.id, posting?.notes]);

  // Reset to details tab when posting changes
  useEffect(() => {
    setActiveTab('details');
  }, [posting?.id]);

  const handleNotesBlur = () => {
    if (posting && notes !== posting.notes) {
      onUpdate(posting.id, { notes });
    }
  };

  const handleDelete = () => {
    if (posting) {
      onDelete(posting.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleToggleKeywordAddressed = (term: string, addressed: boolean) => {
    if (!posting || !posting.keywords) return;

    const updatedKeywords = posting.keywords.map((kw) =>
      kw.term === term ? { ...kw, addressed } : kw
    );

    onUpdate(posting.id, { keywords: updatedKeywords });
  };

  const handleRefreshKeywords = () => {
    if (posting && onExtractKeywords) {
      onExtractKeywords(posting.id);
    }
  };

  if (!posting) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const keywordCount = posting.keywords?.length || 0;
  const addressedCount = posting.keywords?.filter((k) => k.addressed).length || 0;

  return (
    <SlideOverPanel isOpen={isOpen} onClose={onClose} width="max-w-lg">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{posting.title}</h2>
              <p className="text-gray-600">{posting.company}</p>
              {posting.location && <p className="text-sm text-gray-500">{posting.location}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(posting.url, '_blank')}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Open URL (O)"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Close (Esc or ⌘S)"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 border-b border-gray-200 -mb-px">
            <TabButton
              active={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
            >
              Details
            </TabButton>
            <TabButton
              active={activeTab === 'keywords'}
              onClick={() => setActiveTab('keywords')}
              badge={keywordCount > 0 ? `${addressedCount}/${keywordCount}` : undefined}
            >
              Keywords
            </TabButton>
            <TabButton
              active={activeTab === 'connections'}
              onClick={() => setActiveTab('connections')}
              badge={linkedConnections.length > 0 ? linkedConnections.length.toString() : undefined}
            >
              Connections
            </TabButton>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <DetailsTab
              posting={posting}
              notes={notes}
              setNotes={setNotes}
              handleNotesBlur={handleNotesBlur}
              onUpdate={onUpdate}
            />
          )}

          {activeTab === 'keywords' && (
            <div className="p-4">
              <KeywordsPanel
                keywords={posting.keywords || []}
                onToggleAddressed={handleToggleKeywordAddressed}
                onRefresh={handleRefreshKeywords}
                isExtracting={isExtractingKeywords}
              />
            </div>
          )}

          {activeTab === 'connections' && (
            <ConnectionsTab
              linkedConnections={linkedConnections}
              onViewConnection={onViewConnection}
              onShowQuickLink={() => setShowQuickLinkModal(true)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              <p>Added: {formatDate(posting.dateAdded)}</p>
              <p>Modified: {formatDate(posting.dateModified)}</p>
            </div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-red-600">Delete this posting?</span>
                <button
                  onClick={handleDelete}
                  className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded bg-gray-200 px-2 py-1 text-gray-700 hover:bg-gray-300"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700"
              >
                Delete posting
              </button>
            )}
          </div>
        </div>
      </div>

      {posting && (
        <QuickLinkModal
          isOpen={showQuickLinkModal}
          onClose={() => setShowQuickLinkModal(false)}
          connections={connections}
          posting={posting}
          linkedConnectionIds={linkedConnections.map((c) => c.id)}
          onLinkConnection={(connectionId) => {
            onLinkConnection?.(connectionId);
          }}
          onUnlinkConnection={(connectionId) => {
            onUnlinkConnection?.(connectionId);
          }}
          onCreateConnection={() => {
            setShowQuickLinkModal(false);
            onAddConnection?.();
          }}
        />
      )}
    </SlideOverPanel>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
      {badge && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            active ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// Details Tab Content
function DetailsTab({
  posting,
  notes,
  setNotes,
  handleNotesBlur,
  onUpdate,
}: {
  posting: Posting;
  notes: string;
  setNotes: (notes: string) => void;
  handleNotesBlur: () => void;
  onUpdate: (id: string, updates: Partial<Posting>) => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
          <select
            value={posting.status}
            onChange={(e) => onUpdate(posting.id, { status: e.target.value as PostingStatus })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {POSTING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
          <PriorityStars
            priority={posting.priority}
            onChange={(p) => onUpdate(posting.id, { priority: p })}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
        <div className="flex flex-wrap items-center gap-1">
          {posting.tags.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              onRemove={() => onUpdate(posting.id, { tags: posting.tags.filter((t) => t !== tag) })}
            />
          ))}
          <TagPopover
            tags={posting.tags}
            onTagsChange={(tags) => onUpdate(posting.id, { tags })}
            suggestedTags={['remote', 'hybrid', 'onsite', 'startup', 'enterprise', 'contract']}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Next Action Date</label>
        <input
          type="date"
          value={posting.nextActionDate || ''}
          onChange={(e) => onUpdate(posting.id, { nextActionDate: e.target.value || undefined })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {posting.salary && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Salary</label>
          <p className="text-sm text-gray-600">{posting.salary}</p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 whitespace-pre-wrap">
          {posting.description || 'No description available'}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          rows={4}
          placeholder="Add notes about this application..."
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

// Connections Tab Content
function ConnectionsTab({
  linkedConnections,
  onViewConnection,
  onShowQuickLink,
}: {
  linkedConnections: Connection[];
  onViewConnection?: (id: string) => void;
  onShowQuickLink: () => void;
}) {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Linked Connections ({linkedConnections.length})
        </label>
        <button
          onClick={onShowQuickLink}
          className="text-xs text-indigo-600 hover:text-indigo-700"
        >
          + Link Connection
        </button>
      </div>
      {linkedConnections.length > 0 ? (
        <div className="space-y-2">
          {linkedConnections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onSelect={(id) => onViewConnection?.(id)}
              compact
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md bg-gray-50 p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-2">No connections linked</p>
          <button
            onClick={onShowQuickLink}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Link a connection
          </button>
        </div>
      )}
    </div>
  );
}
