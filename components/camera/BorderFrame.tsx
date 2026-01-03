/**
 * BorderFrame - Cadre d'alignement pour compteur gaz
 * 
 * Le cadre couvre les 3/4 supérieurs de l'écran caméra.
 * L'utilisateur aligne les bordures du compteur avec ce cadre.
 * 
 * Code couleur :
 * - Rouge : pas aligné
 * - Orange : presque aligné  
 * - Vert : aligné, prêt à capturer
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';

type AlignmentStatus = 'not_aligned' | 'almost_aligned' | 'aligned';

interface BorderFrameProps {
  /** Statut d'alignement */
  status?: AlignmentStatus;
  /** Instructions à afficher */
  instructions?: string;
  /** Masquer les instructions */
  hideInstructions?: boolean;
}

export function BorderFrame({
  status = 'aligned',
  instructions = 'Alignez les bords du compteur',
  hideInstructions = false,
}: BorderFrameProps) {
  
  // Couleur selon le statut
  const getColor = () => {
    switch (status) {
      case 'aligned':
        return Colors.veaOk; // Vert
      case 'almost_aligned':
        return Colors.primary; // Orange
      case 'not_aligned':
      default:
        return Colors.veaFuite; // Rouge
    }
  };

  const frameColor = getColor();

  // Texte de statut
  const getStatusText = () => {
    switch (status) {
      case 'aligned':
        return '✓ Aligné - Prêt à capturer';
      case 'almost_aligned':
        return '○ Presque aligné...';
      case 'not_aligned':
      default:
        return '◌ Alignez le compteur';
    }
  };

  return (
    <View style={styles.container}>
      {/* Zone du cadre - 3/4 supérieurs */}
      <View style={styles.frameZone}>
        {/* Coin supérieur gauche */}
        <View style={[styles.corner, styles.topLeft, { borderColor: frameColor }]} />
        
        {/* Coin supérieur droit */}
        <View style={[styles.corner, styles.topRight, { borderColor: frameColor }]} />
        
        {/* Coin inférieur gauche (aux 3/4) */}
        <View style={[styles.corner, styles.bottomLeft, { borderColor: frameColor }]} />
        
        {/* Coin inférieur droit (aux 3/4) */}
        <View style={[styles.corner, styles.bottomRight, { borderColor: frameColor }]} />

        {/* Ligne supérieure */}
        <View style={[styles.line, styles.lineTop, { backgroundColor: frameColor }]} />
        
        {/* Ligne inférieure */}
        <View style={[styles.line, styles.lineBottom, { backgroundColor: frameColor }]} />
        
        {/* Ligne gauche */}
        <View style={[styles.line, styles.lineLeft, { backgroundColor: frameColor }]} />
        
        {/* Ligne droite */}
        <View style={[styles.line, styles.lineRight, { backgroundColor: frameColor }]} />

        {/* Croix centrale */}
        <View style={styles.centerMark}>
          <View style={[styles.crossH, { backgroundColor: frameColor }]} />
          <View style={[styles.crossV, { backgroundColor: frameColor }]} />
        </View>
      </View>

      {/* Instructions en haut */}
      {!hideInstructions && (
        <View style={styles.instructionsContainer}>
          <View style={[styles.badge, { backgroundColor: frameColor }]}>
            <Text style={styles.badgeText}>{instructions}</Text>
          </View>
        </View>
      )}

      {/* Statut en bas de la zone de cadre */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: frameColor }]}>
          {getStatusText()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Zone du cadre - 75% supérieurs
  frameZone: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    height: '75%', // 3/4 de la hauteur
  },

  // Coins épais
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderWidth: 5,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  // Lignes entre les coins
  line: {
    position: 'absolute',
    opacity: 0.6,
  },
  lineTop: {
    top: 0,
    left: 60,
    right: 60,
    height: 3,
  },
  lineBottom: {
    bottom: 0,
    left: 60,
    right: 60,
    height: 3,
  },
  lineLeft: {
    left: 0,
    top: 60,
    bottom: 60,
    width: 3,
  },
  lineRight: {
    right: 0,
    top: 60,
    bottom: 60,
    width: 3,
  },

  // Croix centrale
  centerMark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossH: {
    position: 'absolute',
    width: 24,
    height: 2,
    opacity: 0.5,
  },
  crossV: {
    position: 'absolute',
    width: 2,
    height: 24,
    opacity: 0.5,
  },

  // Badge d'instructions
  instructionsContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },

  // Statut
  statusContainer: {
    position: 'absolute',
    top: '68%', // Juste au-dessus de la limite des 75%
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
