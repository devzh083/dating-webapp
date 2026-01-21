import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import {
  Search,
  MessageCircle,
  MoreVertical,
  Send,
  Flag,
  UserX,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- TYPES ---------------- */

interface ChatUser {
  chat_id: number;
  match_id?: string;
  status?: string;
  created_at?: string;
  email: string;
  first_name: string | null;
  profile_photo: string | null;
}

interface Message {
  id: number | string;
  sender: string;
  receiver: string;
  content: string;
  created_at?: string;
  is_read?: boolean;
  read_at?: string | null;
}

interface ChatsPageProps {
  onLogout?: () => void;
}

// ---------------- TIME FORMATTER ----------------
const formatTime = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ---------------- DATE HELPERS ----------------

const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ChatsPage({ onLogout }: ChatsPageProps) {
  const [activeTab, setActiveTab] = useState<
    "connections" | "requests" | "requested"
  >("connections");

  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [chats, setChats] = useState<ChatUser[]>([]);
  const [requests, setRequests] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef<WebSocket | null>(null);
  const currentUserEmail =
    localStorage.getItem("user_email")?.toLowerCase() ?? "";

  const activeChat = chats.find((c) => c.chat_id === selectedChat);

  /* ---------------- FETCH CHATS ---------------- */
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch("http://127.0.0.1:8000/api/chats/matched/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch chats");

        const data = await res.json();
        const chatsArray = Array.isArray(data) ? data : data.chats || [];
        setChats(chatsArray);
        setRequests(data.requests || []);

        if (chatsArray.length > 0 && chatsArray[0].user_email) {
          localStorage.setItem("user_email", chatsArray[0].user_email);
        }
      } catch (err) {
        console.error("FETCH CHATS ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  /* ---------------- LOAD MESSAGE HISTORY ---------------- */
  useEffect(() => {
    if (!selectedChat) return;

    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(
          `http://127.0.0.1:8000/api/chats/${selectedChat}/messages/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load messages");
        const data: Record<string, Message[]> = await res.json();

        const flatMessages: Message[] = Object.entries(data).flatMap(
          ([date, msgs]: [string, any[]]) =>
            msgs.map((m) => ({
              ...m,
              created_at: m.created_at || `${date}T00:00:00Z`,
            }))
        );

        setMessages(flatMessages);
      } catch (err) {
        console.error("LOAD MESSAGES ERROR:", err);
      }
    };

    loadMessages();
    setIsMenuOpen(false);
  }, [selectedChat]);

  /* ---------------- WEBSOCKET & READ STATUS ---------------- */
  useEffect(() => {
    if (selectedChat) {
      // Mark read
      const markRead = async () => {
        try {
          const token = localStorage.getItem("access_token");
          if (token) {
            await fetch(`http://127.0.0.1:8000/api/chats/${selectedChat}/read/`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        } catch (e) { console.error(e); }
      };
      markRead();
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${selectedChat}/?token=${token}`
    );
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const incomingMessage: Message = {
        id: data.id ?? crypto.randomUUID(),
        sender: data.sender,
        receiver: data.receiver,
        content: data.content,
        created_at: data.created_at ?? new Date().toISOString(),
      };
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === incomingMessage.id);
        return exists ? prev : [...prev, incomingMessage];
      });
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [selectedChat]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    if (!messageInput.trim() || !activeChat) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const content = messageInput;
    setMessageInput("");

    try {
      await fetch(
        `http://127.0.0.1:8000/api/chats/${activeChat.chat_id}/send/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );
    } catch (err) {
      console.error("SEND ERROR:", err);
    }
  };

  /* ---------------- GROUP MESSAGES ---------------- */
  const groupedMessages = messages.reduce((acc, msg) => {
    if (!msg.created_at) return acc;
    const dateKey = msg.created_at.split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* TopBar is typically fixed. 
         We leave it here, but the main content below needs padding-top 
         to not slide under it. 
      */}
      <TopBar onLogout={onLogout} />

      {/* KEY CHANGE: added 'pt-24' (padding-top: 6rem / 96px). 
         This pushes the chat containers down so they don't hide behind the TopBar.
      */}
      <main className="flex-1 container mx-auto max-w-7xl pt-24 pb-6 px-4 lg:px-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* LEFT PANEL (Connections) */}
          <div
            className={cn(
              "lg:col-span-4 flex flex-col h-full bg-white rounded-[32px] shadow-lg border border-gray-100 overflow-hidden",
              selectedChat ? "hidden lg:flex" : "flex"
            )}
          >
            {/* Header */}
            <div className="flex flex-col gap-4 px-6 pt-6 pb-2 flex-none bg-white z-10">
              <h1 className="text-2xl font-bold text-slate-800">Messages</h1>

              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/30 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none text-sm"
                />
              </div>

              {/* Tabs (Lowercase/Capitalized properly) */}
              <div className="flex items-center gap-1 border-b border-gray-100 pb-1">
                {["connections", "requests", "requested"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium capitalize transition-all duration-200 rounded-lg",
                      activeTab === t 
                        ? "text-teal-600 bg-teal-50" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
              {activeTab === "connections" && chats.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
                  <p>No connections yet.</p>
                </div>
              )}
              
              {activeTab === "connections" &&
                chats.map((chat) => (
                  <button
                    key={chat.chat_id}
                    onClick={() => setSelectedChat(Number(chat.chat_id))}
                    className={cn(
                      "w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 group relative overflow-hidden text-left",
                      selectedChat === chat.chat_id 
                        ? "bg-teal-50/60 ring-1 ring-teal-100" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    {selectedChat === chat.chat_id && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-teal-500 rounded-r-full" />
                    )}

                    <div className={cn(
                      "w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all",
                      selectedChat === chat.chat_id ? "border-teal-400 shadow-sm" : "border-transparent"
                    )}>
                      {chat.profile_photo ? (
                        <img src={chat.profile_photo} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-lg">
                          {(chat.first_name || chat.email)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-start overflow-hidden flex-1 pl-1">
                      <span className="font-bold text-slate-800 truncate text-[15px] w-full">
                        {chat.first_name || chat.email}
                      </span>
                      <span className={cn(
                        "text-xs truncate w-full text-left font-medium mt-0.5",
                        selectedChat === chat.chat_id ? "text-teal-600" : "text-gray-400"
                      )}>
                        {selectedChat === chat.chat_id ? "Messaging..." : "Tap to chat"}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* RIGHT PANEL (Chat Window) */}
          <div
            className={cn(
              "lg:col-span-8 flex flex-col bg-white rounded-[32px] h-full shadow-lg border border-gray-100 overflow-hidden relative transition-all duration-300",
              selectedChat ? "fixed inset-0 z-50 lg:static lg:flex" : "hidden lg:flex"
            )}
          >
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="h-20 px-6 border-b border-gray-50 flex items-center bg-white/95 backdrop-blur-sm z-20 sticky top-0 justify-between">
                  <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedChat(null)}
                        className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                      {activeChat.profile_photo ? (
                        <img src={activeChat.profile_photo} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold">
                          {(activeChat.first_name || activeChat.email)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">
                        {activeChat.first_name || activeChat.email}
                        </h3>
                        <span className="text-[11px] text-teal-600 font-bold tracking-wide uppercase">Active Now</span>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className={cn(
                          "p-2 rounded-full transition-all duration-200",
                          isMenuOpen ? "bg-teal-50 text-teal-600" : "hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-200">
                          <button className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-3 transition-colors">
                            <UserX className="w-4 h-4" /> Unmatch
                          </button>
                          <div className="h-px bg-gray-100 my-1 mx-4" />
                          <button className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors">
                            <Flag className="w-4 h-4" /> Block & Report
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-white scrollbar-thin scrollbar-thumb-gray-200">
                  {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date} className="space-y-6">
                      <div className="flex justify-center sticky top-0 z-10">
                        <span className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 rounded-full shadow-sm border border-gray-100">
                          {formatDateLabel(date)}
                        </span>
                      </div>
                      {msgs.map((m) => {
                        const isMe = m.sender === currentUserEmail;
                        return (
                          <div
                            key={m.id}
                            className={cn(
                              "max-w-[80%] lg:max-w-[70%] flex flex-col gap-1",
                              isMe ? "ml-auto items-end" : "items-start"
                            )}
                          >
                            <div
                              className={cn(
                                "px-5 py-3.5 rounded-[20px] text-[15px] leading-relaxed shadow-sm break-words relative",
                                isMe
                                  ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-sm"
                                  : "bg-[#F0F2F4] text-slate-800 rounded-bl-sm"
                              )}
                            >
                              {m.content}
                            </div>
                            <span className="text-[10px] font-bold text-gray-300 px-1 uppercase tracking-wide">
                              {formatTime(m.created_at)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-4 lg:p-6 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-1.5 border border-gray-200 focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500 transition-all shadow-inner">
                    <input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1 bg-transparent px-5 py-3 focus:outline-none text-sm text-slate-800 placeholder:text-gray-400 font-medium"
                      placeholder="Type a message..."
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className={cn(
                        "p-3 rounded-full transition-all duration-200 m-1 flex-shrink-0",
                        messageInput.trim()
                          ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg transform hover:scale-105 active:scale-95"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <Send className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white">
                <div className="w-32 h-32 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
                  <MessageCircle className="w-14 h-14 text-teal-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  No chat selected
                </h3>
                <p className="text-gray-400 max-w-xs text-sm leading-relaxed font-medium">
                  Choose a connection from the left to start chatting or find new matches in the home tab.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}