import StepLayout from "../StepLayout";

interface Step2Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

const RELATIONSHIP_STATUSES = [
  "Single",
  "Committed",
  "Broken up recently",
  "Divorced",
  "Widowed"
];

export default function Step2Orientation({ data, onChange, onNext, onBack, onSkip }: Step2Props) {
  
  const isValid = !!data.relationshipType;

  return (
    <StepLayout
      currentStep={2}
      totalSteps={10}
      title="Relationship Status"
      subtitle="Be honest, it helps us find what you really need."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      canProceed={isValid}
      showBack={true}
      nextLabel="Next Step"
    >
      <div className="space-y-3 pt-4">
        {RELATIONSHIP_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => onChange({ relationshipType: status })}
            className={`w-full p-5 rounded-2xl border-2 text-left font-bold text-base transition-all duration-200 flex items-center justify-between group ${
              data.relationshipType === status
                ? "border-[#0095E0] bg-[#0095E0]/5 text-[#0095E0] shadow-sm" // Active State
                : "border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50"
            }`}
          >
            {status}
            
            {/* Custom Radio Circle */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
               data.relationshipType === status ? "border-[#0095E0]" : "border-gray-300 group-hover:border-gray-400"
            }`}>
              {data.relationshipType === status && (
                <div className="w-2.5 h-2.5 bg-[#0095E0] rounded-full" />
              )}
            </div>
          </button>
        ))}
      </div>
    </StepLayout>
  );
}