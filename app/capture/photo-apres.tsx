/**
 * Écran de capture Photo APRÈS
 * 
 * Mode paysage avec :
 * - Timer qui tourne en fond
 * - Bouton "Reprendre une photo" pour activer le mode capture
 * - Détection d'alignement avec le fantôme (code couleur)
 * - Capture automatique quand superposition détectée
 * - Capture manuelle possible quand aligné (vert)
 */

import { useEffect, useState, useRef, useCallback } from 'react';
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

// Seuils d'alignement (en secondes de stabilité)
const THRESHOLD_ALMOST_ALIGNED = 1.5;  // Orange : presque aligné
const THRESHOLD_ALIGNED = 3;           // Vert : aligné (capture manuelle possible)
const THRESHOLD_SUPERPOSED = 5;        // Capture automatique (chiffres superposés)

// Seuil de mouvement pour l'accéléromètre
const MOVEMENT_THRESHOLD = 0.03;

type AlignmentStatus = 'not_aligned' | 'almost_aligned' | 'aligned' | 'superposed';

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
  
  // Détection d'alignement
  const [alignmentStatus, setAlignmentStatus] = useState<AlignmentStatus>('not_aligned');
  const [stabilityDuration, setStabilityDuration] = useState(0);
  const stableStartRef = useRef<number | null>(null);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
  const alignmentIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Détection de stabilité et alignement via accéléromètre
  useEffect(() => {
    if (!readyToCapture) {
      setAlignmentStatus('not_aligned');
      setStabilityDuration(0);
      return;
    }
    
    let subscription: any;

    const startAccelerometer = async () => {
      const available = await Accelerometer.isAvailableAsync();
      if (!available) {
        // Fallback si accéléromètre non disponible
        console.log('Accéléromètre non disponible');
        return;
      }

      Accelerometer.setUpdateInterval(50); // 20 fps
      
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
          
          const duration = (now - stableStartRef.current) / 1000; // en secondes
          setStabilityDuration(duration);
          
          // Déterminer le statut d'alignement
          if (duration >= THRESHOLD_SUPERPOSED) {
            setAlignmentStatus('superposed');
          } else if (duration >= THRESHOLD_ALIGNED) {
            setAlignmentStatus('aligned');
          } else if (duration >= THRESHOLD_ALMOST_ALIGNED) {
            setAlignmentStatus('almost_aligned');
          } else {
            setAlignmentStatus('not_aligned');
          }
        } else {
          // Mouvement détecté - reset
          stableStartRef.current = null;
          setStabilityDuration(0);
          setAlignmentStatus('not_aligned');
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

  // Capture automatique quand superposé
  useEffect(() => {
    if (alignmentStatus === 'superposed' && readyToCapture && !isCapturing) {
      Vibration.vibrate([0, 100, 100, 100]); // Double vibration
      handleCapture();
    }
  }, [alignmentStatus, readyToCapture, isCapturing]);

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
    setAlignmentStatus('not_aligned');
    setStabilityDuration(0);
    stableStartRef.current = null;
  };

  const handleCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
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
      handleCancelCapture();
    }
  };

  // Capture manuelle (possible seulement si aligné)
  const handleManualCapture = () => {
    if (alignmentStatus === 'aligned' || alignmentStatus === 'superposed') {
      handleCapture();
    }
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

  // Convertir le statut d'alignement pour le BorderFrame
  const getFrameStatus = () => {
    if (isCapturing) return 'aligned';
    if (!readyToCapture) return 'not_aligned';
    
    switch (alignmentStatus) {
      case 'superposed':
      case 'aligned':
        return 'aligned';
      case 'almost_aligned':
        return 'almost_aligned';
      default:
        return 'not_aligned';
    }
  };

  // Message d'instruction selon l'état
  const getInstructionText = () => {
    if (isCapturing) return "📸 Capture en cours...";
    if (!readyToCapture) return "Appuyez sur le bouton quand vous êtes prêt";
    
    switch (alignmentStatus) {
      case 'superposed':
        return "✓ Superposition parfaite - Capture auto !";
      case 'aligned':
        return "✓ Aligné - Capture manuelle possible";
      case 'almost_aligned':
        return "○ Presque aligné - Restez immobile";
      default:
        return "Alignez le fantôme avec le compteur";
    }
  };

  // Progression vers l'alignement (pour la barre)
  const getAlignmentProgress = () => {
    if (!readyToCapture) return 0;
    return Math.min(stabilityDuration / THRESHOLD_SUPERPOSED, 1);
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
          instructions={getInstructionText()}
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

        {/* Indicateur d'alignement (visible en mode capture) */}
        {readyToCapture && !isCapturing && (
          <View style={styles.alignmentIndicator}>
            {/* Barre de progression */}
            <View style={styles.alignmentBar}>
              <View 
                style={[
                  styles.alignmentFill,
                  { 
                    width: `${getAlignmentProgress() * 100}%`,
                    backgroundColor: 
                      alignmentStatus === 'aligned' || alignmentStatus === 'superposed' 
                        ? Colors.veaOk 
                        : alignmentStatus === 'almost_aligned'
                          ? Colors.primary
                          : Colors.veaFuite,
                  }
                ]} 
              />
              {/* Marqueurs */}
              <View style={[styles.marker, { left: `${(THRESHOLD_ALMOST_ALIGNED / THRESHOLD_SUPERPOSED) * 100}%` }]} />
              <View style={[styles.marker, { left: `${(THRESHOLD_ALIGNED / THRESHOLD_SUPERPOSED) * 100}%` }]} />
            </View>
            
            {/* Labels */}
            <View style={styles.alignmentLabels}>
              <Text style={styles.alignmentLabelText}>Alignement</Text>
              <Text style={[
                styles.alignmentStatusText,
                { color: alignmentStatus === 'aligned' || alignmentStatus === 'superposed' ? Colors.veaOk : '#FFF' }
              ]}>
                {alignmentStatus === 'superposed' ? 'SUPERPOSÉ !' : 
                 alignmentStatus === 'aligned' ? 'ALIGNÉ' :
                 alignmentStatus === 'almost_aligned' ? 'PRESQUE...' : 'BOUGÉ'}
              </Text>
            </View>
            
            {/* Bouton capture manuelle (visible seulement si aligné) */}
            {(alignmentStatus === 'aligned' || alignmentStatus === 'superposed') && (
              <TouchableOpacity 
                style={styles.manualCaptureBtn}
                onPress={handleManualCapture}
              >
                <Text style={styles.manualCaptureBtnText}>📸 Capturer maintenant</Text>
              </TouchableOpacity>
            )}
            
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
          
          {/* Timer */}
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

        {/* Zoom indicator */}
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

        {/* Barre de temps en bas - REHAUSSÉE */}
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

  // Indicateur d'alignement
  alignmentIndicator: {
    position: 'absolute',
    bottom: 80, // REHAUSSÉ
    left: 90,
    right: 90,
    alignItems: 'center',
    zIndex: 25,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  alignmentBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  alignmentFill: {
    height: '100%',
    borderRadius: 6,
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  alignmentLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.xs,
  },
  alignmentLabelText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSizes.xs,
  },
  alignmentStatusText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  manualCaptureBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.veaOk,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  manualCaptureBtnText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  cancelCaptureButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  cancelCaptureText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSizes.sm,
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

  // Barre de temps - REHAUSSÉE
  timeHintBar: {
    position: 'absolute',
    bottom: 40, // REHAUSSÉ depuis 0
    left: 70,
    right: 70,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
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
