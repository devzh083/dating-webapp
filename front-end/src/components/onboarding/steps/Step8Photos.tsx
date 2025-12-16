// src/components/onboarding/steps/Step8Photos.tsx
import React, { useState } from "react";
import StepLayout from "../StepLayout";
import { OnboardingData } from "../OnboardingFlow";

interface Step8Props {
  data: Pick<OnboardingData, "photos">;
  onChange: (data: Step8Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const Step8Photos: React.FC<Step8Props> = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}) => {
  const [local, setLocal] = useState<string[]>(data.photos || []);

  const handleFile = async (file: File | null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/photos/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem("access_token") || ""
          }`,
        },
        body: formData,
      });

      if (!res.ok) {
        console.error("Upload failed", await res.text());
        return;
      }

      const json = await res.json();
      const url = json.url as string;

      const next = [...local, url].slice(0, 6);
      setLocal(next);
      onChange({ photos: next });
    } catch (e) {
      console.error("Error uploading photo", e);
    }
  };

  const removeAt = (i: number) => {
    const next = local.filter((_, idx) => idx !== i);
    setLocal(next);
    onChange({ photos: next });
  };

  return (
    <StepLayout
      currentStep={8}
      totalSteps={9}
      title="Add photos"
      subtitle="Upload a few clear photos so matches can see you"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={true}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {local.map((p, i) => (
            <div
              key={i}
              className="relative rounded-lg overflow-hidden border border-border"
            >
              <img
                src={p}
                alt={`photo-${i}`}
                className="w-full h-32 object-cover"
              />
              <button
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
                aria-label="remove"
              >
                ✕
              </button>
            </div>
          ))}

          {local.length < 6 && (
            <label className="flex items-center justify-center border border-dashed border-border rounded-lg h-32 cursor-pointer text-sm">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFile(e.target.files ? e.target.files[0] : null)
                }
              />
              <div className="text-center">
                <div className="font-medium">Upload photo</div>
                <div className="text-xs text-muted-foreground">Max 6</div>
              </div>
            </label>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Tip: a clear headshot and one full-body photo works best.
        </p>
      </div>
    </StepLayout>
  );
};

export default Step8Photos;
