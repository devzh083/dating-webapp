// src/components/onboarding/steps/Step3Distance.tsx
import StepLayout from "../StepLayout";
import { CustomSlider } from "../CustomSlider";
import { ToggleSwitch } from "../ToggleSwitch";
import { MapPin } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";

interface Step3Props {
  data: Pick<OnboardingData, "distance" | "strictDistance">;
  onChange: (data: Step3Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function Step3Distance({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step3Props) {
  return (
    <StepLayout
      currentStep={3}
      totalSteps={10}
      title="How far should matches be?"
      subtitle="Choose a distance that feels right for you"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={true}
    >
      <div className="flex flex-col gap-14">

        {/* ICON */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-teal-600" />
          </div>
        </div>

        {/* DISTANCE */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Maximum distance
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              We’ll show you people within{" "}
              <span className="font-semibold text-gray-800">
                {data.distance} km
              </span>
            </p>
          </div>

          <CustomSlider
            value={data.distance}
            min={1}
            max={150}
            step={1}
            unit="km"
            onChange={(distance) => onChange({ ...data, distance })}
          />
        </div>

        {/* TOGGLE */}
        <div className="space-y-3">
          <ToggleSwitch
            label="Only show people within this distance"
            checked={data.strictDistance}
            onChange={(strictDistance) =>
              onChange({ ...data, strictDistance })
            }
          />
          <p className="text-xs text-gray-500 pl-1">
            When turned off, we may occasionally show slightly farther matches
          </p>
        </div>

        {/* FOOTNOTE */}
        <p className="text-xs text-gray-400 text-center">
          You can always adjust this later
        </p>
      </div>
    </StepLayout>
  );
}
