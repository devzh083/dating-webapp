import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import {
  Search,
  MessageCircle,
  MoreVertical,
  Send,
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

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (date: Date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

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

  const [chats, setChats] = useState<ChatUser[]>([]);
  const [requests, setRequests] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef<WebSocket | null>(null);const 
  currentUserEmail = localStorage.getItem("user_email")?.toLowerCase() ?? "";

  const activeChat = chats.find((c) => c.chat_id === selectedChat);
  

  /* ---------------- FETCH CHATS ---------------- */

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

        const data = await res.json();

        const chatsArray = Array.isArray(data) ? data : data.chats || [];
        setChats(chatsArray);
        setRequests(data.requests || []);

        // ✅ Store user_email in localStorage
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
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
  }, [selectedChat]);

  /* ---------------- MARK CHAT READ ---------------- */

  const markChatAsRead = async (chatId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      await fetch(
        `http://127.0.0.1:8000/api/chats/${chatId}/read/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("MARK READ ERROR:", err);
    }
  };

  useEffect(() => {
    if (selectedChat) markChatAsRead(selectedChat);
  }, [selectedChat]);

  /* ---------------- WEBSOCKET ---------------- */

  useEffect(() => {
    if (!selectedChat) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${selectedChat}/?token=${token}`
    );

    socketRef.current = ws;

    ws.onopen = () => console.log("WS OPENED:", selectedChat);
    ws.onclose = (e) => console.log("WS CLOSED:", e.code, e.reason);
    ws.onerror = (e) => console.error("WS ERROR:", e);

    ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    const incomingMessage: Message = {
      id: data.id ?? crypto.randomUUID(), // backend id OR fallback
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
      created_at: data.created_at ?? new Date().toISOString(),
    };

    setMessages((prev) => {
      const exists = prev.some((m) => m.id === incomingMessage.id);
      return exists ? prev : [...prev, incomingMessage];
    });

    markChatAsRead(selectedChat);
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
  if (!token || !currentUserEmail) return;

  const content = messageInput;
  setMessageInput(""); // clear input only

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

// ---------------- GROUP MESSAGES BY DATE ----------------

const groupedMessages = messages.reduce((acc, msg) => {
  if (!msg.created_at) return acc;

  const dateKey = msg.created_at.split("T")[0];
  if (!acc[dateKey]) acc[dateKey] = [];
  acc[dateKey].push(msg);

  return acc;
}, {} as Record<string, Message[]>);


  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-6 px-4 lg:px-8">
      <TopBar onLogout={onLogout} />

      <main className="container mx-auto max-w-7xl h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

          {/* LEFT PANEL */}
          <div
            className={cn(
              "lg:col-span-4 flex flex-col gap-4 h-full",
              selectedChat ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex flex-col gap-4 px-1">
              <h1 className="text-2xl font-bold">Messages</h1>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" />
                <input
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border"
                />
              </div>

              <div className="bg-white rounded-xl p-1.5 grid grid-cols-3 gap-1">
                {["connections", "requests", "requested"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-semibold",
                      activeTab === t && "bg-teal-50 text-teal-700"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl overflow-y-auto p-3">
              {activeTab === "connections" &&
                chats.map((chat) => (
                  <button
                    key={chat.chat_id}
                    onClick={() => setSelectedChat(Number(chat.chat_id))}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold">
                      {(chat.first_name || chat.email)[0].toUpperCase()}
                    </div>
                    <span className="font-bold">
                      {chat.first_name || chat.email}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div
            className={cn(
              "lg:col-span-8 flex flex-col bg-white rounded-[32px] h-full",
              selectedChat ? "flex" : "hidden lg:flex"
            )}
          >
            {activeChat ? (
              <>
                <div className="h-20 border-b flex items-center px-6">
                  <h3 className="font-bold">
                    {activeChat.first_name || activeChat.email}
                  </h3>
                  <MoreVertical className="ml-auto" />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date} className="space-y-3">
                      {/* DATE SEPARATOR */}
                      <div className="flex justify-center my-4">
                        <span className="px-4 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
                          {formatDateLabel(date)}
                        </span>
                      </div>

                      {/* MESSAGES */}
                      {msgs.map((m) => {
                        const isMe = m.sender === currentUserEmail;

                        return (
                          <div
                            key={m.id}
                            className={cn(
                              "max-w-xs flex flex-col gap-1",
                              isMe ? "ml-auto items-end" : "items-start"
                            )}
                          >
                            <div
                              className={cn(
                                "p-3 rounded-xl",
                                isMe
                                  ? "bg-teal-500 text-white"
                                  : "bg-gray-100 text-gray-900"
                              )}
                            >
                              {m.content}
                            </div>

                            <span
                              className={cn(
                                "text-[11px]",
                                isMe ? "text-gray-400" : "text-gray-500"
                              )}
                            >
                              {formatTime(m.created_at)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1 rounded-full border px-4 py-3"
                      placeholder="Type a message..."
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      className="p-3 bg-teal-500 text-white rounded-full"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-teal-500" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
