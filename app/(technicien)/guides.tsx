import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

// ============================================
// DONNÉES DES GUIDES
// ============================================

interface Guide {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'procedure' | 'securite' | 'technique';
  content: string[];
}

const GUIDES_PRO: Guide[] = [
  {
    id: '1',
    icon: '🔍',
    title: 'Procédure VEA complète',
    description: 'Guide détaillé pour les techniciens',
    category: 'procedure',
    content: [
      '📋 PRÉPARATION - IMPORTANT',
      '• Robinet du COMPTEUR : OUVERT',
      '• Robinets des APPAREILS (gazinière, chaudière, chauffe-eau) : OUVERTS',
      '• APPAREILS (brûleurs, veilleuses) : ÉTEINTS',
      '• Vérifier qu\'aucun appareil gaz n\'est en fonctionnement',
      '',
      '⚠️ RAPPEL CRITIQUE',
      '• Robinets OUVERTS pour permettre la détection',
      '• Appareils ÉTEINTS pour éviter toute consommation',
      '',
      '📸 PHOTO AVANT',
      '• Cadrer le compteur avec le cadre vert',
      '• S\'assurer de la lisibilité des chiffres',
      '• Ajuster le zoom si nécessaire',
      '• Activer le flash si l\'éclairage est insuffisant',
      '• Maintenir le téléphone stable',
      '',
      '⏱️ ATTENTE',
      '• Durée minimale recommandée : 3 minutes',
      '• Ne pas manipuler les robinets pendant le test',
      '• Surveiller visuellement le compteur',
      '',
      '📸 PHOTO APRÈS',
      '• Reprendre exactement le même cadrage',
      '• Utiliser le fantôme comme guide',
      '• Attendre la stabilisation automatique',
      '',
      '📊 ANALYSE',
      '• L\'application compare les photos',
      '• Mouvement détecté = FUITE',
      '• Index stable = Installation étanche (OK)',
    ],
  },
  {
    id: '2',
    icon: '📸',
    title: 'Prise de vue optimale',
    description: 'Techniques pour une analyse précise',
    category: 'procedure',
    content: [
      '🎯 CADRAGE',
      '• Centrer le compteur dans le cadre',
      '• Aligner les bords avec les guides verts',
      '• Éviter les angles excessifs (< 15°)',
      '',
      '💡 ÉCLAIRAGE',
      '• Privilégier la lumière naturelle',
      '• Utiliser le flash si nécessaire',
      '• Éviter les reflets sur le cadran',
      '• Position latérale pour réduire les ombres',
      '',
      '🔍 NETTETÉ',
      '• Zoom 1.5x à 2x recommandé',
      '• Attendre la mise au point automatique',
      '• Les chiffres doivent être parfaitement lisibles',
      '',
      '📱 STABILITÉ',
      '• Tenir le téléphone à deux mains',
      '• Bloquer les coudes contre le corps',
      '• Utiliser un support si disponible',
      '• La barre de stabilisation doit être verte',
    ],
  },
  {
    id: '3',
    icon: '⚠️',
    title: 'Gestion des fuites',
    description: 'Protocole d\'urgence et mise en sécurité',
    category: 'securite',
    content: [
      '🚨 EN CAS DE FUITE DÉTECTÉE',
      '',
      '1️⃣ MISE EN SÉCURITÉ IMMÉDIATE',
      '• Fermer le robinet d\'arrêt général du compteur',
      '• Ouvrir les fenêtres pour aérer',
      '• Ne pas actionner d\'interrupteurs électriques',
      '• Ne pas utiliser de téléphone dans la zone',
      '• Évacuer les occupants si nécessaire',
      '',
      '2️⃣ SIGNALEMENT',
      '• Informer le client de la situation',
      '• Documenter dans l\'application (notes)',
      '• Prendre des photos si pertinent',
      '',
      '3️⃣ ACTIONS CORRECTIVES',
      '• Localiser la fuite si possible',
      '• Signaler au distributeur si nécessaire',
      '• Ne pas remettre en service',
      '',
      '📞 NUMÉRO D\'URGENCE GAZ',
      '0 800 47 33 33 (24h/24, gratuit)',
    ],
  },
  {
    id: '4',
    icon: '🔧',
    title: 'Types de compteurs',
    description: 'Itron, AEM, Pietro Fiorentini',
    category: 'technique',
    content: [
      '📊 COMPTEURS À MEMBRANES',
      '',
      '🏭 ITRON / GALLUS',
      '• Modèles G4, G6, G10, G16, G25',
      '• Afficheur noir avec chiffres blancs',
      '• Zone décimale rouge (3 chiffres)',
      '• Graduation visible sur le cadran',
      '',
      '🏭 AEM',
      '• Modèles similaires (G4-G25)',
      '• Afficheur parfois jaune/crème',
      '• Zone décimale rouge identique',
      '',
      '🏭 PIETRO FIORENTINI',
      '• Compteurs industriels principalement',
      '• Affichage digital possible',
      '• Cadrage similaire aux compteurs standard',
      '',
      '💡 CONSEILS',
      '• Identifier la marque avant la photo',
      '• Adapter l\'éclairage au type d\'afficheur',
      '• Les compteurs digitaux nécessitent plus de lumière',
    ],
  },
  {
    id: '5',
    icon: '📊',
    title: 'Interprétation avancée',
    description: 'Analyse et cas particuliers',
    category: 'technique',
    content: [
      '🔬 ANALYSE DES RÉSULTATS',
      '',
      '✅ RÉSULTAT OK',
      '• Index identique avant/après',
      '• Pas de mouvement détecté',
      '• Installation considérée étanche',
      '',
      '❌ RÉSULTAT FUITE',
      '• Différence d\'index détectée',
      '• Mouvement même minime',
      '• Investigation nécessaire',
      '',
      '⚠️ CAS PARTICULIERS',
      '',
      '• Température ambiante',
      '  - Les variations thermiques peuvent',
      '    provoquer des micro-mouvements',
      '  - Effet plus marqué en hiver/été',
      '',
      '• Vibrations externes',
      '  - Travaux à proximité',
      '  - Passage de véhicules lourds',
      '  - Peuvent fausser la mesure',
      '',
      '• Appareils en veille',
      '  - Certaines chaudières ont une veilleuse',
      '  - Consommation résiduelle possible',
      '  - Vérifier l\'extinction complète',
    ],
  },
  {
    id: '6',
    icon: '✍️',
    title: 'Signature électronique',
    description: 'Validation client et traçabilité',
    category: 'procedure',
    content: [
      '📝 PROCÉDURE DE SIGNATURE',
      '',
      '1️⃣ PRÉSENTATION',
      '• Expliquer le résultat au client',
      '• Montrer les photos avant/après',
      '• Répondre aux questions',
      '',
      '2️⃣ SIGNATURE',
      '• Utiliser un stylet ou le doigt',
      '• Signature lisible recommandée',
      '• Possibilité de recommencer',
      '',
      '3️⃣ VALIDATION',
      '• Le client confirme son accord',
      '• Rapport généré automatiquement',
      '• Copie envoyée par email si souhaité',
      '',
      '📋 MENTIONS LÉGALES',
      '• Date et heure horodatées',
      '• Géolocalisation de l\'intervention',
      '• Identification du technicien',
      '• Conservation 5 ans minimum',
    ],
  },
  {
    id: '7',
    icon: '📄',
    title: 'Rapports d\'intervention',
    description: 'Génération et archivage',
    category: 'procedure',
    content: [
      '📊 CONTENU DU RAPPORT',
      '',
      '• Informations technicien',
      '  - Nom, badge, entreprise',
      '  - Date et heure d\'intervention',
      '',
      '• Données du site',
      '  - Adresse (géolocalisée)',
      '  - N° de compteur',
      '  - Index relevés',
      '',
      '• Résultat de la VEA',
      '  - Verdict : OK ou FUITE',
      '  - Durée du test',
      '  - Captures d\'écran',
      '',
      '• Validation',
      '  - Signature client',
      '  - Notes éventuelles',
      '',
      '📤 EXPORT',
      '• Format PDF professionnel',
      '• Export CSV pour tableur',
      '• Partage par email/SMS',
      '• Archivage automatique',
    ],
  },
  {
    id: '8',
    icon: '⚡',
    title: 'Remise en service',
    description: 'Procédure après validation VEA',
    category: 'procedure',
    content: [
      '✅ APRÈS UN RÉSULTAT OK',
      '',
      '1️⃣ VÉRIFICATIONS',
      '• Confirmer que le test est terminé',
      '• S\'assurer que le rapport est généré',
      '',
      '2️⃣ REMISE EN SERVICE',
      '• Les robinets sont déjà ouverts',
      '• Rallumer les appareils (chaudière, brûleurs)',
      '',
      '3️⃣ CONTRÔLE FINAL',
      '• Vérifier l\'allumage correct',
      '• Pas d\'odeur de gaz',
      '• Fonctionnement normal',
      '',
      '❌ APRÈS UN RÉSULTAT FUITE',
      '',
      '• NE PAS remettre en service',
      '• FERMER le robinet du compteur immédiatement',
      '• Aérer les locaux (ouvrir les fenêtres)',
      '• Ne pas actionner d\'interrupteurs électriques',
      '• Informer le client de la situation',
      '• Contacter un réparateur agréé ou le 0 800 47 33 33',
      '• Documenter l\'intervention dans l\'application',
    ],
  },
];

