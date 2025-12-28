// src/components/ProfileDropdown.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { profileService } from "../../services/profileService";


interface ProfileDropdownProps {
  userName?: string;
  onLogout?: () => void;
}

export default function ProfileDropdown({ userName = "User", onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch user's profile photo
  useEffect(() => {
    fetchProfilePhoto();
  }, []);

  const fetchProfilePhoto = async () => {
    try {
      const result = await profileService.getProfile();
      if (result.exists && result.data?.photos && result.data.photos.length > 0) {
        setProfilePhoto(result.data.photos[0]); // Use first photo as profile picture
      }
    } catch (error) {
      console.error("Error fetching profile photo:", error);
    }
  };

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
        className="w-9 h-9 ml-2 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md hover:bg-teal-600 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30 overflow-hidden"
      >
        {profilePhoto ? (
          <img 
            src={profilePhoto} 
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initial}</span>
        )}
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
            {/* Header with Profile Photo */}
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                {/* Profile Photo in Dropdown Header */}
                <div className="w-10 h-10 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden shrink-0">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 font-medium">Account Settings</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1">
              {/* Link to Profile Page */}
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-teal-600 transition-colors w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              
              {/* Logout Button */}
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