/**
 * Écran de résultat VEA
 * Effectue l'analyse et affiche le verdict
 * Photos cliquables avec pinch-to-zoom
 */

import { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Modal,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, VEAMessages } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useVEAStore } from '@/stores/veaStore';
import { VEADecision, VEAResult } from '@/types';
import { performVEAAnalysis, performMockVEAAnalysis } from '@/lib';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type PhotoViewMode = 'before' | 'after' | 'compare';

export default function ResultatScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const veaStore = useVEAStore();
  const { captureState, decision: storedDecision } = veaStore;
  
  const isTechnicien = user?.role === 'technicien';
  
  // État local
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [decision, setDecision] = useState<VEADecision | null>(storedDecision);
  const [error, setError] = useState<string | null>(null);
  
  // Modal photo
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoViewMode, setPhotoViewMode] = useState<PhotoViewMode>('before');
  
  // Zoom manuel
  const [zoomLevel, setZoomLevel] = useState(1);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Récupérer le temps écoulé depuis le store
  const elapsedTime = captureState.elapsedTime || 0;

  // Effectuer l'analyse au montage
  useEffect(() => {
    analyzePhotos();
  }, []);

  // Reset zoom quand on change de mode
  useEffect(() => {
    resetZoom();
  }, [photoViewMode]);

  const resetZoom = () => {
    setZoomLevel(1);
    scaleAnim.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.5, 4);
    setZoomLevel(newZoom);
    Animated.spring(scaleAnim, {
      toValue: newZoom,
      useNativeDriver: true,
    }).start();
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoom);
    Animated.spring(scaleAnim, {
      toValue: newZoom,
      useNativeDriver: true,
    }).start();
    if (newZoom === 1) {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
    }
  };

  // Pan responder pour déplacer l'image zoomée
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => zoomLevel > 1,
      onMoveShouldSetPanResponder: () => zoomLevel > 1,
      onPanResponderMove: (_, gestureState) => {
        if (zoomLevel > 1) {
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        // Garder la position
      },
    })
  ).current;

  const analyzePhotos = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const { photoBefore, photoAfter } = captureState;

      if (photoBefore && photoAfter) {
        const result = await performVEAAnalysis(photoBefore, photoAfter, elapsedTime);
        setDecision(result);
        veaStore.setDecision(result);
      } else {
        console.log('⚠️ Images manquantes, utilisation du mode simulation');
        const mockResult = performMockVEAAnalysis(elapsedTime || 180);
        setDecision(mockResult);
        veaStore.setDecision(mockResult);
      }
    } catch (err) {
      console.error('Erreur analyse:', err);
      setError('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
      const mockResult = performMockVEAAnalysis(elapsedTime || 180);
      setDecision(mockResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getResultConfig = (result: VEAResult) => {
    switch (result) {
      case 'OK':
        return {
          backgroundColor: Colors.veaOkLight,
          borderColor: Colors.veaOk,
          textColor: Colors.veaOk,
          icon: '✅',
          ...VEAMessages.OK,
        };
      case 'DOUTE':
        return {
          backgroundColor: Colors.veaDouteLight,
          borderColor: Colors.veaDoute,
          textColor: Colors.veaDoute,
          icon: '⚠️',
          ...VEAMessages.DOUTE,
        };
      case 'FUITE_PROBABLE':
        return {
          backgroundColor: Colors.veaFuiteLight,
          borderColor: Colors.veaFuite,
          textColor: Colors.veaFuite,
          icon: '🚨',
          ...VEAMessages.FUITE_PROBABLE,
        };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs.toString().padStart(2, '0')}s`;
  };

  const handleDone = () => {
    veaStore.resetSession();
    if (isTechnicien) {
      router.replace('/(technicien)');
    } else {
      router.replace('/(particulier)');
    }
  };

  const handleNewVEA = () => {
    veaStore.resetSession();
    if (isTechnicien) {
      router.replace('/(technicien)/vea');
    } else {
      router.replace('/(particulier)/vea');
    }
  };

  const openPhotoModal = (mode: PhotoViewMode) => {
    setPhotoViewMode(mode);
    resetZoom();
    setPhotoModalVisible(true);
  };

  // Écran de chargement
  if (isAnalyzing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingTitle}>Analyse en cours...</Text>
          <Text style={styles.loadingText}>
            Comparaison des images pour détecter tout mouvement du compteur
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Écran d'erreur sans décision
  if (!decision) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.loadingTitle}>Erreur d'analyse</Text>
          <Text style={styles.loadingText}>{error || 'Impossible d\'analyser les images.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={analyzePhotos}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleDone}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const config = getResultConfig(decision.result);
  const photoBeforeUri = captureState.photoBefore?.uri;
  const photoAfterUri = captureState.photoAfter?.uri;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Résultat principal */}
        <View style={[
          styles.resultCard,
          { backgroundColor: config.backgroundColor, borderColor: config.borderColor }
        ]}>
          <Text style={styles.resultIcon}>{config.icon}</Text>
          <Text style={[styles.resultTitle, { color: config.textColor }]}>
            {config.title}
          </Text>
          <Text style={styles.resultSubtitle}>{config.subtitle}</Text>
          
          {/* Barre de confiance */}
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confiance de l'analyse</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${decision.confidence * 100}%`,
                    backgroundColor: config.borderColor 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.confidenceValue, { color: config.textColor }]}>
              {Math.round(decision.confidence * 100)}%
            </Text>
          </View>
        </View>

        {/* Recommandation */}
        <View style={[
          styles.recommendationCard,
          { borderLeftColor: config.borderColor }
        ]}>
          <Text style={styles.recommendationLabel}>💡 Recommandation</Text>
          <Text style={styles.recommendationText}>{decision.recommendation}</Text>
        </View>

        {/* Détails de l'analyse */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>📊 Détails de l'analyse</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Durée du test</Text>
            <Text style={styles.detailValue}>{formatTime(elapsedTime)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Variation détectée</Text>
            <Text style={[
              styles.detailValue,
              { color: decision.result === 'OK' ? Colors.veaOk : decision.result === 'DOUTE' ? Colors.veaDoute : Colors.veaFuite }
            ]}>
              {decision.details.digitDelta.toFixed(1)}%
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mouvement</Text>
            <Text style={styles.detailValue}>
              {decision.details.digitChange ? 'Détecté' : 'Non détecté'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date et heure</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          
          <View style={styles.analysisDescription}>
            <Text style={styles.analysisDescriptionText}>
              {decision.details.analysisDescription}
            </Text>
          </View>
        </View>

        {/* Aperçu des photos - CLIQUABLES */}
        <View style={styles.photosCard}>
          <Text style={styles.photosTitle}>📸 Photos de l'analyse</Text>
          <Text style={styles.photosTip}>Appuyez pour agrandir • Zoomez avec les boutons +/-</Text>
          
          <View style={styles.photosContainer}>
            {/* Photo AVANT */}
            <TouchableOpacity 
              style={styles.photoPreview}
              onPress={() => openPhotoModal('before')}
              activeOpacity={0.7}
            >
              {photoBeforeUri ? (
                <Image 
                  source={{ uri: photoBeforeUri }} 
                  style={styles.photoImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>AVANT</Text>
                </View>
              )}
              <Text style={styles.photoLabel}>AVANT</Text>
              <Text style={styles.photoTime}>T = 00:00</Text>
            </TouchableOpacity>

            {/* Bouton comparer */}
            <TouchableOpacity 
              style={styles.compareButton}
              onPress={() => openPhotoModal('compare')}
            >
              <Text style={styles.compareIcon}>⚖️</Text>
              <Text style={styles.compareText}>Comparer</Text>
            </TouchableOpacity>

            {/* Photo APRÈS */}
            <TouchableOpacity 
              style={styles.photoPreview}
              onPress={() => openPhotoModal('after')}
              activeOpacity={0.7}
            >
              {photoAfterUri ? (
                <Image 
                  source={{ uri: photoAfterUri }} 
                  style={styles.photoImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>APRÈS</Text>
                </View>
              )}
              <Text style={styles.photoLabel}>APRÈS</Text>
              <Text style={styles.photoTime}>T = {formatTime(elapsedTime)}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Interprétation */}
          <View style={styles.interpretationContainer}>
            <Text style={styles.interpretationText}>
              {decision.result === 'OK' 
                ? "Les photos montrent que les chiffres du compteur n'ont pas bougé pendant le test."
                : decision.result === 'DOUTE'
                  ? "Une légère variation a été détectée. Vérifiez qu'aucun appareil gaz n'était en fonctionnement."
                  : "Un mouvement significatif des chiffres a été détecté, indiquant une possible consommation de gaz."
              }
            </Text>
          </View>
        </View>

        {/* Actions technicien */}
        {isTechnicien && (
          <View style={styles.technicienActions}>
            <TouchableOpacity style={styles.technicienButton}>
              <Text style={styles.technicienButtonIcon}>📄</Text>
              <Text style={styles.technicienButtonText}>Rapport PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.technicienButton}>
              <Text style={styles.technicienButtonIcon}>✍️</Text>
              <Text style={styles.technicienButtonText}>Signature</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Numéro d'urgence si fuite */}
        {decision.result === 'FUITE_PROBABLE' && (
          <TouchableOpacity style={styles.emergencyCard}>
            <Text style={styles.emergencyIcon}>📞</Text>
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Urgence Gaz</Text>
              <Text style={styles.emergencyNumber}>0 800 47 33 33</Text>
              <Text style={styles.emergencySubtext}>Appel gratuit 24h/24</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Actions fixes en bas */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleNewVEA}
        >
          <Text style={styles.secondaryButtonText}>Nouveau test</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: config.borderColor }]}
          onPress={handleDone}
        >
          <Text style={styles.primaryButtonText}>Terminer</Text>
        </TouchableOpacity>
      </View>

      {/* Modal visualisation photos avec ZOOM */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            
            {/* Tabs */}
            <View style={styles.modalTabs}>
              <TouchableOpacity 
                style={[styles.modalTab, photoViewMode === 'before' && styles.modalTabActive]}
                onPress={() => setPhotoViewMode('before')}
              >
                <Text style={[styles.modalTabText, photoViewMode === 'before' && styles.modalTabTextActive]}>
                  AVANT
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalTab, photoViewMode === 'compare' && styles.modalTabActive]}
                onPress={() => setPhotoViewMode('compare')}
              >
                <Text style={[styles.modalTabText, photoViewMode === 'compare' && styles.modalTabTextActive]}>
                  ⚖️
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalTab, photoViewMode === 'after' && styles.modalTabActive]}
                onPress={() => setPhotoViewMode('after')}
              >
                <Text style={[styles.modalTabText, photoViewMode === 'after' && styles.modalTabTextActive]}>
                  APRÈS
                </Text>
              </TouchableOpacity>
            </View>

            {/* Contrôles zoom */}
            {photoViewMode !== 'compare' && (
              <View style={styles.zoomControls}>
                <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut}>
                  <Text style={styles.zoomBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.zoomText}>{zoomLevel.toFixed(1)}x</Text>
                <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn}>
                  <Text style={styles.zoomBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Contenu modal */}
          <View style={styles.modalContent}>
            {photoViewMode === 'compare' ? (
              // Mode comparaison côte à côte
              <View style={styles.compareContainer}>
                <View style={styles.comparePhoto}>
                  {photoBeforeUri ? (
                    <Image 
                      source={{ uri: photoBeforeUri }} 
                      style={styles.compareImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.comparePlaceholder}>
                      <Text style={styles.comparePlaceholderText}>AVANT</Text>
                    </View>
                  )}
                  <Text style={styles.compareLabel}>AVANT - T=00:00</Text>
                </View>
                <View style={styles.compareDivider} />
                <View style={styles.comparePhoto}>
                  {photoAfterUri ? (
                    <Image 
                      source={{ uri: photoAfterUri }} 
                      style={styles.compareImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.comparePlaceholder}>
                      <Text style={styles.comparePlaceholderText}>APRÈS</Text>
                    </View>
                  )}
                  <Text style={styles.compareLabel}>APRÈS - T={formatTime(elapsedTime)}</Text>
                </View>
              </View>
            ) : (
              // Mode photo unique avec ZOOM
              <View style={styles.singlePhotoContainer} {...panResponder.panHandlers}>
                {(photoViewMode === 'before' ? photoBeforeUri : photoAfterUri) ? (
                  <Animated.Image 
                    source={{ uri: photoViewMode === 'before' ? photoBeforeUri : photoAfterUri }} 
                    style={[
                      styles.singleImage,
                      {
                        transform: [
                          { scale: scaleAnim },
                          { translateX: translateX },
                          { translateY: translateY },
                        ]
                      }
                    ]}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.singlePlaceholder}>
                    <Text style={styles.singlePlaceholderText}>
                      Photo {photoViewMode === 'before' ? 'AVANT' : 'APRÈS'} non disponible
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Label et instructions */}
          <View style={styles.modalFooter}>
            {photoViewMode !== 'compare' && (
              <Text style={styles.singleLabel}>
                {photoViewMode === 'before' 
                  ? 'Photo AVANT - T = 00:00' 
                  : `Photo APRÈS - T = ${formatTime(elapsedTime)}`
                }
              </Text>
            )}
            <Text style={styles.modalHint}>
              {photoViewMode === 'compare' 
                ? 'Comparez les 3 derniers chiffres du compteur'
                : zoomLevel > 1 
                  ? 'Faites glisser pour déplacer • Appuyez sur − pour dézoomer'
                  : 'Utilisez +/- pour zoomer'
              }
            </Text>
            {zoomLevel > 1 && photoViewMode !== 'compare' && (
              <TouchableOpacity style={styles.resetZoomBtn} onPress={resetZoom}>
                <Text style={styles.resetZoomText}>Réinitialiser le zoom</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  retryButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: FontSizes.md,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  resultCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 3,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  resultSubtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  confidenceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  recommendationCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    ...Shadows.sm,
  },
  recommendationLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  recommendationText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  detailsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  analysisDescription: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  analysisDescriptionText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  photosCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  photosTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  photosTip: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoPreview: {
    alignItems: 'center',
    flex: 1,
  },
  photoImage: {
    width: 100,
    height: 75,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  photoPlaceholder: {
    width: 100,
    height: 75,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  photoPlaceholderText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  photoLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  photoTime: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  compareButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  compareIcon: {
    fontSize: 24,
  },
  compareText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  interpretationContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  interpretationText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  technicienActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  technicienButton: {
    flex: 1,
    backgroundColor: Colors.technicienLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.technicien,
  },
  technicienButtonIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  technicienButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.technicien,
  },
  emergencyCard: {
    backgroundColor: Colors.veaFuite,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  emergencyNumber: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  emergencySubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSizes.sm,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#FFF',
    fontSize: FontSizes.xl,
  },
  modalTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  modalTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
  },
  modalTabActive: {
    backgroundColor: Colors.primary,
  },
  modalTabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  modalTabTextActive: {
    color: '#FFF',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  zoomText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginHorizontal: Spacing.sm,
    minWidth: 40,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Mode comparaison
  compareContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  comparePhoto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  compareImage: {
    width: '100%',
    height: '80%',
  },
  comparePlaceholder: {
    width: '100%',
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  comparePlaceholderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSizes.lg,
  },
  compareLabel: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  compareDivider: {
    width: 2,
    backgroundColor: Colors.primary,
    marginVertical: Spacing.lg,
  },

  // Mode photo unique avec zoom
  singlePhotoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  singleImage: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  singlePlaceholder: {
    width: '90%',
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  singlePlaceholderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSizes.lg,
  },

  // Footer modal
  modalFooter: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: Spacing.md,
  },
  singleLabel: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  modalHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  resetZoomBtn: {
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  resetZoomText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
  },
});
