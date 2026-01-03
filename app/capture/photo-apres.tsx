/**
 * Écran de capture Photo APRÈS
 * 
 * Interface épurée avec :
 * - Header compact avec chronomètre XXL
 * - Zoom info rehaussé à gauche
 * - Contrôles fantôme rehaussés à droite
 * - Cadre ⊓ avec arcs de coin
 * - Footer compact avec bouton proéminent
 */

import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CameraView } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Accelerometer } from 'expo-sensors';
import { useCamera } from '@/hooks';
import { BorderFrame } from '@/components/camera';
import { useVEAStore } from '@/stores/veaStore';

// Configuration
const RECOMMENDED_TIME = 180;
const THRESHOLD_ALMOST_ALIGNED = 1.5;
const THRESHOLD_ALIGNED = 3;
const THRESHOLD_SUPERPOSED = 5;
const MOVEMENT_THRESHOLD = 0.03;

type AlignmentStatus = 'not_aligned' | 'almost_aligned' | 'aligned' | 'superposed';

export default function PhotoApresScreen() {
  const router = useRouter();
  const veaStore = useVEAStore();
  const { captureState, frameSettings } = veaStore;
  const camera = useCamera();
  
  // États
  const [elapsedTime, setElapsedTime] = useState(0);
  const [readyToCapture, setReadyToCapture] = useState(false);
  const [alignmentStatus, setAlignmentStatus] = useState<AlignmentStatus>('not_aligned');
  const [stabilityDuration, setStabilityDuration] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [ghostOpacity, setGhostOpacity] = useState(0.4);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stableStartRef = useRef<number | null>(null);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });

  // Valeurs calculées
  const zoomValue = (frameSettings.zoom - 1) / 4;
  const isTimeRecommended = elapsedTime >= RECOMMENDED_TIME;
  const photoBeforeUri = captureState.photoBefore?.uri;
  const timeRemaining = Math.max(0, RECOMMENDED_TIME - elapsedTime);
  const progressPercent = Math.min((elapsedTime / RECOMMENDED_TIME) * 100, 100);

  // ═══════════════════════════════════════════════════════════
  // EFFETS
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    return () => { ScreenOrientation.unlockAsync(); };
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1;
        veaStore.updateElapsedTime(newTime);
        return newTime;
      });
    }, 1000);
    veaStore.startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!readyToCapture) {
      setAlignmentStatus('not_aligned');
      setStabilityDuration(0);
      return;
    }
    
    let subscription: any;

    const startAccelerometer = async () => {
      const available = await Accelerometer.isAvailableAsync();
      if (!available) return;

      Accelerometer.setUpdateInterval(50);
      
      subscription = Accelerometer.addListener((data) => {
        const { x, y, z } = data;
        const last = lastAccelRef.current;
        
        const movement = Math.sqrt(
          Math.pow(x - last.x, 2) + Math.pow(y - last.y, 2) + Math.pow(z - last.z, 2)
        );
        
        lastAccelRef.current = { x, y, z };
        const now = Date.now();
        
        if (movement < MOVEMENT_THRESHOLD) {
          if (!stableStartRef.current) stableStartRef.current = now;
          
          const duration = (now - stableStartRef.current) / 1000;
          setStabilityDuration(duration);
          
          if (duration >= THRESHOLD_SUPERPOSED) setAlignmentStatus('superposed');
          else if (duration >= THRESHOLD_ALIGNED) setAlignmentStatus('aligned');
          else if (duration >= THRESHOLD_ALMOST_ALIGNED) setAlignmentStatus('almost_aligned');
          else setAlignmentStatus('not_aligned');
        } else {
          stableStartRef.current = null;
          setStabilityDuration(0);
          setAlignmentStatus('not_aligned');
        }
      });
    };

    startAccelerometer();
    return () => {
      if (subscription) subscription.remove();
      Accelerometer.removeAllListeners();
    };
  }, [readyToCapture]);

  useEffect(() => {
    if (alignmentStatus === 'superposed' && readyToCapture && !isCapturing) {
      Vibration.vibrate([0, 100, 100, 100]);
      handleCapture();
    }
  }, [alignmentStatus, readyToCapture, isCapturing]);

  useEffect(() => {
    if (camera.hasPermission === null) camera.askPermission();
  }, [camera.hasPermission]);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      if (timerRef.current) clearInterval(timerRef.current);
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

  const handleManualCapture = () => {
    if (alignmentStatus === 'aligned' || alignmentStatus === 'superposed') {
      handleCapture();
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Abandonner le test ?',
      'Le test sera annulé et vous devrez recommencer.',
      [
        { text: 'Continuer', style: 'cancel' },
        { 
          text: 'Abandonner', 
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            veaStore.resetSession();
            ScreenOrientation.unlockAsync();
            router.back();
          }
        },
      ]
    );
  };

  const adjustOpacity = (delta: number) => {
    setGhostOpacity((prev) => Math.max(0.1, Math.min(0.8, prev + delta)));
  };

  const getAlignmentProgress = () => {
    if (!readyToCapture) return 0;
    return Math.min(stabilityDuration / THRESHOLD_SUPERPOSED, 1);
  };

  // ═══════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* CAMÉRA */}
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

        {/* Fantôme */}
        {photoBeforeUri && !isCapturing && (
          <View style={[styles.ghostOverlay, { opacity: ghostOpacity }]}>
            <Image source={{ uri: photoBeforeUri }} style={styles.ghostImage} resizeMode="cover" />
          </View>
        )}

        {/* Guide ⊓ avec coins */}
        <BorderFrame 
          color="#4ADE80" 
          thickness={4} 
          margin={100} 
          sideHeightPercent={55} 
          topOffset={55}
        />
      </View>

      {/* HEADER COMPACT */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn} disabled={isCapturing}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        
        {/* Chronomètre XXL */}
        <View style={[styles.timerContainer, isTimeRecommended && styles.timerContainerReady]}>
          <Text style={[styles.timerText, isTimeRecommended && styles.timerTextReady]}>
            {formatTime(elapsedTime)}
          </Text>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>PHOTO APRÈS</Text>
          <Text style={styles.stepText}>Étape 2/2</Text>
        </View>
      </View>

      {/* ZOOM INFO - REHAUSSÉ */}
      <View style={styles.zoomInfo}>
        <Text style={styles.zoomIcon}>🔍</Text>
        <Text style={styles.zoomText}>{frameSettings.zoom.toFixed(1)}x</Text>
      </View>

      {/* CONTRÔLES FANTÔME - REHAUSSÉS */}
      {!isCapturing && (
        <View style={styles.ghostControls}>
          <Text style={styles.ghostIcon}>👻</Text>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => adjustOpacity(0.1)}>
            <Text style={styles.ghostBtnText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.ghostValue}>{Math.round(ghostOpacity * 100)}%</Text>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => adjustOpacity(-0.1)}>
            <Text style={styles.ghostBtnText}>−</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FOOTER COMPACT */}
      <View style={styles.footer}>
        
        {/* Barre de progression (si pas encore 3min) */}
        {!isTimeRecommended && !readyToCapture && !isCapturing && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>Encore {formatTime(timeRemaining)}</Text>
          </View>
        )}

        {/* Message temps atteint */}
        {isTimeRecommended && !readyToCapture && !isCapturing && (
          <Text style={styles.readyText}>✓ Temps recommandé atteint</Text>
        )}

        {/* BOUTON PRINCIPAL */}
        {!readyToCapture && !isCapturing && (
          <TouchableOpacity
            style={[styles.mainButton, isTimeRecommended && styles.mainButtonGreen]}
            onPress={handleReadyToCapture}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonIcon}>📸</Text>
            <Text style={styles.mainButtonText}>Reprendre une photo</Text>
          </TouchableOpacity>
        )}

        {/* Mode capture - Alignement */}
        {readyToCapture && !isCapturing && (
          <View style={styles.captureMode}>
            <View style={styles.alignmentSection}>
              <View style={styles.alignmentBar}>
                <View 
                  style={[
                    styles.alignmentFill,
                    { 
                      width: `${getAlignmentProgress() * 100}%`,
                      backgroundColor: 
                        alignmentStatus === 'aligned' || alignmentStatus === 'superposed' 
                          ? '#4ADE80' 
                          : alignmentStatus === 'almost_aligned' ? '#F97316' : '#EF4444',
                    }
                  ]} 
                />
              </View>
              <Text style={[
                styles.alignmentText,
                { color: (alignmentStatus === 'aligned' || alignmentStatus === 'superposed') ? '#4ADE80' : '#FFF' }
              ]}>
                {alignmentStatus === 'superposed' ? '✓ SUPERPOSÉ !' : 
                 alignmentStatus === 'aligned' ? '✓ ALIGNÉ' :
                 alignmentStatus === 'almost_aligned' ? 'Immobile...' : 'Alignez'}
              </Text>
            </View>

            <View style={styles.captureButtons}>
              {(alignmentStatus === 'aligned' || alignmentStatus === 'superposed') && (
                <TouchableOpacity style={styles.captureBtn} onPress={handleManualCapture}>
                  <Text style={styles.captureBtnText}>📸 Capturer</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelCapture}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* OVERLAY CAPTURE */}
      {isCapturing && (
        <View style={styles.capturingOverlay}>
          <Text style={styles.capturingIcon}>📸</Text>
          <Text style={styles.capturingText}>Capture...</Text>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // CAMÉRA
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  camera: {
    flex: 1,
  },
  ghostOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  ghostImage: {
    width: '100%',
    height: '100%',
  },

  // HEADER COMPACT
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 100,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  timerContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timerContainerReady: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: '#4ADE80',
  },
  timerText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerTextReady: {
    color: '#4ADE80',
  },
  titleContainer: {
    alignItems: 'flex-end',
  },
  titleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    color: '#F97316',
    fontSize: 11,
    fontWeight: '600',
  },

  // ZOOM INFO - REHAUSSÉ
  zoomInfo: {
    position: 'absolute',
    left: 16,
    top: 70,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 8,
    zIndex: 50,
  },
  zoomIcon: {
    fontSize: 18,
  },
  zoomText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },

  // CONTRÔLES FANTÔME - REHAUSSÉS
  ghostControls: {
    position: 'absolute',
    right: 16,
    top: 70,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 8,
    zIndex: 50,
  },
  ghostIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  ghostBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  ghostBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  ghostValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginVertical: 2,
  },

  // FOOTER COMPACT
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressSection: {
    flex: 1,
    marginRight: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 4,
  },
  readyText: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // BOUTON PRINCIPAL PROÉMINENT
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FB923C',
  },
  mainButtonGreen: {
    backgroundColor: '#22C55E',
    borderColor: '#4ADE80',
  },
  mainButtonIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // MODE CAPTURE
  captureMode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alignmentSection: {
    flex: 1,
    marginRight: 16,
  },
  alignmentBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  alignmentFill: {
    height: '100%',
    borderRadius: 4,
  },
  alignmentText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  captureButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  captureBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  captureBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cancelBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },

  // OVERLAY CAPTURE
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  capturingIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  capturingText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
});
