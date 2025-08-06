export interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  recipient: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    profilePhoto?: string;
    role: string;
  }>;
  lastMessage: {
    content: string;
    createdAt: string;
    sender: string;
  };
  unreadCount: number;
}
