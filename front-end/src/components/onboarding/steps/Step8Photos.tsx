// src/components/onboarding/steps/Step8Photos.tsx
import React, { useState, useEffect } from "react";
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
  const [photos, setPhotos] = useState<string[]>(data.photos || []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync with parent data when it changes (important for edit mode)
  useEffect(() => {
    setPhotos(data.photos || []);
  }, [data.photos]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (photos.length >= MAX_PHOTOS) {
      setUploadError("Maximum 4 photos allowed");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 5MB.");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/profile/upload-photo/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(errorData.detail || "Upload failed");
      }

      const json = await res.json();
      const url = json.url as string;

      const next = [...photos, url];
      setPhotos(next);
      onChange({ photos: next });
    } catch (e: any) {
      console.error("Error uploading photo:", e);
      setUploadError(e.message || "Failed to upload photo");
      setTimeout(() => setUploadError(null), 3000);
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
      totalSteps={9}
      title="Add your best photos"
      subtitle="Upload 4 photos to complete your profile. First photo will be your main profile picture."
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={photos.length > 0}
    >
      <div className="space-y-6">
        {/* Upload Error Message */}
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <p className="text-sm text-red-600 font-medium">{uploadError}</p>
          </motion.div>
        )}

        {/* Uploading Indicator */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-teal-50 border border-teal-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
              <p className="text-sm text-teal-700 font-medium">Uploading photo...</p>
            </div>
          </motion.div>
        )}

        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
            const photoUrl = photos[index];
            const isMain = index === 0;
            const isFilled = !!photoUrl;

            return (
              <div key={index} className="relative aspect-square">
                {isFilled ? (
                  // FILLED STATE (Image with Delete Button)
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-full w-full rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm group"
                  >
                    <img
                      src={photoUrl}
                      alt={`User photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    
                    {/* Delete Button - Shows on Hover */}
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg z-10"
                      title="Delete photo"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Main Badge */}
                    {isMain && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-3 flex justify-center">
                        <span className="text-xs font-bold text-white uppercase tracking-wider px-3 py-1 bg-teal-500 rounded-full">
                          Main
                        </span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  // EMPTY STATE (Upload Button)
                  <label
                    className={cn(
                      "h-full w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                      uploading && "opacity-50 cursor-not-allowed pointer-events-none",
                      isMain
                        ? "border-teal-300 bg-teal-50 hover:bg-teal-100/50 hover:border-teal-400"
                        : "border-gray-200 hover:border-teal-200 hover:bg-gray-50"
                    )}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleFile(e.target.files ? e.target.files[0] : null)
                      }
                      disabled={uploading}
                    />

                    <div
                      className={cn(
                        "rounded-full p-3 mb-2 transition-all",
                        isMain
                          ? "bg-white text-teal-500 shadow-sm"
                          : "text-gray-400"
                      )}
                    >
                      {isMain ? (
                        <Camera className="w-6 h-6" />
                      ) : (
                        <Plus className="w-6 h-6" />
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-sm font-medium",
                        isMain ? "text-teal-700" : "text-gray-400"
                      )}
                    >
                      {isMain ? "Main Photo" : "Add Photo"}
                    </span>
                  </label>
                )}
              </div>
            );
          })}
        </div>

        {/* Tips Section */}
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
          <p className="text-sm font-semibold text-teal-900 mb-2">
            📸 Photo Tips
          </p>
          <ul className="text-xs text-teal-700 space-y-1.5">
            <li>• Clear face photos get more matches</li>
            <li>• First photo becomes your main profile picture</li>
            <li>• Hover over photos to delete them</li>
            <li>• Max file size: 5MB (JPEG, PNG, WebP)</li>
          </ul>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step8Photos;