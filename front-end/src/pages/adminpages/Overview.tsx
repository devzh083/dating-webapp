import React, { useState, useEffect } from 'react';
import {
  Users, Activity, Heart, AlertTriangle, RefreshCw, Loader
} from 'lucide-react';
import { adminService } from '../../services/profileService';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  totalMatches: number;
  totalMessages: number;
  reportsCount: number;
  pendingReports: number;
  resolvedReports: number;
  verifiedUsers: number;
  premiumUsers: number;
  completeProfiles: number;
  accountStatusDistribution: {
    active: number;
    pending: number;
    suspended: number;
    banned: number;
  };
  recentActions: Array<{ action_type: string; count: number }>;
  userGrowth: Array<{ date: string; count: number }>;
}

const Overview: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const loadDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.adminApiCall<DashboardStats>('/dashboard/stats/');
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">View system statistics and analytics</p>
        </div>
        <button
          onClick={loadDashboardStats}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Total Users</p>
          <p className="text-xs text-gray-400 mt-1">+{stats.newUsersToday} today</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.activeUsers}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Active Now</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% online
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalMatches}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Total Matches</p>
          <p className="text-xs text-gray-400 mt-1">
            Avg {stats.totalUsers > 0 ? (stats.totalMatches / stats.totalUsers).toFixed(1) : 0} per user
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.pendingReports}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Pending Reports</p>
          <p className="text-xs text-gray-400 mt-1">{stats.reportsCount} total</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.accountStatusDistribution || {}).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    key === 'active' ? 'bg-green-500' :
                    key === 'pending' ? 'bg-blue-500' :
                    key === 'suspended' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-600 capitalize">{key}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth (7 Days)</h3>
          <div className="space-y-2">
            {(stats.userGrowth || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{item.date}</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2 bg-teal-500 rounded-full"
                    style={{ width: `${Math.max(item.count * 10, 4)}px` }}
                  />
                  <span className="text-xs font-semibold text-gray-900 w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* More Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Messages</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Verified Users</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.verifiedUsers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Premium Users</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.premiumUsers}</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;