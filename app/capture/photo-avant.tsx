import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

/**
 * Écran de capture Photo AVANT
 * Partagé entre Technicien et Particulier
 * 
 * TODO Étape 2 : Implémenter
 * - Accès caméra avec expo-camera
 * - Barre de stabilisation (niveau)
 * - Cadre d'alignement intelligent
 * - Prise de photo avec métadonnées
 */

export default function PhotoAvantScreen() {
  const router = useRouter();

  const handleCapture = () => {
    router.replace('/capture/photo-apres');
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepIndicator}>Étape 1/2</Text>
          <Text style={styles.title}>Photo AVANT</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Zone caméra (placeholder) */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraPlaceholderIcon}>📷</Text>
          <Text style={styles.cameraPlaceholderText}>
            Zone de prévisualisation caméra
          </Text>
          <Text style={styles.cameraPlaceholderSubtext}>
            (Sera implémenté à l'étape 2)
          </Text>
        </View>

        {/* Cadre d'alignement */}
        <View style={styles.alignmentFrame}>
          <View style={styles.frameCorner} />
          <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
          <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
          <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
          
          {/* Indicateur de zone décimale */}
          <View style={styles.decimalZoneIndicator}>
            <Text style={styles.decimalZoneText}>Zone décimale</Text>
          </View>
        </View>
      </View>

      {/* Barre de stabilisation */}
      <View style={styles.stabilizationBar}>
        <View style={styles.levelIndicator}>
          <View style={styles.levelBubble} />
        </View>
        <Text style={styles.stabilizationText}>
          Maintenez le téléphone stable et droit
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📸 Cadrez le compteur</Text>
        <Text style={styles.instructionsText}>
          Placez les chiffres rouges (décimales) dans le cadre.
          Le cadre deviendra vert quand c'est bon.
        </Text>
      </View>

      {/* Bouton de capture */}
      <View style={styles.captureContainer}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          activeOpacity={0.8}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        <Text style={styles.captureHint}>Appuyez pour capturer</Text>
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
  cameraPlaceholderIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  cameraPlaceholderText: {
    color: '#666',
    fontSize: FontSizes.md,
  },
  cameraPlaceholderSubtext: {
    color: '#444',
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
    borderColor: Colors.frameNotAligned,
    borderRadius: BorderRadius.md,
  },
  frameCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.frameNotAligned,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    top: -2,
    left: -2,
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
  decimalZoneIndicator: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  decimalZoneText: {
    color: Colors.frameNotAligned,
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  stabilizationBar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  levelIndicator: {
    width: 120,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    marginBottom: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  levelBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.warning,
  },
  stabilizationText: {
    color: '#AAA',
    fontSize: FontSizes.sm,
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
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
  },
  captureHint: {
    color: '#888',
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
  },
});
