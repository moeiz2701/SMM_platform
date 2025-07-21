export interface Message {
  id: string
  text: string
  timestamp: string
  isFromUser: boolean
}

export interface Conversation {
  id: string
  name: string
  role: string
  avatar?: string
  lastMessage: string
  timestamp: string
  isOnline: boolean
  unreadCount: number
  messages: Message[]
}
