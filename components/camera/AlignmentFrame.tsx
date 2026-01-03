/**
 * Cadre d'alignement pour le rectangle de comptage
 * Adapté pour englober tout l'afficheur du compteur gaz
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';

interface AlignmentFrameProps {
  /** Le téléphone est-il stable ? */
  isStable: boolean;
  /** L'image est-elle bien cadrée ? */
  isAligned?: boolean;
  /** Afficher le label */
  showLabel?: boolean;
  /** Label personnalisé */
  label?: string;
}

export function AlignmentFrame({
  isStable,
  isAligned = false,
  showLabel = true,
  label = 'Cadrez l\'afficheur',
}: AlignmentFrameProps) {
  // Couleur du cadre selon l'état
  const getFrameColor = () => {
    if (isStable && isAligned) return Colors.veaOk;      // Vert
    if (isStable) return Colors.primary;                  // Orange
    return Colors.veaFuite;                               // Rouge
  };

  const frameColor = getFrameColor();

  return (
    <View style={styles.container}>
      {/* Cadre principal - format horizontal pour l'afficheur */}
      <View style={[styles.frame, { borderColor: frameColor }]}>
        {/* Coins renforcés */}
        <View style={[styles.corner, styles.topLeft, { borderColor: frameColor }]} />
        <View style={[styles.corner, styles.topRight, { borderColor: frameColor }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderColor: frameColor }]} />
        <View style={[styles.corner, styles.bottomRight, { borderColor: frameColor }]} />

        {/* Zone centrale avec guide pour les chiffres */}
        <View style={styles.innerGuide}>
          {/* Zones indicatives pour les chiffres */}
          <View style={styles.digitZones}>
            {[...Array(8)].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.digitBox,
                  i >= 5 && styles.digitBoxRed, // Les 3 derniers (décimales)
                  { borderColor: i >= 5 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.3)' }
                ]} 
              />
            ))}
          </View>
          
          {/* Séparateur décimal */}
          <View style={styles.decimalSeparator}>
            <Text style={styles.decimalDot}>•</Text>
          </View>
        </View>
      </View>

      {/* Label */}
      {showLabel && (
        <View style={[styles.labelContainer, { backgroundColor: frameColor }]}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      )}

      {/* Indicateur d'état */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: frameColor }]}>
          {isStable 
            ? (isAligned ? '✓ Prêt à capturer' : '○ Stabilisé - Ajustez le cadrage')
            : '◌ Stabilisez le téléphone'
          }
        </Text>
      </View>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const frameWidth = screenWidth * 0.85;
const frameHeight = frameWidth * 0.25; // Ratio pour l'afficheur complet

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  frame: {
    width: frameWidth,
    height: frameHeight,
    borderWidth: 2,
    borderRadius: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  innerGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: '70%',
  },
  digitZones: {
    flexDirection: 'row',
    gap: 4,
  },
  digitBox: {
    width: (frameWidth * 0.85) / 10,
    height: frameHeight * 0.5,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 3,
  },
  digitBoxRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  decimalSeparator: {
    position: 'absolute',
    right: '37%',
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  decimalDot: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 20,
    fontWeight: 'bold',
  },
  labelContainer: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  labelText: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusContainer: {
    marginTop: Spacing.xs,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
});
