import React, { useState, useEffect } from 'react';
import { FileText, Loader, AlertTriangle, X } from 'lucide-react';
import { adminService } from '../../services/profileService';

interface AdminAction {
  id: number;
  admin: number;
  admin_username: string;
  target_user: number;
  target_username: string;
  action_type: 'suspend' | 'ban' | 'activate' | 'delete' | 'verify' | 'warn';
  reason: string;
  created_at: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminActionsLog: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [actionsPage, setActionsPage] = useState<number>(1);
  const [actionsPagination, setActionsPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });

  const loadAdminActions = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      
      const data = await adminService.adminApiCall<{ results: AdminAction[]; count: number; next: string | null; previous: string | null }>(`/actions/?${params.toString()}`);
      setAdminActions(data.results || []);
      setActionsPagination({
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
      });
      setActionsPage(page);
    } catch (err) {
      setError('Failed to load admin actions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminActions(1);
  }, []);

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Admin Actions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Target User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && adminActions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading actions...</p>
                  </td>
                </tr>
              ) : adminActions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No admin actions found</p>
                  </td>
                </tr>
              ) : (
                adminActions.map(action => (
                  <tr key={action.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{action.admin_username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{action.target_username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        action.action_type === 'ban' ? 'bg-red-50 text-red-700' :
                        action.action_type === 'suspend' ? 'bg-yellow-50 text-yellow-700' :
                        action.action_type === 'activate' ? 'bg-green-50 text-green-700' :
                        action.action_type === 'verify' ? 'bg-blue-50 text-blue-700' :
                        action.action_type === 'delete' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {action.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{action.reason || 'No reason provided'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDateTime(action.created_at)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {actionsPagination.count > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((actionsPage - 1) * 20) + 1} to {Math.min(actionsPage * 20, actionsPagination.count)} of {actionsPagination.count} actions
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadAdminActions(actionsPage - 1)}
                disabled={!actionsPagination.previous || loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => loadAdminActions(actionsPage + 1)}
                disabled={!actionsPagination.next || loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActionsLog;