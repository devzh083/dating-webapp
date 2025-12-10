import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ProgressBar } from "./ProgressBar";

interface StepLayoutProps {
  children: React.ReactNode;
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

export const StepLayout = ({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  onBack,
  onSkip,
  onNext,
  nextLabel = "Next",
  canProceed = true,
  showBack = true,
}: StepLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            {showBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={onSkip}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>
          
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-muted-foreground text-base">{subtitle}</p>
              )}
            </div>

            {children}
          </motion.div>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border/50">
        <div className="max-w-xl mx-auto px-6 py-4">
          <motion.button
            whileHover={{ scale: canProceed ? 1.02 : 1 }}
            whileTap={{ scale: canProceed ? 0.98 : 1 }}
            onClick={onNext}
            disabled={!canProceed}
            className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
              canProceed
                ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {nextLabel}
          </motion.button>
        </div>
      </footer>
    </div>
  );
};
