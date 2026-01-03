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

// Paramètres de cadrage (zoom + position + flash)
interface FrameSettings {
  zoom: number;      // 1 = pas de zoom, 2 = zoom 2x, etc.
  offsetX: number;   // Décalage horizontal en %
  offsetY: number;   // Décalage vertical en %
  flashEnabled: boolean; // État du flash (conservé entre les photos)
}

interface VEAStore {
  // État de la capture
  captureState: CaptureState;
  
  // Paramètres de cadrage (définis lors de photo 1, réutilisés pour photo 2)
  frameSettings: FrameSettings;
  
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
  
  // Actions de cadrage
  setFrameSettings: (settings: FrameSettings) => void;
  setZoom: (zoom: number) => void;
  setOffset: (offsetX: number, offsetY: number) => void;
  setFlash: (enabled: boolean) => void;
  
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

const initialFrameSettings: FrameSettings = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  flashEnabled: false,
};

export const useVEAStore = create<VEAStore>((set, get) => ({
  // État initial
  captureState: initialCaptureState,
  frameSettings: initialFrameSettings,
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
  
  // Actions de cadrage
  setFrameSettings: (settings) => set({ frameSettings: settings }),
  
  setZoom: (zoom) => set((state) => ({
    frameSettings: { ...state.frameSettings, zoom: Math.max(1, Math.min(5, zoom)) }
  })),
  
  setOffset: (offsetX, offsetY) => set((state) => ({
    frameSettings: { ...state.frameSettings, offsetX, offsetY }
  })),
  
  setFlash: (enabled) => set((state) => ({
    frameSettings: { ...state.frameSettings, flashEnabled: enabled }
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
    frameSettings: initialFrameSettings,
    readingBefore: null,
    readingAfter: null,
    decision: null,
  }),
  
  resetAll: () => set({
    captureState: initialCaptureState,
    frameSettings: initialFrameSettings,
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
