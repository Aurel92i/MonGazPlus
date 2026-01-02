import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Vérifier l'état d'authentification au démarrage
    checkAuth();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.textOnPrimary,
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: Colors.background,
            },
            animation: 'slide_from_right',
          }}
        >
          {/* Écran d'index - redirection */}
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          
          {/* Écran de connexion */}
          <Stack.Screen
            name="login"
            options={{
              title: 'Connexion',
              headerShown: false,
            }}
          />
          
          {/* Espace Technicien */}
          <Stack.Screen
            name="(technicien)"
            options={{
              headerShown: false,
            }}
          />
          
          {/* Espace Particulier */}
          <Stack.Screen
            name="(particulier)"
            options={{
              headerShown: false,
            }}
          />
          
          {/* Écrans de capture (partagés) */}
          <Stack.Screen
            name="capture/photo-avant"
            options={{
              title: 'Photo AVANT',
              presentation: 'fullScreenModal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="capture/photo-apres"
            options={{
              title: 'Photo APRÈS',
              presentation: 'fullScreenModal',
              headerShown: false,
            }}
          />
          
          {/* Écran de résultat */}
          <Stack.Screen
            name="analyse/resultat"
            options={{
              title: 'Résultat VEA',
              presentation: 'modal',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
