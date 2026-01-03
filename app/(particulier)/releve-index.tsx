/**
 * Module Relevé d'Index
 * 
 * Permet à l'utilisateur de :
 * - Prendre une photo de son compteur
 * - Obtenir l'index en m³ via OCR
 * - Envoyer par mail son relevé
 */

import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MailComposer from 'expo-mail-composer';
import { useReleveStore } from '@/stores/releveStore';

export default function ReleveIndexScreen() {
  const router = useRouter();
  const releveStore = useReleveStore();
  
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const hasReleve = releveStore.indexValue !== null;
  const indexValue = releveStore.indexValue;
  const dateReleve = releveStore.dateReleve;

  const handleTakePhoto = () => {
    router.push('/releve/capture');
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Email requis', 'Veuillez entrer une adresse email.');
      return;
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
      return;
    }

    setIsSending(true);

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert(
          'Mail non disponible',
          'Aucune application de messagerie n\'est configurée sur cet appareil.',
          [{ text: 'OK' }]
        );
        setIsSending(false);
        return;
      }

      const formattedDate = dateReleve 
        ? new Date(dateReleve).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : new Date().toLocaleDateString('fr-FR');

      await MailComposer.composeAsync({
        recipients: [email.trim()],
        subject: `Relevé de compteur gaz - ${formattedDate}`,
        body: `
Bonjour,

Voici mon relevé de compteur gaz effectué le ${formattedDate} :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 INDEX DU COMPTEUR : ${indexValue} m³
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ce relevé a été effectué via l'application MonGaz+.

Cordialement
        `.trim(),
      });

      Alert.alert(
        'Email préparé',
        'Votre email a été préparé. Envoyez-le depuis votre application de messagerie.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de préparer l\'email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleNewReleve = () => {
    releveStore.reset();
    router.push('/releve/capture');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Relevé d'index</Text>
            <View style={styles.placeholder} />
          </View>

          {/* CONTENU PRINCIPAL */}
          {!hasReleve ? (
            // PAS DE RELEVÉ - Invitation à prendre une photo
            <View style={styles.emptyState}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📷</Text>
              </View>
              
              <Text style={styles.emptyTitle}>Relevez votre index</Text>
              <Text style={styles.emptyText}>
                Prenez une photo de votre compteur gaz pour obtenir 
                automatiquement votre index en m³.
              </Text>

              <View style={styles.stepsContainer}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Photographiez l'afficheur du compteur</Text>
                </View>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>L'index est détecté automatiquement</Text>
                </View>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Envoyez le relevé par email si besoin</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnIcon}>📷</Text>
                <Text style={styles.primaryBtnText}>Prendre une photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // RELEVÉ EFFECTUÉ - Affichage du résultat
            <View style={styles.resultState}>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Votre index</Text>
                <View style={styles.indexContainer}>
                  <Text style={styles.indexValue}>{indexValue}</Text>
                  <Text style={styles.indexUnit}>m³</Text>
                </View>
                <Text style={styles.resultDate}>
                  Relevé le {dateReleve && new Date(dateReleve).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>

              {/* SECTION EMAIL */}
              <View style={styles.emailSection}>
                <Text style={styles.sectionTitle}>Envoyer par email</Text>
                <Text style={styles.sectionSubtitle}>
                  Recevez une copie de votre relevé par email
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="votre@email.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.sendBtn, isSending && styles.sendBtnDisabled]}
                  onPress={handleSendEmail}
                  disabled={isSending}
                  activeOpacity={0.8}
                >
                  {isSending ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.sendBtnIcon}>📧</Text>
                      <Text style={styles.sendBtnText}>Envoyer le relevé</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* NOUVEAU RELEVÉ */}
              <TouchableOpacity 
                style={styles.newReleveBtn}
                onPress={handleNewReleve}
                activeOpacity={0.8}
              >
                <Text style={styles.newReleveBtnIcon}>🔄</Text>
                <Text style={styles.newReleveBtnText}>Nouveau relevé</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 44,
  },

  // ÉTAT VIDE
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },

  // ÉTAPES
  stepsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    color: '#FFF',
    fontSize: 15,
    flex: 1,
  },

  // BOUTON PRINCIPAL
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
  },
  primaryBtnIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // ÉTAT AVEC RÉSULTAT
  resultState: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    marginBottom: 24,
  },
  resultLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  indexContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  indexValue: {
    color: '#4ADE80',
    fontSize: 56,
    fontWeight: '800',
  },
  indexUnit: {
    color: '#4ADE80',
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },

  // SECTION EMAIL
  emailSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  emailInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 14,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  sendBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // NOUVEAU RELEVÉ
  newReleveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    borderRadius: 12,
  },
  newReleveBtnIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  newReleveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
