import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { Search, SlidersHorizontal, Star, MapPin, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
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
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
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
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600",
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
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600",
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
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600",
    cuisine: "Asian • Fusion",
    rating: 4.4,
    priceForTwo: "₹1200 for two",
    distance: "4.2 km",
    location: "Madhapur",
    hasTableBooking: true,
  },
  {
    id: "6",
    name: "Bookworm Cafe",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600",
    cuisine: "Cafe • Desserts",
    rating: 4.2,
    priceForTwo: "₹500 for two",
    distance: "5.5 km",
    location: "Kondapur",
    hasTableBooking: false,
  },
];

interface CafesPageProps {
  onLogout?: () => void;
}

export default function CafesPage({ onLogout }: CafesPageProps) {
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
    <div className="min-h-screen bg-gray-50/50 pt-20 pb-10">
      {/* ✅ Pass onLogout to TopBar */}
      <TopBar onLogout={onLogout} />

      <main className="container mx-auto max-w-6xl px-4">
        
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-[32px] shadow-sm group">
          <div className="absolute inset-0 bg-black/40 z-10 transition-opacity group-hover:bg-black/30" />
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"
            alt="Date Spots"
            className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex flex-col justify-center p-8 z-20">
            <h1 className="mb-2 text-4xl font-bold text-white tracking-tight">
              Explore Top Date Spots
            </h1>
            <p className="text-lg text-white/90 font-medium">
              Perfect places to take your match
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-2xl">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for restaurants and cafes"
            className="w-full rounded-full border border-gray-200 bg-white py-4 pl-14 pr-6 shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>

          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter);
            return (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={cn(
                  "whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 border",
                  isActive
                    ? "bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-200"
                    : "bg-white border-gray-200 text-gray-600 hover:border-teal-200 hover:text-teal-600"
                )}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Cafe Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockCafes.map((cafe) => (
            <div
              key={cafe.id}
              className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={cafe.image}
                  alt={cafe.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="absolute bottom-4 left-4 z-10">
                  <h3 className="text-xl font-bold text-white drop-shadow-sm tracking-wide">
                    {cafe.name}
                  </h3>
                </div>

                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
                  {cafe.rating} <Star className="h-3 w-3 fill-white" />
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-gray-500">
                      {cafe.cuisine}
                    </p>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                        {cafe.priceForTwo}
                    </span>
                </div>

                <div className="flex items-center justify-between mt-3 pb-3 border-b border-gray-50">
                   <div className="flex items-center gap-1 text-sm text-gray-500">
                       <MapPin className="h-3.5 w-3.5 text-gray-400" />
                       {cafe.location}
                   </div>
                   <div className="text-sm font-semibold text-gray-900">
                       {cafe.distance}
                   </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                   {cafe.hasTableBooking ? (
                     <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600">
                       <CalendarCheck className="h-3.5 w-3.5" />
                       Table booking available
                     </div>
                   ) : (
                     <div className="text-xs text-gray-400">
                        Walk-in only
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}