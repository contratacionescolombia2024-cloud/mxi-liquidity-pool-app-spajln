
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function Footer() {
  const socialLinks = [
    {
      id: 'website',
      url: 'https://mxistrategic.live/',
      icon: 'globe',
      androidIcon: 'language',
      label: 'Website',
      color: '#00ff88',
    },
    {
      id: 'twitter',
      url: 'https://x.com/MXIStragic',
      icon: 'at',
      androidIcon: 'alternate_email',
      label: 'X (Twitter)',
      color: '#1DA1F2',
    },
    {
      id: 'facebook',
      url: 'https://www.facebook.com/minerMaxcoin',
      icon: 'f.circle.fill',
      androidIcon: 'facebook',
      label: 'Facebook',
      color: '#1877F2',
    },
    {
      id: 'telegram',
      url: 'https://t.me/mxistrategic_latam',
      icon: 'paperplane.fill',
      androidIcon: 'send',
      label: 'Telegram',
      color: '#0088cc',
    },
    {
      id: 'whatsapp',
      url: 'https://wa.me/4367853354093',
      icon: 'phone.fill',
      androidIcon: 'phone',
      label: 'WhatsApp',
      color: '#25D366',
    },
  ];

  const handleSocialPress = async (url: string, label: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.log(`Cannot open ${label} URL:`, url);
      }
    } catch (error) {
      console.error(`Error opening ${label}:`, error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Company Info */}
      <View style={styles.companyInfo}>
        <Text style={styles.text}>
          MAXCOIN (MXI) is a registered trademark of MXI Strategic Holdings Ltd., Cayman Islands.
        </Text>
        <Text style={styles.text}>
          Operated by MXI Technologies Inc. (Panamá)
        </Text>
      </View>

      {/* Social Media Icons */}
      <View style={styles.socialContainer}>
        <Text style={styles.socialTitle}>Síguenos en nuestras redes</Text>
        <View style={styles.socialIconsRow}>
          {socialLinks.map((social, index) => (
            <TouchableOpacity
              key={social.id}
              style={[styles.socialIcon, { backgroundColor: social.color + '20', borderColor: social.color }]}
              onPress={() => handleSocialPress(social.url, social.label)}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name={social.icon}
                android_material_icon_name={social.androidIcon}
                size={24}
                color={social.color}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Copyright */}
      <Text style={styles.copyright}>
        © 2026 MXI Strategic. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 24,
  },
  companyInfo: {
    marginBottom: 24,
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },
  socialContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  socialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  socialIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  copyright: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
