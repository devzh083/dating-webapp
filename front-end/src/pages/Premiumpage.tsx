import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
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
  Ticket,
  X,
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
  plan_type: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  price: number;
  original_price?: number;
  price_per_month: number;
  discount_text?: string;
  icon: string;
  color: string;
  gradient: string;
  popular: boolean;
  features: string[];
  active: boolean;
  display_order: number;
}

interface PremiumFeature {
  id: number;
  title: string;
  description: string;
  icon: string;
  active: boolean;
  display_order: number;
}

interface PromoDiscount {
  code: string;
  discountPercentage: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTION TO GET AUTH TOKEN
// ═══════════════════════════════════════════════════════════════════════════

const getAuthToken = (): { token: string; type: 'Bearer' | 'Token' } | null => {
  // JWT tokens (used by regular users)
  const jwtKeys = ['access_token', 'accessToken', 'jwt', 'access'];
  
  // DRF Token keys (used by admin or Token auth)
  const tokenKeys = ['token', 'authToken', 'auth_token', 'admin_token'];

  // Check for JWT tokens first (in localStorage)
  for (const key of jwtKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      console.log(`Found JWT token in localStorage with key: ${key}`);
      return { token, type: 'Bearer' };
    }
  }

  // Check for DRF tokens (in localStorage)
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      console.log(`Found DRF token in localStorage with key: ${key}`);
      return { token, type: 'Token' };
    }
  }

  // Check sessionStorage for JWT
  for (const key of jwtKeys) {
    const token = sessionStorage.getItem(key);
    if (token) {
      console.log(`Found JWT token in sessionStorage with key: ${key}`);
      return { token, type: 'Bearer' };
    }
  }

  // Check sessionStorage for DRF tokens
  for (const key of tokenKeys) {
    const token = sessionStorage.getItem(key);
    if (token) {
      console.log(`Found DRF token in sessionStorage with key: ${key}`);
      return { token, type: 'Token' };
    }
  }

  console.error('No authentication token found in localStorage or sessionStorage');
  return null;
};

