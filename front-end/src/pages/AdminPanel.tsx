import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Activity, Shield, Ban, UserCheck, TrendingUp, Clock, Search,
  Filter, Download, Eye, Trash2, AlertTriangle, CheckCircle, XCircle,
  MessageSquare, Heart, Camera, MapPin, Calendar, Mail, Phone, MoreVertical,
  RefreshCw, BarChart3, PieChart, FileText, X, Loader, LogOut
} from 'lucide-react';
import { adminService } from '../services/profileService';

// API Configuration - UPDATE THIS WITH YOUR BACKEND URL
const API_BASE_URL = 'http://localhost:8000/api/admin';

// Type Definitions
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
}

interface UserProfile {
  user: User;
  username: string;
  email: string;
  phone: string | null;
  gender: string | null;
  age: number | null;
  location: string | null;
  status: 'online' | 'away' | 'offline';
  account_status: 'active' | 'suspended' | 'banned' | 'pending';
  join_date: string;
  last_active: string;
  active_time: number | null;
  matches: number | null;
  messages: number | null;
  photo_count: number | null;
  reports: number | null;
  profile_complete: boolean;
  verified: boolean;
  premium: boolean;
  first_name: string | null;
  date_of_birth: string | null;
  bio: string | null;
  interests: string | null;
}

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

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

interface UserDetailsResponse {
  profile: UserProfile;
  reports_made: Report[];
  reports_received: Report[];
  admin_actions: AdminAction[];
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  
  // Check admin access on mount
  useEffect(() => {
    if (!adminService.isAdmin()) {
      navigate('/admin/login');
    }
  }, [navigate]);
  
  // Get admin user info
  const adminUser = adminService.getAdminUser();
  
