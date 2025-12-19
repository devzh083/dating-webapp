// src/components/onboarding/steps/Step2Orientation.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { CheckboxField } from "../CheckboxField";
import { OnboardingData } from "../OnboardingFlow";

interface Step2Props {
  data: Pick<OnboardingData, 'orientation' | 'showOrientation' | 'relationshipType'>;
  onChange: (data: Step2Props['data']) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const orientationOptions = [
  "Straight",
  "Gay",
  "Lesbian",
  "Bisexual",
  "Pansexual",
  "Asexual",
  "Queer",
  "Prefer not to say",
];

const relationshipOptions = [
  { label: "Long-term", emoji: "💕" },
  { label: "Short-term", emoji: "✨" },
  { label: "Casual", emoji: "🎉" },
  { label: "Serious dating", emoji: "💎" },
  { label: "Friendship", emoji: "🤝" },
  { label: "Still figuring it out", emoji: "🤔" },
];

export const Step2Orientation = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step2Props) => {
  const toggleOrientation = (orientation: string) => {
    const current = data.orientation;
    if (current.includes(orientation)) {
      onChange({
        ...data,
        orientation: current.filter((o) => o !== orientation),
      });
    } else {
      onChange({ ...data, orientation: [...current, orientation] });
    }
  };

  return (
    <StepLayout
      currentStep={2}
      totalSteps={8}
      title="Your identity & intentions"
      subtitle="Help us understand what you're looking for"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={data.orientation.length > 0 && !!data.relationshipType}
    >
      <div className="space-y-10">
        {/* Sexual Orientation Section */}
        <div className="space-y-4">
          <div>
            <label className="text-base font-semibold text-gray-900">
              Sexual orientation
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Select all that apply
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {orientationOptions.map((orientation) => (
              <ChipSelector
                key={orientation}
                label={orientation}
                selected={data.orientation.includes(orientation)}
                onClick={() => toggleOrientation(orientation)}
              />
            ))}
          </div>

          <div className="pt-2">
            <CheckboxField
              label="Show orientation on my profile"
              checked={data.showOrientation}
              onChange={(showOrientation) => onChange({ ...data, showOrientation })}
            />
          </div>
        </div>

        {/* Relationship Intent Section */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900 block">
            What are you looking for?
          </label>
          <div className="flex flex-wrap gap-3">
            {relationshipOptions.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.relationshipType === label}
                onClick={() => onChange({ ...data, relationshipType: label })}
              />
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step2Orientation;