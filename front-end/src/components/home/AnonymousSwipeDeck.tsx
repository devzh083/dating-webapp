import { useState, useEffect } from "react";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  animate, 
  PanInfo, 
  AnimatePresence 
} from "framer-motion";
import { X, Heart, RotateCcw } from "lucide-react";
import AnonymousProfileCard from "./AnonymousProfileCard";

interface Props {
  profiles: any[];
  onLike: (profileId: string) => void;
  onDislike: (profileId: string) => void;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_DURATION = 0.8;

/* --- Floating Hearts Animation --- */
const FloatingHearts = () => {
  const [hearts] = useState(() => Array.from({ length: 15 }, (_, i) => i));
  
  return (
    <div className="absolute inset-0 pointer-events-none z-[60] overflow-visible flex items-center justify-center">
      {hearts.map((id) => (
        <motion.div
          key={id}
          initial={{ opacity: 1, y: 50, x: 0, scale: 0 }}
          animate={{
            opacity: 0,
            y: -200 - Math.random() * 100,
            x: (Math.random() - 0.5) * 400,
            scale: 1 + Math.random(),
          }}
          transition={{
            duration: 1.5 + Math.random(),
            ease: "easeOut",
          }}
          className="absolute"
        >
          <Heart className="w-10 h-10 fill-teal-500 text-teal-500 drop-shadow-sm" />
        </motion.div>
      ))}
    </div>
  );
};

export default function AnonymousSwipeDeck({
  profiles = [],
  onLike,
  onDislike,
}: Props) {
  const [index, setIndex] = useState(0);
  const [showHearts, setShowHearts] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const activeProfile = profiles[index];
  const nextProfile = profiles[index + 1];

  // Motion Values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-5, 5]);
  const opacity = useTransform(x, [-400, -200, 0, 200, 400], [0, 1, 1, 1, 0]);

  // Background Card Animation
  const bgScale = useTransform(x, [-200, 0, 200], [1, 0.95, 1]);
  const bgOpacity = useTransform(x, [-200, 0, 200], [1, 0.5, 1]);
  const bgOverlayOpacity = useTransform(x, [-200, 0, 200], [0, 0.4, 0]);

  useEffect(() => {
    if (showHearts) {
      const timer = setTimeout(() => setShowHearts(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showHearts]);

  // --- LOGIC ---

  const completeSwipe = (direction: "left" | "right") => {
    if (!activeProfile) return;

    // Data updates happen AFTER animation to prevent visual glitches
    if (direction === "right") {
      onLike(activeProfile.id);
    } else {
      onDislike(activeProfile.id);
    }

    setIndex((prev) => prev + 1);
    x.set(0);
  };

  const triggerSwipe = async (direction: "left" | "right") => {
    if (!activeProfile) return;

    // ✅ FIX: Trigger Visuals IMMEDIATELY (Before animation starts)
    if (direction === "right") {
      setShowHearts(true);
    }

    // 1. Animate card off screen slowly
    const destinationX = direction === "right" ? 800 : -800;
    
    await animate(x, destinationX, { 
      duration: SWIPE_DURATION,
      ease: "easeInOut"
    }).finished;

    // 2. Update state logic (switch profile)
    completeSwipe(direction);
  };

  const onDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > SWIPE_THRESHOLD || velocity > 500) {
      triggerSwipe("right");
    } else if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      triggerSwipe("left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
    }
  };

  /* --- EMPTY STATE --- */
  if (!activeProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 w-full">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <RotateCcw className="w-8 h-8 text-teal-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">You've caught up!</h3>
        <p className="text-gray-500 max-w-xs mx-auto mb-6 text-base">
          Check back later for more vibes.
        </p>
        <button 
          onClick={() => { setIndex(0); x.set(0); }}
          className="px-6 py-3 bg-teal-500 text-white rounded-full font-bold text-sm shadow-xl shadow-teal-200 hover:bg-teal-600 hover:scale-105 transition-all"
        >
          Start Over
        </button>
      </div>
    );
  }

  /* --- ACTIVE STATE --- */
  return (
    <div className="relative w-full mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Discover</h2>
          <p className="text-xs font-medium text-gray-400 mt-0.5">Connect based on vibes</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
           <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
           </span>
           <span className="text-xs font-bold text-gray-700">6 online</span>
        </div>
      </div>

      {/* Card Stack Container */}
      <div className="relative h-[400px] w-full">
        
        {/* 1. NEXT PROFILE (Background) */}
        {nextProfile && (
          <motion.div 
            key={nextProfile.id}
            style={{ 
              scale: bgScale, 
              opacity: bgOpacity 
            }}
            className="absolute inset-0 top-0 left-0 w-full h-full z-0"
          >
             <AnonymousProfileCard profile={nextProfile} />
             {/* Dimming Overlay */}
             <motion.div 
                style={{ opacity: bgOverlayOpacity }}
                className="absolute inset-0 bg-white/50 rounded-[40px] pointer-events-none" 
             />
          </motion.div>
        )}

        {/* 2. ACTIVE PROFILE (Foreground) */}
        <motion.div
          key={activeProfile.id}
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={onDragEnd}
          className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing"
        >
          <AnonymousProfileCard profile={activeProfile} />
        </motion.div>

        {/* Hearts - Rendered on top of everything */}
        <AnimatePresence>
            {showHearts && <FloatingHearts />}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-8">
        <button
          onClick={() => triggerSwipe("left")}
          disabled={isDragging}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 hover:scale-110 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-6 h-6" strokeWidth={3} />
        </button>

        <button
          onClick={() => triggerSwipe("right")}
          disabled={isDragging}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-400 to-teal-500 text-white shadow-2xl shadow-teal-200 hover:scale-110 hover:shadow-teal-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Heart className="w-7 h-7 fill-current" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}