import StepLayout from "../StepLayout";

import { ChipSelector } from "../ChipSelector";
import { MessageCircle, Zap, Clock, Coffee } from "lucide-react";

interface Step5Props {
  data: {
    communicationStyle: string[];
    responsePace: string;
  };
  onChange: (data: Step5Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const communicationOptions = [
  { label: "Texting a lot", emoji: "💬" },
  { label: "Occasional texter", emoji: "📱" },
  { label: "Calls", emoji: "📞" },
  { label: "Video calls", emoji: "🎥" },
  { label: "In-person preferred", emoji: "☕" },
];

const paceOptions = [
  { label: "Fast", emoji: "⚡", description: "I reply right away" },
  { label: "Chill", emoji: "😌", description: "I take my time" },
  { label: "Slow responder", emoji: "🐢", description: "Be patient with me" },
];

export const Step5Communication = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step5Props) => {
  const toggleStyle = (style: string) => {
    const current = data.communicationStyle;
    if (current.includes(style)) {
      onChange({
        ...data,
        communicationStyle: current.filter((s) => s !== style),
      });
    } else {
      onChange({ ...data, communicationStyle: [...current, style] });
    }
  };

  return (
    <StepLayout
      currentStep={5}
      totalSteps={8}
      title="How do you vibe best?"
      subtitle="Let's find your communication match"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
    >
      <div className="space-y-8">
        {/* Communication Style */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Preferred ways to connect
          </label>
          <p className="text-xs text-muted-foreground">
            Select all that work for you
          </p>
          <div className="flex flex-wrap gap-2">
            {communicationOptions.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.communicationStyle.includes(label)}
                onClick={() => toggleStyle(label)}
              />
            ))}
          </div>
        </div>

        {/* Response Pace */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Your response pace
          </label>
          <div className="space-y-3">
            {paceOptions.map(({ label, emoji, description }) => (
              <button
                key={label}
                onClick={() => onChange({ ...data, responsePace: label })}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                  data.responsePace === label
                    ? "border-primary bg-chip-selected"
                    : "border-chip-border bg-chip hover:bg-chip-hover hover:border-primary/30"
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <div className="text-left">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};
export default Step5Communication;
