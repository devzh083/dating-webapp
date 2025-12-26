// src/components/onboarding/steps/Step2Orientation.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { CheckboxField } from "../CheckboxField";
import { OnboardingData } from "../OnboardingFlow";

interface Step2Props {
  data: Pick<
    OnboardingData,
    "orientation" | "showOrientation" | "relationshipType"
  >;
  onChange: (data: Step2Props["data"]) => void;
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

export default function Step2Orientation({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step2Props) {
  const toggleOrientation = (orientation: string) => {
    const current = data.orientation;
    onChange({
      ...data,
      orientation: current.includes(orientation)
        ? current.filter((o) => o !== orientation)
        : [...current, orientation],
    });
  };

  return (
    <StepLayout
      currentStep={2}
      totalSteps={10}
      title="What are you into?"
      subtitle="This helps us find better matches for you"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={!!data.relationshipType}
    >
      <div className="flex flex-col gap-16">

        {/* ORIENTATION */}
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Your sexual orientation
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Select all that feel right — you can change this later
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

          <CheckboxField
            label="Show my orientation on my profile"
            checked={data.showOrientation}
            onChange={(showOrientation) =>
              onChange({ ...data, showOrientation })
            }
          />
        </div>

        {/* RELATIONSHIP INTENT (PRIMARY) */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              What are you looking for right now?
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Pick what best matches your current vibe
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {relationshipOptions.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.relationshipType === label}
                onClick={() =>
                  onChange({ ...data, relationshipType: label })
                }
              />
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
