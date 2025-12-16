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
  {
    rating: 5,
    text: "Finally, a dating app where personality matters first. Found my person in 3 weeks!",
    timeAgo: "1 week ago",
  },
];

export const AnonymousReviewsBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
          <Quote className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">
            Anonymous Success Stories
          </h3>
          <p className="text-sm text-muted-foreground">
            Real connections, privacy protected
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 border-2 border-border/50 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-muted-foreground/60" />
            </div>

            {/* Review Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    Verified User
                  </span>
                  <Shield className="w-3.5 h-3.5 text-primary" />
                </div>

                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-1">{review.text}</p>
              <span className="text-xs text-muted-foreground/60">
                {review.timeAgo}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 border-2 border-background flex items-center justify-center"
              >
                <User className="w-4 h-4 text-muted-foreground/50" />
              </div>
            ))}
          </div>

          <span className="text-sm text-muted-foreground">
            Join 10K+ happy users
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-bold text-amber-600 dark:text-amber-400">
            4.9
          </span>
        </div>
      </div>
    </motion.div>
  );
};
export default AnonymousReviewsBanner;
