import { useEffect, useState } from "react";
import { toast } from "sonner";
import TopBar from "@/components/layout/TopBar"; 
import NearbyBanner from "@/components/home/NearbyBanner";
import PremiumBanner from "@/components/home/PremiumBanner";
import AnonymousSwipeDeck from "@/components/home/AnonymousSwipeDeck";
import AnonymousReviewsBanner from "@/components/home/AnonymousReviewsBanner";
import SecurityBanner from "@/components/home/SecurityBanner";
import ProfileCompletion from "@/components/home/ProfileCompletion";

// API Response Interface
interface MatchApiResponse {
  email: string;
  similarity: number;
  distance_km: null;
  profile: {
    firstName: string;
    tagline?: string;
    starter?: string;
    interests: string[];
  };
}

// Swipe Profile Interface (matches AnonymousSwipeDeck)
interface SwipeProfile {
  id: string;
  firstName: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface HomePageProps {
  onLogout?: () => void;
}

// Utility to get random interests
const getRandomInterests = (interests: string[], count: number = 4): string[] => {
  const shuffled = [...interests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, interests.length));
};

// Shared Gradient
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";

/* ---------------- SIDEBAR COMPONENT ---------------- */
const Sidebar = () => {
  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-80 bg-white border-l border-gray-100 hidden lg:flex flex-col p-6 overflow-y-auto z-40">
      <ProfileCompletion />
      <div className="space-y-6">
        <NearbyBanner />
        <PremiumBanner />
      </div>
    </aside>
  );
};

/* ---------------- MAIN PAGE ---------------- */
const HomePage = ({ onLogout }: HomePageProps) => {
  const [profiles, setProfiles] = useState<SwipeProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No access token found. Please login again.");
        }

        const response = await fetch("http://127.0.0.1:8000/api/matches/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Helpful diagnostics while debugging
          const text = await response.text();
          console.error("Bad response body:", text);
          throw new Error(`Failed to fetch matches: ${response.status} ${response.statusText}`);
        }

        const data: MatchApiResponse[] = await response.json();

        const transformedProfiles: SwipeProfile[] = data.map((item, index) => ({
          id: item.email || `profile-${index}`,
          firstName: item.profile.firstName,
          selfDescription:
            item.profile.tagline || item.profile.firstName || "No description available",
          conversationHook: item.profile.starter || "Tell me about yourself!",
          vibeTags: getRandomInterests(item.profile.interests || [], 4),
        }));

        setProfiles(transformedProfiles);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError(err instanceof Error ? err.message : "Failed to load matches");
        toast.error("Failed to load matches. Please try again.");
      } finally {
        setLoading(false);
      }
    };


    fetchMatches();
  }, []);

  const handleLike = (profileId: string) => {
    toast.success("Connection request sent!");
  };

  const handleDislike = (profileId: string) => {
    console.log("Pass:", profileId);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-16">
      <TopBar userName="User" onLogout={onLogout} />

      <div className="flex">
        {/* Main Content Area */}
        <main className="flex-1 lg:mr-80 w-full p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Swipe Deck Section */}
            <section className="pt-6 flex justify-center">
              {loading ? (
                <div className="flex flex-col items-center py-20 text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mb-4"></div>
                  <p className="text-lg">Loading your matches...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center py-20 text-center max-w-md">
                  <div className="text-4xl mb-4">😔</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-medium"
                  >
                    Retry
                  </button>
                </div>
              ) : profiles.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center max-w-md">
                  <div className="text-4xl mb-4">✨</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">No matches yet</p>
                  <p className="text-gray-500 mb-6">Complete your profile to see potential matches</p>
                </div>
              ) : (
                <AnonymousSwipeDeck
                  profiles={profiles}
                  onLike={handleLike}
                  onDislike={handleDislike}
                />
              )}
            </section>

            {/* Banners Below Profiles */}
            <section className="space-y-6 pb-12">
              <div className="flex items-center gap-3 mb-2">
                {/* Accent Line using Gradient */}
                <div className={`h-8 w-1.5 rounded-full ${PRIMARY_GRADIENT}`}></div>
                <h3 className="text-xl font-bold text-gray-900">Why People Love Us</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <AnonymousReviewsBanner />
                <SecurityBanner />
              </div>
            </section>
          </div>
        </main>

        {/* Right Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
};

export default HomePage;
