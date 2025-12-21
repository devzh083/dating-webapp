import { Home, MessageCircle, Bell, Coffee, Heart, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import ProfileDropdown from "./ProfileDropdown";

interface TopBarProps {
  userName?: string;
  onLogout?: () => void;
}

export default function TopBar({ userName = "User", onLogout }: TopBarProps) {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: MessageCircle, label: "Chats", path: "/chats" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Coffee, label: "Cafés", path: "/cafes" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-50">
      
      {/* 1. LEFT: Logo & Brand */}
      <div className="flex items-center gap-3 w-[200px]">
        <Link to="/home" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-[#02b2f6] flex items-center justify-center shadow-sm shadow-blue-200">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-gray-900 hidden sm:block">
            The Dating App
          </span>
        </Link>
      </div>

      {/* 2. CENTER: Navigation Icons (Now Centered) */}
      <nav className="flex items-center gap-1 sm:gap-6 bg-gray-50/50 px-2 py-1.5 rounded-full border border-gray-100/50">
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
                    ? "bg-white text-teal-600 shadow-sm" // Active: White bg with shadow
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100" // Inactive
                )}
              >
                <item.icon
                  className={cn("w-5 h-5", isActive && "fill-current")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              
              {/* Tooltip Label (Optional creative add-on) */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-gray-100 shadow-sm pointer-events-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 3. RIGHT: Actions & Profile */}
      <div className="flex items-center justify-end gap-3 w-[200px]">
        
        {/* Creative "Get Plus" Button */}
        <button className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all">
          <Sparkles className="w-3 h-3 fill-yellow-900" />
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