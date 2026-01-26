import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Shield,
  FileText,
  Sparkles,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService"; // Adjusted import path to standard alias if needed, or keep relative

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
        setProfilePhoto(result.data.photos[0]); 
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
    onLogout?.();
    setIsOpen(false);
    navigate("/");
  };

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 ml-2 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md hover:bg-teal-600 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30 overflow-hidden ring-2 ring-white"
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
            // ✅ FIX: Increased z-index to 100 to ensure it floats above chat headers and messages
            className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] origin-top-right"
          >
            {/* Header with Profile Photo */}
            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-lg shadow-sm overflow-hidden shrink-0 border-2 border-white">
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
                  <p className="text-base font-bold text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 font-medium">View your profile</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1">
              
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-teal-600 transition-colors w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500">
                    <User className="w-4 h-4" />
                </div>
                Profile Settings
              </Link>

              <Link
                to="/premium"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-colors w-full text-left group"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-1.5 bg-pink-100 rounded-lg text-pink-500 group-hover:text-pink-600">
                    <Sparkles className="w-4 h-4" />
                </div>
                <span className="flex-1">Get Premium</span>
                <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">NEW</span>
              </Link>

              <div className="my-1 border-t border-gray-50"></div>

              <Link
                to="/privacy"
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="w-4 h-4 text-gray-400" />
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <FileText className="w-4 h-4 text-gray-400" />
                Terms of Service
              </Link>

              <div className="my-1 border-t border-gray-50"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4 text-gray-400 hover:text-rose-500" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}