import { create } from 'zustand';
import { ChatMessage } from '../types';
import { mockChatMessages } from '../data/mockData';

interface ChatStore {
  threads: Record<string, ChatMessage[]>;
  sendMessage: (threadId: string, senderId: string, senderName: string, content: string) => void;
  markAsRead: (threadId: string, userId: string) => void;
  getMessages: (threadId: string) => ChatMessage[];
}

export const useChatStore = create<ChatStore>((set, get) => ({
  threads: mockChatMessages,

  sendMessage: (threadId, senderId, senderName, content) => {
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      threadId,
      senderId,
      senderName,
      content,
      type: 'text',
      sentAt: new Date().toISOString(),
      readBy: [senderId],
    };
    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: [...(state.threads[threadId] || []), newMsg],
      },
    }));
  },

  markAsRead: (threadId, userId) => {
    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: (state.threads[threadId] || []).map((m) =>
          m.readBy.includes(userId) ? m : { ...m, readBy: [...m.readBy, userId] }
        ),
      },
    }));
  },

  getMessages: (threadId) => get().threads[threadId] || [],
}));
