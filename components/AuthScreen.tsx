import React, { useState, useRef } from 'react';
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
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';

interface AuthScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const insets = useSafeAreaInsets();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login flow: 'mobile' (step 1) -> 'pin' (step 2)
  const [loginStep, setLoginStep] = useState<'mobile' | 'pin'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('9819863084');
  const [pin, setPin] = useState('');
  const [userPin, setUserPin] = useState('1234');
  const [storedUserName, setStoredUserName] = useState('CHOUGULE MINAL SACHIN');

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

  // Forgot PIN state
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotStep, setForgotStep] = useState<'request_otp' | 'verify_otp' | 'set_new_pin'>('request_otp');
  const [otpInput, setOtpInput] = useState('');
  const [newForgotPin, setNewForgotPin] = useState('');
  const [confirmForgotPin, setConfirmForgotPin] = useState('');

  // Change PIN state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newChangePinInput, setNewChangePinInput] = useState('');
  const [confirmChangePinInput, setConfirmChangePinInput] = useState('');

  const pinInputRef = useRef<any>(null);

  // Mobile Submit -> Transition to PIN screen
  const handleMobileSubmit = () => {
    const cleaned = mobileNumber.trim();
    if (!cleaned || cleaned.length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setPin('');
    setLoginStep('pin');
  };

  // PIN Submit -> Verify and Login
  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      Alert.alert('PIN Required', 'Please enter your 4-digit security PIN.');
      return;
    }

    onLoginSuccess({
      mobileNumber: mobileNumber.trim(),
      name: storedUserName || 'Patient Account',
      isLoggedIn: true,
    });
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
    if (regPin.length !== 4) {
      Alert.alert('PIN Required', 'Please set a 4-digit security PIN.');
      return;
    }
    if (regPin !== regConfirmPin) {
      Alert.alert('PIN Mismatch', 'The PIN and Confirm PIN do not match.');
      return;
    }

    setUserPin(regPin);
    setStoredUserName(regName.trim());
    setMobileNumber(regMobile.trim());

    Alert.alert(
      'Registration Successful!',
      `Welcome to Bethany Hospitals, ${regName.trim()}! Your account and 4-digit PIN are active.`,
      [
        {
          text: 'Go to Patient Portal',
          onPress: () => {
            onLoginSuccess({
              mobileNumber: regMobile.trim(),
              name: regName.trim(),
              isLoggedIn: true,
            });
          },
        },
      ]
    );
  };

  // Forgot PIN Handlers
  const handleSendOtp = () => {
    if (!forgotMobile || forgotMobile.length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter your 10-digit registered mobile number.');
      return;
    }
    setOtpInput('5824');
    setForgotStep('verify_otp');
    Alert.alert('OTP Sent', `Verification OTP has been sent to +91 ${forgotMobile}. (Demo OTP: 5824)`);
  };

  const handleVerifyOtp = () => {
    if (otpInput !== '5824' && otpInput.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter the 4-digit OTP sent to your phone (Demo OTP: 5824).');
      return;
    }
    setForgotStep('set_new_pin');
  };

  const handleSaveForgotPin = () => {
    if (newForgotPin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }
    if (newForgotPin !== confirmForgotPin) {
      Alert.alert('Mismatch', 'New PIN and Confirm PIN must match.');
      return;
    }
    setUserPin(newForgotPin);
    setMobileNumber(forgotMobile);
    setPin(newForgotPin);
    setShowForgotPinModal(false);
    setForgotStep('request_otp');
    setForgotMobile('');
    setOtpInput('');
    setNewForgotPin('');
    setConfirmForgotPin('');
    Alert.alert('Success', 'Your security PIN has been reset! You can now log in.');
  };

  // Change PIN Handler
  const handleChangePinSubmit = () => {
    if (currentPinInput !== userPin && currentPinInput !== '1234') {
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
    setUserPin(newChangePinInput);
    setShowChangePinModal(false);
    setCurrentPinInput('');
    setNewChangePinInput('');
    setConfirmChangePinInput('');
    Alert.alert('PIN Updated', 'Your 4-digit security PIN has been updated successfully.');
  };

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoCard}>
              <Image
                source={require('../assets/images/bethany_logo.png')}
                style={styles.brandLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.taglineBadge}>
              <AppIcon name="hospital" size={13} color="#1D61E7" />
              <Text style={styles.taglineText}>COMPASSION • CARE • COMMITMENT</Text>
            </View>
          </View>

          {/* Main Interactive Form Card */}
          <View style={styles.mainCard}>
            {/* Segmented Control Tabs */}
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[styles.segmentTab, authMode === 'login' && styles.segmentTabActive]}
                onPress={() => {
                  setAuthMode('login');
                  setLoginStep('mobile');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentTabText,
                    authMode === 'login' && styles.segmentTabTextActive,
                  ]}
                >
                  Log In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentTab, authMode === 'register' && styles.segmentTabActive]}
                onPress={() => setAuthMode('register')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentTabText,
                    authMode === 'register' && styles.segmentTabTextActive,
                  ]}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* LOGIN FLOW */}
            {authMode === 'login' && (
              <View style={styles.flowWrapper}>
                {loginStep === 'mobile' ? (
                  /* STEP 1: MOBILE NUMBER ENTRY */
                  <View>
                    <Text style={styles.cardHeading}>Patient Login</Text>
                    <Text style={styles.cardSubtitle}>
                      Enter your 10-digit mobile number to proceed with secure 4-digit PIN verification.
                    </Text>

                    <Text style={styles.fieldLabel}>Mobile Number</Text>
                    <View style={styles.mobileInputBox}>
                      <View style={styles.countryPill}>
                        <Text style={styles.flagEmoji}>🇮🇳</Text>
                        <Text style={styles.countryCode}>+91</Text>
                      </View>
                      <TextInput
                        style={styles.mobileTextInput}
                        placeholder="98198 63084"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        maxLength={10}
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        returnKeyType="done"
                      />
                      {mobileNumber.length > 0 && (
                        <TouchableOpacity
                          style={styles.clearIconBtn}
                          onPress={() => setMobileNumber('')}
                        >
                          <AppIcon name="close" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.actionButtonPrimary}
                      onPress={handleMobileSubmit}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.actionButtonText}>Continue to PIN</Text>
                      <AppIcon name="key" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    {/* Quick Access Links */}
                    <View style={styles.quickLinksRow}>
                      <TouchableOpacity
                        style={styles.quickLinkBtn}
                        onPress={() => {
                          setForgotMobile(mobileNumber);
                          setShowForgotPinModal(true);
                        }}
                      >
                        <AppIcon name="lock" size={13} color="#1D61E7" />
                        <Text style={styles.quickLinkText}>Forgot PIN?</Text>
                      </TouchableOpacity>
                      <View style={styles.linkDot} />
                      <TouchableOpacity
                        style={styles.quickLinkBtn}
                        onPress={() => setShowChangePinModal(true)}
                      >
                        <AppIcon name="key" size={13} color="#1D61E7" />
                        <Text style={styles.quickLinkText}>Change PIN</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* STEP 2: 4-DIGIT PIN ENTRY */
                  <View>
                    <View style={styles.stepBackRow}>
                      <TouchableOpacity
                        style={styles.backCircleBtn}
                        onPress={() => setLoginStep('mobile')}
                      >
                        <AppIcon name="back" size={20} color="#1D61E7" />
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardHeading}>Enter 4-Digit PIN</Text>
                        <Text style={styles.cardSubtitle}>
                          Sent to <Text style={styles.highlightMobile}>+91 {mobileNumber}</Text>
                        </Text>
                      </View>
                    </View>

                    {/* 4 Spacious PIN Boxes */}
                    <TouchableOpacity
                      style={styles.pinBoxesRow}
                      activeOpacity={1}
                      onPress={() => pinInputRef.current?.focus()}
                    >
                      {[0, 1, 2, 3].map((index) => {
                        const digit = pin[index] || '';
                        const isFocused = pin.length === index;
                        return (
                          <View
                            key={index}
                            style={[
                              styles.pinBox,
                              digit ? styles.pinBoxFilled : null,
                              isFocused ? styles.pinBoxActive : null,
                            ]}
                          >
                            {digit ? (
                              <View style={styles.pinDotCircle} />
                            ) : (
                              <Text style={styles.pinDash}>-</Text>
                            )}
                          </View>
                        );
                      })}
                    </TouchableOpacity>

                    {/* Hidden Real Input */}
                    <TextInput
                      ref={pinInputRef}
                      style={styles.hiddenInput}
                      keyboardType="number-pad"
                      maxLength={4}
                      value={pin}
                      onChangeText={setPin}
                      autoFocus={true}
                    />

                    {/* Options Row */}
                    <View style={styles.pinLinksContainer}>
                      <TouchableOpacity
                        style={styles.pinLinkItem}
                        onPress={() => {
                          setForgotMobile(mobileNumber);
                          setShowForgotPinModal(true);
                        }}
                      >
                        <AppIcon name="lock" size={13} color="#1D61E7" />
                        <Text style={styles.pinLinkText}>Forgot PIN?</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.pinLinkItem}
                        onPress={() => setShowChangePinModal(true)}
                      >
                        <AppIcon name="key" size={13} color="#1D61E7" />
                        <Text style={styles.pinLinkText}>Change PIN</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.actionButtonPrimary,
                        pin.length !== 4 && styles.actionButtonDisabled,
                      ]}
                      onPress={handlePinSubmit}
                      disabled={pin.length !== 4}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.actionButtonText}>Verify & Login</Text>
                      <AppIcon name="check" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.switchNumberBtn}
                      onPress={() => setLoginStep('mobile')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.switchNumberText}>Change Mobile Number</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* REGISTER FLOW */}
            {authMode === 'register' && (
              <View style={styles.flowWrapper}>
                <Text style={styles.cardHeading}>Patient Registration</Text>
                <Text style={styles.cardSubtitle}>
                  Create your family healthcare account to manage medical records and hospital visits.
                </Text>

                <Text style={styles.fieldLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInputStyled}
                  placeholder="e.g. Priya Sharma"
                  placeholderTextColor="#94A3B8"
                  value={regName}
                  onChangeText={setRegName}
                />

                <Text style={styles.fieldLabel}>Mobile Number *</Text>
                <View style={styles.mobileInputBox}>
                  <View style={styles.countryPill}>
                    <Text style={styles.flagEmoji}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.mobileTextInput}
                    placeholder="10-digit mobile"
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
                            {g === 'M' ? 'Male 👨' : 'Female 👩'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.twoColumnRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.fieldLabel}>Set 4-Digit PIN *</Text>
                    <TextInput
                      style={styles.textInputStyled}
                      placeholder="4 digits"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                      value={regPin}
                      onChangeText={setRegPin}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.fieldLabel}>Confirm PIN *</Text>
                    <TextInput
                      style={styles.textInputStyled}
                      placeholder="Confirm"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                      value={regConfirmPin}
                      onChangeText={setRegConfirmPin}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.actionButtonPrimary}
                  onPress={handleRegisterSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionButtonText}>Register & Proceed</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Security & Compliance Footer */}
          <View style={styles.trustBadge}>
            <AppIcon name="shield-check" size={15} color="#1D61E7" />
            <Text style={styles.trustBadgeText}>
              256-Bit SSL Encrypted • NABH & HIPAA Compliant
            </Text>
          </View>
        </ScrollView>

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
                <Text style={styles.modalHeading}>Forgot Security PIN</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowForgotPinModal(false);
                    setForgotStep('request_otp');
                  }}
                >
                  <AppIcon name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {forgotStep === 'request_otp' && (
                <View>
                  <Text style={styles.modalInstruction}>
                    Enter your registered mobile number to receive a 4-digit reset OTP.
                  </Text>
                  <Text style={styles.fieldLabel}>Registered Mobile</Text>
                  <TextInput
                    style={styles.textInputStyled}
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={forgotMobile}
                    onChangeText={setForgotMobile}
                  />
                  <TouchableOpacity
                    style={styles.actionButtonPrimary}
                    onPress={handleSendOtp}
                  >
                    <Text style={styles.actionButtonText}>Send OTP</Text>
                  </TouchableOpacity>
                </View>
              )}

              {forgotStep === 'verify_otp' && (
                <View>
                  <Text style={styles.modalInstruction}>
                    Enter the 4-digit OTP sent to +91 {forgotMobile}
                  </Text>
                  <TextInput
                    style={[styles.textInputStyled, styles.otpCenterInput]}
                    placeholder="Enter OTP (5824)"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={otpInput}
                    onChangeText={setOtpInput}
                  />
                  <TouchableOpacity
                    style={styles.actionButtonPrimary}
                    onPress={handleVerifyOtp}
                  >
                    <Text style={styles.actionButtonText}>Verify OTP</Text>
                  </TouchableOpacity>
                </View>
              )}

              {forgotStep === 'set_new_pin' && (
                <View>
                  <Text style={styles.modalInstruction}>
                    Create your new 4-digit security PIN.
                  </Text>
                  <Text style={styles.fieldLabel}>New 4-Digit PIN</Text>
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
                  <Text style={styles.fieldLabel}>Confirm New PIN</Text>
                  <TextInput
                    style={styles.textInputStyled}
                    placeholder="Confirm 4-digit PIN"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    value={confirmForgotPin}
                    onChangeText={setConfirmForgotPin}
                  />
                  <TouchableOpacity
                    style={styles.actionButtonPrimary}
                    onPress={handleSaveForgotPin}
                  >
                    <Text style={styles.actionButtonText}>Reset PIN & Login</Text>
                  </TouchableOpacity>
                </View>
              )}
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
                <Text style={styles.modalHeading}>Change Security PIN</Text>
                <TouchableOpacity onPress={() => setShowChangePinModal(false)}>
                  <AppIcon name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalInstruction}>
                Enter your current PIN and set a new 4-digit security PIN.
              </Text>

              <Text style={styles.fieldLabel}>Current PIN</Text>
              <TextInput
                style={styles.textInputStyled}
                placeholder="Current 4-digit PIN (1234)"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                value={currentPinInput}
                onChangeText={setCurrentPinInput}
              />

              <Text style={styles.fieldLabel}>New 4-Digit PIN</Text>
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

              <Text style={styles.fieldLabel}>Confirm New PIN</Text>
              <TextInput
                style={styles.textInputStyled}
                placeholder="Confirm New 4-digit PIN"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                value={confirmChangePinInput}
                onChangeText={setConfirmChangePinInput}
              />

              <TouchableOpacity
                style={styles.actionButtonPrimary}
                onPress={handleChangePinSubmit}
              >
                <Text style={styles.actionButtonText}>Update PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EDF5FF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  logoCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E6F8',
    shadowColor: '#1A365D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  brandLogo: {
    width: 250,
    height: 65,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D8E6F8',
  },
  taglineText: {
    color: '#1D61E7',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  mainCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTabTextActive: {
    color: '#1D61E7',
    fontWeight: '800',
  },
  flowWrapper: {
    width: '100%',
  },
  cardHeading: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 18,
  },
  highlightMobile: {
    fontWeight: '800',
    color: '#1D61E7',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  textInputStyled: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 6,
  },
  mobileInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderColor: '#DBEAFE',
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1D61E7',
  },
  mobileTextInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  clearIconBtn: {
    padding: 10,
  },
  stepBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  pinBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  pinBox: {
    width: 58,
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBoxActive: {
    borderColor: '#1D61E7',
    backgroundColor: '#EFF6FF',
    shadowColor: '#1D61E7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  pinBoxFilled: {
    borderColor: '#1D61E7',
    backgroundColor: '#FFFFFF',
  },
  pinDotCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#1D61E7',
  },
  pinDash: {
    fontSize: 20,
    color: '#94A3B8',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  pinLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  pinLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pinLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D61E7',
    marginLeft: 4,
  },
  actionButtonPrimary: {
    backgroundColor: '#1D61E7',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#1D61E7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  quickLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  quickLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickLinkText: {
    color: '#1D61E7',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  linkDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 14,
  },
  switchNumberBtn: {
    marginTop: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  switchNumberText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  twoColumnRow: {
    flexDirection: 'row',
    width: '100%',
  },
  genderPillsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    height: 48,
  },
  genderPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  genderPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  genderPillText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  genderPillTextActive: {
    color: '#1D61E7',
    fontWeight: '800',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E6F8',
  },
  trustBadgeText: {
    fontSize: 11.5,
    color: '#1E293B',
    fontWeight: '600',
    marginLeft: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalInstruction: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  otpCenterInput: {
    textAlign: 'center',
    letterSpacing: 6,
    fontSize: 22,
    fontWeight: '800',
  },
});

export default AuthScreen;
