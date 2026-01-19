import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OtpVerificationProps {
  email: string;                // username
  apiBaseUrl: string;           // e.g. http://localhost:8000/api
  onSuccess: () => void;        // called after successful verification
  onResend: () => void;         // already wired in LoginPage
  onBack: () => void;
}

export default function OtpVerification({
  email,
  apiBaseUrl,
  onSuccess,
  onResend,
  onBack,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleResend = () => {
    if (canResend) {
      onResend();
      setResendTimer(30);
      setCanResend(false);
    }
  };

  const handleComplete = (value: string) => {
    setOtp(value);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${apiBaseUrl}/login/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          otp: otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid OTP");
      }

      // Expecting access & refresh tokens in response
      if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user_email", email.toLowerCase());
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="bg-card rounded-3xl shadow-2xl border border-border/50 p-8 md:p-10">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-start to-primary-end flex items-center justify-center">
            <Mail className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Verify Your Email
          </h1>
          <p className="text-muted-foreground">We&apos;ve sent a 6-digit code to</p>
          <p className="text-foreground font-medium mt-1">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center mb-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={handleComplete}
            disabled={isLoading}
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="w-12 h-14 text-xl font-semibold rounded-xl border-2 border-border bg-muted/30 focus:border-primary"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {errorMsg && (
          <p className="text-center text-xs text-red-500 mb-2">{errorMsg}</p>
        )}

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-start to-primary-end hover:opacity-90 text-white font-semibold"
          disabled={otp.length !== 6 || isLoading}
        >
          {isLoading ? "Verifying..." : "Verify Email"}
        </Button>

        {/* Resend */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Didn&apos;t receive the code?{" "}
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-primary hover:underline font-medium"
              >
                Resend
              </button>
            ) : (
              <span className="text-foreground font-medium">
                Resend in {resendTimer}s
              </span>
            )}
          </p>
        </div>

        {/* Help text */}
        <p className="text-center text-muted-foreground text-xs mt-4">
          Check your spam folder if you don&apos;t see the email
        </p>
      </div>
    </motion.div>
  );
}
