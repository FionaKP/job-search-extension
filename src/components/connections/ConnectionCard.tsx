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
      className={`inline-block w-2 h-2 rounded-full ${
        i < connection.relationshipStrength ? 'bg-indigo-500' : 'bg-gray-200'
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
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => onSelect(connection.id)}
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm flex-shrink-0">
          {connection.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{connection.name}</p>
          <p className="text-xs text-gray-500 truncate">
            {connection.role ? `${connection.role} @ ` : ''}{connection.company}
          </p>
        </div>
        {isFollowUpDue && (
          <span className="text-amber-500 text-xs" title="Follow-up due">!</span>
        )}
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(connection.id)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg flex-shrink-0">
          {connection.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{connection.name}</h3>
            <span className="flex gap-0.5">{strengthDots}</span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {connection.role ? `${connection.role} @ ` : ''}{connection.company}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {RELATIONSHIP_TYPE_LABELS[connection.relationshipType]}
            </span>
            {connection.linkedPostingIds.length > 0 && (
              <span className="text-xs text-gray-500">
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
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit connection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      {/* Contact info row */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
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
                ? 'text-red-600 font-medium'
                : isFollowUpSoon
                ? 'text-amber-600'
                : 'text-gray-500'
            }`}
          >
            {isFollowUpDue && (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
