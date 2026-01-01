// front-end/src/pages/ProfilePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";

import "./ProfilePage.css";

type ProfilePageProps = {
  onLogout: () => void;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  // For now, user info is placeholder; later call /api/profile/
  const fakeUser = {
    displayName: "Your Name",
    email: "you@example.com",
  };

  const handleEditProfile = () => {
    // go to onboarding flow to edit profile
    navigate("/onboarding");
  };

  return (
    <div className="app-shell profile-shell">
      {/* TopBar no longer receives isLoggedIn */}
      <TopBar userName={fakeUser.displayName} onLogout={onLogout} />

      <main className="profile-main">
        <div className="profile-card">
          <h1 className="profile-title">Your profile</h1>

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

          <div className="profile-actions">
            <button
              className="profile-edit-btn"
              type="button"
              onClick={handleEditProfile}
            >
              Edit profile
            </button>

            <button
              className="profile-logout-btn"
              type="button"
              onClick={onLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
