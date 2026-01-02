/**
 * Store Zustand pour l'authentification
 * MonGaz+ - Gestion des utilisateurs et rôles
 */

import { create } from 'zustand';
import { 
  User, 
  Technicien, 
  Particulier, 
  UserRole,
  LoginCredentials,
  AuthState,
  RolePermissions,
  getPermissions,
} from '@/types';

// ============================================
// DONNÉES DE DÉMONSTRATION
// ============================================

// Utilisateurs de test (sera remplacé par appels API)
const DEMO_USERS: Record<string, Technicien | Particulier> = {
  'tech@grdf.fr': {
    id: 'tech-001',
    email: 'tech@grdf.fr',
    role: 'technicien',
    firstName: 'Jean',
    lastName: 'Dupont',
    fullName: 'Jean Dupont',
    badge: 'T-45892',
    company: 'GRDF',
    zone: 'Île-de-France',
    certifications: ['PGN', 'PGI', 'Qualigaz'],
    totalInterventions: 1247,
    createdAt: new Date('2020-03-15'),
  },
  'particulier@email.fr': {
    id: 'part-001',
    email: 'particulier@email.fr',
    role: 'particulier',
    firstName: 'Marie',
    lastName: 'Martin',
    fullName: 'Marie Martin',
    address: {
      street: '15 rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
    },
    meterNumber: '20-757109',
    gasProvider: 'Engie',
    createdAt: new Date('2023-06-10'),
  },
};

// ============================================
// INTERFACE DU STORE
// ============================================

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  
  // Getters
  getPermissions: () => RolePermissions | null;
  isTechnicien: () => boolean;
  isParticulier: () => boolean;
}

// ============================================
// CRÉATION DU STORE
// ============================================

export const useAuthStore = create<AuthStore>((set, get) => ({
  // État initial
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // ============================================
  // ACTIONS
  // ============================================

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Recherche de l'utilisateur de démo
      const user = DEMO_USERS[credentials.email.toLowerCase()];

      if (!user) {
        set({ 
          isLoading: false, 
          error: 'Email ou mot de passe incorrect' 
        });
        return false;
      }

      // Pour la démo, on accepte n'importe quel mot de passe
      // En production, vérification via API backend
      if (credentials.password.length < 4) {
        set({ 
          isLoading: false, 
          error: 'Mot de passe trop court' 
        });
        return false;
      }

      // Connexion réussie
      set({
        user,
        token: `demo-token-${user.id}`,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return true;

    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'Erreur de connexion. Veuillez réessayer.' 
      });
      return false;
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      // Simulation : vérifier si un token existe en stockage local
      // En production : vérifier le token avec le backend
      await new Promise(resolve => setTimeout(resolve, 500));

      // Pour la démo, on reste déconnecté au démarrage
      set({ isLoading: false });

    } catch (error) {
      set({ 
        isLoading: false,
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  // ============================================
  // GETTERS
  // ============================================

  getPermissions: () => {
    const { user } = get();
    if (!user) return null;
    return getPermissions(user.role);
  },

  isTechnicien: () => {
    const { user } = get();
    return user?.role === 'technicien';
  },

  isParticulier: () => {
    const { user } = get();
    return user?.role === 'particulier';
  },
}));

// ============================================
// SÉLECTEURS UTILITAIRES
// ============================================

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectUserRole = (state: AuthStore) => state.user?.role;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
