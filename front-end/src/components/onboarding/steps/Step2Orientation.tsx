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
      totalSteps={9}
      title="Your identity & intentions"
      subtitle="Help us understand what you're looking for"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
    >
      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Sexual orientation
          </label>
          <p className="text-xs text-muted-foreground">
            Select all that apply
          </p>
          <div className="flex flex-wrap gap-2">
            {orientationOptions.map((orientation) => (
              <ChipSelector
                key={orientation}
                label={orientation}
                selected={data.orientation.includes(orientation)}
                onClick={() => toggleOrientation(orientation)}
              />
            ))}
          </div>
          <CheckboxField
            label="Show orientation on my profile"
            checked={data.showOrientation}
            onChange={(showOrientation) => onChange({ ...data, showOrientation })}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            What are you looking for?
          </label>
          <div className="flex flex-wrap gap-2">
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
