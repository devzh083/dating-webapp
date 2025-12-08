// front-end/src/App.tsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

import HomePage from "./pages/HomePage";
import ChatsPage from "./pages/ChatsPage";
import NotificationsPage from "./pages/NotificationsPage";
import CafesPage from "./pages/CafesPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);

          const onboardingDone =
            snap.exists() && snap.data().onboardingCompleted === true;
          setNeedsOnboarding(!onboardingDone);
        } catch (err) {
          console.error("Error loading profile:", err);
          setNeedsOnboarding(true);
        }
      } else {
        setNeedsOnboarding(false);
      }

      setProfileLoaded(true);
    });

    return () => unsub();
  }, []);

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

  const isLoggedIn = !!currentUser;

  return (
    <Routes>
      <Route
        path="/"
        element={
          needsOnboarding && isLoggedIn ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <HomePage isLoggedIn={isLoggedIn} />
          )
        }
      />

      <Route
        path="/chats"
        element={
          needsOnboarding && isLoggedIn ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <ChatsPage isLoggedIn={isLoggedIn} />
          )
        }
      />

      <Route
        path="/notifications"
        element={
          needsOnboarding && isLoggedIn ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <NotificationsPage isLoggedIn={isLoggedIn} />
          )
        }
      />

      <Route
        path="/cafes"
        element={
          needsOnboarding && isLoggedIn ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <CafesPage isLoggedIn={isLoggedIn} />
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
            <LoginPage isLoggedIn={false} />
          )
        }
      />

      <Route
        path="/profile"
        element={
          isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />
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

export default App;
