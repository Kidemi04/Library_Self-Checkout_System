'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AuditLogEntry = {
  id: string;
  event_type: string;
  entity: string;
  entity_id: string;
  actor_id: string;
  actor_role: string;
  source: string;
  success: boolean;
  diff: any;
  context: any;
  created_at: string;
};

type AuditLogFilters = {
  entity?: string;
  eventType?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  success?: boolean;
};

export default function AuditLogViewer({ 
  initialEntries 
}: { 
  initialEntries: AuditLogEntry[] 
}) {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [entries, setEntries] = useState(initialEntries);
  const router = useRouter();

  const entityTypes = ['loan', 'hold', 'copy', 'book', 'user', 'report', 'sip'];
  const eventTypes = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'CHECKOUT', 'CHECKIN', 'PLACE_HOLD', 'CANCEL_HOLD'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Entity Type</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={filters.entity || ''}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value || undefined })}
            >
              <option value="">All Entities</option>
              {entityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Event Type</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={filters.eventType || ''}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value || undefined })}
            >
              <option value="">All Events</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={filters.dateRange || 'all'}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any || undefined })}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={filters.success === undefined ? '' : filters.success.toString()}
              onChange={(e) => setFilters({ ...filters, success: e.target.value === '' ? undefined : e.target.value === 'true' })}
            >
              <option value="">All Status</option>
              <option value="true">Success</option>
              <option value="false">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.event_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {`${entry.entity} (${entry.entity_id})`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {`${entry.actor_id} (${entry.actor_role})`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      entry.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        // TODO: Implement modal or drawer to show full details
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}