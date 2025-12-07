
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
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
      backgroundColor: '#00ff8820',
    },
    {
      id: 'x',
      url: 'https://x.com/MXIStragic',
      icon: 'number',
      androidIcon: 'tag',
      label: 'X (Twitter)',
      color: '#FFFFFF',
      backgroundColor: '#000000',
    },
    {
      id: 'facebook',
      url: 'https://www.facebook.com/MXIStrategic/',
      icon: 'f.circle.fill',
      androidIcon: 'facebook',
      label: 'Facebook',
      color: '#1877F2',
      backgroundColor: '#1877F220',
    },
    {
      id: 'telegram',
      url: 'https://t.me/mxistrategic_latam',
      icon: 'paperplane.fill',
      androidIcon: 'send',
      label: 'Telegram',
      color: '#0088cc',
      backgroundColor: '#0088cc20',
    },
    {
      id: 'whatsapp',
      url: 'https://wa.me/4367853354093',
      icon: 'message.fill',
      androidIcon: 'chat',
      label: 'WhatsApp',
      color: '#25D366',
      backgroundColor: '#25D36620',
    },
  ];

  const handleSocialPress = async (url: string, label: string) => {
    try {
      console.log(`🔗 Attempting to open ${label}:`, url);
      
      // For WhatsApp, ensure proper formatting
      let finalUrl = url;
      if (label === 'WhatsApp') {
        // WhatsApp URL should be in format: https://wa.me/4367853354093
        // Remove any spaces or special characters from the phone number
        const phoneNumber = url.replace('https://wa.me/', '').replace(/\s/g, '');
        finalUrl = `https://wa.me/${phoneNumber}`;
        console.log('📱 WhatsApp URL formatted:', finalUrl);
      }
      
      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(finalUrl);
      console.log(`✅ Can open ${label}:`, canOpen);
      
      if (canOpen) {
        await Linking.openURL(finalUrl);
        console.log(`✅ Successfully opened ${label}`);
      } else {
        console.error(`❌ Cannot open ${label} URL:`, finalUrl);
        
        // Provide more specific error messages
        let errorMessage = `No se puede abrir ${label}.`;
        if (label === 'WhatsApp') {
          errorMessage += ' Por favor, verifica que tengas WhatsApp instalado en tu dispositivo.';
        } else if (label === 'X (Twitter)') {
          errorMessage += ' Intentando abrir en el navegador...';
          // Try to open in browser as fallback
          await Linking.openURL(finalUrl).catch(() => {
            Alert.alert('Error', 'No se pudo abrir el enlace de X (Twitter).');
          });
          return;
        }
        
        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error(`❌ Error opening ${label}:`, error);
      
      // More user-friendly error messages
      let errorMessage = `Error al abrir ${label}.`;
      if (label === 'WhatsApp') {
        errorMessage = 'No se pudo abrir WhatsApp. Por favor, verifica que la aplicación esté instalada.';
      } else if (label === 'X (Twitter)') {
        errorMessage = 'No se pudo abrir X (Twitter). Por favor, intenta nuevamente.';
      }
      
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
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
          {socialLinks.map((social) => (
            <TouchableOpacity
              key={social.id}
              style={[
                styles.socialIcon,
                {
                  backgroundColor: social.backgroundColor,
                  borderColor: social.color,
                }
              ]}
              onPress={() => handleSocialPress(social.url, social.label)}
              activeOpacity={0.7}
            >
              {social.id === 'x' ? (
                // Custom X icon using text
                <Text style={[styles.xIcon, { color: social.color }]}>𝕏</Text>
              ) : (
                <IconSymbol
                  ios_icon_name={social.icon}
                  android_material_icon_name={social.androidIcon}
                  size={24}
                  color={social.color}
                />
              )}
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
  xIcon: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  copyright: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
