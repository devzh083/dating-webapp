import React from "react";

const PremiumBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl p-6 shadow-xl max-w-xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase opacity-90">Premium</div>
          <h3 className="text-xl font-bold mt-2">Get your best matches, guaranteed</h3>
          <p className="text-sm mt-2 opacity-90">See who likes you • Unlimited views • Priority matching</p>
        </div>

        <div className="flex items-center">
          <button className="ml-4 bg-white text-orange-600 px-4 py-2 rounded-full font-semibold shadow-sm">
            Upgrade Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumBanner;
