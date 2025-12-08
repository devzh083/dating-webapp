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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
    setNeedsOnboarding(false); // adjust later if you have onboarding logic
    setProfileLoaded(true);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
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
          isLoggedIn ? (
            <OnboardingPage
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => <AppInner />;

export default App;
