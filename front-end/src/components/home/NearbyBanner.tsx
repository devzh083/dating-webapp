import React from "react";

const NearbyBanner: React.FC = () => {
  // sample avatars
  const avatars = [
    "https://i.pravatar.cc/40?img=12",
    "https://i.pravatar.cc/40?img=15",
    "https://i.pravatar.cc/40?img=20",
    "https://i.pravatar.cc/40?img=22",
  ];

  return (
    <div className="bg-card p-4 rounded-2xl border border-border max-w-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">📍</div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">People Nearby</h4>
            <p className="text-xs text-muted-foreground">Find matches close to you</p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">16 nearby</div>
      </div>

      <div className="mt-3 flex items-center -space-x-3">
        {avatars.map((a, i) => (
          <img
            key={i}
            src={a}
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            alt={`avatar-${i}`}
          />
        ))}
        <div className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-sm font-medium text-foreground">
          +12
        </div>
      </div>
    </div>
  );
};

export default NearbyBanner;
