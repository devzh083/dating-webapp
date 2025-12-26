// src/components/onboarding/OnboardingFlow.tsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Orientation from "./steps/Step2Orientation";
import Step3Distance from "./steps/Step3Distance";
import Step4Lifestyle from "./steps/Step4Lifestyle";
import Step5Communication from "./steps/Step5Communication";
import Step6Interests from "./steps/Step6Interests";
import Step7Location from "./steps/Step7Location";
import Step8Photos from "./steps/Step8Photos";
import Step9Bio from "./steps/Step9Bio";
import Step10Review from "./steps/Step10Review";

export type OnboardingData = {
  firstName: string;
  dateOfBirth: Date | undefined;
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
  photos?: string[];
  bio: string;
  conversationStarter: string;
};

const TOTAL_STEPS = 10;

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
  photos: [],
  bio: "",
  conversationStarter: "",
};

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"next" | "back">("next");
  const [data, setData] = useState(initialData);
  const navigate = useNavigate();

  const setStepData = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const goNext = async () => {
    setDirection("next");

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    // ✅ FINAL STEP: SAVE PROFILE
    try {
      const payload = {
        ...data,
        dateOfBirth: data.dateOfBirth
          ? data.dateOfBirth.toISOString()
          : null,
      };

      await fetch("http://127.0.0.1:8000/api/profile/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      // ✅ Mark onboarding complete
      localStorage.setItem("onboardingCompleted", "true");
      localStorage.removeItem("onboardingData");

      // 👉 Redirect to Profile page
      navigate("/profile");
    } catch (err) {
      console.error("Profile save failed:", err);
    }
  };

  const goBack = () => {
    setDirection("back");
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSkip = () => goNext();

  const common = {
    onNext: goNext,
    onBack: goBack,
    onSkip: handleSkip,
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1BasicInfo data={data} onChange={setStepData} {...common} />;
      case 2:
        return <Step2Orientation data={data} onChange={setStepData} {...common} />;
      case 3:
        return <Step3Distance data={data} onChange={setStepData} {...common} />;
      case 4:
        return <Step4Lifestyle data={data} onChange={setStepData} {...common} />;
      case 5:
        return <Step5Communication data={data} onChange={setStepData} {...common} />;
      case 6:
        return <Step6Interests data={data} onChange={setStepData} {...common} />;
      case 7:
        return <Step7Location data={data} onChange={setStepData} {...common} />;
      case 8:
        return <Step8Photos data={data} onChange={setStepData} {...common} />;
      case 9:
        return <Step9Bio data={data} onChange={setStepData} {...common} />;
      default:
        return <Step10Review data={data} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: direction === "next" ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === "next" ? -40 : 40 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
