import { useState } from "react";
import { LayoutDashboard, MessageCircle, Bell, Coffee, Home as HomeIcon } from "lucide-react";
import NearbyBanner from "@/components/home/NearbyBanner";
import PremiumBanner from "@/components/home/PremiumBanner";
import AnonymousSwipeDeck from "@/components/home/AnonymousSwipeDeck";
import AnonymousReviewsBanner from "@/components/home/AnonymousReviewsBanner";
import SecurityBanner from "@/components/home/SecurityBanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  {
    id: "4",
    selfDescription: "Quiet confidence with loud dreams. I find peace in chaos and stories in silence.",
    vibeTags: ["Introspective", "Ambitious", "Gentle"],
    conversationHook: "What's a hill you're willing to die on?",
  },
];

/* ---------------- TOP BAR COMPONENT ---------------- */
const TopBar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-50 shadow-sm">
      {/* Left Placeholder (to balance center text) */}
      <div className="w-24 hidden lg:block"></div>

      {/* Center Title */}
      <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
        The Dating App
      </h1>

      {/* Right Icons */}
      <div className="flex items-center gap-2 lg:gap-6 ml-auto lg:ml-0">
        <button className="p-2.5 rounded-full bg-teal-50 text-teal-600">
          <HomeIcon className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <MessageCircle className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <Coffee className="w-5 h-5" />
        </button>
        <button className="w-9 h-9 ml-2 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
          U
        </button>
      </div>
    </header>
  );
};

/* ---------------- SIDEBAR COMPONENT (RIGHT SIDE) ---------------- */
const Sidebar = () => {
  const completion = 36;

  return (
    // Changed: left-0 to right-0, border-r to border-l
    <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-80 bg-white border-l border-gray-100 hidden lg:flex flex-col p-6 overflow-y-auto z-40">
      
      {/* Profile Stats Widget */}
      <div className="mb-6 p-5 rounded-2xl bg-teal-50/50 border border-teal-100">
         <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-teal-900">Profile Completion</span>
            <span className="text-sm font-extrabold text-teal-600">{completion}%</span>
         </div>
         <div className="w-full h-2.5 bg-teal-200/30 rounded-full overflow-hidden mb-3">
             <div className="h-full bg-teal-500 rounded-full" style={{ width: `${completion}%` }}></div>
         </div>
         <p className="text-xs text-teal-700/70 font-medium leading-relaxed">
            You're not being shown enough. <button className="underline hover:text-teal-900 font-bold decoration-2">Complete profile</button>
         </p>
      </div>

      {/* Banners inside Sidebar */}
      <div className="space-y-6">
        <NearbyBanner />
        <PremiumBanner />
      </div>

    </aside>
  );
};

/* ---------------- MAIN PAGE ---------------- */
const HomePage = () => {
  const handleLike = (profileId: string) => {
    toast.success("Connection request sent!");
  };

  const handleDislike = (profileId: string) => {
    console.log("Pass:", profileId);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-16">
      <TopBar />

      <div className="flex">
        {/* 1. Main Content Area */}
        {/* Changed: lg:ml-80 to lg:mr-80 to make room for right sidebar */}
        <main className="flex-1 lg:mr-80 w-full p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-12">
             
             {/* Swipe Deck Section */}
             <section className="pt-6">
                <AnonymousSwipeDeck 
                   profiles={mockAnonymousProfiles}
                   onLike={handleLike}
                   onDislike={handleDislike}
                />
             </section>

             {/* Banners Below Profiles */}
             <section className="space-y-6 pb-12">
                <div className="flex items-center gap-3 mb-2">
                   <div className="h-8 w-1 bg-teal-500 rounded-full"></div>
                   <h3 className="text-xl font-bold text-gray-900">Why People Love Us</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                   <AnonymousReviewsBanner />
                   <SecurityBanner />
                </div>
             </section>
          </div>
        </main>

        {/* 2. Right Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
};

export default HomePage;