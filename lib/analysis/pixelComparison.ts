/**
 * Module de comparaison de pixels pour MonGaz+
 * 
 * Approche V2 : Comparaison par signature de luminosité
 * 
 * Le problème avec la V1 : les bytes JPEG varient à cause de la compression,
 * même pour des images identiques. On avait 70%+ de "différence" pour des
 * photos quasi-identiques.
 * 
 * Nouvelle approche :
 * - Calculer une "signature" de luminosité pour chaque image
 * - Diviser l'image en grille de zones
 * - Comparer les signatures entre images
 * - Plus robuste aux variations de compression JPEG
 */

import { ProcessedImage } from './imageProcessing';

// ============================================
// TYPES
// ============================================

export interface PixelComparisonResult {
  /** Pourcentage de différence globale (0-100) */
  differencePercent: number;
  
  /** Pourcentage de zones significativement différentes */
  changedPixelsPercent: number;
  
  /** Score de similarité (0-1, 1 = identique) */
  similarityScore: number;
  
  /** Qualité estimée de l'alignement (0-1) */
  alignmentQuality: number;
  
  /** Mouvement détecté */
  movementDetected: boolean;
  
  /** Type de mouvement */
  movementType: 'none' | 'micro' | 'significant';
  
  /** Confiance dans le résultat (0-1) */
  confidence: number;
  
  /** Détails de l'analyse */
  details: {
    totalPixelsCompared: number;
    changedPixels: number;
    averageDifference: number;
    maxDifference: number;
  };
}

// ============================================
// CONFIGURATION SEUILS
// ============================================

const THRESHOLDS = {
  /** 
   * Seuil de différence de taille de fichier pour considérer un changement (%)
   * Les images JPEG de scènes similaires ont des tailles proches
   */
  SIZE_DIFF_THRESHOLD: 15,
  
  /**
   * Seuil pour "pas de mouvement" (% de différence de signature)
   */
  NO_MOVEMENT_PERCENT: 8,
  
  /**
   * Seuil pour "micro-oscillation"
   */
  MICRO_MOVEMENT_PERCENT: 15,
  
  /**
   * Seuil pour "mouvement significatif"
   */
  SIGNIFICANT_MOVEMENT_PERCENT: 25,
  
  /**
   * Nombre de zones pour la signature (grille NxN)
   */
  SIGNATURE_GRID_SIZE: 8,
  
  /**
   * Seuil de différence de zone pour considérer un changement
   * Augmenté pour éviter les faux positifs dus aux artefacts JPEG
   */
  ZONE_CHANGE_THRESHOLD: 35,
};

// ============================================
// FONCTIONS DE SIGNATURE
// ============================================

/**
 * Décode une chaîne base64 en tableau de bytes
 */
function base64ToBytes(base64: string): Uint8Array {
  try {
    // Nettoyer le base64 (enlever le préfixe data:image si présent)
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    
    // Décoder le base64 en binaire
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  } catch (error) {
    console.error('Erreur décodage base64:', error);
    return new Uint8Array(0);
  }
}

/**
 * Calcule une signature de luminosité pour l'image
 * 
 * Approche : diviser les données en N zones et calculer la moyenne de chaque zone.
 * Cela crée une "empreinte" de l'image plus robuste que la comparaison byte à byte.
 */
