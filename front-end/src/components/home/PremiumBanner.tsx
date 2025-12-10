import { Crown, Sparkles, Heart, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export const PremiumBanner = () => {
  const features = [
    { icon: Heart, text: "See who likes you" },
    { icon: Eye, text: "Unlimited views" },
    { icon: Sparkles, text: "Priority matching" },
  ];

  return (
    <section className="mt-8 mb-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wide opacity-90">
              Premium
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2">
            Get your best matches, guaranteed
          </h3>

          <p className="text-sm opacity-90 mb-4">
            Upgrade to Premium and unlock exclusive features to find your
            perfect match faster.
          </p>

          <div className="flex flex-wrap gap-3 mb-5">
            {features.map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-1.5 text-sm bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5"
              >
                <feature.icon className="w-4 h-4" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          <Link
            to="/premium"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-full font-semibold hover:bg-white/90 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade Now
          </Link>
        </div>
      </div>
    </section>
  );
};
