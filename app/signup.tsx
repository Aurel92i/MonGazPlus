import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { LogoSimple } from '@/components/Logo';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

type UserType = 'particulier' | 'technicien';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  
  const [userType, setUserType] = useState<UserType>('particulier');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre prénom');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre email');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Erreur', 'Veuillez saisir un email valide');
      return false;
    }
    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    if (userType === 'technicien' && !company.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom de votre entreprise');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    clearError();
    const success = await signup({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: userType,
      company: userType === 'technicien' ? company.trim() : undefined,
    });

    if (success) {
      Alert.alert(
        'Vérifiez votre email',
        'Un email de confirmation a été envoyé à ' + email + '. Veuillez cliquer sur le lien pour activer votre compte.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    }
  };

  const handleGoogleSignup = async () => {
    clearError();
    const success = await loginWithGoogle(userType);
    
    if (success) {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo et titre */}
          <View style={styles.header}>
            <LogoSimple size={60} showText={false} />
            <Text style={styles.appName}>
              Mon<Text style={styles.appNameAccent}>Gaz</Text>
              <Text style={styles.appNamePlus}>+</Text>
            </Text>
            <Text style={styles.subtitle}>Créer un compte</Text>
          </View>

          {/* Sélection du type de compte */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                userType === 'particulier' && styles.typeButtonActiveParticulier,
              ]}
              onPress={() => setUserType('particulier')}
            >
              <Text style={styles.typeIcon}>🏠</Text>
              <Text style={[
                styles.typeText,
                userType === 'particulier' && styles.typeTextActive,
              ]}>
                Particulier
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                userType === 'technicien' && styles.typeButtonActiveTechnicien,
              ]}
              onPress={() => setUserType('technicien')}
            >
              <Text style={styles.typeIcon}>👷</Text>
              <Text style={[
                styles.typeText,
                userType === 'technicien' && styles.typeTextActive,
              ]}>
                Technicien
              </Text>
            </TouchableOpacity>
          </View>

          {/* Google Sign Up */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Continuer avec Google</Text>
          </TouchableOpacity>

          {/* Séparateur */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Nom / Prénom */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.inputLabel}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Jean"
                  placeholderTextColor={Colors.textMuted}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.inputLabel}>Nom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Dupont"
                  placeholderTextColor={Colors.textMuted}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Entreprise (technicien uniquement) */}
            {userType === 'technicien' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Entreprise</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom de votre entreprise"
                  placeholderTextColor={Colors.textMuted}
                  value={company}
                  onChangeText={setCompany}
                  editable={!isLoading}
                />
              </View>
            )}

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="votre@email.fr"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Mot de passe */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="8 caractères minimum"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmer mot de passe */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Répétez le mot de passe"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Message d'erreur */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Bouton Créer le compte */}
            <TouchableOpacity
              style={[
                styles.signupButton,
                isLoading && styles.signupButtonDisabled,
                userType === 'technicien' ? styles.signupButtonTech : styles.signupButtonPart,
              ]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.textOnPrimary} />
              ) : (
                <Text style={styles.signupButtonText}>Créer mon compte</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Lien connexion */}
          <View style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLinkButton}>Se connecter</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              En créant un compte, vous acceptez nos{' '}
              <Text style={styles.footerLink}>conditions d'utilisation</Text>
              {' '}et notre{' '}
              <Text style={styles.footerLink}>politique de confidentialité</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  appNameAccent: {
    fontWeight: '700',
    color: Colors.primary,
  },
  appNamePlus: {
    fontWeight: '800',
    color: '#F97316',
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceVariant,
    gap: Spacing.sm,
  },
  typeButtonActiveParticulier: {
    backgroundColor: Colors.particulier,
  },
  typeButtonActiveTechnicien: {
    backgroundColor: Colors.technicien,
  },
  typeIcon: {
    fontSize: 20,
  },
  typeText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.textOnPrimary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.text,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  separatorText: {
    paddingHorizontal: Spacing.md,
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  eyeButton: {
    padding: Spacing.md,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorContainer: {
    backgroundColor: Colors.veaFuiteLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.veaFuite,
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  signupButton: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  signupButtonPart: {
    backgroundColor: Colors.particulier,
  },
  signupButtonTech: {
    backgroundColor: Colors.technicien,
  },
  signupButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  signupButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  loginLinkText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  loginLinkButton: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: Colors.primary,
  },
});
