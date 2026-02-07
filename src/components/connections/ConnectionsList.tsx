import { useState, useMemo } from 'react';
import { Connection } from '@/types';
import { ConnectionCard } from './ConnectionCard';

interface ConnectionsListProps {
  connections: Connection[];
  onSelectConnection: (id: string) => void;
  onEditConnection: (id: string) => void;
  onAddConnection: () => void;
}

type FilterType = 'all' | 'follow-up-due' | 'has-postings' | 'no-postings';

export function ConnectionsList({
  connections,
  onSelectConnection,
  onEditConnection,
  onAddConnection,
}: ConnectionsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [companyFilter, setCompanyFilter] = useState('');

  // Get unique companies for filter dropdown
  const companies = useMemo(() => {
    const uniqueCompanies = [...new Set(connections.map((c) => c.company))];
    return uniqueCompanies.sort();
  }, [connections]);

  // Filter connections
  const filteredConnections = useMemo(() => {
    return connections.filter((c) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          c.name.toLowerCase().includes(query) ||
          c.company.toLowerCase().includes(query) ||
          c.role?.toLowerCase().includes(query) ||
          c.notes?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Company filter
      if (companyFilter && c.company !== companyFilter) {
        return false;
      }

      // Type filter
      switch (filterType) {
        case 'follow-up-due':
          return c.nextFollowUp && new Date(c.nextFollowUp) <= new Date();
        case 'has-postings':
          return c.linkedPostingIds.length > 0;
        case 'no-postings':
          return c.linkedPostingIds.length === 0;
        default:
          return true;
      }
    });
  }, [connections, searchQuery, filterType, companyFilter]);

  // Sort connections: follow-up due first, then by name
  const sortedConnections = useMemo(() => {
    return [...filteredConnections].sort((a, b) => {
      // Follow-up due comes first
      const aFollowUpDue = a.nextFollowUp && new Date(a.nextFollowUp) <= new Date();
      const bFollowUpDue = b.nextFollowUp && new Date(b.nextFollowUp) <= new Date();
      if (aFollowUpDue && !bFollowUpDue) return -1;
      if (!aFollowUpDue && bFollowUpDue) return 1;
      // Then by name
      return a.name.localeCompare(b.name);
    });
  }, [filteredConnections]);

  const followUpDueCount = connections.filter(
    (c) => c.nextFollowUp && new Date(c.nextFollowUp) <= new Date()
  ).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Connections</h1>
          <p className="text-sm text-gray-500">
            {connections.length} connection{connections.length !== 1 ? 's' : ''}
            {followUpDueCount > 0 && (
              <span className="text-amber-600 ml-2">
                ({followUpDueCount} follow-up{followUpDueCount !== 1 ? 's' : ''} due)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onAddConnection}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Connection
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
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
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Connections</option>
          <option value="follow-up-due">Follow-up Due</option>
          <option value="has-postings">Linked to Postings</option>
          <option value="no-postings">No Postings Linked</option>
        </select>

        {/* Company filter */}
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>

        {/* Clear filters */}
        {(searchQuery || filterType !== 'all' || companyFilter) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setCompanyFilter('');
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Connection list */}
      <div className="flex-1 overflow-auto">
        {sortedConnections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            {connections.length === 0 ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No connections yet</h3>
                <p className="text-gray-500 mb-4">
                  Start building your network by adding contacts you meet during your job search.
                </p>
                <button
                  onClick={onAddConnection}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Connection
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No matches found</h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {sortedConnections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onSelect={onSelectConnection}
                onEdit={onEditConnection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectionsList;
