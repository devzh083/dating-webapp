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
      "Sci-Fi", "Documentaries", "Anime", "Reality TV",
    ],
  },
  {
    title: "Music",
    emoji: "🎵",
    options: [
      "Pop", "Hip-Hop", "Rock", "Electronic",
      "R&B", "Country", "Jazz", "Classical",
    ],
  },
  {
    title: "Sports & Fitness",
    emoji: "⚽",
    options: [
      "Football", "Basketball", "Tennis", "Swimming",
      "Running", "Yoga", "Cycling", "Golf",
    ],
  },
  {
    title: "Food & Drink",
    emoji: "🍕",
    options: [
      "Cooking", "Street Food", "Coffee", "Wine",
      "Cocktails", "Vegan", "BBQ", "Desserts",
    ],
  },
  {
    title: "Hobbies",
    emoji: "🎨",
    options: [
      "Photography", "Reading", "Gaming", "Art",
      "Writing", "Gardening", "DIY", "Crafts",
    ],
  },
  {
    title: "Travel",
    emoji: "✈️",
    options: [
      "Beach", "Mountains", "City Trips", "Backpacking",
      "Road Trips", "Camping", "Cruises", "Staycations",
    ],
  },
] as const;

const MAX_INTERESTS = 10;

export default function Step6Interests({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step6Props) {
  const toggleInterest = (interest: string) => {
    const current = data.interests;
    if (current.includes(interest)) {
      onChange({
        ...data,
        interests: current.filter((i) => i !== interest),
      });
    } else if (current.length < MAX_INTERESTS) {
      onChange({ ...data, interests: [...current, interest] });
    }
  };

  const selectedCount = data.interests.length;
  const isAtLimit = selectedCount >= MAX_INTERESTS;

  return (
    <StepLayout
      currentStep={6}
      totalSteps={10}
      title="What do you enjoy?"
      subtitle="Pick up to 10 interests — don’t overthink it"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={selectedCount > 0}
    >
      <div className="flex flex-col gap-12">

        {/* COUNTER */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Choose what you genuinely enjoy
          </p>

          <motion.span
            key={selectedCount}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className={cn(
              "text-sm font-semibold",
              isAtLimit ? "text-red-500" : "text-gray-900"
            )}
          >
            {selectedCount}/{MAX_INTERESTS}
          </motion.span>
        </div>

        {/* INTEREST CATEGORIES */}
        <div className="flex flex-col gap-14">
          {interestCategories.map((category) => (
            <div key={category.title} className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.emoji}</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                {category.options.map((interest) => {
                  const isSelected = data.interests.includes(interest);
                  const isDisabled = !isSelected && isAtLimit;

                  return (
                    <ChipSelector
                      key={interest}
                      label={interest}
                      selected={isSelected}
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        isDisabled &&
                          "opacity-40 cursor-not-allowed hover:border-gray-200"
                      )}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTNOTE */}
        <p className="text-xs text-gray-400 text-center">
          These help us suggest better matches and conversation starters
        </p>
      </div>
    </StepLayout>
  );
}
