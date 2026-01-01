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

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);                 // current page number
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // ---- load from localStorage on mount ----
  useEffect(() => {
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        parsed.dateOfBirth = parsed.dateOfBirth
          ? new Date(parsed.dateOfBirth)
          : undefined;
        if (!parsed.bio) parsed.bio = "";
        if (!parsed.conversationStarter) parsed.conversationStarter = "";
        setData(parsed);
      } catch (err) {
        console.error("Failed to parse onboardingData:", err);
      }
    }

    const savedStep = localStorage.getItem("onboardingStep");
    if (savedStep) {
      const stepNum = parseInt(savedStep, 10);
      if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= TOTAL_STEPS) {
        setStep(stepNum);
      }
    } else {
      setStep(1);
    }
  }, []);

  // ---- persist data & step to localStorage ----
  useEffect(() => {
    localStorage.setItem("onboardingData", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("onboardingStep", step.toString());
  }, [step]);

  const setStepData = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  // ---- save profile to backend, including page number ----
  const saveProfile = async (currentStep: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setIsSaving(true);
    try {
      const payload = {
        ...data,
        onboarding_step: currentStep, // page number sent to backend
        dateOfBirth: data.dateOfBirth
          ? data.dateOfBirth.toISOString()
          : null,
      };

      const res = await fetch("http://localhost:8000/api/profile/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to save profile", await res.text());
      } else {
        const json = await res.json();
        // json.completion has step & completion_percentage if you need it
        // console.log("saved profile", json);
      }
    } catch (err) {
      console.error("Error saving profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const goNext = async () => {
    await saveProfile(step); // save current page

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    // final step
    await saveProfile(TOTAL_STEPS);
    localStorage.removeItem("onboardingStep");
    if (onComplete) onComplete();
    else navigate("/home");
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSkip = async () => {
    await saveProfile(step);

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      await saveProfile(TOTAL_STEPS);
      localStorage.removeItem("onboardingStep");
      if (onComplete) onComplete();
      else navigate("/home");
    }
  };

  // simple local completion for label
  const completionPercent = useMemo(() => {
    return Math.round((step / TOTAL_STEPS) * 100);
  }, [step]);

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
            onChange={setStepData}
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
            onChange={setStepData}
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
            onChange={setStepData}
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
            onChange={setStepData}
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
            onChange={setStepData}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 6:
        return (
          <Step6Interests
            data={{ interests: data.interests }}
            onChange={setStepData}
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
            onChange={setStepData}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 8:
        return (
          <Step8Photos
            data={{ photos: data.photos || [] }}
            onChange={setStepData}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 9:
        return (
          <Step9Bio
            data={{
              bio: data.bio,
              conversationStarter: data.conversationStarter,
            }}
            onChange={setStepData}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 10:
      default:
        return (
          <Step10Review
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
          <ProgressBar
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            isSaving={isSaving}
          />
        </div>
        <div className="ml-4 text-sm font-medium text-muted-foreground">
          {completionLabel}
          {isSaving && " Saving..."}
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
