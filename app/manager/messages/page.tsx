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

interface Client {
  _id: string
  name: string
  profilePhoto?: string
  email: string
  status?: string
  user?: {
    _id: string
    email: string
    role: string
  }
}

export default function ManagerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeUserId, setActiveUserId] = useState<string>("") // userId of the other participant
  const [activeConversationId, setActiveConversationId] = useState<string>("") // conversationId for messaging
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showClientSearch, setShowClientSearch] = useState(false)
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [managerId, setManagerId] = useState<string | null>(null)

  
  const router = useRouter()

  // Get current user ID from /auth/me route
  const [currentUserId, setCurrentUserId] = useState<string>("")

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const response = await fetch(API_ROUTES.AUTH.ME, {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setCurrentUserId(data.data._id)
        }
      } catch (error) {
        console.error("Failed to fetch current user ID:", error)
      }
    }
    fetchCurrentUserId()
  }, [])

  const { connected, sendMessage, onNewMessage, markAsRead, emitTyping, emitStopTyping, onTyping, onStopTyping } =
    useSocket("") // Socket authentication handled by cookies

  useEffect(() => {
  const fetchManagerId = async () => {
    try {
      const res = await fetch(API_ROUTES.MANAGERS.ME, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to get manager info")
      const data = await res.json()
      const managerIdFromServer = data.data._id
      setManagerId(managerIdFromServer)
    } catch (err) {
      console.error("Failed to fetch manager ID:", err)
    }
  }

  fetchManagerId()
}, [])


  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(API_ROUTES.MESSAGES.GET_ALL, {
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
        const res = await fetch(API_ROUTES.MESSAGES.GET_CONVERSATION(activeUserId), {
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

  // Fetch manager's clients
  useEffect(() => {
    const fetchClients = async () => {
      if (!showClientSearch || !managerId) return

      setIsSearching(true)
      try {
        const res = await fetch(API_ROUTES.MANAGERS.GET_CLIENTS(managerId), {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          // Format clients data
          const formattedClients = data.data.map((client: any) => ({
            _id: client._id,
            name: client.user?.email?.split("@")[0] || client.name || "Unknown",
            email: client.user?.email || client.email,
            profilePhoto: client.profilePhoto,
            status: client.status,
            userId: client.user?._id, // Store the user ID for messaging
          }))
          setClients(formattedClients)
        }
      } catch (err) {
        console.error("Failed to fetch clients:", err)
      } finally {
        setIsSearching(false)
      }
    }

    fetchClients()
  }, [showClientSearch, managerId])

  // Filter search results based on search term
  const filteredClients = useMemo(() => {
    if (!clientSearchTerm.trim()) return clients

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()),
    )
  }, [clients, clientSearchTerm])

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
      const res = await fetch(API_ROUTES.MESSAGES.GET_ALL, {
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
    if (!searchTerm) {
      // Filter out conversations where the other participant is the current user
      return conversations.filter((conversation) => {
        const otherParticipant = conversation.participants.find((p) => p._id !== managerId && p._id !== currentUserId)
        return otherParticipant && otherParticipant._id !== currentUserId
      })
    }
    // Also apply search filter
    return conversations.filter((conversation) => {
      const otherParticipant = conversation.participants.find((p) => p._id !== managerId && p._id !== currentUserId)
      return (
        otherParticipant &&
        (otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conversation.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })
  }, [searchTerm, conversations, currentUserId, managerId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || sendingMessage) return

    setSendingMessage(true)
    try {
      const res = await fetch(API_ROUTES.MESSAGES.GET_ALL, {
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

  const startConversationWithClient = async (client: Client) => {
    try {
      const res = await fetch(API_ROUTES.MESSAGES.START_CONVERSATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ recipientId: client.user?._id || client._id }),
      })

      if (res.ok) {
        const data = await res.json()
        setActiveUserId(client.user?._id || client._id)
        setActiveConversationId(data.data._id)
        setShowClientSearch(false)
        setClientSearchTerm("")
        setClients([])
        fetchConversationsRefresh()
      }
    } catch (err) {
      setError("Failed to start conversation with client")
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
  return conversation.participants.find((p) => p._id !== managerId)
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
      await fetch(API_ROUTES.MESSAGES.MARK_AS_READ(conversationId), {
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
            <button className={styles.newChatButton} onClick={() => setShowClientSearch(!showClientSearch)}>
              <span className={styles.plusIcon}>+</span>
              New Chat with Client
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

            {showClientSearch && (
              <div className={styles.userSearchContainer}>
                <div className={styles.userSearchHeader}>
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className={styles.userSearchInput}
                  />
                  <button
                    className={styles.closeSearchButton}
                    onClick={() => {
                      setShowClientSearch(false)
                      setClientSearchTerm("")
                      setClients([])
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.searchResults}>
                  {isSearching && <div className={styles.searchingText}>Loading clients...</div>}
                  {!isSearching && filteredClients.length === 0 && clientSearchTerm && (
                    <div className={styles.searchingText}>No clients found</div>
                  )}
                  {!isSearching && filteredClients.length === 0 && !clientSearchTerm && (
                    <div className={styles.searchingText}>No clients available</div>
                  )}
                  {filteredClients.map((client) => (
                    <div
                      key={client._id}
                      className={styles.searchResultItem}
                      onClick={() => startConversationWithClient(client)}
                    >
                      <div className={styles.searchResultAvatar}>
                        {client.profilePhoto ? (
                          <Image
                            src={client.profilePhoto || "/placeholder.svg"}
                            alt={client.name}
                            width={32}
                            height={32}
                            className={styles.avatar}
                          />
                        ) : (
                          client.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={styles.searchResultInfo}>
                        <div className={styles.searchResultName}>
                          {client.name}
                          <span className={styles.userTypeBadge}>Client</span>
                        </div>
                        <div className={styles.searchResultEmail}>{client.email}</div>
                        {client.status && <div className={styles.searchResultStatus}>Status: {client.status}</div>}
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
                <p>Choose from your existing conversations or start a new one with your clients</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
