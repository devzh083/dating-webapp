import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NewPasswordProps = {
  email: string;
  resetToken: string;
  apiBaseUrl: string;
  onSuccess: () => void;
  onBack: () => void;
};

export default function NewPassword({
  email,
  resetToken,
  apiBaseUrl,
  onSuccess,
  onBack,
}: NewPasswordProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/password/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          reset_token: resetToken,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to reset password");
      }

      // Success! Show success message briefly then redirect to login
      alert(data.message);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-sm"
    >
      <div className="bg-white rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.08)] border border-[#f1f1f5] px-10 py-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[11px] text-[#9ca3af] hover:text-[#4b5563] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="text-center mb-7">
          <h1 className="text-[18px] font-semibold text-[#222222] mb-1">
            Create New Password
          </h1>
          <p className="text-[12px] text-[#9ca3af]">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[12px]">
          <div className="space-y-1">
            <Label
              htmlFor="new-password"
              className="text-[11px] font-medium text-[#4b5563]"
            >
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] pr-9 focus:ring-1 focus:ring-[#ff9966]"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c9d3] hover:text-[#6b7280]"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="confirm-new-password"
              className="text-[11px] font-medium text-[#4b5563]"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] pr-9 focus:ring-1 focus:ring-[#ff9966]"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c9d3] hover:text-[#6b7280]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-red-500 text-[11px] text-center">{errorMsg}</p>
          )}

          <Button
            type="submit"
            className="w-full h-10 mt-1 rounded-lg bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-white text-[12px] font-semibold shadow-[0_8px_18px_rgba(255,126,95,0.35)]"
            disabled={loading}
          >
            {loading ? "Resetting password..." : "Reset Password"}
          </Button>
        </form>

        <p className="text-center text-[11px] text-[#b0b5c0] mt-6">
          Password must be at least 8 characters long
        </p>
      </div>
    </motion.div>
  );
}