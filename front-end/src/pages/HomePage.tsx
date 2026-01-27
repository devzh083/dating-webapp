import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Heart, Send, PenLine } from "lucide-react"; 

/* ---------------- COMPONENTS ---------------- */
import TopBar from "@/components/layout/TopBar";
import NearbyBanner from "@/components/home/NearbyBanner";
import PremiumBanner from "@/components/home/PremiumBanner";
import AnonymousSwipeDeck from "@/components/home/AnonymousSwipeDeck";
import ReviewCarousel from "@/components/home/ReviewCarousel";
import SecurityBanner from "@/components/home/SecurityBanner";
import ProfileCompletion from "@/components/home/ProfileCompletion";
import ExpertTipsBanner from "@/components/home/ExpertTipsBanner";
import MatchModal from "@/components/match/MatchModal";
import Footer from "@/components/layout/Footer"; 

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

  // Story Submission State
  const [storyText, setStoryText] = useState("");
  const [submittingStory, setSubmittingStory] = useState(false);

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

  /* -------- SUBMIT STORY HANDLER -------- */
  const handleSubmitStory = async () => {
    if (!storyText.trim()) {
      toast.error("Please write your story first!");
      return;
    }

    setSubmittingStory(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please sign in to submit a story");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/reviews/submit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: storyText }),
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      toast.success("Story submitted for approval! Thank you ❤️");
      setStoryText(""); // Clear input
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit story. Please try again.");
    } finally {
      setSubmittingStory(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 md:pt-20 overflow-x-hidden">
      <TopBar userName={userName} onLogout={onLogout} />

      {/* Match Modal Overlay */}
      {showMatchModal && matchProfile && matchChatId && (
        <MatchModal
          profile={matchProfile}
          chatId={matchChatId}
          onComplete={handleMatchComplete}
        />
      )}

      {/* Responsive Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        
        {/* 1. Hero Section (Fixed Spacing Issue) */}
        <div className="text-center mb-10 md:mb-16 px-2">
          {/* Changed 'tracking-tight' to normal to prevent letter clipping */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4 leading-tight">
            Find Your Vibe, <br className="hidden xs:block md:hidden" />
            <span className="text-teal-500 inline-flex items-center gap-2 flex-wrap justify-center">
              {userName}
              {/* Added Heart Icon exactly like your screenshot */}
              <Heart className="w-8 h-8 md:w-12 md:h-12 fill-current text-teal-500" />
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect based on personality first. Authentic connections start here.
          </p>
        </div>

        {/* 2. Swipe Deck Section */}
        <div className="mb-12 md:mb-20 max-w-md md:max-w-4xl mx-auto w-full">
          <div className="relative">
            {/* Background Blob - Hidden on small mobile to improve performance */}
            <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-teal-200/20 to-purple-200/20 blur-3xl rounded-full pointer-events-none -z-10" />
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px] w-full bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-xl p-4">
                <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-teal-500 mb-4"></div>
                <p className="text-sm md:text-base text-gray-500 font-medium">Finding matches...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 px-4 text-red-500 bg-white rounded-[32px] md:rounded-[40px] shadow-sm border border-red-50 text-sm md:text-base">
                {error}
              </div>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] w-full text-center p-8 bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-xl">
                <Heart className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-gray-900">No more matches</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-[200px] md:max-w-none mx-auto">
                  Check back later for more people nearby!
                </p>
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

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-8 mb-12 md:mb-16 max-w-4xl mx-auto px-2 md:px-0">
          {[
            { label: "Active Users", value: "10K+" },
            { label: "Matches Made", value: "50K+" },
            { label: "Success Rate", value: "92%" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-lg sm:text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-500 mb-1 md:mb-2">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-medium whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* 4. Profile Completion Alert */}
        <div className="max-w-3xl mx-auto mb-16 md:mb-20 px-2 md:px-0">
          <ProfileCompletion />
        </div>

        {/* 5. Info Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto mb-16 px-2 md:px-0">
          <div className="h-full min-h-[180px]">
            <NearbyBanner />
          </div>
          <div className="h-full min-h-[180px] flex items-center justify-center bg-gradient-to-br from-orange-500 to-rose-500 rounded-[24px] p-1 shadow-xl">
             <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-[20px] p-1 text-white flex flex-col justify-center">
                <PremiumBanner /> 
             </div>
          </div>
        </div>

        {/* 6. Expert Tips Section */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-20 px-2 md:px-0">
          <ExpertTipsBanner />
        </div>

        {/* 7. Success Stories */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <ReviewCarousel />
        </div>

        {/* 8. NEW: WRITE YOUR SUCCESS STORY SECTION */}
        <div className="max-w-3xl mx-auto mb-16 sm:mb-24 px-4 md:px-0">
          <div className="bg-gradient-to-br from-white to-teal-50/50 rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-lg border border-teal-100 relative overflow-hidden">
             
             {/* Decorative Background Icon */}
             <PenLine className="absolute top-4 right-4 md:top-6 md:right-6 w-16 h-16 md:w-24 md:h-24 text-teal-100/50 -rotate-12 pointer-events-none opacity-50 md:opacity-100" />

             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-3 md:mb-4">
                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                    <Heart className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                 </div>
                 <h2 className="text-lg md:text-3xl font-black text-gray-900 leading-tight">Found your person?</h2>
               </div>
               
               <p className="text-gray-600 mb-6 text-xs md:text-base max-w-lg leading-relaxed">
                 Share your success story with us! Once approved by our team, your story will be featured here to inspire others.
               </p>

               <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                 <textarea
                    className="w-full p-3 md:p-4 rounded-lg md:rounded-xl outline-none min-h-[100px] md:min-h-[120px] bg-transparent resize-none text-gray-700 placeholder:text-gray-400 text-sm md:text-base"
                    placeholder="Tell us how you met... (e.g., 'We matched on The Dating App and our first date was...')"
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                 />
                 <div className="flex justify-end p-2 border-t border-gray-100 mt-2">
                   <button
                      onClick={handleSubmitStory}
                      disabled={submittingStory || !storyText.trim()}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 bg-teal-500 text-white rounded-lg md:rounded-xl font-bold text-sm hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-teal-200"
                   >
                      {submittingStory ? (
                        <>Sending...</>
                      ) : (
                        <>
                          Submit Story <Send className="w-4 h-4" />
                        </>
                      )}
                   </button>
                 </div>
               </div>
               
               <p className="text-[10px] md:text-xs text-gray-400 mt-3 text-center">
                 By submitting, you agree to let us share your story on our platform.
               </p>
             </div>
          </div>
        </div>

        {/* 9. Security Section */}
        <div className="max-w-5xl mx-auto mb-12 sm:mb-16 px-2 md:px-0">
          <SecurityBanner />
        </div>

        {/* 10. Footer Section */}
        <Footer />

      </main>
    </div>
  );
};

export default HomePage;