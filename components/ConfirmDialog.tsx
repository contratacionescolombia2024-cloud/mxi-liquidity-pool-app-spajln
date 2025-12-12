
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Pressable,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'info' | 'warning' | 'error' | 'success';
  icon?: {
    ios: string;
    android: string;
  };
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'info',
  icon,
}: ConfirmDialogProps) {
  console.log('ConfirmDialog rendered:', { visible, title, type });

  const getTypeColor = () => {
    switch (type) {
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      case 'success':
        return '#4CAF50';
      default:
        return colors.primary;
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'warning':
        return { ios: 'exclamationmark.triangle.fill', android: 'warning' };
      case 'error':
        return { ios: 'xmark.circle.fill', android: 'error' };
      case 'success':
        return { ios: 'checkmark.circle.fill', android: 'check_circle' };
      default:
        return { ios: 'info.circle.fill', android: 'info' };
    }
  };

  const displayIcon = icon || getDefaultIcon();
  const typeColor = getTypeColor();

  // For single-button alerts (when cancelText is empty)
  const isSingleButton = !cancelText || cancelText === '';

  const handleConfirm = () => {
    console.log('ConfirmDialog: Confirm button pressed');
    try {
      onConfirm();
    } catch (error) {
      console.error('Error in onConfirm callback:', error);
    }
  };

  const handleCancel = () => {
    console.log('ConfirmDialog: Cancel button pressed');
    try {
      onCancel();
    } catch (error) {
      console.error('Error in onCancel callback:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
            <IconSymbol
              ios_icon_name={displayIcon.ios}
              android_material_icon_name={displayIcon.android}
              size={48}
              color={typeColor}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={[styles.buttonContainer, isSingleButton && styles.singleButtonContainer]}>
            {!isSingleButton && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button, 
                styles.confirmButton, 
                { backgroundColor: typeColor },
                isSingleButton && styles.singleButton
              ]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  singleButtonContainer: {
    flexDirection: 'column',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButton: {
    flex: 0,
    width: '100%',
  },
  cancelButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
