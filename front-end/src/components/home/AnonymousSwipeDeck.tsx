import { useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { X, Heart, RotateCcw } from "lucide-react";
import AnonymousProfileCard from "./AnonymousProfileCard";

const SWIPE_THRESHOLD = 150;
// Increased duration for a slower, smoother slide
const ANIMATION_DURATION = 0.8; 

interface Props {
  profiles: any[];
  onLike: (profileId: string) => void;
  onDislike: (profileId: string) => void;
}

export default function AnonymousSwipeDeck({
  profiles,
  onLike,
  onDislike,
}: Props) {
  const [index, setIndex] = useState(0);
  const [exitX, setExitX] = useState<number | null>(null);

  const activeProfile = profiles[index];
  const nextProfile = profiles[index + 1];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]); // Reduced rotation slightly for smoother feel
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Background color indicators opacity
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [0, -100], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      triggerSwipe("right");
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      triggerSwipe("left");
    }
  };

  const triggerSwipe = (direction: "left" | "right") => {
    if (!activeProfile) return;
    
    // Set exit target
    setExitX(direction === "right" ? 1000 : -1000);
    
    // Wait for the longer animation to finish
    setTimeout(() => {
      if (direction === "right") {
        onLike(activeProfile.id);
      } else {
        onDislike(activeProfile.id);
      }
      setIndex((i) => i + 1);
      setExitX(null);
      x.set(0);
    }, ANIMATION_DURATION * 1000); 
  };

  if (!activeProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] text-center p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
          <RotateCcw className="w-8 h-8 text-teal-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">You've caught up!</h3>
        <p className="text-gray-500 max-w-xs mx-auto mb-8">
          That's everyone in your area for now. Check back later for more connections.
        </p>
        <button 
          onClick={() => setIndex(0)}
          className="px-8 py-3 bg-teal-500 text-white rounded-full font-bold shadow-lg shadow-teal-200 hover:bg-teal-600 hover:shadow-xl transition-all"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      {/* Deck Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Discover</h2>
          <p className="text-xs font-medium text-gray-500 mt-0.5">Swipe to connect</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
           <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
           </span>
           <span className="text-xs font-bold text-gray-700">6 online</span>
        </div>
      </div>

      <div className="relative h-[560px]">
        {/* Next Card (Background) */}
        {nextProfile && (
          <div className="absolute inset-0 top-4 scale-[0.93] opacity-60 pointer-events-none z-0">
             <AnonymousProfileCard profile={nextProfile} />
          </div>
        )}

        {/* Active Card (Foreground) */}
        <motion.div
          key={activeProfile.id}
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={exitX !== null ? { x: exitX, opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: ANIMATION_DURATION, ease: "easeIn" }} // Slower duration applied here
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        >
          {/* Swipe Indicators */}
          <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-8 z-20 border-[5px] border-emerald-500 rounded-xl px-4 py-1 bg-white/30 backdrop-blur-md -rotate-12 shadow-sm">
            <span className="text-4xl font-black text-emerald-500 tracking-widest uppercase">LIKE</span>
          </motion.div>
          <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-8 z-20 border-[5px] border-rose-500 rounded-xl px-4 py-1 bg-white/30 backdrop-blur-md rotate-12 shadow-sm">
            <span className="text-4xl font-black text-rose-500 tracking-widest uppercase">NOPE</span>
          </motion.div>
          
          <AnonymousProfileCard profile={activeProfile} />
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center gap-8">
        {/* Reject Button */}
        <button
          onClick={() => triggerSwipe("left")}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 hover:scale-110 shadow-sm transition-all duration-200"
        >
          <X className="w-6 h-6" strokeWidth={3} />
        </button>

        {/* Counter Pill */}
        <span className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-400 tracking-wide">
           {index + 1} / {profiles.length}
        </span>

        {/* Like Button */}
        <button
          onClick={() => triggerSwipe("right")}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-200 hover:bg-teal-600 hover:scale-110 transition-all duration-200"
        >
          <Heart className="w-6 h-6 fill-current" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}