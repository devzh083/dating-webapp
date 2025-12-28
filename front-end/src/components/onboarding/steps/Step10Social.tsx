// src/components/onboarding/steps/Step10Social.tsx
import React, { useState } from "react";
import { Instagram, MessageCircle, Send, Twitter, Linkedin } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import StepLayout from "../StepLayout";

interface Props {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const Step10Social: React.FC<Props> = ({ data, onChange, onNext, onBack, onSkip }) => {
  const [instagram, setInstagram] = useState(data.socialAccounts?.instagram || "");
  const [whatsapp, setWhatsapp] = useState(data.socialAccounts?.whatsapp || "");
  const [snapchat, setSnapchat] = useState(data.socialAccounts?.snapchat || "");
  const [twitter, setTwitter] = useState(data.socialAccounts?.twitter || "");
  const [linkedin, setLinkedin] = useState(data.socialAccounts?.linkedin || "");

  const handleNext = () => {
    onChange({
      socialAccounts: {
        instagram: instagram.trim(),
        whatsapp: whatsapp.trim(),
        snapchat: snapchat.trim(),
        twitter: twitter.trim(),
        linkedin: linkedin.trim(),
      },
    });
    onNext();
  };

  const hasAnySocial = instagram || whatsapp || snapchat || twitter || linkedin;

  return (
    <StepLayout
      currentStep={10}
      totalSteps={11}
      title="Connect Your Socials"
      subtitle="Share your social media to make it easier to connect off the platform"
      onBack={onBack}
      onNext={handleNext}
      onSkip={onSkip}
      nextLabel="Continue"
    >
      <div className="space-y-6">
        {/* Social accounts form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          
          {/* Instagram */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Instagram
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="username"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              WhatsApp
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+1 234 567 8900"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1.5">Include country code</p>
          </div>

          {/* Snapchat */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Send className="w-5 h-5 text-yellow-500" />
              Snapchat
            </label>
            <input
              type="text"
              value={snapchat}
              onChange={(e) => setSnapchat(e.target.value)}
              placeholder="username"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Twitter/X */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Twitter className="w-5 h-5 text-blue-500" />
              Twitter / X
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium">@</span>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="username"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Linkedin className="w-5 h-5 text-blue-700" />
              LinkedIn
            </label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/username"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            />
          </div>

        </div>

        {/* Privacy note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Privacy note:</span> Your social accounts will only be visible to people you match with. You can choose when to share this information.
          </p>
        </div>

        {/* Optional info note */}
        <p className="text-center text-xs text-gray-400">
          All fields are optional. Skip if you prefer not to share.
        </p>
      </div>
    </StepLayout>
  );
};

export default Step10Social;