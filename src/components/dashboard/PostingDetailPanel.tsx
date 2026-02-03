import { useState, useEffect } from 'react';
import { Posting, PostingStatus, STATUS_LABELS, POSTING_STATUSES } from '@/types';
import { SlideOverPanel, PriorityStars, TagPopover, TagChip } from '@/components/common';

interface PostingDetailPanelProps {
  posting: Posting | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Posting>) => void;
  onDelete: (id: string) => void;
}

export function PostingDetailPanel({
  posting,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: PostingDetailPanelProps) {
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (posting) {
      setNotes(posting.notes);
    }
  }, [posting?.id, posting?.notes]);

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

  if (!posting) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SlideOverPanel isOpen={isOpen} onClose={onClose} width="max-w-lg">
      <div className="flex h-full flex-col">
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
                title="Open URL"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
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
              <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
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

            <div className="rounded-md bg-gray-50 p-3">
              <p className="mb-1 text-xs text-gray-500">Connections</p>
              <p className="text-sm text-gray-400 italic">Connections feature coming in Phase 4</p>
            </div>
          </div>
        </div>

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
    </SlideOverPanel>
  );
}
