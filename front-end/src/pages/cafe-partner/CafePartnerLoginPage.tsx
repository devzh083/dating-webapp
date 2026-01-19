import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Store } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function CafePartnerLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");

      // 🚨 IMPORTANT: role check
      if (data.user.role !== "cafe_owner") {
        throw new Error("Not a café partner account");
      }

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      navigate("/cafe-partner/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <Store className="text-white" />
          </div>
          <h1 className="text-xl font-bold">Café Partner</h1>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Login to manage your café, bookings & verification
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Business email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg p-3"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg p-3 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

<p className="mt-6 text-center text-sm text-gray-500">
  New partner?{" "}
  <button
    type="button"
    onClick={() => navigate("/cafe-partner/signup")}
    className="text-red-500 font-medium hover:underline"
  >
    Register your café
  </button>
</p>

      </div>
    </div>
  );
}
