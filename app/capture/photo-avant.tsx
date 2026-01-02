/**
 * Écran de capture Photo AVANT
 * Avec caméra réelle, stabilisation et cadre d'alignement
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useCamera, useStabilization } from '@/hooks';
import { StabilizationBar, AlignmentFrame } from '@/components/camera';
import { useVEAStore } from '@/stores/veaStore';

export default function PhotoAvantScreen() {
  const router = useRouter();
  const veaStore = useVEAStore();
  
  // Hooks personnalisés
  const camera = useCamera();
  const stabilization = useStabilization({
    threshold: 5, // Un peu plus permissif pour l'UX
    minStableDuration: 300,
  });

  const [showInstructions, setShowInstructions] = useState(true);

  // Démarrer les capteurs au montage
  useEffect(() => {
    stabilization.startSensors();
    
    return () => {
      stabilization.stopSensors();
    };
  }, []);

  // Demander les permissions au montage
  useEffect(() => {
    if (camera.hasPermission === null) {
      camera.askPermission();
    }
  }, [camera.hasPermission]);

  // Masquer les instructions après 3 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCapture = async () => {
    if (!stabilization.isStable) {
      Alert.alert(
        'Téléphone instable',
        'Stabilisez votre téléphone avant de capturer.',
        [{ text: 'OK' }]
      );
      return;
    }

    const photo = await camera.takePhoto({
      pitch: stabilization.pitch,
      roll: stabilization.roll,
      yaw: stabilization.yaw,
    });

    if (photo) {
      // Sauvegarder dans le store
      veaStore.setPhotoBefore(photo);
      
      // Naviguer vers photo après
      router.replace('/capture/photo-apres');
    } else {
      Alert.alert('Erreur', 'Échec de la capture. Réessayez.');
    }
  };

  const handleClose = () => {
    veaStore.resetSession();
    router.back();
  };

  // Écran de demande de permission
  if (camera.hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Accès caméra requis</Text>
          <Text style={styles.permissionText}>
            MonGaz+ a besoin d'accéder à votre caméra pour photographier le compteur.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={camera.askPermission}
          >
            <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepIndicator}>Étape 1/2</Text>
          <Text style={styles.title}>Photo AVANT</Text>
        </View>
        <View style={styles.placeholder} />
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

        {/* Cadre d'alignement */}
        <View style={styles.frameOverlay}>
          <AlignmentFrame
            isStable={stabilization.isStable}
            isAligned={false}
            label="Cadrez les chiffres rouges"
          />
        </View>

        {/* Instructions initiales */}
        {showInstructions && (
          <View style={styles.instructionsOverlay}>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsIcon}>📸</Text>
              <Text style={styles.instructionsTitle}>Cadrez le compteur</Text>
              <Text style={styles.instructionsText}>
                Placez les 3 chiffres rouges (décimales) dans le cadre.
                Stabilisez le téléphone.
              </Text>
            </View>
          </View>
        )}
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
            stabilization.isStable && styles.captureButtonReady,
            camera.isCapturing && styles.captureButtonDisabled,
          ]}
          onPress={handleCapture}
          disabled={camera.isCapturing}
          activeOpacity={0.8}
        >
          <View style={[
            styles.captureButtonInner,
            stabilization.isStable && styles.captureButtonInnerReady,
          ]} />
        </TouchableOpacity>
        <Text style={styles.captureHint}>
          {camera.isCapturing 
            ? 'Capture en cours...' 
            : stabilization.isStable 
              ? 'Appuyez pour capturer' 
              : 'Stabilisez le téléphone'}
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
  },
  instructionsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  instructionsCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    maxWidth: 300,
  },
  instructionsIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  instructionsTitle: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  instructionsText: {
    color: '#AAA',
    fontSize: FontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
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
  },
  // Permission screen
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  permissionTitle: {
    color: '#FFF',
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  permissionText: {
    color: '#AAA',
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: FontSizes.md,
  },
});
