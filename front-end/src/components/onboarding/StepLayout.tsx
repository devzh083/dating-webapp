// src/components/onboarding/StepLayout.tsx
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StepLayoutProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  canProceed?: boolean;
  showBack?: boolean;
  children: ReactNode;
  nextLabel?: string;
}

export const StepLayout = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
  onBack,
  onNext,
  onSkip,
  canProceed = true,
  showBack = true,
  children,
  nextLabel = "Next",
}: StepLayoutProps) => {
  const handleSkip = () => {
    if (onSkip) onSkip();
    else onNext();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-500">
          Step {currentStep} of {totalSteps}
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          Skip
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 max-w-xl">{subtitle}</p>}
      </div>

      <div className="flex-1">{children}</div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium",
              "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            Back
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold",
            "bg-[#27c5be] text-white shadow-sm",
            "hover:bg-[#21b4ad] disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
};

export default StepLayout;
