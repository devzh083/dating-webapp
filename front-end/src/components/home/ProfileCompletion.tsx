import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileCompletionProps {
  percentage: number;
}

export const ProfileCompletion = ({ percentage }: ProfileCompletionProps) => {
  const isComplete = percentage === 100;

  return (
    <div className="bg-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-primary" />
          )}
          <h3 className="font-semibold text-foreground">Profile Completion</h3>
        </div>
        <span className="text-2xl font-bold text-primary">{percentage}%</span>
      </div>

      <Progress value={percentage} className="h-2 mb-3" />

      {!isComplete && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Complete your profile to get more matches!
          </p>
          <Link
            to="/edit-profile"
            className="text-sm font-medium text-primary hover:underline"
          >
            Complete now →
          </Link>
        </div>
      )}
    </div>
  );
};
