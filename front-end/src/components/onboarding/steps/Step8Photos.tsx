// src/components/onboarding/steps/Step8Photos.tsx
import React, { useState } from "react";
import StepLayout from "../StepLayout";
import { OnboardingData } from "../OnboardingFlow";
import { Camera, Plus, X, Loader2 } from "lucide-react";
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
  const [photos, setPhotos] = useState<string[]>(data.photos || []);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleFile = async (file: File | null, index: number) => {
    if (!file || photos.length >= MAX_PHOTOS) return;

    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/photos/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: formData,
      });

      if (!res.ok) {
        console.error("Upload failed", await res.text());
        return;
      }

      const json = await res.json();
      const url = json.url as string;

      const next = [...photos];
      next[index] = url;

      setPhotos(next);
      onChange({ photos: next });
    } catch (e) {
      console.error("Error uploading photo", e);
    } finally {
      setUploadingIndex(null);
    }
  };

  const removePhoto = (index: number) => {
    const next = photos.filter((_, i) => i !== index);
    setPhotos(next);
    onChange({ photos: next });
  };

  return (
    <StepLayout
      currentStep={8}
      totalSteps={9}
      title="Show yourself off ✨"
      subtitle="Profiles with photos get way more matches. Your first photo is the star."
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={photos.length > 0}
    >
      <div className="space-y-8">
        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
            const photoUrl = photos[index];
            const isMain = index === 0;
            const isUploading = uploadingIndex === index;

            return (
              <div key={index} className="relative aspect-[3/4]">
                {photoUrl ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-full w-full rounded-2xl overflow-hidden border shadow-sm group"
                  >
                    <img
                      src={photoUrl}
                      alt={`User photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {/* Remove */}
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Main badge */}
                    {isMain && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full">
                        <span className="text-[10px] font-semibold text-white tracking-wide">
                          MAIN PHOTO
                        </span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <label
                    className={cn(
                      "h-full w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all",
                      isMain
                        ? "border-teal-300 bg-teal-50 hover:bg-teal-100/60"
                        : "border-gray-200 hover:border-teal-200 hover:bg-gray-50"
                    )}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFile(
                          e.target.files ? e.target.files[0] : null,
                          index
                        )
                      }
                    />

                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                    ) : (
                      <>
                        <div
                          className={cn(
                            "rounded-full p-3 mb-2",
                            isMain
                              ? "bg-white text-teal-500 shadow"
                              : "text-gray-400"
                          )}
                        >
                          {isMain ? (
                            <Camera className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            isMain ? "text-teal-700" : "text-gray-400"
                          )}
                        >
                          {isMain ? "Main photo" : "Add photo"}
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>
            );
          })}
        </div>

        {/* TIP */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Tip: Clear photos with good lighting get up to{" "}
            <span className="font-semibold text-gray-600">3× more matches</span>
          </p>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step8Photos;
