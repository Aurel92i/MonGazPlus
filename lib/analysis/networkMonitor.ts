/**
 * Moniteur réseau pour MonGaz+
 * 
 * Surveille la connectivité et traite automatiquement
 * les analyses en attente quand le réseau revient.
 */

import * as Network from 'expo-network';
import { 
  getPendingAnalyses, 
  markAsProcessing, 
  markAsCompleted, 
  markAsFailed,
  PendingAnalysis 
} from './offlineQueue';
import { performGoogleVisionAnalysis } from './veaAnalysis';
import { RETRY_DELAY_MS, ENABLE_OFFLINE_QUEUE } from './config';

// ============================================
// TYPES
// ============================================

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

type AnalysisCallback = (analysis: PendingAnalysis) => void;

// ============================================
// ÉTAT
// ============================================

let isProcessingQueue = false;
let retryTimer: NodeJS.Timeout | null = null;
let onAnalysisCompleteCallback: AnalysisCallback | null = null;

// ============================================
// FONCTIONS RÉSEAU
// ============================================

/**
 * Vérifie l'état actuel du réseau
 */
export async function getNetworkStatus(): Promise<NetworkStatus> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    
    return {
      isConnected: networkState.isConnected ?? false,
      isInternetReachable: networkState.isInternetReachable ?? false,
      type: networkState.type ?? 'unknown',
    };
  } catch (error) {
    console.error('❌ Erreur vérification réseau:', error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown',
    };
  }
}

/**
 * Vérifie si le réseau est disponible pour les appels API
 */
export async function isNetworkAvailable(): Promise<boolean> {
  const status = await getNetworkStatus();
  return status.isConnected && status.isInternetReachable;
}

// ============================================
// TRAITEMENT DE LA FILE
// ============================================

/**
 * Traite une analyse en attente
 */
async function processAnalysis(analysis: PendingAnalysis): Promise<void> {
  console.log(`🔄 Traitement analyse: ${analysis.id}`);
  
  try {
    await markAsProcessing(analysis.id);
    
    // Effectuer l'analyse via Google Vision
    const result = await performGoogleVisionAnalysis(
      analysis.imageBefore,
      analysis.imageAfter,
      analysis.elapsedTime
    );
    
    await markAsCompleted(analysis.id, result);
    
    console.log(`✅ Analyse terminée: ${analysis.id} → ${result.result}`);
    
    // Notifier via le callback
    if (onAnalysisCompleteCallback) {
      const updatedAnalysis: PendingAnalysis = {
        ...analysis,
        status: 'completed',
        result,
      };
      onAnalysisCompleteCallback(updatedAnalysis);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`❌ Échec analyse ${analysis.id}:`, errorMessage);
    
    await markAsFailed(analysis.id, errorMessage);
  }
}

/**
 * Traite toutes les analyses en attente
 */
export async function processQueuedAnalyses(): Promise<number> {
  if (!ENABLE_OFFLINE_QUEUE) {
    return 0;
  }
  
  if (isProcessingQueue) {
    console.log('⏳ Traitement déjà en cours...');
    return 0;
  }
  
  // Vérifier la connectivité
  const networkAvailable = await isNetworkAvailable();
  if (!networkAvailable) {
    console.log('📵 Pas de réseau, report du traitement');
    scheduleRetry();
    return 0;
  }
  
  isProcessingQueue = true;
  let processedCount = 0;
  
  try {
    const pending = await getPendingAnalyses();
    
    if (pending.length === 0) {
      console.log('📭 Aucune analyse en attente');
      return 0;
    }
    
    console.log(`📬 ${pending.length} analyse(s) en attente`);
    
    // Traiter chaque analyse séquentiellement
    for (const analysis of pending) {
      // Revérifier le réseau avant chaque analyse
      const stillConnected = await isNetworkAvailable();
      if (!stillConnected) {
        console.log('📵 Connexion perdue, arrêt du traitement');
        scheduleRetry();
        break;
      }
      
      await processAnalysis(analysis);
      processedCount++;
      
      // Petite pause entre les analyses pour ne pas surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Erreur traitement file:', error);
  } finally {
    isProcessingQueue = false;
  }
  
  return processedCount;
}

/**
 * Programme une nouvelle tentative
 */
function scheduleRetry(): void {
  if (retryTimer) {
    clearTimeout(retryTimer);
  }
  
  console.log(`⏰ Nouvelle tentative dans ${RETRY_DELAY_MS / 1000}s`);
  
  retryTimer = setTimeout(async () => {
    await processQueuedAnalyses();
  }, RETRY_DELAY_MS);
}

/**
 * Démarre la surveillance du réseau
 */
export function startNetworkMonitoring(onComplete?: AnalysisCallback): void {
  if (!ENABLE_OFFLINE_QUEUE) {
    console.log('📴 File d\'attente offline désactivée');
    return;
  }
  
  console.log('🔌 Démarrage surveillance réseau...');
  
  if (onComplete) {
    onAnalysisCompleteCallback = onComplete;
  }
  
  // Vérifier immédiatement s'il y a des analyses en attente
  processQueuedAnalyses();
  
  // Note: expo-network ne supporte pas les listeners en temps réel
  // On utilise un polling périodique à la place
  setInterval(async () => {
    const pending = await getPendingAnalyses();
    if (pending.length > 0) {
      await processQueuedAnalyses();
    }
  }, RETRY_DELAY_MS);
}

/**
 * Arrête la surveillance du réseau
 */
export function stopNetworkMonitoring(): void {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  onAnalysisCompleteCallback = null;
  console.log('🔌 Surveillance réseau arrêtée');
}

/**
 * Force le traitement immédiat de la file
 */
export async function forceProcessQueue(): Promise<number> {
  console.log('🚀 Traitement forcé de la file...');
  return await processQueuedAnalyses();
}
