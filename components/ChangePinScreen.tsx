import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';

interface ChangePinScreenProps {
  userSession: UserSession;
  onBack: () => void;
  onPinChanged?: (newPin: string) => void;
}

export const ChangePinScreen: React.FC<ChangePinScreenProps> = ({
  userSession,
  onBack,
  onPinChanged,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const { isDark, colors } = useTheme();

  // PIN state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Visibility toggles for security
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<{
    currentPin?: string;
    newPin?: string;
    confirmPin?: string;
  }>({});

  // Loader state
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    message?: string;
    subtitle?: string;
  }>({ visible: false });

  const clearError = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleUpdatePin = () => {
    const cleanCurrent = currentPin.trim();
    const cleanNew = newPin.trim();
    const cleanConfirm = confirmPin.trim();

    // 1. Current PIN Check
    if (!cleanCurrent) {
      setErrors({ currentPin: 'Please enter your current 4-digit PIN.' });
      return;
    } else if (cleanCurrent.length < 4) {
      setErrors({ currentPin: 'Current PIN must be 4 digits.' });
      return;
    }

    // 2. New PIN Check
    if (!cleanNew) {
      setErrors({ newPin: 'Please enter a new 4-digit PIN.' });
      return;
    } else if (cleanNew.length < 4) {
      setErrors({ newPin: 'New PIN must be exactly 4 digits.' });
      return;
    } else if (cleanNew === cleanCurrent) {
      setErrors({ newPin: 'New PIN cannot be the same as your current PIN.' });
      return;
    }

    // 3. Confirm PIN Check
    if (!cleanConfirm) {
      setErrors({ confirmPin: 'Please confirm your new 4-digit PIN.' });
      return;
    } else if (cleanConfirm !== cleanNew) {
      setErrors({ confirmPin: 'New PIN and Confirm PIN do not match.' });
      return;
    }

    setErrors({});

    setLoaderState({
      visible: true,
      message: 'Updating Security PIN...',
      subtitle: 'Saving new 4-digit security credentials',
    });

    setTimeout(() => {
      setLoaderState({ visible: false });
      Alert.alert(
        'PIN Updated Successfully! 🎉',
        'Your 4-digit access PIN has been updated. Please use your new PIN for instant login next time.',
        [
          {
            text: 'Done',
            onPress: () => {
              if (onPinChanged) {
                onPinChanged(cleanNew);
              }
              onBack();
            },
          },
        ]
      );
    }, 800);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
          {/* TOP HEADER BAR (Visit Details style) */}
          <View
            style={[
              styles.headerBar,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
                paddingHorizontal: isTablet ? 20 : 16,
                paddingTop: isTablet ? 14 : 10,
                paddingBottom: isTablet ? 14 : 12,
              },
            ]}
          >
            <View style={[styles.headerSideGroup, isTablet && { width: 44 }]}>
              <TouchableOpacity
                onPress={onBack}
                style={[styles.headerBackBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }, isTablet && { width: 42, height: 42, borderRadius: 21 }]}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon name="back" size={isTablet ? 24 : 20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.headerCenterGroup}>
              <Text style={[styles.headerTitleCentered, { color: colors.primary }, isTablet && { fontSize: 22 }]}>
                Change Access PIN
              </Text>
            </View>

            <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
          </View>

          {/* MAIN FORM SCROLL AREA */}
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: isTablet ? 24 : 16,
                paddingTop: isTablet ? 20 : 16,
                paddingBottom: insets.bottom + 40,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* HERO SECURITY BADGE CARD */}
            <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.heroIconBg, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="key" size={26} color={colors.primary} />
              </View>
              <View style={styles.heroTextCol}>
                <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>4-Digit Security PIN</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                  Update your security PIN to protect your personal health records and enable instant biometric/PIN login.
                </Text>
              </View>
            </View>

            {/* PIN FORM CARD */}
            <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* FIELD 1: CURRENT PIN */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                  Current 4-Digit PIN <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: errors.currentPin ? '#DC2626' : colors.border }]}>
                  <AppIcon name="lock" size={18} color={colors.primary} style={styles.inputLeftIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    placeholder="Enter current 4-digit PIN (e.g. 1234)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={!showCurrentPin}
                    value={currentPin}
                    onChangeText={(val) => {
                      clearError('currentPin');
                      setCurrentPin(val.replace(/\D/g, ''));
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowCurrentPin(!showCurrentPin)}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="eye" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                {errors.currentPin && <Text style={styles.errorText}>{errors.currentPin}</Text>}
              </View>

              {/* FIELD 2: NEW PIN */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                  New 4-Digit PIN <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: errors.newPin ? '#DC2626' : colors.border }]}>
                  <AppIcon name="key" size={18} color={colors.primary} style={styles.inputLeftIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    placeholder="Enter new 4-digit PIN"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={!showNewPin}
                    value={newPin}
                    onChangeText={(val) => {
                      clearError('newPin');
                      setNewPin(val.replace(/\D/g, ''));
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowNewPin(!showNewPin)}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="eye" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                {errors.newPin && <Text style={styles.errorText}>{errors.newPin}</Text>}
              </View>

              {/* FIELD 3: CONFIRM NEW PIN */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                  Confirm New 4-Digit PIN <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: errors.confirmPin ? '#DC2626' : colors.border }]}>
                  <AppIcon name="check" size={18} color={colors.primary} style={styles.inputLeftIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    placeholder="Re-enter new 4-digit PIN"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={!showConfirmPin}
                    value={confirmPin}
                    onChangeText={(val) => {
                      clearError('confirmPin');
                      setConfirmPin(val.replace(/\D/g, ''));
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowConfirmPin(!showConfirmPin)}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="eye" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                {errors.confirmPin && <Text style={styles.errorText}>{errors.confirmPin}</Text>}
              </View>

              {/* SUBMIT BUTTON */}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleUpdatePin}
                activeOpacity={0.88}
              >
                <AppIcon name="shield-check" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Save New Security PIN</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Universal Loader */}
          <UniversalLoader
            visible={loaderState.visible}
            message={loaderState.message}
            subtitle={loaderState.subtitle}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerSideGroup: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenterGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCentered: {
    fontSize: 18.5,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    gap: 16,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 14,
  },
  heroIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  formCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  requiredStar: {
    color: '#DC2626',
    fontWeight: '800',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  errorText: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ChangePinScreen;
