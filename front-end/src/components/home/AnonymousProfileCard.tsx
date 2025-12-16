import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnonymousProfile {
  id: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface AnonymousProfileCardProps {
  profile: AnonymousProfile;
  onRequestChat: () => void;
  index?: number;
}

/* ---------- AVATAR VARIANTS (LOVABLE STYLE) ---------- */

const avatarVariants = [
  { gradient: "from-violet-500 via-purple-500 to-fuchsia-500" },
  { gradient: "from-cyan-500 via-teal-500 to-emerald-500" },
  { gradient: "from-orange-500 via-amber-500 to-yellow-500" },
  { gradient: "from-rose-500 via-pink-500 to-red-500" },
  { gradient: "from-blue-500 via-indigo-500 to-violet-500" },
  { gradient: "from-emerald-500 via-green-500 to-lime-500" },
];

const AnimatedAvatar = ({ index }: { index: number }) => {
  const variant = avatarVariants[index % avatarVariants.length];

  return (
    <div className="relative w-12 h-12">
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${variant.gradient}`}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-1 rounded-full bg-background/30 backdrop-blur-sm" />
    </div>
  );
};

/* ---------- MAIN CARD ---------- */

const AnonymousProfileCard = ({
  profile,
  onRequestChat,
  index = 0,
}: AnonymousProfileCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <AnimatedAvatar index={index} />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Anonymous
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-muted-foreground">
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground leading-relaxed mb-3 line-clamp-2">
          “{profile.selfDescription}”
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.vibeTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-md text-[11px] font-medium bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Hook */}
        <div className="bg-primary/5 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <MessageCircle className="w-3.5 h-3.5 text-primary mt-0.5" />
            <p className="text-xs text-foreground/80 italic line-clamp-2">
              “{profile.conversationHook}”
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={onRequestChat}
          size="sm"
          className="w-full bg-gradient-to-r from-primary to-primary-end text-primary-foreground text-xs font-medium"
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
          Request Chat
        </Button>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-muted/30 rounded-b-xl">
        <p className="text-[10px] text-center text-muted-foreground">
          Identity revealed after mutual match
        </p>
      </div>
    </motion.div>
  );
};

export default AnonymousProfileCard;
