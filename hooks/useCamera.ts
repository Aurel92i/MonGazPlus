/**
 * Hook de caméra pour MonGaz+
 * Gère la capture de photos avec métadonnées complètes
 */

import { useState, useRef, useCallback } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { ImageMetadata } from '@/types';

interface UseCameraOptions {
  /** Type de caméra (défaut: back) */
  cameraType?: CameraType;
}

interface CameraState {
  isReady: boolean;
  hasPermission: boolean | null;
  isCapturing: boolean;
  lastPhoto: ImageMetadata | null;
  error: string | null;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { cameraType = 'back' } = options;
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  const [state, setState] = useState<CameraState>({
    isReady: false,
    hasPermission: null,
    isCapturing: false,
    lastPhoto: null,
    error: null,
  });

  // Mettre à jour l'état des permissions
  const updatePermissionState = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasPermission: permission?.granted ?? null,
    }));
  }, [permission]);

  // Demander les permissions
  const askPermission = useCallback(async () => {
    try {
      const result = await requestPermission();
      setState(prev => ({
        ...prev,
        hasPermission: result.granted,
        error: result.granted ? null : 'Permission caméra refusée',
      }));
      return result.granted;
    } catch (error) {
      setState(prev => ({
        ...prev,
        hasPermission: false,
        error: 'Erreur lors de la demande de permission',
      }));
      return false;
    }
  }, [requestPermission]);

  // Callback quand la caméra est prête
  const onCameraReady = useCallback(() => {
    setState(prev => ({ ...prev, isReady: true }));
  }, []);

  // Générer le hash SHA-256 d'une image
  const generateImageHash = useCallback(async (uri: string): Promise<string> => {
    try {
      // Lire le fichier en base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Générer le hash
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        base64
      );
      
      return hash;
    } catch (error) {
      console.error('Erreur lors du calcul du hash:', error);
      return 'hash-error';
    }
  }, []);

  // Capturer une photo
  const takePhoto = useCallback(async (sensorData?: {
    pitch: number;
    roll: number;
    yaw: number;
  }): Promise<ImageMetadata | null> => {
    if (!cameraRef.current || state.isCapturing) {
      return null;
    }

    setState(prev => ({ ...prev, isCapturing: true, error: null }));

    try {
      // Prendre la photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
        skipProcessing: false,
      });

      if (!photo) {
        throw new Error('Échec de la capture');
      }

      // Générer le hash
      const hash = await generateImageHash(photo.uri);

      // Créer les métadonnées
      const metadata: ImageMetadata = {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        timestamp: new Date(),
        deviceOrientation: 0, // TODO: récupérer l'orientation réelle
        sensorData: sensorData || { pitch: 0, roll: 0, yaw: 0 },
        hash,
      };

      setState(prev => ({
        ...prev,
        isCapturing: false,
        lastPhoto: metadata,
      }));

      return metadata;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de capture';
      setState(prev => ({
        ...prev,
        isCapturing: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [state.isCapturing, generateImageHash]);

  // Réinitialiser la dernière photo
  const resetPhoto = useCallback(() => {
    setState(prev => ({ ...prev, lastPhoto: null }));
  }, []);

  return {
    // État
    ...state,
    permission,
    cameraType,
    
    // Refs
    cameraRef,
    
    // Actions
    askPermission,
    onCameraReady,
    takePhoto,
    resetPhoto,
  };
}
