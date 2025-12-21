import React from "react";
import StepLayout from "../StepLayout";
import { OnboardingData } from "../OnboardingFlow";
import { MessageCircle, PenLine, Sparkles, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step9Props {
  data: Pick<OnboardingData, "bio" | "conversationStarter">;
  onChange: (data: Step9Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const STARTERS = [
  "What song perfectly describes your current chapter in life?",
  "What's the most spontaneous thing you've ever done?",
  "If you could have dinner with any fictional character, who would it be?",
  "What's a hill you're willing to die on?",
  "Best concert you've ever been to?",
  "Two truths and a lie...",
];

export const Step9Bio = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step9Props) => {
  const bioCharacterLimit = 150;

  return (
    <StepLayout
      currentStep={9}
      totalSteps={10} // Updated total steps
      title="Express Yourself"
      subtitle="Let your personality shine through words"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={data.bio.trim().length > 0 && data.conversationStarter.trim().length > 0}
    >
      <div className="space-y-8">
        
        {/* Section 1: Bio / Caption */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
              <PenLine className="w-4 h-4 text-teal-600" />
            </div>
            <h3>Your Bio</h3>
          </div>
          
          <div className="relative">
            <textarea
              value={data.bio}
              onChange={(e) => {
                if (e.target.value.length <= bioCharacterLimit) {
                  onChange({ ...data, bio: e.target.value });
                }
              }}
              placeholder="Tell us a bit about yourself... (e.g., 'Adventure seeker, coffee lover, always looking for the next best hiking spot.')"
              className="w-full min-h-[120px] p-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none shadow-sm"
            />
            <div className="absolute bottom-3 right-3 text-xs font-medium text-gray-400">
              {data.bio.length}/{bioCharacterLimit}
            </div>
          </div>
        </div>

        {/* Section 2: Conversation Starter */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-teal-600" />
            </div>
            <h3>Choose a Conversation Starter</h3>
          </div>

          <div className="grid gap-3">
            {STARTERS.map((starter, index) => {
              const isSelected = data.conversationStarter === starter;
              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChange({ ...data, conversationStarter: starter })}
                  className={cn(
                    "relative p-4 rounded-xl text-left border-2 transition-all duration-200 group",
                    isSelected
                      ? "border-teal-500 bg-teal-50 shadow-sm"
                      : "border-gray-100 bg-white hover:border-teal-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Quote className={cn(
                      "w-5 h-5 shrink-0 mt-0.5 transition-colors", 
                      isSelected ? "text-teal-600 fill-teal-600" : "text-gray-300 group-hover:text-teal-400"
                    )} />
                    <span className={cn(
                      "text-sm font-medium leading-snug transition-colors",
                      isSelected ? "text-teal-900" : "text-gray-600"
                    )}>
                      {starter}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      layoutId="check"
                      className="absolute top-1/2 -translate-y-1/2 right-4 w-2 h-2 rounded-full bg-teal-500"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
            <Sparkles className="w-3 h-3" />
            <span>This will appear on your profile card</span>
          </div>
        </div>

      </div>
    </StepLayout>
  );
};

export default Step9Bio;