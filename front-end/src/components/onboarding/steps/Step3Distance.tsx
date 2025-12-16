// src/components/onboarding/steps/Step3Distance.tsx
import StepLayout from "../StepLayout";
import { CustomSlider } from "../CustomSlider";
import { ToggleSwitch } from "../ToggleSwitch";
import { MapPin } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";

interface Step3Props {
  data: Pick<OnboardingData, 'distance' | 'strictDistance'>;
  onChange: (data: Step3Props['data']) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Step3Distance = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step3Props) => {
  return (
    <StepLayout
      currentStep={3}
      totalSteps={9}  // ✅ Changed from 8 to 9
      title="How far would you go?"
      subtitle="Set your maximum distance for matches"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
    >
      <div className="space-y-8">
        {/* Visual Icon */}
        <div className="flex justify-center py-6">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <MapPin className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>

        {/* Distance Slider */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-foreground">
            Maximum distance
          </label>
          <CustomSlider
            value={data.distance}
            min={1}
            max={150}
            step={1}
            unit=" km"
            onChange={(distance) => onChange({ ...data, distance })}
          />
        </div>

        {/* Strict Distance Toggle */}
        <ToggleSwitch
          label="Only show people within this range"
          checked={data.strictDistance}
          onChange={(strictDistance) => onChange({ ...data, strictDistance })}
        />

        <p className="text-xs text-muted-foreground text-center">
          You can always adjust this later in settings
        </p>
      </div>
    </StepLayout>
  );
};

export default Step3Distance;
