import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { Technicien, isTechnicien } from '@/types';

export default function TechnicienHomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Type guard pour accéder aux propriétés technicien
  const technicien = user && isTechnicien(user) ? user : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge technicien */}
        <View style={styles.badgeCard}>
          <View style={styles.badgeHeader}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeIconText}>👷</Text>
            </View>
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeName}>{technicien?.fullName}</Text>
              <Text style={styles.badgeCompany}>{technicien?.company}</Text>
              <Text style={styles.badgeNumber}>Badge: {technicien?.badge}</Text>
            </View>
          </View>
          {technicien?.certifications && technicien.certifications.length > 0 && (
            <View style={styles.certifications}>
              {technicien.certifications.map((cert, index) => (
                <View key={index} style={styles.certBadge}>
                  <Text style={styles.certText}>{cert}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bouton principal VEA */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.push('/(technicien)/vea')}
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

        {/* Statistiques */}
        <Text style={styles.sectionTitle}>📊 Mes statistiques</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Aujourd'hui</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Cette semaine</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.veaOk }]}>
              {technicien?.totalInterventions || 0}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Actions rapides */}
        <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(technicien)/historique')}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionTitle}>Historique</Text>
            <Text style={styles.quickActionSubtitle}>Interventions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(technicien)/guides')}
          >
            <Text style={styles.quickActionIcon}>📖</Text>
            <Text style={styles.quickActionTitle}>Guides Pro</Text>
            <Text style={styles.quickActionSubtitle}>Procédures</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <Text style={styles.quickActionIcon}>📄</Text>
            <Text style={styles.quickActionTitle}>Rapports</Text>
            <Text style={styles.quickActionSubtitle}>Export PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Zone d'intervention */}
        {technicien?.zone && (
          <View style={styles.zoneCard}>
            <Text style={styles.zoneIcon}>📍</Text>
            <View>
              <Text style={styles.zoneLabel}>Zone d'intervention</Text>
              <Text style={styles.zoneValue}>{technicien.zone}</Text>
            </View>
          </View>
        )}
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
  badgeCard: {
    backgroundColor: Colors.technicienLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.technicien,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.technicien,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconText: {
    fontSize: 32,
  },
  badgeInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  badgeName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  badgeCompany: {
    fontSize: FontSizes.md,
    color: Colors.technicien,
    fontWeight: '500',
  },
  badgeNumber: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  certifications: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.technicien,
  },
  certBadge: {
    backgroundColor: Colors.technicien,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  certText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  mainButton: {
    backgroundColor: Colors.technicien,
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
    color: Colors.technicien,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
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
  quickActionSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  zoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  zoneIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  zoneLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  zoneValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
});
