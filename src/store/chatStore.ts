import { create } from 'zustand';
import { ChatMessage } from '../types';

function getApiBase() {
  if (typeof window !== 'undefined') return '';
  return process.env.EXPO_PUBLIC_API_URL || '';
}

interface ChatStore {
  threads: Record<string, ChatMessage[]>;
  loadingThreads: Record<string, boolean>;

  loadThread: (threadId: string) => Promise<void>;
  sendMessage: (threadId: string, senderId: string, senderName: string, content: string) => Promise<void>;
  markAsRead: (threadId: string, userId: string) => void;
  getMessages: (threadId: string) => ChatMessage[];
}

export const useChatStore = create<ChatStore>((set, get) => ({
  threads: {},
  loadingThreads: {},

  loadThread: async (threadId: string) => {
    if (get().loadingThreads[threadId]) return;
    set((state) => ({ loadingThreads: { ...state.loadingThreads, [threadId]: true } }));
    try {
      const res = await fetch(`${getApiBase()}/api/chat/${threadId}`);
      if (!res.ok) return;
      const messages: ChatMessage[] = await res.json();
      set((state) => ({
        threads: { ...state.threads, [threadId]: messages },
        loadingThreads: { ...state.loadingThreads, [threadId]: false },
      }));
    } catch {
      set((state) => ({ loadingThreads: { ...state.loadingThreads, [threadId]: false } }));
    }
  },

  sendMessage: async (threadId: string, senderId: string, senderName: string, content: string) => {
    // Optimistic update
    const tempId = 'tmp_' + Date.now();
    const tempMsg: ChatMessage = {
      id: tempId,
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
        [threadId]: [...(state.threads[threadId] || []), tempMsg],
      },
    }));

    try {
      const res = await fetch(`${getApiBase()}/api/chat/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, senderName, content }),
      });
      if (!res.ok) throw new Error('Send failed');
      const saved: ChatMessage = await res.json();
      // Replace temp with real
      set((state) => ({
        threads: {
          ...state.threads,
          [threadId]: (state.threads[threadId] || []).map((m) => (m.id === tempId ? saved : m)),
        },
      }));
    } catch {
      // Remove optimistic on error
      set((state) => ({
        threads: {
          ...state.threads,
          [threadId]: (state.threads[threadId] || []).filter((m) => m.id !== tempId),
        },
      }));
    }
  },

  markAsRead: (threadId: string, userId: string) => {
    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: (state.threads[threadId] || []).map((m) =>
          m.readBy.includes(userId) ? m : { ...m, readBy: [...m.readBy, userId] }
        ),
      },
    }));
  },

  getMessages: (threadId: string) => get().threads[threadId] || [],
}));
