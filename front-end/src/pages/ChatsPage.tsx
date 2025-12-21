import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { Search, MessageCircle, UserPlus, ArrowUpRight, MoreVertical, Send, Phone, Video, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- MOCK DATA ---------------- */
const connectionRequests = [
  { id: "r1", name: "Jessica", time: "2h ago", avatar: "J", bg: "bg-rose-100 text-rose-600", bio: "Loves hiking and coffee." },
  { id: "r2", name: "Priya", time: "5h ago", avatar: "P", bg: "bg-purple-100 text-purple-600", bio: "Artist & Designer." },
];

const requestedConnections = [
  { id: "s1", name: "Ananya", status: "Pending", avatar: "A", bg: "bg-orange-100 text-orange-600", time: "1d ago" },
  { id: "s2", name: "David", status: "Pending", avatar: "D", bg: "bg-indigo-100 text-indigo-600", time: "3d ago" },
];

const activeConnections = [
  { id: "c1", name: "Sarah", lastMessage: "Hey! How are you doing?", time: "2m ago", unread: 2, avatar: "S", bg: "bg-teal-100 text-teal-600", online: true },
  { id: "c2", name: "Emma", lastMessage: "That sounds great! Let's meet up", time: "1h ago", unread: 0, avatar: "E", bg: "bg-blue-100 text-blue-600", online: false },
  { id: "c3", name: "Maya", lastMessage: "I love that movie too!", time: "3h ago", unread: 1, avatar: "M", bg: "bg-emerald-100 text-emerald-600", online: true },
];

const mockMessages = [
  { id: 1, sender: "them", text: "Hey! I saw you like hiking too. Have you been to Coorg?", time: "10:30 AM" },
  { id: 2, sender: "me", text: "Yes! I went there last winter. It was magical ✨", time: "10:32 AM" },
  { id: 3, sender: "them", text: "No way! I was planning a trip there next month. Any recommendations?", time: "10:33 AM" },
];

interface ChatsPageProps {
  onLogout?: () => void;
}

export default function ChatsPage({ onLogout }: ChatsPageProps) {
  const [activeTab, setActiveTab] = useState<"connections" | "requests" | "requested">("connections");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const activeChatData = activeConnections.find(c => c.id === selectedChat);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-6 px-4 lg:px-8">
      {/* ✅ Pass onLogout to TopBar */}
      <TopBar onLogout={onLogout} />

      <main className="container mx-auto max-w-7xl h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* ---------------- LEFT PANEL ---------------- */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full">
            
            <div className="flex flex-col gap-4">
               <h1 className="text-2xl font-bold text-gray-900 px-1">Messages</h1>
               
               {/* Search */}
               <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                />
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-gray-100 p-1.5 grid grid-cols-3 gap-1 shadow-sm">
                {[
                  { id: "connections", label: "Chats", icon: MessageCircle },
                  { id: "requests", label: "Requests", icon: UserPlus, count: connectionRequests.length },
                  { id: "requested", label: "Sent", icon: ArrowUpRight },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 relative",
                      activeTab === tab.id
                        ? "bg-teal-50 text-teal-700 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.count ? (
                      <span className="ml-1 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full">
                        {tab.count}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                
                <AnimatePresence mode="wait">
                  {/* 1. YOUR CONNECTIONS */}
                  {activeTab === "connections" && (
                    <motion.div 
                      key="connections"
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-2"
                    >
                      {activeConnections.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => setSelectedChat(chat.id)}
                          className={cn(
                            "w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 text-left group",
                            selectedChat === chat.id
                              ? "bg-teal-50 border border-teal-100 shadow-sm"
                              : "hover:bg-gray-50 border border-transparent"
                          )}
                        >
                          <div className="relative shrink-0">
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm", chat.bg)}>
                              {chat.avatar}
                            </div>
                            {chat.online && (
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className={cn("font-bold text-sm", selectedChat === chat.id ? "text-teal-900" : "text-gray-900")}>
                                {chat.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
                            </div>
                            <p className={cn("text-xs truncate leading-relaxed", chat.unread > 0 ? "text-gray-900 font-semibold" : "text-gray-500")}>
                              {chat.lastMessage}
                            </p>
                          </div>
                          
                          {chat.unread > 0 && (
                            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                              {chat.unread}
                            </div>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* 2. REQUESTS */}
                  {activeTab === "requests" && (
                    <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      {connectionRequests.map((req) => (
                        <div key={req.id} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", req.bg)}>
                              {req.avatar}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{req.name}</h4>
                              <p className="text-xs text-gray-500">{req.bio}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-teal-500 text-white text-xs font-bold rounded-xl hover:bg-teal-600 transition-colors">Accept</button>
                            <button className="flex-1 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors">Ignore</button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* 3. REQUESTED */}
                  {activeTab === "requested" && (
                     <motion.div key="requested" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      {requestedConnections.map((req) => (
                        <div key={req.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-50 bg-gray-50/50">
                           <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold opacity-70", req.bg)}>
                            {req.avatar}
                          </div>
                          <div className="flex-1">
                             <h4 className="font-semibold text-gray-700 text-sm">{req.name}</h4>
                             <p className="text-xs text-teal-600/80 font-medium flex items-center gap-1">
                               <ArrowUpRight className="w-3 h-3" /> Request Sent
                             </p>
                          </div>
                          <span className="text-[10px] text-gray-400">{req.time}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>

          {/* ---------------- RIGHT PANEL (Chat Interface) ---------------- */}
          <div className="hidden lg:col-span-8 lg:flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden h-full">
            {selectedChat && activeChatData ? (
              <>
                {/* Chat Header */}
                <div className="h-20 border-b border-gray-50 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm", activeChatData.bg)}>
                       {activeChatData.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{activeChatData.name}</h3>
                      <div className="flex items-center gap-2">
                        {activeChatData.online ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online
                          </span>
                        ) : (
                           <span className="text-xs text-gray-400">Offline</span>
                        )}
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-500">85% Match</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <button className="p-2.5 text-gray-400 hover:bg-gray-50 hover:text-teal-600 rounded-full transition-colors">
                        <Phone className="w-5 h-5" />
                     </button>
                     <button className="p-2.5 text-gray-400 hover:bg-gray-50 hover:text-teal-600 rounded-full transition-colors">
                        <Video className="w-5 h-5" />
                     </button>
                     <button className="p-2.5 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5" />
                     </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-[#FDFDFD] p-8 overflow-y-auto space-y-6">
                   <div className="flex justify-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">Today</span>
                   </div>

                   {mockMessages.map((msg) => (
                     <div key={msg.id} className={cn("flex gap-4 max-w-[75%]", msg.sender === "me" ? "ml-auto flex-row-reverse" : "")}>
                        
                        {msg.sender === "them" && (
                           <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto shadow-sm", activeChatData.bg)}>
                              {activeChatData.avatar}
                           </div>
                        )}

                        <div className={cn(
                           "p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group", 
                           msg.sender === "me" 
                              ? "bg-teal-500 text-white rounded-br-none" 
                              : "bg-white border border-gray-100 text-gray-700 rounded-bl-none"
                        )}>
                           {msg.text}
                           <span className={cn(
                              "text-[10px] absolute -bottom-5 min-w-[60px]",
                              msg.sender === "me" ? "right-0 text-right text-gray-300" : "left-0 text-gray-300"
                           )}>
                              {msg.time}
                           </span>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-50">
                  <div className="relative flex items-center gap-3">
                    <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                        <Smile className="w-6 h-6" />
                    </button>
                    <input 
                      type="text" 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..." 
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all placeholder:text-gray-400"
                    />
                    <button 
                      className={cn(
                        "p-3 rounded-full transition-all shadow-md",
                        messageInput.trim() ? "bg-teal-500 text-white hover:bg-teal-600 hover:scale-105" : "bg-gray-100 text-gray-300"
                      )}
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Empty State
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/30">
                 <div className="relative">
                    <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <MessageCircle className="w-10 h-10 text-teal-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-lg animate-bounce delay-100">👋</div>
                    <div className="absolute bottom-0 -left-4 w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-lg animate-bounce delay-700">💖</div>
                 </div>
                 
                 <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a conversation</h3>
                 <p className="text-gray-500 max-w-xs leading-relaxed">
                   Choose a connection from the left to start chatting or check your new requests.
                 </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}