import { useNavigate } from "react-router-dom";
import { Store, CalendarCheck, Users, ShieldCheck } from "lucide-react";

export default function CafeRegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center">
              <Store className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Café Partner</span>
          </div>

          {/* Existing partner */}
          <button
            type="button"
            onClick={() => navigate("/cafe-partner/login")}
            className="text-sm font-semibold text-red-500 hover:underline"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Sign up as a Café Partner
          </h1>

          <p className="text-gray-600 text-lg mb-6">
            Create a partner account, register your café, get verified and start
            receiving table bookings.
          </p>

          {/* PRIMARY CTA – SIGN UP */}
          <button
            type="button"
            onClick={() => navigate("/cafe-partner/login")}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg"
          >
            Sign up & Register Café
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Already a partner?{" "}
            <button
              type="button"
              onClick={() => navigate("/cafe-partner/login")}
              className="text-red-500 font-medium hover:underline"
            >
              Login here
            </button>
          </p>
        </div>

        {/* Right – Benefits */}
        <div className="grid gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm flex gap-4">
            <CalendarCheck className="text-green-500 w-7 h-7" />
            <div>
              <h3 className="font-semibold text-lg">
                Accept Table Bookings
              </h3>
              <p className="text-sm text-gray-500">
                Receive and manage reservations from one dashboard.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm flex gap-4">
            <Users className="text-blue-500 w-7 h-7" />
            <div>
              <h3 className="font-semibold text-lg">
                Reach More Customers
              </h3>
              <p className="text-sm text-gray-500">
                Get discovered by people looking for great cafés.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm flex gap-4">
            <ShieldCheck className="text-purple-500 w-7 h-7" />
            <div>
              <h3 className="font-semibold text-lg">
                Verified & Trusted
              </h3>
              <p className="text-sm text-gray-500">
                Only verified cafés are shown to customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-white border-t py-12">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-2xl font-bold mb-3">
            Get started in just a few steps
          </h2>
          <p className="text-gray-500 mb-6">
            Sign up → Add café details → Get verified → Go live
          </p>

          <button
            type="button"
            onClick={() => navigate("/cafe-partner/login")}
            className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-xl font-semibold"
          >
            Create Café Partner Account
          </button>
        </div>
      </section>
    </div>
  );
}
