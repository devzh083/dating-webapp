import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, ArrowRight } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function CafeOnboardingPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    cuisine: "",
    address: "",
    area: "",
    price_for_two: "",
    has_table_booking: true,
    pure_veg: false,
    serves_alcohol: false,
    rooftop: false,
  });

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/partner/cafes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          ...form,
          price_for_two: Number(form.price_for_two),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to submit café");

      // After creation → go to dashboard
      navigate("/cafe-partner/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <Store className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Register Your Café</h1>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          Add your café details to start receiving bookings
        </p>

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cafe Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Café Name
            </label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="The Coffee House"
            />
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cuisine
            </label>
            <input
              name="cuisine"
              required
              value={form.cuisine}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="Cafe • Italian • Desserts"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Address
            </label>
            <input
              name="address"
              required
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="Street, Landmark, City"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Area
            </label>
            <input
              name="area"
              required
              value={form.area}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="Banjara Hills"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Average Price for Two (₹)
            </label>
            <input
              name="price_for_two"
              type="number"
              required
              value={form.price_for_two}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="800"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Café Features
            </label>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="has_table_booking"
                  checked={form.has_table_booking}
                  onChange={handleChange}
                />
                Table Booking Available
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="pure_veg"
                  checked={form.pure_veg}
                  onChange={handleChange}
                />
                Pure Veg
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="serves_alcohol"
                  checked={form.serves_alcohol}
                  onChange={handleChange}
                />
                Serves Alcohol
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="rooftop"
                  checked={form.rooftop}
                  onChange={handleChange}
                />
                Rooftop Seating
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {loading ? "Submitting..." : "Submit for Verification"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
