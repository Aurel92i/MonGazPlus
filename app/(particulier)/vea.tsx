import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

export default function ParticulierVEAScreen() {
  const router = useRouter();

  const handleStartVEA = () => {
    router.push('/capture/photo-avant');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction simple */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🔍</Text>
          <Text style={styles.introTitle}>Vérification d'étanchéité</Text>
          <Text style={styles.introText}>
            Ce test simple vous permet de vérifier si votre installation gaz 
            présente une fuite éventuelle.
          </Text>
        </View>

        {/* Rappel important - CORRIGÉ */}
        <View style={styles.reminderCard}>
          <Text style={styles.reminderIcon}>💡</Text>
          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>Avant de commencer</Text>
            <Text style={styles.reminderText}>
              <Text style={styles.reminderBold}>Robinets du compteur :</Text> LAISSEZ-LES OUVERTS{'\n'}
              <Text style={styles.reminderBold}>Brûleurs (gazinière, chaudière) :</Text> ÉTEIGNEZ-LES
            </Text>
          </View>
        </View>

        {/* Étapes simplifiées */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>📋 Comment ça marche ?</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Éteignez vos appareils</Text>
              <Text style={styles.stepText}>
                Éteignez gazinière, chaudière et chauffe-eau. Gardez le robinet du compteur ouvert.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Prenez une photo</Text>
              <Text style={styles.stepText}>
                Photographiez les chiffres de votre compteur. L'index sera relevé automatiquement.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Attendez 3 minutes</Text>
              <Text style={styles.stepText}>
                L'application vous guidera
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Reprenez une photo</Text>
              <Text style={styles.stepText}>
                Photographiez à nouveau votre compteur au même endroit
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, styles.stepNumberLast]}>
              <Text style={styles.stepNumberText}>✓</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Résultat instantané</Text>
              <Text style={styles.stepText}>
                L'application compare les index et vous donne le verdict
              </Text>
            </View>
          </View>
        </View>

        {/* Info OCR */}
        <View style={styles.ocrInfoCard}>
          <Text style={styles.ocrInfoIcon}>📊</Text>
          <View style={styles.ocrInfoContent}>
            <Text style={styles.ocrInfoTitle}>Relevé d'index automatique</Text>
            <Text style={styles.ocrInfoText}>
              L'application lit automatiquement les chiffres de votre compteur pour comparer les index avant/après.
            </Text>
          </View>
        </View>

        {/* Avertissement */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            <Text style={styles.warningBold}>Important : </Text>
            Ce test ne remplace pas une vérification par un professionnel. 
            En cas de doute, contactez un technicien agréé.
          </Text>
        </View>

        {/* Rappel odeur gaz */}
        <View style={styles.smellCard}>
          <Text style={styles.smellIcon}>👃</Text>
          <View style={styles.smellContent}>
            <Text style={styles.smellTitle}>Vous sentez une odeur de gaz ?</Text>
            <Text style={styles.smellText}>
              N'utilisez pas ce test ! Aérez immédiatement et appelez le :
            </Text>
            <Text style={styles.smellNumber}>0 800 47 33 33</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bouton démarrer */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartVEA}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>🔍 Commencer la vérification</Text>
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
  introCard: {
    backgroundColor: Colors.particulierLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.particulier,
  },
  introEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  introTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  introText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  reminderCard: {
    backgroundColor: Colors.veaOkLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.veaOk,
  },
  reminderIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.veaOk,
    marginBottom: 4,
  },
  reminderText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 22,
  },
  reminderBold: {
    fontWeight: '600',
  },
  stepsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  stepsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  step: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.particulier,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepNumberLast: {
    backgroundColor: Colors.veaOk,
  },
  stepNumberText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  stepText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ocrInfoCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ocrInfoIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  ocrInfoContent: {
    flex: 1,
  },
  ocrInfoTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  ocrInfoText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: Colors.veaDouteLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.veaDoute,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  warningBold: {
    fontWeight: '600',
  },
  smellCard: {
    backgroundColor: Colors.veaFuiteLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: Colors.veaFuite,
  },
  smellIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  smellContent: {
    flex: 1,
  },
  smellTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.veaFuite,
    marginBottom: 4,
  },
  smellText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    marginBottom: 4,
  },
  smellNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.veaFuite,
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
    backgroundColor: Colors.particulier,
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
