import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

/* ---------------- EXISTING PAGES ---------------- */
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
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
// ✅ MERGE: Added PremiumPage from Vikas's branch
import PremiumPage from './pages/Premiumpage'; 

import { adminService, profileService } from './services/profileService'; 

/* ---------------- FOOTER PAGES ---------------- */
import LegalPage from './pages/footer/LegalPage';
import AboutPage from './pages/footer/AboutPage';
import ContactPage from './pages/footer/ContactPage';
import CareersPage from './pages/footer/CareersPage';
import HelpCenterPage from './pages/footer/HelpCenterPage';

// Admin Protected Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = adminService.isAdmin();
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const AppInner: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- SCROLL BEHAVIOR ---------------- */
  useEffect(() => {
    // Only scroll to top if NOT on the Chats page.
    if (!location.pathname.startsWith('/chats')) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  /* ---------------- CHECK USER PROFILE (ROBUST FIX) ---------------- */
  // ✅ Used your fixed logic: checks actual data via profileService to prevent loops
  const checkProfile = async () => {
    try {
      const result = await profileService.getProfile();
      
      // We consider onboarding complete ONLY if the profile exists AND has a first name
      const isProfileComplete = result.exists && result.data && result.data.firstName;

      setNeedsOnboarding(!isProfileComplete);
      return isProfileComplete;
    } catch (error) {
      console.error("Profile check failed:", error);
      handleLogout();
      return false;
    }
  };

  /* ---------------- APP STARTUP ---------------- */
  useEffect(() => {
    const initAuth = async () => {
      if (isLoggedIn === true) return; // Stop loop if already logged in

      if (location.pathname.startsWith('/admin')) {
        setIsLoggedIn(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const accessFromQuery = params.get("access_token");
      const refreshFromQuery = params.get("refresh_token");

      // 1. OAuth Redirect
      if (accessFromQuery) {
        localStorage.setItem("access_token", accessFromQuery);
        if (refreshFromQuery) localStorage.setItem("refresh_token", refreshFromQuery);
        window.history.replaceState({}, "", window.location.pathname);
        
        await checkProfile();
        setIsLoggedIn(true);
        return;
      }

      // 2. Existing Session
      const storedAccess = localStorage.getItem("access_token");
      if (storedAccess) {
        await checkProfile();
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    initAuth();
    // ✅ CRITICAL FIX: Empty dependency array [] prevents infinite loops (Your fix)
  }, []); 

  const handleLoginSuccess = async () => {
    await checkProfile();
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    localStorage.clear();
    setIsLoggedIn(false);
    setNeedsOnboarding(false);
    navigate("/", { replace: true });
  };

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
      {/* ---------------- ADMIN ROUTES ---------------- */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* ---------------- FOOTER / PUBLIC ROUTES ---------------- */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/careers" element={<CareersPage />} />
      <Route path="/press" element={<LegalPage type="press" />} />
      <Route path="/blog" element={<LegalPage type="blog" />} />
      <Route path="/help" element={<HelpCenterPage />} />
      <Route path="/safety" element={<LegalPage type="safety" />} />
      <Route path="/guidelines" element={<LegalPage type="guidelines" />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<LegalPage type="privacy" />} />
      <Route path="/terms" element={<LegalPage type="terms" />} />
      <Route path="/cookies" element={<LegalPage type="cookies" />} />
      <Route path="/ip" element={<LegalPage type="ip" />} />

      {/* ---------------- CORE APP ROUTES ---------------- */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            needsOnboarding ? <Navigate to="/onboarding" replace /> : <Navigate to="/home" replace />
          ) : <Landing />
        }
      />

      <Route
        path="/login"
        element={
          isLoggedIn ? (
            needsOnboarding ? <Navigate to="/onboarding" replace /> : <Navigate to="/home" replace />
          ) : <LoginPage onLoginSuccess={handleLoginSuccess} />
        }
      />

      <Route
        path="/onboarding"
        element={
          isLoggedIn ? (
            <OnboardingPage
              onComplete={() => setNeedsOnboarding(false)}
              onLogout={handleLogout} // ✅ Your fix: Passed logout so users aren't trapped
            />
          ) : <Navigate to="/" replace />
        }
      />

      {/* ---------------- PROTECTED ROUTES ---------------- */}
      <Route path="/home" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <HomePage onLogout={handleLogout} />} />
      <Route path="/chats" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <ChatsPage onLogout={handleLogout} />} />
      <Route path="/notifications" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <NotificationsPage onLogout={handleLogout} />} />
      <Route path="/profile" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <ProfilePage />} />
      <Route path="/cafes" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <CafesPage onLogout={handleLogout} />} />
      <Route path="/cafes/:id/book" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <BookingPage />} />
      
      {/* ✅ MERGE: Added Vikas's Premium Route */}
      <Route path="/premium" element={<PremiumPage />} />

      {/* ---------------- 404 NOT FOUND ---------------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => <AppInner />;

export default App;