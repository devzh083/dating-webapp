// src/components/TopBar.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface TopBarProps {
  isLoggedIn: boolean;
  onLogout: () => void; // still available if you want to use it elsewhere
}

const TopBar: React.FC<TopBarProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();

  const handleBrandClick = () => {
    navigate("/");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="site-header">
      <button className="site-brand" onClick={handleBrandClick}>
        The Dating App
      </button>

      <nav className="site-nav">
        <NavLink to="/" className="site-nav-link">
          Home
        </NavLink>
        <NavLink to="/chats" className="site-nav-link">
          Chats
        </NavLink>
        <NavLink to="/notifications" className="site-nav-link">
          Notifications
        </NavLink>
        <NavLink to="/cafes" className="site-nav-link">
          Cafés
        </NavLink>

        {isLoggedIn ? (
          // Colorful circular profile button
          <button
            type="button"
            onClick={handleProfileClick}
            style={{
              marginLeft: 16,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "0",
              padding: 0,
              background:
                "linear-gradient(135deg, #f97316 0%, #ec4899 45%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 16,
              boxShadow: "0 0 0 2px rgba(255,255,255,0.8)",
              cursor: "pointer",
            }}
            aria-label="Open profile"
          >
            U
          </button>
        ) : (
          <button className="login-pill" onClick={handleLoginClick}>
            Login/SignUp
          </button>
        )}
      </nav>
    </header>
  );
};

export default TopBar;
