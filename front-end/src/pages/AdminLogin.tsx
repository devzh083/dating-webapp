import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/profileService";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await adminService.adminLogin(username, password);
      console.log('Login successful:', result.user.username);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3fbff] to-[#f9fdfc]">
      {/* Back to Main Site Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[11px] text-[#9ca3af] hover:text-[#4b5563] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.08)] border border-[#f1f1f5] px-10 py-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] flex items-center justify-center shadow-[0_8px_18px_rgba(255,126,95,0.35)]">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-7">
              <h1 className="text-[18px] font-semibold text-[#222222] mb-1">
                Admin Panel
              </h1>
              <p className="text-[12px] text-[#9ca3af]">
                Sign in with your Django superuser account
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
              >
                <p className="text-[11px] text-red-800 text-center">{errorMsg}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-[12px]">
              <div className="space-y-1">
                <Label
                  htmlFor="username"
                  className="text-[11px] font-medium text-[#4b5563]"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] focus:ring-1 focus:ring-[#ff9966]"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-medium text-[#4b5563]"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] pr-9 focus:ring-1 focus:ring-[#ff9966]"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c9d3] hover:text-[#6b7280]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full h-10 mt-1 rounded-lg bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-white text-[12px] font-semibold shadow-[0_8px_18px_rgba(255,126,95,0.35)]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-[#f1f1f5]">
              <p className="text-center text-[11px] text-[#b0b5c0]">
                Admin access only • Dating App Dashboard v1.0
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}