import StepLayout from "../StepLayout";

import { TextInput } from "../TextInput";
import { MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";

interface Step7Props {
  data: {
    location: string;
    useCurrentLocation: boolean;
  };
  onChange: (data: Step7Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Step7Location = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step7Props) => {
  const handleUseCurrentLocation = () => {
    onChange({ ...data, useCurrentLocation: true, location: "Using current location" });
  };

  return (
    <StepLayout
      currentStep={7}
      totalSteps={8}
      title="Where are you?"
      subtitle="Help us show you people nearby"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={data.location.trim() !== "" || data.useCurrentLocation}
    >
      <div className="space-y-6">
        {/* Visual Icon */}
        <div className="flex justify-center py-6">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <MapPin className="w-12 h-12 text-primary-foreground" />
          </motion.div>
        </div>

        {/* Location Input */}
        <TextInput
          value={data.location}
          onChange={(location) => onChange({ ...data, location, useCurrentLocation: false })}
          placeholder="Enter your city"
          icon={<MapPin className="w-5 h-5" />}
        />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Use Current Location Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUseCurrentLocation}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all duration-200 ${
            data.useCurrentLocation
              ? "border-primary bg-chip-selected text-primary"
              : "border-chip-border bg-chip text-foreground hover:border-primary/30"
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="font-medium">Use my current location</span>
        </motion.button>

        {/* Trust Message */}
        <div className="bg-chip rounded-xl p-4 border border-chip-border">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🔒</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Your privacy is protected
              </p>
              <p className="text-xs text-muted-foreground">
                We use your location to show you people nearby. Your exact location is never shared with other users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};
export default Step7Location;
