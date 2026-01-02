import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

interface GuideItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'procedure' | 'securite' | 'aide';
}

const GUIDES: GuideItem[] = [
  {
    id: '1',
    icon: '🔍',
    title: 'Procédure VEA complète',
    description: 'Guide pas à pas pour effectuer une vérification d\'étanchéité apparente',
    category: 'procedure',
  },
  {
    id: '2',
    icon: '📸',
    title: 'Bien photographier le compteur',
    description: 'Conseils pour une prise de vue optimale et une analyse précise',
    category: 'procedure',
  },
  {
    id: '3',
    icon: '⚠️',
    title: 'Conduite à tenir en cas de fuite',
    description: 'Procédure d\'urgence et actions immédiates',
    category: 'securite',
  },
  {
    id: '4',
    icon: '🔧',
    title: 'Types de compteurs gaz',
    description: 'Identification et spécificités des différents modèles',
    category: 'aide',
  },
  {
    id: '5',
    icon: '📊',
    title: 'Comprendre les résultats',
    description: 'Interprétation des verdicts OK, Doute et Fuite',
    category: 'aide',
  },
  {
    id: '6',
    icon: '🏠',
    title: 'Remise en service',
    description: 'Étapes de la remise en gaz après intervention',
    category: 'procedure',
  },
];

function GuideCard({ item }: { item: GuideItem }) {
  const getCategoryColor = (category: GuideItem['category']) => {
    switch (category) {
      case 'procedure':
        return Colors.info;
      case 'securite':
        return Colors.error;
      case 'aide':
        return Colors.primary;
    }
  };

  return (
    <TouchableOpacity style={styles.guideCard} activeOpacity={0.7}>
      <View style={styles.guideIconContainer}>
        <Text style={styles.guideIcon}>{item.icon}</Text>
      </View>
      <View style={styles.guideContent}>
        <Text style={styles.guideTitle}>{item.title}</Text>
        <Text style={styles.guideDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(item.category) }]} />
    </TouchableOpacity>
  );
}

export default function GuidesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Procédures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Procédures</Text>
          {GUIDES.filter(g => g.category === 'procedure').map(guide => (
            <GuideCard key={guide.id} item={guide} />
          ))}
        </View>

        {/* Section Sécurité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Sécurité</Text>
          {GUIDES.filter(g => g.category === 'securite').map(guide => (
            <GuideCard key={guide.id} item={guide} />
          ))}
        </View>

        {/* Section Aide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Aide</Text>
          {GUIDES.filter(g => g.category === 'aide').map(guide => (
            <GuideCard key={guide.id} item={guide} />
          ))}
        </View>

        {/* Contact support */}
        <View style={styles.supportCard}>
          <Text style={styles.supportIcon}>💬</Text>
          <Text style={styles.supportTitle}>Besoin d'aide ?</Text>
          <Text style={styles.supportText}>
            Contactez le support technique pour toute question sur l'utilisation de l'application.
          </Text>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Contacter le support</Text>
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
    lineHeight: 18,
  },
  categoryIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  supportCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  supportIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  supportTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  supportText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: Colors.primary,
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
