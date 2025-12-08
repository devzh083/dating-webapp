// front-end/src/pages/ProfilePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../firebase";
import TopBar from "../components/TopBar";

import "./ProfilePage.css";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <div className="app-shell profile-shell">
      <TopBar isLoggedIn={!!user} />

      <main className="profile-main">
        <div className="profile-card">
          <h1 className="profile-title">Your profile</h1>

          {user ? (
            <>
              <div className="profile-row">
                <span className="profile-label">Name</span>
                <span className="profile-value">
                  {user.displayName || "Add your name in onboarding"}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user.email}</span>
              </div>

              {user.phoneNumber && (
                <div className="profile-row">
                  <span className="profile-label">Phone</span>
                  <span className="profile-value">{user.phoneNumber}</span>
                </div>
              )}
            </>
          ) : (
            <p className="profile-placeholder">
              No user is logged in right now.
            </p>
          )}

          <button className="profile-logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
