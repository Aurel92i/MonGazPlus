/**
 * BorderFrame - Guide d'alignement avec repères d'angle
 * 
 * Forme ⊓ ouverte avec arcs de cercle dans les coins pour aider au cadrage.
 * Les arcs ont un remplissage rayé semi-transparent (60%).
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface BorderFrameProps {
  /** Couleur de la ligne */
  color?: string;
  /** Épaisseur de la ligne */
  thickness?: number;
  /** Marge depuis les bords de l'écran */
  margin?: number;
  /** Hauteur des lignes latérales (en % de la hauteur disponible) */
  sideHeightPercent?: number;
  /** Décalage vertical depuis le haut */
  topOffset?: number;
}

export function BorderFrame({
  color = '#4ADE80',
  thickness = 4,
  margin = 80,
  sideHeightPercent = 55,
  topOffset = 60,
}: BorderFrameProps) {
  
  const cornerSize = 50; // Taille des arcs de coin
  
  return (
    <View style={styles.container} pointerEvents="none">
      
      {/* ═══════════ COIN HAUT-GAUCHE ═══════════ */}
      <View style={[styles.cornerContainer, { top: topOffset, left: margin }]}>
        {/* Arc de cercle */}
        <View style={[styles.cornerArc, styles.cornerTopLeft, { borderColor: color }]}>
          {/* Rayures diagonales */}
          <View style={styles.stripesContainer}>
            {[...Array(8)].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.stripe, 
                  { 
                    left: i * 8 - 20,
                    backgroundColor: color,
                  }
                ]} 
              />
            ))}
          </View>
        </View>
      </View>
      
      {/* ═══════════ COIN HAUT-DROIT ═══════════ */}
      <View style={[styles.cornerContainer, { top: topOffset, right: margin }]}>
        <View style={[styles.cornerArc, styles.cornerTopRight, { borderColor: color }]}>
          <View style={styles.stripesContainer}>
            {[...Array(8)].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.stripe, 
                  { 
                    left: i * 8 - 20,
                    backgroundColor: color,
                  }
                ]} 
              />
            ))}
          </View>
        </View>
      </View>
      
      {/* ═══════════ LIGNES PRINCIPALES ═══════════ */}
      
      {/* Ligne du HAUT */}
      <View 
        style={[
          styles.line,
          { 
            backgroundColor: color,
            height: thickness,
            left: margin + cornerSize,
            right: margin + cornerSize,
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
            top: topOffset + cornerSize,
            height: `${sideHeightPercent - 15}%`,
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
            top: topOffset + cornerSize,
            height: `${sideHeightPercent - 15}%`,
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
  
  // Conteneur de coin
  cornerContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
    overflow: 'hidden',
  },
  
  // Arc de cercle de base
  cornerArc: {
    width: 50,
    height: 50,
    borderWidth: 4,
    overflow: 'hidden',
  },
  
  // Coin haut-gauche
  cornerTopLeft: {
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  
  // Coin haut-droit
  cornerTopRight: {
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  
  // Container des rayures
  stripesContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4, // 60% transparent = 40% visible
    overflow: 'hidden',
  },
  
  // Rayure individuelle
  stripe: {
    position: 'absolute',
    width: 3,
    height: 100,
    transform: [{ rotate: '45deg' }],
    top: -20,
  },
});
