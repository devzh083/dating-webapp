import { StepLayout } from "../StepLayout";
import { ChipSelector } from "../ChipSelector";

interface Step4Props {
  data: {
    drinking: string;
    smoking: string;
    workout: string;
    pets: string;
  };
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
    { label: "Daily", emoji: "🏋️" },
  ],
  pets: [
    { label: "Own pets", emoji: "🐕" },
    { label: "Love pets", emoji: "❤️" },
    { label: "Allergic", emoji: "🤧" },
    { label: "None", emoji: "🚫" },
  ],
};

export const Step4Lifestyle = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step4Props) => {
  return (
    <StepLayout
      currentStep={4}
      totalSteps={8}
      title="Your lifestyle"
      subtitle="No judgment here — just finding your vibe"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
    >
      <div className="space-y-8">
        {/* Drinking */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Drinking
          </label>
          <div className="flex flex-wrap gap-2">
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

        {/* Smoking */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Smoking
          </label>
          <div className="flex flex-wrap gap-2">
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

        {/* Workout */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Working out
          </label>
          <div className="flex flex-wrap gap-2">
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

        {/* Pets */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Pets
          </label>
          <div className="flex flex-wrap gap-2">
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
      </div>
    </StepLayout>
  );
};
