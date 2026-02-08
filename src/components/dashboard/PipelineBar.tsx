import { PostingStatus, Posting } from '@/types';

interface PipelineBarProps {
  postings: Posting[];
  activeStatus: PostingStatus | null;
  onStatusClick: (status: PostingStatus | null) => void;
}

// Pipeline stages mapping to PostingStatus
const PIPELINE_STAGES: {
  status: PostingStatus;
  label: string;
  shortLabel: string;
}[] = [
  { status: 'saved', label: 'BOOKMARKED', shortLabel: 'BOOKMARKED' },
  { status: 'in_progress', label: 'APPLYING', shortLabel: 'APPLYING' },
  { status: 'applied', label: 'APPLIED', shortLabel: 'APPLIED' },
  { status: 'interviewing', label: 'INTERVIEWING', shortLabel: 'INTERVIEW' },
  { status: 'offer', label: 'NEGOTIATING', shortLabel: 'NEGOTIATE' },
  { status: 'accepted', label: 'ACCEPTED', shortLabel: 'ACCEPTED' },
];

// Stage colors using the vintage palette
const STAGE_COLORS: Record<PostingStatus, {
  dot: string;
  bg: string;
  bgActive: string;
  text: string;
  textActive: string;
  border: string;
}> = {
  saved: {
    dot: 'bg-pandora',
    bg: 'bg-champagne-100',
    bgActive: 'bg-pandora',
    text: 'text-wine',
    textActive: 'text-white',
    border: 'border-pandora/30',
  },
  in_progress: {
    dot: 'bg-champagne-400',
    bg: 'bg-champagne-50',
    bgActive: 'bg-champagne-400',
    text: 'text-wine',
    textActive: 'text-wine',
    border: 'border-champagne-300',
  },
  applied: {
    dot: 'bg-teal',
    bg: 'bg-teal-100',
    bgActive: 'bg-teal',
    text: 'text-wine',
    textActive: 'text-white',
    border: 'border-teal/30',
  },
  interviewing: {
    dot: 'bg-flatred',
    bg: 'bg-flatred-50',
    bgActive: 'bg-flatred',
    text: 'text-wine',
    textActive: 'text-white',
    border: 'border-flatred/30',
  },
  offer: {
    dot: 'bg-pandora-500',
    bg: 'bg-pandora-50',
    bgActive: 'bg-pandora-500',
    text: 'text-wine',
    textActive: 'text-white',
    border: 'border-pandora/30',
  },
  accepted: {
    dot: 'bg-teal-600',
    bg: 'bg-teal-100',
    bgActive: 'bg-teal-600',
    text: 'text-wine',
    textActive: 'text-white',
    border: 'border-teal-600/30',
  },
  rejected: {
    dot: 'bg-sage-600',
    bg: 'bg-sage-100',
    bgActive: 'bg-sage-600',
    text: 'text-wine',
    textActive: 'text-white',
    border: 'border-sage/30',
  },
  withdrawn: {
    dot: 'bg-sage-400',
    bg: 'bg-sage-50',
    bgActive: 'bg-sage-400',
    text: 'text-wine',
    textActive: 'text-wine-400',
    border: 'border-sage/30',
  },
};

export function PipelineBar({ postings, activeStatus, onStatusClick }: PipelineBarProps) {
  // Count postings by status
  const countByStatus = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.status] = postings.filter((p) => p.status === stage.status).length;
    return acc;
  }, {} as Record<PostingStatus, number>);

  // Count rejected + withdrawn for separate display
  const rejectedCount = postings.filter((p) => p.status === 'rejected').length;
  const withdrawnCount = postings.filter((p) => p.status === 'withdrawn').length;
  const terminalCount = rejectedCount + withdrawnCount;

  const handleStageClick = (status: PostingStatus) => {
    // Toggle: if clicking the active status, clear the filter
    if (activeStatus === status) {
      onStatusClick(null);
    } else {
      onStatusClick(status);
    }
  };

  return (
    <div className="sticky top-0 z-sticky border-b border-sage/20 bg-champagne-100/80 backdrop-blur-sm">
      <div className="px-4 py-3">
        {/* Pipeline stages */}
        <div className="flex items-center gap-1">
          {PIPELINE_STAGES.map((stage, index) => {
            const count = countByStatus[stage.status];
            const isActive = activeStatus === stage.status;
            const colors = STAGE_COLORS[stage.status];
            const hasItems = count > 0;

            return (
              <div key={stage.status} className="flex items-center">
                {/* Stage button */}
                <button
                  onClick={() => handleStageClick(stage.status)}
                  className={`
                    group relative flex items-center gap-2 rounded-lg px-3 py-2
                    transition-all duration-base
                    ${isActive
                      ? `${colors.bgActive} ${colors.textActive} shadow-md`
                      : `${colors.bg} ${colors.text} hover:shadow-sm`
                    }
                    ${hasItems ? 'cursor-pointer' : 'cursor-default opacity-60'}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-flatred focus-visible:ring-offset-2
                  `}
                  disabled={!hasItems && !isActive}
                >
                  {/* Status dot */}
                  <span
                    className={`
                      h-2 w-2 rounded-full
                      ${isActive ? 'bg-white/80' : colors.dot}
                      transition-transform duration-base
                      ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                    `}
                  />

                  {/* Label */}
                  <span className="text-xs font-semibold tracking-wide">
                    {stage.label}
                  </span>

                  {/* Count badge */}
                  {count > 0 && (
                    <span
                      className={`
                        ml-1 rounded-full px-1.5 py-0.5 text-xs font-bold
                        ${isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white/80 text-wine shadow-sm'
                        }
                        transition-all duration-base
                      `}
                    >
                      {count}
                    </span>
                  )}

                  {/* Empty indicator */}
                  {count === 0 && (
                    <span className="text-xs opacity-40">– –</span>
                  )}
                </button>

                {/* Arrow connector */}
                {index < PIPELINE_STAGES.length - 1 && (
                  <svg
                    className="mx-1 h-4 w-4 flex-shrink-0 text-sage/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Terminal statuses (rejected/withdrawn) - shown separately */}
          {terminalCount > 0 && (
            <div className="flex items-center gap-2 border-l border-sage/30 pl-4">
              {rejectedCount > 0 && (
                <button
                  onClick={() => handleStageClick('rejected')}
                  className={`
                    flex items-center gap-1.5 rounded-lg px-2.5 py-1.5
                    transition-all duration-base
                    ${activeStatus === 'rejected'
                      ? 'bg-flatred-700 text-white shadow-md'
                      : 'bg-flatred-50 text-flatred-700 hover:bg-flatred-100'
                    }
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-flatred
                  `}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-xs font-medium">Rejected</span>
                  <span className="rounded-full bg-white/80 px-1.5 text-xs font-bold text-flatred-700">
                    {rejectedCount}
                  </span>
                </button>
              )}

              {withdrawnCount > 0 && (
                <button
                  onClick={() => handleStageClick('withdrawn')}
                  className={`
                    flex items-center gap-1.5 rounded-lg px-2.5 py-1.5
                    transition-all duration-base
                    ${activeStatus === 'withdrawn'
                      ? 'bg-sage-600 text-white shadow-md'
                      : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                    }
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-sage
                  `}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span className="text-xs font-medium">Withdrawn</span>
                  <span className="rounded-full bg-white/80 px-1.5 text-xs font-bold text-sage-700">
                    {withdrawnCount}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Clear filter button */}
          {activeStatus && (
            <button
              onClick={() => onStatusClick(null)}
              className="btn btn-sm btn-ghost ml-2"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
