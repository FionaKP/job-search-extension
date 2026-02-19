import { useState, useMemo } from 'react';
import {
  Posting,
  Interview,
  InterviewQuestion,
  InterviewType,
  InterviewOutcome,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_OUTCOME_LABELS,
  COMMON_ROUND_NAMES,
  DEFAULT_INTERVIEW_QUESTIONS,
} from '@/types';

interface InterviewPrepPanelProps {
  posting: Posting;
  onUpdate: (updates: Partial<Posting>) => void;
}

/**
 * Panel for managing interview rounds, prep notes, and questions
 * Displayed for 'interviewing' status postings
 */
export function InterviewPrepPanel({ posting, onUpdate }: InterviewPrepPanelProps) {
  const [showAddRound, setShowAddRound] = useState(false);
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');

  const interviews = posting.interviews || [];
  const questions = posting.questionsToAsk || [];
  const prepNotes = posting.prepNotes || '';

  // Sort interviews by round number
  const sortedInterviews = useMemo(() => {
    return [...interviews].sort((a, b) => a.round - b.round);
  }, [interviews]);

  // Find the next upcoming interview
  const upcomingInterview = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return sortedInterviews.find((interview) => {
      if (interview.completed) return false;
      if (!interview.date) return true; // No date = needs scheduling
      const interviewDate = new Date(interview.date);
      interviewDate.setHours(0, 0, 0, 0);
      return interviewDate >= now;
    });
  }, [sortedInterviews]);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Interview CRUD
  const handleAddInterview = (interview: Omit<Interview, 'id'>) => {
    const newInterview: Interview = { ...interview, id: generateId() };
    onUpdate({ interviews: [...interviews, newInterview] });
    setShowAddRound(false);
  };

  const handleUpdateInterview = (id: string, updates: Partial<Interview>) => {
    onUpdate({
      interviews: interviews.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    });
  };

  const handleDeleteInterview = (id: string) => {
    onUpdate({ interviews: interviews.filter((i) => i.id !== id) });
  };

  const handleCompleteInterview = (id: string, outcome: InterviewOutcome) => {
    handleUpdateInterview(id, { completed: true, outcome });
  };

  // Questions CRUD
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const question: InterviewQuestion = {
      id: generateId(),
      question: newQuestion.trim(),
      asked: false,
    };
    onUpdate({ questionsToAsk: [...questions, question] });
    setNewQuestion('');
    setShowAddQuestion(false);
  };

  const handleToggleQuestionAsked = (id: string) => {
    onUpdate({
      questionsToAsk: questions.map((q) =>
        q.id === id ? { ...q, asked: !q.asked } : q
      ),
    });
  };

  const handleDeleteQuestion = (id: string) => {
    onUpdate({ questionsToAsk: questions.filter((q) => q.id !== id) });
  };

  const handleAddSuggestedQuestion = (question: string) => {
    const newQ: InterviewQuestion = {
      id: generateId(),
      question,
      asked: false,
    };
    onUpdate({ questionsToAsk: [...questions, newQ] });
  };

  // Prep notes
  const handlePrepNotesChange = (notes: string) => {
    onUpdate({ prepNotes: notes });
  };

  return (
    <div className="space-y-4">
      {/* Interview Rounds Section */}
      <div className="rounded-lg border border-sage/20 bg-white overflow-hidden">
        <div className="px-4 py-3 bg-champagne-50 border-b border-sage/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-wine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-sm font-semibold text-wine">Interview Rounds</h3>
          </div>
          <button
            onClick={() => setShowAddRound(true)}
            className="text-xs text-flatred hover:text-flatred-600 font-medium"
          >
            + Add Round
          </button>
        </div>

        <div className="p-4">
          {sortedInterviews.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-champagne-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-wine/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-wine/60 mb-2">No interviews scheduled yet</p>
              <button
                onClick={() => setShowAddRound(true)}
                className="text-sm text-flatred hover:text-flatred-600"
              >
                Add your first interview round
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedInterviews.map((interview) => (
                <InterviewRoundCard
                  key={interview.id}
                  interview={interview}
                  isUpcoming={upcomingInterview?.id === interview.id}
                  isEditing={editingRoundId === interview.id}
                  onEdit={() => setEditingRoundId(interview.id)}
                  onCancelEdit={() => setEditingRoundId(null)}
                  onUpdate={(updates) => handleUpdateInterview(interview.id, updates)}
                  onDelete={() => handleDeleteInterview(interview.id)}
                  onComplete={(outcome) => handleCompleteInterview(interview.id, outcome)}
                />
              ))}
            </div>
          )}

          {/* Add Round Form */}
          {showAddRound && (
            <AddInterviewRoundForm
              nextRound={interviews.length + 1}
              onAdd={handleAddInterview}
              onCancel={() => setShowAddRound(false)}
            />
          )}
        </div>
      </div>

      {/* Prep Notes Section */}
      <div className="rounded-lg border border-sage/20 bg-white overflow-hidden">
        <div className="px-4 py-3 bg-champagne-50 border-b border-sage/20 flex items-center gap-2">
          <svg className="w-4 h-4 text-wine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-sm font-semibold text-wine">Prep Notes</h3>
        </div>
        <div className="p-4">
          <textarea
            value={prepNotes}
            onChange={(e) => handlePrepNotesChange(e.target.value)}
            placeholder="Add notes for interview prep... Research topics, STAR stories to prepare, talking points, etc."
            rows={4}
            className="w-full resize-none rounded-md border border-sage/30 px-3 py-2 text-sm text-wine placeholder:text-wine/40 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
          />

          {/* Suggested prep based on keywords */}
          {posting.keywords && posting.keywords.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-medium text-indigo-700 mb-2">
                Suggested prep based on job keywords:
              </p>
              <ul className="text-xs text-indigo-600 space-y-1">
                <li>• Review job description keywords</li>
                <li>
                  • Prepare STAR stories for:{' '}
                  {posting.keywords
                    .filter((k) => k.importance === 'high')
                    .slice(0, 3)
                    .map((k) => k.term)
                    .join(', ') || 'key skills'}
                </li>
                <li>• Research recent {posting.company} news</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Questions to Ask Section */}
      <div className="rounded-lg border border-sage/20 bg-white overflow-hidden">
        <div className="px-4 py-3 bg-champagne-50 border-b border-sage/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-wine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-wine">Questions to Ask</h3>
            <span className="text-xs text-wine/50">
              ({questions.filter((q) => q.asked).length}/{questions.length} asked)
            </span>
          </div>
          <button
            onClick={() => setShowAddQuestion(true)}
            className="text-xs text-flatred hover:text-flatred-600 font-medium"
          >
            + Add
          </button>
        </div>

        <div className="p-4">
          {questions.length === 0 && !showAddQuestion ? (
            <div className="text-center py-4">
              <p className="text-sm text-wine/60 mb-3">No questions added yet</p>
              <div className="space-y-2">
                <p className="text-xs text-wine/40">Suggested questions:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {DEFAULT_INTERVIEW_QUESTIONS.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAddSuggestedQuestion(q)}
                      className="text-xs px-2 py-1 rounded bg-champagne-50 text-wine/70 hover:bg-champagne-100 hover:text-wine transition-colors"
                    >
                      + {q.slice(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className={`flex items-start gap-2 p-2 rounded-lg ${
                    question.asked ? 'bg-teal-50' : 'bg-champagne-50'
                  }`}
                >
                  <button
                    onClick={() => handleToggleQuestionAsked(question.id)}
                    className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      question.asked
                        ? 'bg-teal-500 border-teal-500 text-white'
                        : 'border-sage/40 hover:border-wine'
                    }`}
                  >
                    {question.asked && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      question.asked ? 'text-wine/50 line-through' : 'text-wine'
                    }`}
                  >
                    {question.question}
                  </span>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-wine/30 hover:text-flatred"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add question form */}
          {showAddQuestion && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddQuestion();
                  if (e.key === 'Escape') {
                    setShowAddQuestion(false);
                    setNewQuestion('');
                  }
                }}
              />
              <button
                onClick={handleAddQuestion}
                disabled={!newQuestion.trim()}
                className="px-3 py-2 text-sm font-medium text-white bg-wine rounded-md hover:bg-wine/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddQuestion(false);
                  setNewQuestion('');
                }}
                className="px-3 py-2 text-sm text-wine/60 hover:text-wine"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Suggested questions dropdown */}
          {questions.length > 0 && questions.length < 8 && (
            <details className="mt-3">
              <summary className="text-xs text-wine/50 cursor-pointer hover:text-wine">
                + Add suggested questions
              </summary>
              <div className="mt-2 flex flex-wrap gap-1">
                {DEFAULT_INTERVIEW_QUESTIONS.filter(
                  (q) => !questions.some((existing) => existing.question === q)
                )
                  .slice(0, 4)
                  .map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAddSuggestedQuestion(q)}
                      className="text-xs px-2 py-1 rounded bg-champagne-50 text-wine/70 hover:bg-champagne-100 hover:text-wine transition-colors"
                    >
                      + {q.slice(0, 35)}...
                    </button>
                  ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Card for displaying a single interview round
 */
function InterviewRoundCard({
  interview,
  isUpcoming,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onComplete,
}: {
  interview: Interview;
  isUpcoming: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (updates: Partial<Interview>) => void;
  onDelete: () => void;
  onComplete: (outcome: InterviewOutcome) => void;
}) {
  const [showOutcomeOptions, setShowOutcomeOptions] = useState(false);

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate days until interview
  const getDaysUntil = () => {
    if (!interview.date) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const interviewDate = new Date(interview.date);
    interviewDate.setHours(0, 0, 0, 0);
    return Math.floor((interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysUntil = getDaysUntil();

  if (isEditing) {
    return (
      <EditInterviewRoundForm
        interview={interview}
        onSave={onUpdate}
        onCancel={onCancelEdit}
        onDelete={onDelete}
      />
    );
  }

  return (
    <div
      className={`p-3 rounded-lg border ${
        interview.completed
          ? 'bg-champagne-50/50 border-sage/20'
          : isUpcoming
            ? 'bg-indigo-50 border-indigo-200'
            : 'bg-white border-sage/20'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-wine/50">Round {interview.round}</span>
            {interview.completed && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  interview.outcome === 'positive'
                    ? 'bg-teal-100 text-teal-700'
                    : interview.outcome === 'negative'
                      ? 'bg-flatred-50 text-flatred'
                      : 'bg-sage/20 text-wine/60'
                }`}
              >
                {interview.outcome ? INTERVIEW_OUTCOME_LABELS[interview.outcome] : 'Completed'}
              </span>
            )}
            {isUpcoming && !interview.completed && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
              </span>
            )}
          </div>
          <p className="font-medium text-wine">{interview.roundName}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-wine/60">
            {interview.date && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(interview.date)}
                {interview.time && ` at ${interview.time}`}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {INTERVIEW_TYPE_LABELS[interview.type]}
            </span>
          </div>
          {interview.interviewers.length > 0 && (
            <p className="text-xs text-wine/50 mt-1">
              With: {interview.interviewers.join(', ')}
            </p>
          )}
          {interview.notes && (
            <p className="text-xs text-wine/60 mt-2 italic">{interview.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!interview.completed && (
            <div className="relative">
              <button
                onClick={() => setShowOutcomeOptions(!showOutcomeOptions)}
                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded"
                title="Mark as complete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              {showOutcomeOptions && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-sage/20 shadow-lg overflow-hidden z-10 w-32">
                  {(['positive', 'neutral', 'negative'] as InterviewOutcome[]).map((outcome) => (
                    <button
                      key={outcome}
                      onClick={() => {
                        onComplete(outcome);
                        setShowOutcomeOptions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-champagne-50"
                    >
                      {INTERVIEW_OUTCOME_LABELS[outcome]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 text-wine/40 hover:text-wine hover:bg-champagne-50 rounded"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Form for adding a new interview round
 */
function AddInterviewRoundForm({
  nextRound,
  onAdd,
  onCancel,
}: {
  nextRound: number;
  onAdd: (interview: Omit<Interview, 'id'>) => void;
  onCancel: () => void;
}) {
  const [roundName, setRoundName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<InterviewType>('video');
  const [interviewers, setInterviewers] = useState('');

  const handleSubmit = () => {
    if (!roundName.trim()) return;
    onAdd({
      round: nextRound,
      roundName: roundName.trim(),
      date: date || undefined,
      time: time || undefined,
      type,
      interviewers: interviewers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      notes: '',
      completed: false,
    });
  };

  return (
    <div className="mt-4 p-4 rounded-lg border border-indigo-200 bg-indigo-50">
      <h4 className="text-sm font-medium text-wine mb-3">Add Interview Round</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-wine/70 mb-1">Round Name</label>
          <div className="relative">
            <input
              type="text"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              placeholder="e.g., Phone Screen, Technical Interview"
              className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
              list="round-names"
              autoFocus
            />
            <datalist id="round-names">
              {COMMON_ROUND_NAMES.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-wine/70 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-wine/70 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-wine/70 mb-1">Type</label>
          <div className="flex gap-2">
            {(['phone', 'video', 'onsite'] as InterviewType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                  type === t
                    ? 'border-wine bg-wine text-white'
                    : 'border-sage/30 text-wine/70 hover:border-wine'
                }`}
              >
                {INTERVIEW_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-wine/70 mb-1">
            Interviewer(s) <span className="font-normal text-wine/50">(comma separated)</span>
          </label>
          <input
            type="text"
            value={interviewers}
            onChange={(e) => setInterviewers(e.target.value)}
            placeholder="e.g., Sarah Chen (Recruiter), Mike Johnson"
            className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!roundName.trim()}
            className="flex-1 py-2 text-sm font-medium text-white bg-wine rounded-md hover:bg-wine/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Round
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-wine/60 hover:text-wine"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Form for editing an existing interview round
 */
function EditInterviewRoundForm({
  interview,
  onSave,
  onCancel,
  onDelete,
}: {
  interview: Interview;
  onSave: (updates: Partial<Interview>) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [roundName, setRoundName] = useState(interview.roundName);
  const [date, setDate] = useState(interview.date || '');
  const [time, setTime] = useState(interview.time || '');
  const [type, setType] = useState<InterviewType>(interview.type);
  const [interviewers, setInterviewers] = useState(interview.interviewers.join(', '));
  const [notes, setNotes] = useState(interview.notes);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = () => {
    if (!roundName.trim()) return;
    onSave({
      roundName: roundName.trim(),
      date: date || undefined,
      time: time || undefined,
      type,
      interviewers: interviewers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      notes,
    });
    onCancel();
  };

  return (
    <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50">
      <h4 className="text-sm font-medium text-wine mb-3">Edit Round {interview.round}</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-wine/70 mb-1">Round Name</label>
          <input
            type="text"
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
            list="round-names-edit"
          />
          <datalist id="round-names-edit">
            {COMMON_ROUND_NAMES.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-wine/70 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-wine/70 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-wine/70 mb-1">Type</label>
          <div className="flex gap-2">
            {(['phone', 'video', 'onsite'] as InterviewType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                  type === t
                    ? 'border-wine bg-wine text-white'
                    : 'border-sage/30 text-wine/70 hover:border-wine'
                }`}
              >
                {INTERVIEW_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-wine/70 mb-1">Interviewer(s)</label>
          <input
            type="text"
            value={interviewers}
            onChange={(e) => setInterviewers(e.target.value)}
            placeholder="e.g., Sarah Chen (Recruiter)"
            className="w-full rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-wine/70 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes about this interview round..."
            rows={2}
            className="w-full resize-none rounded-md border border-sage/30 px-3 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-flatred">Delete this round?</span>
                <button
                  onClick={() => {
                    onDelete();
                    onCancel();
                  }}
                  className="text-xs text-white bg-flatred px-2 py-1 rounded"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-wine/60"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-flatred hover:text-flatred-600"
              >
                Delete Round
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-sm text-wine/60 hover:text-wine"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!roundName.trim()}
              className="px-3 py-1.5 text-sm font-medium text-white bg-wine rounded-md hover:bg-wine/90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPrepPanel;
