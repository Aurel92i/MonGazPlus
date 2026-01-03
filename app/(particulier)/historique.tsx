import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useHistoriqueStore, InterventionVEA } from '@/stores/historiqueStore';

function VerificationCard({ item }: { item: InterventionVEA }) {
  const date = new Date(item.date);
  const dateStr = date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'long',
    year: 'numeric'
  });
  const heureStr = date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const isOk = item.resultat === 'OK';

  const handlePress = () => {
    Alert.alert(
      isOk ? '✓ Installation étanche' : '✕ Fuite détectée',
      `Date: ${dateStr} à ${heureStr}\n\n` +
      `Index relevé: ${item.compteur.indexReleve || 'Non disponible'} m³\n` +
      `Durée du test: ${Math.floor(item.dureeTest / 60)}min ${item.dureeTest % 60}s\n\n` +
      (isOk 
        ? 'Votre installation ne présentait pas de fuite lors de ce test.'
        : 'Une consommation a été détectée. Contactez un professionnel.'
      ),
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.resultBadge,
        isOk ? styles.badgeOk : styles.badgeFuite
      ]}>
        <Text style={styles.resultIcon}>{isOk ? '✓' : '✕'}</Text>
        <Text style={[
          styles.resultText,
          isOk ? styles.textOk : styles.textFuite
        ]}>
          {isOk ? 'OK' : 'FUITE'}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardDate}>{dateStr}</Text>
        <Text style={styles.cardTime}>{heureStr}</Text>
        {item.compteur.indexReleve && (
          <Text style={styles.cardIndex}>Index: {item.compteur.indexReleve} m³</Text>
        )}
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Aucune vérification</Text>
      <Text style={styles.emptyText}>
        Vos vérifications apparaîtront ici après avoir effectué votre premier test.
      </Text>
    </View>
  );
}

function StatsHeader({ total, ok, fuites }: { total: number; ok: number; fuites: number }) {
  if (total === 0) return null;
  
  return (
    <View style={styles.statsHeader}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{total}</Text>
        <Text style={styles.statLabel}>Tests</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: Colors.veaOk }]}>{ok}</Text>
        <Text style={styles.statLabel}>OK</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: Colors.veaFuite }]}>{fuites}</Text>
        <Text style={styles.statLabel}>Fuites</Text>
      </View>
    </View>
  );
}

export default function ParticulierHistoriqueScreen() {
  const { interventions, getStatistiques } = useHistoriqueStore();
  const stats = getStatistiques();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatsHeader total={stats.total} ok={stats.ok} fuites={stats.fuites} />
      
      <FlatList
        data={interventions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VerificationCard item={item} />}
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
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.particulier,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  listContent: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  resultBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginRight: Spacing.md,
    minWidth: 70,
  },
  badgeOk: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeFuite: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  resultIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  resultText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    marginTop: 2,
  },
  textOk: {
    color: Colors.veaOk,
  },
  textFuite: {
    color: Colors.veaFuite,
  },
  cardContent: {
    flex: 1,
  },
  cardDate: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  cardTime: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardIndex: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
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
