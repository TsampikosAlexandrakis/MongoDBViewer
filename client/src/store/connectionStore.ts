import { create } from 'zustand';
import { api } from '../api/client';

interface ConnectionState {
  connected: boolean;
  uri: string;
  loading: boolean;
  error: string | null;
  savedConnections: string[];
  connect: (uri: string) => Promise<void>;
  disconnect: () => Promise<void>;
  checkStatus: () => Promise<void>;
  addSavedConnection: (uri: string) => void;
  removeSavedConnection: (uri: string) => void;
}

const loadSaved = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('mongo_saved_connections') || '[]');
  } catch {
    return [];
  }
};

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connected: false,
  uri: '',
  loading: false,
  error: null,
  savedConnections: loadSaved(),

  connect: async (uri: string) => {
    set({ loading: true, error: null });
    try {
      await api.connect(uri);
      set({ connected: true, uri, loading: false });
      get().addSavedConnection(uri);
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  disconnect: async () => {
    try {
      await api.disconnect();
    } finally {
      set({ connected: false, uri: '' });
    }
  },

  checkStatus: async () => {
    try {
      const status = await api.status();
      set({ connected: status.connected, uri: status.uri || '' });
    } catch {
      set({ connected: false, uri: '' });
    }
  },

  addSavedConnection: (uri: string) => {
    const saved = get().savedConnections.filter((s) => s !== uri);
    saved.unshift(uri);
    const trimmed = saved.slice(0, 10);
    localStorage.setItem('mongo_saved_connections', JSON.stringify(trimmed));
    set({ savedConnections: trimmed });
  },

  removeSavedConnection: (uri: string) => {
    const saved = get().savedConnections.filter((s) => s !== uri);
    localStorage.setItem('mongo_saved_connections', JSON.stringify(saved));
    set({ savedConnections: saved });
  },
}));
