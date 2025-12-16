import { motion } from "framer-motion";
import { Users, Shield, Star } from "lucide-react";
import { toast } from "sonner";

import TopBar from "@/components/layout/TopBar";
import ProfileCompletion from "@/components/home/ProfileCompletion";
import NearbyBanner from "@/components/home/NearbyBanner";
import PremiumBanner from "@/components/home/PremiumBanner";
import AnonymousProfileCard from "@/components/home/AnonymousProfileCard";
import AnonymousReviewsBanner from "@/components/home/AnonymousReviewsBanner";
import SecurityBanner from "@/components/home/SecurityBanner";

/* ---------------- MOCK DATA ---------------- */

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

const Home = () => {
  const userName = "User";
  const profileCompletion = 36;

  const handleRequestChat = () => {
    toast.success("Chat request sent!", {
      description: "You'll be notified if they accept.",
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* TOP BAR */}
      <TopBar userName={userName} onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-80 xl:w-96 shrink-0 border-r border-border bg-muted/20">
          <div className="p-4 space-y-4">
            <ProfileCompletion percentage={profileCompletion} />
            <NearbyBanner />
            <PremiumBanner />

            {/* Quick stats */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="text-sm font-semibold mb-3">Your Activity</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <span className="block text-xl font-bold text-primary">12</span>
                  <span className="text-xs text-muted-foreground">
                    Requests Sent
                  </span>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <span className="block text-xl font-bold text-primary">5</span>
                  <span className="text-xs text-muted-foreground">Matches</span>
                </div>
              </div>
            </div>

            {/* Trust */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Privacy First</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your identity stays hidden until both match
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* STICKY HEADER */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3 max-w-4xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-end">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Discover</h1>
                <p className="text-xs text-muted-foreground">
                  Connect based on vibes, not looks
                </p>
              </div>
            </div>
          </div>

          {/* PROFILE FEED */}
          <div className="p-4 lg:p-6">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 max-w-6xl">
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

          {/* REVIEWS + SECURITY */}
          <div className="border-t border-border bg-muted/30 px-4 lg:px-6 py-8">
            <div className="max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-6"
              >
                <Star className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Why People Love Us</h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <AnonymousReviewsBanner />
                <SecurityBanner />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM */}
      <div className="lg:hidden px-4 pb-4 space-y-4 bg-muted/30 border-t border-border">
        <ProfileCompletion percentage={profileCompletion} />
        <div className="grid grid-cols-2 gap-4">
          <NearbyBanner />
          <PremiumBanner />
        </div>
      </div>
    </div>
  );
};

export default Home;
