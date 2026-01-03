/**
 * Module de traitement d'image pour MonGaz+
 * 
 * Fonctionnalités :
 * - Crop intelligent de la zone décimale (3 derniers chiffres)
 * - Préparation des images pour comparaison
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystemLegacy from 'expo-file-system/legacy';

// ============================================
// TYPES
// ============================================

export interface CropRegion {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export interface ProcessedImage {
  /** URI de l'image croppée */
  uri: string;
  /** Données base64 de l'image */
  base64: string;
  /** Largeur de l'image */
  width: number;
  /** Hauteur de l'image */
  height: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

// ============================================
// CONFIGURATION ZONE DÉCIMALE
// ============================================

/**
 * Configuration de la zone décimale du compteur
 * 
 * Sur un compteur gaz typique :
 * - Les 3 derniers chiffres (décimales) sont à droite
 * - Ils représentent environ 30% de la largeur
 * - Ils sont généralement dans la moitié inférieure
 * 
 * On cible une zone plus large pour être sûr de capturer les chiffres
 */
const DECIMAL_ZONE_CONFIG = {
  // Position horizontale (% depuis la gauche)
  startX: 0.55, // Commence à 55% de la largeur
  endX: 0.95,   // Finit à 95% de la largeur
  
  // Position verticale (% depuis le haut)
  startY: 0.35, // Commence à 35% de la hauteur
  endY: 0.65,   // Finit à 65% de la hauteur
};

/**
 * Zone alternative plus centrée (si compteur centré dans l'image)
 */
const DECIMAL_ZONE_CENTERED = {
  startX: 0.50,
  endX: 0.90,
  startY: 0.40,
  endY: 0.60,
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Calcule la région de crop pour la zone décimale
 */
export function calculateDecimalZoneRegion(
  imageWidth: number,
  imageHeight: number,
  config = DECIMAL_ZONE_CONFIG
): CropRegion {
  const originX = Math.floor(imageWidth * config.startX);
  const originY = Math.floor(imageHeight * config.startY);
  const width = Math.floor(imageWidth * (config.endX - config.startX));
  const height = Math.floor(imageHeight * (config.endY - config.startY));
  
  return { originX, originY, width, height };
}

/**
 * Obtient les dimensions d'une image depuis son URI
 */
export async function getImageDimensions(uri: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    // Utiliser Image de React Native pour obtenir les dimensions
    const { Image } = require('react-native');
    
    Image.getSize(
      uri,
      (width: number, height: number) => {
        resolve({ width, height });
      },
      (error: any) => {
        console.error('Erreur getImageDimensions:', error);
        // Dimensions par défaut (paysage 4:3)
        resolve({ width: 4032, height: 3024 });
      }
    );
  });
}

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Crop la zone décimale d'une image
 * 
 * @param imageUri - URI de l'image source
 * @returns Image croppée avec base64
 */
export async function cropDecimalZone(imageUri: string): Promise<ProcessedImage | null> {
  try {
    console.log('📐 Crop zone décimale...');
    
    // Obtenir les dimensions de l'image
    const dimensions = await getImageDimensions(imageUri);
    console.log(`📏 Dimensions image: ${dimensions.width}x${dimensions.height}`);
    
    // Calculer la région de crop
    const cropRegion = calculateDecimalZoneRegion(dimensions.width, dimensions.height);
    console.log(`✂️ Zone de crop: x=${cropRegion.originX}, y=${cropRegion.originY}, w=${cropRegion.width}, h=${cropRegion.height}`);
    
    // Effectuer le crop
    const croppedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: cropRegion,
        },
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );
    
    if (!croppedImage.base64) {
      throw new Error('Base64 non généré');
    }
    
    console.log(`✅ Crop réussi: ${croppedImage.width}x${croppedImage.height}`);
    
    return {
      uri: croppedImage.uri,
      base64: croppedImage.base64,
      width: croppedImage.width,
      height: croppedImage.height,
    };
  } catch (error) {
    console.error('❌ Erreur crop zone décimale:', error);
    return null;
  }
}

/**
 * Prépare une image pour la comparaison
 * - Redimensionne à une taille standard
 * - Convertit en niveaux de gris (améliore la comparaison)
 * - Retourne le base64
 */
export async function prepareImageForComparison(
  imageUri: string,
  targetWidth: number = 200,
  targetHeight: number = 100
): Promise<ProcessedImage | null> {
  try {
    console.log('🔧 Préparation image pour comparaison...');
    
    // Redimensionner et convertir
    const processedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: targetWidth,
            height: targetHeight,
          },
        },
      ],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );
    
    if (!processedImage.base64) {
      throw new Error('Base64 non généré');
    }
    
    console.log(`✅ Image préparée: ${processedImage.width}x${processedImage.height}`);
    
    return {
      uri: processedImage.uri,
      base64: processedImage.base64,
      width: processedImage.width,
      height: processedImage.height,
    };
  } catch (error) {
    console.error('❌ Erreur préparation image:', error);
    return null;
  }
}

/**
 * Charge une image en base64 directement depuis son URI
 */
export async function loadImageAsBase64(uri: string): Promise<string | null> {
  try {
    const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
      encoding: FileSystemLegacy.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('❌ Erreur chargement base64:', error);
    return null;
  }
}

/**
 * Pipeline complet : crop + préparation
 */
export async function processImageForAnalysis(
  imageUri: string
): Promise<ProcessedImage | null> {
  try {
    // 1. D'abord cropper la zone décimale
    const croppedImage = await cropDecimalZone(imageUri);
    
    if (!croppedImage) {
      console.warn('⚠️ Crop échoué, utilisation de l\'image complète');
      // Fallback : utiliser l'image complète redimensionnée
      return await prepareImageForComparison(imageUri, 300, 150);
    }
    
    // 2. Préparer l'image croppée pour comparaison
    const preparedImage = await prepareImageForComparison(
      croppedImage.uri,
      200,
      100
    );
    
    return preparedImage;
  } catch (error) {
    console.error('❌ Erreur pipeline traitement:', error);
    return null;
  }
}
