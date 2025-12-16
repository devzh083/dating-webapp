// src/pages/OnboardingPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import OnboardingFlow, { OnboardingData } from "@/components/onboarding/OnboardingFlow";

type OnboardingPageProps = {
  onComplete?: () => void; // App will pass this
};

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const navigate = useNavigate();

  const handleFinish = () => {
    // let App update its state
    onComplete?.();

    // final navigation to home
    navigate("/home", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OnboardingFlow onComplete={handleFinish} />
    </div>
  );
};

export default OnboardingPage;
