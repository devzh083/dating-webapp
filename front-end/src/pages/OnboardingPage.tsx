// front-end/src/pages/OnboardingPage.tsx
import React from "react";
import OnboardingFlow from "../components/onboarding/OnboardingFlow";

const OnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <OnboardingFlow />
    </div>
  );
};

export default OnboardingPage;
