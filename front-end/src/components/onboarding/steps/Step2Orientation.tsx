import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Brand Gradient
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";

interface Step2Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void; // ✅ Added Skip Prop
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
    <div className="max-w-md mx-auto py-8 px-6">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {onSkip && (
          <button 
            onClick={onSkip} 
            className="text-sm font-bold text-gray-400 hover:text-[#0095E0] transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Relationship Status</h2>
        <p className="text-gray-500 text-sm">Be honest, it helps us find what you really need.</p>
      </div>

      <div className="space-y-3">
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

      <div className="mt-12">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className={`w-full h-14 rounded-full font-bold text-lg text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none ${PRIMARY_GRADIENT}`}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}