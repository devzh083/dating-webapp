import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, X, LogOut, BarChart3, Users as UsersIcon, AlertTriangle, 
  FileText, Crown, Lightbulb, Quote
} from 'lucide-react';
import { adminService } from '../services/profileService';

// Import page components
import Overview from './adminpages/Overview';
import UserManagement from './adminpages/Usermanagement';
import ReportsManagement from './adminpages/Reportsmanagement';
import AdminActionsLog from './adminpages/Adminactionslog';
import PremiumManagement from './adminpages/Premiummanagement';
import ExpertTipsManagement from './adminpages/ExpertTipsManagement';
import ReviewsManagement from './adminpages/ReviewsManagement';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'analytics' | 'premium' | 'expert-tips' | 'reviews'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Logout handler
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      adminService.adminLogout();
      navigate('/admin/login');
    }
  };

  // Get tab title and description
  const getTabInfo = () => {
    const tabInfo = {
      overview: { title: 'Dashboard Overview', description: 'View system statistics and analytics' },
      users: { title: 'User Management', description: 'Manage and moderate user accounts' },
      reports: { title: 'Reports Management', description: 'Review and handle user reports' },
      analytics: { title: 'Admin Actions Log', description: 'Track administrative actions' },
      premium: { title: 'Premium Management', description: 'Manage premium subscriptions' },
      'expert-tips': { title: 'Expert Tips Management', description: 'Manage expert tips and advice' },
      reviews: { title: 'Reviews Management', description: 'Review and approve user testimonials' }
    };
    return tabInfo[activeTab];
  };

  const currentTabInfo = getTabInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-20 shadow-lg`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">Admin Panel</h1>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition shrink-0"
              title="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{adminUser?.username || 'Admin'}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {[
              { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
              { id: 'users' as const, label: 'User Management', icon: UsersIcon },
              { id: 'reports' as const, label: 'Reports', icon: AlertTriangle },
              { id: 'analytics' as const, label: 'Admin Actions', icon: FileText },
              { id: 'premium' as const, label: 'Premium', icon: Crown },
              { id: 'expert-tips' as const, label: 'Expert Tips', icon: Lightbulb },
              { id: 'reviews' as const, label: 'Reviews', icon: Quote }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center hover:bg-teal-600 transition"
                    title="Open sidebar"
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </button>
                )}
                
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentTabInfo.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{currentTabInfo.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="w-full px-6 py-6">
            {/* Render the active tab content */}
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'reports' && <ReportsManagement />}
            {activeTab === 'analytics' && <AdminActionsLog />}
            {activeTab === 'premium' && <PremiumManagement />}
            {activeTab === 'expert-tips' && <ExpertTipsManagement />}
            {activeTab === 'reviews' && <ReviewsManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;