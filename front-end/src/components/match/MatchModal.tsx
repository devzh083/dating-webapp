import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

export interface SwipeProfile {
  id: string;
  firstName: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface MatchModalProps {
  profile: SwipeProfile;
  onComplete: () => void;
  pendingMatchId?: string | null;
}

const MatchModal = ({ profile, onComplete }: MatchModalProps) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-white rounded-3xl p-8 w-[360px] text-center shadow-2xl relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1.4, rotate: 10 }}
          >
            <Heart className="w-48 h-48 text-pink-500 opacity-20 fill-pink-500" />
          </motion.div>

          <h2 className="text-3xl font-black mb-2">It’s a Match!</h2>

          <p className="text-gray-600 mb-6">
            You and <b>{profile.firstName}</b> liked each other
          </p>

          <button
            onClick={onComplete}
            className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg hover:scale-105 transition-transform"
          >
            Start Chat
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchModal;
