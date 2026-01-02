import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const GUIDES_PRO = [
  {
    id: '1',
    icon: '🔍',
    title: 'Procédure VEA complète',
    description: 'Guide détaillé pour les techniciens certifiés',
    category: 'procedure',
  },
  {
    id: '2',
    icon: '📸',
    title: 'Prise de vue optimale',
    description: 'Techniques avancées pour une analyse précise',
    category: 'procedure',
  },
  {
    id: '3',
    icon: '⚠️',
    title: 'Gestion des fuites',
    description: 'Protocole d\'urgence et mise en sécurité',
    category: 'securite',
  },
  {
    id: '4',
    icon: '🔧',
    title: 'Types de compteurs',
    description: 'Itron, AEM, Pietro Fiorentini et autres',
    category: 'technique',
  },
  {
    id: '5',
    icon: '📊',
    title: 'Interprétation avancée',
    description: 'Analyse des micro-oscillations et cas limites',
    category: 'technique',
  },
  {
    id: '6',
    icon: '✍️',
    title: 'Signature électronique',
    description: 'Validation client et traçabilité',
    category: 'procedure',
  },
  {
    id: '7',
    icon: '📄',
    title: 'Rapports d\'intervention',
    description: 'Génération et archivage des PDF',
    category: 'procedure',
  },
  {
    id: '8',
    icon: '⚡',
    title: 'Remise en service',
    description: 'Procédure complète après validation VEA',
    category: 'procedure',
  },
];

function GuideCard({ item }: { item: typeof GUIDES_PRO[0] }) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'procedure': return Colors.technicien;
      case 'securite': return Colors.error;
      case 'technique': return Colors.primary;
      default: return Colors.textMuted;
    }
  };

  return (
    <TouchableOpacity style={styles.guideCard} activeOpacity={0.7}>
      <View style={styles.guideIconContainer}>
        <Text style={styles.guideIcon}>{item.icon}</Text>
      </View>
      <View style={styles.guideContent}>
        <Text style={styles.guideTitle}>{item.title}</Text>
        <Text style={styles.guideDescription}>{item.description}</Text>
      </View>
      <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(item.category) }]} />
    </TouchableOpacity>
  );
}

export default function TechnicienGuidesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge Pro */}
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeIcon}>👷</Text>
          <Text style={styles.proBadgeText}>Documentation Professionnelle</Text>
        </View>

        {/* Section Procédures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Procédures</Text>
          {GUIDES_PRO.filter(g => g.category === 'procedure').map(guide => (
            <GuideCard key={guide.id} item={guide} />
          ))}
        </View>

        {/* Section Sécurité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Sécurité</Text>
          {GUIDES_PRO.filter(g => g.category === 'securite').map(guide => (
            <GuideCard key={guide.id} item={guide} />
          ))}
        </View>

        {/* Section Technique */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Technique</Text>
          {GUIDES_PRO.filter(g => g.category === 'technique').map(guide => (
            <GuideCard key={guide.id} item={guide} />
          ))}
        </View>

        {/* Contact support pro */}
        <View style={styles.supportCard}>
          <Text style={styles.supportIcon}>📞</Text>
          <Text style={styles.supportTitle}>Support Technique Pro</Text>
          <Text style={styles.supportText}>
            Ligne directe pour les techniciens certifiés
          </Text>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Appeler le support</Text>
          </TouchableOpacity>
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
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.technicienLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.technicien,
    gap: Spacing.sm,
  },
  proBadgeIcon: {
    fontSize: 20,
  },
  proBadgeText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.technicien,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  guideCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  guideIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  guideIcon: {
    fontSize: 24,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  guideDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  categoryIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  supportCard: {
    backgroundColor: Colors.technicienLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.technicien,
  },
  supportIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  supportTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.technicien,
    marginBottom: Spacing.xs,
  },
  supportText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  supportButton: {
    backgroundColor: Colors.technicien,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  supportButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
