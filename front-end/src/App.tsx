import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import ChatsPage from "./pages/ChatsPage";
import NotificationsPage from "./pages/NotificationsPage";
import CafesPage from "./pages/CafesPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";

const AppInner: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const navigate = useNavigate();

  // check profile via API
  const checkProfile = async (accessToken: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/status/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const profileExists =
        data.profile_exists || Object.keys(data.profile || {}).length > 0;

      setNeedsOnboarding(!profileExists);
      return profileExists;
    } catch (error) {
      console.error("Profile check failed:", error);

      // 🔴 token invalid or expired → force logout
      handleLogout();
      return false;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessFromQuery = params.get("access_token");
    const refreshFromQuery = params.get("refresh_token");

    // Google OAuth callback
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

    // normal startup
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
    // 1. Clear Storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("onboardingData");
    
    // 2. Update Global State
    setIsLoggedIn(false);
    setNeedsOnboarding(false);
    
    // 3. Navigate
    navigate("/");
  };

  if (!profileLoaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, Inter, sans-serif",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing */}
      <Route
        path="/"
        element={
          isLoggedIn ? <Navigate to="/home" replace /> : <Landing />
        }
      />

      {/* Home */}
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

      {/* Chats */}
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

      {/* Notifications */}
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

      {/* Cafes */}
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

      {/* Login */}
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

      {/* Profile - Corrected to assume login if reached */}
      <Route
        path="/profile"
        element={
          isLoggedIn ? <ProfilePage onLogout={handleLogout} /> : <Navigate to="/" replace />
        }
      />

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          isLoggedIn ? (
            <OnboardingPage
              onComplete={() => {
                setNeedsOnboarding(false);
              }}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => <AppInner />;

export default App;