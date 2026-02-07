import { useState, useMemo } from 'react';
import { Connection, Posting } from '@/types';

interface QuickLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: Connection[];
  posting: Posting;
  linkedConnectionIds: string[];
  onLinkConnection: (connectionId: string) => void;
  onUnlinkConnection: (connectionId: string) => void;
  onCreateConnection: () => void;
}

export function QuickLinkModal({
  isOpen,
  onClose,
  connections,
  posting,
  linkedConnectionIds,
  onLinkConnection,
  onUnlinkConnection,
  onCreateConnection,
}: QuickLinkModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Group connections: same company first, then others
  const groupedConnections = useMemo(() => {
    const filtered = connections.filter((c) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query) ||
        c.role?.toLowerCase().includes(query)
      );
    });

    const sameCompany = filtered.filter(
      (c) => c.company.toLowerCase() === posting.company.toLowerCase()
    );
    const others = filtered.filter(
      (c) => c.company.toLowerCase() !== posting.company.toLowerCase()
    );

    return { sameCompany, others };
  }, [connections, posting.company, searchQuery]);

  const toggleConnection = (connectionId: string) => {
    if (linkedConnectionIds.includes(connectionId)) {
      onUnlinkConnection(connectionId);
    } else {
      onLinkConnection(connectionId);
    }
  };

  if (!isOpen) return null;

  const renderConnectionItem = (connection: Connection) => {
    const isLinked = linkedConnectionIds.includes(connection.id);
    return (
      <label
        key={connection.id}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
          isLinked ? 'bg-indigo-50' : 'hover:bg-gray-50'
        }`}
      >
        <input
          type="checkbox"
          checked={isLinked}
          onChange={() => toggleConnection(connection.id)}
          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
        />
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm flex-shrink-0">
          {connection.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isLinked ? 'text-indigo-700' : 'text-gray-900'}`}>
            {connection.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {connection.role ? `${connection.role} @ ` : ''}{connection.company}
          </p>
        </div>
      </label>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Link Connections</h2>
            <p className="text-sm text-gray-500 mt-0.5">{posting.title} @ {posting.company}</p>
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

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Connection List */}
        <div className="flex-1 overflow-auto p-4">
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-3">No connections yet</p>
              <button
                onClick={onCreateConnection}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                + Create your first connection
              </button>
            </div>
          ) : groupedConnections.sameCompany.length === 0 && groupedConnections.others.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No connections match your search</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Same company suggestions */}
              {groupedConnections.sameCompany.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
                    At {posting.company} ({groupedConnections.sameCompany.length})
                  </h3>
                  <div className="space-y-1">
                    {groupedConnections.sameCompany.map(renderConnectionItem)}
                  </div>
                </div>
              )}

              {/* Other connections */}
              {groupedConnections.others.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
                    Other Connections ({groupedConnections.others.length})
                  </h3>
                  <div className="space-y-1">
                    {groupedConnections.others.map(renderConnectionItem)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCreateConnection}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Connection
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickLinkModal;
