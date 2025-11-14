
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="kyc-approvals" />
      <Stack.Screen name="withdrawal-approvals" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="user-management" />
    </Stack>
  );
}
