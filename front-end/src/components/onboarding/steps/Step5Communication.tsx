// src/components/onboarding/steps/Step5Communication.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { OnboardingData } from "../OnboardingFlow";
import { cn } from "@/lib/utils";

interface Step5Props {
  data: Pick<OnboardingData, "communicationStyle" | "responsePace">;
  onChange: (data: Step5Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const communicationOptions = [
  { label: "Texting a lot", emoji: "💬" },
  { label: "Occasional texter", emoji: "📱" },
  { label: "Phone calls", emoji: "📞" },
  { label: "Video calls", emoji: "🎥" },
  { label: "In-person preferred", emoji: "☕" },
];

const paceOptions = [
  {
    label: "Fast responder",
    emoji: "⚡",
    description: "I usually reply quickly",
  },
  {
    label: "Chill",
    emoji: "😌",
    description: "No rush, I reply when I can",
  },
  {
    label: "Slow responder",
    emoji: "🐢",
    description: "I’m not great at checking my phone",
  },
];

export default function Step5Communication({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step5Props) {
  const toggleStyle = (style: string) => {
    const current = data.communicationStyle;
    onChange({
      ...data,
      communicationStyle: current.includes(style)
        ? current.filter((s) => s !== style)
        : [...current, style],
    });
  };

  return (
    <StepLayout
      currentStep={5}
      totalSteps={10}
      title="How do you like to connect?"
      subtitle="Everyone communicates differently"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={!!data.responsePace}
    >
      <div className="flex flex-col gap-16">

        {/* COMMUNICATION STYLE */}
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Preferred ways to connect
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Choose all that feel right
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
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

        {/* RESPONSE PACE */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Your response pace
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              This helps set expectations
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {paceOptions.map(({ label, emoji, description }) => {
              const isSelected = data.responsePace === label;

              return (
                <button
                  key={label}
                  onClick={() =>
                    onChange({ ...data, responsePace: label })
                  }
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-left",
                    isSelected
                      ? "bg-teal-50 ring-2 ring-teal-400"
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  {/* Emoji */}
                  <div
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0",
                      isSelected ? "bg-white shadow-sm" : "bg-white"
                    )}
                  >
                    {emoji}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p
                      className={cn(
                        "font-semibold",
                        isSelected
                          ? "text-teal-900"
                          : "text-gray-900"
                      )}
                    >
                      {label}
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        isSelected
                          ? "text-teal-700/80"
                          : "text-gray-500"
                      )}
                    >
                      {description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FOOTNOTE */}
        <p className="text-xs text-gray-400 text-center">
          You can always change this later
        </p>
      </div>
    </StepLayout>
  );
}
