// front-end/src/pages/ProfilePage.tsx
import React from "react";
import TopBar from "@/components/layout/TopBar";

import "./ProfilePage.css";

type ProfilePageProps = {
  isLoggedIn: boolean;
  onLogout: () => void;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ isLoggedIn, onLogout }) => {
  // For now, user info is not coming from backend; you can call /profile/ later.
  // Placeholder values can be replaced with real data from Django/Firebase.
  const fakeUser = {
    displayName: "Your Name",
    email: "you@example.com",
  };

  return (
    <div className="app-shell profile-shell">
      <TopBar isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="profile-main">
        <div className="profile-card">
          <h1 className="profile-title">Your profile</h1>

          {isLoggedIn ? (
            <>
              <div className="profile-row">
                <span className="profile-label">Name</span>
                <span className="profile-value">
                  {fakeUser.displayName || "Add your name in onboarding"}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">{fakeUser.email}</span>
              </div>
            </>
          ) : (
            <p className="profile-placeholder">
              No user is logged in right now.
            </p>
          )}

          <button className="profile-logout-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
