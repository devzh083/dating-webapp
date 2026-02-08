import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotPasswordProps = {
  apiBaseUrl: string;
  onBack: () => void;
  onOtpSent: (email: string) => void;
};

export default function ForgotPassword({
  apiBaseUrl,
  onBack,
  onOtpSent,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/password/forgot/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to send reset code");
      }

      setSuccessMsg(data.message);
      
      // Wait 1.5 seconds to show success message, then proceed to OTP
      setTimeout(() => {
        onOtpSent(email.trim());
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reset code");
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
          <span>Back to login</span>
        </button>

        <div className="text-center mb-7">
          <h1 className="text-[18px] font-semibold text-[#222222] mb-1">
            Forgot Password
          </h1>
          <p className="text-[12px] text-[#9ca3af]">
            Enter your email to receive a reset code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[12px]">
          <div className="space-y-1">
            <Label
              htmlFor="reset-email"
              className="text-[11px] font-medium text-[#4b5563]"
            >
              Email
            </Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="youremail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] focus:ring-1 focus:ring-[#ff9966]"
              required
              disabled={loading}
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-[11px] text-center">{errorMsg}</p>
          )}

          {successMsg && (
            <p className="text-green-500 text-[11px] text-center">{successMsg}</p>
          )}

          <Button
            type="submit"
            className="w-full h-10 mt-1 rounded-lg bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-white text-[12px] font-semibold shadow-[0_8px_18px_rgba(255,126,95,0.35)]"
            disabled={loading}
          >
            {loading ? "Sending code..." : "Send Reset Code"}
          </Button>
        </form>
      </div>
    </motion.div>
  );
} 