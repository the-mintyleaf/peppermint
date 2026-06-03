import { create } from 'zustand';
import { Message } from './dashboard.types';

interface DashboardStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  responseMode: 'FastResponse' | 'SlowResponse';
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResponseMode: (mode: 'FastResponse' | 'SlowResponse') => void;
  clearMessages: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  responseMode: 'FastResponse',
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setResponseMode: (mode) => set({ responseMode: mode }),
  clearMessages: () => set({ messages: [] }),
}));
