import StepLayout from "../StepLayout";

import { ChipSelector } from "../ChipSelector";
import { motion } from "framer-motion";

interface Step6Props {
  data: {
    interests: string[];
  };
  onChange: (data: Step6Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const interestCategories = [
  {
    title: "Movies & TV",
    emoji: "🎬",
    options: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Documentaries", "Anime", "Reality TV"],
  },
  {
    title: "Music",
    emoji: "🎵",
    options: ["Pop", "Hip-Hop", "Rock", "Electronic", "R&B", "Country", "Jazz", "Classical"],
  },
  {
    title: "Sports",
    emoji: "⚽",
    options: ["Football", "Basketball", "Tennis", "Swimming", "Running", "Yoga", "Cycling", "Golf"],
  },
  {
    title: "Food & Drink",
    emoji: "🍕",
    options: ["Cooking", "Fine Dining", "Street Food", "Coffee", "Wine", "Cocktails", "Vegan", "BBQ"],
  },
  {
    title: "Hobbies",
    emoji: "🎨",
    options: ["Photography", "Reading", "Gaming", "Art", "Writing", "Gardening", "DIY", "Crafts"],
  },
  {
    title: "Travel & Adventure",
    emoji: "✈️",
    options: ["Beach", "Mountains", "City Trips", "Backpacking", "Road Trips", "Camping", "Cruises", "Staycations"],
  },
];

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
        {/* Counter */}
        <div className="sticky top-0 z-10 py-3 bg-background">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Select up to {MAX_INTERESTS}
            </span>
            <motion.span
              key={selectedCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`text-sm font-semibold ${
                isAtLimit ? "text-primary" : "text-foreground"
              }`}
            >
              {selectedCount}/{MAX_INTERESTS}
            </motion.span>
          </div>
          {isAtLimit && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-primary mt-1"
            >
              Maximum reached! Remove one to add another.
            </motion.p>
          )}
        </div>

        {/* Interest Categories */}
        {interestCategories.map((category) => (
          <div key={category.title} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{category.emoji}</span>
              <label className="text-sm font-medium text-foreground">
                {category.title}
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.options.map((interest) => (
                <ChipSelector
                  key={interest}
                  label={interest}
                  selected={data.interests.includes(interest)}
                  onClick={() => toggleInterest(interest)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </StepLayout>
  );
};
export default Step6Interests;
