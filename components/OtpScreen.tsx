import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import IMAGES from './imageAssets';
import { useTheme } from './ThemeContext';

interface OtpScreenProps {
  mobileNumber: string;
  otp: string;
  onOtpChange: (text: string) => void;
  onOtpSubmit: (code?: string) => void;
  onBack: () => void;
  onResendOtp: () => void;
  resendTimer: number;
  onNeedHelp: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({
  mobileNumber,
  otp,
  onOtpChange,
  onOtpSubmit,
  onBack,
  onResendOtp,
  resendTimer,
  onNeedHelp,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const pinInputRef = useRef<any>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { isDark, colors } = useTheme();

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              backgroundColor: colors.background,
              minHeight: height - insets.top - insets.bottom,
              paddingBottom: Math.max(insets.bottom, 4),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={[styles.screenOuter, { backgroundColor: colors.background, minHeight: height - insets.top - insets.bottom - 4 }]}>
            {/* Top Bar with Back Button & Need Help */}
            <View style={[styles.otpTopBar, isTablet && { paddingTop: 20, paddingBottom: 10 }]}>
              <TouchableOpacity
                style={[styles.otpBackCircleBtn, { backgroundColor: isDark ? colors.surface : '#F1F5F9' }]}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <AppIcon name="back" size={20} color={colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onNeedHelp}
                style={styles.needHelpBtn}
                activeOpacity={0.7}
              >
                <Text style={[styles.needHelpText, { color: colors.primary }]}>Need Help?</Text>
              </TouchableOpacity>
            </View>

            {/* Centered Patient Portal Brand Logo & Title (Enlarged) */}
            <View style={[styles.otpBrandCentered, isTablet && { marginTop: 14, marginBottom: 20 }]}>
              <View style={styles.brandRow}>
                <Image
                  source={IMAGES.patientPortalLogo}
                  fadeDuration={0}
                  style={[styles.portalLogo, isTablet && { width: 66, height: 66 }]}
                  resizeMode="contain"
                />
                <View style={styles.brandTextCol}>
                  <View style={styles.brandTitleRow}>
                    <Text style={[styles.brandTitleDark, { color: colors.textPrimary }, isTablet && { fontSize: 30 }]}>Patient </Text>
                    <Text style={[styles.brandTitleTeal, { color: colors.primary }, isTablet && { fontSize: 30 }]}>Portal</Text>
                  </View>
                  <Text style={[styles.brandSubtitle, { color: colors.textSecondary }, isTablet && { fontSize: 15 }]}>
                    Care Closer to You
                  </Text>
                </View>
              </View>
            </View>

            {/* Heading Section */}
            <View style={styles.otpHeadingSection}>
              <Text style={[styles.otpMainTitle, { color: colors.textPrimary }, isTablet && { fontSize: 28 }]}>Enter OTP</Text>
              <Text style={[styles.otpInstructionText, { color: colors.textSecondary }, isTablet && { fontSize: 14.5 }]}>
                We have sent a 6-digit OTP to
              </Text>
              <TouchableOpacity
                style={[styles.otpPhoneBadge, { backgroundColor: colors.primaryLight }]}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <Text style={[styles.otpPhoneText, { color: colors.primary }, isTablet && { fontSize: 16 }]}>
                  +91 {mobileNumber || '98765 43210'}
                </Text>
                <AppIcon name="edit" size={13} color={colors.primary} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>

            {/* 6 OTP Input Boxes */}
            <TouchableOpacity
              style={[styles.otpBoxesRow, isTablet && { gap: 12 }]}
              activeOpacity={0.9}
              onPress={() => pinInputRef.current?.focus()}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const digit = otp[index] || '';
                const isFocused = isInputFocused && otp.length === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#CBD5E1' },
                      isTablet && { width: 54, height: 64, borderRadius: 14 },
                      digit ? [styles.otpBoxFilled, { borderColor: colors.accent }] : null,
                      isFocused ? [styles.otpBoxActive, { borderColor: colors.primary, shadowColor: colors.primary }] : null,
                    ]}
                  >
                    {digit ? (
                      <Text style={[styles.otpDigitText, { color: colors.textPrimary }, isTablet && { fontSize: 25 }]}>{digit}</Text>
                    ) : isFocused ? (
                      <View style={[styles.otpCursorBar, { backgroundColor: colors.primary }]} />
                    ) : null}
                  </View>
                );
              })}
            </TouchableOpacity>

            {/* Hidden Real TextInput for keypad entry */}
            <TextInput
              ref={pinInputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={onOtpChange}
              autoFocus={false}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onSubmitEditing={() => onOtpSubmit()}
            />

            {/* Resend OTP Timer Row */}
            <View style={styles.otpResendRow}>
              <Text style={[styles.resendNormalText, { color: colors.textSecondary }]}>Didn't receive OTP? </Text>
              <TouchableOpacity
                onPress={onResendOtp}
                disabled={resendTimer > 0}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resendTimerText,
                    { color: colors.primary },
                    resendTimer === 0 && styles.resendClickableText,
                  ]}
                >
                  Resend OTP {resendTimer > 0 ? `(00:${resendTimer < 10 ? '0' : ''}${resendTimer})` : ''}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Verify OTP Button */}
            <View
              style={[
                styles.verifyOtpBtnContainer,
                { width: Math.min(width - 32, 480) },
                isTablet && { marginBottom: 20 },
              ]}
            >
              <TouchableOpacity
                style={[styles.sendOtpBtnWrapper, { shadowColor: colors.primary }, isTablet && { height: 56 }]}
                onPress={() => onOtpSubmit()}
                activeOpacity={0.88}
              >
                <View style={[styles.sendOtpGradient, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.sendOtpBtnText, isTablet && { fontSize: 18 }]}>Verify OTP</Text>
                  <View style={styles.sendOtpArrowBox}>
                    <AppIcon name="arrow-right" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Bottom Leaves and Wave covering footer */}
            <View style={[styles.otpLeavesWaveContainer, isTablet && { height: 360 }]}>
              <Image
                source={IMAGES.leavesWaveBg}
                fadeDuration={0}
                style={[styles.otpLeavesWaveImage, isTablet && { height: 360 }]}
                resizeMode="stretch"
              />

              {/* Security & Encrypted Trust Badge floating on top of wave */}
              <View style={[styles.otpSecurityBadge, { backgroundColor: isDark ? colors.surface : 'rgba(255, 255, 255, 0.92)' }, isTablet && { bottom: 20 }]}>
                <AppIcon name="shield-check" size={20} color={colors.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={[styles.otpSecurityTitle, { color: colors.textPrimary }, isTablet && { fontSize: 13.5 }]}>
                    Secure & Encrypted
                  </Text>
                  <Text style={[styles.otpSecuritySubtitle, { color: colors.textSecondary }, isTablet && { fontSize: 11.5 }]}>
                    Your privacy is our priority
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F8FAFE',
  },
  screenOuter: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8FAFE',
    justifyContent: 'space-between',
  },

  // TOP BAR
  otpTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
    width: '100%',
  },
  otpBackCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  needHelpBtn: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  needHelpText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0284C7',
  },

  // BRAND HEADER
  otpBrandCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portalLogo: {
    width: 56,
    height: 56,
  },
  brandTextCol: {
    marginLeft: 14,
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandTitleDark: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0B2341',
    letterSpacing: -0.3,
  },
  brandTitleTeal: {
    fontSize: 25,
    fontWeight: '800',
    color: '#02AAB0',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },

  // HEADING SECTION
  otpHeadingSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  otpMainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B2341',
    letterSpacing: -0.3,
  },
  otpInstructionText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '400',
  },
  otpPhoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  otpPhoneText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0284C7',
  },

  // 6 OTP BOXES
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    gap: 8,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: '#0284C7',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  otpBoxFilled: {
    borderColor: '#00A896',
    borderWidth: 1.5,
    backgroundColor: '#F8FAFC',
  },
  otpDigitText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B2341',
  },
  otpCursorBar: {
    width: 2,
    height: 22,
    backgroundColor: '#0284C7',
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },

  // RESEND ROW
  otpResendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  resendNormalText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '400',
  },
  resendTimerText: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: '600',
  },
  resendClickableText: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // VERIFY OTP BUTTON
  verifyOtpBtnContainer: {
    width: 480,
    maxWidth: '100%',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 14,
  },
  sendOtpBtnWrapper: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  sendOtpGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOtpGradientImg: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  sendOtpBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  sendOtpArrowBox: {
    position: 'absolute',
    right: 18,
  },

  // FOOTER WAVE & SECURITY BADGE
  otpLeavesWaveContainer: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    height: 270,
  },
  otpLeavesWaveImage: {
    width: '100%',
    height: 270,
  },
  otpSecurityBadge: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  otpSecurityTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0B2341',
  },
  otpSecuritySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});

export default OtpScreen;
