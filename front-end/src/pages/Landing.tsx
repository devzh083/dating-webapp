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

// shared gradient class
const PRIMARY_GRADIENT =
  "bg-[linear-gradient(to_right,#0095E0,#00B4D8,#00C98B)]";

const Landing = () => {
  const navigate = useNavigate();
  const goToAuth = () => navigate("/login");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl ${PRIMARY_GRADIENT} flex items-center justify-center shadow-md`}
            >
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              The dating app
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-10 text-sm"
          >
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#stories"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Stories
            </a>
            <a
              href="#safety"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Safety
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="ghost"
              className="hidden sm:inline-flex text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={goToAuth}
            >
              Sign in
            </Button>
            <Button
              className={`${PRIMARY_GRADIENT} text-white shadow-md hover:brightness-110 transition-all font-medium px-6 border-none`}
              onClick={goToAuth}
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-8 text-gray-900">
                Find your{" "}
                <span className="bg-[linear-gradient(to_right,#0095E0,#00B4D8,#00C98B)] bg-clip-text text-transparent">
                  perfect
                </span>{" "}
                match
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                We exist to bring people closer to love. Find meaningful
                connections that ignite confidence and joy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className={`${PRIMARY_GRADIENT} text-white text-lg px-8 py-7 shadow-lg hover:brightness-110 transition-all font-semibold border-none`}
                  onClick={goToAuth}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Matching
                </Button>
                <Button
                  size="lg"
                  className="text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-lg px-8 py-7 font-semibold transition-all"
                  variant="outline"
                >
                  Learn More
                </Button>
              </div>

              {/* STATS */}
              <div className="flex gap-12 mt-16 justify-center lg:justify-start flex-wrap">
                <div>
                  <div className="text-4xl font-black text-gray-900">
                    50M+
                  </div>
                  <div className="text-gray-600 text-sm font-medium mt-1">
                    Active Users
                  </div>
                </div>
                <div className="w-px bg-gray-300" />
                <div>
                  <div className="text-4xl font-black text-gray-900">
                    10M+
                  </div>
                  <div className="text-gray-600 text-sm font-medium mt-1">
                    Matches Made
                  </div>
                </div>
                <div className="w-px bg-gray-300" />
                <div>
                  <div className="text-4xl font-black text-gray-900">
                    150+
                  </div>
                  <div className="text-gray-600 text-sm font-medium mt-1">
                    Countries
                  </div>
                </div>
              </div>
            </motion.div>

           {/* RIGHT: PROFILE CARDS */}
                    {/* RIGHT: PROFILE CARDS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[500px] hidden lg:flex items-center justify-center perspective-1000"
          >
            {profiles.map((profile, index) => {
              // Logic to determine position based on index
              // 0: Left, 1: Center (Top), 2: Right
              const isCenter = index === 1;
              const isLeft = index === 0;
              const isRight = index === 2;

              return (
                <motion.div
                  key={profile.name}
                  initial={{ 
                    opacity: 0, 
                    x: "-50%", 
                    y: "-50%", 
                    rotate: 0, 
                    scale: 0.8 
                  }}
                  animate={{ 
                    opacity: 1, 
                    // Base position is center (50%, 50%). We adjust x/y from there.
                    x: isCenter ? "-50%" : isLeft ? "-140%" : "40%", 
                    y: isCenter ? "-60%" : "-45%", 
                    rotate: isCenter ? 0 : isLeft ? -12 : 12,
                    scale: isCenter ? 1.1 : 0.95,
                    zIndex: isCenter ? 20 : 10
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.4 + index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                  className="absolute left-1/2 top-1/2 w-72 h-96 rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white/40 backdrop-blur-sm"
                  style={{
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                >
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90" />
                  
                  {/* Card Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-2xl font-bold">
                        {profile.name}, {profile.age}
                      </h3>
                      {isCenter && (
                        <div className="bg-green-500 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium backdrop-blur-md bg-white/10 w-fit px-3 py-1.5 rounded-full">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>2 km away</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          </div>
        </div>

        {/* Subtle blur blobs */}
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900">
              Why choose us?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
                className="group p-8 rounded-2xl bg-gray-50 border border-gray-200 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-100/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-100/60 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-200 transition-all">
                  <feature.icon className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className={`py-32 ${PRIMARY_GRADIENT} relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
              Ready to find your person?
            </h2>
            <p className="text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Join millions of people who have found meaningful connections.
              Your story could be next.
            </p>
            <Button
              size="lg"
              className="bg-white text-[#0095E0] hover:bg-gray-100 text-lg px-12 py-7 shadow-xl hover:shadow-2xl font-bold transition-all"
              onClick={goToAuth}
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg ${PRIMARY_GRADIENT} flex items-center justify-center shadow-md`}
              >
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-bold text-white">The dating app</span>
            </div>

            <div className="flex gap-8 text-sm text-gray-400">
              <a
                href="#"
                className="hover:text-white transition-colors font-medium"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors font-medium"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors font-medium"
              >
                Safety
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors font-medium"
              >
                Support
              </a>
            </div>

            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} The dating app. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
