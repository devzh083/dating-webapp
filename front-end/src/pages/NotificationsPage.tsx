import React, { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { Heart, MessageCircle, Star, Users, CheckCheck, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type NotificationsPageProps = {
  isLoggedIn?: boolean; // Made optional to simplify preview
  onLogout?: () => void;
};

/* ---------------- MOCK DATA ---------------- */
const initialNotifications = [
  {
    id: 1,
    type: "like",
    title: "Sarah liked your profile",
    time: "2 minutes ago",
    read: false,
    icon: Heart,
    color: "bg-rose-100 text-rose-500",
  },
  {
    id: 2,
    type: "match",
    title: "You matched with Emma!",
    time: "1 hour ago",
    read: false,
    icon: Users,
    color: "bg-teal-100 text-teal-600",
  },
  {
    id: 3,
    type: "message",
    title: "Maya sent you a message",
    time: "3 hours ago",
    read: true,
    icon: MessageCircle,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 4,
    type: "superlike",
    title: "Someone super liked you!",
    time: "Yesterday",
    read: true,
    icon: Star,
    color: "bg-amber-100 text-amber-500",
  },
];

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onLogout }) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-10 px-4">
      <TopBar onLogout={onLogout} />

      <main className="container mx-auto max-w-3xl">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">Stay updated with your connections</p>
          </div>
          
          <button 
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-full transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200",
                    notification.read 
                      ? "bg-white border-gray-100" 
                      : "bg-white border-teal-100 shadow-sm shadow-teal-50"
                  )}
                >
                  {/* Icon Box */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                    notification.color
                  )}>
                    <notification.icon className="w-5 h-5 fill-current" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={cn(
                      "text-base font-semibold",
                      notification.read ? "text-gray-700" : "text-gray-900"
                    )}>
                      {notification.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {notification.time}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse mr-2" />
                  )}

                  {/* Hover Action (Delete) */}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <span className="sr-only">Delete</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </motion.div>
              ))
            ) : (
              // Empty State
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No notifications yet</h3>
                <p className="text-gray-500 text-sm">We'll let you know when something happens!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;