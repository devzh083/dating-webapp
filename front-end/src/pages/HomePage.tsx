import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import TopBar from "../components/TopBar";

// Lovable-style components
import { ProfileCompletion } from "../components/home/ProfileCompletion";
import { MatchCard } from "../components/home/MatchCard";
import { NearbyBanner } from "../components/home/NearbyBanner";
import { PremiumBanner } from "../components/home/PremiumBanner";

type HomePageProps = {
  isLoggedIn: boolean;
  onLogout: () => void;
};

// mock data (same as Lovable, safe placeholder)
const mockMatches = [
  {
    id: "1",
    name: "Sarah",
    age: 26,
    distance: "2 km away",
    bio: "Coffee lover ☕ | Travel enthusiast ✈️ | Dog mom 🐕",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop",
    ],
    interests: ["Travel", "Coffee", "Dogs", "Photography"],
  },
  {
    id: "2",
    name: "Emma",
    age: 24,
    distance: "5 km away",
    bio: "Yoga instructor 🧘 | Foodie 🍜 | Nature lover 🌿",
    photos: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop",
    ],
    interests: ["Yoga", "Food", "Nature", "Hiking"],
  },
  {
    id: "3",
    name: "Maya",
    age: 28,
    distance: "3 km away",
    bio: "Artist 🎨 | Music lover 🎵 | Bookworm 📚",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop",
    ],
    interests: ["Art", "Music", "Reading", "Movies"],
  },
];

const HomePage: React.FC<HomePageProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null
  );

  // later replace with real profile data
  const userName = "U";
  const profileCompletion = 75;

  // ✅ KEEP existing locked behavior (same as ChatsPage)
  if (!isLoggedIn) {
    return (
      <div className="app-shell">
        <TopBar isLoggedIn={isLoggedIn} onLogout={onLogout} />
        <main className="home-main locked-main">
          <div className="locked-card">
            <h2>Login to see your matches</h2>
            <p>You need to be logged in to discover people nearby.</p>
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

  const handleSwipe = (direction: "left" | "right") => {
    setExitDirection(direction);
    setTimeout(() => {
      setCurrentMatchIndex((prev) => (prev + 1) % mockMatches.length);
      setExitDirection(null);
    }, 300);
  };

  const currentMatch = mockMatches[currentMatchIndex];

  // ✅ Lovable layout
  return (
    <div className="min-h-screen bg-background">
      <TopBar isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="container px-4 md:px-8 py-6 max-w-4xl mx-auto">
        <ProfileCompletion percentage={profileCompletion} />

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Discover
          </h2>

          <div className="relative h-[500px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <MatchCard
                key={currentMatch.id}
                match={currentMatch}
                onLike={() => handleSwipe("right")}
                onPass={() => handleSwipe("left")}
                exitDirection={exitDirection}
              />
            </AnimatePresence>
          </div>
        </section>

        <NearbyBanner />
        <PremiumBanner />
      </main>
    </div>
  );
};

export default HomePage;
