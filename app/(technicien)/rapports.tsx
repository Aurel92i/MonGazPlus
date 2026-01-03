import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useHistoriqueStore, InterventionVEA } from '@/stores/historiqueStore';
import { useAuthStore } from '@/stores/authStore';
import { isTechnicien } from '@/types';

type PeriodeExport = 'jour' | 'semaine' | 'mois' | 'tout';

export default function RapportsScreen() {
  const { interventions, getStatistiques } = useHistoriqueStore();
  const { user } = useAuthStore();
  const technicien = user && isTechnicien(user) ? user : null;
  const stats = getStatistiques();
  const [periodeSelectionnee, setPeriodeSelectionnee] = useState<PeriodeExport>('semaine');
  const [isExporting, setIsExporting] = useState(false);

  const filtrerParPeriode = (periode: PeriodeExport): InterventionVEA[] => {
    const maintenant = new Date();
    
    return interventions.filter(i => {
      const dateIntervention = new Date(i.date);
      
      switch (periode) {
        case 'jour':
          return dateIntervention.toDateString() === maintenant.toDateString();
        case 'semaine':
          const debutSemaine = new Date(maintenant);
          debutSemaine.setDate(maintenant.getDate() - maintenant.getDay());
          debutSemaine.setHours(0, 0, 0, 0);
          return dateIntervention >= debutSemaine;
        case 'mois':
          return dateIntervention.getMonth() === maintenant.getMonth() &&
                 dateIntervention.getFullYear() === maintenant.getFullYear();
        case 'tout':
        default:
          return true;
      }
    });
  };

  const interventionsFiltrees = filtrerParPeriode(periodeSelectionnee);
  const okFiltrees = interventionsFiltrees.filter(i => i.resultat === 'OK').length;
  const fuitesFiltrees = interventionsFiltrees.filter(i => i.resultat === 'FUITE').length;

  const genererRapportTexte = (): string => {
    const date = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let rapport = `═══════════════════════════════════════════
RAPPORT D'INTERVENTIONS VEA
MonGaz+ - ${date}
═══════════════════════════════════════════

TECHNICIEN
──────────
Nom: ${technicien?.fullName || 'N/A'}
Entreprise: ${technicien?.company || 'N/A'}
Badge: ${technicien?.badge || 'N/A'}

PÉRIODE
───────
${periodeSelectionnee === 'jour' ? "Aujourd'hui" : 
  periodeSelectionnee === 'semaine' ? 'Cette semaine' :
  periodeSelectionnee === 'mois' ? 'Ce mois' : 'Toutes'}

STATISTIQUES
────────────
Total interventions: ${interventionsFiltrees.length}
✓ OK: ${okFiltrees}
✕ Fuites détectées: ${fuitesFiltrees}
Taux de réussite: ${interventionsFiltrees.length > 0 ? Math.round((okFiltrees / interventionsFiltrees.length) * 100) : 100}%

`;

    if (interventionsFiltrees.length > 0) {
      rapport += `DÉTAIL DES INTERVENTIONS
────────────────────────
`;
      interventionsFiltrees.forEach((intervention, index) => {
        const dateStr = new Date(intervention.date).toLocaleDateString('fr-FR');
        const heureStr = new Date(intervention.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        rapport += `
${index + 1}. ${dateStr} à ${heureStr}
   Résultat: ${intervention.resultat === 'OK' ? '✓ OK' : '✕ FUITE'}
   Compteur: ${intervention.compteur.idCompteur || 'Non renseigné'}
   Index: ${intervention.compteur.indexReleve || 'Non relevé'} m³
   Adresse: ${intervention.geolocalisation?.adresse || 'Non géolocalisé'}
   Durée test: ${Math.floor(intervention.dureeTest / 60)}min ${intervention.dureeTest % 60}s
`;
      });
    }

    rapport += `
═══════════════════════════════════════════
Généré par MonGaz+ le ${new Date().toLocaleString('fr-FR')}
`;

    return rapport;
  };

  const handleExport = async () => {
    if (interventionsFiltrees.length === 0) {
      Alert.alert('Aucune donnée', 'Aucune intervention pour la période sélectionnée.');
      return;
    }

    setIsExporting(true);
    
    try {
      const rapport = genererRapportTexte();
      
      await Share.share({
        message: rapport,
        title: `Rapport VEA - ${new Date().toLocaleDateString('fr-FR')}`,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le rapport.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (interventionsFiltrees.length === 0) {
      Alert.alert('Aucune donnée', 'Aucune intervention pour la période sélectionnée.');
      return;
    }

    setIsExporting(true);
    
    try {
      let csv = 'Date;Heure;Résultat;ID Compteur;Index (m³);Adresse;Durée (s)\n';
      
      interventionsFiltrees.forEach(i => {
        const date = new Date(i.date);
        csv += `${date.toLocaleDateString('fr-FR')};`;
        csv += `${date.toLocaleTimeString('fr-FR')};`;
        csv += `${i.resultat};`;
        csv += `${i.compteur.idCompteur || ''};`;
        csv += `${i.compteur.indexReleve || ''};`;
        csv += `${i.geolocalisation?.adresse?.replace(/;/g, ',') || ''};`;
        csv += `${i.dureeTest}\n`;
      });
      
      await Share.share({
        message: csv,
        title: `Export CSV VEA - ${new Date().toLocaleDateString('fr-FR')}`,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'exporter en CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Sélection de la période */}
        <Text style={styles.sectionTitle}>📅 Période</Text>
        <View style={styles.periodeContainer}>
          {[
            { key: 'jour', label: "Aujourd'hui" },
            { key: 'semaine', label: 'Semaine' },
            { key: 'mois', label: 'Mois' },
            { key: 'tout', label: 'Tout' },
          ].map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.periodeChip,
                periodeSelectionnee === p.key && styles.periodeChipActive,
              ]}
              onPress={() => setPeriodeSelectionnee(p.key as PeriodeExport)}
            >
              <Text style={[
                styles.periodeChipText,
                periodeSelectionnee === p.key && styles.periodeChipTextActive,
              ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Aperçu des stats */}
        <View style={styles.aperçuCard}>
          <Text style={styles.aperçuTitle}>📊 Aperçu du rapport</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{interventionsFiltrees.length}</Text>
              <Text style={styles.statLabel}>Interventions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.veaOk }]}>{okFiltrees}</Text>
              <Text style={styles.statLabel}>OK</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.veaFuite }]}>{fuitesFiltrees}</Text>
              <Text style={styles.statLabel}>Fuites</Text>
            </View>
          </View>
        </View>

        {/* Boutons d'export */}
        <Text style={styles.sectionTitle}>📤 Exporter</Text>
        
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExport}
          disabled={isExporting}
          activeOpacity={0.8}
        >
          <Text style={styles.exportButtonIcon}>📄</Text>
          <View style={styles.exportButtonContent}>
            <Text style={styles.exportButtonTitle}>Rapport texte</Text>
            <Text style={styles.exportButtonSubtitle}>Format lisible, partage facile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, styles.exportButtonCSV]}
          onPress={handleExportCSV}
          disabled={isExporting}
          activeOpacity={0.8}
        >
          <Text style={styles.exportButtonIcon}>📊</Text>
          <View style={styles.exportButtonContent}>
            <Text style={styles.exportButtonTitle}>Export CSV</Text>
            <Text style={styles.exportButtonSubtitle}>Pour Excel / tableur</Text>
          </View>
        </TouchableOpacity>

        {/* Info PDF */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            L'export PDF avec signature client sera disponible dans une prochaine mise à jour.
          </Text>
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
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  periodeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  periodeChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
  },
  periodeChipActive: {
    backgroundColor: Colors.technicien,
  },
  periodeChipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  periodeChipTextActive: {
    color: Colors.textOnPrimary,
  },
  aperçuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  aperçuTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.technicien,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  exportButton: {
    backgroundColor: Colors.technicien,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  exportButtonCSV: {
    backgroundColor: Colors.primary,
  },
  exportButtonIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  exportButtonContent: {
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  exportButtonSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
