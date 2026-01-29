import { useEffect, useState } from "react";
import { Home, MessageCircle, Bell, Heart, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const [hasUnread, setHasUnread] = useState(false);

  // ---------------- CHECK UNREAD STATUS ----------------
  useEffect(() => {
    const checkUnread = () => {
      const unreadFlag = localStorage.getItem("has_unread_messages");
      setHasUnread(unreadFlag === "true");
    };

    // Initial check
    checkUnread();

    // Poll every 2 seconds to keep it sync across pages (Home <-> Chats)
    // This ensures if a message arrives while on Home, the dot appears.
    const interval = setInterval(checkUnread, 2000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { 
      icon: MessageCircle, 
      label: "Chats", 
      path: "/chats", 
      hasBadge: hasUnread // Apply badge logic here
    },
    { icon: Bell, label: "Notifications", path: "/notifications" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 z-50 shadow-sm transition-all">
      
      {/* 1. LEFT: Logo & Brand */}
      <div className="flex items-center gap-3 w-[200px]">
        <Link
          to="/home"
          className="flex items-center gap-3 group"
        >
          <div
            className={`w-10 h-10 rounded-xl ${PRIMARY_GRADIENT} flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300`}
          >
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-extrabold text-[18px] tracking-tight text-slate-800 hidden sm:block group-hover:text-teal-600 transition-colors">
            The Dating App
          </span>
        </Link>
      </div>

      {/* 2. CENTER: Navigation Icons */}
      <nav className="flex items-center gap-1 sm:gap-2 bg-slate-50/80 px-2 py-1.5 rounded-full border border-white shadow-inner">
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
                  "p-3 rounded-full transition-all duration-300 flex items-center justify-center relative",
                  isActive
                    ? "bg-white text-[#0095E0] shadow-md scale-105"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive ? "fill-current" : "group-hover:scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* BLUE DOT BADGE */}
                {item.hasBadge && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full shadow-sm animate-pulse z-10" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 3. RIGHT: Actions & Profile */}
      <div className="flex items-center justify-end gap-3 w-[200px]">
        {/* "Get Plus" Button - Now links to Premium page */}
        <button
          onClick={() => navigate('/premium')}
          className={`hidden md:flex items-center gap-1.5 px-5 py-2 rounded-full ${PRIMARY_GRADIENT} text-white text-xs font-bold shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer`}
        >
          <Sparkles className="w-3.5 h-3.5 fill-white animate-pulse" />
          <span>Get Plus</span>
        </button>

        {/* Profile Dropdown */}
        <div className="pl-2 border-l border-slate-100 ml-2">
          <ProfileDropdown userName={userName} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}