
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#162456',        // Material Blue
  secondary: '#193cb8',      // Darker Blue
  accent: '#64B5F6',         // Light Blue
  success: '#4CAF50',        // Green (for success states)
  warning: '#FF9800',        // Orange (for warnings)
  error: '#F44336',          // Red (for errors)
  background: '#101824',     // Dark background
  card: '#193cb8',           // Dark card background
  cardBackground: '#162133', // Dark card background
  text: '#e3e3e3',           // Light text
  textSecondary: '#90CAF9',  // Light Blue Grey (for secondary text)
  border: '#193cb8',         // Darker Blue (for borders)
  highlight: 'rgba(100, 181, 246, 0.15)', // Light Blue with transparency
  backgroundAlt: '#162133',  // Slightly lighter dark background
  grey: '#90CAF9',           // Light Blue Grey
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
