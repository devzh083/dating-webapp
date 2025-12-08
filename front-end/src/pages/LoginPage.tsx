import "./LoginPage.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

type LoginPageProps = {
  isLoggedIn: boolean;
};

const LoginPage: React.FC<LoginPageProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // redirect away if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // ------------------------------------------------------
  // Email Login / Signup
  // ------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const email = emailOrPhone.trim();

      if (isSignUpMode) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/");
    } catch (err: any) {
      console.error("Firebase error:", err.code);

      // default friendly message for bad credentials
      let msg = "Try entering correct email and password.";

      // more specific message when signing up
      if (isSignUpMode && err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Try logging in.";
      }

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // Google Login
  // ------------------------------------------------------
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      setErrorMsg("Google login failed. Try again.");
    } finally {
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
      <TopBar isLoggedIn={isLoggedIn} />

      <main className="login-page">
        <div className="login-card">
          <h1 className="login-title">The Dating App</h1>
          <h2 className="login-heading">
            {isSignUpMode ? "Sign up" : "Login"}
          </h2>

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

          {/* Google Login Button */}
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
