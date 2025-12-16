import { useEffect, useRef, useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProfileDropdownProps {
  userName: string;
  onLogout?: () => void;
}

export default function ProfileDropdown({ userName, onLogout }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    if (onLogout) onLogout();
    navigate("/", { replace: true });
  };

  return (
    <div ref={ref} className="relative ml-2">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "h-10 w-10 rounded-full bg-primary text-white font-semibold",
          "hover:ring-2 hover:ring-primary/40"
        )}
      >
        {userName.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-background shadow-lg">
          <div className="px-4 py-3 border-b">
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">Account</p>
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2 hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Edit Profile
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2 text-destructive hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
