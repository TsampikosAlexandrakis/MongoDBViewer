import { create } from 'zustand';

export type TabType = 'documents' | 'indexes' | 'aggregation' | 'schema';

interface NavigationState {
  activeDb: string | null;
  activeCollection: string | null;
  activeTab: TabType;
  setActiveDb: (db: string | null) => void;
  setActiveCollection: (db: string, col: string | null) => void;
  setActiveTab: (tab: TabType) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeDb: null,
  activeCollection: null,
  activeTab: 'documents',

  setActiveDb: (db) => set({ activeDb: db, activeCollection: null, activeTab: 'documents' }),
  setActiveCollection: (db, col) => set({ activeDb: db, activeCollection: col, activeTab: 'documents' }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
