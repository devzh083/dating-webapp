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

      // Endpoint to receive the story review
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 md:pt-20">
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
        
        {/* 1. Hero Section */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-2 md:mb-4 leading-tight tracking-tight px-2">
            Find Your Vibe, <span className="text-teal-500 block md:inline">{userName}</span>
          </h1>
          <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Connect based on personality first. Authentic connections start here.
          </p>
        </div>

        {/* 2. Swipe Deck Section (MOVED UP) */}
        <div className="mb-12 md:mb-20 max-w-4xl mx-auto">
          <div className="relative">
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

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-8 mb-12 md:mb-16 max-w-4xl mx-auto">
          {[
            { label: "Active Users", value: "10K+" },
            { label: "Matches Made", value: "50K+" },
            { label: "Success Rate", value: "92%" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl md:rounded-3xl p-3 md:p-8 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-500 mb-1 md:mb-2">
                {stat.value}
              </div>
              <div className="text-[10px] md:text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 4. Profile Completion Alert (RESTRUCTURED: Moved below Swipe Deck/Stats) */}
        <div className="max-w-3xl mx-auto mb-16 md:mb-20">
          <ProfileCompletion />
        </div>

        {/* 5. Info Banners Grid (Stack on Mobile, Grid on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto mb-16">
          <div className="h-full">
            <NearbyBanner />
          </div>
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-rose-500 rounded-[24px] p-1 shadow-xl">
             <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-[20px] p-1 text-white">
                <PremiumBanner /> 
             </div>
          </div>
        </div>

        {/* 6. Expert Tips Section */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-20">
          <ExpertTipsBanner />
        </div>

        {/* 7. Success Stories */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <ReviewCarousel />
        </div>

        {/* 8. NEW: WRITE YOUR SUCCESS STORY SECTION */}
        <div className="max-w-3xl mx-auto mb-16 sm:mb-24 px-2">
          <div className="bg-gradient-to-br from-white to-teal-50/50 rounded-[32px] p-6 md:p-10 shadow-lg border border-teal-100 relative overflow-hidden">
             
             {/* Decorative Background Icon */}
             <PenLine className="absolute top-6 right-6 w-24 h-24 text-teal-100/50 -rotate-12 pointer-events-none opacity-50 md:opacity-100" />

             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                    <Heart className="w-5 h-5 fill-current" />
                 </div>
                 <h2 className="text-xl md:text-3xl font-black text-gray-900 leading-tight">Found your person?</h2>
               </div>
               
               <p className="text-gray-600 mb-6 text-sm md:text-base max-w-lg">
                 Share your success story with us! Once approved by our team, your story will be featured here to inspire others.
               </p>

               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                 <textarea
                    className="w-full p-4 rounded-xl outline-none min-h-[120px] bg-transparent resize-none text-gray-700 placeholder:text-gray-400 text-sm md:text-base"
                    placeholder="Tell us how you met... (e.g., 'We matched on The Dating App and our first date was...')"
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                 />
                 <div className="flex justify-end p-2 border-t border-gray-100 mt-2">
                   <button
                      onClick={handleSubmitStory}
                      disabled={submittingStory || !storyText.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-teal-200 w-full md:w-auto justify-center"
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
               
               <p className="text-xs text-gray-400 mt-3 text-center">
                 By submitting, you agree to let us share your story on our platform.
               </p>
             </div>
          </div>
        </div>

        {/* 9. Security Section */}
        <div className="max-w-5xl mx-auto mb-12 sm:mb-16">
          <SecurityBanner />
        </div>

        {/* 10. Footer Section */}
        <footer className="bg-gray-900 text-white rounded-[32px] p-8 md:p-12 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold mb-4 text-sm md:text-lg">Company</h4>
              <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-white cursor-pointer transition-colors">Press</li>
                <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm md:text-lg">Support</h4>
              <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-white cursor-pointer transition-colors">Safety Center</li>
                <li className="hover:text-white cursor-pointer transition-colors">Guidelines</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm md:text-lg">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-white cursor-pointer transition-colors">Cookie Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Intellectual Property</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm md:text-lg">Social</h4>
              <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">Instagram</li>
                <li className="hover:text-white cursor-pointer transition-colors">Twitter / X</li>
                <li className="hover:text-white cursor-pointer transition-colors">Facebook</li>
                <li className="hover:text-white cursor-pointer transition-colors">TikTok</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs md:text-sm text-gray-500">
            <p className="mb-2">© 2026 The Dating App. All rights reserved.</p>
            <p>Made with ❤️ for genuine connections.</p>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default HomePage;