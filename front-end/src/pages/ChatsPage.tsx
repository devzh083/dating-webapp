import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import {
  Search,
  MessageCircle,
  UserPlus,
  ArrowUpRight,
  MoreVertical,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- TYPES ---------------- */

interface ChatUser {
  chat_id?: string;
  match_id?: string;
  email: string;
  first_name: string | null;
  profile_photo: string | null;
}

interface ChatsApiResponse {
  chats: ChatUser[];
  requests: ChatUser[];
}

interface ChatsPageProps {
  onLogout?: () => void;
}

export default function ChatsPage({ onLogout }: ChatsPageProps) {
  const [activeTab, setActiveTab] = useState<
    "connections" | "requests" | "requested"
  >("connections");

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const [chats, setChats] = useState<ChatUser[]>([]);
  const [requests, setRequests] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(
          "http://127.0.0.1:8000/api/chats/matched/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch chats");

        const data: ChatsApiResponse = await res.json();
        setChats(data.chats || []);
        setRequests(data.requests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const activeChat = chats.find((c) => c.chat_id === selectedChat);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-6 px-4 lg:px-8">
      <TopBar onLogout={onLogout} />

      <main className="container mx-auto max-w-7xl h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

          {/* ---------------- LEFT PANEL ---------------- */}
          <div
            className={cn(
              "lg:col-span-4 flex flex-col gap-4 h-full",
              selectedChat ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex flex-col gap-4 px-1">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm"
                />
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-gray-100 p-1.5 grid grid-cols-3 gap-1">
                {[
                  { id: "connections", label: "Chats", icon: MessageCircle },
                  { id: "requests", label: "Requests", icon: UserPlus },
                  { id: "requested", label: "Sent", icon: ArrowUpRight },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold",
                      activeTab === tab.id
                        ? "bg-teal-50 text-teal-700"
                        : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ---------------- LIST CONTENT ---------------- */}
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-2">

                <AnimatePresence mode="wait">
                  {/* ---------------- CHATS ---------------- */}
                  {activeTab === "connections" && (
                    <motion.div
                      key="connections"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-1"
                    >
                      {loading && (
                        <div className="text-center text-sm text-gray-400 py-6">
                          Loading conversations…
                        </div>
                      )}

                      {!loading && chats.length === 0 && (
                        <div className="text-center text-sm text-gray-400 py-6">
                          No chats yet
                        </div>
                      )}

                      {chats.map((chat) => (
                        <button
                          key={chat.chat_id}
                          onClick={() => setSelectedChat(chat.chat_id!)}
                          className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-gray-50 text-left"
                        >
                          <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-lg font-bold">
                            {chat.first_name?.[0] ?? "?"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-sm text-gray-900">
                              {chat.first_name ?? "User"}
                            </span>
                            <p className="text-xs text-gray-500 truncate">
                              Start a conversation
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* ---------------- REQUESTS ---------------- */}
                  {activeTab === "requests" && (
                    <motion.div
                      key="requests"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      {!loading && requests.length === 0 && (
                        <div className="text-center text-sm text-gray-400 py-6">
                          No new requests
                        </div>
                      )}

                      {requests.map((req) => (
                        <div
                          key={req.match_id}
                          className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                              {req.first_name?.[0] ?? "?"}
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">
                              {req.first_name ?? "User"}
                            </h4>
                          </div>

                          <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-teal-500 text-white text-xs font-bold rounded-xl">
                              Accept
                            </button>
                            <button className="flex-1 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl">
                              Ignore
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* ---------------- SENT ---------------- */}
                  {activeTab === "requested" && (
                    <div className="text-center text-sm text-gray-400 py-6">
                      Nothing here yet
                    </div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>

          {/* ---------------- RIGHT PANEL ---------------- */}
          <div
            className={cn(
              "lg:col-span-8 flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden h-full",
              selectedChat
                ? "flex fixed inset-0 z-50 lg:static"
                : "hidden lg:flex"
            )}
          >
            {activeChat ? (
              <>
                <div className="h-20 border-b border-gray-50 flex items-center justify-between px-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="lg:hidden"
                    >
                      ←
                    </button>

                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      {activeChat.first_name?.[0] ?? "?"}
                    </div>

                    <h3 className="font-bold text-gray-900">
                      {activeChat.first_name ?? "User"}
                    </h3>
                  </div>

                  <MoreVertical />
                </div>

                <div className="flex-1 bg-[#F9FAFB] flex items-center justify-center text-gray-400">
                  No messages yet
                </div>

                <div className="p-4 bg-white border-t border-gray-50">
                  <div className="relative flex items-center gap-2">
                    <input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-6 pr-12 text-sm"
                    />
                    <button
                      className={cn(
                        "p-3 rounded-full",
                        messageInput.trim()
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 text-gray-300"
                      )}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageCircle className="w-10 h-10 text-teal-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a match to start chatting
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
