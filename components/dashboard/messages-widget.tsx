
"use client"

import "@/styling/ManagerDashboard.css"
import { MessageSquare, User, CheckCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { API_ROUTES } from "@/app/apiRoutes"
import { getCurrentUser, makeAuthenticatedRequest } from "@/lib/auth-utils"

interface Message {
  _id: string
  lastMessage: {
    _id: string
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
    content: string
    createdAt: string
    read: boolean
  }
  unreadCount: number
  participants: Array<{
    _id: string
    name: string
    profilePhoto?: string
  }>
}

export default function MessagesWidget() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUserData()
  }, [])

  useEffect(() => {
    if (currentUserId) {
      fetchMessages()
    }
  }, [currentUserId])

  const getCurrentUserData = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUserId(user._id)
      }
    } catch (err) {
      console.error('Error getting current user:', err)
    }
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await makeAuthenticatedRequest(API_ROUTES.MESSAGES.GET_ALL)

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Filter to show only conversations with unread messages and limit to 5 most recent
        const unreadConversations = result.data
          .filter((conversation: Message) => conversation.unreadCount > 0)
          .slice(0, 5)
        
        setMessages(unreadConversations)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const getOtherParticipant = (message: Message) => {
    if (!currentUserId) return message.lastMessage.sender
    
    // Find the participant who is not the current user
    const otherParticipant = message.participants.find(p => p._id !== currentUserId)
    return otherParticipant || message.lastMessage.sender
  }

  const getTotalUnreadCount = () => {
    return messages.reduce((total, conversation) => total + conversation.unreadCount, 0)
  }

  if (loading) {
    return (
      <div className="messages-widget">
        <div className="messages-header">
          <div className="header-title">
            <MessageSquare size={20} />
            <h3>Recent Messages</h3>
          </div>
        </div>
        <div className="messages-list">
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
            Loading messages...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="messages-widget">
        <div className="messages-header">
          <div className="header-title">
            <MessageSquare size={20} />
            <h3>Recent Messages</h3>
          </div>
        </div>
        <div className="messages-list">
          <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
            Error: {error}
          </div>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="messages-widget">
        <div className="messages-header">
          <div className="header-title">
            <MessageSquare size={20} />
            <h3>Recent Messages</h3>
          </div>
          <div className="unread-count">0 unread</div>
        </div>
        <div className="messages-list">
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
            No unread messages
          </div>
        </div>
        <div className="messages-footer">
          <button className="view-all-messages">View All Messages</button>
        </div>
      </div>
    )
  }

  return (
    <div className="messages-widget">
      <div className="messages-header">
        <div className="header-title">
          <MessageSquare size={20} />
          <h3>Recent Messages</h3>
        </div>
        <div className="unread-count">{getTotalUnreadCount()} unread</div>
      </div>

      <div className="messages-list">
        {messages.map((conversation) => {
          const otherParticipant = getOtherParticipant(conversation)
          return (
            <div key={conversation._id} className="message-item unread">
              <div className="message-header">
                <div className="sender-info">
                  <div className="avatar">
                    {otherParticipant.profilePhoto ? (
                      <img 
                        src={otherParticipant.profilePhoto} 
                        alt={otherParticipant.name}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div className="sender-details">
                    <span className="sender-name">{otherParticipant.name}</span>
                    <div className="message-meta">
                      <div className="platform-dot" style={{ backgroundColor: '#10b981' }}></div>
                      <span className="time-ago">{formatTimeAgo(conversation.lastMessage.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="message-indicators">
                  <div
                    className="priority-indicator"
                    style={{ backgroundColor: conversation.unreadCount > 3 ? '#ef4444' : conversation.unreadCount > 1 ? '#f59e0b' : '#10b981' }}
                    title={`${conversation.unreadCount} unread message${conversation.unreadCount > 1 ? 's' : ''}`}
                  >
                    {conversation.unreadCount}
                  </div>
                </div>
              </div>

              <div className="message-content">
                <p>{conversation.lastMessage.content}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="messages-footer">
        <button className="view-all-messages" onClick={() => window.location.href = '/manager/messages'}>
          View All Messages
        </button>
      </div>

      {/* styles moved to ManagerDashboard.css */}
    </div>
  )
}
