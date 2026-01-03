/**
 * Store des préférences utilisateur
 * Persisté avec AsyncStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserPreferences {
  // Tutoriels
  showTutorialPhoto1: boolean;
  showTutorialPhoto2: boolean;
  
  // Actions
  setShowTutorialPhoto1: (show: boolean) => void;
  setShowTutorialPhoto2: (show: boolean) => void;
  resetTutorials: () => void;
}

export const usePreferencesStore = create<UserPreferences>()(
  persist(
    (set) => ({
      // Par défaut, on affiche les tutoriels
      showTutorialPhoto1: true,
      showTutorialPhoto2: true,
      
      setShowTutorialPhoto1: (show) => set({ showTutorialPhoto1: show }),
      setShowTutorialPhoto2: (show) => set({ showTutorialPhoto2: show }),
      
      resetTutorials: () => set({
        showTutorialPhoto1: true,
        showTutorialPhoto2: true,
      }),
    }),
    {
      name: 'mongaz-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
