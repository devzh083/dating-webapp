import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ChatsPage from "./pages/ChatsPage";
import NotificationsPage from "./pages/NotificationsPage";
import CafesPage from "./pages/CafesPage";
import { auth } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  if (authLoading) {
    return (
      <div className="app-shell">
        <main className="home-main" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  const isLoggedIn = !!currentUser;

  return (
    <Routes>
      <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
      <Route path="/login" element={<LoginPage isLoggedIn={isLoggedIn} />} />
      <Route path="/chats" element={<ChatsPage isLoggedIn={isLoggedIn} />} />
      <Route
        path="/notifications"
        element={<NotificationsPage isLoggedIn={isLoggedIn} />}
      />
      <Route path="/cafes" element={<CafesPage isLoggedIn={isLoggedIn} />} />
    </Routes>
  );
}

export default App;
