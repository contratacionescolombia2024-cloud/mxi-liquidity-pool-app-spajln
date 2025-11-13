
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailBadge: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444444',
  },
  detailText: {
    fontSize: 12,
    color: colors.text,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  infoSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    color: colors.primary,
    marginRight: 8,
    fontSize: 14,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default function ContratacionesScreen() {
  const router = useRouter();

  const jobPositions = [
    {
      id: 1,
      title: 'Desarrollador Blockchain Senior',
      description: 'Buscamos un desarrollador con experiencia en tecnologías blockchain para liderar el desarrollo de nuestra plataforma MXI.',
      type: 'Tiempo Completo',
      location: 'Remoto',
      experience: '3+ años',
    },
    {
      id: 2,
      title: 'Especialista en Marketing Digital',
      description: 'Responsable de crear y ejecutar estrategias de marketing para promover el pool de liquidez MXI.',
      type: 'Tiempo Completo',
      location: 'Híbrido',
      experience: '2+ años',
    },
    {
      id: 3,
      title: 'Analista de Datos Financieros',
      description: 'Análisis de métricas del pool de liquidez y generación de reportes para optimizar el rendimiento.',
      type: 'Medio Tiempo',
      location: 'Remoto',
      experience: '1+ año',
    },
  ];

  const handleApply = (jobTitle: string) => {
    console.log(`Aplicando a: ${jobTitle}`);
    // Aquí se puede implementar la lógica de aplicación
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contrataciones</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Únete al Equipo MXI</Text>
          <Text style={styles.infoText}>
            Estamos construyendo el futuro de las criptomonedas y buscamos
            talento excepcional para unirse a nuestro equipo.
          </Text>
          <Text style={styles.infoText}>
            Ofrecemos:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Salario competitivo y bonos en MXI
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Trabajo remoto o híbrido
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Oportunidades de crecimiento profesional
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Ambiente de trabajo innovador
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posiciones Disponibles</Text>
          {jobPositions.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobDescription}>{job.description}</Text>
              <View style={styles.jobDetails}>
                <View style={styles.detailBadge}>
                  <Text style={styles.detailText}>{job.type}</Text>
                </View>
                <View style={styles.detailBadge}>
                  <Text style={styles.detailText}>{job.location}</Text>
                </View>
                <View style={styles.detailBadge}>
                  <Text style={styles.detailText}>{job.experience}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => handleApply(job.title)}
              >
                <Text style={styles.applyButtonText}>Aplicar Ahora</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Proceso de Selección</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>1.</Text>
            <Text style={styles.bulletText}>
              Envío de aplicación y CV
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>2.</Text>
            <Text style={styles.bulletText}>
              Revisión de candidatos (3-5 días)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>3.</Text>
            <Text style={styles.bulletText}>
              Entrevista inicial (virtual)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>4.</Text>
            <Text style={styles.bulletText}>
              Prueba técnica o proyecto
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>5.</Text>
            <Text style={styles.bulletText}>
              Entrevista final y oferta
            </Text>
          </View>
        </View>

        {/* Extra padding at bottom to avoid tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
