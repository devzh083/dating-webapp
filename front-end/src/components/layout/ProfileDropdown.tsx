import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProfileDropdownProps {
  userName: string;
  onLogout: () => void;   // <-- new
}

export const ProfileDropdown = ({ userName, onLogout }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();             // <-- let App.tsx handle tokens + navigation
  };

  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm transition-all",
          "hover:ring-2 hover:ring-primary/30 hover:ring-offset-2",
          isOpen && "ring-2 ring-primary/30 ring-offset-2"
        )}
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background rounded-xl shadow-lg border border-border py-1 z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">View your profile</p>
          </div>

          {/* Edit profile – we’ll wire this page later */}
          <Link
            to="/edit-profile"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            Edit Profile
          </Link>

          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
