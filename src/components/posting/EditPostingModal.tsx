import { useState, useEffect } from 'react';
import { Posting, InterestLevel } from '@/types';
import { InterestStars } from '@/components/common';

interface EditPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Posting>) => void;
  posting: Posting | null;
}

export function EditPostingModal({ isOpen, onClose, onSave, posting }: EditPostingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    interest: 3 as InterestLevel,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens or posting changes
  useEffect(() => {
    if (isOpen && posting) {
      setFormData({
        title: posting.title,
        company: posting.company,
        location: posting.location,
        salary: posting.salary || '',
        description: posting.description,
        interest: posting.interest,
      });
      setErrors({});
    }
  }, [isOpen, posting]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !posting) return;

    onSave(posting.id, {
      title: formData.title.trim(),
      company: formData.company.trim(),
      location: formData.location.trim(),
      salary: formData.salary.trim() || undefined,
      description: formData.description.trim(),
      interest: formData.interest,
      dateModified: Date.now(),
    });
    onClose();
  };

  if (!isOpen || !posting) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-wine/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sage/20 px-6 py-4">
          <h2 className="text-lg font-semibold text-wine">Edit Posting</h2>
          <button
            onClick={onClose}
            className="btn btn-icon btn-ghost text-wine/50 hover:text-wine"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-wine">
                Job Title <span className="text-flatred">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`input w-full ${errors.title ? 'border-flatred' : ''}`}
                placeholder="e.g., Senior Software Engineer"
              />
              {errors.title && <p className="mt-1 text-sm text-flatred">{errors.title}</p>}
            </div>

            {/* Company */}
            <div>
              <label className="mb-1 block text-sm font-medium text-wine">
                Company <span className="text-flatred">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={`input w-full ${errors.company ? 'border-flatred' : ''}`}
                placeholder="e.g., Acme Inc."
              />
              {errors.company && <p className="mt-1 text-sm text-flatred">{errors.company}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="mb-1 block text-sm font-medium text-wine">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input w-full"
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </div>

            {/* Salary */}
            <div>
              <label className="mb-1 block text-sm font-medium text-wine">Salary</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="input w-full"
                placeholder="e.g., $120,000 - $150,000"
              />
            </div>

            {/* Interest */}
            <div>
              <label className="mb-1 block text-sm font-medium text-wine">Interest Level</label>
              <InterestStars
                interest={formData.interest}
                onChange={(interest) => setFormData({ ...formData, interest })}
                size="md"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-wine">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input w-full h-32 resize-none"
                placeholder="Job description..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
