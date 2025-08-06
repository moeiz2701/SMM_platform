"use client"
import { useState, useMemo, useEffect } from "react"
import { useSocket } from "@/app/hooks/useSocket"
import styles from "@/styling/message.module.css"
import API_ROUTES from "@/app/apiRoutes"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Message {
  _id: string
  content: string
  sender: {
    _id: string
    name: string
    profilePhoto?: string
  }
  recipient: {
    _id: string
    name: string
    profilePhoto?: string
  }
  conversationId: string
  createdAt: string
  read: boolean
}

interface Conversation {
  _id: string // This is the conversationId
  lastMessage: {
    content: string
    createdAt: string
    sender: string
    recipient: string
  }
  participants: Array<{
    _id: string
    name: string
    profilePhoto?: string
  }>
  unreadCount: number
}

interface User {
  _id: string
  name: string
  profilePhoto?: string
  email: string
  type?: string
  role?: string
  status?: string
}

interface Manager {
  _id: string
  name: string
  profilePhoto?: string
  email: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeUserId, setActiveUserId] = useState<string>("") // userId of the other participant
  const [activeConversationId, setActiveConversationId] = useState<string>("") // conversationId for messaging
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [manager, setManager] = useState<Manager | null>(null)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const router = useRouter()

  // Get the auth token from localStorage or your auth system
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null

  const { connected, sendMessage, onNewMessage, markAsRead, emitTyping, emitStopTyping, onTyping, onStopTyping } =
    useSocket(token || "")

  // Fetch manager
  useEffect(() => {
    const fetchManager = async () => {
      try {
        const res = await fetch(API_ROUTES.CLIENTS.ME_MANAGER, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setManager(data.data)
        }
      } catch (err) {
        console.error("Failed to fetch manager:", err)
      }
    }
    fetchManager()
  }, [])

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(API_ROUTES.MESSAGES, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch conversations")
        const data = await res.json()
        setConversations(data.data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  // Fetch messages for active user conversation
  useEffect(() => {
    if (!activeConversationId) return
    const fetchMessages = async () => {
      try {
        const res = await fetch(API_ROUTES.GET_CONVERSATION(activeUserId), {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch messages")
        const data = await res.json()
        setMessages(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    }
    fetchMessages()
  }, [activeConversationId])

  // Fetch all users (clients and managers)
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!showUserSearch) return

      setIsSearching(true)
      try {
        const res = await fetch(API_ROUTES.AUTH.GET_ALL_USERS, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          // Combine clients and managers into a single array
          const allUsers = [
            ...data.clients.map((client) => ({
              _id: client.id,
              name: client.email.split("@")[0], // Use email prefix as name if no name field
              email: client.email,
              profilePhoto: client.profilePhoto,
              type: client.type,
              role: client.role,
              status: client.status,
            })),
            ...data.managers.map((manager) => ({
              _id: manager.id,
              name: manager.email.split("@")[0], // Use email prefix as name if no name field
              email: manager.email,
              profilePhoto: manager.profilePhoto,
              type: manager.type,
              role: manager.role,
              status: manager.status,
            })),
          ]
          // Filter out current user
          const filteredUsers = allUsers.filter((user) => user._id !== currentUserId)
          setSearchResults(filteredUsers)
        }
      } catch (err) {
        console.error("Failed to fetch users:", err)
      } finally {
        setIsSearching(false)
      }
    }

    fetchAllUsers()
  }, [showUserSearch, currentUserId])

  // Filter search results based on search term
  const filteredSearchResults = useMemo(() => {
    if (!userSearchTerm.trim()) return searchResults

    return searchResults.filter(
      (user) =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()),
    )
  }, [searchResults, userSearchTerm])

  // Handle real-time events
  useEffect(() => {
    if (!connected) return

    onNewMessage((message: Message) => {
      // Add message to current conversation if it matches
      if (message.sender._id === activeUserId || message.recipient._id === activeUserId) {
        setMessages((prev) => [...prev, message])
      }

      // Refresh conversations to update last message
      fetchConversationsRefresh()
    })

    onTyping((userId: string) => {
      if (userId === activeUserId) {
        setIsTyping(true)
      }
    })

    onStopTyping((userId: string) => {
      if (userId === activeUserId) {
        setIsTyping(false)
      }
    })
  }, [connected, onNewMessage, onTyping, onStopTyping, activeUserId])

  const fetchConversationsRefresh = async () => {
    try {
      const res = await fetch(API_ROUTES.MESSAGES, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.data)
      }
    } catch (err) {
      console.error("Failed to refresh conversations:", err)
    }
  }

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations
    return conversations.filter(
      (conversation) =>
        conversation.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        conversation.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm, conversations])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || sendingMessage) return

    setSendingMessage(true)
    try {
      const res = await fetch(API_ROUTES.MESSAGES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          recipientId: activeUserId,
          content: newMessage.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.data])
        setNewMessage("")
        fetchConversationsRefresh()
      } else {
        const errorText = await res.text()
        console.error("Failed to send message:", errorText)
        throw new Error("Failed to send message")
      }
    } catch (err) {
      setError("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleTyping = () => {
    if (activeUserId && connected) {
      emitTyping(activeUserId)
    }
  }

  const startConversationWithManager = async () => {
    if (!manager) return

    try {
      const res = await fetch(API_ROUTES.START_CONVERSATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ recipientId: manager._id }),
      })

      if (res.ok) {
        const data = await res.json()
        setActiveUserId(manager._id)
        setActiveConversationId(data.data._id)
        fetchConversationsRefresh()
      }
    } catch (err) {
      setError("Failed to start conversation with manager")
    }
  }

  const startConversationWithUser = async (userId: string) => {
    try {
      const res = await fetch(API_ROUTES.START_CONVERSATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ recipientId: userId }),
      })

      if (res.ok) {
        const data = await res.json()
        setActiveUserId(userId)
        setActiveConversationId(data.data._id)
        setShowUserSearch(false)
        setUserSearchTerm("")
        setSearchResults([])
        fetchConversationsRefresh()
      }
    } catch (err) {
      setError("Failed to start conversation")
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p._id !== currentUserId)
  }

  const handleConversationClick = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation)
    if (otherParticipant) {
      setActiveUserId(otherParticipant._id)
      setActiveConversationId(conversation._id)
      if (conversation.unreadCount > 0) {
        markConversationAsRead(conversation._id)
      }
    }
  }

  const markConversationAsRead = async (conversationId: string) => {
    try {
      await fetch(API_ROUTES.READ(conversationId), {
        method: "PUT",
        credentials: "include",
      })
      // Refresh conversations to update unread count
      fetchConversationsRefresh()
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  if (loading) return <div className={styles.loading}>Loading...</div>
  if (error) return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Messages</h1>
          <div className={styles.headerActions}>
            {manager && (
              <button className={styles.managerButton} onClick={startConversationWithManager}>
                <span className={styles.managerIcon}>👨‍💼</span>
                Chat with Manager
              </button>
            )}
            <button className={styles.newChatButton} onClick={() => setShowUserSearch(!showUserSearch)}>
              <span className={styles.plusIcon}>+</span>
              New Chat
            </button>
          </div>
        </div>

        <div className={styles.messagesContainer}>
          {/* Left Column - Conversations List */}
          <div className={styles.messagesList}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {showUserSearch && (
              <div className={styles.userSearchContainer}>
                <div className={styles.userSearchHeader}>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className={styles.userSearchInput}
                  />
                  <button
                    className={styles.closeSearchButton}
                    onClick={() => {
                      setShowUserSearch(false)
                      setUserSearchTerm("")
                      setSearchResults([])
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.searchResults}>
                  {isSearching && <div className={styles.searchingText}>Loading users...</div>}
                  {!isSearching && filteredSearchResults.length === 0 && userSearchTerm && (
                    <div className={styles.searchingText}>No users found</div>
                  )}
                  {filteredSearchResults.map((user) => (
                    <div
                      key={user._id}
                      className={styles.searchResultItem}
                      onClick={() => startConversationWithUser(user._id)}
                    >
                      <div className={styles.searchResultAvatar}>
                        {user.profilePhoto ? (
                          <Image
                            src={user.profilePhoto || "/placeholder.svg"}
                            alt={user.name}
                            width={32}
                            height={32}
                            className={styles.avatar}
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={styles.searchResultInfo}>
                        <div className={styles.searchResultName}>
                          {user.name}
                          <span className={styles.userTypeBadge}>{user.type === "manager" ? "Manager" : "Client"}</span>
                        </div>
                        <div className={styles.searchResultEmail}>{user.email}</div>
                        {user.status && <div className={styles.searchResultStatus}>Status: {user.status}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.conversationsList}>
              {filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation)
                if (!otherParticipant) return null

                return (
                  <div
                    key={conversation._id}
                    className={`${styles.conversationItem} ${
                      activeUserId === otherParticipant._id ? styles.active : ""
                    }`}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className={styles.conversationAvatar}>
                      {otherParticipant.profilePhoto ? (
                        <Image
                          src={otherParticipant.profilePhoto || "/placeholder.svg"}
                          alt={otherParticipant.name}
                          width={40}
                          height={40}
                          className={styles.avatar}
                        />
                      ) : (
                        otherParticipant.name.charAt(0)
                      )}
                    </div>
                    <div className={styles.conversationInfo}>
                      <div className={styles.conversationHeader}>
                        <span className={styles.conversationName}>
                          {otherParticipant.name}
                          {manager && otherParticipant._id === manager._id && (
                            <span className={styles.managerBadge}>Manager</span>
                          )}
                          {conversation.unreadCount > 0 && (
                            <span className={styles.unreadBadge}>{conversation.unreadCount}</span>
                          )}
                        </span>
                        <span className={styles.conversationTime}>
                          {new Date(conversation.lastMessage.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={styles.conversationPreview}>{conversation.lastMessage.content}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column - Messages */}
          <div className={styles.chatView}>
            {activeConversationId ? (
              <>
                <div className={styles.messagesArea}>
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`${styles.message} ${
                        message.sender._id === currentUserId ? styles.sent : styles.received
                      }`}
                    >
                      <div className={styles.messageContent}>{message.content}</div>
                      <div className={styles.messageTime}>{new Date(message.createdAt).toLocaleTimeString()}</div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className={styles.typingIndicator}>
                      <div className={styles.typingDots}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className={styles.typingText}>Typing...</span>
                    </div>
                  )}
                </div>
                <div className={styles.messageInput}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    onKeyDown={handleTyping}
                    placeholder="Type a message..."
                    className={styles.input}
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className={styles.sendButton}
                  >
                    {sendingMessage ? (
                      <span className={styles.sendingIcon}>⏳</span>
                    ) : (
                      <span className={styles.sendIcon}>→</span>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.noChat}>
                <div className={styles.noChatIcon}>💬</div>
                <h3>Select a conversation to start messaging</h3>
                <p>Choose from your existing conversations or start a new one</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
