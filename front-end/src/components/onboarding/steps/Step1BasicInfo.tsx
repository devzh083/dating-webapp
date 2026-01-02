import { User } from "lucide-react";
import StepLayout from "../StepLayout";
import { TextInput } from "../TextInput";
import { DatePicker } from "../DatePicker";

interface Step1Props {
  data: {
    firstName: string;
    dateOfBirth: Date | null;
    gender: string;
  };
  onChange: (data: Partial<Step1Props["data"]>) => void;
  onNext: () => void;
  onSkip?: () => void;
}

export default function Step1BasicInfo({
  data,
  onChange,
  onNext,
  onSkip,
}: Step1Props) {
  const canProceed =
    data.firstName.trim() !== "" &&
    !!data.dateOfBirth &&
    data.gender !== "";

  return (
    <StepLayout
      currentStep={1}
      totalSteps={10}
      title="Let's start with the basics"
      subtitle="Tell us a bit about yourself"
      onNext={onNext}
      onSkip={onSkip}
      canProceed={canProceed}
      showBack={false}
    >
      <div className="space-y-8 pt-4">
        {/* First Name */}
        <TextInput
          value={data.firstName}
          onChange={(firstName) => onChange({ firstName })}
          placeholder="Enter your first name"
          label="First name"
          icon={<User className="w-5 h-5 text-gray-400" />}
        />

        {/* Date of Birth */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-900">
            Date of birth
          </label>
          <DatePicker
            value={data.dateOfBirth ?? undefined}
            onChange={(date) =>
              onChange({ dateOfBirth: date ?? null })
            }
          />
          <p className="text-xs text-gray-500">
            Your age will be shown, not your birthday
          </p>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-4">
            {["Man", "Woman"].map((option) => (
              <button
                key={option}
                onClick={() => onChange({ gender: option })}
                className={`h-14 rounded-xl font-semibold border transition ${
                  data.gender === option
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
