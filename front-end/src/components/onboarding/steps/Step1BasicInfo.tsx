import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Calendar } from "lucide-react";

// Brand Gradient
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";

interface Step1Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onSkip?: () => void; // ✅ Added Skip Prop
}

export default function Step1BasicInfo({ data, onChange, onNext, onSkip }: Step1Props) {
  
  const isValid =
    data.firstName?.trim().length > 0 &&
    data.dateOfBirth &&
    data.gender; 

  return (
    <div className="max-w-md mx-auto py-8 px-6 relative">
      
      {/* Header with Skip */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Basic Info</h2>
          <p className="text-gray-500 text-sm mt-1">Let's start with the essentials.</p>
        </div>
        {onSkip && (
          <button 
            onClick={onSkip} 
            className="text-sm font-bold text-gray-400 hover:text-[#0095E0] transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">First Name</Label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0095E0] transition-colors" />
            <Input
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="e.g. Alex"
              className="pl-12 h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#0095E0] focus:ring-4 focus:ring-[#0095E0]/10 transition-all font-medium text-base"
            />
          </div>
        </div>

        {/* Date of Birth Input */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Date of Birth</Label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0095E0] transition-colors" />
            <input
              type="date"
              value={data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ''}
              onChange={(e) => onChange({ dateOfBirth: new Date(e.target.value) })}
              className="w-full pl-12 h-14 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#0095E0] focus:ring-4 focus:ring-[#0095E0]/10 outline-none transition-all px-4 text-base font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Gender Selection (Boy / Girl) */}
        <div className="space-y-3">
          <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">I am a</Label>
          <div className="grid grid-cols-2 gap-4">
            {["Boy", "Girl"].map((option) => (
              <button
                key={option}
                onClick={() => onChange({ gender: option })}
                className={`h-16 rounded-2xl font-bold text-base border-2 transition-all duration-200 ${
                  data.gender === option
                    ? "border-[#0095E0] bg-[#0095E0]/5 text-[#0095E0] shadow-sm" // Active Blue State
                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className={`w-full h-14 rounded-full font-bold text-lg text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none ${PRIMARY_GRADIENT}`}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}