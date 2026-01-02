/**
 * Écran de capture Photo APRÈS
 * Avec timer, mode fantôme et stabilisation
 */

import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useCamera, useStabilization } from '@/hooks';
import { StabilizationBar, AlignmentFrame, GhostOverlay } from '@/components/camera';
import { useVEAStore } from '@/stores/veaStore';

// Temps recommandé en secondes (3 minutes)
const RECOMMENDED_TIME = 180;

export default function PhotoApresScreen() {
  const router = useRouter();
  const veaStore = useVEAStore();
  const { captureState } = veaStore;
  
  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mode fantôme
  const [showGhost, setShowGhost] = useState(true);

  // Hooks personnalisés
  const camera = useCamera();
  const stabilization = useStabilization({
    threshold: 5,
    minStableDuration: 300,
  });

  // Démarrer le timer au montage
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    veaStore.startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Mettre à jour le temps écoulé dans le store
  useEffect(() => {
    veaStore.updateElapsedTime(elapsedTime);
  }, [elapsedTime]);

  // Démarrer les capteurs au montage
  useEffect(() => {
    stabilization.startSensors();
    
    return () => {
      stabilization.stopSensors();
    };
  }, []);

  // Demander les permissions si nécessaire
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
  const progressPercent = Math.min((elapsedTime / RECOMMENDED_TIME) * 100, 100);

  const handleCapture = async () => {
    // Avertir si le temps est court
    if (elapsedTime < 60) {
      Alert.alert(
        'Temps court',
        'Moins d\'une minute s\'est écoulée. Pour un test fiable, attendez au moins 3 minutes.\n\nVoulez-vous continuer quand même ?',
        [
          { text: 'Attendre', style: 'cancel' },
          { text: 'Continuer', onPress: () => capturePhoto() },
        ]
      );
      return;
    }

    if (!stabilization.isStable) {
      Alert.alert(
        'Téléphone instable',
        'Stabilisez votre téléphone avant de capturer.',
        [{ text: 'OK' }]
      );
      return;
    }

    capturePhoto();
  };

  const capturePhoto = async () => {
    const photo = await camera.takePhoto({
      pitch: stabilization.pitch,
      roll: stabilization.roll,
      yaw: stabilization.yaw,
    });

    if (photo) {
      // Arrêter le timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      veaStore.stopTimer();
      
      // Sauvegarder dans le store
      veaStore.setPhotoAfter(photo);
      
      // Naviguer vers le résultat
      router.replace('/analyse/resultat');
    } else {
      Alert.alert('Erreur', 'Échec de la capture. Réessayez.');
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
        { text: 'Continuer le test', style: 'cancel' },
        { 
          text: 'Abandonner', 
          style: 'destructive',
          onPress: () => {
            veaStore.resetSession();
            router.back();
          }
        },
      ]
    );
  };

  // Vérifier qu'on a bien la photo avant
  const photoBeforeUri = captureState.photoBefore?.uri;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepIndicator}>Étape 2/2</Text>
          <Text style={styles.title}>Photo APRÈS</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Timer */}
      <View style={[
        styles.timerContainer,
        isTimeRecommended && styles.timerContainerReady
      ]}>
        <Text style={styles.timerLabel}>⏱️ Temps écoulé</Text>
        <Text style={[
          styles.timerValue,
          isTimeRecommended && styles.timerValueReady
        ]}>
          {formatTime(elapsedTime)}
        </Text>
        
        {!isTimeRecommended ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercent}%` }
                ]} 
              />
            </View>
            <Text style={styles.timerHint}>
              Recommandé : {formatTime(RECOMMENDED_TIME - elapsedTime)} restantes
            </Text>
          </View>
        ) : (
          <Text style={styles.timerReady}>✓ Temps recommandé atteint !</Text>
        )}
      </View>

      {/* Zone caméra */}
      <View style={styles.cameraContainer}>
        {camera.hasPermission && (
          <CameraView
            ref={camera.cameraRef}
            style={styles.camera}
            facing={camera.cameraType}
            onCameraReady={camera.onCameraReady}
          />
        )}

        {/* Mode fantôme */}
        {showGhost && photoBeforeUri && (
          <GhostOverlay
            imageUri={photoBeforeUri}
            initialOpacity={0.3}
          />
        )}

        {/* Cadre d'alignement */}
        <View style={styles.frameOverlay}>
          <AlignmentFrame
            isStable={stabilization.isStable}
            isAligned={isTimeRecommended}
            label="Alignez comme la 1ère photo"
          />
        </View>
      </View>

      {/* Barre de stabilisation */}
      <View style={styles.stabilizationContainer}>
        <StabilizationBar
          score={stabilization.stabilityScore}
          isStable={stabilization.isStable}
          pitch={stabilization.pitch}
          roll={stabilization.roll}
          message={stabilization.message}
        />
      </View>

      {/* Bouton de capture */}
      <View style={styles.captureContainer}>
        <TouchableOpacity
          style={[
            styles.captureButton,
            stabilization.isStable && isTimeRecommended && styles.captureButtonReady,
            camera.isCapturing && styles.captureButtonDisabled,
          ]}
          onPress={handleCapture}
          disabled={camera.isCapturing}
          activeOpacity={0.8}
        >
          <View style={[
            styles.captureButtonInner,
            stabilization.isStable && isTimeRecommended && styles.captureButtonInnerReady,
          ]} />
        </TouchableOpacity>
        <Text style={styles.captureHint}>
          {camera.isCapturing 
            ? 'Capture en cours...' 
            : !stabilization.isStable
              ? 'Stabilisez le téléphone'
              : !isTimeRecommended
                ? 'Vous pouvez capturer (temps court)'
                : 'Appuyez pour capturer'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: FontSizes.xl,
  },
  headerCenter: {
    alignItems: 'center',
  },
  stepIndicator: {
    color: Colors.primary,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  title: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  timerContainerReady: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 2,
    borderColor: Colors.veaOk,
  },
  timerLabel: {
    color: '#AAA',
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  timerValue: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerValueReady: {
    color: Colors.veaOk,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  timerHint: {
    color: '#888',
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
  },
  timerReady: {
    color: Colors.veaOk,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  cameraContainer: {
    flex: 1,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  stabilizationContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  captureContainer: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  captureButtonReady: {
    borderColor: Colors.veaOk,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
  },
  captureButtonInnerReady: {
    backgroundColor: Colors.veaOk,
  },
  captureHint: {
    color: '#888',
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
