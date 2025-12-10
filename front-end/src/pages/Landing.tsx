// src/pages/Landing.tsx
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// adjust this import if your Button lives somewhere else
import { Button } from "../components/ui/button";

const profiles = [
  {
    name: "Maya",
    age: 26,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
  },
  {
    name: "Alex",
    age: 29,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
  },
  {
    name: "Priya",
    age: 24,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
  },
];

const features = [
  {
    icon: Heart,
    title: "Meaningful Connections",
    description:
      "Find people who share your values and interests for lasting relationships.",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description:
      "Your privacy matters. We verify profiles and protect your personal data.",
  },
  {
    icon: MessageCircle,
    title: "Real Conversations",
    description:
      "Break the ice with thoughtful prompts that spark genuine dialogue.",
  },
  {
    icon: Users,
    title: "Your Community",
    description:
      "Connect with like-minded individuals in your area and beyond.",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const goToAuth = () => navigate("/login");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-start to-primary-end flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold">The dating app</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-8 text-sm"
          >
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#stories"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Stories
            </a>
            <a
              href="#safety"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Safety
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={goToAuth}
            >
              Sign in
            </Button>
            <Button
              className="bg-gradient-to-r from-primary-start to-primary-end hover:opacity-90 text-white shadow-lg shadow-primary/25"
              onClick={goToAuth}
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Find your{" "}
                <span className="bg-gradient-to-r from-primary-start to-primary-end bg-clip-text text-transparent">
                  perfect
                </span>{" "}
                match
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                We exist to bring people closer to love. Find meaningful
                connections that ignite confidence and joy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary-start to-primary-end hover:opacity-90 text-white text-lg px-8 py-6 shadow-xl shadow-primary/30"
                  onClick={goToAuth}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Matching
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2"
                >
                  Learn More
                </Button>
              </div>

              {/* STATS */}
              <div className="flex gap-8 mt-12 justify-center lg:justify-start">
                <div>
                  <div className="text-3xl font-bold">50M+</div>
                  <div className="text-muted-foreground text-sm">
                    Active Users
                  </div>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold">10M+</div>
                  <div className="text-muted-foreground text-sm">
                    Matches Made
                  </div>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold">150+</div>
                  <div className="text-muted-foreground text-sm">
                    Countries
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: PROFILE CARDS */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[500px] hidden lg:block"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-[180px] font-black text-muted/30 tracking-tighter">
                  love
                </span>
              </div>

              {profiles.map((profile, index) => (
                <motion.div
                  key={profile.name}
                  initial={{ opacity: 0, y: 50, rotate: (index - 1) * 8 }}
                  animate={{ opacity: 1, y: 0, rotate: (index - 1) * 8 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="absolute w-56 h-72 rounded-3xl overflow-hidden shadow-2xl"
                  style={{
                    left: `${20 + index * 25}%`,
                    top: `${10 + Math.abs(index - 1) * 15}%`,
                    zIndex: 3 - Math.abs(index - 1),
                  }}
                >
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="text-white font-semibold text-lg">
                      {profile.name}, {profile.age}
                    </div>
                    <div className="flex items-center gap-1 text-white/80 text-sm">
                      <MapPin className="w-3 h-3" />
                      2 km away
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* blur blobs like Lovable */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary-end/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why choose us?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're building a dating experience that prioritizes authenticity
              and genuine connection.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-start/10 to-primary-end/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-start to-primary-end relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to find your person?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join millions of people who have found meaningful connections.
              Your story could be next.
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-6 shadow-xl"
              onClick={goToAuth}
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-muted/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-start to-primary-end flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-semibold">The dating app</span>
            </div>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Safety
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>

            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} The dating app. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
