import { MapPin, Users } from "lucide-react";

export const NearbyBanner = () => {
  const nearbyCount = 24; // later this can come from an API

  return (
    <section className="mt-8">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {nearbyCount} people nearby
            </h3>
            <p className="text-sm text-muted-foreground">
              Based on your location preferences
            </p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            View all
          </button>
        </div>
      </div>
    </section>
  );
};
