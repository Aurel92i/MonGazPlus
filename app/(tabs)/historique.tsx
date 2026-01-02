import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { VEAResult } from '@/types';

// Données de démonstration (sera remplacé par le store)
interface DemoIntervention {
  id: string;
  date: string;
  time: string;
  address: string;
  result: VEAResult;
  meterSerial: string;
}

const DEMO_DATA: DemoIntervention[] = [];

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Aucune intervention</Text>
      <Text style={styles.emptyText}>
        Vos vérifications d'étanchéité apparaîtront ici après avoir effectué votre première VEA.
      </Text>
    </View>
  );
}

function InterventionCard({ item }: { item: DemoIntervention }) {
  const getResultStyle = (result: VEAResult) => {
    switch (result) {
      case 'OK':
        return { bg: Colors.veaOkLight, color: Colors.veaOk, label: 'OK' };
      case 'DOUTE':
        return { bg: Colors.veaDouteLight, color: Colors.veaDoute, label: 'DOUTE' };
      case 'FUITE_PROBABLE':
        return { bg: Colors.veaFuiteLight, color: Colors.veaFuite, label: 'FUITE' };
    }
  };

  const resultStyle = getResultStyle(item.result);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardDate}>{item.date}</Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
        <View style={[styles.resultBadge, { backgroundColor: resultStyle.bg }]}>
          <Text style={[styles.resultText, { color: resultStyle.color }]}>
            {resultStyle.label}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardAddress} numberOfLines={1}>
          📍 {item.address}
        </Text>
        <Text style={styles.cardMeter}>
          🔢 {item.meterSerial}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoriqueScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Filtres (placeholder) */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>OK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Doute</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Fuite</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        data={DEMO_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InterventionCard item={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.textOnPrimary,
  },
  listContent: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardDate: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  cardTime: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  resultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  resultText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  cardBody: {
    gap: 4,
  },
  cardAddress: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  cardMeter: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
