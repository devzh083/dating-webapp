import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

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

/* 🟠 Cafe Partner Pages */
import CafePartnerLoginPage from "./pages/cafe-partner/CafePartnerLoginPage";
import CafeDashboard from "./pages/cafe-partner/CafeDashboard";
import CafeOnboardingPage from "./pages/cafe-partner/CafeOnboardingPage";
import CafeRegisterPage from "./pages/cafe-partner/CafeRegisterPage";
import CafePartnerSignupPage from "./pages/cafe-partner/CafePartnerSignupPage";

const AppInner: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const navigate = useNavigate();

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
      // token invalid or expired → force logout
      handleLogout();
      return false;
    }
  };

  /* ---------------- APP STARTUP ---------------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessFromQuery = params.get("access_token");
    const refreshFromQuery = params.get("refresh_token");

    if (accessFromQuery) {
      localStorage.setItem("access_token", accessFromQuery);
      if (refreshFromQuery) {
        localStorage.setItem("refresh_token", refreshFromQuery);
      }

      window.history.replaceState({}, "", window.location.pathname);
      setIsLoggedIn(true);

      checkProfile(accessFromQuery).finally(() => {
        setProfileLoaded(true);
      });
      return;
    }

    const storedAccess = localStorage.getItem("access_token");
    if (storedAccess) {
      setIsLoggedIn(true);
      checkProfile(storedAccess).finally(() => {
        setProfileLoaded(true);
      });
    } else {
      setIsLoggedIn(false);
      setProfileLoaded(true);
    }
  }, []);

  const handleLoginSuccess = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      await checkProfile(accessToken);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.clear();
    setIsLoggedIn(false);
    setNeedsOnboarding(false);
    navigate("/");
  };

  if (!profileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      {/* ---------------- USER APP ---------------- */}

      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/home" replace /> : <Landing />}
      />

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
      
      <Route
       path="/cafe-partner/register"
        element={<CafeRegisterPage />}
       />

       <Route
       path="/cafe-partner/signup"
       element={<CafePartnerSignupPage />}
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

      <Route
        path="/profile"
        element={
          isLoggedIn ? (
            <ProfilePage onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

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

      {/* ---------------- CAFE PARTNER APP ---------------- */}

      <Route path="/cafe-partner/login" element={<CafePartnerLoginPage />} />

      <Route
        path="/cafe-partner/dashboard"
        element={
          localStorage.getItem("access_token") ? (
            <CafeDashboard />
          ) : (
            <Navigate to="/cafe-partner/login" replace />
          )
        }
      />

      <Route
        path="/cafe-partner/onboarding"
        element={
          localStorage.getItem("access_token") ? (
            <CafeOnboardingPage />
          ) : (
            <Navigate to="/cafe-partner/login" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => <AppInner />;

export default App;`q`