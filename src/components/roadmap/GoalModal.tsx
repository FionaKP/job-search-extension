import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Goal,
  GoalType,
  GoalTemplate,
  GOAL_TEMPLATES,
  GOAL_TYPE_LABELS,
  Posting,
  Connection,
  GoalReminderConfig,
  RecurringPattern,
} from '@/types';

// SVG Icon components for goal types
const GoalTypeIcon: React.FC<{ type: GoalType; className?: string }> = ({ type, className = "h-5 w-5" }) => {
  switch (type) {
    case 'application':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'networking':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'interview':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'followup':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'custom':
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
  }
};

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Goal) => void;
  goal?: Goal | null;
  postings?: Posting[];
  connections?: Connection[];
  existingGoals?: Goal[]; // For dependencies
  defaultDate?: string;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goal,
  postings = [],
  connections = [],
  existingGoals = [],
  defaultDate,
}) => {
  const isEditing = !!goal;

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('application');
  const [dueDate, setDueDate] = useState('');
  const [targetCount, setTargetCount] = useState<number | undefined>(undefined);
  const [currentCount, setCurrentCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [linkedPostingIds, setLinkedPostingIds] = useState<string[]>([]);
  const [linkedConnectionIds, setLinkedConnectionIds] = useState<string[]>([]);
  const [dependsOn, setDependsOn] = useState<string[]>([]);

  // Reminder settings
  const [enableReminder, setEnableReminder] = useState(true);
  const [reminderTiming, setReminderTiming] = useState(1440); // 1 day
  const [enableDailyReminder, setEnableDailyReminder] = useState(false);

  // Recurring settings
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [recurringEndDate, setRecurringEndDate] = useState('');

  // UI state
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<GoalType | 'all'>('all');

  // Initialize form when editing
  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setType(goal.type);
      setDueDate(goal.dueDate.split('T')[0]);
      setTargetCount(goal.targetCount);
      setCurrentCount(goal.currentCount);
      setNotes(goal.notes || '');
      setLinkedPostingIds(goal.linkedPostingIds);
      setLinkedConnectionIds(goal.linkedConnectionIds);
      setDependsOn(goal.dependsOn || []);
      setIsRecurring(goal.isRecurring || false);
      if (goal.recurringPattern) {
        setRecurringFrequency(goal.recurringPattern.frequency);
        setRecurringInterval(goal.recurringPattern.interval);
        setRecurringEndDate(goal.recurringPattern.endDate?.split('T')[0] || '');
      }
      setShowTemplates(false);
    } else {
      // Reset form
      setTitle('');
      setType('application');
      setDueDate(defaultDate?.split('T')[0] || getDefaultDueDate());
      setTargetCount(undefined);
      setCurrentCount(0);
      setNotes('');
      setLinkedPostingIds([]);
      setLinkedConnectionIds([]);
      setDependsOn([]);
      setIsRecurring(false);
      setRecurringFrequency('weekly');
      setRecurringInterval(1);
      setRecurringEndDate('');
      setShowTemplates(true);
    }
  }, [goal, defaultDate, isOpen]);

  // Get default due date (end of week)
  function getDefaultDueDate(): string {
    const date = new Date();
    const daysUntilFriday = (5 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilFriday);
    return date.toISOString().split('T')[0];
  }

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return GOAL_TEMPLATES;
    return GOAL_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  // Apply template
  const handleApplyTemplate = useCallback((template: GoalTemplate) => {
    setTitle(template.title);
    setType(template.category);
    if (template.defaultTargetCount) {
      setTargetCount(template.defaultTargetCount);
    }
    setShowTemplates(false);
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    if (!title.trim() || !dueDate) return;

    const reminders: GoalReminderConfig[] = [];
    if (enableReminder) {
      reminders.push({
        id: `reminder-${Date.now()}`,
        goalId: goal?.id || '',
        type: 'before_due',
        timing: reminderTiming,
        sent: false,
        dismissed: false,
      });
    }
    if (enableDailyReminder) {
      reminders.push({
        id: `daily-${Date.now()}`,
        goalId: goal?.id || '',
        type: 'daily',
        timing: 0,
        sent: false,
        dismissed: false,
      });
    }

    const recurringPattern: RecurringPattern | undefined = isRecurring
      ? {
          frequency: recurringFrequency,
          interval: recurringInterval,
          endDate: recurringEndDate || undefined,
        }
      : undefined;

    const newGoal: Goal = {
      id: goal?.id || `goal-${Date.now()}`,
      title: title.trim(),
      type,
      targetCount,
      currentCount: isEditing ? currentCount : 0,
      completed: goal?.completed || false,
      completedAt: goal?.completedAt,
      dueDate: new Date(dueDate).toISOString(),
      createdAt: goal?.createdAt || new Date().toISOString(),
      linkedPostingIds,
      linkedConnectionIds,
      reminders,
      notes: notes.trim() || undefined,
      isRecurring,
      recurringPattern,
      dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
    };

    onSave(newGoal);
    onClose();
  }, [
    title,
    type,
    dueDate,
    targetCount,
    currentCount,
    notes,
    linkedPostingIds,
    linkedConnectionIds,
    enableReminder,
    reminderTiming,
    enableDailyReminder,
    isRecurring,
    recurringFrequency,
    recurringInterval,
    recurringEndDate,
    dependsOn,
    goal,
    isEditing,
    onSave,
    onClose,
  ]);

  // Toggle posting link
  const togglePostingLink = useCallback((postingId: string) => {
    setLinkedPostingIds((prev) =>
      prev.includes(postingId)
        ? prev.filter((id) => id !== postingId)
        : [...prev, postingId]
    );
  }, []);

  // Toggle connection link
  const toggleConnectionLink = useCallback((connectionId: string) => {
    setLinkedConnectionIds((prev) =>
      prev.includes(connectionId)
        ? prev.filter((id) => id !== connectionId)
        : [...prev, connectionId]
    );
  }, []);

  // Toggle dependency
  const toggleDependency = useCallback((goalId: string) => {
    setDependsOn((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-wine/10 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-wine">
            {isEditing ? 'Edit Goal' : 'Create Goal'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-wine/40 hover:bg-wine/10 hover:text-wine transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Start Templates */}
          {showTemplates && !isEditing && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-wine">Quick Start</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`rounded px-2 py-1 text-xs transition-colors ${
                      selectedCategory === 'all' ? 'bg-wine text-white' : 'text-wine/60 hover:bg-wine/10'
                    }`}
                  >
                    All
                  </button>
                  {(['application', 'networking', 'interview', 'followup'] as GoalType[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded px-2 py-1 text-xs flex items-center justify-center transition-colors ${
                        selectedCategory === cat ? 'bg-wine text-white' : 'text-wine/60 hover:bg-wine/10'
                      }`}
                      title={GOAL_TYPE_LABELS[cat]}
                    >
                      <GoalTypeIcon type={cat} className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleApplyTemplate(template)}
                    className="flex items-center gap-2 rounded-lg border border-wine/10 p-3 text-left transition-all duration-base hover:border-wine hover:bg-wine/5 hover:shadow-sm"
                  >
                    <span className="text-wine/70"><GoalTypeIcon type={template.category} className="h-5 w-5" /></span>
                    <span className="text-sm font-medium text-wine">{template.title}</span>
                  </button>
                ))}
                <button
                  onClick={() => setShowTemplates(false)}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-wine/20 p-3 text-left text-wine/50 transition-all duration-base hover:border-wine hover:text-wine"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-medium">Custom goal...</span>
                </button>
              </div>
              <div className="mt-4 border-t border-wine/10 pt-4 text-center text-sm text-wine/40">
                or customize below
              </div>
            </div>
          )}

          {/* Goal Title */}
          <div>
            <label className="block text-sm font-medium text-wine mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Apply to 5 roles"
              className="w-full rounded-lg border border-wine/20 px-3 py-2 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine transition-colors"
            />
          </div>

          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium text-wine mb-1">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {(['application', 'networking', 'interview', 'followup', 'custom'] as GoalType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-base ${
                    type === t
                      ? 'bg-wine text-white shadow-sm'
                      : 'bg-champagne-100 text-wine hover:bg-champagne-200'
                  }`}
                >
                  <GoalTypeIcon type={t} className="h-4 w-4" />
                  <span>{GOAL_TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-wine mb-1">
              Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-wine/20 px-3 py-2 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine transition-colors"
            />
          </div>

          {/* Target Count (optional) */}
          <div>
            <label className="block text-sm font-medium text-wine mb-1">
              Target Count (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={targetCount || ''}
                onChange={(e) => setTargetCount(e.target.value ? parseInt(e.target.value) : undefined)}
                min={1}
                placeholder="e.g., 5"
                className="w-24 rounded-lg border border-wine/20 px-3 py-2 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine transition-colors"
              />
              <span className="text-sm text-wine/60">items to complete</span>
            </div>
          </div>

          {/* Current Progress (only when editing) */}
          {isEditing && targetCount && (
            <div>
              <label className="block text-sm font-medium text-wine mb-1">
                Current Progress
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={currentCount}
                  onChange={(e) => setCurrentCount(Math.max(0, parseInt(e.target.value) || 0))}
                  min={0}
                  max={targetCount}
                  className="w-24 rounded-lg border border-wine/20 px-3 py-2 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine transition-colors"
                />
                <span className="text-sm text-wine/60">of {targetCount}</span>
                <div className="flex-1 h-2 rounded-full bg-champagne-200">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all"
                    style={{ width: `${Math.min(100, (currentCount / targetCount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reminders */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-wine">
              Reminders
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableReminder}
                onChange={(e) => setEnableReminder(e.target.checked)}
                className="rounded border-wine/30 text-wine focus:ring-wine"
              />
              <span className="text-sm text-wine/70">Remind me</span>
              <select
                value={reminderTiming}
                onChange={(e) => setReminderTiming(parseInt(e.target.value))}
                disabled={!enableReminder}
                className="rounded border border-wine/20 px-2 py-1 text-sm text-wine disabled:opacity-50 focus:border-wine focus:ring-wine"
              >
                <option value={60}>1 hour</option>
                <option value={180}>3 hours</option>
                <option value={1440}>1 day</option>
                <option value={2880}>2 days</option>
                <option value={4320}>3 days</option>
                <option value={10080}>1 week</option>
              </select>
              <span className="text-sm text-wine/70">before due date</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableDailyReminder}
                onChange={(e) => setEnableDailyReminder(e.target.checked)}
                className="rounded border-wine/30 text-wine focus:ring-wine"
              />
              <span className="text-sm text-wine/70">Daily check-in until complete</span>
            </label>
          </div>

          {/* Recurring Goals */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-wine/30 text-wine focus:ring-wine"
              />
              <span className="text-sm font-medium text-wine">Make this a recurring goal</span>
            </label>
            {isRecurring && (
              <div className="ml-6 flex flex-wrap items-center gap-2 text-sm text-wine/70">
                <span>Repeat every</span>
                <input
                  type="number"
                  value={recurringInterval}
                  onChange={(e) => setRecurringInterval(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="w-16 rounded border border-wine/20 px-2 py-1 focus:border-wine focus:ring-wine"
                />
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as typeof recurringFrequency)}
                  className="rounded border border-wine/20 px-2 py-1 focus:border-wine focus:ring-wine"
                >
                  <option value="daily">day(s)</option>
                  <option value="weekly">week(s)</option>
                  <option value="monthly">month(s)</option>
                </select>
                <span>until</span>
                <input
                  type="date"
                  value={recurringEndDate}
                  onChange={(e) => setRecurringEndDate(e.target.value)}
                  min={dueDate}
                  placeholder="No end date"
                  className="rounded border border-wine/20 px-2 py-1 focus:border-wine focus:ring-wine"
                />
              </div>
            )}
          </div>

          {/* Dependencies */}
          {existingGoals.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-wine mb-2">
                Depends On (optional)
              </label>
              <p className="text-xs text-wine/50 mb-2">
                Select goals that must be completed before this one
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border border-wine/10 p-2">
                {existingGoals
                  .filter((g) => g.id !== goal?.id && !g.completed)
                  .map((g) => (
                    <label
                      key={g.id}
                      className="flex items-center gap-2 rounded p-1 hover:bg-champagne-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={dependsOn.includes(g.id)}
                        onChange={() => toggleDependency(g.id)}
                        className="rounded border-wine/30 text-wine focus:ring-wine"
                      />
                      <span className="text-wine/70"><GoalTypeIcon type={g.type} className="h-4 w-4" /></span>
                      <span className="text-sm text-wine truncate">{g.title}</span>
                    </label>
                  ))}
                {existingGoals.filter((g) => g.id !== goal?.id && !g.completed).length === 0 && (
                  <div className="text-sm text-wine/40 text-center py-2">No other active goals</div>
                )}
              </div>
            </div>
          )}

          {/* Link to Postings */}
          {postings.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-wine mb-2">
                Link to Postings (optional)
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border border-wine/10 p-2">
                {postings.slice(0, 20).map((posting) => (
                  <label
                    key={posting.id}
                    className="flex items-center gap-2 rounded p-1 hover:bg-champagne-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={linkedPostingIds.includes(posting.id)}
                      onChange={() => togglePostingLink(posting.id)}
                      className="rounded border-wine/30 text-wine focus:ring-wine"
                    />
                    <span className="text-sm text-wine truncate">
                      {posting.title} - {posting.company}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Link to Connections */}
          {connections.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-wine mb-2">
                Link to Connections (optional)
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border border-wine/10 p-2">
                {connections.slice(0, 20).map((connection) => (
                  <label
                    key={connection.id}
                    className="flex items-center gap-2 rounded p-1 hover:bg-champagne-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={linkedConnectionIds.includes(connection.id)}
                      onChange={() => toggleConnectionLink(connection.id)}
                      className="rounded border-wine/30 text-wine focus:ring-wine"
                    />
                    <span className="text-sm text-wine truncate">
                      {connection.name} - {connection.company}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-wine mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or context..."
              rows={3}
              className="w-full rounded-lg border border-wine/20 px-3 py-2 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-wine/10 bg-champagne-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-wine hover:bg-wine/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !dueDate}
            className="rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white hover:bg-wine/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isEditing ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
