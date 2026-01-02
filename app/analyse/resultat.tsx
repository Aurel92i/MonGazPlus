import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, VEAMessages } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { VEAResult } from '@/types';

/**
 * Écran de résultat VEA
 * Affiche le verdict après analyse des deux photos
 * 
 * TODO : Connecter au store VEA pour afficher les vraies données
 */

export default function ResultatScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isTechnicien = user?.role === 'technicien';

  // Simulation d'un résultat (sera remplacé par le store)
  const result: VEAResult = 'OK';
  const confidence = 0.95;
  const elapsedTime = 185; // secondes

  const getResultConfig = (result: VEAResult) => {
    switch (result) {
      case 'OK':
        return {
          backgroundColor: Colors.veaOkLight,
          borderColor: Colors.veaOk,
          textColor: Colors.veaOk,
          icon: '✅',
          ...VEAMessages.OK,
        };
      case 'DOUTE':
        return {
          backgroundColor: Colors.veaDouteLight,
          borderColor: Colors.veaDoute,
          textColor: Colors.veaDoute,
          icon: '⚠️',
          ...VEAMessages.DOUTE,
        };
      case 'FUITE_PROBABLE':
        return {
          backgroundColor: Colors.veaFuiteLight,
          borderColor: Colors.veaFuite,
          textColor: Colors.veaFuite,
          icon: '🚨',
          ...VEAMessages.FUITE_PROBABLE,
        };
    }
  };

  const config = getResultConfig(result);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs}s`;
  };

  const handleDone = () => {
    if (isTechnicien) {
      router.replace('/(technicien)');
    } else {
      router.replace('/(particulier)');
    }
  };

  const handleNewVEA = () => {
    if (isTechnicien) {
      router.replace('/(technicien)/vea');
    } else {
      router.replace('/(particulier)/vea');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Résultat principal */}
        <View style={[
          styles.resultCard,
          { backgroundColor: config.backgroundColor, borderColor: config.borderColor }
        ]}>
          <Text style={styles.resultIcon}>{config.icon}</Text>
          <Text style={[styles.resultTitle, { color: config.textColor }]}>
            {config.title}
          </Text>
          <Text style={styles.resultSubtitle}>{config.subtitle}</Text>
          
          {/* Barre de confiance */}
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confiance de l'analyse</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${confidence * 100}%`,
                    backgroundColor: config.borderColor 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.confidenceValue, { color: config.textColor }]}>
              {Math.round(confidence * 100)}%
            </Text>
          </View>
        </View>

        {/* Recommandation */}
        <View style={[
          styles.recommendationCard,
          { borderLeftColor: config.borderColor }
        ]}>
          <Text style={styles.recommendationLabel}>💡 Recommandation</Text>
          <Text style={styles.recommendationText}>{config.recommendation}</Text>
        </View>

        {/* Détails de l'analyse */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>📊 Détails de l'analyse</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Durée du test</Text>
            <Text style={styles.detailValue}>{formatTime(elapsedTime)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mouvement détecté</Text>
            <Text style={styles.detailValue}>0.000 m³</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Variation graduation</Text>
            <Text style={styles.detailValue}>0.2%</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date et heure</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Aperçu des photos */}
        <View style={styles.photosCard}>
          <Text style={styles.photosTitle}>📸 Photos de l'analyse</Text>
          <View style={styles.photosContainer}>
            <View style={styles.photoPreview}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>AVANT</Text>
              </View>
              <Text style={styles.photoTime}>00:00</Text>
            </View>
            <View style={styles.photoArrow}>
              <Text style={styles.photoArrowText}>→</Text>
            </View>
            <View style={styles.photoPreview}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>APRÈS</Text>
              </View>
              <Text style={styles.photoTime}>{formatTime(elapsedTime)}</Text>
            </View>
          </View>
        </View>

        {/* Actions technicien */}
        {isTechnicien && (
          <View style={styles.technicienActions}>
            <TouchableOpacity style={styles.technicienButton}>
              <Text style={styles.technicienButtonIcon}>✍️</Text>
              <Text style={styles.technicienButtonText}>Signature client</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.technicienButton}>
              <Text style={styles.technicienButtonIcon}>📄</Text>
              <Text style={styles.technicienButtonText}>Générer PDF</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Avertissement fuite */}
        {result === 'FUITE_PROBABLE' && (
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyIcon}>🚨</Text>
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>URGENCE - Appelez immédiatement</Text>
              <Text style={styles.emergencyNumber}>0 800 47 33 33</Text>
              <Text style={styles.emergencySubtext}>
                Ne rallumez pas le gaz et aérez les locaux
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Boutons d'action */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleNewVEA}
        >
          <Text style={styles.secondaryButtonText}>Nouvelle VEA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: isTechnicien ? Colors.technicien : Colors.particulier }]}
          onPress={handleDone}
        >
          <Text style={styles.primaryButtonText}>Terminer</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  resultCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 3,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  resultSubtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  confidenceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  recommendationCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    ...Shadows.sm,
  },
  recommendationLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  recommendationText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  detailsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  photosCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  photosTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  photoPreview: {
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 100,
    height: 75,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoPlaceholderText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  photoTime: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  photoArrow: {
    padding: Spacing.sm,
  },
  photoArrowText: {
    fontSize: FontSizes.xl,
    color: Colors.textMuted,
  },
  technicienActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  technicienButton: {
    flex: 1,
    backgroundColor: Colors.technicienLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.technicien,
  },
  technicienButtonIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  technicienButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.technicien,
  },
  emergencyCard: {
    backgroundColor: Colors.veaFuite,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  emergencyNumber: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  emergencySubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSizes.sm,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
});
