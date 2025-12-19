// src/components/onboarding/steps/Step8Photos.tsx
import React, { useState } from "react";
import StepLayout from "../StepLayout";
import { OnboardingData } from "../OnboardingFlow";
import { Camera, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Step8Props {
  data: Pick<OnboardingData, "photos">;
  onChange: (data: Step8Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const MAX_PHOTOS = 4;

const Step8Photos: React.FC<Step8Props> = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}) => {
  // Local state to manage uploads before saving
  const [photos, setPhotos] = useState<string[]>(data.photos || []);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (photos.length >= MAX_PHOTOS) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Replace with your actual upload endpoint
      // Simulating upload delay for UI feel
      const res = await fetch("/api/photos/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: formData,
      });

      if (!res.ok) {
        console.error("Upload failed", await res.text());
        setUploading(false);
        return;
      }

      const json = await res.json();
      const url = json.url as string;

      const next = [...photos, url];
      setPhotos(next);
      onChange({ photos: next });
    } catch (e) {
      console.error("Error uploading photo", e);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    const next = photos.filter((_, idx) => idx !== indexToRemove);
    setPhotos(next);
    onChange({ photos: next });
  };

  return (
    <StepLayout
      currentStep={8}
      totalSteps={9} // Adjusted to match your flow numbering
      title="Add your best photos"
      subtitle="Upload 4 photos to complete your profile. First photo will be your main profile picture."
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={photos.length > 0}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4 h-40">
          {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
            const photoUrl = photos[index];
            const isMain = index === 0;
            const isFilled = !!photoUrl;

            return (
              <div key={index} className="relative h-full">
                {isFilled ? (
                  // FILLED STATE (Image)
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-full w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm group"
                  >
                    <img
                      src={photoUrl}
                      alt={`User photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {isMain && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 flex justify-center">
                         <span className="text-[10px] font-medium text-white uppercase tracking-wider">Main</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  // EMPTY STATE (Upload Button)
                  <label
                    className={cn(
                      "h-full w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer hover:bg-opacity-70",
                      isMain
                        ? "border-teal-300 bg-teal-50 hover:bg-teal-100/50" // Main Slot Styling
                        : "border-gray-200 hover:border-teal-200 hover:bg-gray-50" // Other Slots
                    )}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFile(e.target.files ? e.target.files[0] : null)
                      }
                      disabled={uploading}
                    />
                    
                    <div className={cn(
                        "rounded-full p-2 mb-2",
                         isMain ? "bg-white text-teal-500 shadow-sm" : "text-gray-400"
                    )}>
                        {isMain ? <Camera className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                    
                    <span className={cn(
                        "text-xs font-medium",
                        isMain ? "text-teal-700" : "text-gray-400"
                    )}>
                      {isMain ? "Main" : "Add"}
                    </span>
                  </label>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            Tip: Photos with your face visible get more matches!
          </p>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step8Photos;