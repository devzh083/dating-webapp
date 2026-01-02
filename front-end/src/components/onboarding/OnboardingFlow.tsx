import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Layout Components
import TopBar from "@/components/layout/TopBar";
import ProgressBar from "@/components/onboarding/ProgressBar";

// Step Components
// Note: Ensure all these components are updated to accept the 'onSkip' prop!
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Orientation from "./steps/Step2Orientation"; // Repurposed for Relationship Status
import Step3Distance from "./steps/Step3Distance";
import Step4Lifestyle from "./steps/Step4Lifestyle";
import Step5Communication from "./steps/Step5Communication";
import Step6Interests from "./steps/Step6Interests";
import Step7Location from "./steps/Step7Location";
// Step 8 (Photos) is REMOVED
import Step9Bio from "./steps/Step9Bio"; // Now acts as Step 8
import Step10Review from "./steps/Step10Review"; // Now acts as Step 9

// --- TYPE DEFINITIONS ---
export type OnboardingData = {
  firstName: string;
  dateOfBirth: Date | undefined;
  gender: "Boy" | "Girl" | ""; // Restricted to Boy/Girl
  showGender: boolean;
  interestedIn: string[];
  orientation: string[];
  showOrientation: boolean;
  relationshipType: string; // "Single", "Committed", etc.
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
  bio: string;
  conversationStarter: string;
  // photos: string[]; // REMOVED
};

const TOTAL_STEPS = 9; // Reduced from 10

const initialData: OnboardingData = {
  firstName: "",
  dateOfBirth: undefined,
  gender: "",
  showGender: true,
  interestedIn: [],
  orientation: [],
  showOrientation: true,
  relationshipType: "",
  distance: 50,
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
  bio: "",
  conversationStarter: "",
};

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const navigate = useNavigate();

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    // Load saved data
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Rehydrate Dates
        parsed.dateOfBirth = parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : undefined;
        // Ensure fields exist (Migration safety)
        if (!parsed.bio) parsed.bio = "";
        if (!parsed.conversationStarter) parsed.conversationStarter = "";
        setData(parsed);
      } catch (error) {
        console.error("Failed to load onboarding data:", error);
      }
    }

    // Load saved step (Resume functionality)
    const savedStep = localStorage.getItem("onboardingStep");
    if (savedStep) {
      const stepNum = parseInt(savedStep, 10);
      if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= TOTAL_STEPS) {
        setStep(stepNum);
      }
    }
  }, []);

  // --- 2. PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("onboardingData", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("onboardingStep", step.toString());
  }, [step]);

  // --- 3. HANDLERS ---
  const setStepData = (patch: Partial<OnboardingData>) => {
    setData((d) => ({ ...d, ...patch }));
  };

  const saveProfile = async () => {
    try {
      const payload = {
        ...data,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : null,
      };

      const res = await fetch("http://localhost:8000/api/profile/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) console.error("Failed to save profile");
    } catch (err) {
      console.error("Error saving profile", err);
    }
  };

  const goNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    // Final Step Completion
    await saveProfile();
    localStorage.removeItem("onboardingStep"); // Clear progress
    
    if (onComplete) {
      onComplete();
    } else {
      navigate("/home");
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSkip = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      // If skipping the final step, just finish
      await saveProfile();
      localStorage.removeItem("onboardingStep");
      if (onComplete) onComplete();
      else navigate("/home");
    }
  };

  // --- 4. PROGRESS CALCULATION ---
  const completionPercent = useMemo(() => {
    // Basic heuristic for completion (Photos check removed)
    const checks = [
      !!data.firstName?.trim(),
      !!data.dateOfBirth,
      !!data.gender?.trim(), // Boy or Girl
      (data.interests || []).length > 0,
      !!data.location?.trim(),
      !!data.relationshipType?.trim(),
      !!data.bio?.trim(),
    ];
    const satisfied = checks.filter(Boolean).length;
    // Total checks is arbitrary, just for the label
    return Math.round((satisfied / 7) * 100); 
  }, [data]);

  const completionLabel = completionPercent === 0 
    ? "Start your profile" 
    : `${Math.min(100, completionPercent)}% complete`;

  const displayName = data.firstName?.trim() || "User";

  // --- 5. RENDER LOGIC ---
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1BasicInfo 
            data={data} 
            onChange={setStepData} 
            onNext={goNext} 
            onSkip={handleSkip} 
          />
        );
      case 2:
        return (
          <Step2Orientation 
            data={data} 
            onChange={setStepData} 
            onNext={goNext} 
            onBack={goBack} 
            onSkip={handleSkip} 
          />
        );
      case 3:
        return (
          <Step3Distance 
            data={data} 
            onChange={setStepData} 
            onNext={goNext} 
            onBack={goBack} 
            onSkip={handleSkip} 
          />
        );
      case 4:
        return (
          <Step4Lifestyle 
            data={data} 
            onChange={setStepData} 
            onNext={goNext} 
            onBack={goBack} 
            onSkip={handleSkip} 
          />
        );
      case 5:
        return (
          <Step5Communication 
            data={data} 
            onChange={setStepData} 
            onNext={goNext} 
            onBack={goBack} 
            onSkip={handleSkip} 
          />
        );
      case 6:
        return (
          <Step6Interests 
            data={data} 
            onChange={setStepData} 
            onNext={goNext} 
            onBack={goBack} 
            onSkip={handleSkip} 
          />
        );
      case 7:
        return (
          <Step7Location 
            data={data} 
            onChange={setStepData} 
            onNext={goNext} 
            onBack={goBack} 
            onSkip={handleSkip} 
          />
        );
      case 8: // Formerly Step 9
        return (
          <Step9Bio 
            data={data} 
            onChange={setStepData} 
            onNext={goNext} 
            onBack={goBack} 
            onSkip={handleSkip} 
          />
        );
      case 9: // Formerly Step 10
      default:
        return (
          <Step10Review 
            data={data} 
            onNext={goNext} 
            onBack={goBack} 
            // Usually we don't skip the review, but we can allow finishing without review
            onSkip={handleSkip} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar userName={displayName} />
      
      {/* Progress Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 sticky top-16 bg-white z-40">
        <div className="flex-1">
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>
        <div className="ml-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
          {completionLabel}
        </div>
      </div>

      {/* Main Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 overflow-y-auto"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}