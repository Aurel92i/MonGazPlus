/**
 * Types pour la Vérification d'Étanchéité Apparente (VEA)
 * MonGaz+ - Types principaux
 */

// ============================================
// TYPES DE BASE
// ============================================

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageMetadata {
  uri: string;
  width: number;
  height: number;
  timestamp: Date;
  deviceOrientation: number;
  sensorData: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  hash: string;
}

// ============================================
// LECTURE DU COMPTEUR
// ============================================

export interface DigitReading {
  /** Valeur du chiffre (0-9) */
  value: number;
  /** Confiance de la lecture (0-1) */
  confidence: number;
  /** Position du chiffre dans l'image */
  boundingBox: BoundingBox;
  /** Le chiffre est-il en transition ? */
  isTransitioning: boolean;
}

export interface GraduationReading {
  /** Position de la graduation (0-100%) */
  position: number;
  /** Confiance de la lecture */
  confidence: number;
  /** Zone détectée */
  boundingBox: BoundingBox;
}

export interface DecimalReading {
  /** Les 3 chiffres décimaux (rouges) */
  digits: [DigitReading, DigitReading, DigitReading];
  /** Position de la graduation blanche */
  graduation: GraduationReading;
  /** Valeur numérique combinée (ex: 971 pour 0,971) */
  numericValue: number;
  /** Timestamp de la lecture */
  timestamp: Date;
  /** Hash de l'image source */
  imageHash: string;
}

export interface MeterReading {
  /** Partie entière (chiffres noirs/blancs) */
  integerPart: number;
  /** Partie décimale */
  decimalPart: DecimalReading;
  /** Lecture complète en m³ */
  totalValue: number;
  /** Métadonnées de l'image */
  imageMetadata: ImageMetadata;
}

// ============================================
// RÉSULTAT VEA
// ============================================

// Système binaire : OK ou FUITE (plus de doute)
export type VEAResult = 'OK' | 'FUITE';

export interface VEAAnalysisDetails {
  /** Changement de chiffre détecté */
  digitChange: boolean;
  /** Delta des chiffres (ex: 971 → 973 = +2) */
  digitDelta: number;
  /** Mouvement de la graduation en % */
  graduationMovement: number;
  /** Description textuelle de l'analyse */
  analysisDescription: string;
  /** Comparaison avant/après */
  comparison: {
    before: string;
    after: string;
    interpretation: string;
  };
}

export interface VEADecision {
  /** Résultat final */
  result: VEAResult;
  /** Niveau de confiance (0-1) */
  confidence: number;
  /** Détails de l'analyse */
  details: VEAAnalysisDetails;
  /** Recommandation pour le technicien */
  recommendation: string;
  /** Code couleur pour l'UI - binaire */
  colorCode: 'green' | 'red';
}

// ============================================
// INTERVENTION
// ============================================

export interface TechnicianInfo {
  id: string;
  name: string;
  company?: string;
  badge?: string;
}

export interface LocationInfo {
  address?: string;
  city?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface MeterInfo {
  /** Numéro de série du compteur */
  serialNumber?: string;
  /** Marque (Itron, AEM, Pietro Fiorentini...) */
  brand?: string;
  /** Modèle */
  model?: string;
  /** Type de compteur */
  type?: 'G4' | 'G6' | 'G10' | 'G16' | 'G25' | 'OTHER';
}

export interface VEASession {
  /** Photo avant intervention */
  photoBefore: ImageMetadata;
  /** Photo après intervention */
  photoAfter: ImageMetadata;
  /** Temps écoulé entre les deux photos (secondes) */
  elapsedTime: number;
  /** Lecture avant */
  readingBefore: MeterReading;
  /** Lecture après */
  readingAfter: MeterReading;
  /** Décision VEA */
  decision: VEADecision;
}

export interface Intervention {
  /** Identifiant unique */
  id: string;
  /** ID de l'utilisateur qui a effectué l'intervention */
  userId: string;
  /** Rôle de l'utilisateur */
  userRole: 'technicien' | 'particulier';
  /** Date et heure de l'intervention */
  timestamp: Date;
  /** Informations technicien (si applicable) */
  technician?: TechnicianInfo;
  /** Localisation */
  location: LocationInfo;
  /** Informations compteur */
  meter: MeterInfo;
  /** Session VEA */
  vea: VEASession;
  /** Signature client (base64) - technicien seulement */
  signature?: string;
  /** Notes additionnelles */
  notes?: string;
  /** Statut de synchronisation */
  synced: boolean;
  /** Date de création */
  createdAt: Date;
  /** Date de mise à jour */
  updatedAt: Date;
}

// ============================================
// CONFIGURATION
// ============================================

export interface StabilizationConfig {
  /** Seuil de stabilité en degrés */
  stabilityThreshold: number;
  /** Intervalle de mise à jour des capteurs (ms) */
  updateInterval: number;
  /** Durée minimum de stabilité requise (ms) */
  minStableDuration: number;
}

export interface AlignmentConfig {
  /** Ratio largeur/hauteur cible du compteur */
  targetAspectRatio: number;
  /** Tolérance d'alignement (%) */
  tolerance: number;
  /** Afficher les guides */
  showGuides: boolean;
}

export interface AnalysisConfig {
  /** Seuil "pas de mouvement" (%) */
  noMovementThreshold: number;
  /** Seuil "micro-oscillation" (%) */
  microOscillationThreshold: number;
  /** Seuil "mouvement significatif" (%) */
  significantMovementThreshold: number;
  /** Confiance minimum requise */
  minConfidence: number;
}

export interface AppConfig {
  stabilization: StabilizationConfig;
  alignment: AlignmentConfig;
  analysis: AnalysisConfig;
  /** Durée de rétention des données (jours) */
  retentionDays: number;
  /** Mode debug */
  debugMode: boolean;
}

// ============================================
// ÉTATS UI
// ============================================

export type CaptureStep = 
  | 'IDLE'
  | 'STABILIZING'
  | 'READY'
  | 'CAPTURING'
  | 'CAPTURED'
  | 'ANALYZING'
  | 'COMPLETE';

export interface CaptureState {
  step: CaptureStep;
  isStable: boolean;
  isAligned: boolean;
  currentPhoto: 'before' | 'after';
  photoBefore?: ImageMetadata;
  photoAfter?: ImageMetadata;
  elapsedTime: number;
  timerRunning: boolean;
}

export type PhotoQualityIssue =
  | 'TOO_DARK'
  | 'TOO_BRIGHT'
  | 'BLURRY'
  | 'METER_NOT_DETECTED'
  | 'ANGLE_TOO_STEEP'
  | 'RESOLUTION_TOO_LOW'
  | 'DECIMAL_ZONE_NOT_FOUND';

export interface PhotoQualityCheck {
  isAcceptable: boolean;
  score: number;
  issues: PhotoQualityIssue[];
  recommendations: string[];
}
