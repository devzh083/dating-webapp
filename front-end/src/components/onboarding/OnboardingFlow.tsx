// src/components/onboarding/OnboardingFlow.tsx
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import TopBar from "@/components/layout/TopBar";
import ProgressBar from "@/components/onboarding/ProgressBar";

import StepLayout from "./StepLayout";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Orientation from "./steps/Step2Orientation";
import Step3Distance from "./steps/Step3Distance";
import Step4Lifestyle from "./steps/Step4Lifestyle";
import Step5Communication from "./steps/Step5Communication";
import Step6Interests from "./steps/Step6Interests";
import Step7Location from "./steps/Step7Location";
import Step8Photos from "./steps/Step8Photos";
import Step9Review from "./steps/Step9Review";

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
};

const TOTAL_STEPS = 9;

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
};

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const navigate = useNavigate();

  // load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("onboardingData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.dateOfBirth = parsed.dateOfBirth
          ? new Date(parsed.dateOfBirth)
          : undefined;
        setData(parsed);
      } catch (error) {
        console.error("Failed to load onboarding data:", error);
      }
    }
  }, []);

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem("onboardingData", JSON.stringify(data));
  }, [data]);

  const setStepData = (patch: Partial<OnboardingData>) => {
    setData((d) => ({ ...d, ...patch }));
  };

  // ---- API: save profile ----
  const saveProfile = async () => {
    try {
      const payload = {
        ...data,
        dateOfBirth: data.dateOfBirth
          ? data.dateOfBirth.toISOString()
          : null,
      };

      const res = await fetch("http://localhost:8000/api/profile/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("access_token") || ""
          }`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to save profile", await res.text());
      }
    } catch (err) {
      console.error("Error saving profile", err);
    }
  };

  const goNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    await saveProfile();

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
      await saveProfile();
      if (onComplete) onComplete();
      else navigate("/home");
    }
  };

  const completionPercent = useMemo(() => {
    const checks = [
      !!data.firstName?.trim(),
      !!data.dateOfBirth,
      !!data.gender?.trim(),
      (data.interests || []).length > 0,
      !!data.location?.trim(),
      (data.photos || []).length > 0,
      !!data.relationshipType?.trim(),
    ];
    const satisfied = checks.filter(Boolean).length;
    return Math.round((satisfied / checks.length) * 100);
  }, [data]);

  const completionLabel =
    completionPercent === 0
      ? "Please set up your profile"
      : `${completionPercent}% complete`;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1BasicInfo
            data={{
              firstName: data.firstName,
              dateOfBirth: data.dateOfBirth,
              gender: data.gender,
              showGender: data.showGender,
              interestedIn: data.interestedIn,
            }}
            onChange={(p) => setStepData(p)}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 2:
        return (
          <Step2Orientation
            data={{
              orientation: data.orientation,
              showOrientation: data.showOrientation,
              relationshipType: data.relationshipType,
            }}
            onChange={(p) => setStepData(p)}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 3:
        return (
          <Step3Distance
            data={{
              distance: data.distance,
              strictDistance: data.strictDistance,
            }}
            onChange={(p) => setStepData(p)}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 4:
        return (
          <Step4Lifestyle
            data={{
              drinking: data.drinking,
              smoking: data.smoking,
              workout: data.workout,
              pets: data.pets,
            }}
            onChange={(p) => setStepData(p)}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 5:
        return (
          <Step5Communication
            data={{
              communicationStyle: data.communicationStyle,
              responsePace: data.responsePace,
            }}
            onChange={(p) => setStepData(p)}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 6:
        return (
          <Step6Interests
            data={{ interests: data.interests }}
            onChange={(p) => setStepData(p)}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 7:
        return (
          <Step7Location
            data={{
              location: data.location,
              useCurrentLocation: data.useCurrentLocation,
            }}
            onChange={(p) => setStepData(p)}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 8:
        return (
          <Step8Photos
            data={{ photos: data.photos || [] }}
            onChange={(p) => setStepData(p)}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 9:
      default:
        return (
          <Step9Review
            data={data}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
    }
  };

  const displayName = data.firstName?.trim() || "User";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar userName={displayName} />
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <div className="flex-1">
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>
        <div className="ml-4 text-sm font-medium text-muted-foreground">
          {completionLabel}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
