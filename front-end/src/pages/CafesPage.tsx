import React, { useState } from "react";
import { Search, SlidersHorizontal, Star, MapPin, Clock } from "lucide-react";
import TopBar from "@/components/layout/TopBar";

const filters = [
  "Book a table",
  "Within 5km",
  "Rating 4+",
  "Pure Veg",
  "Serves Alcohol",
  "Rooftop",
];

const mockCafes = [
  {
    id: "1",
    name: "The Coffee House",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
    cuisine: "Cafe • Continental",
    rating: 4.5,
    priceForTwo: "₹800 for two",
    distance: "1.2 km",
    location: "Banjara Hills",
    hasTableBooking: true,
  },
  {
    id: "2",
    name: "Romantic Rooftop",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    cuisine: "Italian • Pizza",
    rating: 4.3,
    priceForTwo: "₹1200 for two",
    distance: "2.5 km",
    location: "Jubilee Hills",
    hasTableBooking: true,
  },
  {
    id: "3",
    name: "Garden Bistro",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400",
    cuisine: "Multi-cuisine • Bar",
    rating: 4.0,
    priceForTwo: "₹1500 for two",
    distance: "3.8 km",
    location: "Gachibowli",
    hasTableBooking: false,
  },
  {
    id: "4",
    name: "Cozy Corner Cafe",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400",
    cuisine: "Cafe • Bakery",
    rating: 4.7,
    priceForTwo: "₹600 for two",
    distance: "0.8 km",
    location: "Hitech City",
    hasTableBooking: true,
  },
  {
    id: "5",
    name: "Sunset Lounge",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400",
    cuisine: "Asian • Fusion",
    rating: 4.4,
    priceForTwo: "₹2000 for two",
    distance: "4.2 km",
    location: "Madhapur",
    hasTableBooking: true,
  },
  {
    id: "6",
    name: "Bookworm Cafe",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
    cuisine: "Cafe • Desserts",
    rating: 4.2,
    priceForTwo: "₹500 for two",
    distance: "1.5 km",
    location: "Kondapur",
    hasTableBooking: false,
  },
];

interface CafesPageProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const CafesPage: React.FC<CafesPageProps> = ({ isLoggedIn, onLogout }) => {
  // App.tsx should already redirect if !isLoggedIn,
  // but we keep this in case the route is hit directly.
  if (!isLoggedIn) {
    return null;
  }

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  // TODO: fetch real user name from profile once backend is ready
  const userName = "U";

  return (
    <div className="min-h-screen bg-background">
      <TopBar userName={userName} onLogout={onLogout} />

      <main className="container px-4 md:px-8 py-6 max-w-6xl mx-auto">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200"
            alt="Dining"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          <div className="absolute inset-0 flex flex-col justify-center p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Explore Top Date Spots
            </h1>
            <p className="text-white/90 text-lg">
              Perfect places to take your match
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for restaurants and cafes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground hover:bg-muted transition-colors whitespace-nowrap">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilters.includes(filter)
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Cafe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCafes.map((cafe) => (
            <div
              key={cafe.id}
              className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow cursor-pointer group"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={cafe.image}
                  alt={cafe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md text-sm font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  {cafe.rating}
                </div>
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white font-bold text-lg drop-shadow-lg">
                    {cafe.name}
                  </h3>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {cafe.cuisine}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">
                    {cafe.priceForTwo}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {cafe.distance}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {cafe.location}
                </p>
                {cafe.hasTableBooking && (
                  <div className="flex items-center gap-1 mt-3 text-primary text-sm">
                    <Clock className="w-3 h-3" />
                    <span>Table booking available</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CafesPage;
