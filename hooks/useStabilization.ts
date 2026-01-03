/**
 * Hook de stabilisation pour MonGaz+
 * Utilise l'accéléromètre et le gyroscope pour détecter la stabilité du téléphone
 * 
 * Position de référence : téléphone tenu VERTICALEMENT face au compteur
 * (comme pour prendre une photo d'un objet devant soi)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';

interface StabilityState {
  isStable: boolean;
  pitch: number;  // Inclinaison avant/arrière (0° = vertical face au compteur)
  roll: number;   // Inclinaison gauche/droite
  yaw: number;    // Rotation
  stabilityScore: number; // 0-100
  message: string;
}

interface UseStabilizationOptions {
  /** Seuil de stabilité en degrés (défaut: 8) */
  threshold?: number;
  /** Intervalle de mise à jour en ms (défaut: 100) */
  updateInterval?: number;
  /** Durée minimum de stabilité requise en ms (défaut: 500) */
  minStableDuration?: number;
}

const DEFAULT_OPTIONS: UseStabilizationOptions = {
  threshold: 8, // Plus permissif pour une meilleure UX
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
    message: 'Tenez le téléphone face au compteur',
  });

  const [isActive, setIsActive] = useState(false);
  const stableStartTime = useRef<number | null>(null);
  const lastGyroData = useRef({ x: 0, y: 0, z: 0 });

  /**
   * Calcule les angles d'orientation du téléphone
   * 
   * Convention Expo Sensors (valeurs en G, ~1 = gravité) :
   * - x : droite du téléphone
   * - y : haut du téléphone  
   * - z : sortant de l'écran (vers l'utilisateur)
   * 
   * Position idéale (téléphone vertical, écran face à soi) :
   * - x ≈ 0, y ≈ -1, z ≈ 0
   */
  const calculateAngles = useCallback((accel: { x: number; y: number; z: number }) => {
    const { x, y, z } = accel;
    
    // Magnitude totale (devrait être ~1 en conditions normales)
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    
    // Éviter division par zéro
    if (magnitude < 0.01) {
      return { pitch: 0, roll: 0 };
    }

    // Normaliser
    const nx = x / magnitude;
    const ny = y / magnitude;
    const nz = z / magnitude;

    // PITCH : angle par rapport à la verticale (avant/arrière)
    // En position idéale (téléphone vertical) : ny ≈ -1, nz ≈ 0 → pitch = 0°
    // Si téléphone penché en arrière (écran vers le plafond) : ny diminue, nz devient négatif
    // Si téléphone penché en avant (écran vers le sol) : ny diminue, nz devient positif
    const pitch = Math.atan2(nz, -ny) * (180 / Math.PI);

    // ROLL : inclinaison gauche/droite
    // En position idéale : nx ≈ 0 → roll = 0°
    const roll = Math.atan2(nx, -ny) * (180 / Math.PI);

    return { pitch, roll };
  }, []);

  // Calculer le score de stabilité (0-100)
  const calculateStabilityScore = useCallback((
    pitch: number,
    roll: number,
    gyro: { x: number; y: number; z: number }
  ) => {
    // Score basé sur l'angle (0-60 points)
    // Plus on est proche de 0°, plus le score est élevé
    const maxAngleForScore = 30;
    const angleDeviation = Math.abs(pitch) + Math.abs(roll);
    const angleScore = Math.max(0, 60 * (1 - angleDeviation / (maxAngleForScore * 2)));

    // Score basé sur l'absence de mouvement (gyroscope) (0-40 points)
    const gyroMagnitude = Math.sqrt(gyro.x ** 2 + gyro.y ** 2 + gyro.z ** 2);
    const maxGyroForScore = 0.5;
    const gyroScore = Math.max(0, 40 * (1 - gyroMagnitude / maxGyroForScore));

    return Math.round(angleScore + gyroScore);
  }, []);

  // Vérifier si le téléphone est stable
  const checkStability = useCallback((
    pitch: number,
    roll: number,
    gyro: { x: number; y: number; z: number }
  ) => {
    const isPitchOk = Math.abs(pitch) < threshold!;
    const isRollOk = Math.abs(roll) < threshold!;
    
    // Vérifier aussi que le téléphone ne bouge pas trop
    const gyroMagnitude = Math.sqrt(gyro.x ** 2 + gyro.y ** 2 + gyro.z ** 2);
    const isNotMoving = gyroMagnitude < 0.15;

    return isPitchOk && isRollOk && isNotMoving;
  }, [threshold]);

  // Générer un message d'aide pour l'utilisateur
  const getMessage = useCallback((
    pitch: number,
    roll: number,
    isCurrentlyStable: boolean,
    gyro: { x: number; y: number; z: number }
  ) => {
    if (isCurrentlyStable) {
      return '✓ Téléphone stable !';
    }

    // Vérifier si le téléphone bouge trop
    const gyroMagnitude = Math.sqrt(gyro.x ** 2 + gyro.y ** 2 + gyro.z ** 2);
    if (gyroMagnitude > 0.3) {
      return '⟳ Arrêtez de bouger';
    }

    const instructions: string[] = [];

    // Pitch (avant/arrière)
    if (pitch > threshold!) {
      instructions.push('Relevez le bas du téléphone');
    } else if (pitch < -threshold!) {
      instructions.push('Abaissez le bas du téléphone');
    }

    // Roll (gauche/droite)  
    if (roll > threshold!) {
      instructions.push('Inclinez à gauche');
    } else if (roll < -threshold!) {
      instructions.push('Inclinez à droite');
    }

    if (instructions.length > 0) {
      return instructions.join(' • ');
    }

    return 'Tenez le téléphone droit face au compteur';
  }, [threshold]);

  // Démarrer les capteurs
  const startSensors = useCallback(async () => {
    try {
      const [accelAvailable, gyroAvailable] = await Promise.all([
        Accelerometer.isAvailableAsync(),
        Gyroscope.isAvailableAsync(),
      ]);

      if (!accelAvailable) {
        setState(prev => ({ ...prev, message: '⚠️ Accéléromètre non disponible' }));
        return;
      }

      // Configurer l'intervalle de mise à jour
      Accelerometer.setUpdateInterval(updateInterval!);
      if (gyroAvailable) {
        Gyroscope.setUpdateInterval(updateInterval!);
      }

      // S'abonner au gyroscope (si disponible)
      if (gyroAvailable) {
        Gyroscope.addListener((data) => {
          lastGyroData.current = data;
        });
      }

      // S'abonner à l'accéléromètre
      Accelerometer.addListener((data) => {
        const { pitch, roll } = calculateAngles(data);
        const gyro = lastGyroData.current;
        const isCurrentlyStable = checkStability(pitch, roll, gyro);
        const score = calculateStabilityScore(pitch, roll, gyro);
        const message = getMessage(pitch, roll, isCurrentlyStable, gyro);

        // Gestion du timing de stabilité
        const now = Date.now();
        if (isCurrentlyStable) {
          if (!stableStartTime.current) {
            stableStartTime.current = now;
          }
        } else {
          stableStartTime.current = null;
        }

        // Stable seulement si maintenu assez longtemps
        const hasBeenStableLongEnough =
          stableStartTime.current !== null &&
          (now - stableStartTime.current) >= minStableDuration!;

        setState({
          isStable: hasBeenStableLongEnough,
          pitch: Math.round(pitch * 10) / 10,
          roll: Math.round(roll * 10) / 10,
          yaw: 0,
          stabilityScore: score,
          message,
        });
      });

      setIsActive(true);
    } catch (error) {
      console.error('Erreur capteurs:', error);
      setState(prev => ({ ...prev, message: '⚠️ Erreur capteurs' }));
    }
  }, [updateInterval, minStableDuration, calculateAngles, checkStability, calculateStabilityScore, getMessage]);

  // Arrêter les capteurs
  const stopSensors = useCallback(() => {
    Accelerometer.removeAllListeners();
    Gyroscope.removeAllListeners();
    setIsActive(false);
    stableStartTime.current = null;
  }, []);

  // Nettoyer au démontage
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
