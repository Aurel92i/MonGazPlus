/**
 * Cadre d'alignement pour la zone décimale
 * Change de couleur selon l'état de stabilité et d'alignement
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';

interface AlignmentFrameProps {
  /** Le téléphone est-il stable ? */
  isStable: boolean;
  /** L'image est-elle alignée ? (pour le futur) */
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
  label = 'Zone décimale',
}: AlignmentFrameProps) {
  // Déterminer la couleur du cadre
  const getFrameColor = () => {
    if (isStable && isAligned) return Colors.frameAligned;
    if (isStable) return Colors.frameAlmostAligned;
    return Colors.frameNotAligned;
  };

  const frameColor = getFrameColor();

  return (
    <View style={styles.container}>
      {/* Cadre principal */}
      <View style={[styles.frame, { borderColor: frameColor }]}>
        {/* Coins */}
        <View style={[styles.corner, styles.cornerTopLeft, { borderColor: frameColor }]} />
        <View style={[styles.corner, styles.cornerTopRight, { borderColor: frameColor }]} />
        <View style={[styles.corner, styles.cornerBottomLeft, { borderColor: frameColor }]} />
        <View style={[styles.corner, styles.cornerBottomRight, { borderColor: frameColor }]} />

        {/* Lignes de guidage horizontales */}
        <View style={[styles.guideLine, styles.guideLineTop, { backgroundColor: frameColor }]} />
        <View style={[styles.guideLine, styles.guideLineBottom, { backgroundColor: frameColor }]} />

        {/* Marqueurs pour les 3 chiffres décimaux */}
        <View style={styles.digitMarkers}>
          <View style={[styles.digitMarker, { borderColor: frameColor }]} />
          <View style={[styles.digitMarker, { borderColor: frameColor }]} />
          <View style={[styles.digitMarker, { borderColor: frameColor }]} />
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
        {isStable ? (
          <Text style={[styles.statusText, { color: frameColor }]}>
            {isAligned ? '✓ Aligné' : '○ Stabilisé'}
          </Text>
        ) : (
          <Text style={[styles.statusText, { color: frameColor }]}>
            ◌ Stabilisation...
          </Text>
        )}
      </View>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const frameWidth = screenWidth * 0.75;
const frameHeight = frameWidth * 0.35; // Ratio pour la zone décimale

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
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  guideLine: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 1,
    opacity: 0.5,
  },
  guideLineTop: {
    top: '30%',
  },
  guideLineBottom: {
    bottom: '30%',
  },
  digitMarkers: {
    position: 'absolute',
    top: '25%',
    bottom: '25%',
    left: '10%',
    right: '10%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  digitMarker: {
    width: frameWidth * 0.18,
    height: '100%',
    borderWidth: 1,
    borderRadius: 4,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  labelContainer: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  labelText: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusContainer: {
    marginTop: Spacing.xs,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
});