  // Main state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'analytics'>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // User management
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersPagination, setUsersPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });
  const [usersPage, setUsersPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [premiumFilter, setPremiumFilter] = useState<string>('all');
  const [orderingFilter, setOrderingFilter] = useState<string>('-join_date');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  
  // User details
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);
  
  // Reports
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsPagination, setReportsPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });
  const [reportsPage, setReportsPage] = useState<number>(1);
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [reportReasonFilter, setReportReasonFilter] = useState<string>('all');
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  
  // Admin actions log
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [actionsPage, setActionsPage] = useState<number>(1);
  const [actionsPagination, setActionsPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });

  // API helper function - uses adminService
  const apiCall = async <T,>(endpoint: string, method: string = 'GET', data: any = null): Promise<T> => {
    try {
      return await adminService.adminApiCall<T>(endpoint, method, data);
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      adminService.adminLogout();
      navigate('/admin/login');
    }
  };

  // Load dashboard stats
  const loadDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall<DashboardStats>('/dashboard/stats/');
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Load users with filters
  const loadUsers = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (accountStatusFilter !== 'all') params.append('account_status', accountStatusFilter);
      if (verifiedFilter !== 'all') params.append('verified', verifiedFilter);
      if (premiumFilter !== 'all') params.append('premium', premiumFilter);
      if (orderingFilter) params.append('ordering', orderingFilter);
      
      const data = await apiCall<{ results: UserProfile[]; count: number; next: string | null; previous: string | null }>(`/users/?${params.toString()}`);
      setUsers(data.results || []);
      setUsersPagination({
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
      });
      setUsersPage(page);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Load user details
  const loadUserDetails = async (userId: number) => {
    setLoading(true);
    try {
      const data = await apiCall<UserDetailsResponse>(`/users/${userId}/detail_view/`);
      setUserDetails(data);
      setShowUserDetails(true);
    } catch (err) {
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  // User actions
  const performUserAction = async (userId: number, action: string, reason: string = '') => {
    setLoading(true);
    try {
      const data = await apiCall<{ message: string; user?: UserProfile }>(`/users/${userId}/user_action/`, 'POST', { action, reason });
      alert(data.message);
      setShowUserDetails(false);
      loadUsers(usersPage);
      if (stats) loadDashboardStats();
    } catch (err) {
      const error = err as Error;
      alert(`Failed to ${action} user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Bulk user actions
  const performBulkAction = async (action: string, reason: string = '') => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }
    
    if (!confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await apiCall<{ message: string; success_count: number; skipped_count: number }>('/users/bulk_action/', 'POST', {
        user_ids: selectedUsers,
        action,
        reason,
      });
      alert(`${data.message}\nSuccess: ${data.success_count}, Skipped: ${data.skipped_count}`);
      setSelectedUsers([]);
      loadUsers(usersPage);
      if (stats) loadDashboardStats();
    } catch (err) {
      const error = err as Error;
      alert(`Bulk action failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Export users
  const exportUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (accountStatusFilter !== 'all') params.append('account_status', accountStatusFilter);
      
      const data = await apiCall<{ data: UserProfile[]; count: number }>(`/users/export/?${params.toString()}`);
      
      // Convert to CSV
      const csv = [
        ['ID', 'Username', 'Email', 'Gender', 'Age', 'Location', 'Status', 'Account Status', 'Join Date', 'Matches', 'Messages'],
        ...data.data.map(u => [
          u.user.id, u.username, u.email, u.gender || '', u.age || '', 
          u.location || '', u.status, u.account_status, u.join_date, 
          u.matches || 0, u.messages || 0
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (err) {
      const error = err as Error;
      alert('Export failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load reports
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
      
      const data = await apiCall<{ results: Report[]; count: number; next: string | null; previous: string | null }>(`/reports/?${params.toString()}`);
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

  // Review report
  const reviewReport = async (reportId: number, action: string, adminNotes: string = '') => {
    setLoading(true);
    try {
      const data = await apiCall<{ message: string; report: Report }>(`/reports/${reportId}/review/`, 'POST', { action, admin_notes: adminNotes });
      alert(data.message);
      loadReports(reportsPage);
      if (stats) loadDashboardStats();
    } catch (err) {
      const error = err as Error;
      alert(`Failed to review report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Bulk review reports
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
      const data = await apiCall<{ message: string; updated_count: number }>('/reports/bulk_review/', 'POST', {
        report_ids: selectedReports,
        action,
        admin_notes: adminNotes,
      });
      alert(data.message);
      setSelectedReports([]);
      loadReports(reportsPage);
      if (stats) loadDashboardStats();
    } catch (err) {
      const error = err as Error;
      alert(`Bulk review failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load admin actions
  const loadAdminActions = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      
      const data = await apiCall<{ results: AdminAction[]; count: number; next: string | null; previous: string | null }>(`/actions/?${params.toString()}`);
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

  // Initial load based on active tab
  useEffect(() => {
    if (activeTab === 'overview') {
      loadDashboardStats();
    } else if (activeTab === 'users') {
      loadUsers(1);
    } else if (activeTab === 'reports') {
      loadReports(1);
    } else if (activeTab === 'analytics') {
      loadAdminActions(1);
    }
  }, [activeTab]);

  // Reload users when filters change
  useEffect(() => {
    if (activeTab === 'users') {
      const timeoutId = setTimeout(() => {
        loadUsers(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, statusFilter, accountStatusFilter, verifiedFilter, premiumFilter, orderingFilter]);

  // Reload reports when filters change
  useEffect(() => {
    if (activeTab === 'reports') {
      const timeoutId = setTimeout(() => {
        loadReports(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, reportStatusFilter, reportReasonFilter]);

  // Utility functions
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      offline: 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-400';
  };

  const getAccountStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: 'text-green-600 bg-green-50',
      suspended: 'text-yellow-600 bg-yellow-50',
      banned: 'text-red-600 bg-red-50',
      pending: 'text-blue-600 bg-blue-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatActiveTime = (hours: number | null): string => {
    if (!hours) return '0h';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Welcome, {adminUser?.username || 'Admin'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (activeTab === 'overview') loadDashboardStats();
                  else if (activeTab === 'users') loadUsers(usersPage);
                  else if (activeTab === 'reports') loadReports(reportsPage);
                  else if (activeTab === 'analytics') loadAdminActions(actionsPage);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="flex gap-1 p-2">
            {[
              { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
              { id: 'users' as const, label: 'User Management', icon: Users },
              { id: 'reports' as const, label: 'Reports', icon: AlertTriangle },
              { id: 'analytics' as const, label: 'Admin Actions', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            {/* Filters & Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
                <div className="relative col-span-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="offline">Offline</option>
                </select>

                <select
                  value={accountStatusFilter}
                  onChange={(e) => setAccountStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Accounts</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>

                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Verification</option>
                  <option value="true">Verified</option>
                  <option value="false">Not Verified</option>
                </select>

                <select
                  value={premiumFilter}
                  onChange={(e) => setPremiumFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Membership</option>
                  <option value="true">Premium</option>
                  <option value="false">Free</option>
                </select>

                <select
                  value={orderingFilter}
                  onChange={(e) => setOrderingFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                >
                  <option value="-join_date">Newest First</option>
                  <option value="join_date">Oldest First</option>
                  <option value="-last_active">Recently Active</option>
                  <option value="last_active">Least Active</option>
                  <option value="-matches">Most Matches</option>
                  <option value="matches">Least Matches</option>
                  <option value="user__username">Username A-Z</option>
                  <option value="-user__username">Username Z-A</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={exportUsers}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  disabled={loading}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>

                {selectedUsers.length > 0 && (
                  <>
                    <button
                      onClick={() => performBulkAction('suspend', 'Bulk suspension')}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                      disabled={loading}
                    >
                      <Ban className="w-4 h-4" />
                      Suspend ({selectedUsers.length})
                    </button>
                    <button
                      onClick={() => performBulkAction('activate', 'Bulk activation')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      disabled={loading}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Activate ({selectedUsers.length})
                    </button>
                    <button
                      onClick={() => performBulkAction('ban', 'Bulk ban')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      disabled={loading}
                    >
                      <XCircle className="w-4 h-4" />
                      Ban ({selectedUsers.length})
                    </button>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      Clear Selection
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map(u => u.user.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="w-4 h-4 text-teal-600 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Matches</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Account</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading && users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Loading users...</p>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.user.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.user.id));
                                }
                              }}
                              className="w-4 h-4 text-teal-600 rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">
                                  {user.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                  {user.username || 'Unknown'}
                                  {user.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                  {user.premium && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">PRO</span>}
                                </p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-sm text-gray-600">{user.status}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {user.location || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{formatDate(user.join_date)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-900">{user.matches || 0}</span>
                              <span className="text-xs text-gray-400">{user.messages || 0} msgs</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getAccountStatusColor(user.account_status)}`}>
                              {user.account_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => loadUserDetails(user.user.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition"
                              disabled={loading}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersPagination.count > 0 && (
                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((usersPage - 1) * 20) + 1} to {Math.min(usersPage * 20, usersPagination.count)} of {usersPagination.count} users
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadUsers(usersPage - 1)}
                      disabled={!usersPagination.previous || loading}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => loadUsers(usersPage + 1)}
                      disabled={!usersPagination.next || loading}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <>
            {/* Report Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
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
          </>
        )}

        {/* Admin Actions Tab */}
        {activeTab === 'analytics' && (
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
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && userDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setUserDetails(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Header */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold">
                  {userDetails.profile.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {userDetails.profile.username}
                    {userDetails.profile.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  </h3>
                  <p className="text-gray-500">{userDetails.profile.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getAccountStatusColor(userDetails.profile.account_status)}`}>
                      {userDetails.profile.account_status}
                    </span>
                    {userDetails.profile.premium && (
                      <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Premium</span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Gender</p>
                  <p className="text-sm text-gray-900">{userDetails.profile.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Age</p>
                  <p className="text-sm text-gray-900">{userDetails.profile.age || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Location</p>
                  <p className="text-sm text-gray-900">{userDetails.profile.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Phone</p>
                  <p className="text-sm text-gray-900">{userDetails.profile.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Join Date</p>
                  <p className="text-sm text-gray-900">{formatDate(userDetails.profile.join_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Last Active</p>
                  <p className="text-sm text-gray-900">{formatDateTime(userDetails.profile.last_active)}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{userDetails.profile.matches || 0}</p>
                  <p className="text-xs text-gray-500">Matches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{userDetails.profile.messages || 0}</p>
                  <p className="text-xs text-gray-500">Messages</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{userDetails.profile.photo_count || 0}</p>
                  <p className="text-xs text-gray-500">Photos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{formatActiveTime(userDetails.profile.active_time)}</p>
                  <p className="text-xs text-gray-500">Active Time</p>
                </div>
              </div>

              {/* Reports Received */}
              {userDetails.reports_received && userDetails.reports_received.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Reports Against This User</p>
                      <p className="text-xs text-red-700">{userDetails.reports_received.length} report(s) filed</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {userDetails.reports_received.slice(0, 3).map((report: Report) => (
                      <div key={report.id} className="bg-white rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700 capitalize">{report.reason}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{report.description}</p>
                        <p className="text-xs text-gray-400 mt-1">By {report.reporter_username} on {formatDate(report.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions on This User */}
              {userDetails.admin_actions && userDetails.admin_actions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Recent Admin Actions</h4>
                  <div className="space-y-2">
                    {userDetails.admin_actions.slice(0, 5).map((action: AdminAction) => (
                      <div key={action.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-gray-700 capitalize">{action.action_type}</span>
                          <p className="text-xs text-gray-600 mt-0.5">{action.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">by {action.admin_username}</p>
                          <p className="text-xs text-gray-400">{formatDate(action.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {userDetails.profile.account_status === 'active' && (
                  <>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter reason for suspension:');
                        if (reason) {
                          performUserAction(userDetails.profile.user.id, 'suspend', reason);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition font-semibold"
                      disabled={loading}
                    >
                      <Ban className="w-4 h-4" />
                      Suspend
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter reason for ban:');
                        if (reason && confirm('Are you sure you want to ban this user?')) {
                          performUserAction(userDetails.profile.user.id, 'ban', reason);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold"
                      disabled={loading}
                    >
                      <XCircle className="w-4 h-4" />
                      Ban
                    </button>
                  </>
                )}

                {(userDetails.profile.account_status === 'suspended' || userDetails.profile.account_status === 'banned') && (
                  <button
                    onClick={() => {
                      const reason = prompt('Enter reason for activation:');
                      if (reason) {
                        performUserAction(userDetails.profile.user.id, 'activate', reason);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-semibold"
                    disabled={loading}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activate
                  </button>
                )}

                {!userDetails.profile.verified && (
                  <button
                    onClick={() => {
                      if (confirm('Verify this user?')) {
                        performUserAction(userDetails.profile.user.id, 'verify', 'User verified by admin');
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-semibold"
                    disabled={loading}
                  >
                    <UserCheck className="w-4 h-4" />
                    Verify
                  </button>
                )}

                <button
                  onClick={() => {
                    const reason = prompt('Enter reason for deletion:');
                    if (reason && confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
                      performUserAction(userDetails.profile.user.id, 'delete', reason);
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-red-600 rounded-xl hover:bg-red-50 transition font-semibold"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-900 font-semibold mb-2">Profile Status</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Profile Complete: {userDetails.profile.profile_complete ? 'Yes' : 'No'}</li>
                  <li>• Verification: {userDetails.profile.verified ? 'Verified' : 'Not Verified'}</li>
                  <li>• Membership: {userDetails.profile.premium ? 'Premium' : 'Free'}</li>
                  <li>• Current Status: {userDetails.profile.status}</li>
                  <li>• Reports Filed By User: {userDetails.reports_made?.length || 0}</li>
                  <li>• Reports Against User: {userDetails.reports_received?.length || 0}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <Loader className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;