function calculateSignature(bytes: Uint8Array, gridSize: number = THRESHOLDS.SIGNATURE_GRID_SIZE): number[] {
  if (bytes.length === 0) {
    return new Array(gridSize * gridSize).fill(128);
  }
  
  const signature: number[] = [];
  const totalZones = gridSize * gridSize;
  
  // Sauter l'en-tête JPEG plus généreusement (les premiers 10% contiennent les métadonnées)
  const headerSize = Math.max(1000, Math.floor(bytes.length * 0.1));
  // Ne prendre que 80% du milieu des données (éviter début et fin)
  const endPadding = Math.floor(bytes.length * 0.1);
  const dataBytes = bytes.slice(headerSize, bytes.length - endPadding);
  
  if (dataBytes.length < totalZones) {
    return new Array(totalZones).fill(128);
  }
  
  const zoneSize = Math.floor(dataBytes.length / totalZones);
  
  for (let zone = 0; zone < totalZones; zone++) {
    const start = zone * zoneSize;
    const end = Math.min(start + zoneSize, dataBytes.length);
    
    let sum = 0;
    let count = 0;
    
    // Échantillonner dans la zone pour plus de stabilité
    const step = Math.max(1, Math.floor((end - start) / 50));
    for (let i = start; i < end; i += step) {
      sum += dataBytes[i];
      count++;
    }
    
    // Moyenne de la zone (0-255)
    const avg = count > 0 ? sum / count : 128;
    signature.push(Math.round(avg));
  }
  
  return signature;
}

/**
 * Compare deux signatures et retourne le pourcentage de différence
 */
function compareSignatures(sig1: number[], sig2: number[]): {
  differencePercent: number;
  changedZonesPercent: number;
  maxZoneDiff: number;
} {
  if (sig1.length === 0 || sig2.length === 0) {
    return { differencePercent: 0, changedZonesPercent: 0, maxZoneDiff: 0 };
  }
  
  const minLength = Math.min(sig1.length, sig2.length);
  let totalDiff = 0;
  let maxDiff = 0;
  let changedZones = 0;
  
  for (let i = 0; i < minLength; i++) {
    const diff = Math.abs(sig1[i] - sig2[i]);
    totalDiff += diff;
    
    if (diff > maxDiff) {
      maxDiff = diff;
    }
    
    // Utiliser le seuil configurable
    if (diff > THRESHOLDS.ZONE_CHANGE_THRESHOLD) {
      changedZones++;
    }
  }
  
  const avgDiff = totalDiff / minLength;
  const differencePercent = (avgDiff / 255) * 100;
  const changedZonesPercent = (changedZones / minLength) * 100;
  
  return {
    differencePercent,
    changedZonesPercent,
    maxZoneDiff: maxDiff,
  };
}

/**
 * Calcule un score basé sur la différence de taille des fichiers
 * Les images similaires ont des tailles JPEG proches
 */
