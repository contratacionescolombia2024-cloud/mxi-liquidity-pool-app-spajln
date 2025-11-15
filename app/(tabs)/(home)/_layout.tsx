
import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="contribute" />
      <Stack.Screen name="referrals" />
      <Stack.Screen name="withdrawals" />
      <Stack.Screen name="withdraw-mxi" />
      <Stack.Screen name="contrataciones" />
      <Stack.Screen name="xmi-tap-duo" />
    </Stack>
  );
}
