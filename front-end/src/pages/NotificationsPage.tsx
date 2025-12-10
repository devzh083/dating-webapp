import "./NotificationsPage.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import { FiHeart, FiUserPlus, FiCoffee, FiBell } from "react-icons/fi";

type NotificationItem = {
  id: number;
  type: "request" | "accepted" | "nearby" | "cafe";
  title: string;
  message: string;
  time: string;
};

const notifications: NotificationItem[] = [
  {
    id: 1,
    type: "request",
    title: "New connection request",
    message: "Aaradhya sent you a connection request.",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "accepted",
    title: "Request accepted",
    message: "Rohit accepted your request. Say hi 👋",
    time: "15 min ago",
  },
  {
    id: 3,
    type: "nearby",
    title: "Someone is nearby",
    message: "Meghana is also in Siripuram right now.",
    time: "1 hr ago",
  },
  {
    id: 4,
    type: "cafe",
    title: "Café offer",
    message: "Skyline Rooftop Café: Flat 20% off for couples.",
    time: "Today",
  },
];

const iconForType = (type: NotificationItem["type"]) => {
  switch (type) {
    case "request":
      return <FiUserPlus />;
    case "accepted":
      return <FiHeart />;
    case "nearby":
      return <FiBell />;
    case "cafe":
      return <FiCoffee />;
    default:
      return <FiBell />;
  }
};

type NotificationsPageProps = {
  isLoggedIn: boolean;
  onLogout: () => void;
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({
  isLoggedIn,
  onLogout,
}) => {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="app-shell">
        <TopBar isLoggedIn={isLoggedIn} onLogout={onLogout} />
        <main className="home-main locked-main">
          <div className="locked-card">
            <h2>Login to view notifications</h2>
            <p>Connection requests and café updates are visible after login.</p>
            <button
              className="hero-primary"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="home-main notifications-main">
        <header className="notifications-header">
          <h2>Notifications</h2>
          <button className="filter-pill">Mark all as read</button>
        </header>

        <section className="notification-list">
          {notifications.map((item) => (
            <article key={item.id} className="notification-card">
              <div className={`notification-icon ${item.type}`}>
                {iconForType(item.type)}
              </div>
              <div className="notification-text">
                <div className="notification-title-row">
                  <h3>{item.title}</h3>
                  <span className="notification-time">{item.time}</span>
                </div>
                <p>{item.message}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default NotificationsPage;
