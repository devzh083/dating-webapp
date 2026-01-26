import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react"; 

/* ---------------- COMPONENTS ---------------- */
import TopBar from "@/components/layout/TopBar";
import NearbyBanner from "@/components/home/NearbyBanner";
import PremiumBanner from "@/components/home/PremiumBanner";
import AnonymousSwipeDeck from "@/components/home/AnonymousSwipeDeck";
import ReviewCarousel from "@/components/home/ReviewCarousel";
import SecurityBanner from "@/components/home/SecurityBanner";
import ProfileCompletion from "@/components/home/ProfileCompletion";
// ✅ IMPORT THE NEW BANNER
import ExpertTipsBanner from "@/components/home/ExpertTipsBanner";
import MatchModal from "@/components/match/MatchModal";

/* ---------------- SERVICES & TYPES ---------------- */
import { profileService } from "@/services/profileService";

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

export interface SwipeProfile {
  id: string;
  firstName: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface HomePageProps {
  onLogout?: () => void;
}

/* ---------------- UTILS ---------------- */
const getRandomInterests = (interests: string[], count = 4) => {
  const shuffled = [...interests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, interests.length));
};

/* ================= HOME PAGE ================= */

const HomePage = ({ onLogout }: HomePageProps) => {
  const navigate = useNavigate();

  /* -------- STATE -------- */
  const [profiles, setProfiles] = useState<SwipeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");

  // Match Modal State
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchProfile, setMatchProfile] = useState<SwipeProfile | null>(null);
  const [matchChatId, setMatchChatId] = useState<string | null>(null);

  /* -------- FETCH USER PROFILE -------- */
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const result = await profileService.getProfile();
        if (result.exists && result.data?.firstName) {
          setUserName(result.data.firstName);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUserProfile();
  }, []);

  /* -------- FETCH MATCHES -------- */
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token");

        const res = await fetch("http://127.0.0.1:8000/api/matches/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch matches");

        const data: MatchApiResponse[] = await res.json();

        setProfiles(
          data.map((item, i) => ({
            id: item.email || `p-${i}`,
            firstName: item.profile.firstName,
            selfDescription:
              item.profile.tagline ||
              item.profile.firstName ||
              "No description available",
            conversationHook:
              item.profile.starter || "Tell me about yourself!",
            vibeTags: getRandomInterests(item.profile.interests),
          }))
        );
      } catch (e: any) {
        setError(e.message);
        toast.error("Failed to load matches");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  /* -------- WEBSOCKET REALTIME -------- */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/notifications/?token=${token}`
    );

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "MATCH_CREATED") {
        try {
          const token = localStorage.getItem("access_token");
          if (!token) return;

          // Fetch profile for match modal
          const res = await fetch(
            `http://127.0.0.1:8000/api/profile/${data.from_email}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!res.ok) {
            // Fallback
            setMatchProfile({
              id: data.from_email,
              firstName: data.from_email.split("@")[0],
              selfDescription: "New match!",
              conversationHook: "Say hello!",
              vibeTags: [],
            });
          } else {
            const profile = await res.json();
            setMatchProfile({
              id: data.from_email,
              firstName: profile.firstName || data.from_email.split("@")[0],
              selfDescription:
                profile.tagline || profile.starter || "New match!",
              conversationHook: profile.starter || "Say hello!",
              vibeTags: profile.interests || [],
            });
          }

          setMatchChatId(data.chat_id);
          setShowMatchModal(true);
          toast.success("It's a match! 🎉");
        } catch (error) {
          console.error("Match notification error:", error);
        }
      }
    };

    return () => ws.close();
  }, []);

  /* -------- LIKE / DISLIKE -------- */
  const handleLike = async (profileId: string) => {
    const likedProfile = profiles.find((p) => p.id === profileId);
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch("http://127.0.0.1:8000/api/like/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to_email: profileId }),
      });

      const data = await res.json();

      if (data.status === "matched") {
        setMatchProfile(likedProfile || null);
        setMatchChatId(data.match.chat_id);
        setShowMatchModal(true);
        toast.success("It's a match! 🎉");
      } else {
        toast.success("Like sent!");
      }
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleDislike = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
  };

  const handleMatchComplete = () => {
    setShowMatchModal(false);
    setMatchProfile(null);
    setMatchChatId(null);
    navigate("/chats");
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <TopBar userName={userName} onLogout={onLogout} />

      {/* Match Modal Overlay */}
      {showMatchModal && matchProfile && matchChatId && (
        <MatchModal
          profile={matchProfile}
          chatId={matchChatId}
          onComplete={handleMatchComplete}
        />
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        
        {/* 1. Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 mb-3 sm:mb-4 leading-tight tracking-tight">
            Find Your Vibe, <span className="text-teal-500">{userName}</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Connect based on personality first. Authentic connections start here.
          </p>
        </div>

        {/* 2. Profile Completion Alert (Only visible if incomplete) */}
        <div className="max-w-3xl mx-auto mb-8">
          <ProfileCompletion />
        </div>

        {/* 3. Swipe Deck Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20 max-w-4xl mx-auto">
          <div className="relative">
            {/* Decorative background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-teal-200/20 to-purple-200/20 blur-3xl rounded-full pointer-events-none -z-10" />
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-[40px] border border-gray-100 shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
                <p className="text-gray-500">Finding matches...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500 bg-white rounded-[40px] shadow-sm">{error}</div>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 bg-white rounded-[40px] border border-gray-100 shadow-xl">
                <Heart className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">No more matches</h3>
                <p className="text-gray-500 mt-2">Check back later for more people nearby!</p>
              </div>
            ) : (
              <AnonymousSwipeDeck
                profiles={profiles}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            )}
          </div>
        </div>

        {/* 4. Stats Bar */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-8 mb-12 sm:mb-16 lg:mb-20 max-w-4xl mx-auto">
          {[
            { label: "Active Users", value: "10K+" },
            { label: "Matches Made", value: "50K+" },
            { label: "Success Rate", value: "92%" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-500 mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 5. Info Banners Grid (Replacing Sidebar) */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
          <div className="h-full">
            <NearbyBanner />
          </div>
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl p-1 shadow-xl">
             <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                <PremiumBanner /> 
             </div>
          </div>
        </div>

        {/* ✅ 6. Expert Tips Section */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-20">
          <ExpertTipsBanner />
        </div>

        {/* 7. Success Stories */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <ReviewCarousel />
        </div>

        {/* 8. Security Section */}
        <div className="max-w-5xl mx-auto mb-12 sm:mb-16">
          <SecurityBanner />
        </div>

        {/* 9. Footer Section */}
        <footer className="bg-gray-900 text-white rounded-3xl p-8 sm:p-12 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-white cursor-pointer transition-colors">Press</li>
                <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-white cursor-pointer transition-colors">Safety Center</li>
                <li className="hover:text-white cursor-pointer transition-colors">Guidelines</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-white cursor-pointer transition-colors">Cookie Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Intellectual Property</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Social</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">Instagram</li>
                <li className="hover:text-white cursor-pointer transition-colors">Twitter / X</li>
                <li className="hover:text-white cursor-pointer transition-colors">Facebook</li>
                <li className="hover:text-white cursor-pointer transition-colors">TikTok</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p className="mb-2">© 2026 The Dating App. All rights reserved.</p>
            <p>Made with ❤️ for genuine connections.</p>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default HomePage;