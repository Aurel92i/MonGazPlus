import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { Particulier, isParticulier } from '@/types';

export default function ParticulierHomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const particulier = user && isParticulier(user) ? user : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bienvenue */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeEmoji}>👋</Text>
          <Text style={styles.welcomeText}>
            Bonjour {particulier?.firstName} !
          </Text>
          <Text style={styles.welcomeSubtext}>
            Bienvenue sur votre espace MonGaz+
          </Text>
        </View>

        {/* Bouton principal VEA */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.push('/(particulier)/vea')}
          activeOpacity={0.8}
        >
          <View style={styles.mainButtonIcon}>
            <Text style={styles.mainButtonIconText}>🔍</Text>
          </View>
          <View style={styles.mainButtonContent}>
            <Text style={styles.mainButtonTitle}>Vérifier mon installation</Text>
            <Text style={styles.mainButtonSubtitle}>
              Test d'étanchéité simple et rapide
            </Text>
          </View>
          <Text style={styles.mainButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* Info compteur (si renseigné) */}
        {particulier?.meterNumber && (
          <View style={styles.meterCard}>
            <Text style={styles.meterIcon}>🔢</Text>
            <View style={styles.meterInfo}>
              <Text style={styles.meterLabel}>Mon compteur</Text>
              <Text style={styles.meterNumber}>{particulier.meterNumber}</Text>
            </View>
            {particulier.gasProvider && (
              <View style={styles.providerBadge}>
                <Text style={styles.providerText}>{particulier.gasProvider}</Text>
              </View>
            )}
          </View>
        )}

        {/* Conseils sécurité */}
        <Text style={styles.sectionTitle}>💡 Conseils sécurité</Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>👃</Text>
            <Text style={styles.tipText}>
              Le gaz est odorisé. Si vous sentez une odeur inhabituelle, aérez et appelez le numéro d'urgence.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🔧</Text>
            <Text style={styles.tipText}>
              Faites vérifier votre installation par un professionnel tous les ans.
            </Text>
          </View>
        </View>

        {/* Relevé d'index */}
        <TouchableOpacity
          style={styles.releveButton}
          onPress={() => router.push('/(particulier)/releve-index')}
          activeOpacity={0.8}
        >
          <View style={styles.releveButtonIcon}>
            <Text style={styles.releveButtonIconText}>📊</Text>
          </View>
          <View style={styles.releveButtonContent}>
            <Text style={styles.releveButtonTitle}>Relevé d'index</Text>
            <Text style={styles.releveButtonSubtitle}>
              Photographiez votre compteur pour obtenir l'index
            </Text>
          </View>
          <Text style={styles.releveButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* Actions rapides */}
        <Text style={styles.sectionTitle}>⚡ Accès rapide</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(particulier)/historique')}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionTitle}>Historique</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(particulier)/aide')}
          >
            <Text style={styles.quickActionIcon}>❓</Text>
            <Text style={styles.quickActionTitle}>Aide</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionCard, styles.emergencyCard]}>
            <Text style={styles.quickActionIcon}>🚨</Text>
            <Text style={[styles.quickActionTitle, styles.emergencyText]}>Urgence</Text>
          </TouchableOpacity>
        </View>

        {/* Numéro d'urgence */}
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyBannerIcon}>📞</Text>
          <View style={styles.emergencyBannerContent}>
            <Text style={styles.emergencyBannerTitle}>Urgence Gaz</Text>
            <Text style={styles.emergencyBannerNumber}>0 800 47 33 33</Text>
            <Text style={styles.emergencyBannerSubtext}>Appel gratuit 24h/24</Text>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.xxl,
  },
  welcomeCard: {
    backgroundColor: Colors.particulierLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.particulier,
  },
  welcomeEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  welcomeSubtext: {
    fontSize: FontSizes.md,
    color: Colors.particulier,
    marginTop: 4,
  },
  mainButton: {
    backgroundColor: Colors.particulier,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  mainButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonIconText: {
    fontSize: 28,
  },
  mainButtonContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  mainButtonTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  mainButtonSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  mainButtonArrow: {
    fontSize: FontSizes.xxl,
    color: Colors.textOnPrimary,
  },
  releveButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: '#3B82F6',
    ...Shadows.sm,
  },
  releveButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  releveButtonIconText: {
    fontSize: 28,
  },
  releveButtonContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  releveButtonTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  releveButtonSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  releveButtonArrow: {
    fontSize: FontSizes.xxl,
    color: '#3B82F6',
  },
  meterCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  meterIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  meterInfo: {
    flex: 1,
  },
  meterLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  meterNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  providerBadge: {
    backgroundColor: Colors.particulierLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  providerText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.particulier,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tipsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tipCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  emergencyCard: {
    backgroundColor: Colors.veaFuiteLight,
    borderWidth: 1,
    borderColor: Colors.veaFuite,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  quickActionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  emergencyText: {
    color: Colors.veaFuite,
  },
  emergencyBanner: {
    backgroundColor: Colors.veaFuiteLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.veaFuite,
  },
  emergencyBannerIcon: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  emergencyBannerContent: {
    flex: 1,
  },
  emergencyBannerTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.veaFuite,
  },
  emergencyBannerNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.veaFuite,
  },
  emergencyBannerSubtext: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
});
