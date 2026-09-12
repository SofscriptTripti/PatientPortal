import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  Image,
  ImageBackground,
  useWindowDimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';
import MobileEntryScreen from './MobileEntryScreen';
import OtpScreen from './OtpScreen';
import UniversalLoader from './UniversalLoader';

interface AuthScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;

  // Universal Loader state
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    message?: string;
    subtitle?: string;
  }>({ visible: false });

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login flow: mobile entry with on-page OTP modal
  const [loginStep, setLoginStep] = useState<'mobile' | 'pin'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const otpInputRef = useRef<any>(null);
  const [storedUserName, setStoredUserName] = useState('Deepak Chouhan');

  // Register form fields
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regGender, setRegGender] = useState<'M' | 'F' | 'Other'>('M');
  const [regAge, setRegAge] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');

  // Modals
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Forgot PIN state
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotStep, setForgotStep] = useState<'request_otp' | 'verify_otp' | 'set_new_pin'>('request_otp');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [newForgotPin, setNewForgotPin] = useState('');
  const [confirmForgotPin, setConfirmForgotPin] = useState('');

  // Change PIN state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newChangePinInput, setNewChangePinInput] = useState('');
  const [confirmChangePinInput, setConfirmChangePinInput] = useState('');

  // Countdown timer for Resend OTP in Modal
  useEffect(() => {
    let interval: any;
    if (showOtpModal && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOtpModal, resendTimer]);

  // Auto-focus OTP input when modal appears to automatically open keyboard
  useEffect(() => {
    if (showOtpModal) {
      const t1 = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
      const t2 = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 300);
      const t3 = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [showOtpModal]);

  // Mobile Submit -> Stay on same page, show OTP Modal
  const handleMobileSubmit = () => {
    Keyboard.dismiss();
    const cleaned = mobileNumber.trim();
    if (!cleaned || cleaned.length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoaderState({
      visible: true,
      message: 'Sending OTP...',
      subtitle: `Sending 4-digit verification code to +91 ${cleaned}`,
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      setOtp('');
      setResendTimer(30);
      setShowOtpModal(true);
    }, 500);
  };

  // OTP Submit -> Verify and Login (called automatically when 4 digits are entered)
  const handleOtpSubmit = (codeToVerify?: string) => {
    const code = codeToVerify !== undefined ? codeToVerify : otp;
    if (code.length < 4) {
      Alert.alert('OTP Required', 'Please enter the 4-digit OTP sent to your phone.');
      return;
    }

    setLoaderState({
      visible: true,
      message: 'Verifying OTP...',
      subtitle: 'Authenticating your secure patient session',
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      setShowOtpModal(false);
      onLoginSuccess({
        mobileNumber: mobileNumber.trim() || '9876543210',
        name: storedUserName || 'Patient Account',
        isLoggedIn: true,
      });
    }, 650);
  };

  // Handle 4-digit OTP typing & auto-verify immediately without button click
  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    setOtp(cleaned);
    if (cleaned.length === 4) {
      Keyboard.dismiss();
      setTimeout(() => {
        handleOtpSubmit(cleaned);
      }, 150);
    }
  };

  // Resend OTP handler inside Modal
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setLoaderState({
      visible: true,
      message: 'Resending OTP...',
      subtitle: `Sending fresh 4-digit code to +91 ${mobileNumber}`,
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      setResendTimer(30);
      setOtp('');
      Alert.alert(
        'OTP Resent Successfully',
        `A fresh 4-digit OTP has been sent to +91 ${mobileNumber || '98765 43210'}. (Demo OTP: 1234)`
      );
    }, 500);
  };

  // Register Submit
  const handleRegisterSubmit = () => {
    if (!regName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    if (!regMobile.trim() || regMobile.length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regAge.trim()) {
      Alert.alert('Age Required', 'Please enter your age.');
      return;
    }
    if (regPin.length !== 4) {
      Alert.alert('PIN Required', 'Please set a 4-digit security PIN.');
      return;
    }
    if (regPin !== regConfirmPin) {
      Alert.alert('PIN Mismatch', 'Your PIN and confirm PIN do not match.');
      return;
    }

    setLoaderState({
      visible: true,
      message: 'Creating Health Account...',
      subtitle: 'Setting up your secure patient profile',
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      setStoredUserName(regName.toUpperCase());
      setMobileNumber(regMobile);
      onLoginSuccess({
        mobileNumber: regMobile,
        name: regName.toUpperCase(),
        isLoggedIn: true,
      });
    }, 750);
  };

  // Forgot PIN Handler
  const handleForgotPinSubmit = () => {
    if (forgotStep === 'request_otp') {
      if (!forgotMobile.trim() || forgotMobile.length < 10) {
        Alert.alert('Invalid Mobile', 'Please enter your registered mobile number.');
        return;
      }
      setForgotStep('verify_otp');
      Alert.alert('OTP Sent', `A verification OTP has been sent to +91 ${forgotMobile}. Use 123456 to verify.`);
      return;
    }

    if (forgotStep === 'verify_otp') {
      if (forgotOtpInput.length < 4) {
        Alert.alert('OTP Required', 'Please enter the verification OTP.');
        return;
      }
      setForgotStep('set_new_pin');
      return;
    }

    if (newForgotPin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be 4 digits.');
      return;
    }
    if (newForgotPin !== confirmForgotPin) {
      Alert.alert('Mismatch', 'New PIN and Confirm PIN do not match.');
      return;
    }

    setMobileNumber(forgotMobile);
    setShowForgotPinModal(false);
    setForgotStep('request_otp');
    setForgotMobile('');
    setForgotOtpInput('');
    setNewForgotPin('');
    setConfirmForgotPin('');
    Alert.alert('Success', 'Your security PIN has been reset! You can now log in.');
  };

  // Change PIN Handler
  const handleChangePinSubmit = () => {
    if (currentPinInput !== '1234') {
      Alert.alert('Incorrect Current PIN', 'The current PIN you entered is incorrect.');
      return;
    }
    if (newChangePinInput.length !== 4) {
      Alert.alert('Invalid New PIN', 'New PIN must be 4 digits.');
      return;
    }
    if (newChangePinInput !== confirmChangePinInput) {
      Alert.alert('Mismatch', 'New PIN and Confirm PIN do not match.');
      return;
    }
    setShowChangePinModal(false);
    setCurrentPinInput('');
    setNewChangePinInput('');
    setConfirmChangePinInput('');
    Alert.alert('PIN Updated', 'Your 4-digit security PIN has been updated successfully.');
  };

  return (
    <View style={styles.container}>
      {/* SCREEN: MOBILE NUMBER ENTRY (STAYS ON SAME PAGE) */}
      {authMode === 'login' && (
        <MobileEntryScreen
          mobileNumber={mobileNumber}
          setMobileNumber={setMobileNumber}
          onMobileSubmit={handleMobileSubmit}
          onOpenRegister={() => setAuthMode('register')}
        />
      )}

      {/* REGISTER FLOW */}
      {authMode === 'register' && (
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
          >
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                {
                  minHeight: height - insets.top - insets.bottom,
                  paddingBottom: Math.max(insets.bottom, 4),
                },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View style={[styles.screenOuter, { minHeight: height - insets.top - insets.bottom - 4 }]}>
                <View style={styles.pinStepCard}>
                  <View style={styles.stepBackRow}>
                    <TouchableOpacity
                      style={styles.backCircleBtn}
                      onPress={() => setAuthMode('login')}
                      activeOpacity={0.8}
                    >
                      <AppIcon name="back" size={20} color="#0F253E" />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.pinStepHeading}>Patient Registration</Text>
                      <Text style={styles.pinStepSubtitle}>
                        Create your health account to access hospital records
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.fieldLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.textInputStyled}
                    placeholder="e.g. Priya Sharma"
                    placeholderTextColor="#94A3B8"
                    value={regName}
                    onChangeText={setRegName}
                  />

                  <Text style={styles.fieldLabel}>Mobile Number *</Text>
                  <View style={styles.mobileInputRow}>
                    <View style={styles.flagContainer}>
                      <Text style={{ fontSize: 16 }}>🇮🇳</Text>
                      <Text style={[styles.countryCodeText, { marginLeft: 6 }]}>+91</Text>
                    </View>
                    <View style={styles.inputDivider} />
                    <TextInput
                      style={styles.mobileTextInput}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={regMobile}
                      onChangeText={setRegMobile}
                    />
                  </View>

                  <View style={styles.twoColumnRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.fieldLabel}>Age *</Text>
                      <TextInput
                        style={styles.textInputStyled}
                        placeholder="e.g. 28"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        value={regAge}
                        onChangeText={setRegAge}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.fieldLabel}>Gender</Text>
                      <View style={styles.genderPillsContainer}>
                        {(['M', 'F'] as const).map((g) => (
                          <TouchableOpacity
                            key={g}
                            style={[
                              styles.genderPill,
                              regGender === g && styles.genderPillActive,
                            ]}
                            onPress={() => setRegGender(g)}
                          >
                            <Text
                              style={[
                                styles.genderPillText,
                                regGender === g && styles.genderPillTextActive,
                              ]}
                            >
                              {g === 'M' ? 'Male' : 'Female'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <Text style={styles.fieldLabel}>Create 4-Digit Security PIN *</Text>
                  <TextInput
                    style={styles.textInputStyled}
                    placeholder="••••"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    value={regPin}
                    onChangeText={setRegPin}
                  />

                  <Text style={styles.fieldLabel}>Confirm PIN *</Text>
                  <TextInput
                    style={styles.textInputStyled}
                    placeholder="••••"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    value={regConfirmPin}
                    onChangeText={setRegConfirmPin}
                  />

                  <TouchableOpacity
                    style={[styles.sendOtpBtnWrapper, { marginTop: 20 }]}
                    onPress={handleRegisterSubmit}
                    activeOpacity={0.88}
                  >
                    <ImageBackground
                      source={require('../assets/images/btn_gradient_bg.png')}
                      style={styles.sendOtpGradient}
                      imageStyle={styles.sendOtpGradientImg}
                    >
                      <Text style={styles.sendOtpBtnText}>Register & Proceed</Text>
                      <View style={styles.sendOtpArrowBox}>
                        <AppIcon name="check" size={20} color="#FFFFFF" />
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.switchNumberBtn}
                    onPress={() => setAuthMode('login')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.switchNumberText}>Already registered? Log In</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bottomWaveContainer}>
                  <Image
                    source={require('../assets/images/wave_footer_bg.png')}
                    style={[styles.bottomWaveImage, isTablet && { height: 310 }]}
                    resizeMode="stretch"
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}

      {/* NEED HELP MODAL */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppIcon name="info" size={22} color="#1D61E7" style={{ marginRight: 8 }} />
                <Text style={styles.modalHeading}>Patient Support</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalInstruction}>
              Need assistance logging into your Patient Portal? We are here to help you 24/7.
            </Text>

            <View style={styles.helpOptionCard}>
              <View style={[styles.helpIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <AppIcon name="phone" size={20} color="#0284C7" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.helpOptionTitle}>Toll-Free Helpline</Text>
                <Text style={styles.helpOptionSubtitle}>1800-209-4455 (Toll Free 24x7)</Text>
              </View>
            </View>

            <View style={styles.helpOptionCard}>
              <View style={[styles.helpIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <AppIcon name="hospital" size={20} color="#16A34A" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.helpOptionTitle}>Hospital Reception Desk</Text>
                <Text style={styles.helpOptionSubtitle}>+91 22 2172 5555</Text>
              </View>
            </View>

            <View style={styles.helpOptionCard}>
              <View style={[styles.helpIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <AppIcon name="key" size={20} color="#7C3AED" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.helpOptionTitle}>Demo OTP</Text>
                <Text style={styles.helpOptionSubtitle}>Use 123456 to verify directly</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FORGOT PIN MODAL */}
      <Modal
        visible={showForgotPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotPinModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>Reset Security PIN</Text>
              <TouchableOpacity onPress={() => setShowForgotPinModal(false)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {forgotStep === 'request_otp' && (
              <>
                <Text style={styles.modalInstruction}>
                  Enter your registered mobile number to receive a PIN reset OTP.
                </Text>
                <TextInput
                  style={styles.textInputStyled}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={forgotMobile}
                  onChangeText={setForgotMobile}
                />
              </>
            )}

            {forgotStep === 'verify_otp' && (
              <>
                <Text style={styles.modalInstruction}>
                  Enter the 6-digit OTP sent to +91 {forgotMobile}. (Demo: 123456)
                </Text>
                <TextInput
                  style={styles.textInputStyled}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={forgotOtpInput}
                  onChangeText={setForgotOtpInput}
                />
              </>
            )}

            {forgotStep === 'set_new_pin' && (
              <>
                <Text style={styles.modalInstruction}>
                  Create and confirm your new 4-digit security PIN.
                </Text>
                <TextInput
                  style={styles.textInputStyled}
                  placeholder="New 4-digit PIN"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={newForgotPin}
                  onChangeText={setNewForgotPin}
                />
                <TextInput
                  style={[styles.textInputStyled, { marginTop: 10 }]}
                  placeholder="Confirm new PIN"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={confirmForgotPin}
                  onChangeText={setConfirmForgotPin}
                />
              </>
            )}

            <TouchableOpacity
              style={styles.sendOtpBtnWrapper}
              onPress={handleForgotPinSubmit}
              activeOpacity={0.88}
            >
              <ImageBackground
                source={require('../assets/images/btn_gradient_bg.png')}
                style={styles.sendOtpGradient}
                imageStyle={styles.sendOtpGradientImg}
              >
                <Text style={styles.sendOtpBtnText}>
                  {forgotStep === 'request_otp' && 'Send Reset OTP'}
                  {forgotStep === 'verify_otp' && 'Verify OTP'}
                  {forgotStep === 'set_new_pin' && 'Save New PIN'}
                </Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CHANGE PIN MODAL */}
      <Modal
        visible={showChangePinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChangePinModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>Change 4-Digit PIN</Text>
              <TouchableOpacity onPress={() => setShowChangePinModal(false)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Current PIN *</Text>
            <TextInput
              style={styles.textInputStyled}
              placeholder="Current 4-digit PIN (default 1234)"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={currentPinInput}
              onChangeText={setCurrentPinInput}
            />

            <Text style={styles.fieldLabel}>New PIN *</Text>
            <TextInput
              style={styles.textInputStyled}
              placeholder="New 4-digit PIN"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={newChangePinInput}
              onChangeText={setNewChangePinInput}
            />

            <Text style={styles.fieldLabel}>Confirm New PIN *</Text>
            <TextInput
              style={styles.textInputStyled}
              placeholder="Confirm new 4-digit PIN"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={confirmChangePinInput}
              onChangeText={setConfirmChangePinInput}
            />

            <TouchableOpacity
              style={[styles.sendOtpBtnWrapper, { marginTop: 18 }]}
              onPress={handleChangePinSubmit}
              activeOpacity={0.88}
            >
              <ImageBackground
                source={require('../assets/images/btn_gradient_bg.png')}
                style={styles.sendOtpGradient}
                imageStyle={styles.sendOtpGradientImg}
              >
                <Text style={styles.sendOtpBtnText}>Update PIN</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ON-PAGE 4-DIGIT OTP MODAL (AUTO-VERIFIES ON 4 DIGITS) */}
      <Modal
        visible={showOtpModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onShow={() => {
          setTimeout(() => {
            otpInputRef.current?.focus();
          }, 80);
          setTimeout(() => {
            otpInputRef.current?.focus();
          }, 250);
        }}
        onRequestClose={() => setShowOtpModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.otpModalBackdrop}
        >
          <View style={[styles.otpModalContainer, isTablet && { maxWidth: 420, padding: 26 }]}>
            {/* Modal Header: Just "Enter Your Pin" + Close Button */}
            <View style={styles.otpModalHeader}>
              <Text style={styles.otpModalTitle}>Enter Your Pin</Text>

              <TouchableOpacity
                onPress={() => setShowOtpModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.otpCloseBtn}
              >
                <AppIcon name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* 4 Digit Boxes Container with full interactive TextInput Overlay */}
            <View style={styles.otpBoxesContainer}>
              <View style={styles.otpBoxesWrapper} pointerEvents="none">
                {[0, 1, 2, 3].map((index) => {
                  const digit = otp[index] || '';
                  const isFocused = otp.length === index;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpDigitBox,
                        digit ? styles.otpDigitBoxFilled : null,
                        isFocused && styles.otpDigitBoxActive,
                      ]}
                    >
                      <Text style={styles.otpDigitText}>{digit}</Text>
                    </View>
                  );
                })}
              </View>

              {/* TextInput covering the boxes to guarantee soft keyboard trigger */}
              <TextInput
                ref={otpInputRef}
                style={styles.hiddenInput}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus={true}
                caretHidden={true}
              />
            </View>

            {/* Resend Option */}
            <View style={styles.otpResendRow}>
              {resendTimer > 0 ? (
                <Text style={styles.otpTimerText}>
                  Resend code in{' '}
                  <Text style={styles.otpTimerCount}>
                    00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}s
                  </Text>
                </Text>
              ) : (
                <View style={styles.resendActiveRow}>
                  <Text style={styles.resendPromptText}>Didn't receive code? </Text>
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Text style={styles.resendActionLink}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Universal Loader with App Icon and Status Message */}
      <UniversalLoader
        visible={loaderState.visible}
        message={loaderState.message}
        subtitle={loaderState.subtitle}
      />
    </View>
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

  // REGISTER / PIN CARD STYLES
  pinStepCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 22,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#0F253E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  stepBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinStepHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B2341',
  },
  pinStepSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 14,
    marginBottom: 6,
  },
  textInputStyled: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0B2341',
    backgroundColor: '#FFFFFF',
  },
  mobileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: '#FFFFFF',
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0B2341',
  },
  inputDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  mobileTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0B2341',
    paddingVertical: 0,
  },
  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genderPillsContainer: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  genderPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderPillActive: {
    backgroundColor: '#0284C7',
  },
  genderPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  genderPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  switchNumberBtn: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 8,
  },
  switchNumberText: {
    fontSize: 13.5,
    color: '#0284C7',
    fontWeight: '600',
  },
  sendOtpBtnWrapper: {
    height: 50,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 14,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  sendOtpGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOtpGradientImg: {
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
  bottomWaveContainer: {
    width: '100%',
    marginTop: 'auto',
    overflow: 'hidden',
  },
  bottomWaveImage: {
    width: '100%',
    height: 230,
  },

  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 37, 62, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalHeading: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#0B2341',
  },
  modalInstruction: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  helpIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2341',
  },
  helpOptionSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseButton: {
    marginTop: 10,
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#334155',
  },

  // ON-PAGE OTP MODAL STYLES
  otpModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 35, 65, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  otpModalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0B2341',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    alignItems: 'center',
  },
  otpModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingTop: 2,
  },
  otpModalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  otpCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxesContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 68,
    marginVertical: 8,
  },
  otpBoxesWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  otpDigitBox: {
    width: 58,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  otpDigitBoxActive: {
    borderColor: '#0284C7',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  otpDigitBoxFilled: {
    borderColor: '#02AAB0',
    backgroundColor: '#FFFFFF',
  },
  otpDigitText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
    color: 'transparent',
    backgroundColor: 'transparent',
  },
  otpResendRow: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpTimerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  otpTimerCount: {
    color: '#0284C7',
    fontWeight: '700',
  },
  resendActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendPromptText: {
    fontSize: 13,
    color: '#64748B',
  },
  resendActionLink: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0284C7',
    textDecorationLine: 'underline',
  },
});

export default AuthScreen;
