import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

export default function PhotoApresScreen() {
  const router = useRouter();
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCapture = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    router.replace('/analyse/resultat');
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    router.back();
  };

  const isTimeRecommended = elapsedTime >= 180;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepIndicator}>Étape 2/2</Text>
          <Text style={styles.title}>Photo APRÈS</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Timer */}
      <View style={[
        styles.timerContainer,
        isTimeRecommended && styles.timerContainerReady
      ]}>
        <Text style={styles.timerLabel}>⏱️ Temps écoulé</Text>
        <Text style={[
          styles.timerValue,
          isTimeRecommended && styles.timerValueReady
        ]}>
          {formatTime(elapsedTime)}
        </Text>
        {!isTimeRecommended ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((elapsedTime / 180) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.timerHint}>
              Attendez encore {formatTime(180 - elapsedTime)}
            </Text>
          </View>
        ) : (
          <Text style={styles.timerReady}>✓ Temps recommandé atteint !</Text>
        )}
      </View>

      {/* Zone caméra avec mode fantôme */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPlaceholder}>
          <View style={styles.ghostOverlay}>
            <Text style={styles.ghostText}>👻</Text>
            <Text style={styles.ghostLabel}>Mode fantôme actif</Text>
            <Text style={styles.ghostSubtext}>
              Alignez sur la photo précédente
            </Text>
          </View>
        </View>

        {/* Cadre d'alignement */}
        <View style={[
          styles.alignmentFrame,
          isTimeRecommended && styles.alignmentFrameReady
        ]}>
          <View style={[styles.frameCorner, isTimeRecommended && styles.frameCornerReady]} />
          <View style={[styles.frameCorner, styles.frameCornerTopRight, isTimeRecommended && styles.frameCornerReady]} />
          <View style={[styles.frameCorner, styles.frameCornerBottomLeft, isTimeRecommended && styles.frameCornerReady]} />
          <View style={[styles.frameCorner, styles.frameCornerBottomRight, isTimeRecommended && styles.frameCornerReady]} />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          {isTimeRecommended ? '✅ Prêt !' : '⏳ Patientez...'}
        </Text>
        <Text style={styles.instructionsText}>
          {isTimeRecommended 
            ? 'Alignez exactement comme la première photo et capturez.' 
            : 'Le gaz doit rester coupé pendant ce temps pour un test fiable.'}
        </Text>
      </View>

      {/* Bouton de capture */}
      <View style={styles.captureContainer}>
        <TouchableOpacity
          style={[
            styles.captureButton,
            isTimeRecommended && styles.captureButtonReady
          ]}
          onPress={handleCapture}
          activeOpacity={0.8}
        >
          <View style={[
            styles.captureButtonInner,
            isTimeRecommended && styles.captureButtonInnerReady
          ]} />
        </TouchableOpacity>
        <Text style={styles.captureHint}>
          {isTimeRecommended 
            ? 'Appuyez pour capturer' 
            : 'Vous pouvez capturer avant si besoin'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: FontSizes.xl,
  },
  headerCenter: {
    alignItems: 'center',
  },
  stepIndicator: {
    color: Colors.primary,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  title: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  timerContainerReady: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 2,
    borderColor: Colors.veaOk,
  },
  timerLabel: {
    color: '#AAA',
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  timerValue: {
    color: '#FFF',
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerValueReady: {
    color: Colors.veaOk,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  timerHint: {
    color: '#888',
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
  },
  timerReady: {
    color: Colors.veaOk,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  cameraContainer: {
    flex: 1,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostOverlay: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ghostText: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  ghostLabel: {
    color: '#888',
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  ghostSubtext: {
    color: '#555',
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  alignmentFrame: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    height: '30%',
    borderWidth: 2,
    borderColor: Colors.frameAlmostAligned,
    borderRadius: BorderRadius.md,
  },
  alignmentFrameReady: {
    borderColor: Colors.frameAligned,
  },
  frameCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.frameAlmostAligned,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    top: -2,
    left: -2,
  },
  frameCornerReady: {
    borderColor: Colors.frameAligned,
  },
  frameCornerTopRight: {
    left: undefined,
    right: -2,
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  frameCornerBottomLeft: {
    top: undefined,
    bottom: -2,
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  frameCornerBottomRight: {
    top: undefined,
    left: undefined,
    right: -2,
    bottom: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionsContainer: {
    padding: Spacing.md,
  },
  instructionsTitle: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  instructionsText: {
    color: '#AAA',
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  captureContainer: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  captureButtonReady: {
    borderColor: Colors.veaOk,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
  },
  captureButtonInnerReady: {
    backgroundColor: Colors.veaOk,
  },
  captureHint: {
    color: '#888',
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
  },
});
