import React from "react";
import TopBar from "@/components/layout/TopBar";
import "./ProfilePage.css";

type ProfilePageProps = {
  // We don't need isLoggedIn here because App.tsx protects this route
  onLogout: () => void;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  // Placeholder values - connect to your context or API later
  const fakeUser = {
    displayName: "Your Name",
    email: "you@example.com",
  };

  return (
    <div className="app-shell profile-shell">
      {/* TopBar doesn't need isLoggedIn, it just needs userName and onLogout */}
      <TopBar userName={fakeUser.displayName} onLogout={onLogout} />

      <main className="profile-main">
        <div className="profile-card">
          <h1 className="profile-title">Your profile</h1>

          {/* We assume user is logged in if they reached this page */}
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

          <button className="profile-logout-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;