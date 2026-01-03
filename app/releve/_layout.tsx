/**
 * Layout pour les pages de relevé d'index
 */

import { Stack } from 'expo-router';

export default function ReleveLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="capture" />
    </Stack>
  );
}
