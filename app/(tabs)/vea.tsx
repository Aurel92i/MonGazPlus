import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

export default function VEAScreen() {
  const router = useRouter();
  const [meterSerial, setMeterSerial] = useState<string>('');

  const handleStartVEA = () => {
    router.push('/capture/photo-avant');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Procédure VEA</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Fermer le robinet d'arrêt général
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Prendre une photo du compteur (AVANT)
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Attendre le temps souhaité (min. 3 minutes recommandé)
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                Prendre une seconde photo (APRÈS)
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>5</Text>
              </View>
              <Text style={styles.instructionText}>
                L'application analyse et donne le verdict
              </Text>
            </View>
          </View>
        </View>

        {/* Rappel de sécurité */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Rappel de sécurité</Text>
            <Text style={styles.warningText}>
              En cas de doute ou de fuite détectée, couper immédiatement 
              l'alimentation gaz et aérer les locaux.
            </Text>
          </View>
        </View>

        {/* Zone décimale - explication visuelle */}
        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>🔍 Zone analysée</Text>
          <View style={styles.meterVisualization}>
            <View style={styles.meterDisplay}>
              <View style={styles.digitBlack}><Text style={styles.digitText}>0</Text></View>
              <View style={styles.digitBlack}><Text style={styles.digitText}>3</Text></View>
              <View style={styles.digitBlack}><Text style={styles.digitText}>3</Text></View>
              <View style={styles.digitBlack}><Text style={styles.digitText}>0</Text></View>
              <Text style={styles.comma}>,</Text>
              <View style={styles.digitRed}><Text style={styles.digitTextWhite}>9</Text></View>
              <View style={styles.digitRed}><Text style={styles.digitTextWhite}>7</Text></View>
              <View style={styles.digitRed}><Text style={styles.digitTextWhite}>1</Text></View>
            </View>
            <View style={styles.zoneHighlight}>
              <Text style={styles.zoneLabel}>← Zone décimale analysée</Text>
            </View>
          </View>
          <Text style={styles.explanationText}>
            L'application analyse précisément les 3 chiffres rouges et la 
            graduation pour détecter le moindre mouvement.
          </Text>
        </View>
      </ScrollView>

      {/* Bouton démarrer */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartVEA}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Démarrer la VEA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  instructionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  instructionsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  instructionsList: {
    gap: Spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 22,
  },
  warningCard: {
    backgroundColor: Colors.veaFuiteLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.veaFuite,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.veaFuite,
    marginBottom: 4,
  },
  warningText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  explanationCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  explanationTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  meterVisualization: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  meterDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  digitBlack: {
    width: 28,
    height: 36,
    backgroundColor: Colors.meterDigitBlack,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitRed: {
    width: 28,
    height: 36,
    backgroundColor: Colors.meterDigitRed,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  digitTextWhite: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  comma: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginHorizontal: 2,
  },
  zoneHighlight: {
    marginTop: Spacing.sm,
    alignItems: 'flex-end',
    paddingRight: Spacing.md,
  },
  zoneLabel: {
    fontSize: FontSizes.xs,
    color: Colors.meterDigitRed,
    fontWeight: '500',
  },
  explanationText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  startButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
});
