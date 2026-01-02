import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête de bienvenue */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenue sur</Text>
          <Text style={styles.appName}>MonGaz+</Text>
          <Text style={styles.subtitle}>
            Vérification d'Étanchéité Apparente
          </Text>
        </View>

        {/* Bouton principal VEA */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.push('/vea')}
          activeOpacity={0.8}
        >
          <View style={styles.mainButtonIcon}>
            <Text style={styles.mainButtonIconText}>🔍</Text>
          </View>
          <View style={styles.mainButtonContent}>
            <Text style={styles.mainButtonTitle}>Nouvelle VEA</Text>
            <Text style={styles.mainButtonSubtitle}>
              Démarrer une vérification d'étanchéité
            </Text>
          </View>
          <Text style={styles.mainButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* Actions rapides */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/historique')}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionTitle}>Historique</Text>
            <Text style={styles.quickActionSubtitle}>Voir mes interventions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/guides')}
          >
            <Text style={styles.quickActionIcon}>📖</Text>
            <Text style={styles.quickActionTitle}>Guides</Text>
            <Text style={styles.quickActionSubtitle}>Procédures & aide</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques (placeholder) */}
        <Text style={styles.sectionTitle}>Résumé</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>VEA aujourd'hui</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Ce mois</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.veaOk }]}>100%</Text>
            <Text style={styles.statLabel}>Taux OK</Text>
          </View>
        </View>

        {/* Info version */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>MonGaz+ v1.0.0</Text>
          <Text style={styles.versionSubtext}>Application de terrain pour techniciens gaz</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  welcomeText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  appName: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.primary,
    marginVertical: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  mainButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
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
    fontSize: FontSizes.xl,
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
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  quickActionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  quickActionSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  versionInfo: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  versionText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  versionSubtext: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
