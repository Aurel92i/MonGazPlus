import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

export default function TechnicienVEAScreen() {
  const router = useRouter();
  const [meterSerial, setMeterSerial] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const handleStartVEA = () => {
    router.push('/capture/photo-avant');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Informations intervention (technicien only) */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📝 Informations intervention</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>N° Compteur (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 20-757109"
              placeholderTextColor={Colors.textMuted}
              value={meterSerial}
              onChangeText={setMeterSerial}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Adresse client (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 15 rue de la Paix, Paris"
              placeholderTextColor={Colors.textMuted}
              value={clientAddress}
              onChangeText={setClientAddress}
            />
          </View>

          <TouchableOpacity style={styles.geoButton}>
            <Text style={styles.geoButtonIcon}>📍</Text>
            <Text style={styles.geoButtonText}>Géolocaliser automatiquement</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Procédure VEA</Text>
          <View style={styles.instructionsList}>
            {[
              'Fermer le robinet d\'arrêt général',
              'Prendre une photo du compteur (AVANT)',
              'Attendre le temps souhaité (min. 3 minutes)',
              'Prendre une seconde photo (APRÈS)',
              'Vérifier le verdict et faire signer le client',
            ].map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rappel de sécurité */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Rappel de sécurité</Text>
            <Text style={styles.warningText}>
              En cas de fuite détectée, couper immédiatement 
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
            L'application analyse les 3 chiffres rouges et la graduation 
            pour détecter le moindre mouvement, y compris les micro-oscillations.
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
          <Text style={styles.startButtonText}>🔍 Démarrer la VEA</Text>
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
  infoCard: {
    backgroundColor: Colors.technicienLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.technicien,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.technicien,
    marginBottom: Spacing.md,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  geoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.technicien,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  geoButtonIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  geoButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '500',
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
    backgroundColor: Colors.technicien,
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
    backgroundColor: Colors.technicien,
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
