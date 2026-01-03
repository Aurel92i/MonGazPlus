/**
 * Store Zustand pour l'authentification
 * MonGaz+ - Gestion des utilisateurs et rôles
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
// TYPES SUPPLÉMENTAIRES
// ============================================

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company?: string;
}

// ============================================
// DONNÉES DE DÉMONSTRATION
// ============================================

// Utilisateurs de test (sera remplacé par appels API Firebase)
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
    totalInterventions: 0,
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
  // Actions d'authentification
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  loginWithGoogle: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  
  // Vérification email
  sendVerificationEmail: (email: string) => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  isEmailVerified: boolean;
  
  // Mot de passe oublié
  resetPassword: (email: string) => Promise<boolean>;
  
  // Getters
  getPermissions: () => RolePermissions | null;
  isTechnicien: () => boolean;
  isParticulier: () => boolean;
}

// ============================================
// CRÉATION DU STORE
// ============================================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      isEmailVerified: false,

      // ============================================
      // CONNEXION
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
            isEmailVerified: true,
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

      // ============================================
      // INSCRIPTION
      // ============================================

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Vérifier si l'email existe déjà
          if (DEMO_USERS[data.email.toLowerCase()]) {
            set({
              isLoading: false,
              error: 'Un compte existe déjà avec cet email',
            });
            return false;
          }

          // Créer l'utilisateur (simulation)
          const newUserId = `${data.role}-${Date.now()}`;
          const badge = data.role === 'technicien' 
            ? `T-${Math.floor(10000 + Math.random() * 90000)}`
            : undefined;

          const newUser: Technicien | Particulier = data.role === 'technicien'
            ? {
                id: newUserId,
                email: data.email,
                role: 'technicien',
                firstName: data.firstName,
                lastName: data.lastName,
                fullName: `${data.firstName} ${data.lastName}`,
                badge: badge!,
                company: data.company || 'Indépendant',
                totalInterventions: 0,
                createdAt: new Date(),
              }
            : {
                id: newUserId,
                email: data.email,
                role: 'particulier',
                firstName: data.firstName,
                lastName: data.lastName,
                fullName: `${data.firstName} ${data.lastName}`,
                createdAt: new Date(),
              };

          // Ajouter aux utilisateurs de démo (en mémoire)
          DEMO_USERS[data.email.toLowerCase()] = newUser;

          set({
            isLoading: false,
            error: null,
          });

          // Retourner true pour indiquer que l'inscription est réussie
          // L'utilisateur doit encore vérifier son email
          return true;

        } catch (error) {
          set({
            isLoading: false,
            error: 'Erreur lors de l\'inscription. Veuillez réessayer.',
          });
          return false;
        }
      },

      // ============================================
      // GOOGLE AUTH
      // ============================================

      loginWithGoogle: async (role: UserRole) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Simulation d'une connexion Google
          // En production : utiliser expo-auth-session ou Firebase Auth
          
          const googleUserId = `google-${Date.now()}`;
          const badge = role === 'technicien'
            ? `T-${Math.floor(10000 + Math.random() * 90000)}`
            : undefined;

          const googleUser: Technicien | Particulier = role === 'technicien'
            ? {
                id: googleUserId,
                email: 'google.user@gmail.com',
                role: 'technicien',
                firstName: 'Utilisateur',
                lastName: 'Google',
                fullName: 'Utilisateur Google',
                badge: badge!,
                company: 'Mon Entreprise',
                totalInterventions: 0,
                createdAt: new Date(),
              }
            : {
                id: googleUserId,
                email: 'google.user@gmail.com',
                role: 'particulier',
                firstName: 'Utilisateur',
                lastName: 'Google',
                fullName: 'Utilisateur Google',
                createdAt: new Date(),
              };

          set({
            user: googleUser,
            token: `google-token-${googleUserId}`,
            isLoading: false,
            isAuthenticated: true,
            isEmailVerified: true, // Google vérifie les emails
            error: null,
          });

          return true;

        } catch (error) {
          set({
            isLoading: false,
            error: 'Erreur de connexion avec Google',
          });
          return false;
        }
      },

      // ============================================
      // VÉRIFICATION EMAIL
      // ============================================

      sendVerificationEmail: async (email: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          // En production : envoyer un email via Firebase ou autre service
          console.log(`Email de vérification envoyé à ${email}`);
          return true;
        } catch (error) {
          return false;
        }
      },

      verifyEmail: async (code: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          // En production : vérifier le code avec Firebase
          set({ isEmailVerified: true });
          return true;
        } catch (error) {
          return false;
        }
      },

      // ============================================
      // MOT DE PASSE OUBLIÉ
      // ============================================

      resetPassword: async (email: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          // En production : envoyer un email de reset via Firebase
          console.log(`Email de réinitialisation envoyé à ${email}`);
          return true;
        } catch (error) {
          return false;
        }
      },

      // ============================================
      // DÉCONNEXION
      // ============================================

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isEmailVerified: false,
          error: null,
        });
      },

      // ============================================
      // VÉRIFICATION AUTH
      // ============================================

      checkAuth: async () => {
        set({ isLoading: true });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          // La persistance zustand gère automatiquement la récupération
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
    }),
    {
      name: 'mongaz-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isEmailVerified: state.isEmailVerified,
      }),
    }
  )
);

// ============================================
// SÉLECTEURS UTILITAIRES
// ============================================

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectUserRole = (state: AuthStore) => state.user?.role;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
