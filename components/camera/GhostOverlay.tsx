/**
 * Ghost Overlay - Mode Fantôme
 * Affiche une version semi-transparente de la photo AVANT
 * pour aider à aligner la photo APRÈS
 */

import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

interface GhostOverlayProps {
  /** URI de l'image à afficher en fantôme */
  imageUri: string;
  /** Opacité initiale (0-1) */
  initialOpacity?: number;
  /** Callback quand l'opacité change */
  onOpacityChange?: (opacity: number) => void;
}

export function GhostOverlay({
  imageUri,
  initialOpacity = 0.3,
  onOpacityChange,
}: GhostOverlayProps) {
  const [opacity, setOpacity] = useState(initialOpacity);
  const [isVisible, setIsVisible] = useState(true);

  const adjustOpacity = (delta: number) => {
    const newOpacity = Math.max(0.1, Math.min(0.7, opacity + delta));
    setOpacity(newOpacity);
    onOpacityChange?.(newOpacity);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={toggleVisibility}
      >
        <Text style={styles.toggleButtonText}>👻 Afficher fantôme</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Image fantôme */}
      <Image
        source={{ uri: imageUri }}
        style={[styles.ghostImage, { opacity }]}
        resizeMode="cover"
      />

      {/* Contrôles d'opacité */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => adjustOpacity(-0.1)}
        >
          <Text style={styles.controlButtonText}>−</Text>
        </TouchableOpacity>

        <View style={styles.opacityInfo}>
          <Text style={styles.opacityLabel}>👻</Text>
          <Text style={styles.opacityValue}>{Math.round(opacity * 100)}%</Text>
        </View>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => adjustOpacity(0.1)}
        >
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.hideButton]}
          onPress={toggleVisibility}
        >
          <Text style={styles.controlButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Alignez sur l'image fantôme
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  ghostImage: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    position: 'absolute',
    bottom: 120,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonText: {
    color: '#FFF',
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  hideButton: {
    marginLeft: Spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.6)',
  },
  opacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  opacityLabel: {
    fontSize: FontSizes.md,
  },
  opacityValue: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'center',
  },
  instructionContainer: {
    position: 'absolute',
    top: Spacing.xl,
    left: Spacing.md,
    right: Spacing.md,
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 180,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  toggleButtonText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
});
