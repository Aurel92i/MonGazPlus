/**
 * Écran de capture pour le relevé d'index
 * 
 * Capture simple en mode portrait
 * avec détection OCR de l'index
 */

import { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useReleveStore } from '@/stores/releveStore';

// Simulation OCR - En production, utiliser Google Cloud Vision ou autre
const simulateOCR = async (photoUri: string): Promise<string> => {
  // Simulation d'un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Génère un index réaliste (entre 10000 et 99999)
  const randomIndex = Math.floor(Math.random() * 89999) + 10000;
  return randomIndex.toString();
};

export default function ReleveCaptureScreen() {
  const router = useRouter();
  const releveStore = useReleveStore();
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo) {
        setCapturedPhoto(photo.uri);
        setIsAnalyzing(true);

        // Analyse OCR
        try {
          const indexValue = await simulateOCR(photo.uri);
          releveStore.setIndex(indexValue, photo.uri);
          
          // Retour à la page de relevé
          router.replace('/(particulier)/releve-index');
        } catch (error) {
          Alert.alert(
            'Erreur de lecture',
            'Impossible de lire l\'index sur la photo. Veuillez réessayer avec une meilleure qualité.',
            [{ text: 'Réessayer', onPress: () => {
              setCapturedPhoto(null);
              setIsAnalyzing(false);
            }}]
          );
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la capture. Réessayez.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setIsAnalyzing(false);
  };

  const handleClose = () => {
    router.back();
  };

  // Permission en attente
  if (!permission) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  // Permission refusée
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Accès caméra requis</Text>
          <Text style={styles.permissionText}>
            Pour photographier votre compteur, autorisez l'accès à la caméra.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Autoriser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Affichage de la photo capturée pendant l'analyse
  if (capturedPhoto && isAnalyzing) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.analyzingText}>Lecture de l'index...</Text>
          <Text style={styles.analyzingSubtext}>Analyse en cours</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* CAMÉRA */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setIsReady(true)}
        enableTorch={flashEnabled}
      />

      {/* GUIDE DE CADRAGE */}
      <View style={styles.frameGuide}>
        <View style={styles.frameTop} />
        <View style={styles.frameMiddle}>
          <View style={styles.frameSide} />
          <View style={styles.frameCenter}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          <View style={styles.frameSide} />
        </View>
        <View style={styles.frameBottom} />
      </View>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photographier le compteur</Text>
        <TouchableOpacity 
          style={[styles.flashBtn, flashEnabled && styles.flashBtnActive]} 
          onPress={() => setFlashEnabled(!flashEnabled)}
        >
          <Text style={styles.flashBtnText}>{flashEnabled ? '⚡' : '🔦'}</Text>
        </TouchableOpacity>
      </View>

      {/* INSTRUCTIONS */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Cadrez l'afficheur du compteur dans le rectangle
        </Text>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.captureBtn, (!isReady || isCapturing) && styles.captureBtnDisabled]}
          onPress={handleCapture}
          disabled={!isReady || isCapturing}
          activeOpacity={0.8}
        >
          {isCapturing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <View style={styles.captureBtnOuter}>
                <View style={styles.captureBtnInner} />
              </View>
              <Text style={styles.captureBtnText}>Capturer</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },

  // GUIDE DE CADRAGE
  frameGuide: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  frameTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  frameMiddle: {
    flexDirection: 'row',
    height: 150,
  },
  frameSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  frameCenter: {
    width: 280,
    height: 150,
    position: 'relative',
  },
  frameBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  
  // COINS DU CADRE
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#F97316',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#F97316',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#F97316',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#F97316',
  },

  // HEADER
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  flashBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashBtnActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
  },
  flashBtnText: {
    fontSize: 20,
  },

  // INSTRUCTIONS
  instructions: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  // FOOTER
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingLeft: 8,
    paddingRight: 20,
    paddingVertical: 8,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  captureBtnDisabled: {
    opacity: 0.5,
  },
  captureBtnOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  captureBtnInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
  },
  captureBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // OVERLAY ANALYSE
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  analyzingText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
  },
  analyzingSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 8,
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
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
});
