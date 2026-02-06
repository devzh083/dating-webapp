// src/components/onboarding/ProgressBar.tsx
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { OnboardingData } from "./OnboardingFlow";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  isSaving?: boolean;
  data?: OnboardingData;
  onStepClick?: (step: number) => void;
}

// Helper function to determine if a step is complete
const isStepComplete = (stepNumber: number, data?: OnboardingData): boolean => {
  if (!data) return false;
  
  switch (stepNumber) {
    case 1: // Basic Info
      return !!(data.firstName && data.dateOfBirth && data.gender);
    
    case 2: // Relationship Status
      return !!data.relationshipType;
    
    case 3: // Distance (has default value, so always complete)
      return true;
    
    case 4: // Lifestyle (at least one field should be filled)
      return !!(data.drinking || data.smoking || data.workout || data.pets);
    
    case 5: // Communication
      return data.communicationStyle.length > 0 || !!data.responsePace;
    
    case 6: // Interests
      return data.interests.length > 0;
    
    case 7: // Location
      return !!(data.location || data.useCurrentLocation);
    
    case 8: // Photos
      return data.photos.length > 0;
    
    case 9: // Bio & Conversation Starter
      return !!(data.bio && data.conversationStarter);
    
    case 10: // Social (optional, always complete)
      return true;
    
    case 11: // Review (always accessible)
      return true;
    
    default:
      return false;
  }
};

// Helper to find the first incomplete step
const findFirstIncompleteStep = (data?: OnboardingData, totalSteps: number = 11): number => {
  if (!data) return 1;
  
  for (let i = 1; i <= totalSteps; i++) {
    if (!isStepComplete(i, data)) {
      return i;
    }
  }
  return totalSteps; // All complete, go to review
};

export const ProgressBar = ({ 
  currentStep, 
  totalSteps, 
  isSaving, 
  data, 
  onStepClick 
}: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;
  const firstIncompleteStep = findFirstIncompleteStep(data, totalSteps);
  const canNavigate = onStepClick && firstIncompleteStep !== currentStep && firstIncompleteStep < currentStep;

  const handleBarClick = () => {
    if (canNavigate) {
      onStepClick!(firstIncompleteStep);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <div 
        className={cn(
          "w-full h-1.5 rounded-full bg-gray-200 overflow-hidden relative",
          canNavigate && "cursor-pointer hover:bg-gray-300 transition-colors"
        )}
        onClick={handleBarClick}
        title={canNavigate ? `Jump to Step ${firstIncompleteStep}` : undefined}
      >
        {/* Main progress bar */}
        <motion.div
          className="h-full rounded-full bg-[#27c5be]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
        
        {/* Incomplete step indicator (only if there's a skipped step) */}
        {canNavigate && (
          <motion.div
            className="absolute top-0 h-full bg-amber-400 rounded-full"
            style={{
              width: `${(1 / totalSteps) * 100}%`,
              left: `${((firstIncompleteStep - 1) / totalSteps) * 100}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {/* Pulse animation */}
            <motion.div
              className="absolute inset-0 bg-amber-300 rounded-full"
              animate={{ opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </div>
      
      {isSaving && (
        <span className="text-xs text-gray-500 whitespace-nowrap animate-pulse">
          Saving...
        </span>
      )}
      
      {/* Step indicator */}
      <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
        {currentStep}/{totalSteps}
      </span>
    </div>
  );
};

export default ProgressBar;