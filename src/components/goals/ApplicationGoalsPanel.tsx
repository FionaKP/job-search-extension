import { useState, useMemo } from 'react';
import { Posting } from '@/types';

interface ApplicationGoalsPanelProps {
  posting: Posting;
  onUpdate: (updates: Partial<Posting>) => void;
  onStatusChange: (status: 'in_progress' | 'withdrawn') => void;
}

// Snooze duration options
const SNOOZE_OPTIONS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
] as const;

/**
 * Panel showing application goals, deadlines, and quick actions
 * Displayed for 'saved' and 'in_progress' status postings
 */
export function ApplicationGoalsPanel({
  posting,
  onUpdate,
  onStatusChange,
}: ApplicationGoalsPanelProps) {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  // Calculate timing info
  const timingInfo = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const dateAdded = new Date(posting.dateAdded);
    dateAdded.setHours(0, 0, 0, 0);
    const daysSaved = Math.floor((now.getTime() - dateAdded.getTime()) / (1000 * 60 * 60 * 24));

    let daysUntilGoal: number | null = null;
    let goalStatus: 'upcoming' | 'soon' | 'overdue' | 'none' = 'none';

    if (posting.applicationGoalDate) {
      const goalDate = new Date(posting.applicationGoalDate);
      goalDate.setHours(0, 0, 0, 0);
      daysUntilGoal = Math.floor((goalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilGoal < 0) {
        goalStatus = 'overdue';
      } else if (daysUntilGoal <= 3) {
        goalStatus = 'soon';
      } else {
        goalStatus = 'upcoming';
      }
    }

    // Check if currently snoozed
    let isSnoozed = false;
    let snoozeDaysRemaining = 0;
    if (posting.snoozedUntil) {
      const snoozeDate = new Date(posting.snoozedUntil);
      snoozeDate.setHours(0, 0, 0, 0);
      snoozeDaysRemaining = Math.floor((snoozeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      isSnoozed = snoozeDaysRemaining > 0;
    }

    // Suggested goal: 10 days from when saved (typical job posting lifespan)
    const suggestedGoal = new Date(posting.dateAdded);
    suggestedGoal.setDate(suggestedGoal.getDate() + 10);
    const suggestedGoalStr = suggestedGoal.toISOString().split('T')[0];

    return {
      daysSaved,
      daysUntilGoal,
      goalStatus,
      isSnoozed,
      snoozeDaysRemaining,
      suggestedGoalStr,
    };
  }, [posting.dateAdded, posting.applicationGoalDate, posting.snoozedUntil]);

  const handleSetGoalDate = (date: string) => {
    onUpdate({ applicationGoalDate: date || undefined });
  };

  const handleSnooze = (days: number) => {
    const snoozeUntil = new Date();
    snoozeUntil.setDate(snoozeUntil.getDate() + days);
    onUpdate({ snoozedUntil: snoozeUntil.toISOString().split('T')[0] });
    setShowSnoozeOptions(false);
  };

  const handleClearSnooze = () => {
    onUpdate({ snoozedUntil: undefined });
  };

  const handleUseSuggestedGoal = () => {
    onUpdate({ applicationGoalDate: timingInfo.suggestedGoalStr });
  };

  // Goal status colors
  const goalStatusColors = {
    upcoming: 'text-teal-600 bg-teal-50 border-teal-200',
    soon: 'text-pandora-600 bg-pandora-50 border-pandora-200',
    overdue: 'text-flatred bg-flatred-50 border-flatred-200',
    none: 'text-wine/60 bg-champagne-50 border-sage/20',
  };

  return (
    <div className="rounded-lg border border-sage/20 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-champagne-50 border-b border-sage/20 flex items-center gap-2">
        <svg className="w-4 h-4 text-wine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-sm font-semibold text-wine">Application Timeline</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Snoozed indicator */}
        {timingInfo.isSnoozed && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 border border-indigo-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-indigo-700">
                Snoozed for {timingInfo.snoozeDaysRemaining} more day{timingInfo.snoozeDaysRemaining !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={handleClearSnooze}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Wake up
            </button>
          </div>
        )}

        {/* Timing info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-wine/60">Saved</span>
          <span className="text-wine">
            {timingInfo.daysSaved === 0
              ? 'Today'
              : `${timingInfo.daysSaved} day${timingInfo.daysSaved !== 1 ? 's' : ''} ago`}
          </span>
        </div>

        {/* Goal date input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-wine">Goal: Apply by</label>
            {!posting.applicationGoalDate && (
              <button
                onClick={handleUseSuggestedGoal}
                className="text-xs text-flatred hover:text-flatred-600"
              >
                Use suggested
              </button>
            )}
          </div>
          <input
            type="date"
            value={posting.applicationGoalDate || ''}
            onChange={(e) => handleSetGoalDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
          />
        </div>

        {/* Goal status */}
        {posting.applicationGoalDate && timingInfo.daysUntilGoal !== null && (
          <div className={`p-3 rounded-lg border ${goalStatusColors[timingInfo.goalStatus]}`}>
            <div className="flex items-center gap-2">
              {timingInfo.goalStatus === 'overdue' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : timingInfo.goalStatus === 'soon' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm font-medium">
                {timingInfo.goalStatus === 'overdue'
                  ? `${Math.abs(timingInfo.daysUntilGoal)} day${Math.abs(timingInfo.daysUntilGoal) !== 1 ? 's' : ''} overdue`
                  : timingInfo.daysUntilGoal === 0
                    ? 'Due today!'
                    : `${timingInfo.daysUntilGoal} day${timingInfo.daysUntilGoal !== 1 ? 's' : ''} left`}
              </span>
            </div>
          </div>
        )}

        {/* Stale warning */}
        {!posting.applicationGoalDate && timingInfo.daysSaved >= 7 && (
          <div className="p-3 rounded-lg bg-pandora-50 border border-pandora-200">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-pandora-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-pandora-700">
                  You saved this {timingInfo.daysSaved} days ago. Ready to apply?
                </p>
                <p className="text-xs text-pandora-600 mt-1">
                  Similar roles typically close in 2-3 weeks
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Snooze options */}
        <div className="relative">
          <button
            onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-wine/60 hover:text-wine border border-sage/20 rounded-lg hover:border-sage/40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Remind me later
          </button>

          {showSnoozeOptions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-sage/20 shadow-lg overflow-hidden z-10">
              {SNOOZE_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  onClick={() => handleSnooze(option.days)}
                  className="w-full px-4 py-2 text-sm text-wine hover:bg-champagne-50 text-left"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="pt-2 border-t border-sage/20 space-y-2">
          <p className="text-xs font-medium text-wine/50 uppercase tracking-wide">Quick Actions</p>

          {posting.status === 'saved' && (
            <button
              onClick={() => onStatusChange('in_progress')}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Start Working on Application
            </button>
          )}

          {posting.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange('in_progress')}
              disabled
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-teal-700 bg-teal-100 rounded-lg cursor-default"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Working on it
            </button>
          )}

          <button
            onClick={() => onStatusChange('withdrawn')}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-wine/60 hover:text-wine hover:bg-champagne-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Not interested anymore
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationGoalsPanel;
