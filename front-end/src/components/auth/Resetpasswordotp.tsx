import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type ResetPasswordOTPProps = {
  email: string;
  apiBaseUrl: string;
  onVerified: (email: string, resetToken: string) => void;
  onBack: () => void;
  onResend: () => void;
};

export default function ResetPasswordOTP({
  email,
  apiBaseUrl,
  onVerified,
  onBack,
  onResend,
}: ResetPasswordOTPProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMsg(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/password/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otpString,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid code");
      }

      // OTP verified, proceed to password reset
      onVerified(email, data.reset_token);
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(60);
    setErrorMsg(null);
    await onResend();
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
            Enter Reset Code
          </h1>
          <p className="text-[12px] text-[#9ca3af]">
            We sent a code to <span className="font-medium text-[#4b5563]">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-11 h-12 text-center text-[18px] font-semibold rounded-lg border-2 border-[#e5e7eb] focus:border-[#ff9966] focus:outline-none bg-[#f9fafb] transition-colors"
                disabled={loading}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-red-500 text-[11px] text-center">{errorMsg}</p>
          )}

          <Button
            type="submit"
            className="w-full h-10 rounded-lg bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-white text-[12px] font-semibold shadow-[0_8px_18px_rgba(255,126,95,0.35)]"
            disabled={loading || otp.some((d) => !d)}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-[11px] text-[#16a3ff] hover:underline font-medium"
              >
                Resend code
              </button>
            ) : (
              <p className="text-[11px] text-[#9ca3af]">
                Resend code in {countdown}s
              </p>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}