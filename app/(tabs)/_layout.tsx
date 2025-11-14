
import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function TabLayout() {
  // Remove all tab navigation - only use the hamburger menu
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="(home)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}
