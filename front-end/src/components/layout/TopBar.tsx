import { Home, MessageCircle, Bell, Coffee } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ProfileDropdown } from "./ProfileDropdown";

interface TopBarProps {
  userName?: string;
  onLogout: () => void;
}

export const TopBar = ({ userName = "User", onLogout }: TopBarProps) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },             // Home is "/"
    { icon: MessageCircle, label: "Chats", path: "/chats" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Coffee, label: "Cafés", path: "/cafes" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">
            The Dating App
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}

          {/* Profile dropdown – no separate /profile page */}
          <ProfileDropdown userName={userName} onLogout={onLogout} />
        </nav>
      </div>
    </header>
  );
};

export default TopBar;
