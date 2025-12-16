import { Shield, Lock, UserCheck, Eye, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const securityFeatures = [
  {
    icon: Shield,
    title: "Profile Verification",
    description: "All profiles are verified for authenticity",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Your conversations are always private",
    color: "from-blue-400 to-indigo-500",
  },
  {
    icon: UserCheck,
    title: "ID Verification",
    description: "Optional ID check for extra trust",
    color: "from-violet-400 to-purple-500",
  },
  {
    icon: Eye,
    title: "Privacy Controls",
    description: "You decide who sees your profile",
    color: "from-pink-400 to-rose-500",
  },
];

const SecurityBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-br from-primary/5 via-card to-primary-end/5
                 rounded-2xl p-6 lg:p-8 border border-primary/10 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-end">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">
            Your safety matters
          </h3>
          <p className="text-sm text-muted-foreground">
            Industry-leading security standards
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="group p-4 rounded-xl bg-background/80
                       border border-border/50
                       hover:border-primary/30 hover:shadow-md
                       transition-all"
          >
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color}
                          flex items-center justify-center mb-3
                          group-hover:scale-110 transition-transform`}
            >
              <feature.icon className="w-5 h-5 text-white" />
            </div>

            <p className="font-semibold text-sm text-foreground mb-1">
              {feature.title}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer badges */}
      <div className="mt-6 pt-5 border-t border-primary/10">
        <div className="flex flex-wrap items-center gap-3 justify-center">
          {["GDPR Compliant", "256-bit SSL", "24/7 Monitoring"].map(
            (badge, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                <span>{badge}</span>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityBanner;
