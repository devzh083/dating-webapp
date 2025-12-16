import { motion } from "framer-motion";
import { Users, Sparkles } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import ProfileCompletion from "@/components/home/ProfileCompletion";
import NearbyBanner from "@/components/home/NearbyBanner";
import PremiumBanner from "@/components/home/PremiumBanner";
import AnonymousProfileCard from "@/components/home/AnonymousProfileCard";
import AnonymousReviewsBanner from "@/components/home/AnonymousReviewsBanner";
import SecurityBanner from "@/components/home/SecurityBanner";
import { toast } from "sonner";

/* ---------------- MOCK DATA (SAME AS LOVABLE) ---------------- */

const mockAnonymousProfiles = [
  {
    id: "1",
    selfDescription:
      "A curious soul who finds magic in everyday moments and deep conversations over coffee.",
    vibeTags: ["Calm", "Deep thinker", "Witty"],
    conversationHook:
      "If you could have dinner with any fictional character, who would it be and why?",
  },
  {
    id: "2",
    selfDescription:
      "Adventure seeker by day, stargazer by night. I believe the best stories are yet to be written.",
    vibeTags: ["Adventurous", "Optimistic", "Creative"],
    conversationHook: "What's the most spontaneous thing you've ever done?",
  },
  {
    id: "3",
    selfDescription:
      "Part philosopher, part comedian. I make playlists for every mood and overthink song lyrics.",
    vibeTags: ["Sarcastic", "Thoughtful", "Music lover"],
    conversationHook:
      "What song perfectly describes your current chapter in life?",
  },
  {
    id: "4",
    selfDescription:
      "Quiet confidence with loud dreams. I find peace in chaos and stories in silence.",
    vibeTags: ["Introspective", "Ambitious", "Gentle"],
    conversationHook:
      "What's something you've been wanting to try but haven't yet?",
  },
];

/* ---------------- PAGE ---------------- */

const HomePage = () => {
  const userName = "User"; // mock, same as Lovable
  const profileCompletion = 36; // mock percentage

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/";
  };

  const handleRequestChat = () => {
    toast.success("Chat request sent!", {
      description: "You'll be notified if they accept.",
    });
  };

  return (
    <div className="min-h-screen">
      {/* TOP BAR */}
      <TopBar userName={userName} onLogout={handleLogout} />

      {/* HERO SECTION */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Anonymous Connections
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-2">
              Discover Real Connections
            </h1>

            <p className="text-muted-foreground max-w-xl mx-auto">
              No photos, no names — just genuine personalities.
            </p>
          </motion.div>

          {/* MAIN GRID */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              <ProfileCompletion percentage={profileCompletion} />
              <NearbyBanner />
              <PremiumBanner />
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <div>
                    <h2 className="font-bold">Discover People</h2>
                    <p className="text-sm text-muted-foreground">
                      Based on vibes, not looks
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {mockAnonymousProfiles.map((profile, index) => (
                  <AnonymousProfileCard
                    key={profile.id}
                    profile={profile}
                    index={index}
                    onRequestChat={handleRequestChat}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS + SECURITY */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8">
            <AnonymousReviewsBanner />
            <SecurityBanner />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
