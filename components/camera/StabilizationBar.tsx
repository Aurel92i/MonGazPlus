/**
 * Barre de stabilisation visuelle
 * Affiche le niveau de stabilité du téléphone
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

interface StabilizationBarProps {
  /** Score de stabilité (0-100) */
  score: number;
  /** Le téléphone est-il stable ? */
  isStable: boolean;
  /** Inclinaison pitch en degrés */
  pitch: number;
  /** Inclinaison roll en degrés */
  roll: number;
  /** Message à afficher */
  message: string;
}

export function StabilizationBar({
  score,
  isStable,
  pitch,
  roll,
  message,
}: StabilizationBarProps) {
  // Couleur selon le score
  const getBarColor = () => {
    if (isStable) return Colors.veaOk;
    if (score >= 70) return Colors.veaDoute;
    return Colors.veaFuite;
  };

  // Position de la bulle de niveau (basée sur roll)
  const bubblePosition = Math.max(-40, Math.min(40, roll * 4));

  return (
    <View style={styles.container}>
      {/* Indicateur de niveau horizontal */}
      <View style={styles.levelContainer}>
        <View style={styles.levelTrack}>
          <View style={styles.levelCenter} />
          <View 
            style={[
              styles.levelBubble,
              { 
                transform: [{ translateX: bubblePosition }],
                backgroundColor: getBarColor(),
              }
            ]} 
          />
        </View>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${score}%`,
                backgroundColor: getBarColor(),
              }
            ]} 
          />
        </View>
        <Text style={[styles.scoreText, { color: getBarColor() }]}>
          {score}%
        </Text>
      </View>

      {/* Message */}
      <Text style={[
        styles.message,
        isStable && styles.messageStable
      ]}>
        {message}
      </Text>

      {/* Debug: angles (optionnel) */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            P: {pitch.toFixed(1)}° | R: {roll.toFixed(1)}°
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  levelContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  levelTrack: {
    width: 120,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  levelCenter: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  levelBubble: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  message: {
    color: '#AAA',
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  messageStable: {
    color: Colors.veaOk,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: Spacing.xs,
  },
  debugText: {
    color: '#666',
    fontSize: FontSizes.xs,
    fontFamily: 'monospace',
  },
});
