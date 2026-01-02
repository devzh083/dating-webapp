// src/components/onboarding/OnboardingFlow.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Distance from "./steps/Step2Distance";
import Step3Lifestyle from "./steps/Step3Lifestyle";
import Step4Communication from "./steps/Step4Communication";
import Step5Interests from "./steps/Step5Interests";
import Step6Location from "./steps/Step6Location";
import Step7Photos from "./steps/Step7Photos";
import Step8Bio from "./steps/Step8Bio";
import Step9Social from "./steps/Step9Social";
import Step10Review from "./steps/Step10Review";
import { profileService } from "../../services/profileService";


export interface OnboardingData {
  firstName: string;
  dateOfBirth: Date | null;
  gender: string;
  showGender: boolean;
  interestedIn: string[];
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
  photos: string[];
  bio: string;
  conversationStarter: string;
  socialAccounts?: {
    instagram: string;
    whatsapp: string;
    snapchat: string;
    twitter: string;
    linkedin: string;
  };
}

const initialData: OnboardingData = {
  firstName: "",
  dateOfBirth: null,
  gender: "",
  showGender: true,
  interestedIn: [],
  distance: 25,
  strictDistance: false,
  drinking: "",
  smoking: "",
  workout: "",
  pets: "",
  communicationStyle: [],
  responsePace: "",
  interests: [],
  location: "",
  useCurrentLocation: false,
  photos: [],
  bio: "",
  conversationStarter: "",
  socialAccounts: {
    instagram: "",
    whatsapp: "",
    snapchat: "",
    twitter: "",
    linkedin: "",
  },
};


export default function OnboardingFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load existing profile data when component mounts
  useEffect(() => {
    loadExistingProfile();
    
    // Check if we should start at a specific step
    const state = location.state as { startStep?: number } | null;
    if (state?.startStep) {
      setCurrentStep(state.startStep);
    }
  }, []);

  const loadExistingProfile = async () => {
    try {
      setIsLoading(true);
      const result = await profileService.getProfile();
      
      if (result.exists && result.data) {
        console.log("✅ Loading existing profile for editing:", result.data);
        setData(result.data);
      } else {
        console.log("ℹ️ No existing profile found, starting fresh");
      }
    } catch (err) {
      console.error("⚠️ Error loading profile:", err);
      // Continue with empty data if loading fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleFinish = async () => {
    console.log("=== SAVING PROFILE ===");
    console.log("Current data state:", data);
    
    setIsSaving(true);
    setError(null);
    
    try {
      console.log("Sending to API:", data);
      
      const result = await profileService.saveProfile(data);
      console.log("✅ Profile saved successfully:", result);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate("/home");
    } catch (err: any) {
      console.error("❌ Error saving profile:", err);
      setError(err.message || "Failed to save profile. Please try again.");
      setIsSaving(false);
    }
  };

  const updateData = (newData: Partial<OnboardingData>) => {
    console.log(`Step ${currentStep} - Updating data:`, newData);
    setData((prev) => {
      const updated = { ...prev, ...newData };
      console.log("Updated state:", updated);
      return updated;
    });
  };

  // Show loading spinner while fetching profile
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const steps = [
    <Step1BasicInfo
      key="step1"
      data={data}
      onChange={(d) => updateData(d)}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    />,
    <Step2Distance
      key="step2"
      data={data}
      onChange={(d) => updateData(d)}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    />,
    <Step3Lifestyle
      key="step3"
      data={data}
      onChange={(d) => updateData(d)}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    />,
    <Step4Communication
      key="step4"
      data={data}
      onChange={(d) => updateData(d)}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    />,
    <Step5Interests
      key="step5"
      data={data}
      onChange={(d) => updateData(d)}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    />,
    <Step6Location
      key="step6"
      data={data}
      onChange={(d) => updateData(d)}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    />,
    <Step7Photos
      key="step7"
      data={data}
      onChange={(d) => updateData(d)}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    />,
    <Step8Bio
      key="step8"
      data={data}
      onChange={(d) => updateData(d)}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    />,
    <Step9Social
      key="step9"
      data={data}
      onChange={(d) => updateData(d)}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    />,
    <Step10Review
      key="step10"
      data={data}
      onNext={handleFinish}
      onBack={handleBack}
      onSkip={handleFinish}
    />,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <p className="font-semibold">{error}</p>
        </div>
      )}
      
      {isSaving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            <p className="text-gray-700 font-semibold">Saving your profile...</p>
            <p className="text-sm text-gray-500 text-center">
              This may take a moment
            </p>
          </div>
        </div>
      )}
      
      {steps[currentStep - 1]}
    </div>
  );
}