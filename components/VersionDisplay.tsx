
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { APP_VERSION, BUILD_ID, BUILD_DATE, forceReload } from '@/constants/AppVersion';
import { colors } from '@/styles/commonStyles';

interface VersionDisplayProps {
  position?: 'top' | 'bottom';
  showDetails?: boolean;
}

export default function VersionDisplay({ position = 'bottom', showDetails = false }: VersionDisplayProps) {
  const [expanded, setExpanded] = useState(showDetails);

  const handlePress = () => {
    setExpanded(!expanded);
  };

  const handleForceReload = () => {
    if (Platform.OS === 'web') {
      forceReload();
    }
  };

  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <TouchableOpacity onPress={handlePress} style={styles.versionButton}>
        <Text style={styles.versionText}>v{APP_VERSION}</Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>Versión: {APP_VERSION}</Text>
          <Text style={styles.detailText}>Build ID: {BUILD_ID}</Text>
          <Text style={styles.detailText}>Fecha: {new Date(BUILD_DATE).toLocaleString('es-ES')}</Text>
          <Text style={styles.detailText}>Plataforma: {Platform.OS}</Text>
          
          {Platform.OS === 'web' && (
            <TouchableOpacity onPress={handleForceReload} style={styles.reloadButton}>
              <Text style={styles.reloadButtonText}>Forzar Recarga</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  versionText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 200,
  },
  detailText: {
    color: colors.text,
    fontSize: 10,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  reloadButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
