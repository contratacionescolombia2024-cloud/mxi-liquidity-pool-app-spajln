
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { APP_VERSION, BUILD_ID, BUILD_DATE, BUILD_TIMESTAMP, forceReload, checkForUpdates } from '@/constants/AppVersion';
import { colors } from '@/styles/commonStyles';

interface VersionDisplayProps {
  position?: 'top' | 'bottom';
  showDetails?: boolean;
}

export default function VersionDisplay({ position = 'bottom', showDetails = false }: VersionDisplayProps) {
  const [expanded, setExpanded] = useState(showDetails);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Check for updates on mount
  useEffect(() => {
    if (Platform.OS === 'web') {
      const hasUpdate = checkForUpdates();
      setUpdateAvailable(hasUpdate);
      
      if (hasUpdate) {
        console.log('⚠️ Nueva versión disponible - mostrando indicador');
      }
    }
  }, []);

  const handlePress = () => {
    setExpanded(!expanded);
  };

  const handleForceReload = () => {
    if (Platform.OS === 'web') {
      if (updateAvailable) {
        // Show confirmation for update
        if (window.confirm('¿Deseas actualizar la aplicación ahora? Se recargará la página.')) {
          forceReload();
        }
      } else {
        // Show confirmation for force reload
        if (window.confirm('¿Deseas forzar la recarga de la aplicación? Esto limpiará la caché.')) {
          forceReload();
        }
      }
    } else {
      Alert.alert(
        'Actualización',
        'La actualización manual solo está disponible en la versión web.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return formatDate(date);
  };

  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <TouchableOpacity onPress={handlePress} style={styles.versionButton}>
        <Text style={styles.versionText}>v{APP_VERSION}</Text>
        {updateAvailable && (
          <View style={styles.updateBadge}>
            <Text style={styles.updateBadgeText}>!</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>📦 Información de Versión</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Versión:</Text>
            <Text style={styles.detailValue}>{APP_VERSION}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Build ID:</Text>
            <Text style={[styles.detailValue, styles.smallText]}>{BUILD_ID}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Timestamp:</Text>
            <Text style={styles.detailValue}>{BUILD_TIMESTAMP}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha Build:</Text>
            <Text style={[styles.detailValue, styles.smallText]}>{formatTimestamp(BUILD_TIMESTAMP)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plataforma:</Text>
            <Text style={styles.detailValue}>{Platform.OS}</Text>
          </View>
          
          {updateAvailable && (
            <View style={styles.updateNotice}>
              <Text style={styles.updateNoticeTitle}>🔄 Nueva Versión Disponible</Text>
              <Text style={styles.updateNoticeText}>
                Se ha publicado una nueva versión de la aplicación. 
                Se recomienda actualizar para obtener las últimas mejoras.
              </Text>
            </View>
          )}
          
          {Platform.OS === 'web' && (
            <TouchableOpacity onPress={handleForceReload} style={[
              styles.reloadButton,
              updateAvailable && styles.reloadButtonHighlight
            ]}>
              <Text style={styles.reloadButtonText}>
                {updateAvailable ? '🔄 Actualizar Ahora' : '🔄 Forzar Recarga'}
              </Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.helpText}>
            {updateAvailable 
              ? 'Toca "Actualizar Ahora" para aplicar la nueva versión.'
              : 'Si experimentas problemas, usa "Forzar Recarga" para limpiar la caché.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 10,
    zIndex: 9999,
  },
  top: {
    top: 10,
  },
  bottom: {
    bottom: 10,
  },
  versionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  updateBadge: {
    marginLeft: 6,
    backgroundColor: '#FF3B30',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 300,
    maxWidth: 340,
  },
  detailTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  detailValue: {
    color: colors.text,
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  smallText: {
    fontSize: 8,
  },
  updateNotice: {
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  updateNoticeTitle: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  updateNoticeText: {
    color: '#FF6B6B',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
  reloadButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  reloadButtonHighlight: {
    backgroundColor: '#FF3B30',
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  helpText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 12,
  },
});
