import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Sparkles,
  Check,
  Zap,
  Eye,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Star,
  Flame,
  TrendingUp,
  Shield,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// --- THEME CONSTANTS ---
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";
const TEXT_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B] bg-clip-text text-transparent";

// Icon mapping
const ICON_MAP: { [key: string]: any } = {
  zap: Zap,
  flame: Flame,
  'trending-up': TrendingUp,
  crown: Crown,
  star: Star,
  eye: Eye,
  'map-pin': MapPin,
  'message-circle': MessageCircle,
  shield: Shield,
};

interface PremiumPlan {
  plan_id: string;
  name: string;
  duration: string;
  price: number;
  original_price?: number;
  price_per_month: number;
  discount_text?: string;
  icon: string;
  gradient: string;
  popular: boolean;
  features: string[];
  active: boolean;
}

interface PremiumFeature {
  id: number;
  title: string;
  description: string;
  icon: string;
  active: boolean;
}

const PremiumPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [features, setFeatures] = useState<PremiumFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  useEffect(() => {
    fetchPremiumData();
  }, []);

  const fetchPremiumData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Uses the standard admin endpoints which now allow public GET access
      const baseUrl = 'http://127.0.0.1:8000/api/admin'; 
      
      console.log("Fetching premium data from:", baseUrl);

      // We make a simple GET request. No headers needed because permission is AllowAny.
      const [plansRes, featuresRes] = await Promise.all([
        fetch(`${baseUrl}/premium/plans/`),
        fetch(`${baseUrl}/premium/features/`)
      ]);

      if (!plansRes.ok || !featuresRes.ok) {
        throw new Error("Failed to fetch premium data from server");
      }

      const plansData = await plansRes.json();
      const featuresData = await featuresRes.json();

      // Handle Django Rest Framework pagination results
      const cleanPlans = Array.isArray(plansData) ? plansData : (plansData.results || []);
      const cleanFeatures = Array.isArray(featuresData) ? featuresData : (featuresData.results || []);

      setPlans(cleanPlans);
      setFeatures(cleanFeatures);

      // Auto-select popular plan or first available
      const popular = cleanPlans.find((p: PremiumPlan) => p.popular);
      if (popular) setSelectedPlan(popular.plan_id);
      else if (cleanPlans.length > 0) setSelectedPlan(cleanPlans[0].plan_id);

    } catch (error: any) {
      console.error('Error fetching premium data:', error);
      setError("Unable to load plans. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (planId: string) => {
    // Placeholder for payment gateway integration
    alert(`Proceeding to payment for plan: ${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="w-10 h-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">{error}</p>
        <div className="flex gap-3">
            <Button onClick={fetchPremiumData} className="bg-teal-600 hover:bg-teal-700 text-white">
                Try Again
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline">
                Go Back
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${PRIMARY_GRADIENT} flex items-center justify-center shadow-sm`}>
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Premium</span>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 text-center px-4">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-xs font-bold uppercase tracking-widest mb-6"
        >
            <Crown className="w-3.5 h-3.5" />
            <span>Upgrade your love life</span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Find Love <span className={TEXT_GRADIENT}>Faster</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Unlock exclusive features, see who likes you, and get 10x more matches today.
        </p>
      </section>

      {/* Plans Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        {plans.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Crown className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No active plans found.</p>
                <p className="text-slate-400 text-sm mt-1">Please add plans via the Admin Panel.</p>
            </div>
        ) : (
            <div className="grid md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => {
                const Icon = ICON_MAP[plan.icon] || Star;
                const isSelected = selectedPlan === plan.plan_id;
                
                return (
                <motion.div
                    key={plan.plan_id}
                    onClick={() => setSelectedPlan(plan.plan_id)}
                    className={`relative bg-white rounded-[32px] p-8 cursor-pointer transition-all duration-300 ${
                    isSelected 
                        ? "border-2 border-teal-500 shadow-2xl shadow-teal-900/10 scale-105 z-10" 
                        : "border border-slate-100 shadow-xl hover:border-teal-200 hover:-translate-y-1"
                    }`}
                >
                    {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-yellow-200 fill-current" />
                        Most Popular
                    </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-2xl ${plan.gradient || 'bg-slate-100'} flex items-center justify-center text-white shadow-md`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight">{plan.name}</h3>
                            <p className="text-slate-500 text-sm font-medium">{plan.duration}</p>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-black text-slate-900">₹{Math.floor(plan.price)}</span>
                        {plan.original_price && (
                          <span className="text-lg text-slate-400 line-through decoration-2 decoration-red-200 ml-2">
                            ₹{Math.floor(plan.original_price)}
                          </span>
                        )}
                    </div>
                    
                    {plan.discount_text && (
                        <div className="mb-6 inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                          {plan.discount_text}
                        </div>
                    )}

                    <div className="h-px bg-slate-100 mb-6"></div>

                    <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium leading-snug">
                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-teal-100 text-teal-600" : "bg-slate-100 text-slate-400"}`}>
                                    <Check className="w-3 h-3" strokeWidth={3} />
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <Button 
                        className={`w-full py-6 text-base font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] ${
                            isSelected 
                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:to-teal-700 text-white shadow-teal-500/20' 
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(plan.plan_id);
                        }}
                    >
                        Choose {plan.name}
                    </Button>
                </motion.div>
                );
            })}
            </div>
        )}
      </section>
    </div>
  );
};

export default PremiumPage;