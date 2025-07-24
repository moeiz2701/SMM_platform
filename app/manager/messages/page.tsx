"use client"

import type React from "react"
import { useState, useMemo } from "react"
import type { Message } from "../../../components/messages"
import styles from "@/styling/messages.module.css"

const sampleConversations: {
  id: string
  name: string
  role: string
  avatar?: string
  lastMessage: string
  timestamp: string
  isOnline: boolean
  unreadCount: number
  messages: Message[]
}[] = [
  {
    id: "1",
    name: "Robert Johnson",
    role: "Client",
    lastMessage: "Thanks for the quick turnaround on the project!",
    timestamp: "10:32 AM",
    isOnline: true,
    unreadCount: 0,
    messages: [
      {
        id: "1",
        text: "Hi there! How's the project coming along?",
        timestamp: "10:15 AM",
        isFromUser: false,
      },
      {
        id: "2",
        text: "Great! We're making excellent progress. Should have the first draft ready by tomorrow.",
        timestamp: "10:18 AM",
        isFromUser: true,
      },
      {
        id: "3",
        text: "That sounds perfect. Looking forward to seeing it!",
        timestamp: "10:20 AM",
        isFromUser: false,
      },
      {
        id: "4",
        text: "I'll send it over first thing in the morning. Thanks for your patience!",
        timestamp: "10:25 AM",
        isFromUser: true,
      },
      {
        id: "5",
        text: "Thanks for the quick turnaround on the project!",
        timestamp: "10:32 AM",
        isFromUser: false,
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Williams",
    role: "Manager",
    lastMessage: "Can we schedule a meeting for tomorrow?",
    timestamp: "9:45 AM",
    isOnline: true,
    unreadCount: 2,
    messages: [
      {
        id: "1",
        text: "Good morning! Hope you're having a great day.",
        timestamp: "9:30 AM",
        isFromUser: false,
      },
      {
        id: "2",
        text: "Morning Sarah! Yes, it's going well. How can I help you?",
        timestamp: "9:32 AM",
        isFromUser: true,
      },
      {
        id: "3",
        text: "Can we schedule a meeting for tomorrow?",
        timestamp: "9:45 AM",
        isFromUser: false,
      },
    ],
  },
  {
    id: "3",
    name: "Michael Chen",
    role: "Client",
    lastMessage: "The design looks amazing!",
    timestamp: "Yesterday",
    isOnline: false,
    unreadCount: 0,
    messages: [
      {
        id: "1",
        text: "I've reviewed the latest designs you sent over.",
        timestamp: "2:15 PM",
        isFromUser: false,
      },
      {
        id: "2",
        text: "Great! What are your thoughts?",
        timestamp: "2:18 PM",
        isFromUser: true,
      },
      {
        id: "3",
        text: "The design looks amazing!",
        timestamp: "2:25 PM",
        isFromUser: false,
      },
    ],
  },
  {
    id: "4",
    name: "Emily Davis",
    role: "Client",
    lastMessage: "When can we start the next phase?",
    timestamp: "Yesterday",
    isOnline: false,
    unreadCount: 1,
    messages: [
      {
        id: "1",
        text: "Hi! I wanted to follow up on our last conversation.",
        timestamp: "4:30 PM",
        isFromUser: false,
      },
      {
        id: "2",
        text: "Of course! What would you like to discuss?",
        timestamp: "4:35 PM",
        isFromUser: true,
      },
      {
        id: "3",
        text: "When can we start the next phase?",
        timestamp: "4:40 PM",
        isFromUser: false,
      },
    ],
  },
  {
    id: "5",
    name: "David Martinez",
    role: "Manager",
    lastMessage: "Team meeting at 3 PM today",
    timestamp: "2 days ago",
    isOnline: true,
    unreadCount: 0,
    messages: [
      {
        id: "1",
        text: "Don't forget about the team meeting today.",
        timestamp: "2:45 PM",
        isFromUser: false,
      },
      {
        id: "2",
        text: "Thanks for the reminder! I'll be there.",
        timestamp: "2:50 PM",
        isFromUser: true,
      },
      {
        id: "3",
        text: "Team meeting at 3 PM today",
        timestamp: "2:55 PM",
        isFromUser: false,
      },
    ],
  },
]

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeConversationId, setActiveConversationId] = useState("1")
  const [newMessage, setNewMessage] = useState("")

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return sampleConversations
    return sampleConversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  const activeConversation = sampleConversations.find((conv) => conv.id === activeConversationId)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Messages</h1>
        </div>

        <div className={styles.messagesContainer}>
          {/* Left Column - Messages List */}
          <div className={styles.messagesList}>
  <div className={styles.messagesHeader}>
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
    </div>
  </div>

              <div className={styles.conversationsList}>
    {filteredConversations.map((conversation) => (
      <div
        key={conversation.id}
        className={`${styles.conversationItem} ${
          activeConversationId === conversation.id ? styles.activeConversation : ""
        }`}
        onClick={() => setActiveConversationId(conversation.id)}
      >
        <div className={styles.conversationAvatar}>{getInitials(conversation.name)}</div>
        <div className={styles.conversationContent}>
          <div className={styles.conversationHeader}>
            <div className={styles.conversationInfo}>
              <div className={styles.conversationName}>{conversation.name}</div>
              <div className={styles.conversationRole}>{conversation.role}</div>
            </div>
            <div className={styles.conversationMeta}>
              <div className={styles.conversationTime}>{conversation.timestamp}</div>
              {conversation.unreadCount > 0 && (
                <div className={styles.unreadBadge}>{conversation.unreadCount}</div>
              )}
            </div>
          </div>
          <div className={styles.lastMessage}>{conversation.lastMessage}</div>
        </div>
      </div>
    ))}
  </div>
           <div className={styles.newMessageSection}>
    <button className={styles.newMessageButton}>
      <span className={styles.plusIcon}>+</span>
      New Message
    </button>
  </div>
</div>

          {/* Right Column - Chat View */}
          <div className={styles.chatView}>
            {activeConversation ? (
              <>
                <div className={styles.chatHeader}>
                  <div className={styles.chatUserInfo}>
                    <div className={styles.chatAvatar}>{getInitials(activeConversation.name)}</div>
                    <div className={styles.chatUserDetails}>
                      <div className={styles.chatUserName}>{activeConversation.name}</div>
                      <div className={styles.chatUserStatus}>
                        <span className={`${styles.statusDot} ${activeConversation.isOnline ? styles.online : ""}`} />
                        {activeConversation.isOnline ? "Online" : "Offline"}
                      </div>
                    </div>
                  </div>
                  <div className={styles.chatActions}>
                    <button className={styles.chatActionButton}>📞</button>
                    <button className={styles.chatActionButton}>📹</button>
                    <button className={styles.chatActionButton}>⋮</button>
                  </div>
                </div>

                <div className={styles.chatMessages}>
                  {activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`${styles.messageWrapper} ${
                        message.isFromUser ? styles.sentMessage : styles.receivedMessage
                      }`}
                    >
                      <div className={styles.messageBubble}>
                        <div className={styles.messageText}>{message.text}</div>
                        <div className={styles.messageTime}>{message.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.messageInput}>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={styles.textInput}
                    />
                    <button className={styles.magicButton}>🪄</button>
                    <button className={styles.sendButton} onClick={handleSendMessage}>
                      ➤
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.noChatSelected}>
                <div className={styles.noChatContent}>
                  <h3>Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
