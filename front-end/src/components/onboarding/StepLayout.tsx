import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { cn } from "@/lib/utils";

interface StepLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  nextLabel?: string;
  canProceed?: boolean;
  showBack?: boolean;
}

export default function StepLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  onBack,
  onSkip,
  onNext,
  nextLabel = "Continue",
  canProceed = true,
  showBack = true,
}: StepLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5fbff]">

      {/* HEADER */}
      <header className="px-6 pt-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            {showBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={onSkip}
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Skip
            </button>
          </div>

          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-36">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              "w-full sm:w-[260px] mx-auto block py-3 rounded-full text-base font-semibold transition-all",
              canProceed
                ? "bg-gradient-to-r from-[#00a7ff] via-[#00c2ff] to-[#00cf84] text-white shadow-lg"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {nextLabel}
          </button>
        </div>
      </footer>
    </div>
  );
}
