import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/theme';

/**
 * Écran d'index - Point d'entrée de l'application
 * 
 * Redirige automatiquement vers :
 * - /login si non authentifié
 * - /(technicien) si connecté en tant que technicien
 * - /(particulier) si connecté en tant que particulier
 */
export default function IndexScreen() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Non authentifié → Login
  if (!isAuthenticated || !user) {
    return <Redirect href="/login" />;
  }

  // Authentifié → Redirection selon le rôle
  if (user.role === 'technicien') {
    return <Redirect href="/(technicien)" />;
  }

  if (user.role === 'particulier') {
    return <Redirect href="/(particulier)" />;
  }

  // Fallback (ne devrait pas arriver)
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
