/**
 * Logo MonGaz+
 * 
 * Logo minimaliste et professionnel
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function LogoSimple({ size = 100, showText = true }: LogoProps) {
  const scale = size / 100;
  
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { width: size, height: size }]}>
        {/* Cercle externe */}
        <View style={[
          styles.outerRing, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth: 2 * scale,
          }
        ]}>
          {/* Cercle intermédiaire */}
          <View style={[
            styles.middleRing,
            {
              width: size * 0.8,
              height: size * 0.8,
              borderRadius: size * 0.4,
              borderWidth: 1 * scale,
            }
          ]}>
            {/* Compteur stylisé */}
            <View style={[
              styles.meterIcon,
              {
                width: size * 0.55,
                height: size * 0.4,
                borderRadius: 4 * scale,
              }
            ]}>
              {/* Indicateur supérieur */}
              <View style={[styles.meterDot, { width: 4 * scale, height: 4 * scale, borderRadius: 2 * scale }]} />
              {/* Afficheur */}
              <View style={[
                styles.meterScreen,
                {
                  paddingHorizontal: 6 * scale,
                  paddingVertical: 3 * scale,
                  borderRadius: 2 * scale,
                }
              ]}>
                <Text style={[styles.meterDigits, { fontSize: 10 * scale }]}>GAZ</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.logoText}>
            Mon<Text style={styles.logoTextAccent}>Gaz</Text>
            <Text style={styles.logoPlus}>+</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

// Export par défaut
export const Logo = LogoSimple;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    borderColor: 'rgba(74, 222, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleRing: {
    borderColor: 'rgba(74, 222, 128, 0.5)',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meterIcon: {
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  meterDot: {
    backgroundColor: '#4ADE80',
    position: 'absolute',
    top: 4,
  },
  meterScreen: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  meterDigits: {
    color: '#4ADE80',
    fontWeight: '700',
    letterSpacing: 1,
  },
  textContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '200',
    color: '#374151',
  },
  logoTextAccent: {
    fontWeight: '600',
    color: '#4ADE80',
  },
  logoPlus: {
    fontWeight: '700',
    color: '#F97316',
    fontSize: 32,
  },
});
