/**
 * File d'attente offline pour MonGaz+
 * 
 * Stocke les analyses VEA en attente quand il n'y a pas de réseau.
 * Les analyses sont automatiquement traitées quand le réseau revient.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageMetadata, VEADecision } from '@/types';
import { QUEUE_EXPIRATION_MS, MAX_RETRY_ATTEMPTS } from './config';

// ============================================
// TYPES
// ============================================

export interface PendingAnalysis {
  /** Identifiant unique */
  id: string;
  
  /** Image AVANT */
  imageBefore: ImageMetadata;
  
  /** Image APRÈS */
  imageAfter: ImageMetadata;
  
  /** Temps écoulé en secondes */
  elapsedTime: number;
  
  /** Date de création */
  createdAt: number;
  
  /** Nombre de tentatives */
  attempts: number;
  
  /** Statut */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  /** Résultat (si complété) */
  result?: VEADecision;
  
  /** Erreur (si échec) */
  error?: string;
}

// ============================================
// CONSTANTES
// ============================================

const STORAGE_KEY = '@mongaz_pending_analyses';

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Génère un ID unique
 */
function generateId(): string {
  return `vea_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Vérifie si une analyse a expiré
 */
function isExpired(analysis: PendingAnalysis): boolean {
  return Date.now() - analysis.createdAt > QUEUE_EXPIRATION_MS;
}

// ============================================
// API PUBLIQUE
// ============================================

/**
 * Ajoute une analyse à la file d'attente
 */
export async function addToQueue(
  imageBefore: ImageMetadata,
  imageAfter: ImageMetadata,
  elapsedTime: number
): Promise<string> {
  const id = generateId();
  
  const analysis: PendingAnalysis = {
    id,
    imageBefore,
    imageAfter,
    elapsedTime,
    createdAt: Date.now(),
    attempts: 0,
    status: 'pending',
  };
  
  try {
    const queue = await getQueue();
    queue.push(analysis);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    
    console.log(`📥 Analyse ajoutée à la file: ${id}`);
    return id;
  } catch (error) {
    console.error('❌ Erreur ajout à la file:', error);
    throw error;
  }
}

/**
 * Récupère toutes les analyses en attente
 */
export async function getQueue(): Promise<PendingAnalysis[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const queue: PendingAnalysis[] = JSON.parse(data);
    
    // Filtrer les analyses expirées
    const validQueue = queue.filter(a => !isExpired(a));
    
    // Sauvegarder si des éléments ont été supprimés
    if (validQueue.length !== queue.length) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validQueue));
    }
    
    return validQueue;
  } catch (error) {
    console.error('❌ Erreur lecture file:', error);
    return [];
  }
}

/**
 * Récupère les analyses en attente (status = pending)
 */
export async function getPendingAnalyses(): Promise<PendingAnalysis[]> {
  const queue = await getQueue();
  return queue.filter(a => a.status === 'pending' && a.attempts < MAX_RETRY_ATTEMPTS);
}

/**
 * Met à jour le statut d'une analyse
 */
export async function updateAnalysis(
  id: string,
  updates: Partial<PendingAnalysis>
): Promise<void> {
  try {
    const queue = await getQueue();
    const index = queue.findIndex(a => a.id === id);
    
    if (index === -1) {
      console.warn(`⚠️ Analyse non trouvée: ${id}`);
      return;
    }
    
    queue[index] = { ...queue[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    
    console.log(`📝 Analyse mise à jour: ${id} → ${updates.status || 'updated'}`);
  } catch (error) {
    console.error('❌ Erreur mise à jour:', error);
  }
}

/**
 * Marque une analyse comme en cours de traitement
 */
export async function markAsProcessing(id: string): Promise<void> {
  await updateAnalysis(id, { 
    status: 'processing',
    attempts: (await getQueue()).find(a => a.id === id)?.attempts ?? 0 + 1,
  });
}

/**
 * Marque une analyse comme terminée avec son résultat
 */
export async function markAsCompleted(id: string, result: VEADecision): Promise<void> {
  await updateAnalysis(id, { 
    status: 'completed',
    result,
  });
}

/**
 * Marque une analyse comme échouée
 */
export async function markAsFailed(id: string, error: string): Promise<void> {
  const queue = await getQueue();
  const analysis = queue.find(a => a.id === id);
  
  const newAttempts = (analysis?.attempts ?? 0) + 1;
  const newStatus = newAttempts >= MAX_RETRY_ATTEMPTS ? 'failed' : 'pending';
  
  await updateAnalysis(id, { 
    status: newStatus,
    attempts: newAttempts,
    error,
  });
}

/**
 * Supprime une analyse de la file
 */
export async function removeFromQueue(id: string): Promise<void> {
  try {
    const queue = await getQueue();
    const filtered = queue.filter(a => a.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    console.log(`🗑️ Analyse supprimée: ${id}`);
  } catch (error) {
    console.error('❌ Erreur suppression:', error);
  }
}

/**
 * Vide la file d'attente
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ File d\'attente vidée');
  } catch (error) {
    console.error('❌ Erreur vidage file:', error);
  }
}

/**
 * Compte le nombre d'analyses en attente
 */
export async function getPendingCount(): Promise<number> {
  const pending = await getPendingAnalyses();
  return pending.length;
}

/**
 * Récupère une analyse par son ID
 */
export async function getAnalysisById(id: string): Promise<PendingAnalysis | null> {
  const queue = await getQueue();
  return queue.find(a => a.id === id) || null;
}
