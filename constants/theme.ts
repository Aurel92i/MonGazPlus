/**
 * Thème MonGaz+
 * Couleurs et styles de l'application
 */

export const Colors = {
  // Couleurs principales
  primary: '#F5A623',      // Orange GRDF
  primaryDark: '#D4880F',
  primaryLight: '#FFD080',
  
  // Couleurs secondaires (par rôle)
  technicien: '#3B82F6',   // Bleu pro
  technicienLight: '#DBEAFE',
  particulier: '#8B5CF6',  // Violet
  particulierLight: '#EDE9FE',
  
  // Couleurs de fond
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F0F0',
  
  // Couleurs de texte
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  textOnPrimary: '#FFFFFF',
  
  // Couleurs VEA
  veaOk: '#22C55E',           // Vert - OK
  veaOkLight: '#DCFCE7',
  veaDoute: '#F59E0B',        // Orange - Doute
  veaDouteLight: '#FEF3C7',
  veaFuite: '#EF4444',        // Rouge - Fuite
  veaFuiteLight: '#FEE2E2',
  
  // Couleurs d'état
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Couleurs de cadre
  frameNotAligned: '#EF4444',
  frameAlmostAligned: '#F59E0B',
  frameAligned: '#22C55E',
  
  // Couleurs du compteur
  meterDigitBlack: '#1A1A1A',
  meterDigitRed: '#DC2626',
  meterBackground: '#FFFFFF',
  
  // Autres
  border: '#E5E7EB',
  disabled: '#D1D5DB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  ghost: 'rgba(255, 255, 255, 0.3)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Configuration par défaut de l'application
export const DefaultConfig = {
  stabilization: {
    stabilityThreshold: 3,        // degrés
    updateInterval: 100,          // ms
    minStableDuration: 500,       // ms
  },
  alignment: {
    targetAspectRatio: 1.6,       // largeur/hauteur typique d'un compteur
    tolerance: 15,                // %
    showGuides: true,
  },
  analysis: {
    noMovementThreshold: 0.5,     // %
    microOscillationThreshold: 2, // %
    significantMovementThreshold: 5, // %
    minConfidence: 0.7,
  },
  retentionDays: 365,
  debugMode: __DEV__,
};

// Messages VEA - Système binaire (OK ou FUITE)
export const VEAMessages = {
  OK: {
    title: 'VEA OK',
    subtitle: 'Installation étanche',
    recommendation: 'Procéder à la remise en service. Ouvrir les robinets des appareils et rallumer les brûleurs.',
    icon: 'check-circle',
  },
  FUITE: {
    title: 'FUITE DÉTECTÉE',
    subtitle: 'Mouvement du compteur détecté',
    recommendation: 'COUPER LE GAZ immédiatement - Fermer le robinet du compteur - Aérer - Rechercher la fuite - Appeler un professionnel',
    icon: 'x-circle',
  },
};

// Messages par rôle
export const RoleMessages = {
  technicien: {
    welcome: 'Espace Technicien',
    subtitle: 'Accès professionnel complet',
  },
  particulier: {
    welcome: 'Espace Particulier',
    subtitle: 'Vérification simplifiée',
  },
};
