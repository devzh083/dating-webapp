import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface ProfileDropdownProps {
  userName?: string;
  onLogout?: () => void;
}

export default function ProfileDropdown({ userName = "User", onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // 1. Trigger the app-level logout logic (clear tokens/state)
    onLogout?.();
    
    // 2. Close the dropdown
    setIsOpen(false);
    
    // 3. Redirect to Landing Page
    navigate("/");
  };

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 ml-2 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/30"
      >
        {initial}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 origin-top-right"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-bold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 font-medium">Account Settings</p>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1">
              {/* ✅ Link to Onboarding for Edit Profile */}
              <Link
                to="/onboarding"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-teal-600 transition-colors w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
              
              {/* ✅ Redirects to Landing Page on Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}