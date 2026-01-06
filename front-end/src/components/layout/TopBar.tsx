import { Home, MessageCircle, Bell, Coffee, Heart, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import ProfileDropdown from "./ProfileDropdown";

interface TopBarProps {
  userName?: string;
  onLogout?: () => void;
}

// Matching Landing Page Gradient
const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";

export default function TopBar({ userName = "User", onLogout }: TopBarProps) {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: MessageCircle, label: "Chats", path: "/chats" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    // { icon: Coffee, label: "Cafés", path: "/cafes" }, // HIDDEN AS REQUESTED
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-50">
      {/* 1. LEFT: Logo & Brand */}
      <div className="flex items-center gap-3 w-[200px]">
        <Link
          to="/home"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div
            className={`w-9 h-9 rounded-xl ${PRIMARY_GRADIENT} flex items-center justify-center shadow-md`}
          >
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-gray-900 hidden sm:block">
            The Dating App
          </span>
        </Link>
      </div>

      {/* 2. CENTER: Navigation Icons */}
      <nav className="flex items-center gap-1 sm:gap-6 bg-gray-50/80 px-2 py-1.5 rounded-full border border-gray-100">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className="relative group"
            >
              <div
                className={cn(
                  "p-2.5 rounded-full transition-all duration-300 flex items-center justify-center",
                  isActive
                    ? "bg-white text-[#0095E0] shadow-sm"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon
                  className={cn("w-5 h-5", isActive && "fill-current")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 3. RIGHT: Actions & Profile */}
      <div className="flex items-center justify-end gap-3 w-[200px]">
        {/* "Get Plus" Button */}
        <button
          className={`hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full ${PRIMARY_GRADIENT} text-white text-xs font-bold shadow-md hover:shadow-lg hover:brightness-110 transition-all`}
        >
          <Sparkles className="w-3 h-3 fill-white" />
          <span>Get Plus</span>
        </button>

        {/* Profile Dropdown */}
        <div className="pl-1">
          <ProfileDropdown userName={userName} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}