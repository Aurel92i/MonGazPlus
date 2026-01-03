import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { Colors, Spacing, FontSizes } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

export default function ParticulierLayout() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.particulier,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 80 : 56,
          paddingBottom: Platform.OS === 'ios' ? 24 : 4,
          paddingTop: 4,
          paddingHorizontal: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
        tabBarItemStyle: {
          paddingHorizontal: 2,
        },
        headerStyle: {
          backgroundColor: Colors.particulier,
        },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarLabel: 'Accueil',
          headerTitle: `🏠 ${user?.firstName || 'Mon espace'}`,
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="vea"
        options={{
          title: 'Vérifier',
          tabBarLabel: 'Vérifier',
          headerTitle: 'Vérification gaz',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: 'Historique',
          tabBarLabel: 'Historique',
          headerTitle: 'Mes vérifications',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="aide"
        options={{
          title: 'Aide',
          tabBarLabel: 'Aide',
          headerTitle: 'Aide & Contact',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>❓</Text>
          ),
        }}
      />
      {/* Masquer le tab releve-index de la barre */}
      <Tabs.Screen
        name="releve-index"
        options={{
          href: null,
          headerTitle: 'Relevé d\'index',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  logoutText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.sm,
    opacity: 0.9,
  },
});
