import { useState, useEffect } from 'react';
import {
  Connection,
  RelationshipType,
  RELATIONSHIP_TYPE_LABELS,
  RELATIONSHIP_STRENGTH_LABELS,
  Posting,
} from '@/types';

interface ConnectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connection: Connection) => void;
  connection?: Connection | null; // If provided, edit mode
  postings?: Posting[]; // For linking postings
  prefilledCompany?: string; // Pre-fill company when adding from posting
}

export function ConnectionFormModal({
  isOpen,
  onClose,
  onSave,
  connection,
  postings = [],
  prefilledCompany,
}: ConnectionFormModalProps) {
  const isEditMode = !!connection;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedInUrl: '',
    company: prefilledCompany || '',
    role: '',
    relationshipType: 'other' as RelationshipType,
    howWeMet: '',
    relationshipStrength: 2 as 1 | 2 | 3,
    notes: '',
    nextFollowUp: '',
    linkedPostingIds: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens or connection changes
  useEffect(() => {
    if (isOpen) {
      if (connection) {
        setFormData({
          name: connection.name,
          email: connection.email || '',
          linkedInUrl: connection.linkedInUrl || '',
          company: connection.company,
          role: connection.role || '',
          relationshipType: connection.relationshipType,
          howWeMet: connection.howWeMet || '',
          relationshipStrength: connection.relationshipStrength,
          notes: connection.notes,
          nextFollowUp: connection.nextFollowUp || '',
          linkedPostingIds: connection.linkedPostingIds,
        });
      } else {
        setFormData({
          name: '',
          email: '',
          linkedInUrl: '',
          company: prefilledCompany || '',
          role: '',
          relationshipType: 'other',
          howWeMet: '',
          relationshipStrength: 2,
          notes: '',
          nextFollowUp: '',
          linkedPostingIds: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, connection, prefilledCompany]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleStrengthChange = (strength: 1 | 2 | 3) => {
    setFormData((prev) => ({ ...prev, relationshipStrength: strength }));
  };

  const togglePostingLink = (postingId: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedPostingIds: prev.linkedPostingIds.includes(postingId)
        ? prev.linkedPostingIds.filter((id) => id !== postingId)
        : [...prev.linkedPostingIds, postingId],
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (formData.linkedInUrl && !formData.linkedInUrl.includes('linkedin.com')) {
      newErrors.linkedInUrl = 'Must be a LinkedIn URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const now = Date.now();
    const newConnection: Connection = {
      id: connection?.id || `conn_${now}_${Math.random().toString(36).slice(2, 9)}`,
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      linkedInUrl: formData.linkedInUrl.trim() || undefined,
      company: formData.company.trim(),
      role: formData.role.trim() || undefined,
      relationshipType: formData.relationshipType,
      howWeMet: formData.howWeMet.trim() || undefined,
      relationshipStrength: formData.relationshipStrength,
      notes: formData.notes,
      lastContactDate: connection?.lastContactDate,
      nextFollowUp: formData.nextFollowUp || undefined,
      contactHistory: connection?.contactHistory || [],
      linkedPostingIds: formData.linkedPostingIds,
      dateAdded: connection?.dateAdded || now,
      dateModified: now,
    };

    onSave(newConnection);
    onClose();
  };

  if (!isOpen) return null;

  // Filter postings to show relevant ones (same company first)
  const sortedPostings = [...postings].sort((a, b) => {
    const aMatch = a.company.toLowerCase() === formData.company.toLowerCase();
    const bMatch = b.company.toLowerCase() === formData.company.toLowerCase();
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return a.company.localeCompare(b.company);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? 'Edit Connection' : 'Add Connection'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="John Smith"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.company ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Anthropic"
              />
              {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Technical Recruiter"
              />
            </div>

            {/* Relationship Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(RELATIONSHIP_TYPE_LABELS) as RelationshipType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, relationshipType: type }))}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      formData.relationshipType === type
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    } border`}
                  >
                    {RELATIONSHIP_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Relationship Strength */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship Strength
              </label>
              <div className="flex gap-4">
                {([1, 2, 3] as const).map((strength) => (
                  <button
                    key={strength}
                    type="button"
                    onClick={() => handleStrengthChange(strength)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      formData.relationshipStrength === strength
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex gap-0.5">
                      {Array.from({ length: 3 }, (_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < strength ? 'bg-indigo-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </span>
                    <span className="text-sm">{RELATIONSHIP_STRENGTH_LABELS[strength]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* How We Met */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How did you meet?
              </label>
              <input
                type="text"
                name="howWeMet"
                value={formData.howWeMet}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Career fair at MIT, October 2024"
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="john@company.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  name="linkedInUrl"
                  value={formData.linkedInUrl}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.linkedInUrl ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="linkedin.com/in/..."
                />
                {errors.linkedInUrl && (
                  <p className="mt-1 text-sm text-red-500">{errors.linkedInUrl}</p>
                )}
              </div>
            </div>

            {/* Next Follow-up */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Follow-up Date
              </label>
              <input
                type="date"
                name="nextFollowUp"
                value={formData.nextFollowUp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Any notes about this connection..."
              />
            </div>

            {/* Link to Postings */}
            {postings.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Postings
                </label>
                <div className="max-h-40 overflow-auto border border-gray-200 rounded-lg">
                  {sortedPostings.slice(0, 10).map((posting) => (
                    <label
                      key={posting.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.linkedPostingIds.includes(posting.id)}
                        onChange={() => togglePostingLink(posting.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 truncate">
                        {posting.title} @ {posting.company}
                      </span>
                    </label>
                  ))}
                </div>
                {postings.length > 10 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Showing first 10 postings. Search by company name to find more.
                  </p>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isEditMode ? 'Save Changes' : 'Add Connection'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConnectionFormModal;
