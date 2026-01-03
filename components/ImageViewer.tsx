/**
 * ImageViewer - Visualiseur d'images avec pinch-to-zoom et déplacement
 * Comportement similaire à l'app Photos native
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
  uri: string | undefined;
  placeholder?: React.ReactNode;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ uri, placeholder }) => {
  // Scale et position
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Valeurs de base pour les gestes
  const baseScale = useRef(1);
  const pinchScale = useRef(1);
  const lastOffset = useRef({ x: 0, y: 0 });
  const lastDistance = useRef(0);

  // Calculer la distance entre deux doigts
  const getDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 2) {
          // Début du pinch
          lastDistance.current = getDistance(touches);
          baseScale.current = pinchScale.current;
        } else {
          // Début du pan
          lastOffset.current = {
            x: (translateX as any)._value || 0,
            y: (translateY as any)._value || 0,
          };
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 2) {
          // Pinch zoom
          const currentDistance = getDistance(touches);
          if (lastDistance.current > 0) {
            const newScale = baseScale.current * (currentDistance / lastDistance.current);
            const clampedScale = Math.max(1, Math.min(5, newScale));
            pinchScale.current = clampedScale;
            scale.setValue(clampedScale);
          }
        } else if (touches.length === 1 && pinchScale.current > 1) {
          // Pan (seulement si zoomé)
          const maxOffsetX = (pinchScale.current - 1) * SCREEN_WIDTH / 2;
          const maxOffsetY = (pinchScale.current - 1) * SCREEN_HEIGHT / 3;
          
          const newX = Math.max(-maxOffsetX, Math.min(maxOffsetX, lastOffset.current.x + gestureState.dx));
          const newY = Math.max(-maxOffsetY, Math.min(maxOffsetY, lastOffset.current.y + gestureState.dy));
          
          translateX.setValue(newX);
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: () => {
        // Si le zoom est < 1, revenir à 1
        if (pinchScale.current < 1) {
          pinchScale.current = 1;
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
        
        // Si le zoom revient à 1, recentrer
        if (pinchScale.current <= 1.05) {
          pinchScale.current = 1;
          Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start();
          lastOffset.current = { x: 0, y: 0 };
        } else {
          // Sauvegarder l'offset actuel
          lastOffset.current = {
            x: (translateX as any)._value || 0,
            y: (translateY as any)._value || 0,
          };
        }
      },
    })
  ).current;

  // Double tap pour zoomer/dézoomer
  const lastTap = useRef(0);
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap détecté
      if (pinchScale.current > 1) {
        // Dézoomer
        pinchScale.current = 1;
        baseScale.current = 1;
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        ]).start();
        lastOffset.current = { x: 0, y: 0 };
      } else {
        // Zoomer à 2.5x
        pinchScale.current = 2.5;
        baseScale.current = 2.5;
        Animated.spring(scale, { toValue: 2.5, useNativeDriver: true }).start();
      }
    }
    lastTap.current = now;
  };

  if (!uri) {
    return (
      <View style={styles.placeholderContainer}>
        {placeholder}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={styles.imageWrapper}
        {...panResponder.panHandlers}
        onTouchEnd={handleTap}
      >
        <Animated.Image
          source={{ uri }}
          style={[
            styles.image,
            {
              transform: [
                { scale },
                { translateX },
                { translateY },
              ],
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageViewer;
