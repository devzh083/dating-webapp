import TopBar from "@/components/layout/TopBar";
import { Bell, Heart, MessageCircle, UserPlus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";

const notifications = [
  { id: 1, type: "like", user: "Jessica", text: "liked your profile", time: "2m ago", icon: Heart, color: "text-[#0095E0]", bg: "bg-[#0095E0]/10" },
  { id: 2, type: "match", user: "David", text: "It's a match! Start chatting now.", time: "1h ago", icon: Star, color: "text-[#00C98B]", bg: "bg-[#00C98B]/10" },
  { id: 3, type: "message", user: "Sarah", text: "sent you a message", time: "3h ago", icon: MessageCircle, color: "text-[#00B4D8]", bg: "bg-[#00B4D8]/10" },
  { id: 4, type: "visit", user: "Someone", text: "viewed your profile", time: "5h ago", icon: UserPlus, color: "text-purple-500", bg: "bg-purple-50" },
];

export default function NotificationsPage({ onLogout }: { onLogout?: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-10">
      <TopBar onLogout={onLogout} />

      <main className="container mx-auto max-w-3xl px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
          <button className="text-sm font-semibold text-[#0095E0] hover:underline">Mark all as read</button>
        </div>

        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
            >
              {/* Icon Box */}
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", notif.bg)}>
                <notif.icon className={cn("w-6 h-6", notif.color)} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-bold">{notif.user}</span> {notif.text}
                </p>
                <span className="text-xs text-gray-400 font-medium">{notif.time}</span>
              </div>

              {/* New Indicator Dot */}
              <div className={`w-2.5 h-2.5 rounded-full ${PRIMARY_GRADIENT} shadow-sm group-hover:scale-125 transition-transform`} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}