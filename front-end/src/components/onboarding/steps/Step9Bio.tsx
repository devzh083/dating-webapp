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

export default function Step9Bio({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step9Props) {
  const bioCharacterLimit = 150;

  return (
    <StepLayout
      currentStep={9}
      totalSteps={10}
      title="Say something memorable"
      subtitle="This helps people get a feel for you"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={
        data.bio.trim().length > 0 &&
        data.conversationStarter.trim().length > 0
      }
    >
      <div className="space-y-10">

        {/* BIO */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center">
              <PenLine className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Your bio
            </h3>
          </div>

          <div className="relative">
            <textarea
              value={data.bio}
              onChange={(e) => {
                if (e.target.value.length <= bioCharacterLimit) {
                  onChange({ ...data, bio: e.target.value });
                }
              }}
              placeholder="A line or two about you… what makes you, you?"
              className="w-full min-h-[130px] p-5 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition resize-none shadow-sm"
            />

            <span
              className={cn(
                "absolute bottom-3 right-4 text-xs font-medium",
                data.bio.length > bioCharacterLimit * 0.8
                  ? "text-teal-600"
                  : "text-gray-400"
              )}
            >
              {data.bio.length}/{bioCharacterLimit}
            </span>
          </div>
        </div>

        {/* CONVERSATION STARTER */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Pick a conversation starter
            </h3>
          </div>

          <div className="grid gap-4">
            {STARTERS.map((starter) => {
              const isSelected = data.conversationStarter === starter;

              return (
                <motion.button
                  key={starter}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    onChange({ ...data, conversationStarter: starter })
                  }
                  className={cn(
                    "relative p-5 rounded-2xl text-left border transition-all",
                    isSelected
                      ? "border-teal-500 bg-teal-50 shadow-sm"
                      : "border-gray-100 bg-white hover:border-teal-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Quote
                      className={cn(
                        "w-5 h-5 mt-1 shrink-0",
                        isSelected
                          ? "text-teal-600"
                          : "text-gray-300"
                      )}
                    />
                    <p
                      className={cn(
                        "text-sm font-medium leading-relaxed",
                        isSelected
                          ? "text-teal-900"
                          : "text-gray-600"
                      )}
                    >
                      {starter}
                    </p>
                  </div>

                  {isSelected && (
                    <motion.div
                      layoutId="selected-dot"
                      className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-teal-500"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-3 h-3" />
            This will appear on your profile card
          </div>
        </div>

      </div>
    </StepLayout>
  );
}
