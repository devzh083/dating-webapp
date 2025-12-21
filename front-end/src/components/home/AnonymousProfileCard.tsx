import { MessageCircle, Quote, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnonymousProfile {
  id: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface AnonymousProfileCardProps {
  profile?: AnonymousProfile; // Marked as optional to prevent TS errors
}

/* ---------- ANIMATED AVATAR ---------- */
const avatarVariants = [
  "from-violet-500 to-fuchsia-600",
  "from-cyan-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-rose-500 to-pink-600",
];

const AnimatedAvatar = ({ index }: { index: number }) => {
  // Safety check for index
  const safeIndex = (typeof index === 'number' && !isNaN(index)) ? index : 0;
  const gradient = avatarVariants[safeIndex % avatarVariants.length] || avatarVariants[0];

  return (
    <div className="relative group">
      <div className={cn(
        "absolute inset-0 rounded-[2.5rem] bg-gradient-to-br blur-2xl opacity-40 animate-pulse", 
        gradient
      )} />
      
      <div className={cn(
        "relative h-36 w-36 rounded-[2.5rem] bg-gradient-to-br shadow-2xl flex items-center justify-center transform transition-transform duration-700 group-hover:scale-105",
        gradient
      )}>
        <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] backdrop-blur-[1px]" />
        <Sparkles className="w-12 h-12 text-white/90 drop-shadow-md" />

        <div className="absolute -bottom-3 -right-3 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-100">
           <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
           </span>
           <span className="text-xs font-bold text-gray-700">Online</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- MAIN CARD ---------- */
const AnonymousProfileCard = ({ profile }: AnonymousProfileCardProps) => {
  // 🛡️ CRITICAL SAFETY GUARD: If profile is missing, render nothing (prevents white screen)
  if (!profile) return null;

  // Safely extract values with defaults
  const { 
    id = "0", 
    selfDescription = "No description available.", 
    vibeTags = [], 
    conversationHook = "..." 
  } = profile;

  const colorIndex = id.length;

  return (
    <div className="relative w-full h-[400px] rounded-[40px] bg-white shadow-xl shadow-gray-200/50 border border-white overflow-hidden p-8 select-none">
      
      <div className="h-full grid grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Identity */}
        <div className="col-span-4 flex flex-col items-center justify-center border-r border-gray-50 pr-4">
          <div className="mb-6">
            <AnimatedAvatar index={colorIndex} />
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
              Anonymous
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
              Based on vibes
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Content */}
        <div className="col-span-8 flex flex-col h-full">
          
          <div className="flex-1 flex flex-col justify-center">
            {/* Bio */}
            <div className="relative pl-6 mb-6">
              <Quote className="absolute -top-2 left-0 w-6 h-6 text-gray-200 transform -scale-x-100" />
              <p className="text-gray-700 text-lg font-medium leading-relaxed italic line-clamp-3">
                {selfDescription}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pl-2">
              {vibeTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Starter */}
          <div className="mt-auto bg-gradient-to-r from-teal-50/80 to-emerald-50/80 rounded-2xl p-5 border border-teal-100 flex items-center gap-4">
            <div className="p-2 bg-white rounded-full shadow-sm shrink-0 text-teal-600">
               <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-extrabold text-teal-600 uppercase tracking-wider mb-1">
                Conversation Starter
              </span>
              <p className="text-teal-900 text-sm font-bold leading-snug truncate">
                "{conversationHook}"
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnonymousProfileCard;