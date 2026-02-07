import { User, Calendar, Sparkles, Heart } from "lucide-react";
import StepLayout from "../StepLayout";
import { TextInput } from "../TextInput";
import { DatePicker } from "../DatePicker";
import { AnimatedGenderButton } from "../AnimatedGenderButton";
import { OnboardingData } from "../OnboardingFlow";
import { cn } from "@/lib/utils";

interface Step1Props {
  data: Pick<OnboardingData, 'firstName' | 'dateOfBirth' | 'gender' | 'interestedIn'>;
  onChange: (data: Partial<Step1Props["data"]>) => void;
  onNext: () => void;
  onSkip?: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const INTERESTED_IN_OPTIONS = ["Men", "Women", "Everyone"];

export default function Step1BasicInfo({
  data,
  onChange,
  onNext,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}: Step1Props) {
  // Check if form is valid
  const canProceed =
    data.firstName.trim() !== "" && 
    !!data.dateOfBirth && 
    data.gender !== "" &&
    data.interestedIn.length > 0;

  const toggleInterestedIn = (option: string) => {
    const current = data.interestedIn || [];
    if (current.includes(option)) {
      onChange({ interestedIn: current.filter((o) => o !== option) });
    } else {
      onChange({ interestedIn: [...current, option] });
    }
  };

  return (
    <StepLayout
      currentStep={1}
      totalSteps={11}
      title="Let's start with the basics"
      subtitle="We need a few details to set up your profile"
      onNext={onNext}
      onSkip={onSkip}
      canProceed={canProceed}
      showBack={false}
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-8 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 1. First Name */}
        <div className="space-y-2">
          <TextInput
            value={data.firstName}
            onChange={(firstName) => onChange({ firstName })}
            placeholder="Enter your first name"
            label="First Name"
            icon={<User className="w-5 h-5 text-teal-500" />}
          />
        </div>

        {/* 2. Date of Birth */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-teal-500" />
            Date of birth
          </label>
          
          <div className="relative">
            <DatePicker
              value={data.dateOfBirth ?? undefined}
              onChange={(date) => onChange({ dateOfBirth: date ?? null })}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 animate-pulse" />
            <p className="text-xs text-slate-500 font-medium leading-tight">
              Don't worry, we only show your age, not your exact birthday.
            </p>
          </div>
        </div>

        {/* 3. Gender Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-800">
            I identify as
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            {["Man", "Woman"].map((option) => (
              <AnimatedGenderButton
                key={option}
                label={option}
                isSelected={data.gender === option}
                onClick={() => onChange({ gender: option })}
              />
            ))}
          </div>
        </div>

        {/* 4. Interested In */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-800">
            I'm interested in
          </label>
          
          <div className="space-y-3">
            {INTERESTED_IN_OPTIONS.map((option) => {
              const isSelected = (data.interestedIn || []).includes(option);
              
              return (
                <button
                  key={option}
                  onClick={() => toggleInterestedIn(option)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left font-bold text-base transition-all duration-200 flex items-center justify-between group relative overflow-hidden",
                    "hover:shadow-md hover:-translate-y-0.5",
                    "active:scale-[0.98]",
                    isSelected
                      ? "border-teal-500 bg-teal-50/60 text-teal-800 shadow-sm shadow-teal-500/10"
                      : "border-slate-100 bg-white text-slate-600 hover:border-teal-200 hover:bg-slate-50"
                  )}
                >
                  <span className="relative z-10">{option}</span>

                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10",
                      isSelected
                        ? "border-teal-500 bg-teal-500 text-white scale-110"
                        : "border-slate-200 group-hover:border-teal-300"
                    )}
                  >
                    {isSelected && <Heart className="w-3 h-3 fill-current" />}
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent z-0" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2 bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-slate-500 font-medium leading-tight">
              You can select multiple options
            </p>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}