// src/components/onboarding/steps/Step1BasicInfo.tsx
import StepLayout from "../StepLayout";
import { TextInput } from "../TextInput";
import { DatePicker } from "../DatePicker";
import { PillButton } from "../PillButton";
import { CheckboxField } from "../CheckboxField";
import { User } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";

interface Step1Props {
  data: Pick<
    OnboardingData,
    "firstName" | "dateOfBirth" | "gender" | "showGender" | "interestedIn"
  >;
  onChange: (data: Step1Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const genderOptions = ["Man", "Woman", "Beyond Binary", "Other"];
const interestOptions = ["Men", "Women", "Everyone", "Beyond Binary"];

export default function Step1BasicInfo({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step1Props) {
  const toggleInterest = (interest: string) => {
    const current = data.interestedIn;
    onChange({
      ...data,
      interestedIn: current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest],
    });
  };

  const canProceed =
    data.firstName.trim() !== "" && data.dateOfBirth && data.gender;

  return (
    <StepLayout
      currentStep={1}
      totalSteps={9}
      title="Let's start with the basics"
      subtitle="Tell us a bit about yourself"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={!!canProceed}
      showBack={false}
    >
      <div className="space-y-8 pt-2 pb-4">
        <TextInput
          value={data.firstName}
          onChange={(firstName) => onChange({ ...data, firstName })}
          placeholder="Enter your first name"
          label="First name"
          icon={<User className="w-5 h-5 text-gray-400" />}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-900">
            Date of birth
          </label>
          <DatePicker
            value={data.dateOfBirth}
            onChange={(dateOfBirth) =>
              onChange({ ...data, dateOfBirth })
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Your age will be shown on your profile, but not your birthday
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
            I identify as
          </label>
          <div className="flex flex-wrap gap-3">
            {genderOptions.map((gender) => (
              <PillButton
                key={gender}
                label={gender}
                selected={data.gender === gender}
                onClick={() => onChange({ ...data, gender })}
              />
            ))}
          </div>

          <CheckboxField
            label="Show my gender on profile"
            checked={data.showGender}
            onChange={(showGender) =>
              onChange({ ...data, showGender })
            }
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
            I'd like to see
          </label>
          <div className="flex flex-wrap gap-3">
            {interestOptions.map((interest) => (
              <PillButton
                key={interest}
                label={interest}
                selected={data.interestedIn.includes(interest)}
                onClick={() => toggleInterest(interest)}
              />
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
