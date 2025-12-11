export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
}

export interface ConversationUserDetails {
  id: string;
  name: string;
  email?: string;
}
