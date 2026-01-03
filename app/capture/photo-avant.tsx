/**
 * Écran de capture Photo AVANT
 * 
 * Interface épurée avec :
 * - Header compact
 * - Zoom rehaussé à gauche
 * - Cadre ⊓ avec arcs de coin
 * - Bouton capture proéminent
 */

import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CameraView } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';
import Slider from '@react-native-community/slider';
import { useCamera } from '@/hooks';
import { BorderFrame } from '@/components/camera';
import { useVEAStore } from '@/stores/veaStore';

export default function PhotoAvantScreen() {
  const router = useRouter();
  const veaStore = useVEAStore();
  const camera = useCamera();
  
  const [zoom, setZoom] = useState(0);
  const [displayZoom, setDisplayZoom] = useState(1);

  // ═══════════════════════════════════════════════════════════
  // EFFETS
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    return () => { ScreenOrientation.unlockAsync(); };
  }, []);

  useEffect(() => {
    if (camera.hasPermission === null) camera.askPermission();
  }, [camera.hasPermission]);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
    setDisplayZoom(1 + value * 4);
  }, []);

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

  // ═══════════════════════════════════════════════════════════
  // ÉCRAN PERMISSION
  // ═══════════════════════════════════════════════════════════

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
          <TouchableOpacity style={styles.permissionButton} onPress={camera.askPermission}>
            <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDU PRINCIPAL
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
            zoom={zoom}
          />
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
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>PHOTO AVANT</Text>
          <Text style={styles.stepText}>Étape 1/2</Text>
        </View>
      </View>

      {/* CONTRÔLES ZOOM - REHAUSSÉ */}
      <View style={styles.zoomControls}>
        <Text style={styles.zoomIcon}>🔍</Text>
        
        <TouchableOpacity style={styles.zoomBtn} onPress={incrementZoom}>
          <Text style={styles.zoomBtnText}>+</Text>
        </TouchableOpacity>
        
        <Text style={styles.zoomValue}>{displayZoom.toFixed(1)}x</Text>
        
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={zoom}
            onValueChange={handleZoomChange}
            minimumTrackTintColor="#4ADE80"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor="#4ADE80"
          />
        </View>
        
        <TouchableOpacity style={styles.zoomBtn} onPress={decrementZoom}>
          <Text style={styles.zoomBtnText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER COMPACT */}
      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          Alignez le cadre vert aux bords du compteur
        </Text>
        
        {/* Bouton capture PROÉMINENT */}
        <TouchableOpacity
          style={[styles.captureBtn, camera.isCapturing && styles.captureBtnDisabled]}
          onPress={handleCapture}
          disabled={camera.isCapturing || !camera.isReady}
          activeOpacity={0.8}
        >
          <View style={styles.captureBtnOuter}>
            <View style={styles.captureBtnInner} />
          </View>
          <Text style={styles.captureBtnText}>Capturer</Text>
        </TouchableOpacity>
      </View>
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

  // HEADER COMPACT
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50, // Réduit de 70 à 50
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

  // CONTRÔLES ZOOM - REHAUSSÉ
  zoomControls: {
    position: 'absolute',
    left: 16,
    top: 70, // Rehaussé : juste sous le header
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 14,
    padding: 10,
    zIndex: 50,
  },
  zoomIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  zoomBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
  },
  zoomBtnText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  zoomValue: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 6,
  },
  sliderContainer: {
    width: 44,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: 80,
    height: 36,
    transform: [{ rotate: '-90deg' }],
  },

  // FOOTER COMPACT
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10, // Réduit de 16 à 10
    paddingHorizontal: 20,
    zIndex: 100,
  },
  footerHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  
  // BOUTON CAPTURE PROÉMINENT
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 6,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4ADE80',
  },
  captureBtnDisabled: {
    opacity: 0.5,
  },
  captureBtnOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  captureBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
  },
  captureBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // PERMISSION
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
});
