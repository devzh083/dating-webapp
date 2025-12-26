import { Star, Quote, Shield, User } from "lucide-react";
import { motion } from "framer-motion";

const reviews = [
  {
    rating: 5,
    text: "The anonymous approach removed all the pressure. When we finally revealed ourselves, we already knew we clicked!",
    timeAgo: "2 days ago",
  },
  {
    rating: 5,
    text: "No more superficial swiping. Here, I connected with someone based on who they really are.",
    timeAgo: "5 days ago",
  },
];

export const AnonymousReviewsBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
          <Quote className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            Success Stories
          </h3>
          <p className="text-sm text-gray-500">
            Real connections, privacy protected
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * index }}
            className="p-5 rounded-2xl bg-gray-50 border border-gray-100"
          >
            {/* User Info Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 text-sm">Verified User</span>
                    <Shield className="w-3 h-3 text-teal-500 fill-teal-500" />
                 </div>
              </div>
              <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-2">"{review.text}"</p>
            <span className="text-xs text-gray-400 font-medium">
              {review.timeAgo}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AnonymousReviewsBanner;