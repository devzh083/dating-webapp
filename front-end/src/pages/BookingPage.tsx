import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";

export default function BookingPage() {
  const { id } = useParams(); // cafe id
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_name: "",
    user_phone: "",
    date: "",
    time: "",
    guests: 2,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------------- SUBMIT BOOKING ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cafe: id,
          user_name: form.user_name,
          user_phone: form.user_phone,
          date: form.date,
          time: form.time,
          guests: form.guests,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to book table");
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <TopBar />

      <div className="mx-auto max-w-xl px-4">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-1">Book a Table</h1>
          <p className="text-sm text-gray-500 mb-6">
            Confirm your visit by filling the details
          </p>

          {error && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success ? (
            <div className="rounded bg-green-50 p-4 text-green-700 text-center font-semibold">
              Booking successful 🎉 <br />
              Waiting for confirmation
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="user_name"
                placeholder="Your Name"
                required
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              />

              <input
                name="user_phone"
                placeholder="Phone Number"
                required
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="date"
                  required
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                />

                <input
                  type="time"
                  name="time"
                  required
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                />
              </div>

              <select
                name="guests"
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} Guests
                  </option>
                ))}
              </select>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-teal-500 py-3 text-white font-semibold hover:bg-teal-600 transition"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
