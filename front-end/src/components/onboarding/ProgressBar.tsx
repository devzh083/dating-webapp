// src/components/onboarding/ProgressBar.tsx
import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-teal-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </div>
  );
};

export default ProgressBar;