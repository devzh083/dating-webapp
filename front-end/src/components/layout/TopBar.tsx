import { Home, MessageCircle, Bell, Coffee } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import ProfileDropdown from "./ProfileDropdown";

interface TopBarProps {
  userName?: string;
  onLogout?: () => void; // ✅ optional (IMPORTANT)
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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/home" className="text-xl font-bold">
          The Dating App
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            );
          })}

          <ProfileDropdown userName={userName} onLogout={onLogout} />
        </nav>
      </div>
    </header>
  );
}
