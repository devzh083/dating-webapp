import { Home, MessageCircle, Bell, Coffee } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-50 shadow-sm">
      
      {/* 1. Left Spacer (Hidden on mobile, maintains center balance on desktop) */}
      <div className="w-40 hidden lg:block" />

      {/* 2. Center Title */}
      <Link 
        to="/home" 
        className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-gray-900 hover:opacity-80 transition-opacity"
      >
        The Dating App
      </Link>

      {/* 3. Right Navigation */}
      <nav className="flex items-center gap-1 lg:gap-2 ml-auto lg:ml-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={cn(
                "p-2.5 rounded-full transition-all duration-200 flex items-center justify-center",
                isActive
                  ? "bg-teal-50 text-teal-600" // Active State (Teal background + text)
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-900" // Inactive State
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}

        {/* 4. Profile Dropdown */}
        <div className="ml-2 pl-2 border-l border-gray-100">
          <ProfileDropdown userName={userName} onLogout={onLogout} />
        </div>
      </nav>
    </header>
  );
}