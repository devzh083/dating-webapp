// src/components/onboarding/steps/Step9Review.tsx
import React from "react";
import { motion } from "framer-motion";
import { differenceInYears } from "date-fns";
import StepLayout from "../StepLayout";
import { MapPin, Heart, Sparkles, Zap, User } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import { cn } from "@/lib/utils";

interface Step9Props {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

// Helper to map values back to emojis for the review card
const getEmoji = (category: string, value: string) => {
  const map: Record<string, Record<string, string>> = {
    drinking: { "Never": "🚫", "Socially": "🍷", "Regularly": "🍻" },
    smoking: { "Never": "🚭", "Sometimes": "💨", "Regularly": "🚬" },
    workout: { "Never": "🛋️", "Sometimes": "🚶", "Often": "💪", "Daily": "🏋️" },
    pets: { "Own pets": "🐕", "Love pets": "❤️", "Allergic": "🤧", "None": "🚫" }
  };
  return map[category]?.[value] || "✨";
};

const Step9Review: React.FC<Step9Props> = ({ data, onNext, onBack, onSkip }) => {
  const age = data.dateOfBirth ? differenceInYears(new Date(), data.dateOfBirth) : null;
  const safeFirst = data.firstName || "User";
  const firstInitial = (safeFirst.charAt(0) || "U").toUpperCase();
  const mainPhoto = data.photos && data.photos.length > 0 ? data.photos[0] : null;

  // Compile Lifestyle Tags with Emojis
  const lifestyleTags = [
    { label: data.drinking, emoji: getEmoji('drinking', data.drinking), visible: !!data.drinking },
    { label: data.smoking, emoji: getEmoji('smoking', data.smoking), visible: !!data.smoking },
    { label: data.workout, emoji: getEmoji('workout', data.workout), visible: !!data.workout },
    { label: data.pets, emoji: getEmoji('pets', data.pets), visible: !!data.pets },
  ].filter(item => item.visible);

  return (
    <StepLayout
      currentStep={9}
      totalSteps={9}
      title="Looking good! ✨"
      subtitle="Here's your profile preview"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      nextLabel="Finish & Start Matching"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden"
        >
          {/* Header Section: Avatar + Name */}
          <div className="flex items-start gap-5 mb-8">
            {/* Avatar - Image or Initial */}
            <div className="shrink-0">
              {mainPhoto ? (
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden">
                  <img src={mainPhoto} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-teal-200">
                  {firstInitial}
                </div>
              )}
            </div>
            
            {/* Name Block */}
            <div className="pt-2">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {safeFirst}, {age}
              </h2>
              {data.showGender && data.gender && (
                <p className="text-gray-500 font-medium">{data.gender}</p>
              )}
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-4 mb-8">
            {/* Location */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin className="w-5 h-5 text-teal-500 shrink-0" />
              <span>
                {data.useCurrentLocation ? "Using current location" : data.location || "Location not set"} 
                <span className="text-gray-400 mx-1">•</span> 
                {data.distance} km away max
              </span>
            </div>

            {/* Relationship Intent */}
            {data.relationshipType && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Heart className="w-5 h-5 text-teal-500 shrink-0" />
                <span>Looking for: <span className="font-medium text-gray-900">{data.relationshipType}</span></span>
              </div>
            )}

            {/* Orientation */}
            {data.showOrientation && data.orientation.length > 0 && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Sparkles className="w-5 h-5 text-teal-500 shrink-0" />
                <span>{data.orientation.join(", ")}</span>
              </div>
            )}

            {/* Response Pace */}
            {data.responsePace && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Zap className="w-5 h-5 text-teal-500 shrink-0" />
                <span>{data.responsePace}</span>
              </div>
            )}
          </div>

          {/* Lifestyle Section */}
          {lifestyleTags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lifestyle</h3>
              <div className="flex flex-wrap gap-2">
                {lifestyleTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium"
                  >
                    <span>{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests Section */}
          {data.interests.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {data.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400">
          You can always update your profile later in settings
        </p>
      </div>
    </StepLayout>
  );
};

export default Step9Review;