// src/components/onboarding/steps/Step4Lifestyle.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { OnboardingData } from "../OnboardingFlow";

interface Step4Props {
  data: Pick<OnboardingData, "drinking" | "smoking" | "workout" | "pets">;
  onChange: (data: Step4Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const lifestyleOptions = {
  drinking: [
    { label: "Never", emoji: "🚫" },
    { label: "Socially", emoji: "🍷" },
    { label: "Regularly", emoji: "🍻" },
  ],
  smoking: [
    { label: "Never", emoji: "🚭" },
    { label: "Sometimes", emoji: "💨" },
    { label: "Regularly", emoji: "🚬" },
  ],
  workout: [
    { label: "Never", emoji: "🛋️" },
    { label: "Sometimes", emoji: "🚶" },
    { label: "Often", emoji: "💪" },
    { label: "Daily", emoji: "✨" },
  ],
  pets: [
    { label: "Have pets", emoji: "🐾" },
    { label: "Love pets", emoji: "❤️" },
    { label: "Allergic", emoji: "🤧" },
    { label: "No pets", emoji: "🚫" },
  ],
} as const;

export default function Step4Lifestyle({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step4Props) {
  return (
    <StepLayout
      currentStep={4}
      totalSteps={10}
      title="Your lifestyle"
      subtitle="Just a few things about your everyday habits"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={true}
    >
      <div className="flex flex-col gap-16">

        {/* DRINKING */}
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Drinking habits
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Totally judgment-free 🍃
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {lifestyleOptions.drinking.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.drinking === label}
                onClick={() => onChange({ ...data, drinking: label })}
              />
            ))}
          </div>
        </div>

        {/* SMOKING */}
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Smoking
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {lifestyleOptions.smoking.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.smoking === label}
                onClick={() => onChange({ ...data, smoking: label })}
              />
            ))}
          </div>
        </div>

        {/* WORKOUT */}
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Working out
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              However you like to move 💫
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {lifestyleOptions.workout.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.workout === label}
                onClick={() => onChange({ ...data, workout: label })}
              />
            ))}
          </div>
        </div>

        {/* PETS */}
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Pets
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {lifestyleOptions.pets.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.pets === label}
                onClick={() => onChange({ ...data, pets: label })}
              />
            ))}
          </div>
        </div>

        {/* FOOTNOTE */}
        <p className="text-xs text-gray-400 text-center">
          You can always update these later
        </p>
      </div>
    </StepLayout>
  );
}
