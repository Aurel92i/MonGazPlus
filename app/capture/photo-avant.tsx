/**
 * Écran de capture Photo AVANT
 * 
 * Mode paysage avec :
 * - Zoom ajustable (slider) - corrigé pour répondre immédiatement
 * - Cadre aux 3/4 supérieurs
 * - Sauvegarde des paramètres de cadrage pour photo 2
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CameraView } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useCamera } from '@/hooks';
import { BorderFrame } from '@/components/camera';
import { useVEAStore } from '@/stores/veaStore';

export default function PhotoAvantScreen() {
  const router = useRouter();
  const veaStore = useVEAStore();
  const camera = useCamera();
  
  const [showTips, setShowTips] = useState(true);
  const [zoom, setZoom] = useState(0); // 0 = pas de zoom, 1 = max zoom
  const [displayZoom, setDisplayZoom] = useState(1); // Pour affichage
  
  // Forcer le mode paysage au montage
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

  // Demander les permissions au montage
  useEffect(() => {
    if (camera.hasPermission === null) {
      camera.askPermission();
    }
  }, [camera.hasPermission]);

  // Masquer les conseils après 4 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTips(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Mise à jour du zoom avec callback
  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
    setDisplayZoom(1 + value * 4); // 1x à 5x
  }, []);

  // Boutons +/- pour le zoom
  const incrementZoom = useCallback(() => {
    const newZoom = Math.min(1, zoom + 0.1);
    setZoom(newZoom);
    setDisplayZoom(1 + newZoom * 4);
  }, [zoom]);

  const decrementZoom = useCallback(() => {
    const newZoom = Math.max(0, zoom - 0.1);
    setZoom(newZoom);
    setDisplayZoom(1 + newZoom * 4);
  }, [zoom]);

  const handleCapture = async () => {
    // Sauvegarder le niveau de zoom pour la photo 2
    veaStore.setZoom(displayZoom);
    
    const photo = await camera.takePhoto();

    if (photo) {
      veaStore.setPhotoBefore(photo);
      router.replace('/capture/photo-apres');
    } else {
      Alert.alert('Erreur', 'Échec de la capture. Réessayez.');
    }
  };

  const handleClose = () => {
    veaStore.resetSession();
    ScreenOrientation.unlockAsync();
    router.back();
  };

  // Écran de demande de permission
  if (camera.hasPermission === false) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
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
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Zone caméra plein écran */}
      <View style={styles.cameraContainer}>
        {camera.hasPermission && (
          <CameraView
            ref={camera.cameraRef}
            style={styles.camera}
            facing={camera.cameraType}
            onCameraReady={camera.onCameraReady}
            zoom={zoom}
          />
        )}

        {/* Cadre d'alignement */}
        <BorderFrame
          status="aligned"
          instructions="Cadrez le compteur avec le zoom"
        />

        {/* Header overlay */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.stepText}>PHOTO AVANT</Text>
            <Text style={styles.stepNumber}>Étape 1/2</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Conseils initiaux */}
        {showTips && (
          <View style={styles.tipsOverlay}>
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Cadrez le compteur</Text>
              <Text style={styles.tipsText}>
                Utilisez le zoom pour ajuster{'\n'}
                Alignez le compteur dans le cadre vert
              </Text>
            </View>
          </View>
        )}

        {/* Contrôle de zoom (côté gauche) */}
        <View style={styles.zoomControlContainer}>
          <Text style={styles.zoomLabel}>🔍 Zoom</Text>
          <Text style={styles.zoomValue}>{displayZoom.toFixed(1)}x</Text>
          
          <TouchableOpacity 
            style={styles.zoomBtnLarge}
            onPress={incrementZoom}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomBtnText}>+</Text>
          </TouchableOpacity>
          
          <View style={styles.zoomSliderContainer}>
            <Slider
              style={styles.zoomSlider}
              minimumValue={0}
              maximumValue={1}
              value={zoom}
              onValueChange={handleZoomChange}
              minimumTrackTintColor={Colors.veaOk}
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor={Colors.veaOk}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.zoomBtnLarge}
            onPress={decrementZoom}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomBtnText}>−</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton de capture (côté droit) */}
        <View style={styles.captureZone}>
          <TouchableOpacity
            style={[
              styles.captureButton,
              camera.isCapturing && styles.captureButtonDisabled,
            ]}
            onPress={handleCapture}
            disabled={camera.isCapturing || !camera.isReady}
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <Text style={styles.captureHint}>Capturer</Text>
        </View>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  placeholder: {
    width: 36,
  },

  // Tips
  tipsOverlay: {
    position: 'absolute',
    bottom: '25%',
    left: 80,
    right: 100,
    alignItems: 'center',
    zIndex: 15,
  },
  tipsCard: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.veaOk,
  },
  tipsTitle: {
    color: Colors.veaOk,
    fontSize: FontSizes.md,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  tipsText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Zoom controls (gauche)
  zoomControlContainer: {
    position: 'absolute',
    left: Spacing.md,
    top: 60,
    bottom: 30,
    width: 65,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 25,
  },
  zoomLabel: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  zoomValue: {
    color: Colors.veaOk,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  zoomSliderContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  zoomSlider: {
    width: 140,
    height: 40,
    transform: [{ rotate: '-90deg' }],
  },
  zoomBtnLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
  },

  // Capture (droite)
  captureZone: {
    position: 'absolute',
    right: Spacing.md,
    top: 60,
    bottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    zIndex: 25,
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.veaOk,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.veaOk,
  },
  captureHint: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },

  // Permission
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
