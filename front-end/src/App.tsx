import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

// Existing Pages
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
import AdminPanel from './pages/AdminPanel';
import { adminService, profileService } from './services/profileService'; // ✅ Imported profileService

// Footer Pages
import LegalPage from './pages/footer/LegalPage';
import AboutPage from './pages/footer/AboutPage';
import ContactPage from './pages/footer/ContactPage';
import CareersPage from './pages/footer/CareersPage';
import HelpCenterPage from './pages/footer/HelpCenterPage';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = adminService.isAdmin();
  if (!isAdmin) return <Navigate to="/login" replace />; // ✅ Changed to /login
  return <>{children}</>;
};

const AppInner: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- SCROLL BEHAVIOR ---------------- */
  useEffect(() => {
    if (!location.pathname.startsWith('/chats')) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  /* ---------------- CHECK PROFILE (ROBUST) ---------------- */
  const checkProfile = async () => {
    try {
      // ✅ FIX: Use profileService to check actual data instead of a status flag
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
  }, []); // ✅ Empty dependency array prevents infinite loops

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
      {/* ✅ Admin login merged into main LoginPage - routes commented out */}
      {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Footer Routes */}
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
              onLogout={handleLogout}
            />
          ) : <Navigate to="/" replace />
        }
      />

      <Route path="/home" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <HomePage onLogout={handleLogout} />} />
      <Route path="/chats" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <ChatsPage onLogout={handleLogout} />} />
      <Route path="/notifications" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <NotificationsPage onLogout={handleLogout} />} />
      <Route path="/profile" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <ProfilePage />} />
      <Route path="/cafes" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <CafesPage onLogout={handleLogout} />} />
      <Route path="/cafes/:id/book" element={!isLoggedIn ? <Navigate to="/" replace /> : needsOnboarding ? <Navigate to="/onboarding" replace /> : <BookingPage />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => <AppInner />;

export default App;