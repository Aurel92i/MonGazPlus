/**
 * Écran de capture Photo APRÈS
 * 
 * Mode paysage avec :
 * - Timer qui tourne en fond
 * - Bouton "Reprendre une photo" pour déclencher la capture
 * - Capture automatique après 3s de stabilité (une fois activé)
 * - Temps synchronisé avec le store
 */

import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CameraView } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Accelerometer } from 'expo-sensors';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useCamera } from '@/hooks';
import { BorderFrame } from '@/components/camera';
import { useVEAStore } from '@/stores/veaStore';

// Temps recommandé en secondes (3 minutes)
const RECOMMENDED_TIME = 180;
// Temps de stabilité requis pour capture auto (ms) - 3 SECONDES
const STABILITY_DURATION = 3000;
// Seuil de mouvement
const MOVEMENT_THRESHOLD = 0.05;

export default function PhotoApresScreen() {
  const router = useRouter();
  const veaStore = useVEAStore();
  const { captureState, frameSettings } = veaStore;
  const camera = useCamera();
  
  // Timer principal
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // État du mode capture
  const [readyToCapture, setReadyToCapture] = useState(false);
  
  // Stabilité pour capture auto
  const [isStable, setIsStable] = useState(false);
  const [stabilityProgress, setStabilityProgress] = useState(0);
  const stableStartRef = useRef<number | null>(null);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
  
  // État de capture
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Opacité du fantôme
  const [ghostOpacity, setGhostOpacity] = useState(0.4);

  // Calculer le zoom normalisé (0-1) depuis le store (1-5)
  const zoomValue = (frameSettings.zoom - 1) / 4;

  // Forcer le mode paysage
  useEffect(() => {
    const lockLandscape = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
      );
    };
    lockLandscape();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Timer - tourne en fond dès le montage
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1;
        // Synchroniser avec le store à chaque seconde
        veaStore.updateElapsedTime(newTime);
        return newTime;
      });
    }, 1000);

    veaStore.startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Détection de stabilité via accéléromètre (seulement si readyToCapture)
  useEffect(() => {
    if (!readyToCapture) return;
    
    let subscription: any;

    const startAccelerometer = async () => {
      const available = await Accelerometer.isAvailableAsync();
      if (!available) return;

      Accelerometer.setUpdateInterval(100);
      
      subscription = Accelerometer.addListener((data) => {
        const { x, y, z } = data;
        const last = lastAccelRef.current;
        
        // Calculer le mouvement
        const movement = Math.sqrt(
          Math.pow(x - last.x, 2) +
          Math.pow(y - last.y, 2) +
          Math.pow(z - last.z, 2)
        );
        
        lastAccelRef.current = { x, y, z };
        
        const now = Date.now();
        
        if (movement < MOVEMENT_THRESHOLD) {
          // Téléphone stable
          if (!stableStartRef.current) {
            stableStartRef.current = now;
          }
          
          const stableDuration = now - stableStartRef.current;
          const progress = Math.min(stableDuration / STABILITY_DURATION, 1);
          setStabilityProgress(progress);
          
          if (stableDuration >= STABILITY_DURATION) {
            setIsStable(true);
          }
        } else {
          // Mouvement détecté
          stableStartRef.current = null;
          setStabilityProgress(0);
          setIsStable(false);
        }
      });
    };

    startAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      Accelerometer.removeAllListeners();
    };
  }, [readyToCapture]);

  // Capture automatique quand stable (seulement si readyToCapture actif)
  useEffect(() => {
    if (isStable && readyToCapture && !isCapturing) {
      // Vibration pour indiquer la capture
      Vibration.vibrate(200);
      handleAutoCapture();
    }
  }, [isStable, readyToCapture, isCapturing]);

  // Permissions
  useEffect(() => {
    if (camera.hasPermission === null) {
      camera.askPermission();
    }
  }, [camera.hasPermission]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeRecommended = elapsedTime >= RECOMMENDED_TIME;

  // Activer le mode capture
  const handleReadyToCapture = () => {
    if (elapsedTime < 30) {
      Alert.alert(
        'Temps très court',
        'Moins de 30 secondes. Pour un test fiable, attendez au moins 3 minutes.',
        [
          { text: 'Attendre', style: 'cancel' },
          { text: 'Continuer', onPress: () => setReadyToCapture(true) },
        ]
      );
      return;
    }
    setReadyToCapture(true);
  };

  // Annuler le mode capture
  const handleCancelCapture = () => {
    setReadyToCapture(false);
    setIsStable(false);
    setStabilityProgress(0);
    stableStartRef.current = null;
  };

  const handleAutoCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    
    // Sauvegarder le temps final dans le store AVANT la capture
    veaStore.updateElapsedTime(elapsedTime);
    
    const photo = await camera.takePhoto();

    if (photo) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      veaStore.stopTimer();
      veaStore.setPhotoAfter(photo);
      ScreenOrientation.unlockAsync();
      router.replace('/analyse/resultat');
    } else {
      Alert.alert('Erreur', 'Échec de la capture. Réessayez.');
      setIsCapturing(false);
      setReadyToCapture(false);
    }
  };

  const handleManualCapture = () => {
    if (!readyToCapture) {
      handleReadyToCapture();
      return;
    }
    handleAutoCapture();
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    Alert.alert(
      'Abandonner le test ?',
      'Le test sera annulé et vous devrez recommencer.',
      [
        { text: 'Continuer', style: 'cancel' },
        { 
          text: 'Abandonner', 
          style: 'destructive',
          onPress: () => {
            veaStore.resetSession();
            ScreenOrientation.unlockAsync();
            router.back();
          }
        },
      ]
    );
  };

  const adjustOpacity = (delta: number) => {
    setGhostOpacity((prev) => Math.max(0.1, Math.min(0.7, prev + delta)));
  };

  const photoBeforeUri = captureState.photoBefore?.uri;

  // Couleur selon l'état
  const getFrameStatus = () => {
    if (isCapturing) return 'aligned';
    if (!readyToCapture) return 'not_aligned';
    if (isStable) return 'aligned';
    if (stabilityProgress > 0.3) return 'almost_aligned';
    return 'not_aligned';
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <View style={styles.cameraContainer}>
        {camera.hasPermission && (
          <CameraView
            ref={camera.cameraRef}
            style={styles.camera}
            facing={camera.cameraType}
            onCameraReady={camera.onCameraReady}
            zoom={zoomValue}
          />
        )}

        {/* Mode fantôme */}
        {photoBeforeUri && !isCapturing && (
          <View style={[styles.ghostOverlay, { opacity: ghostOpacity }]}>
            <Image
              source={{ uri: photoBeforeUri }}
              style={styles.ghostImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Cadre */}
        <BorderFrame
          status={getFrameStatus()}
          instructions={
            isCapturing 
              ? "📸 Capture en cours..." 
              : !readyToCapture
                ? "Appuyez sur le bouton quand vous êtes prêt"
                : isStable 
                  ? "✓ Capture automatique..." 
                  : "Restez immobile 3 secondes"
          }
        />

        {/* Bouton central "Reprendre une photo" */}
        {!readyToCapture && !isCapturing && (
          <View style={styles.readyButtonContainer}>
            <TouchableOpacity
              style={[
                styles.readyButton,
                isTimeRecommended && styles.readyButtonGreen
              ]}
              onPress={handleReadyToCapture}
              activeOpacity={0.8}
            >
              <Text style={styles.readyButtonIcon}>📸</Text>
              <Text style={styles.readyButtonText}>
                Reprendre une photo
              </Text>
              <Text style={styles.readyButtonHint}>
                {isTimeRecommended 
                  ? '✓ Temps recommandé atteint'
                  : `Temps écoulé : ${formatTime(elapsedTime)}`
                }
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Indicateur de stabilité (visible seulement en mode capture) */}
        {readyToCapture && !isCapturing && (
          <View style={styles.stabilityIndicator}>
            <View style={styles.stabilityBar}>
              <View 
                style={[
                  styles.stabilityFill,
                  { 
                    width: `${stabilityProgress * 100}%`,
                    backgroundColor: stabilityProgress >= 1 ? Colors.veaOk : Colors.primary,
                  }
                ]} 
              />
            </View>
            <Text style={styles.stabilityText}>
              {stabilityProgress >= 1 ? '✓ Stable !' : 'Restez immobile...'}
            </Text>
            
            {/* Bouton annuler */}
            <TouchableOpacity 
              style={styles.cancelCaptureButton}
              onPress={handleCancelCapture}
            >
              <Text style={styles.cancelCaptureText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity 
            onPress={handleClose} 
            style={styles.closeButton}
            disabled={isCapturing}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          {/* Timer - toujours visible et actif */}
          <View style={[
            styles.timerBadge,
            isTimeRecommended && styles.timerBadgeReady
          ]}>
            <Text style={styles.timerIcon}>⏱️</Text>
            <Text style={[
              styles.timerText,
              isTimeRecommended && styles.timerTextReady
            ]}>
              {formatTime(elapsedTime)}
            </Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.stepText}>PHOTO APRÈS</Text>
            <Text style={styles.stepNumber}>Étape 2/2</Text>
          </View>
        </View>

        {/* Zoom indicator (verrouillé) */}
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>🔒 Zoom {frameSettings.zoom.toFixed(1)}x</Text>
        </View>

        {/* Contrôles opacité */}
        {!isCapturing && (
          <View style={styles.opacityControls}>
            <Text style={styles.opacityLabel}>👻</Text>
            <TouchableOpacity 
              style={styles.opacityBtn} 
              onPress={() => adjustOpacity(0.1)}
            >
              <Text style={styles.opacityBtnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.opacityValue}>{Math.round(ghostOpacity * 100)}%</Text>
            <TouchableOpacity 
              style={styles.opacityBtn} 
              onPress={() => adjustOpacity(-0.1)}
            >
              <Text style={styles.opacityBtnText}>−</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Barre de temps en bas (quand pas en mode capture) */}
        {!readyToCapture && !isTimeRecommended && !isCapturing && (
          <View style={styles.timeHintBar}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(elapsedTime / RECOMMENDED_TIME) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.timeHintText}>
              Recommandé : encore {formatTime(RECOMMENDED_TIME - elapsedTime)}
            </Text>
          </View>
        )}

        {/* Overlay de capture */}
        {isCapturing && (
          <View style={styles.capturingOverlay}>
            <Text style={styles.capturingText}>📸</Text>
            <Text style={styles.capturingLabel}>Capture en cours...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  
  // Fantôme
  ghostOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  ghostImage: {
    width: '100%',
    height: '100%',
  },

  // Bouton "Reprendre une photo" central
  readyButtonContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  readyButton: {
    backgroundColor: 'rgba(249, 115, 22, 0.95)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
    minWidth: 250,
  },
  readyButtonGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.95)',
    borderColor: Colors.veaOk,
  },
  readyButtonIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  readyButtonText: {
    color: '#FFF',
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  readyButtonHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },

  // Indicateur de stabilité
  stabilityIndicator: {
    position: 'absolute',
    bottom: 60,
    left: 90,
    right: 90,
    alignItems: 'center',
    zIndex: 25,
  },
  stabilityBar: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  stabilityFill: {
    height: '100%',
    borderRadius: 5,
  },
  stabilityText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginTop: Spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cancelCaptureButton: {
    marginTop: Spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  cancelCaptureText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },

  // Header
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  timerBadgeReady: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderWidth: 1,
    borderColor: Colors.veaOk,
  },
  timerIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  timerText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerTextReady: {
    color: Colors.veaOk,
  },
  headerInfo: {
    alignItems: 'center',
  },
  stepText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  stepNumber: {
    color: Colors.primary,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },

  // Zoom indicator
  zoomIndicator: {
    position: 'absolute',
    top: 50,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 20,
  },
  zoomText: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },

  // Contrôles opacité
  opacityControls: {
    position: 'absolute',
    left: Spacing.md,
    top: 70,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    zIndex: 25,
  },
  opacityLabel: {
    fontSize: 20,
    marginBottom: 4,
  },
  opacityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  opacityBtnText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  opacityValue: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginVertical: 2,
  },

  // Barre de temps
  timeHintBar: {
    position: 'absolute',
    bottom: 0,
    left: 70,
    right: 70,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: Spacing.sm,
    zIndex: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  timeHintText: {
    color: '#AAA',
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },

  // Overlay capture
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  capturingText: {
    fontSize: 80,
  },
  capturingLabel: {
    color: '#FFF',
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
});
