// src/components/home/SecurityBanner.tsx
import React from "react";

const SecurityBanner = () => {
  return (
    <section className="mt-8">
      <div className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-2">Your safety matters</h3>
        <p className="text-sm text-muted-foreground">
          We verify profiles and provide safety tips — keep your conversations respectful and report anything suspicious.
        </p>
      </div>
    </section>
  );
};

export default SecurityBanner;
