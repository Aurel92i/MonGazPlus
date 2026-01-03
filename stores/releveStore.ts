/**
 * Store pour la gestion du relevé d'index
 */

import { create } from 'zustand';

interface ReleveState {
  // Données du relevé
  indexValue: string | null;
  photoUri: string | null;
  dateReleve: Date | null;
  
  // Actions
  setIndex: (value: string, photoUri: string) => void;
  reset: () => void;
}

export const useReleveStore = create<ReleveState>((set) => ({
  // État initial
  indexValue: null,
  photoUri: null,
  dateReleve: null,

  // Définir l'index après analyse OCR
  setIndex: (value: string, photoUri: string) => set({
    indexValue: value,
    photoUri: photoUri,
    dateReleve: new Date(),
  }),

  // Réinitialiser
  reset: () => set({
    indexValue: null,
    photoUri: null,
    dateReleve: null,
  }),
}));
