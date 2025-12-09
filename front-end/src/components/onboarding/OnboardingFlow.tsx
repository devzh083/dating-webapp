import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Step1BasicInfo } from "./steps/Step1BasicInfo";
import { Step2Orientation } from "./steps/Step2Orientation";
import { Step3Distance } from "./steps/Step3Distance";
import { Step4Lifestyle } from "./steps/Step4Lifestyle";
import { Step5Communication } from "./steps/Step5Communication";
import { Step6Interests } from "./steps/Step6Interests";
import { Step7Location } from "./steps/Step7Location";
import { Step8Review } from "./steps/Step8Review";
import { useToast } from "../../hooks/use-toast";

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

export const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const { toast } = useToast();

  const goNext = () => {
    if (step < 8) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      toast({
        title: "Welcome to the app! 🎉",
        description: "Your profile is set up. Start matching now!",
      });
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    goNext();
  };

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
            onChange={(stepData) => setData({ ...data, ...stepData })}
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
            onChange={(stepData) => setData({ ...data, ...stepData })}
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
            onChange={(stepData) => setData({ ...data, ...stepData })}
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
            onChange={(stepData) => setData({ ...data, ...stepData })}
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
            onChange={(stepData) => setData({ ...data, ...stepData })}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 6:
        return (
          <Step6Interests
            data={{ interests: data.interests }}
            onChange={(stepData) => setData({ ...data, ...stepData })}
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
            onChange={(stepData) => setData({ ...data, ...stepData })}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 8:
        return (
          <Step8Review
            data={data}
            onNext={goNext}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
};
export default OnboardingFlow;
