import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Layout Components
import TopBar from "@/components/layout/TopBar";
import ProgressBar from "@/components/onboarding/ProgressBar";


import { useNavigate, useLocation } from "react-router-dom";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Orientation from "./steps/Step2Orientation";
import Step3Distance from "./steps/Step3Distance";
import Step4Lifestyle from "./steps/Step4Lifestyle";
import Step5Communication from "./steps/Step5Communication";
import Step6Interests from "./steps/Step6Interests";
import Step7Location from "./steps/Step7Location";
import Step8Photos from "./steps/Step8Photos";
import Step9Bio from "./steps/Step9Bio";
import Step10Social from "./steps/Step10Social";
import Step11Review from "./steps/Step11Review";
import { profileService } from "../../services/profileService";

// --- TYPE DEFINITIONS ---
export type OnboardingData = {
  firstName: string;
  dateOfBirth: Date | null;
  gender: string;
  showGender: boolean;
  interestedIn: string[];
  orientation: string[];
  showOrientation: boolean;
  relationshipType: string;
  distance: number;
  strictDistance: boolean;
  drinking: string;
  smoking: string;
  workout: string;
  pets: string;
  communicationStyle: string[];
  responsePace: string;
  interests: string[];
  location: string;
  useCurrentLocation: boolean;
  photos: string[];
  bio: string;
  conversationStarter: string;
  socialAccounts?: {
    instagram: string;
    whatsapp: string;
    snapchat: string;
    twitter: string;
    linkedin: string;
  };
}

const initialData: OnboardingData = {
  firstName: "",
  dateOfBirth: null,
  gender: "",
  showGender: false,
  interestedIn: [],
  orientation: [],
  showOrientation: false,
  relationshipType: "",
  distance: 25,
  strictDistance: false,
  drinking: "",
  smoking: "",
  workout: "",
  pets: "",
  communicationStyle: [],
  responsePace: "",
  interests: [],
  location: "",
  useCurrentLocation: false,
  photos: [],
  bio: "",
  conversationStarter: "",
  socialAccounts: {
    instagram: "",
    whatsapp: "",
    snapchat: "",
    twitter: "",
    linkedin: "",
  },
};

const TOTAL_STEPS = 10;

export default function OnboardingFlow({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Restore Date object
        if (parsed.dateOfBirth) {
          parsed.dateOfBirth = new Date(parsed.dateOfBirth);
        }
        setData({ ...initialData, ...parsed });
      } catch (e) {
        console.error("Failed to parse onboarding data", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("onboardingData", JSON.stringify(data));
  }, [data]);

  const setStepData = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const handleFinish = () => {
    // Clear temp storage
    // localStorage.removeItem("onboardingData"); 
    // ^ Optional: keep it if you want to remember user's choices if they come back
    if (onComplete) {
      onComplete();
    } else {
      navigate("/home");
    }
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
  // Load existing profile data when component mounts
  useEffect(() => {
    loadExistingProfile();
    
    // Check if we should start at a specific step
    const state = location.state as { startStep?: number } | null;
    if (state?.startStep) {
      setCurrentStep(state.startStep);
    }
  }, []);

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };


  const loadExistingProfile = async () => {
    try {
      setIsLoading(true);
      const result = await profileService.getProfile();
      
      if (result.exists && result.data) {
        console.log("✅ Loading existing profile for editing:", result.data);
        setData(result.data);
      } else {
        console.log("ℹ️ No existing profile found, starting fresh");
      }
    } catch (err) {
      console.error("⚠️ Error loading profile:", err);
      // Continue with empty data if loading fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 11) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // const handleSkip = () => {
  //   handleNext();
  // };

  // const handleFinish = async () => {
  //   console.log("=== SAVING PROFILE ===");
  //   console.log("Current data state:", data);
    
  //   setIsSaving(true);
  //   setError(null);
    
  //   try {
  //     console.log("Sending to API:", data);
      
  //     const result = await profileService.saveProfile(data);
  //     console.log("✅ Profile saved successfully:", result);
      
  //     await new Promise(resolve => setTimeout(resolve, 500));
      
  //     navigate("/home");
  //   } catch (err: any) {
  //     console.error("❌ Error saving profile:", err);
  //     setError(err.message || "Failed to save profile. Please try again.");
  //     setIsSaving(false);
  //   }
  // };

  const updateData = (newData: Partial<OnboardingData>) => {
    console.log(`Step ${currentStep} - Updating data:`, newData);
    setData((prev) => {
      const updated = { ...prev, ...newData };
      console.log("Updated state:", updated);
      return updated;
    });
  };

  const handleSkip = () => {
    // Logic for skipping a step (usually just goes next)
    goNext();
  };

  

  // --- RENDER CURRENT STEP ---
  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1BasicInfo data={data} onChange={setStepData} onNext={goNext} onSkip={handleSkip} />;
      case 2:
        return <Step2Orientation data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 3:
        return <Step3Distance data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 4:
        return <Step4Lifestyle data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 5:
        return <Step5Communication data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 6:
        return <Step6Interests data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 7:
        return <Step7Location data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 8:
        return <Step8Photos data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 9:
        return <Step9Bio data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 10:
        return <Step10Social data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      default:
        return <Step11Review data={data} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar userName={data.firstName || "User"} />
      
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 sticky top-16 bg-white z-40">
        <div className="flex-1">
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>
        <div className="ml-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
          Step {step}/{TOTAL_STEPS}
        </div>
      </div>
   
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
}}