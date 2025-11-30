
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 8,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card + 'F0',
          borderRadius: 24,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : null
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: `🏠 ${t('tabHome')}`,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              ios_icon_name={focused ? 'house.fill' : 'house'}
              android_material_icon_name="home"
              size={24}
              color={color}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="deposit"
        options={{
          title: `💰 ${t('tabDeposit')}`,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              ios_icon_name={focused ? 'arrow.down.circle.fill' : 'arrow.down.circle'}
              android_material_icon_name="arrow_circle_down"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="withdraw"
        options={{
          title: `💸 ${t('tabWithdraw')}`,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              ios_icon_name={focused ? 'arrow.up.circle.fill' : 'arrow.up.circle'}
              android_material_icon_name="arrow_circle_up"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="referrals"
        options={{
          title: `👥 ${t('tabReferrals')}`,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              ios_icon_name={focused ? 'person.3.fill' : 'person.3'}
              android_material_icon_name="group"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tournaments"
        options={{
          title: `🏆 ${t('tabTournaments')}`,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              ios_icon_name={focused ? 'trophy.fill' : 'trophy'}
              android_material_icon_name="emoji_events"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="rewards"
        options={{
          title: `🎁 ${t('tabRewards')}`,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              ios_icon_name={focused ? 'gift.fill' : 'gift'}
              android_material_icon_name="card_giftcard"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="ecosystem"
        options={{
          title: `🌐 ${t('tabEcosystem')}`,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              ios_icon_name={focused ? 'globe.americas.fill' : 'globe.americas'}
              android_material_icon_name="public"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: `👤 ${t('tabProfile')}`,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              ios_icon_name={focused ? 'person.circle.fill' : 'person.circle'}
              android_material_icon_name="account_circle"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hide admin tab from bottom bar */}
      <Tabs.Screen
        name="(admin)"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
