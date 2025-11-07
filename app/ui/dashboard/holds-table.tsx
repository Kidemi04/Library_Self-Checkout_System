'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

type Hold = {
  id: string;
  bookTitle: string;
  status: 'QUEUED' | 'READY' | 'FULFILLED' | 'CANCELED' | 'EXPIRED';
  placedAt: string;
  readyAt?: string;
  expiresAt?: string;
};

export function HoldsTable({ holds }: { holds: Hold[] }) {
  const [expandedHold, setExpandedHold] = useState<string | null>(null);
  const [cancellingHold, setCancellingHold] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancelHold = async (holdId: string) => {
    try {
      setCancellingHold(holdId);
      setError(null);
      
      const response = await fetch('/api/holds/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ holdId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel hold');
      }

      // Refresh the page to show updated holds
      window.location.reload();
    } catch (err) {
      setError('Failed to cancel hold. Please try again.');
      console.error('Error canceling hold:', err);
    } finally {
      setCancellingHold(null);
    }
  };

  const getStatusBadge = (status: Hold['status']) => {
    const styles = {
      QUEUED: 'bg-blue-100 text-blue-800',
      READY: 'bg-green-100 text-green-800',
      FULFILLED: 'bg-gray-100 text-gray-800',
      CANCELED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Book
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Placed
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {holds.map((hold) => (
            <tr
              key={hold.id}
              className={expandedHold === hold.id ? 'bg-gray-50' : ''}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {hold.bookTitle}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(hold.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(hold.placedAt), {
                    addSuffix: true,
                  })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {hold.status === 'QUEUED' && (
                  <button
                    onClick={() => handleCancelHold(hold.id)}
                    disabled={cancellingHold === hold.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {cancellingHold === hold.id ? 'Canceling...' : 'Cancel'}
                  </button>
                )}
                {hold.status === 'READY' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // TODO: Implement pickup confirmation
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Ready for Pickup
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => {
                        // TODO: Implement cancel hold
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {['FULFILLED', 'CANCELED', 'EXPIRED'].includes(hold.status) && (
                  <button
                    onClick={() => setExpandedHold(
                      expandedHold === hold.id ? null : hold.id
                    )}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {expandedHold === hold.id ? 'Less info' : 'More info'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}