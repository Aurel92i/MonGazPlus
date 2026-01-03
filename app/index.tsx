import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { SplashScreen } from '@/components/SplashScreen';
import { Colors } from '@/constants/theme';

/**
 * Écran d'index - Point d'entrée de l'application
 * 
 * Affiche le splash screen puis redirige vers :
 * - /login si non authentifié
 * - /(technicien) si connecté en tant que technicien
 * - /(particulier) si connecté en tant que particulier
 */
export default function IndexScreen() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  // Afficher le splash screen pendant 2 secondes minimum
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Afficher le splash screen
  if (showSplash || isLoading) {
    return <SplashScreen />;
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