// ═══════════════════════════════════════════════════════════════════════════
// PROMO CODE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PromoCodeInputProps {
  selectedPlan: string;
  onPromoApplied: (discount: PromoDiscount) => void;
  onPromoRemoved: () => void;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  selectedPlan,
  onPromoApplied,
  onPromoRemoved,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoDiscount | null>(null);
  const [error, setError] = useState('');

  const validatePromo = async () => {
    if (!promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    if (!selectedPlan) {
      setError('Please select a plan first');
      return;
    }

    setValidating(true);
    setError('');

    try {
      const authData = getAuthToken();
      
      if (!authData) {
        setError('Please log in to use promo codes. If you are logged in, try refreshing the page.');
        setValidating(false);
        return;
      }
      
      console.log('Validating promo code with token type:', authData.type); // Debug log
      
      const response = await fetch('http://127.0.0.1:8000/api/promo/validate/', {
        method: 'POST',
        headers: {
          'Authorization': `${authData.type} ${authData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode.toUpperCase().trim(),
          plan_id: selectedPlan,
        }),
      });

      const data = await response.json();

      console.log('Promo validation response:', data); // Debug log

      if (response.ok && data.valid) {
        // ✅ Calculate discount amount correctly
        const originalPrice = parseFloat(data.promo_code.plan.original_price);
        const finalPrice = parseFloat(data.promo_code.plan.final_price);
        const discountAmount = originalPrice - finalPrice;

        const discount: PromoDiscount = {
          code: data.promo_code.code,
          discountPercentage: data.promo_code.discount_percentage,
          originalPrice: originalPrice,
          discountAmount: discountAmount,
          finalPrice: finalPrice,
        };
        
        console.log('Parsed discount:', discount); // Debug log
        
        setAppliedPromo(discount);
        onPromoApplied(discount);
        setPromoCode('');
      } else {
        // Check if it's an authentication error
        if (response.status === 401 || response.status === 403) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(data.message || 'Invalid promo code');
        }
      }
    } catch (err) {
      console.error('Promo validation error:', err);
      setError('Failed to validate promo code. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setError('');
    onPromoRemoved();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validatePromo();
    }
  };

  return (
    <div className="space-y-3">
      {/* Applied Promo Success */}
      {appliedPromo && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-green-900">Promo Code Applied!</span>
                  <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">
                    {appliedPromo.code}
                  </span>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  {appliedPromo.discountPercentage}% discount applied
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-green-900">
                    ₹{appliedPromo.finalPrice.toFixed(2)}
                  </span>
                  <span className="text-lg text-green-600 line-through">
                    ₹{appliedPromo.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-green-700">
                    You save ₹{appliedPromo.discountAmount.toFixed(2)}!
                  </span>
                </div>
                {appliedPromo.finalPrice === 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-bold text-green-900">
                      This plan is FREE! 🎉
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={removePromo}
              className="p-1.5 hover:bg-green-200 rounded-lg transition flex-shrink-0"
              title="Remove promo code"
            >
              <X className="w-5 h-5 text-green-700" />
            </button>
          </div>
        </div>
      )}

      {/* Promo Code Input */}
      {!appliedPromo && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ticket className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-bold text-purple-900">Have a promo code?</span>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter code (e.g., SUMMER100)"
                disabled={validating}
                className="w-full px-4 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 font-mono font-bold text-purple-900 placeholder:text-purple-400 placeholder:font-normal disabled:bg-purple-100"
              />
            </div>
            <button
              onClick={validatePromo}
              disabled={validating || !promoCode.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {validating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Apply'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <p className="text-xs text-purple-600 mt-2">
            Enter your promo code to get exclusive discounts or free access
          </p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PREMIUM PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PremiumPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [features, setFeatures] = useState<PremiumFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  
  // ✅ PROMO CODE STATE
  const [promoDiscount, setPromoDiscount] = useState<PromoDiscount | null>(null);

  useEffect(() => {
    fetchPremiumData();
    
    // Debug: Log available storage keys
    console.log('=== STORAGE DEBUG ===');
    console.log('localStorage keys:', Object.keys(localStorage));
    console.log('sessionStorage keys:', Object.keys(sessionStorage));
    console.log('Auth token found:', getAuthToken() ? 'YES' : 'NO');
  }, []);

  const fetchPremiumData = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo("Starting fetch...");

      // Try public endpoints first
      let plansUrl = 'http://127.0.0.1:8000/api/premium/plans/';
      let featuresUrl = 'http://127.0.0.1:8000/api/premium/features/';
      let useAuth = false;

      setDebugInfo(`Attempting public endpoints:\nPlans: ${plansUrl}\nFeatures: ${featuresUrl}`);

      let plansRes = await fetch(plansUrl, {
        headers: { 'Accept': 'application/json' },
      });
      
      let featuresRes = await fetch(featuresUrl, {
        headers: { 'Accept': 'application/json' },
      });

      // If public endpoints fail (404), try admin endpoints with auth
      if (plansRes.status === 404 || featuresRes.status === 404) {
        console.warn('Public endpoints not found, trying admin endpoints with auth...');
        setDebugInfo(`Public endpoints not found (404), trying admin endpoints...`);
        
        const authData = getAuthToken();
        
        if (!authData) {
          throw new Error('Public endpoints not available and no authentication token found. Please ensure the API endpoints are configured correctly.');
        }

        plansUrl = 'http://127.0.0.1:8000/api/admin/premium/plans/';
        featuresUrl = 'http://127.0.0.1:8000/api/admin/premium/features/';
        useAuth = true;

        setDebugInfo(`Retrying with admin endpoints:\nPlans: ${plansUrl}\nFeatures: ${featuresUrl}`);

        plansRes = await fetch(plansUrl, {
          headers: {
            'Authorization': `${authData.type} ${authData.token}`,
            'Accept': 'application/json',
          },
        });
        
        featuresRes = await fetch(featuresUrl, {
          headers: {
            'Authorization': `${authData.type} ${authData.token}`,
            'Accept': 'application/json',
          },
        });
      }

      setDebugInfo(`Response Status:\nPlans: ${plansRes.status}\nFeatures: ${featuresRes.status}`);

      // Check if responses are OK
      if (!plansRes.ok) {
        const plansText = await plansRes.text();
        console.error('Plans Response Error:', plansText);
        setDebugInfo(`Plans Error (${plansRes.status}):\n${plansText.substring(0, 500)}`);
        throw new Error(`Failed to fetch plans: ${plansRes.status} ${plansRes.statusText}`);
      }

      if (!featuresRes.ok) {
        const featuresText = await featuresRes.text();
        console.error('Features Response Error:', featuresText);
        setDebugInfo(`Features Error (${featuresRes.status}):\n${featuresText.substring(0, 500)}`);
        throw new Error(`Failed to fetch features: ${featuresRes.status} ${featuresRes.statusText}`);
      }

      const plansData = await plansRes.json();
      const featuresData = await featuresRes.json();

      console.log('Plans API Response:', plansData);
      console.log('Features API Response:', featuresData);
      
      setDebugInfo(`Received data:\nPlans type: ${Array.isArray(plansData) ? 'array' : typeof plansData}\nFeatures type: ${Array.isArray(featuresData) ? 'array' : typeof featuresData}\nAuth used: ${useAuth}`);

      // Process plans data
      let processedPlans: PremiumPlan[] = [];
      if (Array.isArray(plansData)) {
        processedPlans = plansData;
      } else if (plansData?.results) {
        processedPlans = plansData.results;
      } else if (plansData?.data) {
        processedPlans = plansData.data;
      } else {
        console.error('Unexpected plans data format:', plansData);
        setDebugInfo(`Unexpected plans format:\n${JSON.stringify(plansData).substring(0, 500)}`);
      }

      // Ensure numeric fields are numbers, not strings
      processedPlans = processedPlans.map(plan => ({
        ...plan,
        price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
        original_price: plan.original_price ? (typeof plan.original_price === 'string' ? parseFloat(plan.original_price) : plan.original_price) : undefined,
        price_per_month: typeof plan.price_per_month === 'string' ? parseFloat(plan.price_per_month) : plan.price_per_month,
        display_order: typeof plan.display_order === 'string' ? parseInt(plan.display_order) : plan.display_order,
        features: Array.isArray(plan.features) ? plan.features : [],
      }));

      // Process features data
      let processedFeatures: PremiumFeature[] = [];
      if (Array.isArray(featuresData)) {
        processedFeatures = featuresData;
      } else if (featuresData?.results) {
        processedFeatures = featuresData.results;
      } else if (featuresData?.data) {
        processedFeatures = featuresData.data;
      } else {
        console.error('Unexpected features data format:', featuresData);
        setDebugInfo(prev => `${prev}\nUnexpected features format:\n${JSON.stringify(featuresData).substring(0, 500)}`);
      }

      // Ensure numeric fields for features
      processedFeatures = processedFeatures.map(feature => ({
        ...feature,
        id: typeof feature.id === 'string' ? parseInt(feature.id) : feature.id,
        display_order: typeof feature.display_order === 'string' ? parseInt(feature.display_order) : feature.display_order,
      }));

      // Filter only active items and sort by display_order
      const activePlans = processedPlans
        .filter(plan => plan.active)
        .sort((a, b) => a.display_order - b.display_order);
      
      const activeFeatures = processedFeatures
        .filter(feature => feature.active)
        .sort((a, b) => a.display_order - b.display_order);

      console.log('Processed Plans:', activePlans);
      console.log('Processed Features:', activeFeatures);

      setPlans(activePlans);
      setFeatures(activeFeatures);

      // Set default selected plan to the popular one or first plan
      const popularPlan = activePlans.find(plan => plan.popular);
      setSelectedPlan(popularPlan?.plan_id || activePlans[0]?.plan_id || "");

      setDebugInfo(`✅ Success!\nLoaded ${activePlans.length} active plans and ${activeFeatures.length} active features\nTotal plans: ${processedPlans.length}, Total features: ${processedFeatures.length}`);

    } catch (error: any) {
      console.error('Error fetching premium data:', error);
      const errorMsg = error.message || 'Unknown error occurred';
      setError(`Failed to load premium data: ${errorMsg}`);
      setDebugInfo(prev => `${prev}\n\n❌ Error: ${errorMsg}\n\nTroubleshooting:\n1. Check if Django server is running (http://127.0.0.1:8000)\n2. Verify API endpoints exist\n3. Check CORS configuration\n4. Review browser console (F12) for details\n5. Check Django server logs`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ PROMO CODE HANDLERS
  const handlePromoApplied = (discount: PromoDiscount) => {
    setPromoDiscount(discount);
  };

  const handlePromoRemoved = () => {
    setPromoDiscount(null);
  };

  // ✅ UPDATED PURCHASE HANDLER WITH PROMO CODE REDEMPTION
  const handlePurchase = async (planId: string) => {
    console.log("Purchase plan:", planId);
    
    // If promo code is applied, redeem it
    if (promoDiscount) {
      try {
        const authData = getAuthToken();
        
        if (!authData) {
          alert('Please log in to use promo codes. If you are logged in, try refreshing the page.');
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/promo/redeem/', {
          method: 'POST',
          headers: {
            'Authorization': `${authData.type} ${authData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: promoDiscount.code,
            plan_id: planId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to redeem promo code');
        }

        // If plan is free, just show success
        if (promoDiscount.finalPrice === 0) {
          alert(`🎉 Success! Your ${data.plan.name} plan is now active for FREE!\n\nPromo code "${promoDiscount.code}" has been applied.`);
          // Optionally navigate away or refresh user state
          return;
        }
      } catch (error: any) {
        alert(`Failed to apply promo code: ${error.message}`);
        return;
      }
    }

    // Proceed to payment with discounted price
    const finalPrice = promoDiscount 
      ? promoDiscount.finalPrice 
      : plans.find(p => p.plan_id === planId)?.price || 0;
    
    alert(`Redirecting to payment for ₹${finalPrice.toFixed(2)}...`);
    // TODO: Integrate payment gateway
  };

  // ✅ CALCULATE DISPLAY PRICE
  const getDisplayPrice = (plan: PremiumPlan) => {
    if (promoDiscount && selectedPlan === plan.plan_id) {
      return promoDiscount.finalPrice;
    }
    return plan.price;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center p-8 max-w-3xl">
          <Loader className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Loading premium plans...</p>
          {debugInfo && (
            <div className="bg-gray-100 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-xs text-gray-600 font-mono whitespace-pre-wrap text-left">
                {debugInfo}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-3xl w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2 text-center">Error Loading Premium Data</h2>
          <p className="text-red-700 mb-4 text-center">{error}</p>
          
          {debugInfo && (
            <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Debug Information:</p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto max-h-96">
                {debugInfo}
              </pre>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={fetchPremiumData}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Premium Plans Available</h2>
          <p className="text-gray-600 mb-4">Check back soon for exciting premium features!</p>
          {debugInfo && (
            <div className="bg-gray-100 rounded-lg p-4 mb-4 text-left">
              <p className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                {debugInfo}
              </p>
            </div>
          )}
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${PRIMARY_GRADIENT} flex items-center justify-center`}>
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Premium</span>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 overflow-hidden">
        {/* Animated Background Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-teal-400/20 to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-400/20 to-cyan-500/20 rounded-full blur-3xl"
        />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-teal-100 text-teal-600 font-bold text-sm mb-6"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade to Premium</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight"
          >
            Find Love{" "}
            <span className={TEXT_GRADIENT}>
              Faster
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Get 10x more matches, unlock premium features, and connect with the right people instantly.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 text-center"
          >
            {[
              { value: "10x", label: "More Matches" },
              { value: "3x", label: "Faster Replies" },
              { value: "95%", label: "Success Rate" },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className={`text-4xl font-black ${TEXT_GRADIENT}`}>
                  {stat.value}
                </span>
                <span className="text-sm text-gray-500 font-semibold mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* UNIFIED PRICING SECTION - Prices and Features Together */}
      <section className="py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Choose Your Premium Plan
            </h2>
            <p className="text-xl text-gray-600">
              Unlock all features and find your perfect match
            </p>
          </div>

          <div className={`grid gap-6 ${
            plans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
            plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
            plans.length === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
            'md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {plans.map((plan, idx) => {
              const Icon = ICON_MAP[plan.icon] || Crown;
              const isSelected = selectedPlan === plan.plan_id;
              const planFeatures = Array.isArray(plan.features) ? plan.features : [];
              const displayPrice = getDisplayPrice(plan);

              return (
                <motion.div
                  key={plan.plan_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedPlan(plan.plan_id)}
                  className={`relative bg-white rounded-3xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group hover:shadow-2xl hover:-translate-y-2 ${
                    isSelected
                      ? "border-teal-500 shadow-xl shadow-teal-100 scale-105"
                      : "border-gray-100 hover:border-teal-300"
                  } ${plan.popular ? "ring-4 ring-teal-100" : ""}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className={`p-6 ${plan.popular ? "pt-14" : ""}`}>
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl ${plan.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-black text-gray-900 mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-semibold mb-4">
                      {plan.duration}
                    </p>

                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900">
                          ₹{displayPrice.toFixed(2)}
                        </span>
                        {(plan.original_price || (promoDiscount && isSelected)) && (
                          <span className="text-lg text-gray-400 line-through">
                            ₹{plan.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        ₹{plan.price_per_month.toFixed(2)}/month
                      </p>
                      {plan.discount_text && (
                        <div className="inline-block mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          {plan.discount_text}
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-4"></div>

                    {/* Premium Features (Global) */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                        All Premium Features:
                      </h4>
                      <ul className="space-y-2">
                        {features.map((feature) => {
                          const FeatureIcon = ICON_MAP[feature.icon] || Star;
                          return (
                            <li key={feature.id} className="flex items-start gap-2 text-sm">
                              <div className={`w-5 h-5 rounded-lg ${PRIMARY_GRADIENT} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <FeatureIcon className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <span className="text-gray-900 font-semibold block">{feature.title}</span>
                                <span className="text-gray-600 text-xs">{feature.description}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Plan-Specific Features (if any) */}
                    {planFeatures.length > 0 && (
                      <>
                        <div className="border-t border-gray-100 my-4"></div>
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                            Plan Benefits:
                          </h4>
                          <ul className="space-y-2">
                            {planFeatures.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <Check className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 font-medium">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    {/* CTA Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(plan.plan_id);
                      }}
                      className={`w-full h-12 rounded-xl font-bold text-white transition-all ${
                        isSelected
                          ? `${plan.gradient} shadow-lg hover:shadow-xl`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {isSelected ? "Get This Plan" : "Choose Plan"}
                    </Button>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="selectedPlan"
                      className="absolute inset-0 border-4 border-teal-500 rounded-3xl pointer-events-none"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* ✅ PROMO CODE INPUT - INSERTED AFTER PLAN CARDS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <PromoCodeInput
              selectedPlan={selectedPlan}
              onPromoApplied={handlePromoApplied}
              onPromoRemoved={handlePromoRemoved}
            />
          </motion.div>

          {/* Purchase Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={() => handlePurchase(selectedPlan)}
              disabled={!selectedPlan}
              size="lg"
              className={`${PRIMARY_GRADIENT} text-white px-12 h-16 rounded-full text-lg font-bold shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Crown className="w-5 h-5 mr-2" />
              {promoDiscount && promoDiscount.finalPrice === 0 ? 'Activate Free Plan' : 'Get Premium Now'}
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              {promoDiscount && promoDiscount.finalPrice === 0 
                ? `Promo code "${promoDiscount.code}" applied - Plan is FREE! 🎉`
                : 'Cancel anytime • Secure payment • Money-back guarantee'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Join 500,000+ Premium Members
            </h2>
            <p className="text-xl text-gray-600">
              See what they're saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah M.",
                text: "Got 5 matches in my first day! Worth every penny.",
                rating: 5,
              },
              {
                name: "Mike T.",
                text: "The boost feature is a game changer. Met my girlfriend through this!",
                rating: 5,
              },
              {
                name: "Emma L.",
                text: "Finally found someone special. Best investment I've made.",
                rating: 5,
              },
            ].map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 p-6 rounded-2xl border border-gray-100"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <p className="text-sm font-bold text-gray-900">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-black text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! You can cancel your subscription at any time. You'll have access until the end of your billing period.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and PayPal.",
              },
              {
                q: "Is there a free trial?",
                a: "We don't offer free trials, but we do have a 7-day money-back guarantee if you're not satisfied.",
              },
              {
                q: "Do premium features work everywhere?",
                a: "Yes! Premium features work globally in all countries where The Dating App is available.",
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-2xl border border-gray-100"
              >
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-teal-500 to-blue-600 text-white relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-black mb-6">
            Ready to Find Your Match?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join premium today and start connecting with the right people.
          </p>
          <Button
            onClick={() => handlePurchase(selectedPlan)}
            disabled={!selectedPlan}
            size="lg"
            className="bg-white text-teal-600 hover:bg-gray-100 px-12 h-16 rounded-full text-lg font-bold shadow-2xl disabled:opacity-50"
          >
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PremiumPage;