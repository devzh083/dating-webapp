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
  chat_id?: string;
  match_id?: string;
  status?: string;
  created_at?: string;
  email: string;
  first_name: string | null;
  profile_photo: string | null;
}

interface Message {
  sender: string;
  receiver: string;
  content: string;
  created_at?: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef<WebSocket | null>(null);
  const currentUserEmail = localStorage.getItem("user_email");

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
        setChats(Array.isArray(data) ? data : data.chats || []);
        setRequests(data.requests || []);
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

        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("LOAD MESSAGES ERROR:", err);
      }
    };

    loadMessages();
  }, [selectedChat]);

  /* ---------------- MARK CHAT READ ---------------- */

  const markChatAsRead = async (chatId: string) => {
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
      const data: Message = JSON.parse(event.data);

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.sender === data.sender &&
            m.content === data.content &&
            Math.abs(
              new Date(m.created_at || "").getTime() -
                new Date(data.created_at || "").getTime()
            ) < 1000
        );
        return exists ? prev : [...prev, data];
      });

      markChatAsRead(selectedChat);
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [selectedChat]);

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = () => {
    console.log("SEND BUTTON CLICKED");
    console.log("messageInput:", messageInput);
    console.log("socketRef:", socketRef.current);
    console.log(
      "socketState:",
      socketRef.current?.readyState,
      "(0=CONNECTING,1=OPEN,2=CLOSING,3=CLOSED)"
    );
    console.log("currentUserEmail:", currentUserEmail);
    console.log("activeChat:", activeChat);

    if (!messageInput.trim()) return;
    if (!socketRef.current) return;
    if (socketRef.current.readyState !== WebSocket.OPEN) return;
    if (!currentUserEmail) return;
    if (!activeChat) return;

    const tempMessage: Message = {
      sender: currentUserEmail,
      receiver: activeChat.email,
      content: messageInput,
      created_at: new Date().toISOString(),
    };

    console.log("SENDING MESSAGE:", tempMessage);

    // Optimistic UI
    setMessages((prev) => [...prev, tempMessage]);

    socketRef.current.send(
      JSON.stringify({ content: messageInput })
    );

    setMessageInput("");
  };

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
                    onClick={() => setSelectedChat(chat.chat_id!)}
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
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        "max-w-xs p-3 rounded-xl",
                        m.sender === currentUserEmail
                          ? "bg-teal-500 text-white ml-auto"
                          : "bg-gray-100"
                      )}
                    >
                      {m.content}
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
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
