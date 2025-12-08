// src/pages/LoginPage.tsx
import "./LoginPage.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

type LoginPageProps = {
  isLoggedIn: boolean;
  onLogout: () => void;
  onLoginSuccess: () => void;
};

const API_BASE_URL = "http://127.0.0.1:8000/api";

const LoginPage: React.FC<LoginPageProps> = ({
  isLoggedIn,
  onLogout,
  onLoginSuccess,
}) => {
  const navigate = useNavigate();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      // navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const username = emailOrPhone.trim();

      if (!username || !password) {
        throw new Error("Try entering correct email and password.");
      }

      if (isSignUpMode) {
        const registerRes = await fetch(`${API_BASE_URL}/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          throw new Error(
            registerData.detail ||
              "This email is already registered. Try logging in."
          );
        }

        const loginRes = await fetch(`${API_BASE_URL}/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          throw new Error(loginData.detail || "Login after signup failed.");
        }

        localStorage.setItem("access_token", loginData.access);
        localStorage.setItem("refresh_token", loginData.refresh);
      } else {
        const loginRes = await fetch(`${API_BASE_URL}/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          throw new Error(
            loginData.detail || "Try entering correct email and password."
          );
        }

        localStorage.setItem("access_token", loginData.access);
        localStorage.setItem("refresh_token", loginData.refresh);
      }

      onLoginSuccess();
      navigate("/");
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "Try entering correct email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/google-login/`);
      const data = await res.json();

      if (!res.ok || !data.auth_url) {
        throw new Error("Google login failed. Try again.");
      }

      window.location.href = data.auth_url;
    } catch (err: any) {
      console.error("Google login error:", err);
      setErrorMsg("Google login failed. Try again.");
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUpMode((prev) => !prev);
    setErrorMsg(null);
  };

  const handleCafePartnerLogin = () => {
    alert("Café Partner Login coming soon.");
  };

  return (
    <div className="app-shell">
      <TopBar isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="login-page">
        <div className="login-card">
          <h1 className="login-title">The Dating App</h1>
          <h2 className="login-heading">
            {isLoggedIn ? "Account" : isSignUpMode ? "Sign up" : "Login"}
          </h2>

          {!isLoggedIn ? (
            <>
              <form className="login-form" onSubmit={handleSubmit}>
                <label className="form-label">
                  Email
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                  />
                </label>

                <label className="form-label">
                  Password
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>

                {errorMsg && (
                  <p style={{ color: "#dc2626", fontSize: 12, margin: 0 }}>
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading
                    ? isSignUpMode
                      ? "Creating account..."
                      : "Logging in..."
                    : isSignUpMode
                    ? "Sign up"
                    : "Login"}
                </button>
              </form>

              <button
                type="button"
                className="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="google-icon"
                />
                Continue with Google
              </button>

              <button
                className="link-button"
                type="button"
                onClick={toggleMode}
              >
                {isSignUpMode
                  ? "Already have an account? Login"
                  : "New user? Sign up"}
              </button>
            </>
          ) : (
            <>
              <p style={{ marginTop: 16 }}>You are logged in.</p>
              <button
                type="button"
                className="login-button"
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          )}

          <button
            className="link-button secondary"
            type="button"
            onClick={handleCafePartnerLogin}
          >
            Café Partner Login
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
