// src/components/onboarding/OnboardingFlow.tsx
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import TopBar from "@/components/layout/TopBar";
import ProgressBar from "@/components/onboarding/ProgressBar"; // <- correct path

import StepLayout from "./StepLayout";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Orientation from "./steps/Step2Orientation";
import Step3Distance from "./steps/Step3Distance";
import Step4Lifestyle from "./steps/Step4Lifestyle";
import Step5Communication from "./steps/Step5Communication";
import Step6Interests from "./steps/Step6Interests";
import Step7Location from "./steps/Step7Location";
import Step8Photos from "./steps/Step8Photos"; // your image-collection step
import Step9Review from "./steps/Step9Review"; // review (final) step

interface OnboardingFlowProps {
  onComplete?: () => void; // App will pass this down
}

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
  photos?: string[]; // for Step8Photos
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

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const navigate = useNavigate();

  const setStepData = (patch: Partial<OnboardingData>) => {
    setData((d) => ({ ...d, ...patch }));
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    // final step completed
    if (onComplete) {
      onComplete();
    } else {
      navigate("/home");
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSkip = () => {
    // By default skip advances to the next step. The final step's onSkip
    // is wired below to finish.
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      goNext();
    }
  };

  // --- Simple completion heuristic (used to show "please set up profile" vs percent)
  // You can tune which fields count.
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
    const percent = Math.round((satisfied / checks.length) * 100);
    return percent;
  }, [data]);

  const completionLabel =
    completionPercent === 0 ? "Please set up your profile" : `${completionPercent}% complete`;

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
            onChange={(patch) => setStepData(patch)}
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
            onChange={(patch) => setStepData(patch)}
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
            onChange={(patch) => setStepData(patch)}
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
            onChange={(patch) => setStepData(patch)}
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
            onChange={(patch) => setStepData(patch)}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 6:
        return (
          <Step6Interests
            data={{ interests: data.interests }}
            onChange={(patch) => setStepData(patch)}
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
            onChange={(patch) => setStepData(patch)}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 8:
        return (
          <Step8Photos
            data={{ photos: data.photos || [] }}
            onChange={(patch) => setStepData(patch)}
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
            onSkip={() => {
              // Final skip should finish onboarding
              if (onComplete) onComplete();
              else navigate("/home");
            }}
          />
        );
    }
  };

  const displayName = data.firstName?.trim() || "User";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar always visible during onboarding */}
      <TopBar userName={displayName} />

      {/* Progress bar row */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <div className="flex-1">
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>

        {/* Right side: show real completion percent or a prompt */}
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
