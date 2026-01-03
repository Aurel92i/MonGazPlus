/**
 * BorderFrame - Guide d'alignement avec repères d'angle
 * 
 * Forme ⊓ ouverte avec rayures diagonales dans les coins
 * pour aider à aligner les angles du compteur.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface BorderFrameProps {
  color?: string;
  thickness?: number;
  margin?: number;
  sideHeightPercent?: number;
  topOffset?: number;
}

export function BorderFrame({
  color = '#4ADE80',
  thickness = 4,
  margin = 80,
  sideHeightPercent = 55,
  topOffset = 60,
}: BorderFrameProps) {
  
  // Taille de la zone de coin avec rayures
  const cornerSize = 30;
  
  return (
    <View style={styles.container} pointerEvents="none">
      
      {/* ═══════════ RAYURES COIN HAUT-GAUCHE ═══════════ */}
      <View style={[
        styles.cornerZone,
        {
          top: topOffset + thickness,
          left: margin + thickness,
          width: cornerSize,
          height: cornerSize,
        }
      ]}>
        {[...Array(7)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.stripe, 
              { 
                left: i * 7 - 12,
                backgroundColor: color,
              }
            ]} 
          />
        ))}
      </View>
      
      {/* ═══════════ RAYURES COIN HAUT-DROIT ═══════════ */}
      <View style={[
        styles.cornerZone,
        {
          top: topOffset + thickness,
          right: margin + thickness,
          width: cornerSize,
          height: cornerSize,
          transform: [{ scaleX: -1 }],
        }
      ]}>
        {[...Array(7)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.stripe,
              { 
                left: i * 7 - 12,
                backgroundColor: color,
              }
            ]} 
          />
        ))}
      </View>
      
      {/* ═══════════ LIGNES PRINCIPALES ═══════════ */}
      
      {/* Ligne du HAUT */}
      <View 
        style={[
          styles.line,
          { 
            backgroundColor: color,
            height: thickness,
            left: margin,
            right: margin,
            top: topOffset,
          }
        ]} 
      />
      
      {/* Ligne GAUCHE */}
      <View 
        style={[
          styles.line,
          { 
            backgroundColor: color,
            width: thickness,
            left: margin,
            top: topOffset,
            height: `${sideHeightPercent}%`,
          }
        ]} 
      />
      
      {/* Ligne DROITE */}
      <View 
        style={[
          styles.line,
          { 
            backgroundColor: color,
            width: thickness,
            right: margin,
            top: topOffset,
            height: `${sideHeightPercent}%`,
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  line: {
    position: 'absolute',
  },
  
  // Zone du coin avec rayures - Plus transparent
  cornerZone: {
    position: 'absolute',
    overflow: 'hidden',
    opacity: 0.3,
  },
  
  // Rayure diagonale
  stripe: {
    position: 'absolute',
    width: 2,
    height: 60,
    transform: [{ rotate: '45deg' }],
    top: -15,
  },
});
