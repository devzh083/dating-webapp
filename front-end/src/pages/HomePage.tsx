import { toast } from "sonner";
import TopBar from "@/components/layout/TopBar"; 
import NearbyBanner from "@/components/home/NearbyBanner";
import PremiumBanner from "@/components/home/PremiumBanner";
import AnonymousSwipeDeck from "@/components/home/AnonymousSwipeDeck";
import AnonymousReviewsBanner from "@/components/home/AnonymousReviewsBanner";
import SecurityBanner from "@/components/home/SecurityBanner";
import ProfileCompletion from "@/components/home/ProfileCompletion";

/* ---------------- MOCK DATA ---------------- */
const mockAnonymousProfiles = [
  {
    id: "1",
    selfDescription: "A curious soul who finds magic in everyday moments and deep conversations over coffee.",
    vibeTags: ["Calm", "Deep thinker", "Witty"],
    conversationHook: "What song perfectly describes your current chapter in life?",
  },
  {
    id: "2",
    selfDescription: "Adventure seeker by day, stargazer by night. I believe the best stories are yet to be written.",
    vibeTags: ["Adventurous", "Optimistic", "Creative"],
    conversationHook: "What's the most spontaneous thing you've ever done?",
  },
  {
    id: "3",
    selfDescription: "Part philosopher, part comedian. I make playlists for every mood and overthink song lyrics.",
    vibeTags: ["Sarcastic", "Thoughtful", "Music lover"],
    conversationHook: "If you could have dinner with any fictional character, who would it be?",
  },
];

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

interface HomePageProps {
  onLogout?: () => void;
}

const HomePage = ({ onLogout }: HomePageProps) => {
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
                <AnonymousSwipeDeck 
                   profiles={mockAnonymousProfiles}
                   onLike={handleLike}
                   onDislike={handleDislike}
                />
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