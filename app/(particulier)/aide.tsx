import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const FAQ = [
  {
    question: "Qu'est-ce qu'une VEA ?",
    answer: "La Vérification d'Étanchéité Apparente est un test simple qui permet de détecter une éventuelle fuite de gaz sur votre installation.",
  },
  {
    question: "Combien de temps dure le test ?",
    answer: "Le test prend environ 5 minutes : 2 photos espacées de 3 minutes minimum.",
  },
  {
    question: "Le test est-il fiable ?",
    answer: "Ce test détecte les fuites visibles sur le compteur. Pour une vérification complète, faites appel à un professionnel.",
  },
  {
    question: "Que faire si le test détecte une fuite ?",
    answer: "Coupez immédiatement le gaz, aérez les locaux et appelez le numéro d'urgence gaz : 0 800 47 33 33.",
  },
];

export default function ParticulierAideScreen() {
  const handleCallEmergency = () => {
    Linking.openURL('tel:0800473333');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Numéro d'urgence en haut */}
        <TouchableOpacity style={styles.emergencyCard} onPress={handleCallEmergency}>
          <View style={styles.emergencyIcon}>
            <Text style={styles.emergencyIconText}>🚨</Text>
          </View>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Urgence Gaz</Text>
            <Text style={styles.emergencyNumber}>0 800 47 33 33</Text>
            <Text style={styles.emergencySubtext}>Appuyez pour appeler (gratuit 24h/24)</Text>
          </View>
        </TouchableOpacity>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>❓ Questions fréquentes</Text>
        <View style={styles.faqContainer}>
          {FAQ.map((item, index) => (
            <View key={index} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* Conseils de sécurité */}
        <Text style={styles.sectionTitle}>🛡️ Conseils de sécurité</Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>✅</Text>
            <Text style={styles.tipText}>Faites vérifier votre installation chaque année</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>✅</Text>
            <Text style={styles.tipText}>Aérez régulièrement vos pièces</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>✅</Text>
            <Text style={styles.tipText}>Ne bouchez jamais les grilles d'aération</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>❌</Text>
            <Text style={styles.tipText}>N'utilisez jamais de flamme pour chercher une fuite</Text>
          </View>
        </View>

        {/* Contact fournisseur */}
        <Text style={styles.sectionTitle}>📞 Contacts utiles</Text>
        <View style={styles.contactsContainer}>
          <TouchableOpacity style={styles.contactCard}>
            <Text style={styles.contactIcon}>🏢</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Mon fournisseur</Text>
              <Text style={styles.contactSubtext}>Service client</Text>
            </View>
            <Text style={styles.contactArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard}>
            <Text style={styles.contactIcon}>🔧</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Trouver un plombier</Text>
              <Text style={styles.contactSubtext}>Professionnels agréés</Text>
            </View>
            <Text style={styles.contactArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* À propos */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>À propos de MonGaz+</Text>
          <Text style={styles.aboutText}>
            MonGaz+ est une application qui vous aide à vérifier l'étanchéité 
            de votre installation gaz de manière simple et rapide.
          </Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
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
  emergencyCard: {
    backgroundColor: Colors.veaFuite,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  emergencyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  emergencyIconText: {
    fontSize: 32,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  emergencyNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  emergencySubtext: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  faqContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  faqQuestion: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.particulier,
    marginBottom: Spacing.xs,
  },
  faqAnswer: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  contactsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  contactIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  contactSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  contactArrow: {
    fontSize: FontSizes.xl,
    color: Colors.textMuted,
  },
  aboutCard: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  aboutText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  aboutVersion: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
});
