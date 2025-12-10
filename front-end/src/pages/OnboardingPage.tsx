// src/pages/OnboardingPage.tsx
import React from "react";
import OnboardingFlow from "../components/onboarding/OnboardingFlow";
import { TopBar } from "@/components/layout/TopBar";

interface OnboardingPageProps {
  onComplete: () => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* global top bar during onboarding */}
      <TopBar userName="User" />

      <main className="flex-1 flex items-start justify-center">
        <OnboardingFlow onComplete={onComplete} />
      </main>
    </div>
  );
};

export default OnboardingPage;
