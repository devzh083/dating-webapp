import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface TopBarProps {
  isLoggedIn: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const handleBrandClick = () => {
    navigate("/");
  };

  const handleLoginClick = () => {
    if (isLoggedIn) {
      console.log("Open profile");
    } else {
      navigate("/login");
    }
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
        <button className="login-pill" onClick={handleLoginClick}>
          {isLoggedIn ? "Profile" : "Login/SignUp"}
        </button>
      </nav>
    </header>
  );
};

export default TopBar;
