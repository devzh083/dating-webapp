// src/pages/NotificationsPage.tsx
import React from "react";
import TopBar from "@/components/layout/TopBar";

type NotificationsPageProps = {
  isLoggedIn: boolean;
  onLogout: () => void;
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({ isLoggedIn, onLogout }) => {
  const userName = "User";

  if (!isLoggedIn) {
    return (
      <div className="app-shell">
        <TopBar userName={userName} onLogout={onLogout} />
        <main className="home-main locked-main">
          <div className="locked-card">
            <h2>Login to see notifications</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar userName={userName} onLogout={onLogout} />
      <main className="home-main">
        <h2 className="p-6">Notifications</h2>
      </main>
    </div>
  );
};

export default NotificationsPage;
