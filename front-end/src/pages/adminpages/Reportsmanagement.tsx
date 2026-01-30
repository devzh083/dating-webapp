import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Search, CheckCircle, XCircle, Loader, X
} from 'lucide-react';
import { adminService } from '../../services/profileService';

interface Report {
  id: number;
  reporter: number;
  reporter_username: string;
  reported_user: number;
  reported_username: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  reviewed_by_username: string | null;
  admin_notes: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

const ReportsManagement: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsPagination, setReportsPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });
  const [reportsPage, setReportsPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [reportReasonFilter, setReportReasonFilter] = useState<string>('all');
  const [selectedReports, setSelectedReports] = useState<number[]>([]);

  const loadReports = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (reportStatusFilter !== 'all') params.append('status', reportStatusFilter);
      if (reportReasonFilter !== 'all') params.append('reason', reportReasonFilter);
      
      const data = await adminService.adminApiCall<{ results: Report[]; count: number; next: string | null; previous: string | null }>(`/reports/?${params.toString()}`);
      setReports(data.results || []);
      setReportsPagination({
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
      });
      setReportsPage(page);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const reviewReport = async (reportId: number, action: string, adminNotes: string = '') => {
    setLoading(true);
    try {
      const data = await adminService.adminApiCall<{ message: string; report: Report }>(`/reports/${reportId}/review/`, 'POST', { action, admin_notes: adminNotes });
      alert(data.message);
      loadReports(reportsPage);
    } catch (err) {
      const error = err as Error;
      alert(`Failed to review report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const bulkReviewReports = async (action: string, adminNotes: string = '') => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report');
      return;
    }
    
    if (!confirm(`Are you sure you want to ${action} ${selectedReports.length} report(s)?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await adminService.adminApiCall<{ message: string; updated_count: number }>('/reports/bulk_review/', 'POST', {
        report_ids: selectedReports,
        action,
        admin_notes: adminNotes,
      });
      alert(data.message);
      setSelectedReports([]);
      loadReports(reportsPage);
    } catch (err) {
      const error = err as Error;
      alert(`Bulk review failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(1);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadReports(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, reportStatusFilter, reportReasonFilter]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

      {/* Report Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="relative col-span-full lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={reportStatusFilter}
            onChange={(e) => setReportStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={reportReasonFilter}
            onChange={(e) => setReportReasonFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="all">All Reasons</option>
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="inappropriate">Inappropriate Content</option>
            <option value="fake">Fake Profile</option>
            <option value="other">Other</option>
          </select>
        </div>

        {selectedReports.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => bulkReviewReports('resolve', 'Bulk resolved')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              disabled={loading}
            >
              <CheckCircle className="w-4 h-4" />
              Resolve ({selectedReports.length})
            </button>
            <button
              onClick={() => bulkReviewReports('dismiss', 'Bulk dismissed')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              disabled={loading}
            >
              <XCircle className="w-4 h-4" />
              Dismiss ({selectedReports.length})
            </button>
            <button
              onClick={() => setSelectedReports([])}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === reports.length && reports.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReports(reports.map(r => r.id));
                      } else {
                        setSelectedReports([]);
                      }
                    }}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reported User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading reports...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No reports found</p>
                  </td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports([...selectedReports, report.id]);
                          } else {
                            setSelectedReports(selectedReports.filter(id => id !== report.id));
                          }
                        }}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{report.reporter_username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{report.reported_username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 capitalize">
                        {report.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        report.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                        report.status === 'resolved' ? 'bg-green-50 text-green-700' :
                        report.status === 'dismissed' ? 'bg-gray-50 text-gray-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(report.created_at)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => reviewReport(report.id, 'resolve', 'Report resolved by admin')}
                            className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition"
                            disabled={loading}
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => reviewReport(report.id, 'dismiss', 'Report dismissed by admin')}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
                            disabled={loading}
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {reportsPagination.count > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((reportsPage - 1) * 20) + 1} to {Math.min(reportsPage * 20, reportsPagination.count)} of {reportsPagination.count} reports
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadReports(reportsPage - 1)}
                disabled={!reportsPagination.previous || loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => loadReports(reportsPage + 1)}
                disabled={!reportsPagination.next || loading}
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

export default ReportsManagement;