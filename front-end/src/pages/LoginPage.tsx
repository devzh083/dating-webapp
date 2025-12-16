// src/pages/LoginPage.tsx

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Heart } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TopBar from "@/components/layout/TopBar";

type AuthView = "login" | "signup";

type LoginPageProps = {
  isLoggedIn: boolean;
  onLogout: () => void;
  onLoginSuccess: () => void;
};

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function LoginPage({
  isLoggedIn,
  onLogout,
  onLoginSuccess,
}: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- GOOGLE REDIRECT HANDLING ---------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");

    if (access && refresh) {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      window.history.replaceState({}, "", window.location.pathname);
      onLoginSuccess();
      navigate("/home");
    }
  }, [location.search, navigate, onLoginSuccess]);

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid credentials");
      }

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      onLoginSuccess();
      navigate("/home");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGNUP ---------------- */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const registerRes = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email.trim(),
          password,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.detail || "Signup failed");
      }

      // Auto-login after signup
      await handleLogin(e as any);
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/google-login/`);
      const data = await res.json();

      if (!res.ok || !data.auth_url) {
        throw new Error("Google login failed");
      }

      window.location.href = data.auth_url;
    } catch {
      setErrorMsg("Google login failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <TopBar userName="User" />

      <div className="pt-32 pb-20 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {view === "signup" ? (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md"
            >
              <div className="bg-card rounded-3xl shadow-2xl border p-8">
                <button
                  onClick={() => setView("login")}
                  className="flex items-center gap-2 text-muted-foreground mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </button>

                <h1 className="text-2xl font-bold text-center mb-6">
                  Create Account
                </h1>

                <form onSubmit={handleSignup} className="space-y-4">
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} required />

                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  <Label>Confirm Password</Label>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

                  <Button className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md"
            >
              <div className="bg-card rounded-3xl shadow-2xl border p-8">
                <h1 className="text-2xl font-bold text-center mb-6">
                  The Dating App
                </h1>

                <form onSubmit={handleLogin} className="space-y-4">
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} required />

                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

                  <Button className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                    Continue with Google
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setView("signup")}
                    className="text-primary text-sm"
                  >
                    New user? Sign up
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
