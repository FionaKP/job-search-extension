import { useState } from 'react';
import {
  Connection,
  ContactEvent,
  ContactEventType,
  RELATIONSHIP_TYPE_LABELS,
  RELATIONSHIP_STRENGTH_LABELS,
  CONTACT_EVENT_TYPE_LABELS,
  Posting,
} from '@/types';

interface ConnectionDetailPanelProps {
  connection: Connection;
  linkedPostings: Posting[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLogContact: (event: ContactEvent) => void;
  onViewPosting: (postingId: string) => void;
  onUnlinkPosting: (postingId: string) => void;
  onUpdateFollowUp: (date: string | undefined) => void;
}

export function ConnectionDetailPanel({
  connection,
  linkedPostings,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onLogContact,
  onViewPosting,
  onUnlinkPosting,
  onUpdateFollowUp,
}: ConnectionDetailPanelProps) {
  const [showLogContact, setShowLogContact] = useState(false);
  const [newContact, setNewContact] = useState({
    type: 'email' as ContactEventType,
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const strengthDots = Array.from({ length: 3 }, (_, i) => (
    <span
      key={i}
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        i < connection.relationshipStrength ? 'bg-indigo-500' : 'bg-gray-200'
      }`}
    />
  ));

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isFollowUpDue = connection.nextFollowUp && new Date(connection.nextFollowUp) <= new Date();

  const handleLogContact = () => {
    const event: ContactEvent = {
      id: `contact_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      date: newContact.date,
      type: newContact.type,
      notes: newContact.notes.trim() || undefined,
    };
    onLogContact(event);
    setShowLogContact(false);
    setNewContact({ type: 'email', notes: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  // Sort contact history by date (newest first)
  const sortedHistory = [...connection.contactHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xl flex-shrink-0">
              {connection.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{connection.name}</h2>
              <p className="text-gray-600">
                {connection.role ? `${connection.role} @ ` : ''}{connection.company}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex gap-0.5">{strengthDots}</span>
                <span className="text-sm text-gray-500">
                  {RELATIONSHIP_STRENGTH_LABELS[connection.relationshipStrength]} connection
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Contact Info */}
          <div className="space-y-2">
            {connection.email && (
              <a
                href={`mailto:${connection.email}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {connection.email}
              </a>
            )}
            {connection.linkedInUrl && (
              <a
                href={connection.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                View LinkedIn Profile
              </a>
            )}
          </div>

          {/* Relationship Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
            <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
              {RELATIONSHIP_TYPE_LABELS[connection.relationshipType]}
            </span>
          </div>

          {/* How We Met */}
          {connection.howWeMet && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">How We Met</h3>
              <p className="text-gray-700">{connection.howWeMet}</p>
            </div>
          )}

          {/* Next Follow-up */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Next Follow-up</h3>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={connection.nextFollowUp || ''}
                onChange={(e) => onUpdateFollowUp(e.target.value || undefined)}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isFollowUpDue ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {isFollowUpDue && (
                <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Overdue!
                </span>
              )}
            </div>
          </div>

          {/* Contact History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Contact History</h3>
              <button
                onClick={() => setShowLogContact(!showLogContact)}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Log Contact
              </button>
            </div>

            {/* Log Contact Form */}
            {showLogContact && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    value={newContact.type}
                    onChange={(e) => setNewContact({ ...newContact, type: e.target.value as ContactEventType })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {(Object.keys(CONTACT_EVENT_TYPE_LABELS) as ContactEventType[]).map((type) => (
                      <option key={type} value={type}>
                        {CONTACT_EVENT_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={newContact.date}
                    onChange={(e) => setNewContact({ ...newContact, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                  <textarea
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Brief description of the conversation..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowLogContact(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogContact}
                    className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* History List */}
            {sortedHistory.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No contact history yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedHistory.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {CONTACT_EVENT_TYPE_LABELS[event.type].charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {CONTACT_EVENT_TYPE_LABELS[event.type]}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
                      </div>
                      {event.notes && <p className="text-sm text-gray-600 mt-0.5">{event.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Postings */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Linked Postings ({linkedPostings.length})
            </h3>
            {linkedPostings.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No postings linked yet.</p>
            ) : (
              <div className="space-y-2">
                {linkedPostings.map((posting) => (
                  <div
                    key={posting.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => onViewPosting(posting.id)}
                      className="text-left flex-1 hover:text-indigo-600"
                    >
                      <p className="text-sm font-medium text-gray-900">{posting.title}</p>
                      <p className="text-xs text-gray-500">{posting.company} · {posting.status}</p>
                    </button>
                    <button
                      onClick={() => onUnlinkPosting(posting.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Unlink posting"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {connection.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{connection.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Edit Connection
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Connection?</h3>
            <p className="text-gray-600 mb-4">
              This will permanently delete <strong>{connection.name}</strong> and remove them from all linked postings.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ConnectionDetailPanel;
