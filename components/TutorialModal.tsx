/**
 * TutorialModal - Pop-up d'explication avant la capture
 * 
 * Affiche un tutoriel visuel avec case à cocher pour ne plus afficher
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  useWindowDimensions,
} from 'react-native';

interface TutorialModalProps {
  visible: boolean;
  type: 'photo1' | 'photo2';
  onClose: () => void;
  onDontShowAgain: () => void;
}

export function TutorialModal({ visible, type, onClose, onDontShowAgain }: TutorialModalProps) {
  const [dontShowChecked, setDontShowChecked] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  // Animations
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && !hasScrolled) {
      // Animation de rebond continue
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 6,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      
      bounceAnimation.start();
      
      return () => {
        bounceAnimation.stop();
      };
    }
  }, [visible, hasScrolled]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 10 && !hasScrolled) {
      setHasScrolled(true);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleClose = () => {
    if (dontShowChecked) {
      onDontShowAgain();
    }
    setHasScrolled(false);
    fadeAnim.setValue(1);
    onClose();
  };

  const isPhoto1 = type === 'photo1';

  // Styles dynamiques adaptatifs
  const dynamicStyles = {
    overlay: {
      justifyContent: isLandscape ? 'flex-start' : 'center',
      paddingTop: isLandscape ? 8 : 12,
      paddingBottom: isLandscape ? 8 : 12,
    },
    container: {
      maxWidth: isLandscape ? Math.min(480, width * 0.5) : width * 0.92,
      height: isLandscape ? height - 16 : undefined,
      maxHeight: isLandscape ? height - 16 : height * 0.82,
    },
    header: {
      paddingVertical: isLandscape ? 6 : 10,
    },
    headerIcon: {
      fontSize: isLandscape ? 20 : 28,
    },
    headerTitle: {
      fontSize: isLandscape ? 14 : 17,
    },
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, dynamicStyles.overlay]}>
        <View style={[styles.container, dynamicStyles.container]}>
          {/* HEADER */}
          <View style={[styles.header, dynamicStyles.header]}>
            <Text style={[styles.headerIcon, dynamicStyles.headerIcon]}>
              {isPhoto1 ? '📸' : '🔄'}
            </Text>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
              {isPhoto1 ? 'Première photo' : 'Deuxième photo'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isPhoto1 ? 'Comment bien cadrer le compteur' : 'Comment superposer les images'}
            </Text>
          </View>

          {/* CONTENU SCROLLABLE */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {isPhoto1 ? (
              // TUTORIEL PHOTO 1
              <>
                {/* Illustration - Compteur avec cadre vert */}
                <View style={styles.illustrationContainer}>
                  <View style={styles.illustrationFrame}>
                    {/* Lignes du cadre vert */}
                    <View style={styles.frameLineTop} />
                    <View style={styles.frameLineLeft} />
                    <View style={styles.frameLineRight} />
                    
                    {/* Compteur jaune */}
                    <View style={styles.meterIllustration}>
                      <View style={styles.meterTop}>
                        <Text style={styles.meterBrand}>ITRON</Text>
                        <View style={styles.meterBarcode} />
                      </View>
                      <View style={styles.meterDisplayBox}>
                        <Text style={styles.meterNumbers}>0 0 0 7 5</Text>
                        <View style={styles.meterRedBox}>
                          <Text style={styles.meterRedNumbers}>9 7</Text>
                        </View>
                      </View>
                      <Text style={styles.meterModel}>GALLUS G4</Text>
                    </View>
                  </View>
                  
                  {/* Contrôle zoom à droite */}
                  <View style={styles.zoomControlPreview}>
                    <Text style={styles.zoomIcon}>🔍</Text>
                    <View style={styles.zoomButton}>
                      <Text style={styles.zoomButtonText}>+</Text>
                    </View>
                    <Text style={styles.zoomValue}>1.0x</Text>
                    <View style={styles.zoomButton}>
                      <Text style={styles.zoomButtonText}>−</Text>
                    </View>
                  </View>
                </View>
                
                {/* Légende */}
                <View style={styles.legendRow}>
                  <View style={styles.legendGreenBar} />
                  <Text style={styles.legendLabel}>Alignez le cadre vert aux bords du compteur</Text>
                </View>

                {/* Instructions */}
                <View style={styles.instructions}>
                  <View style={styles.instruction}>
                    <Text style={styles.instructionNumber}>1</Text>
                    <View style={styles.instructionContent}>
                      <Text style={styles.instructionTitle}>Cadrez le compteur</Text>
                      <Text style={styles.instructionText}>
                        Alignez le cadre vert avec les bords du compteur. Les coins doivent correspondre.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.instruction}>
                    <Text style={styles.instructionNumber}>2</Text>
                    <View style={styles.instructionContent}>
                      <Text style={styles.instructionTitle}>Ajustez le zoom</Text>
                      <Text style={styles.instructionText}>
                        Utilisez les boutons + et - pour que l'afficheur soit bien lisible.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.instruction}>
                    <Text style={styles.instructionNumber}>3</Text>
                    <View style={styles.instructionContent}>
                      <Text style={styles.instructionTitle}>Restez stable</Text>
                      <Text style={styles.instructionText}>
                        Tenez le téléphone immobile et appuyez sur Capturer.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Conseil */}
                <View style={styles.tip}>
                  <Text style={styles.tipIcon}>💡</Text>
                  <Text style={styles.tipText}>
                    Activez le flash si l'éclairage est insuffisant
                  </Text>
                </View>

                {/* CHECKBOX - En fin de scroll */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setDontShowChecked(!dontShowChecked)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, dontShowChecked && styles.checkboxChecked]}>
                    {dontShowChecked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Ne plus afficher ce tutoriel</Text>
                </TouchableOpacity>

                {/* BOUTON - En fin de scroll */}
                <TouchableOpacity style={styles.button} onPress={handleClose} activeOpacity={0.8}>
                  <Text style={styles.buttonText}>J'ai compris</Text>
                </TouchableOpacity>
              </>
            ) : (
              // TUTORIEL PHOTO 2
              <>
                {/* Illustration - Superposition des compteurs */}
                <View style={styles.illustrationContainer}>
                  <View style={styles.superpositionFrame}>
                    {/* Compteur fantôme (en transparence, décalé) */}
                    <View style={styles.ghostMeterIllustration}>
                      <View style={styles.ghostMeterTop}>
                        <Text style={styles.ghostMeterBrand}>ITRON</Text>
                      </View>
                      <View style={styles.ghostMeterDisplayBox}>
                        <Text style={styles.ghostMeterNumbers}>0 0 0 7 5</Text>
                      </View>
                    </View>
                    
                    {/* Compteur live (opaque, superposé) */}
                    <View style={styles.liveMeterIllustration}>
                      <View style={styles.meterTop}>
                        <Text style={styles.meterBrand}>ITRON</Text>
                        <View style={styles.meterBarcode} />
                      </View>
                      <View style={styles.meterDisplayBox}>
                        <Text style={styles.meterNumbers}>0 0 0 7 5</Text>
                        <View style={styles.meterRedBox}>
                          <Text style={styles.meterRedNumbers}>9 7</Text>
                        </View>
                      </View>
                      <Text style={styles.meterModel}>GALLUS G4</Text>
                    </View>
                  </View>
                  
                  {/* Contrôle fantôme à droite */}
                  <View style={styles.ghostControlPreview}>
                    <Text style={styles.ghostIcon}>👻</Text>
                    <View style={styles.zoomButton}>
                      <Text style={styles.zoomButtonText}>+</Text>
                    </View>
                    <Text style={styles.ghostValue}>40%</Text>
                    <View style={styles.zoomButton}>
                      <Text style={styles.zoomButtonText}>−</Text>
                    </View>
                  </View>
                </View>
                
                {/* Légende */}
                <View style={styles.legendColumn}>
                  <View style={styles.legendRow}>
                    <View style={styles.legendGhostBox} />
                    <Text style={styles.legendLabel}>Fantôme = photo 1 en transparence</Text>
                  </View>
                  <View style={styles.legendRow}>
                    <View style={styles.legendLiveBox} />
                    <Text style={styles.legendLabel}>Vue live = caméra actuelle</Text>
                  </View>
                </View>

                {/* Instructions */}
                <View style={styles.instructions}>
                  <View style={styles.instruction}>
                    <Text style={styles.instructionNumber}>1</Text>
                    <View style={styles.instructionContent}>
                      <Text style={styles.instructionTitle}>Attendez 3 minutes</Text>
                      <Text style={styles.instructionText}>
                        Le chronomètre indique le temps écoulé. 3 minutes minimum sont recommandées.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.instruction}>
                    <Text style={styles.instructionNumber}>2</Text>
                    <View style={styles.instructionContent}>
                      <Text style={styles.instructionTitle}>Superposez les images</Text>
                      <Text style={styles.instructionText}>
                        L'image fantôme (transparente) de la photo 1 s'affiche. Alignez-la avec la vue actuelle.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.instruction}>
                    <Text style={styles.instructionNumber}>3</Text>
                    <View style={styles.instructionContent}>
                      <Text style={styles.instructionTitle}>Capture automatique</Text>
                      <Text style={styles.instructionText}>
                        Restez immobile 5 secondes, la photo sera prise automatiquement.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Conseil */}
                <View style={styles.tip}>
                  <Text style={styles.tipIcon}>👻</Text>
                  <Text style={styles.tipText}>
                    Ajustez l'opacité du fantôme avec + et - pour mieux voir
                  </Text>
                </View>

                {/* CHECKBOX - En fin de scroll */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setDontShowChecked(!dontShowChecked)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, dontShowChecked && styles.checkboxChecked]}>
                    {dontShowChecked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Ne plus afficher ce tutoriel</Text>
                </TouchableOpacity>

                {/* BOUTON - En fin de scroll */}
                <TouchableOpacity style={styles.button} onPress={handleClose} activeOpacity={0.8}>
                  <Text style={styles.buttonText}>J'ai compris</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
          
          {/* INDICATEUR DE SCROLL - Simplifié */}
          <Animated.View 
            style={[
              styles.scrollIndicator,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: bounceAnim }]
              }
            ]}
            pointerEvents="none"
          >
            <View style={styles.scrollIndicatorPill}>
              <Text style={styles.scrollIndicatorArrow}>↓</Text>
              <Text style={styles.scrollIndicatorText}>Défiler</Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
  },

  // HEADER
  header: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 2,
  },
  headerTitle: {
    color: '#FFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 6,
  },

  // SCROLL
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 20,
  },
  
  // INDICATEUR DE SCROLL
  scrollIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrollIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.95)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollIndicatorArrow: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollIndicatorText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '600',
  },

  // ILLUSTRATIONS
  illustrationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  // Frame avec cadre vert (Photo 1)
  illustrationFrame: {
    flex: 1,
    height: 110,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  frameLineTop: {
    position: 'absolute',
    top: 10,
    left: 15,
    right: 15,
    height: 3,
    backgroundColor: '#4ADE80',
    borderRadius: 1,
  },
  frameLineLeft: {
    position: 'absolute',
    top: 10,
    left: 15,
    width: 3,
    height: 90,
    backgroundColor: '#4ADE80',
    borderRadius: 1,
  },
  frameLineRight: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 3,
    height: 90,
    backgroundColor: '#4ADE80',
    borderRadius: 1,
  },
  
  // Compteur jaune
  meterIllustration: {
    backgroundColor: '#F59E0B',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    width: '65%',
  },
  meterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  meterBrand: {
    color: '#000',
    fontSize: 8,
    fontWeight: '800',
  },
  meterBarcode: {
    width: 30,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 1,
  },
  meterDisplayBox: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  meterNumbers: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  meterRedBox: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    marginLeft: 4,
  },
  meterRedNumbers: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  meterModel: {
    color: '#000',
    fontSize: 6,
    fontWeight: '600',
    marginTop: 3,
  },
  
  // Contrôle zoom
  zoomControlPreview: {
    marginLeft: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 10,
  },
  zoomIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  zoomButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  zoomButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  zoomValue: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '700',
    marginVertical: 2,
  },
  
  // Frame superposition (Photo 2)
  superpositionFrame: {
    flex: 1,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  
  // Compteur fantôme
  ghostMeterIllustration: {
    position: 'absolute',
    backgroundColor: 'rgba(249, 115, 22, 0.35)',
    padding: 6,
    borderRadius: 5,
    alignItems: 'center',
    width: '55%',
    top: 12,
    left: '8%',
    borderWidth: 2,
    borderColor: 'rgba(249, 115, 22, 0.5)',
    borderStyle: 'dashed',
  },
  ghostMeterTop: {
    width: '100%',
    marginBottom: 3,
  },
  ghostMeterBrand: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 7,
    fontWeight: '800',
  },
  ghostMeterDisplayBox: {
    backgroundColor: 'rgba(229, 231, 235, 0.4)',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 2,
  },
  ghostMeterNumbers: {
    color: 'rgba(0,0,0,0.4)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  
  // Compteur live superposé
  liveMeterIllustration: {
    backgroundColor: '#F59E0B',
    padding: 7,
    borderRadius: 5,
    alignItems: 'center',
    width: '55%',
    marginTop: 25,
    marginLeft: '18%',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  
  // Contrôle fantôme
  ghostControlPreview: {
    marginLeft: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 10,
  },
  ghostIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  ghostValue: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginVertical: 2,
  },
  
  // Légendes
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendColumn: {
    marginBottom: 12,
  },
  legendGreenBar: {
    width: 20,
    height: 3,
    backgroundColor: '#4ADE80',
    borderRadius: 1,
    marginRight: 8,
  },
  legendGhostBox: {
    width: 16,
    height: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.35)',
    borderRadius: 2,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.5)',
    borderStyle: 'dashed',
  },
  legendLiveBox: {
    width: 16,
    height: 12,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
    marginRight: 8,
  },
  legendLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    flex: 1,
  },
  
  // Alignement (non utilisé mais gardé pour compatibilité)
  alignmentIndicator: {
    alignItems: 'center',
  },
  alignmentTrack: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  alignmentFillPreview: {
    width: '70%',
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 2,
  },
  alignmentLabelText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  
  // Opacité preview
  opacityPreview: {
    flex: 1,
    marginHorizontal: 12,
  },
  opacityGradient: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  opacityStep: {
    flex: 1,
    backgroundColor: '#F97316',
  },

  // INSTRUCTIONS
  instructions: {
    marginBottom: 12,
  },
  instruction: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  instructionNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4ADE80',
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 10,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 16,
  },

  // TIP
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4ADE80',
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    color: '#4ADE80',
    fontSize: 12,
    flex: 1,
  },

  // CHECKBOX - Dans le scroll
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  },
  checkmark: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },

  // BOUTON - Dans le scroll
  button: {
    backgroundColor: '#4ADE80',
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
