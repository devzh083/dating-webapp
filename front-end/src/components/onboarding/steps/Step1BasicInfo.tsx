// src/components/onboarding/steps/Step1BasicInfo.tsx
import StepLayout from "../StepLayout";
import { TextInput } from "../TextInput";
import { DatePicker } from "../DatePicker";
import { PillButton } from "../PillButton";
import { CheckboxField } from "../CheckboxField";
import { User, Calendar, Sparkles, Eye } from "lucide-react";
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
      title="Tell us who you are 💖"
      subtitle="This helps us show you better matches"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={!!canProceed}
      showBack={false}
    >
      <div className="space-y-12 pt-4 pb-8">

        {/* NAME */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                What’s your name?
              </h3>
              <p className="text-xs text-gray-500">
                This is how you’ll appear to others
              </p>
            </div>
          </div>

          <TextInput
            value={data.firstName}
            onChange={(firstName) => onChange({ ...data, firstName })}
            placeholder="Enter your first name"
            label="First name"
            icon={<User className="w-5 h-5 text-gray-400" />}
          />
        </section>

        {/* DOB */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                When were you born?
              </h3>
              <p className="text-xs text-gray-500">
                Your birthday stays private
              </p>
            </div>
          </div>

          <DatePicker
            value={data.dateOfBirth}
            onChange={(dateOfBirth) =>
              onChange({ ...data, dateOfBirth })
            }
          />
        </section>

        {/* GENDER */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                You identify as
              </h3>
              <p className="text-xs text-gray-500">
                Choose what feels right 💫
              </p>
            </div>
          </div>

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
            label="Show my gender on my profile"
            checked={data.showGender}
            onChange={(showGender) =>
              onChange({ ...data, showGender })
            }
          />
        </section>

        {/* INTEREST */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
              <Eye className="w-4.5 h-4.5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                You’d like to see
              </h3>
              <p className="text-xs text-gray-500">
                Who should we show you?
              </p>
            </div>
          </div>

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
        </section>
      </div>
    </StepLayout>
  );
}
