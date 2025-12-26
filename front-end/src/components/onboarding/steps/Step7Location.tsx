// src/components/onboarding/steps/Step7Location.tsx
import StepLayout from "../StepLayout";
import { TextInput } from "../TextInput";
import { MapPin, Navigation, Lock } from "lucide-react"; // Added Lock icon
import { motion } from "framer-motion";
import { OnboardingData } from "../OnboardingFlow";
import { cn } from "@/lib/utils";

interface Step7Props {
  data: Pick<OnboardingData, "location" | "useCurrentLocation">;
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
    // In a real app, you'd trigger the browser's Geolocation API here
    onChange({
      ...data,
      useCurrentLocation: true,
      location: "Using current location",
    });
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
      <div className="space-y-8">
        {/* Bouncing Visual Icon - Solid Teal */}
        <div className="flex justify-center py-6">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center shadow-xl shadow-teal-200"
          >
            <MapPin className="w-10 h-10 text-white fill-white" />
          </motion.div>
        </div>

        {/* Location Input */}
        <div className="space-y-6">
          <TextInput
            value={data.location}
            onChange={(location) =>
              onChange({ ...data, location, useCurrentLocation: false })
            }
            placeholder="Enter your city"
            icon={<MapPin className="w-5 h-5 text-gray-400" />}
          />

          {/* Divider */}
          <div className="flex items-center gap-4 px-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-sm font-medium text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Use Current Location Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUseCurrentLocation}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 py-4 rounded-xl border-2 transition-all duration-200 font-semibold outline-none",
              data.useCurrentLocation
                ? "border-teal-500 bg-teal-50 text-teal-700" // Active State
                : "border-teal-100 text-teal-600 hover:bg-teal-50 hover:border-teal-200 bg-white" // Default State
            )}
          >
            <Navigation className={cn(
                "w-5 h-5", 
                data.useCurrentLocation ? "fill-teal-700" : ""
            )} />
            <span>Use my current location</span>
          </motion.button>
        </div>

        {/* Privacy Note - Light Teal Box */}
        <div className="mt-8 bg-teal-50/50 rounded-xl p-4 border border-teal-100/50">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-teal-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                Your privacy is protected
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                We use your location to show you people nearby. Your exact
                location is never shared with other users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step7Location;