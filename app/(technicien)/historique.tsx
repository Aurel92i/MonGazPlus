import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { VEAResult } from '@/types';

// Données de démonstration
const DEMO_DATA: any[] = [];

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Aucune intervention</Text>
      <Text style={styles.emptyText}>
        Vos interventions apparaîtront ici après avoir effectué votre première VEA.
      </Text>
    </View>
  );
}

export default function TechnicienHistoriqueScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>✓ OK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>? Doute</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>✕ Fuite</Text>
        </TouchableOpacity>
      </View>

      {/* Export PDF (technicien only) */}
      <View style={styles.exportBar}>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonIcon}>📄</Text>
          <Text style={styles.exportButtonText}>Exporter PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonIcon}>📊</Text>
          <Text style={styles.exportButtonText}>Statistiques</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        data={DEMO_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => null}
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
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
  },
  filterChipActive: {
    backgroundColor: Colors.technicien,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.textOnPrimary,
  },
  exportBar: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.technicienLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.technicien,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.technicien,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  exportButtonIcon: {
    fontSize: 16,
  },
  exportButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  listContent: {
    padding: Spacing.md,
    flexGrow: 1,
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
