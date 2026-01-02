/**
 * Store Zustand pour la gestion d'état VEA
 * MonGaz+ - Gestion de la session de vérification
 */

import { create } from 'zustand';
import { 
  CaptureState, 
  CaptureStep, 
  ImageMetadata, 
  MeterReading, 
  VEADecision,
  Intervention 
} from '@/types';

interface VEAStore {
  // État de la capture
  captureState: CaptureState;
  
  // Lectures du compteur
  readingBefore: MeterReading | null;
  readingAfter: MeterReading | null;
  
  // Décision finale
  decision: VEADecision | null;
  
  // Intervention en cours
  currentIntervention: Partial<Intervention> | null;
  
  // Actions de capture
  setStep: (step: CaptureStep) => void;
  setStable: (isStable: boolean) => void;
  setAligned: (isAligned: boolean) => void;
  setPhotoBefore: (photo: ImageMetadata) => void;
  setPhotoAfter: (photo: ImageMetadata) => void;
  startTimer: () => void;
  stopTimer: () => void;
  updateElapsedTime: (time: number) => void;
  
  // Actions de lecture
  setReadingBefore: (reading: MeterReading) => void;
  setReadingAfter: (reading: MeterReading) => void;
  setDecision: (decision: VEADecision) => void;
  
  // Actions d'intervention
  setInterventionInfo: (info: Partial<Intervention>) => void;
  
  // Reset
  resetSession: () => void;
  resetAll: () => void;
}

const initialCaptureState: CaptureState = {
  step: 'IDLE',
  isStable: false,
  isAligned: false,
  currentPhoto: 'before',
  photoBefore: undefined,
  photoAfter: undefined,
  elapsedTime: 0,
  timerRunning: false,
};

export const useVEAStore = create<VEAStore>((set, get) => ({
  // État initial
  captureState: initialCaptureState,
  readingBefore: null,
  readingAfter: null,
  decision: null,
  currentIntervention: null,
  
  // Actions de capture
  setStep: (step) => set((state) => ({
    captureState: { ...state.captureState, step }
  })),
  
  setStable: (isStable) => set((state) => ({
    captureState: { ...state.captureState, isStable }
  })),
  
  setAligned: (isAligned) => set((state) => ({
    captureState: { ...state.captureState, isAligned }
  })),
  
  setPhotoBefore: (photo) => set((state) => ({
    captureState: {
      ...state.captureState,
      photoBefore: photo,
      currentPhoto: 'after',
      step: 'CAPTURED',
    }
  })),
  
  setPhotoAfter: (photo) => set((state) => ({
    captureState: {
      ...state.captureState,
      photoAfter: photo,
      step: 'ANALYZING',
      timerRunning: false,
    }
  })),
  
  startTimer: () => set((state) => ({
    captureState: { ...state.captureState, timerRunning: true }
  })),
  
  stopTimer: () => set((state) => ({
    captureState: { ...state.captureState, timerRunning: false }
  })),
  
  updateElapsedTime: (time) => set((state) => ({
    captureState: { ...state.captureState, elapsedTime: time }
  })),
  
  // Actions de lecture
  setReadingBefore: (reading) => set({ readingBefore: reading }),
  
  setReadingAfter: (reading) => set({ readingAfter: reading }),
  
  setDecision: (decision) => set((state) => ({
    decision,
    captureState: { ...state.captureState, step: 'COMPLETE' }
  })),
  
  // Actions d'intervention
  setInterventionInfo: (info) => set((state) => ({
    currentIntervention: { ...state.currentIntervention, ...info }
  })),
  
  // Reset
  resetSession: () => set({
    captureState: initialCaptureState,
    readingBefore: null,
    readingAfter: null,
    decision: null,
  }),
  
  resetAll: () => set({
    captureState: initialCaptureState,
    readingBefore: null,
    readingAfter: null,
    decision: null,
    currentIntervention: null,
  }),
}));

// Sélecteurs utilitaires
export const selectIsReadyToCapture = (state: VEAStore) => 
  state.captureState.isStable && state.captureState.isAligned;

export const selectCanStartAnalysis = (state: VEAStore) =>
  state.captureState.photoBefore !== undefined && 
  state.captureState.photoAfter !== undefined;

export const selectSessionComplete = (state: VEAStore) =>
  state.decision !== null;
