import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Tip, Creator } from '../types';

interface AppStore extends Omit<AppState, 'isConnected' | 'address' | 'chainId' | 'balance' | 'ensName'> {
  // Actions
  addTip: (tip: Omit<Tip, 'id' | 'timestamp'>) => void;
  setSelectedCreator: (creator: Creator | null) => void;
  setModalOpen: (open: boolean) => void;
  clearTips: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // State
      recentTips: [],
      selectedCreator: null,
      isModalOpen: false,

      // Actions
      addTip: (tip) => {
        const newTip: Tip = {
          ...tip,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        
        set((state) => ({
          recentTips: [newTip, ...state.recentTips].slice(0, 50), // Keep only last 50 tips
        }));
      },

      setSelectedCreator: (creator) => set({ selectedCreator: creator }),
      
      setModalOpen: (open) => set({ isModalOpen: open }),
      
      clearTips: () => set({ recentTips: [] }),
    }),
    {
      name: 'tip-crypto-storage',
      partialize: (state) => ({
        recentTips: state.recentTips,
      }),
    }
  )
);