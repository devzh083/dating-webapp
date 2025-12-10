// src/components/onboarding/OnboardingFlow.tsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { ProgressBar } from "./ProgressBar";
import { Step1BasicInfo } from "./steps/Step1BasicInfo";
import { Step2Orientation } from "./steps/Step2Orientation";
import { Step3Distance } from "./steps/Step3Distance";
import { Step4Lifestyle } from "./steps/Step4Lifestyle";
import { Step5Communication } from "./steps/Step5Communication";
import { Step6Interests } from "./steps/Step6Interests";
import { Step7Location } from "./steps/Step7Location";
import { Step8Review } from "./steps/Step8Review";

interface OnboardingData {
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
}

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
};

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const navigate = useNavigate();

  const goNext = () => {
    setStep((prev) => (prev < 8 ? prev + 1 : prev));
  };

  const goBack = () => {
    setStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleSkip = () => {
    goNext();
  };

  // 🔹 This is ONLY used on step 8
  const handleFinish = () => {
    onComplete();        // tell App.tsx “onboarding done”
    navigate("/home");   // then go to home
  };

  const mergeData = (partial: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...partial }));

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
            onChange={mergeData}
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
            onChange={mergeData}
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
            onChange={mergeData}
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
            onChange={mergeData}
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
            onChange={mergeData}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 6:
        return (
          <Step6Interests
            data={{ interests: data.interests }}
            onChange={mergeData}
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
            onChange={mergeData}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 8:
        return (
          <Step8Review
            data={data}
            onNext={handleFinish}   // ✅ last next → home
            onBack={goBack}
            onSkip={handleFinish}   // ✅ last skip → home
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[70vh] bg-white flex flex-col">
      <div className="px-6 pt-4 pb-6">
        <ProgressBar currentStep={step} totalSteps={8} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex-1"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
