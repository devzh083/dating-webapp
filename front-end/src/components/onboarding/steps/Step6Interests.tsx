// src/components/onboarding/steps/Step6Interests.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { motion } from "framer-motion";
import { OnboardingData } from "../OnboardingFlow";
import { cn } from "@/lib/utils";

interface Step6Props {
  data: Pick<OnboardingData, "interests">;
  onChange: (data: Step6Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const interestCategories = [
  {
    title: "Movies & TV",
    emoji: "🎬",
    options: [
      "Action", "Comedy", "Drama", "Horror", 
      "Sci-Fi", "Documentaries", "Anime", "Reality TV"
    ],
  },
  {
    title: "Music",
    emoji: "🎵",
    options: [
      "Pop", "Hip-Hop", "Rock", "Electronic", 
      "R&B", "Country", "Jazz", "Classical"
    ],
  },
  {
    title: "Sports",
    emoji: "⚽",
    options: [
      "Football", "Basketball", "Tennis", "Swimming", 
      "Running", "Yoga", "Cycling", "Golf"
    ],
  },
  {
    title: "Food & Drink",
    emoji: "🍕",
    options: [
      "Cooking", "Fine Dining", "Street Food", "Coffee", 
      "Wine", "Cocktails", "Vegan", "BBQ"
    ],
  },
  {
    title: "Hobbies",
    emoji: "🎨",
    options: [
      "Photography", "Reading", "Gaming", "Art", 
      "Writing", "Gardening", "DIY", "Crafts"
    ],
  },
  {
    title: "Travel & Adventure",
    emoji: "✈️",
    options: [
      "Beach", "Mountains", "City Trips", "Backpacking", 
      "Road Trips", "Camping", "Cruises", "Staycations"
    ],
  },
] as const;

const MAX_INTERESTS = 10;

export const Step6Interests = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step6Props) => {
  const toggleInterest = (interest: string) => {
    const current = data.interests;
    if (current.includes(interest)) {
      onChange({ ...data, interests: current.filter((i) => i !== interest) });
    } else if (current.length < MAX_INTERESTS) {
      onChange({ ...data, interests: [...current, interest] });
    }
  };

  const selectedCount = data.interests.length;
  const isAtLimit = selectedCount >= MAX_INTERESTS;

  return (
    <StepLayout
      currentStep={6}
      totalSteps={8}
      title="What are you into?"
      subtitle="Pick your top interests to help find better matches"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
    >
      <div className="space-y-6">
        {/* Sticky Counter Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm pb-4 pt-1 border-b border-gray-50 -mx-10 px-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">
              Select up to {MAX_INTERESTS}
            </span>
            <motion.span
              key={selectedCount}
              initial={{ scale: 1.2 }}
              animate={{ 
                scale: 1, 
                color: isAtLimit ? "#ef4444" : "#111827" 
              }}
              className="text-sm font-bold text-gray-900"
            >
              {selectedCount}/{MAX_INTERESTS}
            </motion.span>
          </div>

          {/* The Visual Dashes (Local Counter from Video) */}
          <div className="flex gap-1.5 h-1.5 w-full">
            {Array.from({ length: MAX_INTERESTS }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 rounded-full transition-all duration-300",
                  index < selectedCount 
                    ? "bg-teal-400"  // Filled state (Teal)
                    : "bg-gray-100"  // Empty state
                )}
              />
            ))}
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-8 pb-4">
          {interestCategories.map((category) => (
            <div key={category.title} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.emoji}</span>
                <label className="text-base font-semibold text-gray-900">
                  {category.title}
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                {category.options.map((interest) => (
                  <ChipSelector
                    key={interest}
                    label={interest}
                    selected={data.interests.includes(interest)}
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                        // Add opacity if limit reached and item not selected
                        !data.interests.includes(interest) && isAtLimit && "opacity-40 cursor-not-allowed hover:border-gray-200"
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StepLayout>
  );
};

export default Step6Interests;