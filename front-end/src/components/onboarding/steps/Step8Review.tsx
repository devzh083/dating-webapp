import { StepLayout } from "../StepLayout";
import { motion } from "framer-motion";
import {
  Heart,
  MapPin,
  Sparkles,
  MessageCircle,
} from "lucide-react";
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

export const Step8Review = ({
  data,
  onNext,
  onBack,
  onSkip,
}: Step8Props) => {
  const age = data.dateOfBirth
    ? differenceInYears(new Date(), data.dateOfBirth)
    : null;

  const lifestyleTags = [
    data.drinking && `🍷 ${data.drinking}`,
    data.smoking && `🚬 ${data.smoking}`,
    data.workout && `💪 ${data.workout}`,
    data.pets && `🐕 ${data.pets}`,
  ].filter(Boolean) as string[];

  return (
    <StepLayout
      currentStep={8}
      totalSteps={8}
      title="Looking good! ✨"
      subtitle="Here’s a preview of your profile"
      onBack={onBack}
      onNext={onNext}     // ✅ will navigate to home via OnboardingFlow
      onSkip={onSkip}     // ✅ will navigate to home via OnboardingFlow
      canProceed={true}   // ✅ CRITICAL: enables the Next button
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
            <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-lg">
              {data.firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {data.firstName}
                {age && (
                  <span className="text-muted-foreground">, {age}</span>
                )}
              </h2>
              {data.showGender && data.gender && (
                <p className="text-muted-foreground">{data.gender}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 text-sm">
            {data.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>
                  {data.location} · {data.distance} km max
                </span>
              </div>
            )}

            {data.relationshipType && (
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-primary" />
                <span>Looking for: {data.relationshipType}</span>
              </div>
            )}

            {data.showOrientation && data.orientation.length > 0 && (
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{data.orientation.join(", ")}</span>
              </div>
            )}

            {data.responsePace && (
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>{data.responsePace} responder</span>
              </div>
            )}
          </div>

          {/* Lifestyle */}
          {lifestyleTags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Lifestyle</h3>
              <div className="flex flex-wrap gap-2">
                {lifestyleTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-muted border text-sm"
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
              <h3 className="text-sm font-medium mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {data.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer text */}
        <p className="text-center text-sm text-muted-foreground">
          You can edit your profile anytime later
        </p>
      </div>
    </StepLayout>
  );
};

export default Step8Review;
