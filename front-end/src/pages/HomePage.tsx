import "./HomePage.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import PremiumSection from "../components/PremiumSection";

type HomePageProps = {
  isLoggedIn: boolean;
};

const people = [
  {
    id: 1,
    name: "Aaradhya",
    age: 22,
    city: "Vizag",
    imageUrl:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=800",
  },
  {
    id: 2,
    name: "Rohit",
    age: 24,
    city: "Vizag",
    imageUrl:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&w=800",
  },
  {
    id: 3,
    name: "Sahana",
    age: 23,
    city: "Gajuwaka",
    imageUrl:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=800",
  },
  {
    id: 4,
    name: "Aditya",
    age: 26,
    city: "Madhurawada",
    imageUrl:
      "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&w=800",
  },
  {
    id: 5,
    name: "Meghana",
    age: 25,
    city: "Siripuram",
    imageUrl:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=800",
  },
];

const HomePage: React.FC<HomePageProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const location = "Visakhapatnam (Vizag)";

  const handleGoPremium = () => {
    alert("Premium flow coming soon.");
  };

  const goToLogin = () => navigate("/login");
  const goToSignUp = () => navigate("/login"); // later you can route to /signup

  return (
    <div className="app-shell">
      <TopBar isLoggedIn={isLoggedIn} />

      <main className="home-main">
        {/* HERO BANNER */}
        <section className="home-hero">
          <div
            className="home-hero-image"
            style={{
              backgroundImage:
                "url(https://images.pexels.com/photos/935759/pexels-photo-935759.jpeg?auto=compress&w=1400)",
            }}
          />
          <div className="home-hero-overlay">
            <h1>Find your next date, effortlessly.</h1>
            <p>
              Discover people who match your vibe and meet at curated partner
              cafés in your city.
            </p>

            <div className="home-hero-actions">
              <button className="hero-primary" onClick={goToLogin}>
                Login
              </button>
              <button className="hero-secondary" onClick={goToSignUp}>
                Sign up
              </button>
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="home-filters">
          <button className="filter-pill">Filter</button>
          <button className="filter-pill">Interests</button>
          <button className="filter-pill">Within 5 km</button>
          <button className="filter-pill">Age 21–30</button>
          <button className="filter-pill">Online now</button>
          <button className="filter-pill">Verified profiles</button>
        </section>

        {/* SUGGESTED MATCHES */}
        <section className="matches-section">
          <div className="matches-header">
            <h2 className="section-title">Suggested Matches</h2>
            <span className="location-pill">{location}</span>
          </div>

          <div className="matches-grid">
            {people.map((user) => (
              <article key={user.id} className="match-card">
                <div
                  className="match-photo"
                  style={{ backgroundImage: `url(${user.imageUrl})` }}
                />
                <div className="match-info">
                  <div className="match-name-row">
                    <span className="match-name">{user.name}</span>
                    <span className="match-age">{user.age}</span>
                  </div>
                  <span className="match-city">{user.city}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* PREMIUM BANNER */}
        <PremiumSection onGoPremium={handleGoPremium} />
      </main>
    </div>
  );
};

export default HomePage;
