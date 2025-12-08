import "./ChatsPage.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

type ChatPreview = {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
};

type Message = {
  id: number;
  from: "me" | "them";
  text: string;
  time: string;
};

const chats: ChatPreview[] = [
  {
    id: 1,
    name: "Aaradhya",
    lastMessage: "So, coffee this weekend? ☕",
    time: "10:24 PM",
    unread: true,
  },
  {
    id: 2,
    name: "Rohit",
    lastMessage: "Haha that meme was too good 😂",
    time: "9:10 PM",
  },
  {
    id: 3,
    name: "Meghana",
    lastMessage: "Let me know once you reach Vizag.",
    time: "Yesterday",
  },
];

const chatMessages: Record<number, Message[]> = {
  1: [
    { id: 1, from: "them", text: "Hey, how was your day?", time: "10:15 PM" },
    { id: 2, from: "me", text: "Pretty good, just got back from work.", time: "10:17 PM" },
    { id: 3, from: "them", text: "Nicee. So, coffee this weekend? ☕", time: "10:22 PM" },
    { id: 4, from: "me", text: "Yeah, that’d be fun. Saturday evening?", time: "10:24 PM" },
  ],
  2: [
    { id: 1, from: "me", text: "Bro that reel 🤣", time: "9:02 PM" },
    { id: 2, from: "them", text: "I know right 😂", time: "9:04 PM" },
  ],
  3: [
    { id: 1, from: "them", text: "Text me when you reach Vizag.", time: "Yesterday" },
  ],
};

type ChatsPageProps = {
  isLoggedIn: boolean;
  onLogout: () => void;
};

const ChatsPage: React.FC<ChatsPageProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState<number>(chats[0].id);

  if (!isLoggedIn) {
    return (
      <div className="app-shell">
        <TopBar isLoggedIn={isLoggedIn} onLogout={onLogout} />
        <main className="home-main locked-main">
          <div className="locked-card">
            <h2>Login to see your chats</h2>
            <p>You need to be logged in to view and message your connections.</p>
            <button
              className="hero-primary"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  const activeChat = chats.find((c) => c.id === activeChatId);
  const messages = chatMessages[activeChatId] || [];

  return (
    <div className="app-shell">
      <TopBar isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="home-main chats-main">
        <section className="chats-layout">
          {/* Left: chat list */}
          <aside className="chat-list">
            <div className="chat-list-header">
              <h2>Chats</h2>
            </div>
            <div className="chat-list-items">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className={
                    "chat-list-item" +
                    (chat.id === activeChatId ? " active" : "") +
                    (chat.unread ? " unread" : "")
                  }
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className="chat-avatar">
                    {chat.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-text">
                    <div className="chat-name-row">
                      <span className="chat-name">{chat.name}</span>
                      <span className="chat-time">{chat.time}</span>
                    </div>
                    <span className="chat-last">{chat.lastMessage}</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Right: active conversation */}
          <section className="chat-window">
            {activeChat ? (
              <>
                <header className="chat-window-header">
                  <div className="chat-window-info">
                    <div className="chat-avatar large">
                      {activeChat.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{activeChat.name}</h3>
                      <span className="chat-status">Online • from Vizag</span>
                    </div>
                  </div>
                </header>

                <div className="chat-messages">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={
                        "chat-bubble-row " +
                        (msg.from === "me" ? "from-me" : "from-them")
                      }
                    >
                      <div className="chat-bubble">
                        <p>{msg.text}</p>
                        <span className="chat-bubble-time">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="chat-input-bar">
                  <input
                    className="chat-input"
                    placeholder="Type a message..."
                  />
                  <button className="chat-send-btn">Send</button>
                </footer>
              </>
            ) : (
              <div className="chat-window-empty">
                Select a chat to start messaging.
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
};

export default ChatsPage;
