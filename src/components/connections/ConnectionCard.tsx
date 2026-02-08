import { Connection, RELATIONSHIP_TYPE_LABELS } from '@/types';

interface ConnectionCardProps {
  connection: Connection;
  onSelect: (id: string) => void;
  onEdit?: (id: string) => void;
  compact?: boolean;
}

export function ConnectionCard({ connection, onSelect, onEdit, compact = false }: ConnectionCardProps) {
  const isFollowUpDue = connection.nextFollowUp && new Date(connection.nextFollowUp) <= new Date();
  const isFollowUpSoon = connection.nextFollowUp && !isFollowUpDue &&
    new Date(connection.nextFollowUp) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const strengthDots = Array.from({ length: 3 }, (_, i) => (
    <span
      key={i}
      className={`inline-block h-2 w-2 rounded-full ${
        i < connection.relationshipStrength ? 'bg-teal' : 'bg-champagne-200'
      }`}
    />
  ));

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (compact) {
    return (
      <div
        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-champagne-50"
        onClick={() => onSelect(connection.id)}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-600">
          {connection.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-wine">{connection.name}</p>
          <p className="truncate text-xs text-wine/60">
            {connection.role ? `${connection.role} @ ` : ''}{connection.company}
          </p>
        </div>
        {isFollowUpDue && (
          <span className="text-xs text-pandora" title="Follow-up due">!</span>
        )}
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer rounded-lg border border-sage/20 bg-white p-4 transition-all duration-base hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onSelect(connection.id)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-semibold text-teal-600">
          {connection.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium text-wine">{connection.name}</h3>
            <span className="flex gap-0.5">{strengthDots}</span>
          </div>
          <p className="truncate text-sm text-wine/70">
            {connection.role ? `${connection.role} @ ` : ''}{connection.company}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-champagne-100 px-2 py-0.5 text-xs text-wine">
              {RELATIONSHIP_TYPE_LABELS[connection.relationshipType]}
            </span>
            {connection.linkedPostingIds.length > 0 && (
              <span className="text-xs text-wine/60">
                {connection.linkedPostingIds.length} posting{connection.linkedPostingIds.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(connection.id);
            }}
            className="btn btn-icon btn-ghost !h-8 !w-8"
            title="Edit connection"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      {/* Contact info row */}
      <div className="mt-3 flex items-center justify-between border-t border-sage/10 pt-3 text-xs text-wine/50">
        <div className="flex items-center gap-3">
          {connection.lastContactDate && (
            <span>Last contact: {formatDate(connection.lastContactDate)}</span>
          )}
          {connection.contactHistory.length > 0 && (
            <span>{connection.contactHistory.length} interaction{connection.contactHistory.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Follow-up indicator */}
        {connection.nextFollowUp && (
          <span
            className={`flex items-center gap-1 ${
              isFollowUpDue
                ? 'font-medium text-flatred'
                : isFollowUpSoon
                ? 'text-pandora'
                : 'text-wine/50'
            }`}
          >
            {isFollowUpDue && (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            Follow-up: {formatDate(connection.nextFollowUp)}
          </span>
        )}
      </div>
    </div>
  );
}

export default ConnectionCard;
