/**
 * Hook de stabilisation pour MonGaz+
 * Utilise l'accéléromètre et le gyroscope pour détecter la stabilité du téléphone
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';

interface StabilityState {
  isStable: boolean;
  pitch: number;  // Inclinaison avant/arrière
  roll: number;   // Inclinaison gauche/droite
  yaw: number;    // Rotation
  stabilityScore: number; // 0-100
  message: string;
}

interface UseStabilizationOptions {
  /** Seuil de stabilité en degrés (défaut: 3) */
  threshold?: number;
  /** Intervalle de mise à jour en ms (défaut: 100) */
  updateInterval?: number;
  /** Durée minimum de stabilité requise en ms (défaut: 500) */
  minStableDuration?: number;
}

const DEFAULT_OPTIONS: UseStabilizationOptions = {
  threshold: 3,
  updateInterval: 100,
  minStableDuration: 500,
};

export function useStabilization(options: UseStabilizationOptions = {}) {
  const { threshold, updateInterval, minStableDuration } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [state, setState] = useState<StabilityState>({
    isStable: false,
    pitch: 0,
    roll: 0,
    yaw: 0,
    stabilityScore: 0,
    message: 'Stabilisez le téléphone...',
  });

  const [isActive, setIsActive] = useState(false);
  const stableStartTime = useRef<number | null>(null);
  const lastAccelData = useRef({ x: 0, y: 0, z: 0 });
  const lastGyroData = useRef({ x: 0, y: 0, z: 0 });

  // Calculer les angles à partir de l'accéléromètre
  const calculateAngles = useCallback((accel: { x: number; y: number; z: number }) => {
    // Convertir en degrés
    const pitch = Math.atan2(accel.y, Math.sqrt(accel.x ** 2 + accel.z ** 2)) * (180 / Math.PI);
    const roll = Math.atan2(-accel.x, accel.z) * (180 / Math.PI);
    return { pitch, roll };
  }, []);

  // Calculer le score de stabilité
  const calculateStabilityScore = useCallback((
    pitch: number,
    roll: number,
    gyro: { x: number; y: number; z: number }
  ) => {
    // Score basé sur l'inclinaison (0-50 points)
    const maxAngle = 45; // Angle max considéré
    const angleScore = Math.max(0, 50 - (Math.abs(pitch) + Math.abs(roll)) / maxAngle * 50);

    // Score basé sur le mouvement du gyroscope (0-50 points)
    const gyroMagnitude = Math.sqrt(gyro.x ** 2 + gyro.y ** 2 + gyro.z ** 2);
    const maxGyro = 2; // Mouvement max considéré
    const gyroScore = Math.max(0, 50 - (gyroMagnitude / maxGyro) * 50);

    return Math.round(angleScore + gyroScore);
  }, []);

  // Vérifier si le téléphone est stable
  const checkStability = useCallback((
    pitch: number,
    roll: number,
    gyro: { x: number; y: number; z: number }
  ) => {
    const isPitchStable = Math.abs(pitch) < threshold!;
    const isRollStable = Math.abs(roll) < threshold!;
    const gyroMagnitude = Math.sqrt(gyro.x ** 2 + gyro.y ** 2 + gyro.z ** 2);
    const isGyroStable = gyroMagnitude < 0.1;

    return isPitchStable && isRollStable && isGyroStable;
  }, [threshold]);

  // Obtenir le message approprié
  const getMessage = useCallback((pitch: number, roll: number, isCurrentlyStable: boolean) => {
    if (isCurrentlyStable) {
      return '✓ Téléphone stable !';
    }

    const messages: string[] = [];
    
    if (Math.abs(pitch) >= threshold!) {
      if (pitch > 0) {
        messages.push('Inclinez vers le bas');
      } else {
        messages.push('Inclinez vers le haut');
      }
    }
    
    if (Math.abs(roll) >= threshold!) {
      if (roll > 0) {
        messages.push('Inclinez vers la gauche');
      } else {
        messages.push('Inclinez vers la droite');
      }
    }

    return messages.length > 0 ? messages.join(' • ') : 'Stabilisez le téléphone...';
  }, [threshold]);

  // Démarrer les capteurs
  const startSensors = useCallback(async () => {
    try {
      // Vérifier la disponibilité
      const [accelAvailable, gyroAvailable] = await Promise.all([
        Accelerometer.isAvailableAsync(),
        Gyroscope.isAvailableAsync(),
      ]);

      if (!accelAvailable) {
        setState(prev => ({ ...prev, message: 'Accéléromètre non disponible' }));
        return;
      }

      // Configurer l'intervalle
      Accelerometer.setUpdateInterval(updateInterval!);
      if (gyroAvailable) {
        Gyroscope.setUpdateInterval(updateInterval!);
      }

      // S'abonner à l'accéléromètre
      Accelerometer.addListener((data) => {
        lastAccelData.current = data;
        
        const { pitch, roll } = calculateAngles(data);
        const gyro = lastGyroData.current;
        const isCurrentlyStable = checkStability(pitch, roll, gyro);
        const score = calculateStabilityScore(pitch, roll, gyro);
        const message = getMessage(pitch, roll, isCurrentlyStable);

        // Gérer le timing de stabilité
        const now = Date.now();
        if (isCurrentlyStable) {
          if (!stableStartTime.current) {
            stableStartTime.current = now;
          }
        } else {
          stableStartTime.current = null;
        }

        const hasBeenStableLongEnough = 
          stableStartTime.current !== null && 
          (now - stableStartTime.current) >= minStableDuration!;

        setState({
          isStable: hasBeenStableLongEnough,
          pitch: Math.round(pitch * 10) / 10,
          roll: Math.round(roll * 10) / 10,
          yaw: 0, // Le yaw nécessite un magnétomètre
          stabilityScore: score,
          message,
        });
      });

      // S'abonner au gyroscope si disponible
      if (gyroAvailable) {
        Gyroscope.addListener((data) => {
          lastGyroData.current = data;
        });
      }

      setIsActive(true);
    } catch (error) {
      console.error('Erreur lors du démarrage des capteurs:', error);
      setState(prev => ({ ...prev, message: 'Erreur capteurs' }));
    }
  }, [updateInterval, minStableDuration, calculateAngles, checkStability, calculateStabilityScore, getMessage]);

  // Arrêter les capteurs
  const stopSensors = useCallback(() => {
    Accelerometer.removeAllListeners();
    Gyroscope.removeAllListeners();
    setIsActive(false);
    stableStartTime.current = null;
  }, []);

  // Nettoyer à la destruction
  useEffect(() => {
    return () => {
      stopSensors();
    };
  }, [stopSensors]);

  return {
    ...state,
    isActive,
    startSensors,
    stopSensors,
  };
}
