
import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user, checkAdminStatus } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus();
      setIsAdmin(adminStatus);
    };
    checkAdmin();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              ios_icon_name={focused ? 'house.fill' : 'house'}
              android_material_icon_name="home"
              size={28}
              color={color}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              ios_icon_name={focused ? 'person.circle.fill' : 'person.circle'}
              android_material_icon_name="account_circle"
              size={28}
              color={color}
            />
          ),
        }}
      />

      {isAdmin && (
        <Tabs.Screen
          name="(admin)"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                ios_icon_name={focused ? 'shield.fill' : 'shield'}
                android_material_icon_name="admin_panel_settings"
                size={28}
                color={color}
              />
            ),
          }}
        />
      )}
    </Tabs>
  );
}
