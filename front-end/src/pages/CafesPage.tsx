// src/pages/CafesPage.tsx
import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
} from "lucide-react";

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
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
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
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
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
    image:
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400",
    cuisine: "Multi-cuisine • Bar",
    rating: 4.0,
    priceForTwo: "₹1500 for two",
    distance: "3.8 km",
    location: "Gachibowli",
    hasTableBooking: false,
  },
];

export default function CafesPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar userName="User" />

      <main className="container mx-auto max-w-6xl px-4 py-6">
        {/* Hero */}
        <div className="relative mb-8 overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200"
            alt="Dining"
            className="h-64 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          <div className="absolute inset-0 flex flex-col justify-center p-8">
            <h1 className="mb-2 text-3xl font-bold text-white">
              Explore Top Date Spots
            </h1>
            <p className="text-lg text-white/90">
              Perfect places to take your match
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for restaurants and cafes"
            className="w-full rounded-full border border-border bg-card py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>

          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeFilters.includes(filter)
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockCafes.map((cafe) => (
            <div
              key={cafe.id}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={cafe.image}
                  alt={cafe.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-sm text-white">
                  <Star className="h-3 w-3 fill-current" />
                  {cafe.rating}
                </div>
                <div className="absolute bottom-3 left-3 text-lg font-bold text-white drop-shadow">
                  {cafe.name}
                </div>
              </div>

              <div className="p-4">
                <p className="mb-1 text-sm text-muted-foreground">
                  {cafe.cuisine}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {cafe.priceForTwo}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {cafe.distance}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cafe.location}
                </p>

                {cafe.hasTableBooking && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-primary">
                    <Clock className="h-3 w-3" />
                    Table booking available
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