// ============================================
// COMPOSANTS
// ============================================

function GuideCard({ item, onPress }: { item: Guide; onPress: () => void }) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'procedure': return Colors.technicien;
      case 'securite': return Colors.error;
      case 'technique': return Colors.primary;
      default: return Colors.textMuted;
    }
  };

  return (
    <TouchableOpacity style={styles.guideCard} onPress={onPress} activeOpacity={0.7}>
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

function GuideDetailModal({ 
  guide, 
  visible, 
  onClose 
}: { 
  guide: Guide | null; 
  visible: boolean; 
  onClose: () => void;
}) {
  if (!guide) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalIcon}>{guide.icon}</Text>
          <Text style={styles.modalTitle}>{guide.title}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentInner}
          showsVerticalScrollIndicator={false}
        >
          {guide.content.map((line, index) => {
            // Ligne vide = espacement
            if (line === '') {
              return <View key={index} style={styles.spacer} />;
            }
            // Titre de section (commence par un emoji)
            if (/^[📋📸⏱️📊🎯💡🔍📱🚨1️⃣2️⃣3️⃣📞✅❌⚠️🏭📝📤🔬]/.test(line)) {
              return (
                <Text key={index} style={styles.sectionHeader}>
                  {line}
                </Text>
              );
            }
            // Point normal
            return (
              <Text key={index} style={styles.contentLine}>
                {line}
              </Text>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.closeFullButton} onPress={onClose}>
            <Text style={styles.closeFullButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ============================================
// ÉCRAN PRINCIPAL
// ============================================

export default function TechnicienGuidesScreen() {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setModalVisible(true);
  };

  const closeGuide = () => {
    setModalVisible(false);
    setSelectedGuide(null);
  };

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

        {/* Rappel important */}
        <View style={styles.reminderCard}>
          <Text style={styles.reminderIcon}>💡</Text>
          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>Rappel VEA</Text>
            <Text style={styles.reminderText}>
              Robinets du compteur : OUVERTS{'\n'}
              Brûleurs des appareils : ÉTEINTS
            </Text>
          </View>
        </View>

        {/* Section Procédures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Procédures</Text>
          {GUIDES_PRO.filter(g => g.category === 'procedure').map(guide => (
            <GuideCard key={guide.id} item={guide} onPress={() => openGuide(guide)} />
          ))}
        </View>

        {/* Section Sécurité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Sécurité</Text>
          {GUIDES_PRO.filter(g => g.category === 'securite').map(guide => (
            <GuideCard key={guide.id} item={guide} onPress={() => openGuide(guide)} />
          ))}
        </View>

        {/* Section Technique */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Technique</Text>
          {GUIDES_PRO.filter(g => g.category === 'technique').map(guide => (
            <GuideCard key={guide.id} item={guide} onPress={() => openGuide(guide)} />
          ))}
        </View>
      </ScrollView>

      {/* Modal détail */}
      <GuideDetailModal 
        guide={selectedGuide} 
        visible={modalVisible} 
        onClose={closeGuide} 
      />
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

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
    marginBottom: Spacing.md,
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
  reminderCard: {
    backgroundColor: Colors.veaOkLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.veaOk,
  },
  reminderIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.veaOk,
    marginBottom: 4,
  },
  reminderText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
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
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  modalTitle: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textMuted,
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  contentLine: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 2,
  },
  spacer: {
    height: Spacing.md,
  },
  modalFooter: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  closeFullButton: {
    backgroundColor: Colors.technicien,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  closeFullButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
