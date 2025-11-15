
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
      <Stack.Screen name="withdrawal" />
      <Stack.Screen name="contrataciones" />
      <Stack.Screen name="xmi-tap-duo" />
      <Stack.Screen name="lottery" />
      <Stack.Screen name="clickers" />
      <Stack.Screen name="mxi-airball" />
      <Stack.Screen name="mxi-airball-duo" />
      <Stack.Screen name="vesting" />
      <Stack.Screen name="kyc-verification" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="support" />
      <Stack.Screen name="okx-payments" />
      <Stack.Screen name="challenge-history" />
    </Stack>
  );
}
