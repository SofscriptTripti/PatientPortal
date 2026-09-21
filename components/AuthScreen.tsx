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
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';
import MobileEntryScreen from './MobileEntryScreen';
import OtpScreen from './OtpScreen';
import UniversalLoader from './UniversalLoader';
import IMAGES from './imageAssets';
import { lightColors } from './ThemeContext';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const GENERATED_YEARS = Array.from({ length: 97 }, (_, i) => 2026 - i);

export interface CountryItem {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const COUNTRY_LIST: CountryItem[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
];

interface AuthScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  // Register & Login pages always use default theme colors
  const isDark = false;
  const colors = lightColors;

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
  const [storedUserName, setStoredUserName] = useState('Rathi Vijay Sharma');

  // Register form fields (Full Name, DOB, Gender, Address, Aadhaar Card, Mobile No, OTP)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regAddress, setRegAddress] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRY_LIST[0]);
  const [showCountryModal, setShowCountryModal] = useState<boolean>(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState<string>('');
  const [regCountryCode, setRegCountryCode] = useState('+91');
  const [regMobile, setRegMobile] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpTimer, setRegOtpTimer] = useState(30);
  const [regConsentChecked, setRegConsentChecked] = useState(false);

  // Calendar Modal State
  const now = new Date();
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [calendarYear, setCalendarYear] = useState<number>(now.getFullYear() - 25);
  const [calendarMonth, setCalendarMonth] = useState<number>(now.getMonth());
  const [calendarDay, setCalendarDay] = useState<number>(now.getDate());
  const [showYearGrid, setShowYearGrid] = useState(false);
  const [showMonthGrid, setShowMonthGrid] = useState(false);

