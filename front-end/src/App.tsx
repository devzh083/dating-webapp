import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import ChatsPage from "./pages/ChatsPage";
import NotificationsPage from "./pages/NotificationsPage";
import CafesPage from "./pages/CafesPage";
import BookingPage from "./pages/BookingPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import { adminService } from './services/profileService';

// Admin Protected Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = adminService.isAdmin();
  
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

const AppInner: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- CHECK USER PROFILE ---------------- */
  const checkProfile = async (accessToken: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/status/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Profile check failed");

      const data = await response.json();
      const profileExists =
        data.profile_exists || Object.keys(data.profile || {}).length > 0;

      setNeedsOnboarding(!profileExists);
      return profileExists;
    } catch (error) {
      console.error("Profile check failed:", error);
      // Don't call handleLogout here to avoid recursion
      localStorage.clear();
      setIsLoggedIn(false);
      setNeedsOnboarding(false);
      return false;
    }
  };

  /* ---------------- APP STARTUP ---------------- */
  useEffect(() => {
    const initAuth = async () => {
      // Skip auth check for admin routes
      if (location.pathname.startsWith('/admin')) {
        setIsLoggedIn(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const accessFromQuery = params.get("access_token");
      const refreshFromQuery = params.get("refresh_token");

      if (accessFromQuery) {
        localStorage.setItem("access_token", accessFromQuery);
        if (refreshFromQuery) {
          localStorage.setItem("refresh_token", refreshFromQuery);
        }

        window.history.replaceState({}, "", window.location.pathname);
        
        await checkProfile(accessFromQuery);
        setIsLoggedIn(true);
        return;
      }

      const storedAccess = localStorage.getItem("access_token");
      if (storedAccess) {
        await checkProfile(storedAccess);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    initAuth();
  }, [location.pathname]);

  const handleLoginSuccess = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      await checkProfile(accessToken);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    console.log("🚪 Logging out from App.tsx...");
    
    // Clear everything
    localStorage.clear();
    setIsLoggedIn(false);
    setNeedsOnboarding(false);
    
    // Navigate to root
    navigate("/", { replace: true });
  };

  // Show loading only on initial load (skip for admin routes)
  if (isLoggedIn === null && !location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ---------------- ADMIN ROUTES (SEPARATE FROM USER ROUTES) ---------------- */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* ---------------- PUBLIC ROUTES ---------------- */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          ) : (
            <Landing />
          )
        }
      />

      <Route
        path="/login"
        element={
          isLoggedIn ? (
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      {/* ---------------- ONBOARDING ROUTE ---------------- */}
      <Route
        path="/onboarding"
        element={
          isLoggedIn ? (
            <OnboardingPage
              onComplete={() => setNeedsOnboarding(false)}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ---------------- PROTECTED ROUTES (REQUIRE LOGIN) ---------------- */}
      <Route
        path="/home"
        element={
          !isLoggedIn ? (
            <Navigate to="/" replace />
          ) : needsOnboarding ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <HomePage onLogout={handleLogout} />
          )
        }
      />

      <Route
        path="/chats"
        element={
          !isLoggedIn ? (
            <Navigate to="/" replace />
          ) : needsOnboarding ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <ChatsPage onLogout={handleLogout} />
          )
        }
      />

      <Route
        path="/notifications"
        element={
          !isLoggedIn ? (
            <Navigate to="/" replace />
          ) : needsOnboarding ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <NotificationsPage onLogout={handleLogout} />
          )
        }
      />

      {/* ---------------- PROFILE ROUTE ---------------- */}
      <Route
        path="/profile"
        element={
          !isLoggedIn ? (
            <Navigate to="/" replace />
          ) : needsOnboarding ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <ProfilePage />
          )
        }
      />

      {/* ---------------- CAFES ROUTES ---------------- */}
      
      <Route
        path="/cafes"
        element={
          !isLoggedIn ? (
            <Navigate to="/" replace />
          ) : needsOnboarding ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <CafesPage onLogout={handleLogout} />
          )
        }
      />

      <Route
        path="/cafes/:id/book"
        element={
          !isLoggedIn ? (
            <Navigate to="/" replace />
          ) : needsOnboarding ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <BookingPage />
          )
        }
      />

      {/* ---------------- 404 NOT FOUND ---------------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => <AppInner />;

export default App;