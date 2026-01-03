import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useHistoriqueStore, InterventionVEA } from '@/stores/historiqueStore';

type Filtre = 'tous' | 'OK' | 'FUITE';

function InterventionCard({ item, onPress }: { item: InterventionVEA; onPress: () => void }) {
  const date = new Date(item.date);
  const dateStr = date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'short',
    year: 'numeric'
  });
  const heureStr = date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const isOk = item.resultat === 'OK';

  return (
    <TouchableOpacity 
      style={styles.interventionCard} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Indicateur de résultat */}
      <View style={[
        styles.resultIndicator,
        isOk ? styles.resultOk : styles.resultFuite
      ]}>
        <Text style={styles.resultIcon}>{isOk ? '✓' : '✕'}</Text>
      </View>

      {/* Contenu principal */}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{dateStr}</Text>
          <Text style={styles.cardTime}>{heureStr}</Text>
        </View>

        {/* Données compteur */}
        {item.compteur.idCompteur && (
          <Text style={styles.cardCompteur}>
            🔢 {item.compteur.idCompteur}
          </Text>
        )}
        
        {item.compteur.indexReleve && (
          <Text style={styles.cardIndex}>
            📊 Index: {item.compteur.indexReleve} m³
          </Text>
        )}

        {/* Adresse */}
        {item.geolocalisation?.adresse && (
          <Text style={styles.cardAdresse} numberOfLines={1}>
            📍 {item.geolocalisation.adresse}
          </Text>
        )}

        {/* Durée du test */}
        <Text style={styles.cardDuree}>
          ⏱️ Test: {Math.floor(item.dureeTest / 60)}min {item.dureeTest % 60}s
        </Text>
      </View>

      {/* Badge résultat */}
      <View style={[
        styles.resultBadge,
        isOk ? styles.badgeOk : styles.badgeFuite
      ]}>
        <Text style={[
          styles.resultBadgeText,
          isOk ? styles.badgeTextOk : styles.badgeTextFuite
        ]}>
          {isOk ? 'OK' : 'FUITE'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ filtre }: { filtre: Filtre }) {
  const messages = {
    tous: 'Aucune intervention enregistrée',
    OK: 'Aucune intervention OK',
    FUITE: 'Aucune fuite détectée',
  };

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>{messages[filtre]}</Text>
      <Text style={styles.emptyText}>
        {filtre === 'tous' 
          ? 'Vos interventions apparaîtront ici après avoir effectué votre première VEA.'
          : 'Aucune intervention correspondant à ce filtre.'
        }
      </Text>
    </View>
  );
}

export default function TechnicienHistoriqueScreen() {
  const { interventions, supprimerIntervention, getStatistiques } = useHistoriqueStore();
  const [filtre, setFiltre] = useState<Filtre>('tous');
  const stats = getStatistiques();

  const interventionsFiltrees = filtre === 'tous' 
    ? interventions 
    : interventions.filter(i => i.resultat === filtre);

  const handleDetailIntervention = (item: InterventionVEA) => {
    const date = new Date(item.date);
    const details = `
📅 ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR')}

📊 Résultat: ${item.resultat === 'OK' ? '✓ Pas de fuite' : '✕ Fuite détectée'}

🔢 Compteur: ${item.compteur.idCompteur || 'Non renseigné'}
📏 Index: ${item.compteur.indexReleve || 'Non relevé'} m³
🏭 Marque: ${item.compteur.marque || 'Non identifiée'}

📍 Adresse: ${item.geolocalisation?.adresse || 'Non géolocalisé'}

⏱️ Durée du test: ${Math.floor(item.dureeTest / 60)}min ${item.dureeTest % 60}s

${item.nomClient ? `👤 Client: ${item.nomClient}` : ''}
${item.notes ? `📝 Notes: ${item.notes}` : ''}
    `.trim();

    Alert.alert(
      `Intervention #${item.id.split('-')[1]}`,
      details,
      [
        { text: 'Fermer', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmer la suppression',
              'Cette action est irréversible.',
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'Supprimer', 
                  style: 'destructive',
                  onPress: () => supprimerIntervention(item.id)
                },
              ]
            );
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Statistiques rapides */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.veaOk }]}>{stats.ok}</Text>
          <Text style={styles.statLabel}>OK</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.veaFuite }]}>{stats.fuites}</Text>
          <Text style={styles.statLabel}>Fuites</Text>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterChip, filtre === 'tous' && styles.filterChipActive]}
          onPress={() => setFiltre('tous')}
        >
          <Text style={[styles.filterChipText, filtre === 'tous' && styles.filterChipTextActive]}>
            Tous ({stats.total})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, filtre === 'OK' && styles.filterChipActiveOk]}
          onPress={() => setFiltre('OK')}
        >
          <Text style={[styles.filterChipText, filtre === 'OK' && styles.filterChipTextActive]}>
            ✓ OK ({stats.ok})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, filtre === 'FUITE' && styles.filterChipActiveFuite]}
          onPress={() => setFiltre('FUITE')}
        >
          <Text style={[styles.filterChipText, filtre === 'FUITE' && styles.filterChipTextActive]}>
            ✕ Fuite ({stats.fuites})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        data={interventionsFiltrees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InterventionCard 
            item={item} 
            onPress={() => handleDetailIntervention(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState filtre={filtre} />}
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
  statsBar: {
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
    paddingHorizontal: Spacing.lg,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.technicien,
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
  filtersContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.technicien,
  },
  filterChipActiveOk: {
    backgroundColor: Colors.veaOk,
  },
  filterChipActiveFuite: {
    backgroundColor: Colors.veaFuite,
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
  interventionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  resultIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  resultOk: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  resultFuite: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  resultIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  cardTime: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  cardCompteur: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    marginTop: 2,
  },
  cardIndex: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardAdresse: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardDuree: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  resultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.sm,
  },
  badgeOk: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeFuite: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  resultBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  badgeTextOk: {
    color: Colors.veaOk,
  },
  badgeTextFuite: {
    color: Colors.veaFuite,
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
