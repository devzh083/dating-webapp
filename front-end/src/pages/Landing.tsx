import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Coffee,
  Store,
  Eye,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

// Shared Gradient
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";
const TEXT_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B] bg-clip-text text-transparent";

const steps = [
  {
    icon: Lock,
    title: "1. The Vibe Check",
    description: "Profiles are anonymous. No photos, no names. Just interests, bios, and conversation starters.",
  },
  {
    icon: Heart,
    title: "2. The Mutual Match",
    description: "Like their vibe? If they like you back, it's a match! Only then do photos and details unlock.",
  },
  {
    icon: Coffee,
    title: "3. The Perfect Date",
    description: "Skip the awkward planning. We suggest top-rated cafés for your first meet-up based on location.",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const goToAuth = () => navigate("/login");
  const goToPartner = () => navigate("/cafe-partner"); // Assuming you have this route or similar

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#0095E0] selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className={`w-10 h-10 rounded-xl ${PRIMARY_GRADIENT} flex items-center justify-center shadow-lg shadow-blue-200`}>
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">The Dating App</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-[#0095E0] transition-colors">How it Works</a>
            <a href="#for-cafes" className="hover:text-[#0095E0] transition-colors">For Cafés</a>
            <a href="#safety" className="hover:text-[#0095E0] transition-colors">Safety</a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={goToAuth} className="hidden sm:inline-flex text-gray-600 hover:text-[#0095E0]">
              Sign in
            </Button>
            <Button onClick={goToAuth} className={`${PRIMARY_GRADIENT} text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all`}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0095E0]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00C98B]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Left: Text */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" />
              <span>Dating Reimagined</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
              Connect by Vibe.<br />
              Reveal by <span className={TEXT_GRADIENT}>Choice.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Tired of judging books by their covers? We keep profiles anonymous until you match. 
              Once you connect, we help you meet at the best cafés in town.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={goToAuth} size="lg" className={`${PRIMARY_GRADIENT} text-white px-8 h-14 rounded-full text-base font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border-0`}>
                Find Your Match
              </Button>
              <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth'})} variant="outline" size="lg" className="h-14 rounded-full px-8 text-base font-bold border-2 hover:bg-gray-50">
                How it works
              </Button>
            </div>
          </motion.div>

          {/* Right: Visual (Anonymous vs Real) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] flex items-center justify-center"
          >
            {/* The "Anonymous" Card (Back) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-[60%] w-72 h-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 flex flex-col items-center justify-center rotate-[-6deg] z-10">
               <div className={`w-24 h-24 rounded-full ${PRIMARY_GRADIENT} mb-4 animate-pulse opacity-80`} />
               <div className="h-4 w-32 bg-gray-100 rounded-full mb-2" />
               <div className="h-3 w-48 bg-gray-50 rounded-full mb-8" />
               <div className="flex gap-2">
                 <div className="h-8 w-16 bg-blue-50 rounded-lg" />
                 <div className="h-8 w-16 bg-blue-50 rounded-lg" />
               </div>
               <div className="mt-auto px-3 py-1 bg-gray-900 text-white text-xs rounded-full font-bold">
                 Hidden
               </div>
            </div>

            {/* The "Real" Card (Front) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-[40%] w-72 h-96 bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] p-2 rotate-[6deg] z-20 border-[4px] border-white ring-1 ring-gray-100">
               <img 
                 src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=700&fit=crop" 
                 alt="Real Profile" 
                 className="w-full h-full object-cover rounded-[1.5rem]"
               />
               <div className="absolute bottom-6 left-6 text-white drop-shadow-md">
                 <div className="text-2xl font-bold">Maya, 24</div>
                 <div className="text-sm font-medium opacity-90">Matched!</div>
               </div>
               <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full">
                 <Eye className="w-5 h-5 text-white" />
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Dating, De-influenced.</h2>
            <p className="text-xl text-gray-500">How we bring focus back to what matters.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${PRIMARY_GRADIENT} flex items-center justify-center mb-6 shadow-md`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- B2B SECTION (FOR CAFES) --- */}
      <section id="for-cafes" className="py-24 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-20 relative overflow-hidden text-center md:text-left">
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0095E0] rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-[#00C98B] font-bold uppercase tracking-widest text-xs mb-4">
                  <Store className="w-4 h-4" />
                  For Business
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Own a Café? <br/>
                  <span className="text-gray-400">Become a Date Spot.</span>
                </h2>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  Join our partner network. We recommend your café to matched couples looking for the perfect first date location. Increase footfall and become part of their story.
                </p>
                
                <ul className="space-y-3 mb-8 text-gray-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00C98B]" />
                    <span>Get listed in our "Top Picks"</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00C98B]" />
                    <span>Receive table bookings directly</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00C98B]" />
                    <span>Attract new local customers</span>
                  </li>
                </ul>

                <Button 
                  onClick={goToPartner}
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 h-12 rounded-full"
                >
                  Partner with us
                </Button>
              </div>

              {/* Visual for Cafes */}
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 group">
                <img 
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80" 
                  alt="Cafe Interior" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                   <div className="bg-[#00C98B] w-fit px-3 py-1 rounded-full text-xs font-bold text-white mb-2">
                     Recommended Spot
                   </div>
                   <h3 className="text-white text-xl font-bold">The Coffee House</h3>
                   <p className="text-gray-300 text-sm">4.8 ★ • 1.2km away</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SAFETY/TRUST --- */}
      <section id="safety" className="py-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="w-12 h-12 text-[#0095E0] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Safety is our priority</h2>
          <p className="text-gray-600 leading-relaxed">
            We use advanced verification to ensure every profile is real. 
            Plus, our anonymity phase protects your privacy until you feel comfortable sharing more.
          </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${PRIMARY_GRADIENT} flex items-center justify-center`}>
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-gray-900">The Dating App</span>
          </div>

          <div className="flex gap-8 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-[#0095E0]">Privacy Policy</a>
            <a href="#" className="hover:text-[#0095E0]">Terms of Service</a>
            <a href="#" className="hover:text-[#0095E0]">Café Guidelines</a>
          </div>

          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;