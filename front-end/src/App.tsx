// src/App.tsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

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

  // Function to check profile via API
  const checkProfile = async (accessToken: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/status/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profile API Response:", data);
      
      // Check if profile exists based on your API response structure
      const profileExists = data.profile_exists || Object.keys(data.profile).length > 0;
      
      // Set onboarding based on profile existence
      setNeedsOnboarding(!profileExists);
      
      return profileExists;
    } catch (error) {
      console.error("Profile check failed:", error);
      // Default to no onboarding if API fails
      setNeedsOnboarding(false);
      return false;
    }
  };

  useEffect(() => {
    // 1) check Google callback query params
    const params = new URLSearchParams(window.location.search);
    const accessFromQuery = params.get("access_token");
    const refreshFromQuery = params.get("refresh_token");

    if (accessFromQuery) {
      localStorage.setItem("access_token", accessFromQuery);
      if (refreshFromQuery) {
        localStorage.setItem("refresh_token", refreshFromQuery);
      }

      // clean URL
      window.history.replaceState({}, "", window.location.pathname);

      setIsLoggedIn(true);
      
      // Check profile after setting login state
      checkProfile(accessFromQuery).finally(() => {
        setProfileLoaded(true);
      });
      return;
    }

    // 2) normal startup check
    const storedAccess = localStorage.getItem("access_token");
    if (storedAccess) {
      setIsLoggedIn(true);
      // Check profile for existing token
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    setNeedsOnboarding(false);
    navigate("/login");
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
      <Route
        path="/"
        element={
          needsOnboarding && isLoggedIn ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <HomePage isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          )
        }
      />

      <Route
        path="/chats"
        element={
          needsOnboarding && isLoggedIn ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <ChatsPage isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          )
        }
      />

      <Route
        path="/notifications"
        element={
          needsOnboarding && isLoggedIn ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <NotificationsPage
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
          )
        }
      />

      <Route
        path="/cafes"
        element={
          needsOnboarding && isLoggedIn ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <CafesPage isLoggedIn={isLoggedIn} onLogout={handleLogout} />
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
              <Navigate to="/" replace />
            )
          ) : (
            <LoginPage
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              onLoginSuccess={handleLoginSuccess}
            />
          )
        }
      />

      <Route
        path="/profile"
        element={
          isLoggedIn ? (
            <ProfilePage isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/onboarding"
        element={
          isLoggedIn ? <OnboardingPage /> : <Navigate to="/login" replace />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => <AppInner />;

export default App;
