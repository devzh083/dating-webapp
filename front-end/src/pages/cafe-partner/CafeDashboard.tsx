import { useEffect, useState } from "react";
import { CalendarCheck, Store, AlertCircle } from "lucide-react";

export default function CafeDashboard() {
  const [cafe, setCafe] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/partner/cafe/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => res.json())
      .then(setCafe);
  }, []);

  if (!cafe) {
    return <p className="p-10 text-gray-500">Loading dashboard…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Café Dashboard</h1>

      {/* STATUS */}
      <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          {cafe.status === "approved" ? (
            <CalendarCheck className="text-green-500" />
          ) : (
            <AlertCircle className="text-yellow-500" />
          )}
          <div>
            <p className="font-semibold capitalize">{cafe.status}</p>
            <p className="text-sm text-gray-500">
              {cafe.status === "approved"
                ? "Your café is live"
                : "Verification pending"}
            </p>
          </div>
        </div>
      </div>

      {/* CAFE INFO */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Store />
          <h2 className="font-semibold text-lg">{cafe.name}</h2>
        </div>

        <p className="text-sm text-gray-600">{cafe.address}</p>
        <p className="text-sm text-gray-600">{cafe.area}</p>

        <div className="mt-4 flex gap-4">
          <span className="text-sm font-medium">
            ₹{cafe.price_for_two} for two
          </span>
          <span className="text-sm">{cafe.cuisine}</span>
        </div>
      </div>
    </div>
  );
}
