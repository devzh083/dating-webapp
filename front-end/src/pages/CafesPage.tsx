import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------ TYPES ------------------ */
interface Cafe {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  price_for_two: number;
  area: string;
  image: string;
  has_table_booking: boolean;
  pure_veg: boolean;
  serves_alcohol: boolean;
  rooftop: boolean;
}

interface CafesPageProps {
  onLogout?: () => void;
}

/* ------------------ FILTERS ------------------ */
const filters = [
  "Book a table",
  "Rating 4+",
  "Pure Veg",
  "Serves Alcohol",
  "Rooftop",
];

/* ------------------ COMPONENT ------------------ */
export default function CafesPage({ onLogout }: CafesPageProps) {
  const navigate = useNavigate(); // ✅ NEW
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  /* ------------------ FETCH CAFES ------------------ */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/cafes/")
      .then((res) => res.json())
      .then((data) => setCafes(data))
      .catch((err) => console.error("Failed to load cafes", err))
      .finally(() => setLoading(false));
  }, []);

  /* ------------------ FILTER TOGGLE ------------------ */
  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  /* ------------------ FILTER LOGIC ------------------ */
  const filteredCafes = useMemo(() => {
    let result = cafes;

    if (searchQuery) {
      result = result.filter((cafe) =>
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilters.includes("Book a table")) {
      result = result.filter((cafe) => cafe.has_table_booking);
    }

    if (activeFilters.includes("Rating 4+")) {
      result = result.filter((cafe) => cafe.rating >= 4);
    }

    if (activeFilters.includes("Pure Veg")) {
      result = result.filter((cafe) => cafe.pure_veg);
    }

    if (activeFilters.includes("Serves Alcohol")) {
      result = result.filter((cafe) => cafe.serves_alcohol);
    }

    if (activeFilters.includes("Rooftop")) {
      result = result.filter((cafe) => cafe.rooftop);
    }

    return result;
  }, [cafes, searchQuery, activeFilters]);

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-gray-50/50 pt-20 pb-10">
      <TopBar onLogout={onLogout} />

      <main className="container mx-auto max-w-6xl px-4">
        {/* Hero */}
        <div className="relative mb-8 overflow-hidden rounded-[32px]">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"
            className="h-64 w-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
            <h1 className="text-4xl font-bold text-white">
              Explore Top Date Spots
            </h1>
            <p className="text-white/90 text-lg">
              Perfect places to take your match
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cafes"
            className="w-full rounded-full border bg-white py-4 pl-14 pr-6 shadow-sm focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          <button className="flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>

          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-semibold border transition",
                activeFilters.includes(filter)
                  ? "bg-teal-500 text-white border-teal-500"
                  : "bg-white text-gray-600 border-gray-200"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Cafe Grid */}
        {loading ? (
          <p className="text-center text-gray-500">Loading cafes...</p>
        ) : filteredCafes.length === 0 ? (
          <p className="text-center text-gray-500">No cafes found</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCafes.map((cafe) => (
              <div
                key={cafe.id}
                onClick={() => navigate(`/cafes/${cafe.id}/book`)} // ✅ NAVIGATION
                className="cursor-pointer overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-xl transition"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={`http://127.0.0.1:8000${cafe.image}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 bg-emerald-500 px-2 py-1 rounded text-xs text-white font-bold flex items-center gap-1">
                    {cafe.rating}
                    <Star className="h-3 w-3 fill-white" />
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold">{cafe.name}</h3>
                  <p className="text-sm text-gray-500">{cafe.cuisine}</p>

                  <div className="flex justify-between mt-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      {cafe.area}
                    </div>
                    <span className="font-semibold">
                      ₹{cafe.price_for_two} for two
                    </span>
                  </div>

                  <div className="mt-3">
                    {cafe.has_table_booking ? (
                      <span className="text-xs font-bold text-teal-600 flex items-center gap-1">
                        <CalendarCheck className="h-4 w-4" />
                        Tap to book table
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Walk-in only</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
