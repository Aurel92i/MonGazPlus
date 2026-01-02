import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

// Icônes simples en texte (sera remplacé par des vraies icônes plus tard)
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🏠',
    vea: '🔍',
    history: '📋',
    guide: '📖',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <View style={styles.icon}>
        <View style={{ opacity: focused ? 1 : 0.6 }}>
          {/* Placeholder - remplacer par de vraies icônes */}
          <View style={[styles.iconPlaceholder, focused && styles.iconPlaceholderFocused]}>
            <View style={styles.iconText}>
              {/* Les icônes seront ajoutées avec expo-vector-icons */}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarLabel: 'Accueil',
          headerTitle: 'MonGaz+',
        }}
      />
      <Tabs.Screen
        name="vea"
        options={{
          title: 'VEA',
          tabBarLabel: 'VEA',
          headerTitle: 'Vérification Étanchéité',
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: 'Historique',
          tabBarLabel: 'Historique',
          headerTitle: 'Mes interventions',
        }}
      />
      <Tabs.Screen
        name="guides"
        options={{
          title: 'Guides',
          tabBarLabel: 'Guides',
          headerTitle: 'Documentation',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {
    // Style quand actif
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.textMuted,
  },
  iconPlaceholderFocused: {
    backgroundColor: Colors.primary,
  },
  iconText: {
    fontSize: 16,
  },
});
