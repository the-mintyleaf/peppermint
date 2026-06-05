import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Chat, Message, ResponseMode } from './home.types';

const CHAT_TITLE_MAX = 48;

function generateSessionId(): string {
  if (typeof window === 'undefined') return '';
  // Generate a fresh session ID on every page load
  const sessionId = uuidv4();
  return sessionId;
}

function titleFromMessage(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return 'New chat';
  return trimmed.length > CHAT_TITLE_MAX
    ? `${trimmed.slice(0, CHAT_TITLE_MAX)}…`
    : trimmed;
}

interface HomeStore {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
  responseMode: ResponseMode;
  sessionId: string;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResponseMode: (mode: ResponseMode) => void;
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  clearAllChats: () => void;
}

export const useHomeStore = create<HomeStore>((set) => ({
  chats: [],
  activeChatId: null,
  isLoading: false,
  error: null,
  responseMode: 'FastResponse',
  sessionId: generateSessionId(),
  addMessage: (message) =>
    set((state) => {
      const now = new Date();
      let { chats, activeChatId } = state;

      if (!activeChatId) {
        const newChat: Chat = {
          id: uuidv4(),
          title: 'New chat',
          messages: [],
          updatedAt: now,
        };
        chats = [newChat, ...chats];
        activeChatId = newChat.id;
      }

      const updatedChats = chats.map((chat) => {
        if (chat.id !== activeChatId) return chat;

        const messages = [...chat.messages, message];
        const title =
          chat.messages.length === 0 && message.role === 'user'
            ? titleFromMessage(message.content)
            : chat.title;

        return { ...chat, messages, title, updatedAt: now };
      });

      return { chats: updatedChats, activeChatId };
    }),
  updateMessage: (messageId, content) =>
    set((state) => {
      const now = new Date();
      const { chats, activeChatId } = state;

      if (!activeChatId) return state;

      const updatedChats = chats.map((chat) => {
        if (chat.id !== activeChatId) return chat;

        const messages = chat.messages.map((msg) =>
          msg.id === messageId ? { ...msg, content } : msg
        );

        return { ...chat, messages, updatedAt: now };
      });

      return { chats: updatedChats };
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setResponseMode: (mode) => set({ responseMode: mode }),
  createNewChat: () => set({ activeChatId: null }),
  selectChat: (chatId) => set({ activeChatId: chatId }),
  clearAllChats: () => set({ chats: [], activeChatId: null }),
}));

export function useHomeMessages(): Message[] {
  return useHomeStore((state) => {
    const chat = state.chats.find((c) => c.id === state.activeChatId);
    return chat?.messages ?? [];
  });
}

export function useHomeChats(): Chat[] {
  return useHomeStore((state) => state.chats);
}

export function useActiveChatTitle(): string {
  return useHomeStore((state) => {
    if (!state.activeChatId) return 'New chat';
    const chat = state.chats.find((c) => c.id === state.activeChatId);
    return chat?.title ?? 'New chat';
  });
}

export function useActiveChatId(): string | null {
  return useHomeStore((state) => state.activeChatId);
}

export function useSessionId(): string {
  return useHomeStore((state) => state.sessionId);
}