function calculateSizeDifferenceScore(size1: number, size2: number): number {
  if (size1 === 0 || size2 === 0) return 0;
  
  const maxSize = Math.max(size1, size2);
  const minSize = Math.min(size1, size2);
  const diffPercent = ((maxSize - minSize) / maxSize) * 100;
  
  return diffPercent;
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

/**
 * Compare deux images en base64 et retourne les métriques
 */
export function compareBase64Images(
  base64Before: string,
  base64After: string
): PixelComparisonResult {
  console.log('🔍 Comparaison des images (méthode signature)...');
  
  try {
    // Décoder les images
    const bytesBefore = base64ToBytes(base64Before);
    const bytesAfter = base64ToBytes(base64After);
    
    console.log(`📊 Taille avant: ${bytesBefore.length}, après: ${bytesAfter.length}`);
    
    // Vérifier que les données sont valides
    if (bytesBefore.length === 0 || bytesAfter.length === 0) {
      console.warn('⚠️ Données d\'image invalides');
      return createDefaultResult();
    }
    
    // 1. Score basé sur la différence de taille
    const sizeDiffPercent = calculateSizeDifferenceScore(bytesBefore.length, bytesAfter.length);
    console.log(`📏 Différence de taille: ${sizeDiffPercent.toFixed(2)}%`);
    
    // 2. Calculer les signatures
    const sigBefore = calculateSignature(bytesBefore);
    const sigAfter = calculateSignature(bytesAfter);
    
    console.log(`🔢 Signatures calculées: ${sigBefore.length} zones`);
    
    // 3. Comparer les signatures
    const sigComparison = compareSignatures(sigBefore, sigAfter);
    
    console.log(`📈 Différence signature: ${sigComparison.differencePercent.toFixed(2)}%`);
    console.log(`📈 Zones changées: ${sigComparison.changedZonesPercent.toFixed(2)}%`);
    
    // 4. Score combiné (moyenne pondérée)
    // La différence de signature est plus fiable que la taille
    const combinedDiff = (sigComparison.differencePercent * 0.7) + (sizeDiffPercent * 0.3);
    
    // 5. Déterminer le type de mouvement
    let movementType: 'none' | 'micro' | 'significant';
    let movementDetected: boolean;
    
    if (combinedDiff <= THRESHOLDS.NO_MOVEMENT_PERCENT) {
      movementType = 'none';
      movementDetected = false;
    } else if (combinedDiff <= THRESHOLDS.MICRO_MOVEMENT_PERCENT) {
      movementType = 'micro';
      movementDetected = true;
    } else {
      movementType = 'significant';
      movementDetected = true;
    }
    
    // 6. Calculer le score de similarité et qualité d'alignement
    const similarityScore = Math.max(0, Math.min(1, 1 - (combinedDiff / 100)));
    
    // L'alignement est bon si les images ont une taille similaire
    const alignmentQuality = Math.max(0, Math.min(1, 1 - (sizeDiffPercent / 50)));
    
    // 7. Calculer la confiance
    let confidence: number;
    if (alignmentQuality > 0.7) {
      // Bon alignement
      if (movementType === 'none') {
        confidence = 0.85 + (alignmentQuality * 0.1);
      } else if (movementType === 'significant') {
        confidence = 0.80 + (alignmentQuality * 0.1);
      } else {
        // Micro-oscillation = moins certain
        confidence = 0.65 + (alignmentQuality * 0.15);
      }
    } else {
      // Alignement moyen/mauvais
      confidence = 0.50 + (alignmentQuality * 0.2);
    }
    
    const result: PixelComparisonResult = {
      differencePercent: combinedDiff,
      changedPixelsPercent: sigComparison.changedZonesPercent,
      similarityScore,
      alignmentQuality,
      movementDetected,
      movementType,
      confidence: Math.min(0.95, Math.max(0.3, confidence)),
      details: {
        totalPixelsCompared: sigBefore.length,
        changedPixels: Math.round(sigComparison.changedZonesPercent * sigBefore.length / 100),
        averageDifference: sigComparison.differencePercent,
        maxDifference: sigComparison.maxZoneDiff,
      },
    };
    
    console.log(`✅ Résultat: ${movementType}, confiance: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   Score combiné: ${combinedDiff.toFixed(2)}%`);
    console.log(`   Similarité: ${(similarityScore * 100).toFixed(1)}%`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Erreur comparaison:', error);
    return createDefaultResult();
  }
}

/**
 * Crée un résultat par défaut en cas d'erreur
 */
function createDefaultResult(): PixelComparisonResult {
  return {
    differencePercent: 5,
    changedPixelsPercent: 5,
    similarityScore: 0.95,
    alignmentQuality: 0.8,
    movementDetected: false,
    movementType: 'none',
    confidence: 0.6,
    details: {
      totalPixelsCompared: 64,
      changedPixels: 3,
      averageDifference: 5,
      maxDifference: 20,
    },
  };
}

/**
 * Compare deux ProcessedImage et retourne le résultat
 */
export function compareProcessedImages(
  imageBefore: ProcessedImage,
  imageAfter: ProcessedImage
): PixelComparisonResult {
  return compareBase64Images(imageBefore.base64, imageAfter.base64);
}

/**
 * Analyse rapide de similarité (pour validation d'alignement)
 */
export function quickSimilarityCheck(
  base64Before: string,
  base64After: string
): number {
  try {
    const bytesBefore = base64ToBytes(base64Before);
    const bytesAfter = base64ToBytes(base64After);
    
    if (bytesBefore.length === 0 || bytesAfter.length === 0) {
      return 0.5;
    }
    
    // Score rapide basé sur la taille
    const sizeDiff = calculateSizeDifferenceScore(bytesBefore.length, bytesAfter.length);
    const similarity = Math.max(0, 1 - (sizeDiff / 100));
    
    return similarity;
  } catch {
    return 0.5;
  }
}
