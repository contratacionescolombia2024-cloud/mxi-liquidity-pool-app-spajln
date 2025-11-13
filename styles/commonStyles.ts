
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#D4AF37',        // Gold
  secondary: '#800020',      // Wine Red
  accent: '#FFD700',         // Bright Gold (for highlights)
  success: '#D4AF37',        // Gold (for success states)
  warning: '#B8860B',        // Dark Gold (for warnings)
  error: '#8B0000',          // Dark Red (for errors)
  background: '#000000',     // Black
  card: '#1A0A0A',           // Very Dark Red-Black
  cardBackground: '#1A0A0A', // Very Dark Red-Black
  text: '#FFFFFF',           // White (for contrast)
  textSecondary: '#D4AF37',  // Gold (for secondary text)
  border: '#800020',         // Wine Red (for borders)
  highlight: 'rgba(212, 175, 55, 0.15)', // Gold with transparency
  backgroundAlt: '#0D0000',  // Slightly lighter black
  wineRed: '#800020',        // Wine Red
  gold: '#D4AF37',           // Gold
  darkGold: '#B8860B',       // Dark Gold
  lightGold: '#FFD700',      // Light Gold
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
