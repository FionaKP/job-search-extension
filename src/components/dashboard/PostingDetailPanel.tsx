import { useState, useEffect } from 'react';
import { Posting, PostingStatus, STATUS_LABELS, POSTING_STATUSES, Connection } from '@/types';
import { SlideOverPanel, PriorityStars, TagPopover, TagChip } from '@/components/common';
import { ConnectionCard, QuickLinkModal } from '@/components/connections';
import { KeywordsPanel } from '@/components/keywords';
import { getLogoUrl } from '@/utils/logo';

type Tab = 'details' | 'keywords' | 'connections';

interface PostingDetailPanelProps {
  posting: Posting | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Posting>) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
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
  onEdit,
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
  const [logoError, setLogoError] = useState(false);

  // Reset logo error when posting changes
  useEffect(() => {
    setLogoError(false);
  }, [posting?.id]);

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
        <div className="border-b border-sage/20 bg-champagne-50 px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Company Logo */}
              {(() => {
                const logoUrl = getLogoUrl(posting.companyLogo, posting.company);
                const showLogo = logoUrl && !logoError;
                const handleLogoLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
                  const img = e.currentTarget;
                  // Google's default favicon is 16x16, treat as error to show initials
                  if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
                    setLogoError(true);
                  }
                };
                return showLogo ? (
                  <img
                    src={logoUrl}
                    alt={posting.company}
                    className="h-12 w-12 rounded-lg object-contain bg-white border border-sage/20 flex-shrink-0"
                    onLoad={handleLogoLoad}
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-champagne-200 flex items-center justify-center text-sm font-semibold text-wine flex-shrink-0">
                    {posting.company.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                  </div>
                );
              })()}
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-wine">{posting.title}</h2>
                <p className="text-wine/80">{posting.company}</p>
                {posting.location && <p className="text-sm text-wine/60">{posting.location}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(posting.id)}
                  className="btn btn-icon btn-ghost text-wine/50 hover:text-wine hover:bg-sage/10"
                  title="Edit posting"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => window.open(posting.url, '_blank')}
                className="btn btn-icon btn-ghost text-wine/50 hover:text-wine hover:bg-sage/10"
                title="Open URL (O)"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="btn btn-icon btn-ghost text-wine/50 hover:text-wine hover:bg-sage/10 focus-visible:ring-2 focus-visible:ring-wine"
                aria-label="Close detail panel"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 border-b border-sage/20 -mb-px">
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
        <div className="border-t border-sage/20 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-wine/50">
            <div>
              <p>Added: {formatDate(posting.dateAdded)}</p>
              <p>Modified: {formatDate(posting.dateModified)}</p>
            </div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-flatred">Delete this posting?</span>
                <button
                  onClick={handleDelete}
                  className="btn btn-sm btn-primary"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-sm btn-secondary"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-sm btn-danger"
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
          ? 'border-wine text-wine'
          : 'border-transparent text-sage hover:text-wine hover:border-sage'
      }`}
    >
      {children}
      {badge && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            active ? 'bg-champagne-100 text-wine' : 'bg-champagne-50 text-wine/60'
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
          <label className="mb-1 block text-sm font-medium text-wine">Status</label>
          <select
            value={posting.status}
            onChange={(e) => onUpdate(posting.id, { status: e.target.value as PostingStatus })}
            className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
          >
            {POSTING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-wine">Interest</label>
          <PriorityStars
            priority={posting.interest}
            onChange={(p) => onUpdate(posting.id, { interest: p })}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-wine">Tags</label>
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
        <label className="mb-1 block text-sm font-medium text-wine">Next Action Date</label>
        <input
          type="date"
          value={posting.nextActionDate || ''}
          onChange={(e) => onUpdate(posting.id, { nextActionDate: e.target.value || undefined })}
          className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
        />
      </div>

      {posting.salary && (
        <div>
          <label className="mb-1 block text-sm font-medium text-wine">Salary</label>
          <p className="text-sm text-wine/70">{posting.salary}</p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-wine">Description</label>
        <div className="max-h-48 overflow-y-auto rounded-md border border-sage/20 bg-champagne-50 p-3 text-sm text-wine/70 whitespace-pre-wrap">
          {posting.description || 'No description available'}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-wine">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          rows={4}
          placeholder="Add notes about this application..."
          className="w-full resize-none rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
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
        <label className="block text-sm font-medium text-wine">
          Linked Connections ({linkedConnections.length})
        </label>
        <button
          onClick={onShowQuickLink}
          className="text-xs text-flatred hover:text-flatred-600"
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
        <div className="rounded-md bg-champagne-50 p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-champagne-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm text-wine/60 mb-2">No connections linked</p>
          <button
            onClick={onShowQuickLink}
            className="text-sm text-flatred hover:text-flatred-600"
          >
            Link a connection
          </button>
        </div>
      )}
    </div>
  );
}
