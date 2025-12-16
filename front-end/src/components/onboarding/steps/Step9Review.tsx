// src/components/onboarding/steps/Step9Review.tsx
import React from "react";
import { motion } from "framer-motion";
import { differenceInYears } from "date-fns";
import StepLayout from "../StepLayout";
import { MapPin, Heart, Sparkles, MessageCircle } from "lucide-react";

type OnboardingData = {
  firstName: string;
  dateOfBirth: Date | undefined;
  gender: string;
  showGender: boolean;
  interestedIn: string[];
  orientation: string[];
  showOrientation: boolean;
  relationshipType: string;
  distance: number;
  strictDistance: boolean;
  drinking: string;
  smoking: string;
  workout: string;
  pets: string;
  communicationStyle: string[];
  responsePace: string;
  interests: string[];
  location: string;
  useCurrentLocation: boolean;
  photos?: string[];
};

interface Step9Props {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const Step9Review: React.FC<Step9Props> = ({ data, onNext, onBack, onSkip }) => {
  const age = data.dateOfBirth ? differenceInYears(new Date(), data.dateOfBirth) : null;

  // safe guard for empty/missing name
  const safeFirst = data.firstName || "User";
  const firstInitial = (safeFirst.charAt(0) || "U").toUpperCase();

  const lifestyleTags = [
    data.drinking && `🍷 ${data.drinking}`,
    data.smoking && `🚬 ${data.smoking}`,
    data.workout && `💪 ${data.workout}`,
    data.pets && `🐕 ${data.pets}`,
  ].filter(Boolean);

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg shadow-primary/30">
              {firstInitial}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {safeFirst}
                {age && <span className="text-muted-foreground">, {age}</span>}
              </h2>
              {data.showGender && data.gender && (
                <p className="text-muted-foreground">{data.gender}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {data.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-foreground">{data.location}</span>
                <span className="text-muted-foreground">• {data.distance} km away max</span>
              </div>
            )}

            {data.relationshipType && (
              <div className="flex items-center gap-3 text-sm">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-foreground">Looking for: {data.relationshipType}</span>
              </div>
            )}

            {data.showOrientation && data.orientation.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-foreground">{data.orientation.join(", ")}</span>
              </div>
            )}

            {data.responsePace && (
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-foreground">{data.responsePace} responder</span>
              </div>
            )}
          </div>

          {lifestyleTags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Lifestyle</h3>
              <div className="flex flex-wrap gap-2">
                {lifestyleTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-chip border border-chip-border text-sm text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.interests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {data.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full bg-chip-selected border border-chip-border-selected text-sm text-primary font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-4">
          <p className="text-muted-foreground text-sm">You can always update your profile later in settings</p>
        </motion.div>
      </div>
    </StepLayout>
  );
};
export default Step9Review;
