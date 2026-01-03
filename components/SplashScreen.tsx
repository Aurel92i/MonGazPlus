/**
 * SplashScreen MonGaz+
 * 
 * Design professionnel et épuré
 * Style minimaliste avec compteur stylisé
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de la barre de progression
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Fond avec motif subtil */}
      <View style={styles.backgroundPattern}>
        {/* Lignes de grille subtiles */}
        {[...Array(8)].map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 12}%` }]} />
        ))}
        {[...Array(6)].map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 16}%` }]} />
        ))}
      </View>

      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        
        {/* Illustration compteur stylisé */}
        <View style={styles.illustrationContainer}>
          {/* Cercle externe */}
          <View style={styles.outerRing}>
            {/* Indicateurs autour du cercle */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <View 
                key={i} 
                style={[
                  styles.tickMark,
                  { transform: [{ rotate: `${deg}deg` }, { translateY: -85 }] }
                ]} 
              />
            ))}
            
            {/* Cercle intermédiaire */}
            <View style={styles.middleRing}>
              {/* Compteur central */}
              <View style={styles.meterDisplay}>
                {/* En-tête du compteur */}
                <View style={styles.meterHeader}>
                  <View style={styles.meterHeaderLine} />
                  <View style={styles.meterHeaderDot} />
                  <View style={styles.meterHeaderLine} />
                </View>
                
                {/* Afficheur digital */}
                <View style={styles.digitalDisplay}>
                  <Text style={styles.digitalText}>00075</Text>
                  <View style={styles.digitalUnit}>
                    <Text style={styles.unitText}>m³</Text>
                  </View>
                </View>
                
                {/* Barre de statut */}
                <View style={styles.statusBar}>
                  <View style={styles.statusDot} />
                  <View style={styles.statusLine} />
                  <View style={[styles.statusDot, styles.statusDotActive]} />
                </View>
              </View>
            </View>
          </View>
          
          {/* Éléments de connexion */}
          <View style={styles.connectionLine} />
          <View style={styles.connectionNode} />
        </View>

        {/* Logo texte */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            Mon<Text style={styles.logoAccent}>Gaz</Text>
            <Text style={styles.logoPlus}>+</Text>
          </Text>
        </View>

        {/* Slogan */}
        <View style={styles.sloganContainer}>
          <View style={styles.sloganDivider} />
          <Text style={styles.sloganMain}>Vérification d'étanchéité simplifiée</Text>
          <Text style={styles.sloganSub}>PROFESSIONNELS & PARTICULIERS</Text>
        </View>

      </Animated.View>

      {/* Barre de chargement */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingTrack}>
          <Animated.View style={[styles.loadingBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingText}>Initialisation...</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  
  // Fond avec motif
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFF',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#FFF',
  },

  // Contenu principal
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },

  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  outerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickMark: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.4)',
  },
  middleRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  meterDisplay: {
    width: 120,
    height: 90,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    padding: 10,
    justifyContent: 'space-between',
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  meterHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginHorizontal: 8,
  },
  digitalDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  digitalText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#4ADE80',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  digitalUnit: {
    marginLeft: 4,
    marginBottom: 4,
  },
  unitText: {
    fontSize: 10,
    color: 'rgba(74, 222, 128, 0.6)',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusDotActive: {
    backgroundColor: '#4ADE80',
  },
  statusLine: {
    width: 30,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 6,
  },
  connectionLine: {
    width: 2,
    height: 30,
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    marginTop: -1,
  },
  connectionNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    backgroundColor: '#0F172A',
  },

  // Logo
  logoContainer: {
    marginBottom: 16,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '200',
    color: '#FFF',
    letterSpacing: -1,
  },
  logoAccent: {
    fontWeight: '600',
    color: '#4ADE80',
  },
  logoPlus: {
    fontWeight: '700',
    color: '#F97316',
  },

  // Slogan
  sloganContainer: {
    alignItems: 'center',
  },
  sloganDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(74, 222, 128, 0.4)',
    marginBottom: 16,
  },
  sloganMain: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
    marginBottom: 8,
  },
  sloganSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 3,
    fontWeight: '500',
  },

  // Loading
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  loadingTrack: {
    width: '100%',
    maxWidth: 200,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 1,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 12,
    letterSpacing: 1,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
  },
});

