
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { APP_VERSION, BUILD_ID, BUILD_DATE, BUILD_TIMESTAMP, forceReload, startUpdateChecker } from '@/constants/AppVersion';
import { colors } from '@/styles/commonStyles';

interface VersionDisplayProps {
  position?: 'top' | 'bottom';
  showDetails?: boolean;
}

export default function VersionDisplay({ position = 'bottom', showDetails = false }: VersionDisplayProps) {
  const [expanded, setExpanded] = useState(showDetails);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Start periodic update checker on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const cleanup = startUpdateChecker(() => {
        setUpdateAvailable(true);
        setLastChecked(new Date());
      });
      
      return cleanup;
    }
  }, []);

  const handlePress = () => {
    setExpanded(!expanded);
  };

  const handleForceReload = () => {
    if (Platform.OS === 'web') {
      forceReload();
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
            <Text style={styles.detailValue}>{BUILD_ID}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Timestamp:</Text>
            <Text style={styles.detailValue}>{BUILD_TIMESTAMP}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha:</Text>
            <Text style={styles.detailValue}>{formatDate(new Date(BUILD_DATE))}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plataforma:</Text>
            <Text style={styles.detailValue}>{Platform.OS}</Text>
          </View>
          
          {lastChecked && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Última verificación:</Text>
              <Text style={styles.detailValue}>{formatDate(lastChecked)}</Text>
            </View>
          )}
          
          {updateAvailable && (
            <View style={styles.updateNotice}>
              <Text style={styles.updateNoticeText}>
                🔄 Nueva versión disponible
              </Text>
            </View>
          )}
          
          {Platform.OS === 'web' && (
            <TouchableOpacity onPress={handleForceReload} style={styles.reloadButton}>
              <Text style={styles.reloadButtonText}>
                {updateAvailable ? '🔄 Actualizar Ahora' : '🔄 Forzar Recarga'}
              </Text>
            </TouchableOpacity>
          )}
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
    minWidth: 280,
    maxWidth: 320,
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
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  updateNotice: {
    marginTop: 12,
    marginBottom: 8,
    padding: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  updateNoticeText: {
    color: '#FF3B30',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reloadButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
