import React from "react";

const ReviewsBanner: React.FC = () => {
  const reviews = [
    { name: "Priya S.", role: "Software Engineer", text: "Found my soulmate here! The matching algorithm really works." },
    { name: "Rahul M.", role: "Product Designer", text: "Love the cafe feature - makes planning dates so easy!" },
    { name: "Ananya K.", role: "Doctor", text: "Safe, secure, and genuine profiles. Highly recommend!" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h4 className="text-lg font-semibold mb-4">What Our Users Say</h4>

      <div className="space-y-3">
        {reviews.map((r, idx) => (
          <div key={idx} className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
            <img src={`https://i.pravatar.cc/48?img=${10 + idx}`} className="w-10 h-10 rounded-full" alt={r.name} />
            <div>
              <div className="text-sm font-semibold">{r.name} <span className="text-xs text-muted-foreground">· {r.role}</span></div>
              <div className="text-sm text-muted-foreground mt-1">{r.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">Join 10K+ happy users</div>
    </div>
  );
};

export default ReviewsBanner;
