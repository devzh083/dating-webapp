import { useEffect, useState } from "react";
import { toast } from "sonner";
import TopBar from "@/components/layout/TopBar";
import NearbyBanner from "@/components/home/NearbyBanner";
import PremiumBanner from "@/components/home/PremiumBanner";
import AnonymousSwipeDeck from "@/components/home/AnonymousSwipeDeck";
import ReviewCarousel from "@/components/home/ReviewCarousel"; // ✅ The new carousel
import SecurityBanner from "@/components/home/SecurityBanner";
import ProfileCompletion from "@/components/home/ProfileCompletion";
import { useNavigate } from "react-router-dom";
import MatchModal from "@/components/match/MatchModal";

/* ---------------- TYPES ---------------- */

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

/* ---------------- UTILS ---------------- */

const getRandomInterests = (interests: string[], count = 4) => {
  const shuffled = [...interests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, interests.length));
};

const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";

/* ---------------- SIDEBAR ---------------- */

const Sidebar = () => (
  <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-80 bg-white border-l border-gray-100 hidden lg:flex flex-col p-6 overflow-y-auto z-40">
    <ProfileCompletion />
    <div className="space-y-6">
      <NearbyBanner />
      <PremiumBanner />
    </div>
  </aside>
);

/* ================= HOME PAGE ================= */

const HomePage = ({ onLogout }: HomePageProps) => {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<SwipeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchProfile, setMatchProfile] = useState<SwipeProfile | null>(null);
  const [matchChatId, setMatchChatId] = useState<string | null>(null);

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
            console.warn("Profile fetch failed, using fallback");
            // Fallback - show modal with basic info
            setMatchProfile({
              id: data.from_email,
              firstName: data.from_email.split("@")[0], // Extract name from email
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
          // Emergency fallback
          setMatchProfile({
            id: data.from_email,
            firstName: data.from_email.split("@")[0],
            selfDescription: "Congratulations! You have a new match.",
            conversationHook: "Start chatting!",
            vibeTags: [],
          });
          setMatchChatId(data.chat_id);
          setShowMatchModal(true);
          toast.success("New match! 🎉");
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
        // Show modal for User B (who triggered the like)
        setMatchProfile(likedProfile || null);
        setMatchChatId(data.match.chat_id); // Use data.match.chat_id
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

  /* -------- MATCH MODAL COMPLETE -------- */

  const handleMatchComplete = () => {
    setShowMatchModal(false);
    setMatchProfile(null);
    setMatchChatId(null);

    // Navigate to chats page WITH chat_id
    if (matchChatId) {
      navigate("/chats");
    } else {
      navigate("/chats");
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-16">
      <TopBar userName="User" onLogout={onLogout} />

      {/* ✅ This is the part that caused the error - now the variables exist! */}
      {showMatchModal && matchProfile && matchChatId && (
        <MatchModal
          profile={matchProfile}
          chatId={matchChatId} // ✅ Pass chatId
          onComplete={handleMatchComplete}
        />
      )}

      <div className="flex">
        <main className="flex-1 lg:mr-80 w-full p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-12">
            <section className="pt-6 flex justify-center">
              {loading ? (
                <div className="py-20 text-gray-500">Loading...</div>
              ) : error ? (
                <div className="py-20">{error}</div>
              ) : profiles.length === 0 ? (
                <div className="py-20">No matches yet</div>
              ) : (
                <AnonymousSwipeDeck
                  profiles={profiles}
                  onLike={handleLike}
                  onDislike={handleDislike}
                />
              )}
            </section>

            {/* ✅ NEW DESIGN SECTION */}
            <section className="space-y-8 pb-12">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-1.5 rounded-full ${PRIMARY_GRADIENT}`} />
                <h3 className="text-xl font-bold">Why People Love Us</h3>
              </div>
              
              {/* Stacked Layout instead of Grid */}
              <div className="flex flex-col gap-8">
                {/* 1. Full width Carousel */}
                <ReviewCarousel />

                {/* 2. Full width Security Banner */}
                <SecurityBanner />
              </div>
            </section>
          </div>
        </main>

        <Sidebar />
      </div>
    </div>
  );
};

export default HomePage;