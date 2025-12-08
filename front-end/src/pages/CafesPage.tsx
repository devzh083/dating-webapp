import "./CafesPage.css";
import React from "react";
import TopBar from "../components/TopBar";

type CafesPageProps = {
  isLoggedIn: boolean;
};

type Cafe = {
  id: number;
  name: string;
  cuisines: string;
  location: string;
  priceForTwo: string;
  distanceKm: number;
  rating: number;
  imageUrl: string;
  mainOffer: string;
  secondaryOffer?: string;
};

const cafes: Cafe[] = [
  {
    id: 1,
    name: "Waves Cafe & Bar",
    cuisines: "Continental • Italian • Coffee",
    location: "Beach Road, Vizag",
    priceForTwo: "₹800 for two",
    distanceKm: 1.2,
    rating: 4.3,
    imageUrl:
      "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&w=800",
    mainOffer: "Flat 15% off on pre-booking",
    secondaryOffer: "Up to 10% off with bank offers",
  },
  {
    id: 2,
    name: "Skyline Rooftop Café",
    cuisines: "Cafe • Fast Food • Beverages",
    location: "Dwaraka Nagar, Vizag",
    priceForTwo: "₹600 for two",
    distanceKm: 2.0,
    rating: 4.6,
    imageUrl:
      "https://images.pexels.com/photos/3801642/pexels-photo-3801642.jpeg?auto=compress&w=800",
    mainOffer: "Couple combo @ ₹499",
    secondaryOffer: "Free dessert with premium",
  },
  {
    id: 3,
    name: "RedChilli Coffee House",
    cuisines: "Chinese • North Indian • Cafe",
    location: "Siripuram, Vizag",
    priceForTwo: "₹700 for two",
    distanceKm: 1.8,
    rating: 4.5,
    imageUrl:
      "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&w=800",
    mainOffer: "25% off on pre-booking",
    secondaryOffer: "Happy hours 4–7 PM",
  },
];

const CafesPage: React.FC<CafesPageProps> = ({ isLoggedIn }) => {
  return (
    <div className="app-shell">
      <TopBar isLoggedIn={isLoggedIn} />

      <main className="home-main cafes-main">
        {/* Hero banner */}
        <section className="cafes-hero">
          <div
            className="cafes-hero-image"
            style={{
              backgroundImage:
                "url(https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&w=1200)",
            }}
          />
          <div className="cafes-hero-overlay">
            <h1>Explore Top Date Cafés in Your City</h1>
            <p>Book a cozy spot, avail offers, and make your date nights easier.</p>
          </div>
        </section>

        {/* Filters row */}
        <section className="cafes-filters">
          <button className="filter-pill">Filter</button>
          <button className="filter-pill">Sort by</button>
          <button className="filter-pill">Book a table</button>
          <button className="filter-pill">Within 5 km</button>
          <button className="filter-pill">Rating 4.0+</button>
          <button className="filter-pill">Couple friendly</button>
          <button className="filter-pill">Live music</button>
        </section>

        {/* Cafes list */}
        <section className="cafes-list">
          <div className="cafes-grid">
            {cafes.map((cafe) => (
              <article key={cafe.id} className="cafe-card">
                <div
                  className="cafe-image"
                  style={{ backgroundImage: `url(${cafe.imageUrl})` }}
                >
                  <div className="cafe-rating">
                    <span>★ {cafe.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="cafe-content">
                  <div className="cafe-title-row">
                    <h3>{cafe.name}</h3>
                    <span className="cafe-price">{cafe.priceForTwo}</span>
                  </div>
                  <p className="cafe-meta">{cafe.cuisines}</p>
                  <p className="cafe-meta">{cafe.location}</p>
                  <p className="cafe-distance">{cafe.distanceKm} km</p>

                  <div className="cafe-offers">
                    <div className="offer-line main-offer">
                      {cafe.mainOffer}
                    </div>
                    {cafe.secondaryOffer && (
                      <div className="offer-line secondary-offer">
                        {cafe.secondaryOffer}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CafesPage;
