import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

type LoginPageProps = {
  isLoggedIn: boolean;
};

const API_BASE_URL = "http://127.0.0.1:8000/api"; // Update for production

const LoginPage: React.FC<LoginPageProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [username, setUsername] = useState(""); // Changed from emailOrPhone
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) {
    navigate("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const endpoint = isSignUpMode ? "register/" : "login/";
      const url = `${API_BASE_URL}/${endpoint}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      // Store tokens in localStorage
      if (isSignUpMode) {
        // After registration, auto-login (call login API)
        await handleAutoLoginAfterSignup(username, password);
      } else {
        // Login success - store tokens
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
      }

      navigate("/");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-login after successful registration
  const handleAutoLoginAfterSignup = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
    }
  };

  const handleCafePartnerLogin = () => {
    alert("Café Partner Login coming soon.");
  };

  const toggleMode = () => {
    setIsSignUpMode((prev) => !prev);
    setErrorMsg(null);
    setUsername(""); // Clear form
    setPassword("");
  };

  return (
    <div className="app-shell">
      <TopBar isLoggedIn={isLoggedIn} />

      <main className="login-page">
        <div className="login-card">
          <h1 className="login-title">The Dating App</h1>
          <h2 className="login-heading">
            {isSignUpMode ? "Sign up" : "Login"}
          </h2>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="form-label">
              Username {/* Changed from Email */}
              <input
                type="text"
                className="form-input"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

            <button type="submit" className="login-button" disabled={loading}>
              {loading
                ? isSignUpMode
                  ? "Creating account..."
                  : "Logging in..."
                : isSignUpMode
                ? "Sign up"
                : "Login"}
            </button>
          </form>

          <button className="link-button" type="button" onClick={toggleMode}>
            {isSignUpMode
              ? "Already have an account? Login"
              : "New user? Sign up"}
          </button>

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
