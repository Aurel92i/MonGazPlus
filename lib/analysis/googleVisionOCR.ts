/**
 * Service OCR Google Cloud Vision pour MonGaz+
 * 
 * Extrait les chiffres du compteur gaz via l'API Google Cloud Vision.
 * Précision : ~98%
 * 
 * Documentation : https://cloud.google.com/vision/docs/ocr
 */

import * as FileSystemLegacy from 'expo-file-system/legacy';
import { GOOGLE_VISION_API_KEY } from './config';

// ============================================
// TYPES
// ============================================

export interface OCRResult {
  /** Texte complet extrait */
  fullText: string;
  
  /** Chiffres extraits (nettoyés) */
  digits: string;
  
  /** Les 3 derniers chiffres (décimales) */
  lastThreeDigits: string;
  
  /** Confiance de l'OCR (0-1) */
  confidence: number;
  
  /** Succès de l'extraction */
  success: boolean;
  
  /** Message d'erreur si échec */
  error?: string;
}

interface GoogleVisionResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
      boundingPoly?: {
        vertices: Array<{ x: number; y: number }>;
      };
    }>;
    fullTextAnnotation?: {
      text: string;
    };
    error?: {
      code: number;
      message: string;
    };
  }>;
}

// ============================================
// CONFIGURATION
// ============================================

const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Charge une image en base64 depuis son URI
 */
async function loadImageAsBase64(uri: string): Promise<string | null> {
  try {
    const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
      encoding: FileSystemLegacy.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('❌ Erreur chargement image:', error);
    return null;
  }
}

/**
 * Extrait uniquement les chiffres d'une chaîne
 */
function extractDigits(text: string): string {
  return text.replace(/[^0-9]/g, '');
}

/**
 * Extrait les 3 derniers chiffres (zone décimale du compteur)
 */
function extractLastThreeDigits(digits: string): string {
  if (digits.length >= 3) {
    return digits.slice(-3);
  }
  return digits.padStart(3, '0');
}

/**
 * Nettoie le texte OCR pour améliorer l'extraction des chiffres
 */
function cleanOCRText(text: string): string {
  return text
    // Remplacer les caractères souvent confondus
    .replace(/[oO]/g, '0')
    .replace(/[iIlL|]/g, '1')
    .replace(/[zZ]/g, '2')
    .replace(/[sS]/g, '5')
    .replace(/[bB]/g, '8')
    .replace(/[gG]/g, '9')
    // Supprimer les espaces et retours à la ligne
    .replace(/\s+/g, '')
    // Garder uniquement les chiffres
    .replace(/[^0-9]/g, '');
}

// ============================================
// API PRINCIPALE
// ============================================

/**
 * Effectue l'OCR sur une image via Google Cloud Vision
 * 
 * @param imageUri - URI de l'image à analyser
 * @returns Résultat de l'OCR avec les chiffres extraits
 */
export async function performGoogleVisionOCR(imageUri: string): Promise<OCRResult> {
  console.log('🔍 Début OCR Google Cloud Vision...');
  
  // Vérifier la clé API
  if (!GOOGLE_VISION_API_KEY || GOOGLE_VISION_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ Clé API Google Vision non configurée');
    return {
      fullText: '',
      digits: '',
      lastThreeDigits: '000',
      confidence: 0,
      success: false,
      error: 'Clé API Google Vision non configurée. Configurez GOOGLE_VISION_API_KEY dans lib/analysis/config.ts',
    };
  }
  
  try {
    // Charger l'image en base64
    const base64Image = await loadImageAsBase64(imageUri);
    
    if (!base64Image) {
      throw new Error('Impossible de charger l\'image');
    }
    
    console.log(`📦 Image chargée: ${Math.round(base64Image.length / 1024)}KB`);
    
    // Construire la requête
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 10,
            },
          ],
          imageContext: {
            languageHints: ['fr', 'en'],
          },
        },
      ],
    };
    
    // Appeler l'API Google Vision
    console.log('📡 Appel API Google Vision...');
    
    const response = await fetch(`${GOOGLE_VISION_API_URL}?key=${GOOGLE_VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }
    
    const data: GoogleVisionResponse = await response.json();
    
    // Vérifier les erreurs dans la réponse
    if (data.responses[0]?.error) {
      throw new Error(data.responses[0].error.message);
    }
    
    // Extraire le texte
    const fullText = data.responses[0]?.fullTextAnnotation?.text || 
                     data.responses[0]?.textAnnotations?.[0]?.description || 
                     '';
    
    console.log(`📝 Texte brut extrait: "${fullText.substring(0, 100)}..."`);
    
    // Nettoyer et extraire les chiffres
    const cleanedDigits = cleanOCRText(fullText);
    const lastThree = extractLastThreeDigits(cleanedDigits);
    
    console.log(`🔢 Chiffres extraits: ${cleanedDigits}`);
    console.log(`🎯 3 derniers chiffres: ${lastThree}`);
    
    // Calculer la confiance basée sur la qualité de l'extraction
    let confidence = 0.95;
    if (cleanedDigits.length < 3) {
      confidence = 0.6; // Peu de chiffres trouvés
    } else if (cleanedDigits.length > 10) {
      confidence = 0.85; // Beaucoup de chiffres (peut-être du bruit)
    }
    
    return {
      fullText,
      digits: cleanedDigits,
      lastThreeDigits: lastThree,
      confidence,
      success: true,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('❌ Erreur OCR:', errorMessage);
    
    return {
      fullText: '',
      digits: '',
      lastThreeDigits: '000',
      confidence: 0,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Compare les chiffres extraits de deux images
 * 
 * @param digitsBefore - Chiffres de l'image AVANT
 * @param digitsAfter - Chiffres de l'image APRÈS
 * @returns Delta et indication de mouvement
 */
export function compareDigits(
  digitsBefore: string,
  digitsAfter: string
): {
  delta: number;
  movementDetected: boolean;
  movementType: 'none' | 'micro' | 'significant';
} {
  // Convertir en nombres
  const numBefore = parseInt(digitsBefore, 10) || 0;
  const numAfter = parseInt(digitsAfter, 10) || 0;
  
  // Calculer le delta
  const delta = Math.abs(numAfter - numBefore);
  
  console.log(`📊 Comparaison: ${numBefore} → ${numAfter} (delta: ${delta})`);
  
  // Déterminer le type de mouvement
  // Sur un compteur, les 3 derniers chiffres sont les décimales (0.001 m³)
  // - 0 = pas de mouvement
  // - 1-2 = micro-oscillation (possible fuite très légère ou erreur de lecture)
  // - 3+ = mouvement significatif (consommation réelle)
  
  let movementType: 'none' | 'micro' | 'significant';
  let movementDetected: boolean;
  
  if (delta === 0) {
    movementType = 'none';
    movementDetected = false;
  } else if (delta <= 2) {
    movementType = 'micro';
    movementDetected = true;
  } else {
    movementType = 'significant';
    movementDetected = true;
  }
  
  return {
    delta,
    movementDetected,
    movementType,
  };
}

/**
 * Vérifie si le réseau est disponible pour l'API
 */
export async function checkGoogleVisionAvailability(): Promise<boolean> {
  try {
    if (!GOOGLE_VISION_API_KEY || GOOGLE_VISION_API_KEY === 'YOUR_API_KEY_HERE') {
      return false;
    }
    
    // Test de connectivité simple
    const response = await fetch('https://vision.googleapis.com/$discovery/rest?version=v1', {
      method: 'GET',
    });
    
    return response.ok;
  } catch {
    return false;
  }
}
