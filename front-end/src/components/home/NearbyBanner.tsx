import React from "react";
import { MapPin } from "lucide-react";

const NearbyBanner: React.FC = () => {
  const avatars = [
    "https://i.pravatar.cc/100?img=12",
    "https://i.pravatar.cc/100?img=15",
    "https://i.pravatar.cc/100?img=20",
    "https://i.pravatar.cc/100?img=22",
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">People Nearby</h4>
            <p className="text-xs text-gray-500">Find matches close to you</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
            16 nearby
        </span>
      </div>

      <div className="flex items-center -space-x-3 pl-1">
        {avatars.map((a, i) => (
          <img
            key={i}
            src={a}
            className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
            alt={`avatar-${i}`}
          />
        ))}
        <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
          +12
        </div>
      </div>
    </div>
  );
};

export default NearbyBanner;