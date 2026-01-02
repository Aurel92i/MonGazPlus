/**
 * Types d'authentification MonGaz+
 * Gestion des utilisateurs Technicien et Particulier
 */

// ============================================
// RÔLES UTILISATEUR
// ============================================

export type UserRole = 'technicien' | 'particulier';

// ============================================
// UTILISATEUR
// ============================================

export interface User {
  /** Identifiant unique */
  id: string;
  /** Email de connexion */
  email: string;
  /** Rôle déterminé par le backend */
  role: UserRole;
  /** Prénom */
  firstName: string;
  /** Nom */
  lastName: string;
  /** Nom complet */
  fullName: string;
  /** URL de l'avatar (optionnel) */
  avatarUrl?: string;
  /** Date de création du compte */
  createdAt: Date;
}

// ============================================
// TECHNICIEN (extension de User)
// ============================================

export interface Technicien extends User {
  role: 'technicien';
  /** Numéro de badge professionnel */
  badge: string;
  /** Entreprise */
  company: string;
  /** Zone d'intervention */
  zone?: string;
  /** Certifications */
  certifications?: string[];
  /** Nombre total d'interventions */
  totalInterventions: number;
}

// ============================================
// PARTICULIER (extension de User)
// ============================================

export interface Particulier extends User {
  role: 'particulier';
  /** Adresse du logement */
  address?: {
    street: string;
    city: string;
    postalCode: string;
  };
  /** Numéro de compteur (si connu) */
  meterNumber?: string;
  /** Fournisseur de gaz */
  gasProvider?: string;
}

// ============================================
// AUTHENTIFICATION
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User | Technicien | Particulier;
  token?: string;
  error?: string;
}

export interface AuthState {
  /** Utilisateur connecté */
  user: User | Technicien | Particulier | null;
  /** Token d'authentification */
  token: string | null;
  /** État de chargement */
  isLoading: boolean;
  /** Est authentifié */
  isAuthenticated: boolean;
  /** Erreur éventuelle */
  error: string | null;
}

// ============================================
// PERMISSIONS PAR RÔLE
// ============================================

export interface RolePermissions {
  /** Peut effectuer une VEA */
  canPerformVEA: boolean;
  /** Peut voir l'historique */
  canViewHistory: boolean;
  /** Peut exporter des rapports PDF */
  canExportPDF: boolean;
  /** Peut voir les détails experts */
  canViewExpertDetails: boolean;
  /** Peut géolocaliser les interventions */
  canGeolocate: boolean;
  /** Peut capturer une signature client */
  canCaptureSignature: boolean;
  /** Peut accéder aux guides professionnels */
  canAccessProGuides: boolean;
  /** Peut contacter le support pro */
  canContactProSupport: boolean;
}

export const TECHNICIEN_PERMISSIONS: RolePermissions = {
  canPerformVEA: true,
  canViewHistory: true,
  canExportPDF: true,
  canViewExpertDetails: true,
  canGeolocate: true,
  canCaptureSignature: true,
  canAccessProGuides: true,
  canContactProSupport: true,
};

export const PARTICULIER_PERMISSIONS: RolePermissions = {
  canPerformVEA: true,
  canViewHistory: true,
  canExportPDF: false,
  canViewExpertDetails: false,
  canGeolocate: false,
  canCaptureSignature: false,
  canAccessProGuides: false,
  canContactProSupport: false,
};

// ============================================
// HELPERS
// ============================================

export function getPermissions(role: UserRole): RolePermissions {
  return role === 'technicien' ? TECHNICIEN_PERMISSIONS : PARTICULIER_PERMISSIONS;
}

export function isTechnicien(user: User): user is Technicien {
  return user.role === 'technicien';
}

export function isParticulier(user: User): user is Particulier {
  return user.role === 'particulier';
}
