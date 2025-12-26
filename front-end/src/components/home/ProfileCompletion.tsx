import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

// Matches the data structure in your OnboardingFlow
interface OnboardingData {
  firstName?: string;
  dateOfBirth?: string;
  gender?: string;
  interests?: string[];
  location?: string;
  photos?: string[];
  relationshipType?: string;
  bio?: string;
  orientation?: string[];
  drinking?: string;
  smoking?: string;
  workout?: string;
  pets?: string;
  communicationStyle?: string[];
  responsePace?: string;
  conversationStarter?: string;
  [key: string]: any;
}

const ProfileCompletion: React.FC = () => {
  const navigate = useNavigate();
  const [percentage, setPercentage] = useState(0);
  const [nextStep, setNextStep] = useState(1);
  const [isFullyComplete, setIsFullyComplete] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("onboardingData");
    
    // Default steps config if no data exists
    let steps = [
       { id: 1, valid: false }, // Basic Info
       { id: 2, valid: false }, // Orientation
       { id: 3, valid: true },  // Distance (has default)
       { id: 4, valid: false }, // Lifestyle
       { id: 5, valid: false }, // Communication
       { id: 6, valid: false }, // Interests
       { id: 7, valid: false }, // Location
       { id: 8, valid: false }, // Photos
       { id: 9, valid: false }, // Bio
    ];

    if (saved) {
      try {
        const data: OnboardingData = JSON.parse(saved);

        // ---------------------------------------------------------
        // 1. Validation Logic (Matches OnboardingFlow Steps)
        // ---------------------------------------------------------
        steps = [
          { 
            id: 1, 
            valid: !!data.firstName?.trim() && !!data.dateOfBirth && !!data.gender?.trim() 
          },
          { 
            id: 2, 
            valid: (data.orientation || []).length > 0 && !!data.relationshipType?.trim() 
          },
          { 
            id: 3, 
            valid: true // Distance has default 50
          },
          { 
            id: 4, 
            valid: !!data.drinking && !!data.smoking && !!data.workout && !!data.pets 
          },
          { 
            id: 5, 
            valid: (data.communicationStyle || []).length > 0 && !!data.responsePace 
          },
          { 
            id: 6, 
            valid: (data.interests || []).length > 0 
          },
          { 
            id: 7, 
            valid: !!data.location?.trim() 
          },
          { 
            id: 8, 
            valid: (data.photos || []).length > 0 
          },
          { 
            id: 9, 
            valid: !!data.bio?.trim() && !!data.conversationStarter?.trim()
          },
          // Step 10 is Review, implied if 1-9 are done
        ];
      } catch (e) {
        console.error("Error parsing onboarding data", e);
      }
    }

    // ---------------------------------------------------------
    // 2. Calculate Percentage & Next Step
    // ---------------------------------------------------------
    const totalDataSteps = 9; 
    const completedSteps = steps.filter((s) => s.valid).length;
    
    // Cap percentage at 100
    const pct = Math.min(100, Math.round((completedSteps / totalDataSteps) * 100));
    setPercentage(pct);

    // Find the FIRST step that is incomplete to redirect user there
    const firstIncomplete = steps.find((s) => !s.valid);
    
    if (firstIncomplete) {
      setNextStep(firstIncomplete.id);
      setIsFullyComplete(false);
    } else {
      // If all data steps (1-9) are valid, go to Review (10)
      setNextStep(10); 
      setIsFullyComplete(true);
    }

  }, []);

  const handleCompleteProfile = () => {
    // Save the specific step to resume
    localStorage.setItem("onboardingStep", nextStep.toString());
    navigate("/onboarding");
  };

  /* ---------------- UI: 100% COMPLETED STATE ---------------- */
  if (isFullyComplete) {
    return (
      <div className="mb-6 p-6 rounded-[24px] bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center shadow-sm">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3 text-emerald-600 shadow-sm">
           <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-emerald-900 font-bold text-lg mb-1">
          Profile Completed!
        </h3>
        <p className="text-emerald-700/80 text-xs mb-4">
          Your profile looks great. You are ready to match!
        </p>
        <button
          onClick={handleCompleteProfile} // Goes to Step 10 (Review)
          className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-full hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
        >
          Review Profile
        </button>
      </div>
    );
  }

  /* ---------------- UI: INCOMPLETE STATE ---------------- */
  return (
    <div className="mb-6 p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm">
       {/* Header */}
       <div className="flex items-center justify-between mb-4">
          <div>
            <span className="block text-sm font-bold text-gray-900">
              Profile Completion
            </span>
            <span className="text-xs text-gray-400 font-medium">
               Complete to get more matches
            </span>
          </div>
          <span className="text-lg font-black text-teal-600">
             {percentage}%
          </span>
       </div>

       {/* Progress Bar */}
       <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-5">
           <div 
             className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-1000 ease-out" 
             style={{ width: `${percentage}%` }}
           ></div>
       </div>

       {/* Action Button */}
       <button 
          onClick={handleCompleteProfile}
          className="w-full flex items-center justify-center gap-2 py-3 bg-teal-500 text-white rounded-full text-xs font-bold uppercase tracking-wide hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-100 transition-all duration-200 group"
       >
          <span>Complete Profile</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
       </button>
    </div>
  );
};

export default ProfileCompletion;