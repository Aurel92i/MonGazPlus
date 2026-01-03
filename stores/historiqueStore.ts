/**
 * Store Zustand pour l'historique des interventions
 * MonGaz+ - Persistance et gestion des VEA effectuées
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export type VEAResultat = 'OK' | 'FUITE';

export interface DonneesCompteur {
  /** ID du compteur (extrait par OCR ou saisi) */
  idCompteur?: string;
  /** Index relevé (m³) */
  indexReleve?: string;
  /** Marque du compteur */
  marque?: string;
}

export interface Geolocalisation {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Adresse formatée */
  adresse?: string;
  /** Précision en mètres */
  precision?: number;
}

export interface InterventionVEA {
  /** ID unique */
  id: string;
  /** Date de l'intervention */
  date: Date;
  /** Résultat binaire : OK ou FUITE */
  resultat: VEAResultat;
  /** Données du compteur */
  compteur: DonneesCompteur;
  /** Géolocalisation */
  geolocalisation?: Geolocalisation;
  /** Durée du test en secondes */
  dureeTest: number;
  /** Photo avant (URI) */
  photoAvantUri?: string;
  /** Photo après (URI) */
  photoApresUri?: string;
  /** Notes additionnelles */
  notes?: string;
  /** Signature client (base64) - technicien uniquement */
  signatureClient?: string;
  /** Nom du client - technicien uniquement */
  nomClient?: string;
}

export interface StatistiquesVEA {
  /** Total des interventions */
  total: number;
  /** Nombre OK */
  ok: number;
  /** Nombre de fuites détectées */
  fuites: number;
  /** Aujourd'hui */
  aujourdhui: number;
  /** Cette semaine */
  semaine: number;
  /** Ce mois */
  mois: number;
}

// ============================================
// INTERFACE DU STORE
// ============================================

interface HistoriqueStore {
  // Données
  interventions: InterventionVEA[];
  
  // Actions
  ajouterIntervention: (intervention: Omit<InterventionVEA, 'id'>) => string;
  supprimerIntervention: (id: string) => void;
  modifierIntervention: (id: string, updates: Partial<InterventionVEA>) => void;
  
  // Getters
  getIntervention: (id: string) => InterventionVEA | undefined;
  getInterventionsParResultat: (resultat: VEAResultat) => InterventionVEA[];
  getStatistiques: () => StatistiquesVEA;
  
  // Reset
  viderHistorique: () => void;
}

// ============================================
// HELPERS
// ============================================

function genererID(): string {
  return `vea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function estAujourdhui(date: Date): boolean {
  const aujourdhui = new Date();
  return date.toDateString() === aujourdhui.toDateString();
}

function estCetteSemaine(date: Date): boolean {
  const aujourdhui = new Date();
  const debutSemaine = new Date(aujourdhui);
  debutSemaine.setDate(aujourdhui.getDate() - aujourdhui.getDay());
  debutSemaine.setHours(0, 0, 0, 0);
  return date >= debutSemaine;
}

function estCeMois(date: Date): boolean {
  const aujourdhui = new Date();
  return date.getMonth() === aujourdhui.getMonth() && 
         date.getFullYear() === aujourdhui.getFullYear();
}

// ============================================
// CRÉATION DU STORE
// ============================================

export const useHistoriqueStore = create<HistoriqueStore>()(
  persist(
    (set, get) => ({
      // État initial
      interventions: [],
      
      // Actions
      ajouterIntervention: (intervention) => {
        const id = genererID();
        const nouvelleIntervention: InterventionVEA = {
          ...intervention,
          id,
          date: new Date(intervention.date),
        };
        
        set((state) => ({
          interventions: [nouvelleIntervention, ...state.interventions],
        }));
        
        return id;
      },
      
      supprimerIntervention: (id) => {
        set((state) => ({
          interventions: state.interventions.filter((i) => i.id !== id),
        }));
      },
      
      modifierIntervention: (id, updates) => {
        set((state) => ({
          interventions: state.interventions.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        }));
      },
      
      // Getters
      getIntervention: (id) => {
        return get().interventions.find((i) => i.id === id);
      },
      
      getInterventionsParResultat: (resultat) => {
        return get().interventions.filter((i) => i.resultat === resultat);
      },
      
      getStatistiques: () => {
        const { interventions } = get();
        const maintenant = new Date();
        
        return {
          total: interventions.length,
          ok: interventions.filter((i) => i.resultat === 'OK').length,
          fuites: interventions.filter((i) => i.resultat === 'FUITE').length,
          aujourdhui: interventions.filter((i) => estAujourdhui(new Date(i.date))).length,
          semaine: interventions.filter((i) => estCetteSemaine(new Date(i.date))).length,
          mois: interventions.filter((i) => estCeMois(new Date(i.date))).length,
        };
      },
      
      // Reset
      viderHistorique: () => {
        set({ interventions: [] });
      },
    }),
    {
      name: 'mongaz-historique',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ interventions: state.interventions }),
    }
  )
);

// ============================================
// SÉLECTEURS
// ============================================

export const selectInterventionsRecentes = (state: HistoriqueStore, limit: number = 10) =>
  state.interventions.slice(0, limit);

export const selectTauxReussite = (state: HistoriqueStore) => {
  const total = state.interventions.length;
  if (total === 0) return 100;
  const ok = state.interventions.filter((i) => i.resultat === 'OK').length;
  return Math.round((ok / total) * 100);
};
