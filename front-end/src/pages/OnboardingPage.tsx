// src/pages/OnboardingPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

type OnboardingPageProps = {
  onComplete?: () => void;
};

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const navigate = useNavigate();

  const handleFinish = () => {
    onComplete?.();
    navigate("/home", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      <OnboardingFlow onComplete={handleFinish} />
    </div>
  );
};

export default OnboardingPage;