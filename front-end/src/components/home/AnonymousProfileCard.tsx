import { motion } from "framer-motion";
import { MessageCircle, User, Sparkles } from "lucide-react";
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

export const AnonymousProfileCard = ({ profile, onRequestChat, index = 0 }: AnonymousProfileCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative bg-gradient-to-br from-card via-card to-muted/30 rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
    >
      {/* Hover Gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Avatar + Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-muted via-muted to-muted-foreground/10 flex items-center justify-center border-2 border-border/50 group-hover:border-primary/30 transition-colors">
              <User className="w-7 h-7 text-muted-foreground/60" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-primary to-primary-end flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Anonymous
              </span>
              <span className="text-xs text-muted-foreground/60">•</span>
              <span className="text-xs text-primary/80">Ready to connect</span>
            </div>

            <p className="text-foreground font-medium leading-relaxed">
              "{profile.selfDescription}"
            </p>
          </div>
        </div>

        {/* Vibe Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.vibeTags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-muted to-muted/80 text-muted-foreground border border-border/50 group-hover:border-primary/20 group-hover:text-foreground transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Conversation Hook */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl p-4 mb-4 border border-primary/10">
          <div className="flex items-start gap-2">
            <MessageCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-primary uppercase tracking-wider block mb-1">
                Conversation Starter
              </span>
              <p className="text-sm text-foreground/90 italic">
                "{profile.conversationHook}"
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={onRequestChat}
          className="w-full bg-gradient-to-r from-primary to-primary-end hover:opacity-90 text-primary-foreground font-medium py-5 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Request Chat
        </Button>

        <p className="text-center text-xs text-muted-foreground/70 mt-3">
          Identity revealed only after mutual match
        </p>
      </div>
    </motion.div>
  );
};
export default AnonymousProfileCard;
