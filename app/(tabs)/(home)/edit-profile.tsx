
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [idNumber, setIdNumber] = useState(user?.idNumber || '');

  const canEdit = user?.kycStatus === 'not_submitted' || user?.kycStatus === 'rejected';

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return;
    }

    if (!idNumber.trim()) {
      Alert.alert('Error', 'Please enter your ID number');
      return;
    }

    try {
      setLoading(true);

      // Check if ID number is already taken by another user
      if (idNumber !== user.idNumber) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id_number', idNumber)
          .neq('id', user.id)
          .single();

        if (existingUser) {
          Alert.alert('Error', 'This ID number is already registered to another account');
          setLoading(false);
          return;
        }
      }

      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          address: address.trim(),
          id_number: idNumber.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      await updateUser({
        name: name.trim(),
        address: address.trim(),
        idNumber: idNumber.trim(),
      });

      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!canEdit) {
    return (
      <SafeAreaView style={styles.container}>
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
          <Text style={styles.title}>Edit Profile</Text>
        </View>

        <View style={styles.restrictedContainer}>
          <IconSymbol 
            ios_icon_name="lock.fill" 
            android_material_icon_name="lock" 
            size={64} 
            color={colors.textSecondary} 
          />
          <Text style={styles.restrictedTitle}>Profile Locked</Text>
          <Text style={styles.restrictedText}>
            Your profile cannot be edited because your KYC verification is {user.kycStatus}.
          </Text>
          <Text style={styles.restrictedSubtext}>
            Profile information can only be modified before KYC verification is approved.
          </Text>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.backToProfileButton]}
            onPress={() => router.back()}
          >
            <Text style={buttonStyles.primaryText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.warningBox}>
          <IconSymbol 
            ios_icon_name="exclamationmark.triangle.fill" 
            android_material_icon_name="warning" 
            size={24} 
            color={colors.warning} 
          />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Important Notice</Text>
            <Text style={styles.warningText}>
              You can only edit your profile information before your KYC verification is approved. 
              Make sure all information is accurate before submitting your KYC.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <IconSymbol 
                ios_icon_name="person.fill" 
                android_material_icon_name="person" 
                size={20} 
                color={colors.textSecondary} 
              />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
            </View>
            <Text style={styles.inputHint}>
              Enter your full legal name as it appears on your ID
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ID Number</Text>
            <View style={styles.inputContainer}>
              <IconSymbol 
                ios_icon_name="number.circle.fill" 
                android_material_icon_name="badge" 
                size={20} 
                color={colors.textSecondary} 
              />
              <TextInput
                style={styles.input}
                value={idNumber}
                onChangeText={setIdNumber}
                placeholder="Enter your ID number"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>
            <Text style={styles.inputHint}>
              Enter your national ID, passport, or driver&apos;s license number
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Residential Address</Text>
            <View style={styles.inputContainer}>
              <IconSymbol 
                ios_icon_name="house.fill" 
                android_material_icon_name="home" 
                size={20} 
                color={colors.textSecondary} 
              />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your residential address"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
              />
            </View>
            <Text style={styles.inputHint}>
              Enter your complete residential address
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <IconSymbol 
            ios_icon_name="info.circle.fill" 
            android_material_icon_name="info" 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.infoText}>
            Your email address and referral code cannot be changed. 
            If you need to update these, please contact support.
          </Text>
        </View>

        <View style={styles.readOnlySection}>
          <Text style={styles.readOnlyLabel}>Email Address (Read-only)</Text>
          <View style={styles.readOnlyValue}>
            <Text style={styles.readOnlyText}>{user.email}</Text>
          </View>

          <Text style={styles.readOnlyLabel}>Referral Code (Read-only)</Text>
          <View style={styles.readOnlyValue}>
            <Text style={styles.readOnlyText}>{user.referralCode}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[buttonStyles.primary, styles.saveButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={20} 
                color="#fff" 
              />
              <Text style={buttonStyles.primaryText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.secondary, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={buttonStyles.secondaryText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    marginBottom: 24,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  readOnlySection: {
    marginBottom: 24,
  },
  readOnlyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  readOnlyValue: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  readOnlyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 12,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  restrictedText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  restrictedSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  backToProfileButton: {
    minWidth: 200,
  },
});
