import { useState, useMemo } from 'react';
import {
  Posting,
  RejectionDetails,
  RejectionStage,
  REJECTION_STAGE_LABELS,
  REJECTION_STAGE_ORDER,
} from '@/types';

interface RejectionInsightsPanelProps {
  posting: Posting;
  onUpdate: (updates: Partial<Posting>) => void;
}

/**
 * Panel showing rejection insights, feedback, and learnings
 * Displayed for 'rejected' status postings
 */
export function RejectionInsightsPanel({
  posting,
  onUpdate,
}: RejectionInsightsPanelProps) {
  const [isEditing, setIsEditing] = useState(!posting.rejectionDetails);
  const [editForm, setEditForm] = useState<RejectionDetails>(() => ({
    stage: posting.rejectionDetails?.stage || 'unknown',
    reason: posting.rejectionDetails?.reason || '',
    feedback: posting.rejectionDetails?.feedback || '',
    takeaway: posting.rejectionDetails?.takeaway || '',
    rejectedAt: posting.rejectionDetails?.rejectedAt || new Date().toISOString().split('T')[0],
  }));

  const timingInfo = useMemo(() => {
    if (!posting.rejectionDetails?.rejectedAt) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const rejectedDate = new Date(posting.rejectionDetails.rejectedAt);
    rejectedDate.setHours(0, 0, 0, 0);
    const daysSince = Math.floor((now.getTime() - rejectedDate.getTime()) / (1000 * 60 * 60 * 24));

    return { daysSince };
  }, [posting.rejectionDetails?.rejectedAt]);

  const handleSave = () => {
    onUpdate({
      rejectionDetails: {
        ...editForm,
        rejectedAt: editForm.rejectedAt || new Date().toISOString().split('T')[0],
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (posting.rejectionDetails) {
      setEditForm({
        stage: posting.rejectionDetails.stage,
        reason: posting.rejectionDetails.reason || '',
        feedback: posting.rejectionDetails.feedback || '',
        takeaway: posting.rejectionDetails.takeaway || '',
        rejectedAt: posting.rejectionDetails.rejectedAt,
      });
      setIsEditing(false);
    }
  };

  const handleFindSimilar = () => {
    // Search for similar jobs on major job boards
    const searchQuery = encodeURIComponent(`${posting.title} ${posting.location || ''}`);
    window.open(`https://www.linkedin.com/jobs/search/?keywords=${searchQuery}`, '_blank');
  };

  // Stage progress visualization
  const stageIndex = REJECTION_STAGE_ORDER.indexOf(
    posting.rejectionDetails?.stage || 'unknown'
  );
  const progressPercentage = posting.rejectionDetails?.stage && posting.rejectionDetails.stage !== 'unknown'
    ? ((stageIndex + 1) / (REJECTION_STAGE_ORDER.length - 1)) * 100
    : 0;

  // Stage colors
  const stageColors: Record<RejectionStage, string> = {
    application: 'text-wine/60 bg-champagne-100',
    phone: 'text-teal-700 bg-teal-50',
    technical: 'text-indigo-700 bg-indigo-50',
    onsite: 'text-pandora-700 bg-pandora-50',
    offer: 'text-flatred bg-flatred-50',
    unknown: 'text-wine/50 bg-champagne-50',
  };

  return (
    <div className="rounded-lg border border-sage/20 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-champagne-50 border-b border-sage/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-wine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-wine">Rejection Insights</h3>
        </div>
        {posting.rejectionDetails && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-flatred hover:text-flatred-600"
          >
            Edit
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            {/* Stage Selection */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-wine">
                Rejection Stage
              </label>
              <select
                value={editForm.stage}
                onChange={(e) => setEditForm({ ...editForm, stage: e.target.value as RejectionStage })}
                className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
              >
                {REJECTION_STAGE_ORDER.map((stage) => (
                  <option key={stage} value={stage}>
                    {REJECTION_STAGE_LABELS[stage]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-wine/50">
                What stage were you at when you received the rejection?
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-wine">
                Rejection Date
              </label>
              <input
                type="date"
                value={editForm.rejectedAt}
                onChange={(e) => setEditForm({ ...editForm, rejectedAt: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-wine">
                Reason (if known)
              </label>
              <input
                type="text"
                value={editForm.reason}
                onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                placeholder="e.g., Position filled, not enough experience..."
                className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine placeholder:text-wine/40 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
              />
            </div>

            {/* Feedback */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-wine">
                Feedback from Company
              </label>
              <textarea
                value={editForm.feedback}
                onChange={(e) => setEditForm({ ...editForm, feedback: e.target.value })}
                placeholder="Any feedback they provided..."
                rows={3}
                className="w-full resize-none rounded-md border border-sage/30 px-3 py-2 text-sm text-wine placeholder:text-wine/40 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
              />
            </div>

            {/* Takeaway */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-wine">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-pandora-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Takeaway for Next Time
                </span>
              </label>
              <textarea
                value={editForm.takeaway}
                onChange={(e) => setEditForm({ ...editForm, takeaway: e.target.value })}
                placeholder="What will you do differently? What did you learn?"
                rows={3}
                className="w-full resize-none rounded-md border border-sage/30 px-3 py-2 text-sm text-wine placeholder:text-wine/40 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                Save Insights
              </button>
              {posting.rejectionDetails && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm text-wine/60 hover:text-wine hover:bg-champagne-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : posting.rejectionDetails ? (
          // View Mode
          <div className="space-y-4">
            {/* Stage Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-wine/60">Made it to</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded ${stageColors[posting.rejectionDetails.stage]}`}>
                  {REJECTION_STAGE_LABELS[posting.rejectionDetails.stage]}
                </span>
              </div>
              {posting.rejectionDetails.stage !== 'unknown' && (
                <div className="h-2 bg-champagne-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
            </div>

            {/* Timing */}
            {timingInfo && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-wine/60">Rejected</span>
                <span className="text-wine">
                  {timingInfo.daysSince === 0
                    ? 'Today'
                    : timingInfo.daysSince === 1
                      ? 'Yesterday'
                      : `${timingInfo.daysSince} days ago`}
                </span>
              </div>
            )}

            {/* Reason */}
            {posting.rejectionDetails.reason && (
              <div className="p-3 rounded-lg bg-champagne-50 border border-sage/20">
                <p className="text-xs font-medium text-wine/50 uppercase tracking-wide mb-1">Reason</p>
                <p className="text-sm text-wine">{posting.rejectionDetails.reason}</p>
              </div>
            )}

            {/* Feedback */}
            {posting.rejectionDetails.feedback && (
              <div className="p-3 rounded-lg bg-champagne-50 border border-sage/20">
                <p className="text-xs font-medium text-wine/50 uppercase tracking-wide mb-1">Their Feedback</p>
                <p className="text-sm text-wine whitespace-pre-wrap">{posting.rejectionDetails.feedback}</p>
              </div>
            )}

            {/* Takeaway */}
            {posting.rejectionDetails.takeaway && (
              <div className="p-3 rounded-lg bg-pandora-50 border border-pandora-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-4 h-4 text-pandora-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-xs font-medium text-pandora-600 uppercase tracking-wide">Takeaway</p>
                </div>
                <p className="text-sm text-pandora-800 whitespace-pre-wrap">{posting.rejectionDetails.takeaway}</p>
              </div>
            )}

            {/* No details message */}
            {!posting.rejectionDetails.reason && !posting.rejectionDetails.feedback && !posting.rejectionDetails.takeaway && (
              <div className="p-3 rounded-lg bg-champagne-50 border border-sage/20 text-center">
                <p className="text-sm text-wine/60">No details recorded yet.</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-1 text-sm text-flatred hover:text-flatred-600"
                >
                  Add rejection details
                </button>
              </div>
            )}

            {/* Find Similar Jobs */}
            <div className="pt-2 border-t border-sage/20">
              <button
                onClick={handleFindSimilar}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-wine hover:text-flatred border border-sage/20 rounded-lg hover:border-flatred/30 hover:bg-flatred-50/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Similar Jobs
              </button>
            </div>

            {/* Encouragement */}
            <div className="text-center text-xs text-wine/50 pt-2">
              Every rejection is a step closer to the right opportunity.
            </div>
          </div>
        ) : (
          // No rejection details yet
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-champagne-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-wine/60 mb-3">
              Record what you learned from this experience.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              Add Rejection Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RejectionInsightsPanel;
