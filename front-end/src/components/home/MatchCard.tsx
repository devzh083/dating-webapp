import { motion } from "framer-motion";
import { Heart, X, MapPin } from "lucide-react";

interface Match {
  id: string;
  name: string;
  age: number;
  distance: string;
  bio: string;
  photos: string[];
  interests: string[];
}

interface MatchCardProps {
  match: Match;
  onLike: () => void;
  onPass: () => void;
  exitDirection: "left" | "right" | null;
}

export const MatchCard = ({
  match,
  onLike,
  onPass,
  exitDirection,
}: MatchCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: exitDirection ? 0 : 1,
        scale: exitDirection ? 0.9 : 1,
        x:
          exitDirection === "left"
            ? -300
            : exitDirection === "right"
            ? 300
            : 0,
        rotate:
          exitDirection === "left"
            ? -15
            : exitDirection === "right"
            ? 15
            : 0,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-sm bg-card rounded-3xl overflow-hidden shadow-xl border border-border"
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={match.photos[0]}
          alt={match.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-2xl font-bold">{match.name}</h3>
            <span className="text-xl opacity-90">{match.age}</span>
          </div>
          <div className="flex items-center gap-1 text-sm opacity-90 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{match.distance}</span>
          </div>
          <p className="text-sm opacity-90 line-clamp-2 mb-3">{match.bio}</p>
          <div className="flex flex-wrap gap-1.5">
            {match.interests.slice(0, 4).map((interest) => (
              <span
                key={interest}
                className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-6 p-5 bg-background">
        <button
          onClick={onPass}
          className="w-14 h-14 rounded-full bg-muted flex items-center justify-center transition-all hover:scale-110 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-7 h-7" />
        </button>
        <button
          onClick={onLike}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        >
          <Heart className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
};
