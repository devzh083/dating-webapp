import React from "react";

interface ProfileCompletionProps {
  percentage: number;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ percentage }) => {
  const safePct = Math.max(0, Math.min(100, percentage || 0));
  const message =
    safePct >= 80
      ? "You're all set"
      : safePct >= 50
      ? "Almost there"
      : "You're not being known enough";

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm max-w-xl">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            !
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{message}</h3>
            <p className="text-sm text-muted-foreground mt-1">Complete more to stand out from the crowd</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{safePct}%</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${safePct}%`,
              background:
                safePct >= 80
                  ? "linear-gradient(90deg,#27c5be,#2ecc71)"
                  : "linear-gradient(90deg,#27c5be,#8ad6cf)",
            }}
          />
        </div>

        <div className="mt-3">
          <a href="/onboarding" className="text-sm text-primary font-medium">
            Complete your profile →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
