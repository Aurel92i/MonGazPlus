/**
 * Configuration MonGaz+
 * 
 * ⚠️ IMPORTANT : Ne jamais commiter ce fichier avec des vraies clés API !
 * Ajoutez-le à .gitignore
 * 
 * Pour obtenir une clé API Google Cloud Vision :
 * 1. Allez sur https://console.cloud.google.com
 * 2. Créez un projet ou sélectionnez-en un existant
 * 3. Activez l'API "Cloud Vision API"
 * 4. Allez dans "Identifiants" > "Créer des identifiants" > "Clé API"
 * 5. Copiez la clé et collez-la ci-dessous
 * 
 * Tarification :
 * - 0-1000 images/mois : GRATUIT
 * - 1001-5M images/mois : $1.50 / 1000 images
 */

// ============================================
// GOOGLE CLOUD VISION
// ============================================

/**
 * Clé API Google Cloud Vision
 * 
 * Remplacez 'YOUR_API_KEY_HERE' par votre vraie clé API
 */
export const GOOGLE_VISION_API_KEY =AIzaSyDPGWjWiTpS52Td4gIWedEPOXqoWqQVwpA;

// ============================================
// CONFIGURATION ANALYSE
// ============================================

/**
 * Activer le mode offline (file d'attente si pas de réseau)
 */
export const ENABLE_OFFLINE_QUEUE = true;

/**
 * Délai entre les tentatives de retry (en ms)
 */
export const RETRY_DELAY_MS = 30000; // 30 secondes

/**
 * Nombre maximum de tentatives
 */
export const MAX_RETRY_ATTEMPTS = 5;

/**
 * Durée de conservation des analyses en attente (en ms)
 */
export const QUEUE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 heures
