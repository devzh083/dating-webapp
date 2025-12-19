import { motion } from "framer-motion";
import { MessageCircle, Quote, Sparkles } from "lucide-react";

interface AnonymousProfile {
  id: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface AnonymousProfileCardProps {
  profile: AnonymousProfile;
}

/* ---------- AVATAR ---------- */
const avatarVariants = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-rose-500 to-pink-500",
];

const AnimatedAvatar = ({ index }: { index: number }) => {
  const gradient = avatarVariants[index % avatarVariants.length];

  return (
    <div className={`relative h-24 w-24 rounded-3xl bg-gradient-to-br ${gradient} p-1 shadow-inner`}>
      <div className="absolute inset-0.5 rounded-[22px] bg-white/10 backdrop-blur-sm border border-white/20" />
      <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 shadow-md border-2 border-white">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
    </div>
  );
};

/* ---------- CARD ---------- */
const AnonymousProfileCard = ({ profile }: AnonymousProfileCardProps) => {
  // Use a pseudo-random index based on ID length for color variety
  const colorIndex = profile.id.length;

  return (
    <div className="relative w-full h-[520px] rounded-[32px] bg-white shadow-xl border border-gray-100 overflow-hidden flex flex-col items-center p-6 select-none">
      
      {/* Header Info */}
      <div className="mt-4 mb-3">
        <AnimatedAvatar index={colorIndex} />
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
          Anonymous
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </h3>
      </div>

      {/* Bio / Quote */}
      <div className="w-full px-2 mb-6">
        <div className="relative text-center">
          <Quote className="absolute -top-2 left-0 w-4 h-4 text-gray-300 transform -scale-x-100" />
          <p className="text-gray-600 text-[15px] leading-relaxed italic px-6">
            {profile.selfDescription}
          </p>
          <Quote className="absolute -bottom-2 right-0 w-4 h-4 text-gray-300" />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {profile.vibeTags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold tracking-wide"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Conversation Starter Box */}
      <div className="w-full mt-auto bg-teal-50 rounded-2xl p-4 border border-teal-100">
        <div className="flex items-center gap-2 mb-2 text-teal-600 text-xs font-bold uppercase tracking-wider">
          <MessageCircle className="w-3.5 h-3.5" />
          Conversation Starter
        </div>
        <p className="text-teal-900 text-sm font-medium leading-snug">
          "{profile.conversationHook}"
        </p>
      </div>

      {/* Footer Note */}
      <div className="mt-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
        Identity revealed after mutual match
      </div>
    </div>
  );
};

export default AnonymousProfileCard;