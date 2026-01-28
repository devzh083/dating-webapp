import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Layout Components
import TopBar from "@/components/layout/TopBar";

import { useNavigate, useLocation } from "react-router-dom";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Orientation from "./steps/Step2Orientation";
import Step3Lifestyle from "./steps/Step3Lifestyle";
import Step4Communication from "./steps/Step4Communication";
import Step5Interests from "./steps/Step5Interests";
import Step6Location from "./steps/Step6Location";
import Step7Photos from "./steps/Step7Photos";
import Step8Bio from "./steps/Step8Bio";
import Step9Social from "./steps/Step9Social";
import Step10Review from "./steps/Step10Review";
import { profileService } from "../../services/profileService";

// --- TYPE DEFINITIONS ---
export type OnboardingData = {
  firstName: string;
  dateOfBirth: Date | null;
  gender: string;
  showGender: boolean;
  interestedIn: string[];
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
};

const initialData: OnboardingData = {
  firstName: "",
  dateOfBirth: null,
  gender: "",
  showGender: false,
  interestedIn: [],
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

  // Load existing profile + start step
  useEffect(() => {
    loadExistingProfile();

    const state = location.state as { startStep?: number } | null;
    if (state?.startStep) {
      setCurrentStep(state.startStep);
    }
  }, []);

  const setStepData = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const handleFinish = () => {
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
    }
  };

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 10) {
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

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const handleSkip = () => {
    goNext();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1BasicInfo data={data} onChange={setStepData} onNext={goNext} onSkip={handleSkip} />;
      case 2:
        return <Step2Orientation data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 3:
        return <Step3Lifestyle data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 4:
        return <Step4Communication data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 5:
        return <Step5Interests data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 6:
        return <Step6Location data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 7:
        return <Step7Photos data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 8:
        return <Step8Bio data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 9:
        return <Step9Social data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      default:
        return <Step10Review data={data} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar userName={data.firstName || "User"} />

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