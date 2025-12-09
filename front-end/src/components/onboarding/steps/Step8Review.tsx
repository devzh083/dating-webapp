import { StepLayout } from "../StepLayout";
import { motion } from "framer-motion";
import { User, Heart, MapPin, Sparkles, MessageCircle, Compass } from "lucide-react";
import { differenceInYears } from "date-fns";

interface OnboardingData {
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
}

interface Step8Props {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Step8Review = ({ data, onNext, onBack, onSkip }: Step8Props) => {
  const age = data.dateOfBirth
    ? differenceInYears(new Date(), data.dateOfBirth)
    : null;

  const lifestyleTags = [
    data.drinking && `🍷 ${data.drinking}`,
    data.smoking && `🚬 ${data.smoking}`,
    data.workout && `💪 ${data.workout}`,
    data.pets && `🐕 ${data.pets}`,
  ].filter(Boolean);

  return (
    <StepLayout
      currentStep={8}
      totalSteps={8}
      title="Looking good! ✨"
      subtitle="Here's your profile preview"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      nextLabel="Finish & Start Matching"
    >
      <div className="space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg shadow-primary/30">
              {data.firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {data.firstName}
                {age && <span className="text-muted-foreground">, {age}</span>}
              </h2>
              {data.showGender && data.gender && (
                <p className="text-muted-foreground">{data.gender}</p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Location */}
            {data.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-foreground">{data.location}</span>
                <span className="text-muted-foreground">• {data.distance} km away max</span>
              </div>
            )}

            {/* Looking for */}
            {data.relationshipType && (
              <div className="flex items-center gap-3 text-sm">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-foreground">Looking for: {data.relationshipType}</span>
              </div>
            )}

            {/* Orientation */}
            {data.showOrientation && data.orientation.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-foreground">{data.orientation.join(", ")}</span>
              </div>
            )}

            {/* Communication */}
            {data.responsePace && (
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-foreground">{data.responsePace} responder</span>
              </div>
            )}
          </div>

          {/* Lifestyle Tags */}
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

          {/* Interests */}
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

        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-4"
        >
          <p className="text-muted-foreground text-sm">
            You can always update your profile later in settings
          </p>
        </motion.div>
      </div>
    </StepLayout>
  );
};