  const openCalendarPicker = () => {
    let parsed = false;
    if (regDob && regDob.length === 10) {
      const parts = regDob.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        const currentYr = new Date().getFullYear();
        if (!isNaN(d) && !isNaN(m) && m >= 0 && m < 12 && !isNaN(y) && y > 1900 && y <= currentYr) {
          setCalendarDay(d);
          setCalendarMonth(m);
          setCalendarYear(y);
          parsed = true;
        }
      }
    }
    if (!parsed) {
      const currentDate = new Date();
      setCalendarDay(currentDate.getDate());
      setCalendarMonth(currentDate.getMonth());
      setCalendarYear(currentDate.getFullYear() - 25);
    }
    setShowYearGrid(false);
    setShowMonthGrid(false);
    setShowDatePickerModal(true);
  };

  const handleConfirmCalendarDate = () => {
    const dStr = calendarDay.toString().padStart(2, '0');
    const mStr = (calendarMonth + 1).toString().padStart(2, '0');
    const formatted = `${dStr}/${mStr}/${calendarYear}`;
    setRegDob(formatted);
    setShowDatePickerModal(false);
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

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

  // Reset / Clear Registration Form Fields
  const resetRegisterForm = () => {
    setRegName('');
    setRegEmail('');
    setRegDob('');
    setRegGender('Male');
    setRegAddress('');
    setRegAadhaar('');
    setSelectedCountry(COUNTRY_LIST[0]);
    setRegCountryCode(COUNTRY_LIST[0].dialCode);
    setRegMobile('');
    setRegOtp('');
    setRegOtpSent(false);
    setRegOtpTimer(30);
    setRegConsentChecked(false);
  };

  // Automatically reset form fields whenever navigating into or out of register screen
  useEffect(() => {
    if (authMode === 'register') {
      resetRegisterForm();
    }
  }, [authMode]);

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

  // Countdown timer for Registration OTP
  useEffect(() => {
    let interval: any;
    if (authMode === 'register' && regOtpSent && regOtpTimer > 0) {
      interval = setInterval(() => {
        setRegOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authMode, regOtpSent, regOtpTimer]);

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

  // Hardware device back press handler for active modals & multi-step login/register
  useEffect(() => {
    const onBackPress = () => {
      if (showCountryModal) {
        setShowCountryModal(false);
        return true;
      }
      if (showDatePickerModal) {
        setShowDatePickerModal(false);
        return true;
      }
      if (showOtpModal) {
        setShowOtpModal(false);
        return true;
      }
      if (showForgotPinModal) {
        setShowForgotPinModal(false);
        return true;
      }
      if (showChangePinModal) {
        setShowChangePinModal(false);
        return true;
      }
      if (showHelpModal) {
        setShowHelpModal(false);
        return true;
      }
      if (loginStep === 'pin') {
        setLoginStep('mobile');
        return true;
      }
      if (authMode === 'register') {
        resetRegisterForm();
        setAuthMode('login');
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [showOtpModal, showForgotPinModal, showChangePinModal, showHelpModal, loginStep, authMode]);

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

  // Registration input formatters & actions
  const handleDobChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    setRegDob(formatted);
  };

  const handleAadhaarChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 12);
    let formatted = cleaned;
    if (cleaned.length > 4 && cleaned.length <= 8) {
      formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    } else if (cleaned.length > 8) {
      formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`;
    }
    setRegAadhaar(formatted);
  };

  const handleSendRegOtp = () => {
    const cleaned = regMobile.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number first.');
      return;
    }
    setRegOtpSent(true);
    setRegOtpTimer(30);
    setRegOtp('1234');
    Alert.alert(
      'OTP Sent',
      `A 4-digit verification code has been sent to ${regCountryCode || '+91'} ${cleaned}.\n\nDemo OTP: 1234`
    );
  };

  // Register Submit (Full Name, DOB, Gender, Address, Aadhaar, Mobile, OTP)
  const handleRegisterSubmit = () => {
    if (!regName.trim()) {
      Alert.alert('Full Name Required', 'Please enter your full name.');
      return;
    }
    if (!regDob.trim() || regDob.length < 8) {
      Alert.alert('Date of Birth Required', 'Please enter your Date of Birth (DD/MM/YYYY).');
      return;
    }
    if (!regAddress.trim()) {
      Alert.alert('Address Required', 'Please enter your residential address.');
      return;
    }
    const cleanAadhaar = regAadhaar.replace(/\s/g, '');
    if (cleanAadhaar.length !== 12) {
      Alert.alert('Aadhaar Required', 'Please enter a valid 12-digit Aadhaar Card number.');
      return;
    }
    const cleanMobile = regMobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      Alert.alert('Mobile Number Required', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    const cleanOtp = regOtp.trim().replace(/[^0-9]/g, '');
    if (!cleanOtp || cleanOtp.length < 4) {
      Alert.alert('OTP Required', 'Please enter the 4-digit verification OTP (e.g. 1234).');
      return;
    }
    if (!regConsentChecked) {
      Alert.alert(
        'Consent Required',
        'Please tick the checkbox to confirm that you want to share your details with "Patient Portal" app before proceeding.'
      );
      return;
    }

    setLoaderState({
      visible: true,
      message: 'Creating Health Account...',
      subtitle: `Registering ${regName.trim()} with UHID UHID-UD-${Math.floor(100000 + Math.random() * 900000)}`,
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      const registeredName = regName.trim();
      resetRegisterForm();
      setMobileNumber('');
      setAuthMode('login');
      Alert.alert(
        'Registration Successful! 🎉',
        `Health account for ${registeredName} has been registered successfully.`
      );
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
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
          {/* TOP HEADER BAR: Centered Blue title, Curvy bottom corners, back button */}
          <View
            style={[
              styles.headerBar,
              {
                paddingHorizontal: isTablet ? 20 : 16,
                paddingTop: isTablet ? 14 : 10,
                paddingBottom: isTablet ? 14 : 12,
              },
            ]}
          >
            <View style={[styles.headerSideGroup, isTablet && { width: 44 }]}>
              <TouchableOpacity
                onPress={() => {
                  resetRegisterForm();
                  setAuthMode('login');
                }}
                style={[styles.headerBackBtn, { backgroundColor: isDark ? colors.surface : '#F1F5F9' }, isTablet && { width: 42, height: 42, borderRadius: 21 }]}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon name="back" size={isTablet ? 24 : 20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.headerCenterGroup}>
              <Text style={[styles.headerTitleCentered, { color: colors.primary }, isTablet && { fontSize: 24 }]}>
                Patient Registration
              </Text>
            </View>

            <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
          >
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingBottom: Math.max(insets.bottom, 20),
                },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View style={styles.screenOuter}>
                <View style={styles.pinStepCard}>
                  {/* 1. Full Name */}
                  <Text style={[styles.fieldLabel, { color: colors.textPrimary, marginTop: 2 }]}>Full Name *</Text>
                  <View style={[styles.regInputWithIcon, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                    <View style={styles.fieldIconBox}>
                      <AppIcon name="user" size={18} color={colors.primary} />
                    </View>
                    <TextInput
                      style={[styles.regTextInput, { color: colors.textPrimary }]}
                      placeholder="e.g. Aarav Chouhan"
                      placeholderTextColor={colors.textSecondary || '#94A3B8'}
                      value={regName}
                      onChangeText={setRegName}
                    />
                  </View>

                  {/* Email ID (Optional) */}
                  <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                    Email ID <Text style={{ fontSize: 12, color: colors.textSecondary || '#94A3B8', fontWeight: '400' }}>(Optional)</Text>
                  </Text>
                  <View style={[styles.regInputWithIcon, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                    <View style={styles.fieldIconBox}>
                      <AppIcon name="email" size={18} color={colors.primary} />
                    </View>
                    <TextInput
                      style={[styles.regTextInput, { color: colors.textPrimary }]}
                      placeholder="e.g. aarav@example.com"
                      placeholderTextColor={colors.textSecondary || '#94A3B8'}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={regEmail}
                      onChangeText={setRegEmail}
                    />
                  </View>

                  {/* 2 & 3. DOB and Gender side by side */}
                  <View style={styles.twoColumnRow}>
                    <View style={{ flex: 1.1, marginRight: 8 }}>
                      <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Date of Birth (DOB) *</Text>
                      <View style={[styles.regInputWithIcon, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0', paddingLeft: 12 }]}>
                        <TextInput
                          style={[styles.regTextInput, { color: colors.textPrimary }]}
                          placeholder="DD / MM / YYYY"
                          placeholderTextColor={colors.textSecondary || '#94A3B8'}
                          keyboardType="number-pad"
                          maxLength={10}
                          value={regDob}
                          onChangeText={handleDobChange}
                        />
                        <TouchableOpacity
                          onPress={openCalendarPicker}
                          activeOpacity={0.7}
                          style={{ paddingHorizontal: 10, paddingVertical: 8 }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <AppIcon name="calendar" size={18} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={{ flex: 0.9, marginLeft: 8 }}>
                      <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Gender *</Text>
                      <View style={[styles.genderPillsContainer, { borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                        {(['Male', 'Female', 'Other'] as const).map((g) => (
                          <TouchableOpacity
                            key={g}
                            style={[
                              styles.genderPill,
                              { backgroundColor: colors.surface },
                              regGender === g && [styles.genderPillActive, { backgroundColor: colors.primary }],
                            ]}
                            onPress={() => setRegGender(g)}
                          >
                            <Text
                              style={[
                                styles.genderPillText,
                                { color: colors.textSecondary },
                                regGender === g && styles.genderPillTextActive,
                              ]}
                            >
                              {g === 'Other' ? 'Other' : g[0]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* 4. Residential Address */}
                  <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Residential Address *</Text>
                  <View style={[styles.regInputWithIcon, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0', height: 72, alignItems: 'flex-start', paddingTop: 10 }]}>
                    <View style={[styles.fieldIconBox, { marginTop: 2 }]}>
                      <AppIcon name="location" size={18} color={colors.primary} />
                    </View>
                    <TextInput
                      style={[styles.regTextInput, { color: colors.textPrimary, height: 56, textAlignVertical: 'top' }]}
                      placeholder="House/Flat No., Street, City, Pincode"
                      placeholderTextColor={colors.textSecondary || '#94A3B8'}
                      multiline
                      value={regAddress}
                      onChangeText={setRegAddress}
                    />
                  </View>

                  {/* 5. Aadhaar Card */}
                  <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Aadhaar Card Number *</Text>
                  <View style={[styles.regInputWithIcon, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                    <View style={styles.fieldIconBox}>
                      <AppIcon name="card" size={18} color={colors.primary} />
                    </View>
                    <TextInput
                      style={[styles.regTextInput, { color: colors.textPrimary }]}
                      placeholder="XXXX XXXX XXXX (12-digit UIDAI)"
                      placeholderTextColor={colors.textSecondary || '#94A3B8'}
                      keyboardType="number-pad"
                      maxLength={14}
                      value={regAadhaar}
                      onChangeText={handleAadhaarChange}
                    />
                  </View>

                  {/* 6. Mobile Number */}
                  <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Mobile Number *</Text>
                  <View style={[styles.regInputWithIcon, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                    <TouchableOpacity
                      style={styles.flagContainerDropdown}
                      onPress={() => {
                        setCountrySearchQuery('');
                        setShowCountryModal(true);
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={{ fontSize: 16 }}>{selectedCountry.flag}</Text>
                      <Text style={[styles.countryCodeText, { color: colors.textPrimary, marginLeft: 4 }]}>{selectedCountry.dialCode}</Text>
                      <AppIcon name="chevron-down" size={13} color={colors.primary} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                    <View style={styles.inputDivider} />
                    <TextInput
                      style={[styles.regTextInput, { color: colors.textPrimary }]}
                      placeholder="10-digit mobile number"
                      placeholderTextColor={colors.textSecondary || '#94A3B8'}
                      keyboardType="number-pad"
                      maxLength={10}
                      value={regMobile}
                      onChangeText={(t) => setRegMobile(t.replace(/[^0-9]/g, '').slice(0, 10))}
                    />
                    <TouchableOpacity
                      style={[
                        styles.inlineSendOtpBtn,
                        { backgroundColor: colors.primary },
                        regOtpSent && regOtpTimer > 0 && { backgroundColor: isDark ? colors.surface : '#F1F5F9' },
                      ]}
                      onPress={handleSendRegOtp}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.inlineSendOtpText,
                          regOtpSent && regOtpTimer > 0 && { color: colors.textSecondary },
                        ]}
                      >
                        {regOtpSent
                          ? regOtpTimer > 0
                            ? `${regOtpTimer}s`
                            : 'Resend'
                          : 'Get OTP'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 7. OTP Verification */}
                  <View style={styles.labelWithBadgeRow}>
                    <Text style={[styles.fieldLabel, { color: colors.textPrimary, marginTop: 0, marginBottom: 0 }]}>Enter OTP *</Text>
                  </View>
                  <View style={[styles.regInputWithIcon, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0', marginTop: 6 }]}>
                    <View style={styles.fieldIconBox}>
                      <AppIcon name="key" size={18} color={colors.primary} />
                    </View>
                    <TextInput
                      style={[styles.regTextInput, { color: colors.textPrimary }]}
                      placeholder="Enter 4-digit verification code"
                      placeholderTextColor={colors.textSecondary || '#94A3B8'}
                      keyboardType="number-pad"
                      maxLength={4}
                      value={regOtp}
                      onChangeText={(t) => setRegOtp(t.replace(/[^0-9]/g, '').slice(0, 4))}
                    />
                    {regOtp.length === 4 && (
                      <View style={styles.verifiedCheckBadge}>
                        <AppIcon name="check" size={16} color="#059669" />
                      </View>
                    )}
                  </View>

                  {/* 8. Concern / Consent Checkbox */}
                  <TouchableOpacity
                    style={[
                      styles.consentBoxContainer,
                      { backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: isDark ? colors.border : '#E2E8F0' },
                      regConsentChecked && [styles.consentBoxContainerChecked, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setRegConsentChecked((prev) => !prev)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <View
                      pointerEvents="none"
                      style={[
                        styles.consentCheckbox,
                        regConsentChecked && [styles.consentCheckboxChecked, { backgroundColor: colors.primary, borderColor: colors.primary }],
                      ]}
                    >
                      {regConsentChecked && (
                        <AppIcon name="check" size={13} color="#FFFFFF" />
                      )}
                    </View>
                    <Text pointerEvents="none" style={[styles.consentText, { color: colors.textSecondary }]}>
                      Are you sure you want to share your details with{' '}
                      <Text style={[styles.consentAppName, { color: colors.primary }]}>
                        "Patient Portal"{' '}
                        <AppIcon name="hospital" size={14} color={colors.primary} />
                      </Text>{' '}
                      app?
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sendOtpBtnWrapper,
                      { marginTop: 18 },
                      !regConsentChecked && { opacity: 0.6 },
                    ]}
                    onPress={handleRegisterSubmit}
                    activeOpacity={0.88}
                  >
                    <ImageBackground
                      source={IMAGES.btnGradientBg}
                      fadeDuration={0}
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
                    onPress={() => {
                      resetRegisterForm();
                      setAuthMode('login');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.switchNumberText}>Already registered? Log In</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bottomWaveContainer}>
                  <Image
                    source={IMAGES.waveFooterBg}
                    fadeDuration={0}
                    style={[styles.bottomWaveImage, isTablet && { height: 310 }]}
                    resizeMode="stretch"
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}

      {/* COUNTRY SELECTOR DROPDOWN MODAL */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <TouchableOpacity
          style={styles.calModalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryModal(false)}
        >
          <View
            style={[styles.calModalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onStartShouldSetResponder={() => true}
          >
            {/* Modal Header */}
            <View style={styles.calHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.calHeaderIconWrap, { backgroundColor: colors.primaryLight }]}>
                  <Text style={{ fontSize: 18 }}>🌍</Text>
                </View>
                <Text style={[styles.calHeaderTitle, { color: colors.textPrimary }]}>Select Country Code</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCountryModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search Input Box */}
            <View style={[styles.countrySearchBox, { backgroundColor: isDark ? colors.surfaceVariant : '#F1F5F9', borderColor: colors.border }]}>
              <AppIcon name="search" size={16} color={colors.textSecondary} />
              <TextInput
                style={[styles.countrySearchInput, { color: colors.textPrimary }]}
                placeholder="Search country or code..."
                placeholderTextColor={colors.textSecondary || '#94A3B8'}
                value={countrySearchQuery}
                onChangeText={setCountrySearchQuery}
              />
            </View>

            {/* Country List ScrollView */}
            <ScrollView style={{ maxHeight: 280, marginTop: 8 }} showsVerticalScrollIndicator={true}>
              {COUNTRY_LIST.filter(
                (c) =>
                  c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                  c.dialCode.includes(countrySearchQuery)
              ).map((country) => {
                const isSelected = selectedCountry.code === country.code;
                return (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryItemRow,
                      { borderColor: colors.border },
                      isSelected && { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF' },
                    ]}
                    onPress={() => {
                      setSelectedCountry(country);
                      setRegCountryCode(country.dialCode);
                      setShowCountryModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 20, marginRight: 10 }}>{country.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.countryNameText, { color: colors.textPrimary }]}>{country.name}</Text>
                    </View>
                    <Text style={[styles.countryDialCodeText, { color: colors.primary }]}>{country.dialCode}</Text>
                    {isSelected && (
                      <AppIcon name="check" size={16} color={colors.primary} style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CALENDAR PICKER MODAL */}
      <Modal
        visible={showDatePickerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <View style={styles.calModalOverlay}>
          <View style={[styles.calModalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Modal Header */}
            <View style={styles.calHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.calHeaderIconWrap, { backgroundColor: colors.primaryLight }]}>
                  <AppIcon name="calendar" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.calHeaderTitle, { color: colors.textPrimary }]}>Select Date of Birth</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDatePickerModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Month & Year Navigation Bar */}
            <View style={styles.calNavRow}>
              <TouchableOpacity
                style={[styles.calNavArrowBtn, { backgroundColor: colors.primaryLight }]}
                onPress={handlePrevMonth}
                activeOpacity={0.7}
              >
                <AppIcon name="back" size={18} color={colors.primary} />
              </TouchableOpacity>

              {/* Month Selector Pill */}
              <TouchableOpacity
                style={[styles.calSelectPill, { backgroundColor: colors.primaryLight }, showMonthGrid && { backgroundColor: colors.primary }]}
                onPress={() => {
                  setShowMonthGrid((prev) => !prev);
                  setShowYearGrid(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.calSelectPillText, { color: colors.primary }, showMonthGrid && { color: '#FFFFFF' }]}>
                  {MONTH_NAMES[calendarMonth]}
                </Text>
                <AppIcon name="chevron-down" size={13} color={showMonthGrid ? '#FFFFFF' : colors.primary} />
              </TouchableOpacity>

              {/* Year Selector Pill */}
              <TouchableOpacity
                style={[styles.calSelectPill, { backgroundColor: colors.primaryLight }, showYearGrid && { backgroundColor: colors.primary }]}
                onPress={() => {
                  setShowYearGrid((prev) => !prev);
                  setShowMonthGrid(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.calSelectPillText, { color: colors.primary }, showYearGrid && { color: '#FFFFFF' }]}>
                  {calendarYear}
                </Text>
                <AppIcon name="chevron-down" size={13} color={showYearGrid ? '#FFFFFF' : colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.calNavArrowBtn, { backgroundColor: colors.primaryLight }]}
                onPress={handleNextMonth}
                activeOpacity={0.7}
              >
                <AppIcon name="chevron-right" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* BODY CONTENT: Year Grid, Month Grid, or Days Grid */}
            {showYearGrid ? (
              /* YEAR SELECTION GRID */
              <View style={styles.calGridContainer}>
                <Text style={[styles.calGridHintText, { color: colors.textSecondary }]}>Tap to select Birth Year:</Text>
                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={true}>
                  <View style={styles.yearGridWrap}>
                    {GENERATED_YEARS.map((y) => {
                      const isSelected = y === calendarYear;
                      return (
                        <TouchableOpacity
                          key={y}
                          style={[
                            styles.yearGridItem,
                            { backgroundColor: isDark ? colors.surfaceVariant : '#F1F5F9' },
                            isSelected && [styles.yearGridItemActive, { backgroundColor: colors.primary }],
                          ]}
                          onPress={() => {
                            setCalendarYear(y);
                            setShowYearGrid(false);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.yearGridItemText,
                              { color: colors.textPrimary },
                              isSelected && styles.yearGridItemTextActive,
                            ]}
                          >
                            {y}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            ) : showMonthGrid ? (
              /* MONTH SELECTION GRID */
              <View style={styles.calGridContainer}>
                <Text style={[styles.calGridHintText, { color: colors.textSecondary }]}>Tap to select Month:</Text>
                <View style={styles.monthGridWrap}>
                  {MONTH_NAMES.map((mName, idx) => {
                    const isSelected = idx === calendarMonth;
                    return (
                      <TouchableOpacity
                        key={mName}
                        style={[
                          styles.monthGridItem,
                          { backgroundColor: isDark ? colors.surfaceVariant : '#F1F5F9' },
                          isSelected && [styles.monthGridItemActive, { backgroundColor: colors.primary }],
                        ]}
                        onPress={() => {
                          setCalendarMonth(idx);
                          setShowMonthGrid(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.monthGridItemText,
                            { color: colors.textPrimary },
                            isSelected && styles.monthGridItemTextActive,
                          ]}
                        >
                          {mName.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              /* DAYS GRID */
              <View style={styles.calDaysContainer}>
                {/* Day Names Row */}
                <View style={styles.calDayNamesRow}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((dName) => (
                    <Text key={dName} style={[styles.calDayNameText, { color: colors.textSecondary }]}>
                      {dName}
                    </Text>
                  ))}
                </View>

                {/* Days Numbers Matrix */}
                <View style={styles.calDaysMatrix}>
                  {/* Blank leading slots */}
                  {Array.from({ length: getFirstDayOfWeek(calendarYear, calendarMonth) }).map((_, i) => (
                    <View key={`blank-${i}`} style={styles.calDayCellEmpty} />
                  ))}

                  {/* Days 1 to N */}
                  {Array.from({ length: getDaysInMonth(calendarYear, calendarMonth) }).map((_, i) => {
                    const dayNum = i + 1;
                    const isSelected = dayNum === calendarDay;
                    return (
                      <TouchableOpacity
                        key={`day-${dayNum}`}
                        style={[
                          styles.calDayCell,
                          { backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC' },
                          isSelected && [styles.calDayCellActive, { backgroundColor: colors.primary, shadowColor: colors.primary }],
                        ]}
                        onPress={() => setCalendarDay(dayNum)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.calDayCellText,
                            { color: colors.textPrimary },
                            isSelected && styles.calDayCellTextActive,
                          ]}
                        >
                          {dayNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Selected Preview & Action Footer */}
            <View style={[styles.calFooterRow, { borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={[styles.calConfirmBtn, { backgroundColor: colors.primary }]}
                onPress={handleConfirmCalendarDate}
                activeOpacity={0.85}
              >
                <AppIcon name="check" size={15} color="#FFFFFF" />
                <Text style={styles.calConfirmBtnText}>Set DOB</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              <View style={[styles.helpIconCircle, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="phone" size={20} color={colors.primary} />
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
                source={IMAGES.btnGradientBg}
                fadeDuration={0}
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
                source={IMAGES.btnGradientBg}
                fadeDuration={0}
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

  // TOP HEADER BAR (Consistent with other screens)
  headerBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  headerSideGroup: {
    width: 38,
    justifyContent: 'center',
  },
  headerCenterGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCentered: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0083B0',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
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
  regInputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#FFFFFF',
  },
  fieldIconBox: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  regTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0B2341',
    paddingVertical: 0,
  },
  inlineSendOtpBtn: {
    backgroundColor: '#0083B0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  inlineSendOtpText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  labelWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 6,
  },
  demoBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  demoBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0369A1',
  },
  verifiedCheckBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  consentBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  consentBoxContainerChecked: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  consentCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  consentCheckboxChecked: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 18,
  },
  consentAppName: {
    fontWeight: '700',
    color: '#0083B0',
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
    backgroundColor: '#0083B0',
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
    color: '#0083B0',
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
  countryCodeInput: {
    fontSize: 15.5,
    fontWeight: '700',
    minWidth: 42,
    paddingVertical: 0,
    paddingHorizontal: 2,
  },
  // CALENDAR MODAL STYLES
  calModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  calModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 18,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  calHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  calHeaderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  calHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  calNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
    paddingHorizontal: 4,
  },
  calNavArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF0FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  calSelectPillText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0083B0',
  },
  calGridContainer: {
    paddingVertical: 10,
  },
  calGridHintText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  yearGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  yearGridItem: {
    width: '23%',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearGridItemActive: {
    backgroundColor: '#0083B0',
  },
  yearGridItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  yearGridItemTextActive: {
    color: '#FFFFFF',
  },
  monthGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  monthGridItem: {
    width: '31%',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGridItemActive: {
    backgroundColor: '#0083B0',
  },
  monthGridItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  monthGridItemTextActive: {
    color: '#FFFFFF',
  },
  calDaysContainer: {
    paddingVertical: 6,
  },
  calDayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calDayNameText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  calDaysMatrix: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  calDayCellEmpty: {
    width: '14.28%',
    height: 36,
  },
  calDayCell: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  calDayCellActive: {
    backgroundColor: '#0083B0',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  calDayCellText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calDayCellTextActive: {
    color: '#FFFFFF',
  },
  calFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  calConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0083B0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  calConfirmBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resendActionLink: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0284C7',
    textDecorationLine: 'underline',
  },
  flagContainerDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  countrySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 12,
    marginBottom: 4,
  },
  countrySearchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
    marginLeft: 8,
    paddingVertical: 0,
  },
  countryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderBottomWidth: 0.5,
  },
  countryNameText: {
    fontSize: 14,
    fontWeight: '600',
  },
  countryDialCodeText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
});

export default AuthScreen;
