
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function LaunchCountdown() {
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [launchDate] = useState(new Date('2026-02-15T12:00:00Z'));

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated background elements */}
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
        <View style={styles.backgroundCircle3} />
        
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.rocketContainer}>
              <IconSymbol 
                ios_icon_name="sparkles" 
                android_material_icon_name="auto_awesome" 
                size={32} 
                color="#fff" 
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>🚀 LANZAMIENTO OFICIAL</Text>
              <Text style={styles.subtitle}>Maxcoin (MXI)</Text>
            </View>
            <View style={styles.rocketContainer}>
              <IconSymbol 
                ios_icon_name="sparkles" 
                android_material_icon_name="auto_awesome" 
                size={32} 
                color="#fff" 
              />
            </View>
          </View>

          {/* Date Display */}
          <View style={styles.dateContainer}>
            <IconSymbol 
              ios_icon_name="calendar" 
              android_material_icon_name="event" 
              size={20} 
              color="rgba(255, 255, 255, 0.9)" 
            />
            <Text style={styles.dateText}>15 de Febrero 2026 • 12:00 UTC</Text>
          </View>

          {/* Countdown Display */}
          <View style={styles.countdownContainer}>
            {/* Days */}
            <View style={styles.timeBlock}>
              <View style={styles.timeCard}>
                <Text style={styles.timeValue}>{countdown.days}</Text>
              </View>
              <Text style={styles.timeLabel}>DÍAS</Text>
            </View>

            <Text style={styles.separator}>:</Text>

            {/* Hours */}
            <View style={styles.timeBlock}>
              <View style={styles.timeCard}>
                <Text style={styles.timeValue}>{countdown.hours.toString().padStart(2, '0')}</Text>
              </View>
              <Text style={styles.timeLabel}>HORAS</Text>
            </View>

            <Text style={styles.separator}>:</Text>

            {/* Minutes */}
            <View style={styles.timeBlock}>
              <View style={styles.timeCard}>
                <Text style={styles.timeValue}>{countdown.minutes.toString().padStart(2, '0')}</Text>
              </View>
              <Text style={styles.timeLabel}>MIN</Text>
            </View>

            <Text style={styles.separator}>:</Text>

            {/* Seconds */}
            <View style={styles.timeBlock}>
              <View style={styles.timeCard}>
                <Text style={styles.timeValue}>{countdown.seconds.toString().padStart(2, '0')}</Text>
              </View>
              <Text style={styles.timeLabel}>SEG</Text>
            </View>
          </View>

          {/* Bottom Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={18} 
                color="rgba(255, 255, 255, 0.9)" 
              />
              <Text style={styles.infoText}>Pool de Liquidez Activo</Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={18} 
                color="rgba(255, 255, 255, 0.9)" 
              />
              <Text style={styles.infoText}>Vesting en Tiempo Real</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -30,
    left: -30,
  },
  backgroundCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: '50%',
    left: '50%',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  rocketContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  timeBlock: {
    alignItems: 'center',
    gap: 8,
  },
  timeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
  separator: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
});
