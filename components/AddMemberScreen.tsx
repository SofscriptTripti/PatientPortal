import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Alert,
  useWindowDimensions,
  BackHandler,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession, PatientMember } from './types';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';

interface AddMemberScreenProps {
  userSession: UserSession;
  onBack: () => void;
  onMemberAdded: (member: PatientMember) => void;
}

const RELATIONS_LIST = [
  'Wife',
  'Husband',
  'Son',
  'Daughter',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Other',
];

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

export const AddMemberScreen: React.FC<AddMemberScreenProps> = ({
  userSession,
  onBack,
  onMemberAdded,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { isDark, colors } = useTheme();

  const scrollViewRef = React.useRef<any>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'Other' | ''>('');
  const [relation, setRelation] = useState<string>('');
  const [customRelation, setCustomRelation] = useState('');
  const [dob, setDob] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');

  // Validation Errors state
  const [errors, setErrors] = useState<{
    fullName?: string;
    contactNo?: string;
    gender?: string;
    relation?: string;
    customRelation?: string;
    dob?: string;
    aadhaarNo?: string;
    addressLine1?: string;
  }>({});

  const clearError = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Loader state
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    message?: string;
    subtitle?: string;
  }>({ visible: false });

  // Calendar Modal State
  const now = new Date();
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [calendarYear, setCalendarYear] = useState<number>(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(now.getMonth()); // 0-indexed
  const [calendarDay, setCalendarDay] = useState<number>(now.getDate());
  const [showYearGrid, setShowYearGrid] = useState(false);
  const [showMonthGrid, setShowMonthGrid] = useState(false);

  const openCalendarPicker = () => {
    let parsed = false;
    if (dob && dob.length === 10) {
      const parts = dob.split('/');
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
      setCalendarYear(currentDate.getFullYear());
    }

    setShowYearGrid(false);
    setShowMonthGrid(false);
    setShowDatePickerModal(true);
  };

  const handleConfirmCalendarDate = () => {
    const dStr = calendarDay.toString().padStart(2, '0');
    const mStr = (calendarMonth + 1).toString().padStart(2, '0');
    const formatted = `${dStr}/${mStr}/${calendarYear}`;
    setDob(formatted);
    clearError('dob');
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

  // Format Aadhaar automatically into 4-digit chunks: XXXX XXXX XXXX
  const handleAadhaarChange = (text: string) => {
    clearError('aadhaarNo');
    const raw = text.replace(/\D/g, '').slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadhaarNo(formatted);
  };

  // Format DOB automatically into DD/MM/YYYY
  const handleDobChange = (text: string) => {
    clearError('dob');
    const raw = text.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;
    if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setDob(formatted);
  };

  // Compute calculated age preview from DOB
  const getCalculatedAge = () => {
    if (!dob || dob.length < 10) return null;
    const parts = dob.split('/');
    if (parts.length === 3) {
      const year = parseInt(parts[2], 10);
      const currentYear = new Date().getFullYear();
      if (year > 1900 && year <= currentYear) {
        const calculated = currentYear - year;
        return `${calculated} Y`;
      }
    }
    return null;
  };

  const calculatedAge = getCalculatedAge();

  const handleSaveMember = () => {
    const cleanContact = contactNo.trim();
    const cleanAadhaar = aadhaarNo.replace(/\s/g, '');

    // 1. Full Name (One-by-one check)
    if (!fullName.trim()) {
      setErrors({ fullName: 'Full Name is required.' });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // 2. Contact Number (One-by-one check)
    if (!cleanContact) {
      setErrors({ contactNo: 'Contact Number is required.' });
      scrollViewRef.current?.scrollTo({ y: 110, animated: true });
      return;
    } else if (cleanContact.length < 10) {
      setErrors({ contactNo: 'Please enter a valid 10-digit mobile number.' });
      scrollViewRef.current?.scrollTo({ y: 110, animated: true });
      return;
    }

    // 3. Gender (One-by-one check)
    if (!gender) {
      setErrors({ gender: 'Please select a gender option.' });
      scrollViewRef.current?.scrollTo({ y: 210, animated: true });
      return;
    }

    // 4. Relation (One-by-one check)
    if (!relation) {
      setErrors({ relation: 'Please select a relation option.' });
      scrollViewRef.current?.scrollTo({ y: 310, animated: true });
      return;
    } else if (relation === 'Other' && !customRelation.trim()) {
      setErrors({ customRelation: 'Please specify the custom relation.' });
      scrollViewRef.current?.scrollTo({ y: 310, animated: true });
      return;
    }

    // 5. Date of Birth (DOB) - Mandatory
    if (!dob.trim()) {
      setErrors({ dob: 'Date of Birth (DOB) is required.' });
      scrollViewRef.current?.scrollTo({ y: 440, animated: true });
      return;
    } else if (dob.trim().length < 10) {
      setErrors({ dob: 'Please enter full DOB in DD/MM/YYYY format.' });
      scrollViewRef.current?.scrollTo({ y: 440, animated: true });
      return;
    }

    // 6. Aadhaar Number - Mandatory
    if (!cleanAadhaar) {
      setErrors({ aadhaarNo: 'Aadhaar Number is required.' });
      scrollViewRef.current?.scrollTo({ y: 540, animated: true });
      return;
    } else if (cleanAadhaar.length < 12) {
      setErrors({ aadhaarNo: 'Aadhaar number must be 12 digits.' });
      scrollViewRef.current?.scrollTo({ y: 540, animated: true });
      return;
    }

    // 7. Address Line 1 - Mandatory
    if (!addressLine1.trim()) {
      setErrors({ addressLine1: 'Address Line 1 is required.' });
      scrollViewRef.current?.scrollTo({ y: 640, animated: true });
      return;
    }

    setErrors({});

    setLoaderState({
      visible: true,
      message: 'Linking Family Member...',
      subtitle: `Creating UHID record for ${fullName.trim()}`,
    });

    setTimeout(() => {
      const fullAddress = [addressLine1.trim(), addressLine2.trim()].filter(Boolean).join(', ');
      const finalRelation = relation === 'Other' ? (customRelation.trim() || 'Other') : relation;
      const validGender: 'M' | 'F' | 'Other' = gender || 'M';

      const newMember: PatientMember = {
        id: `pat-${Date.now()}`,
        name: fullName.trim(),
        relation: finalRelation,
        sex: validGender,
        age: calculatedAge || '26 Y',
        maritalStatus: relation === 'Wife' || relation === 'Husband' ? 'Married' : '',
        registrationStatus: 'Registered',
        mobileNumber: cleanContact,
        patientNumber: `10928${Math.floor(1000 + Math.random() * 9000)}`,
        genderType: validGender === 'F' ? 'F' : 'M',
        dob: dob.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        address: fullAddress,
        aadhaarNo: aadhaarNo.trim(),
        dateAdded: 'Today',
      };

      setLoaderState({ visible: false });
      onMemberAdded(newMember);
    }, 700);
  };

  React.useEffect(() => {
    const onBackPress = () => {
      onBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [onBack]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        {/* AMBIENT BACKGROUND LAYER */}
        <View style={styles.ambientBgContainer} pointerEvents="none">
          <View style={[styles.ambientTopGlow, isDark && { backgroundColor: '#1E3A5F', opacity: 0.3 }]} />
          <View style={[styles.ambientMidGlow, isDark && { backgroundColor: '#162032', opacity: 0.2 }]} />
          <Image
            source={IMAGES.leavesWaveBg}
            fadeDuration={0}
            style={[styles.ambientWaveImage, isDark && { opacity: 0.07 }]}
            resizeMode="cover"
          />
        </View>

        {/* TOP HEADER BAR */}
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
              style={[styles.headerBackBtn, isTablet && { width: 42, height: 42, borderRadius: 21 }]}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="back" size={isTablet ? 24 : 20} color="#0083B0" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, isTablet && { fontSize: 22 }]}>
              Add Family Member
            </Text>
          </View>

          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
        </View>

        {/* MAIN FORM SCROLL AREA */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.mainScrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isTablet ? 20 : 16,
              paddingTop: isTablet ? 16 : 14,
              paddingBottom: 120,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* FORM CARD CONTAINER */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* 1. FULL NAME */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Full Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: errors.fullName ? '#FEF2F2' : (isDark ? colors.surfaceVariant : '#F8FAFC') },
                  { borderColor: errors.fullName ? '#EF4444' : colors.border },
                  errors.fullName ? { borderWidth: 1.8 } : undefined,
                ]}
              >
                <AppIcon name="user" size={18} color={errors.fullName ? '#EF4444' : '#0083B0'} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Enter full name as per Govt. ID"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    clearError('fullName');
                  }}
                />
              </View>
              {errors.fullName ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.fullName}</Text>
                </View>
              ) : null}
            </View>

            {/* 2. CONTACT NUMBER */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Contact No. <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: errors.contactNo ? '#FEF2F2' : (isDark ? colors.surfaceVariant : '#F8FAFC') },
                  { borderColor: errors.contactNo ? '#EF4444' : colors.border },
                  errors.contactNo ? { borderWidth: 1.8 } : undefined,
                ]}
              >
                <View style={styles.countryPrefixBadge}>
                  <Text style={styles.countryPrefixText}>+91</Text>
                </View>
                <AppIcon name="phone" size={18} color={errors.contactNo ? '#EF4444' : '#0083B0'} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={contactNo}
                  onChangeText={(text) => {
                    setContactNo(text);
                    clearError('contactNo');
                  }}
                />
              </View>
              {errors.contactNo ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.contactNo}</Text>
                </View>
              ) : null}
            </View>

            {/* 3. GENDER SELECTION */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Gender <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.genderBoxWrap,
                  errors.gender ? { borderColor: '#EF4444', borderWidth: 1.8, borderRadius: 16, padding: 4, backgroundColor: '#FEF2F2' } : undefined,
                ]}
              >
                <View style={styles.genderPillRow}>
                  {(
                    [
                      { id: 'M', label: 'Male' },
                      { id: 'F', label: 'Female' },
                      { id: 'Other', label: 'Other' },
                    ] as const
                  ).map((item) => {
                    const isSelected = gender === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.genderPill,
                          isSelected
                            ? styles.genderPillActive
                            : { backgroundColor: isDark ? colors.surfaceVariant : '#F1F5F9', borderColor: colors.border },
                        ]}
                        onPress={() => {
                          setGender(item.id);
                          clearError('gender');
                        }}
                        activeOpacity={0.8}
                      >
                        <AppIcon
                          name="user"
                          size={15}
                          color={isSelected ? '#FFFFFF' : colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.genderPillText,
                            isSelected ? styles.genderPillTextActive : { color: colors.textSecondary },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              {errors.gender ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.gender}</Text>
                </View>
              ) : null}
            </View>

            {/* 4. RELATION */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Relation <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.relationBoxWrap,
                  (errors.relation || errors.customRelation) ? { borderColor: '#EF4444', borderWidth: 1.8, borderRadius: 16, padding: 4, backgroundColor: '#FEF2F2' } : undefined,
                ]}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relationChipScroll}
                >
                  {RELATIONS_LIST.map((relItem) => {
                    const isSelected = relation === relItem;
                    return (
                      <TouchableOpacity
                        key={relItem}
                        style={[
                          styles.relationChip,
                          isSelected
                            ? styles.relationChipActive
                            : { backgroundColor: isDark ? colors.surfaceVariant : '#F1F5F9', borderColor: colors.border },
                        ]}
                        onPress={() => {
                          setRelation(relItem);
                          clearError('relation');
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.relationChipText,
                            isSelected ? styles.relationChipTextActive : { color: colors.textSecondary },
                          ]}
                        >
                          {relItem}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Custom relation input when 'Other' is selected */}
              {relation === 'Other' ? (
                <View
                  style={[
                    styles.inputContainer,
                    {
                      marginTop: 10,
                      backgroundColor: errors.customRelation ? '#FEF2F2' : (isDark ? colors.surfaceVariant : '#F8FAFC'),
                      borderColor: errors.customRelation ? '#EF4444' : colors.border,
                    },
                    errors.customRelation ? { borderWidth: 1.8 } : undefined,
                  ]}
                >
                  <AppIcon name="edit" size={18} color={errors.customRelation ? '#EF4444' : '#0083B0'} />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    placeholder="Specify custom relation"
                    placeholderTextColor={colors.textMuted}
                    value={customRelation}
                    onChangeText={(text) => {
                      setCustomRelation(text);
                      clearError('customRelation');
                    }}
                  />
                </View>
              ) : null}

              {errors.relation ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.relation}</Text>
                </View>
              ) : errors.customRelation ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.customRelation}</Text>
                </View>
              ) : null}
            </View>

            {/* 5. DATE OF BIRTH */}
            <View style={styles.formGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                  Date of Birth (DOB) <Text style={styles.requiredStar}>*</Text>
                </Text>
                {calculatedAge ? (
                  <Text style={styles.calculatedAgeBadge}>Age: {calculatedAge}</Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: errors.dob ? '#FEF2F2' : (isDark ? colors.surfaceVariant : '#F8FAFC') },
                  { borderColor: errors.dob ? '#EF4444' : colors.border },
                  errors.dob ? { borderWidth: 1.8 } : undefined,
                ]}
              >
                <TouchableOpacity onPress={openCalendarPicker} activeOpacity={0.7} style={{ paddingRight: 6 }}>
                  <AppIcon name="calendar" size={18} color={errors.dob ? '#EF4444' : '#0083B0'} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary, flex: 1 }]}
                  placeholder="Select or enter DOB (DD/MM/YYYY)"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={10}
                  value={dob}
                  onChangeText={handleDobChange}
                />
                <TouchableOpacity
                  style={styles.openCalBtnIconOnly}
                  onPress={openCalendarPicker}
                  activeOpacity={0.8}
                >
                  <AppIcon name="calendar" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {errors.dob ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.dob}</Text>
                </View>
              ) : null}
            </View>

            {/* 6. AADHAAR NUMBER */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Aadhaar No. <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: errors.aadhaarNo ? '#FEF2F2' : (isDark ? colors.surfaceVariant : '#F8FAFC') },
                  { borderColor: errors.aadhaarNo ? '#EF4444' : colors.border },
                  errors.aadhaarNo ? { borderWidth: 1.8 } : undefined,
                ]}
              >
                <AppIcon name="shield-check" size={18} color={errors.aadhaarNo ? '#EF4444' : '#0083B0'} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Enter 12-digit Aadhaar number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={14}
                  value={aadhaarNo}
                  onChangeText={handleAadhaarChange}
                />
              </View>
              {errors.aadhaarNo ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.aadhaarNo}</Text>
                </View>
              ) : null}
            </View>

            {/* 7. ADDRESS LINE 1 */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Address Line 1 <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: errors.addressLine1 ? '#FEF2F2' : (isDark ? colors.surfaceVariant : '#F8FAFC') },
                  { borderColor: errors.addressLine1 ? '#EF4444' : colors.border },
                  errors.addressLine1 ? { borderWidth: 1.8 } : undefined,
                ]}
              >
                <AppIcon name="location" size={18} color={errors.addressLine1 ? '#EF4444' : '#0083B0'} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="House/Flat No., Building, Street Name"
                  placeholderTextColor={colors.textMuted}
                  value={addressLine1}
                  onChangeText={(text) => {
                    setAddressLine1(text);
                    clearError('addressLine1');
                  }}
                />
              </View>
              {errors.addressLine1 ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.addressLine1}</Text>
                </View>
              ) : null}
            </View>

            {/* 8. ADDRESS LINE 2 */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Address Line 2 <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textSecondary }}>(Optional)</Text>
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC', borderColor: colors.border }]}>
                <AppIcon name="location" size={18} color="#0083B0" />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Landmark, Area, City, State & Pincode"
                  placeholderTextColor={colors.textMuted}
                  value={addressLine2}
                  onChangeText={setAddressLine2}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* BOTTOM FIXED ACTION BUTTON BAR */}
        <View
          style={[
            styles.bottomActionFooter,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 14),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.saveMemberBtn}
            onPress={handleSaveMember}
            activeOpacity={0.88}
          >
            <AppIcon name="user-plus" size={18} color="#FFFFFF" />
            <Text style={styles.saveMemberBtnText}>Add Member</Text>
          </TouchableOpacity>
        </View>

        {/* Universal Loader */}
        <UniversalLoader
          visible={loaderState.visible}
          message={loaderState.message}
          subtitle={loaderState.subtitle}
        />

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
                  <View style={styles.calHeaderIconWrap}>
                    <AppIcon name="calendar" size={18} color="#0083B0" />
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
                  style={styles.calNavArrowBtn}
                  onPress={handlePrevMonth}
                  activeOpacity={0.7}
                >
                  <AppIcon name="back" size={18} color="#0083B0" />
                </TouchableOpacity>

                {/* Month Selector Pill */}
                <TouchableOpacity
                  style={[styles.calSelectPill, showMonthGrid && styles.calSelectPillActive]}
                  onPress={() => {
                    setShowMonthGrid((prev) => !prev);
                    setShowYearGrid(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.calSelectPillText, showMonthGrid && styles.calSelectPillTextActive]}>
                    {MONTH_NAMES[calendarMonth]}
                  </Text>
                  <AppIcon name="chevron-down" size={13} color={showMonthGrid ? '#FFFFFF' : '#0083B0'} />
                </TouchableOpacity>

                {/* Year Selector Pill */}
                <TouchableOpacity
                  style={[styles.calSelectPill, showYearGrid && styles.calSelectPillActive]}
                  onPress={() => {
                    setShowYearGrid((prev) => !prev);
                    setShowMonthGrid(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.calSelectPillText, showYearGrid && styles.calSelectPillTextActive]}>
                    {calendarYear}
                  </Text>
                  <AppIcon name="chevron-down" size={13} color={showYearGrid ? '#FFFFFF' : '#0083B0'} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.calNavArrowBtn}
                  onPress={handleNextMonth}
                  activeOpacity={0.7}
                >
                  <AppIcon name="chevron-right" size={18} color="#0083B0" />
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
                              isSelected && styles.yearGridItemActive,
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
                            isSelected && styles.monthGridItemActive,
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
                            isSelected && styles.calDayCellActive,
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
                <View style={{ flex: 1 }}>
             
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                
                  <TouchableOpacity
                    style={styles.calConfirmBtn}
                    onPress={handleConfirmCalendarDate}
                    activeOpacity={0.85}
                  >
                    <AppIcon name="check" size={15} color="#FFFFFF" />
                    <Text style={styles.calConfirmBtnText}>Set DOB</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EDF5F8',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#EDF5F8',
    position: 'relative',
  },
  ambientBgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  ambientTopGlow: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#DEF0FD',
    opacity: 0.65,
  },
  ambientMidGlow: {
    position: 'absolute',
    top: '36%',
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#E0F2FE',
    opacity: 0.45,
  },
  ambientWaveImage: {
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
    width: '100%',
    height: 290,
    opacity: 0.22,
  },

  // HEADER BAR
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
    alignItems: 'flex-start',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
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
  },

  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  infoBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 14,
    marginBottom: 16,
  },
  infoBannerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  infoBannerSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },

  formCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
    fontWeight: '800',
  },
  calculatedAgeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0083B0',
    backgroundColor: '#DEF0FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 10,
  },
  countryPrefixBadge: {
    backgroundColor: '#DEF0FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countryPrefixText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0083B0',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  inputContainerMultiline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  textInputMultiline: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    textAlignVertical: 'top',
  },

  genderPillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  genderPillActive: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
  },
  genderPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  genderPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  relationChipScroll: {
    gap: 8,
  },
  relationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  relationChipActive: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
  },
  relationChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  relationChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  bottomActionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#0F253E',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  saveMemberBtn: {
    backgroundColor: '#0083B0',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveMemberBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ERROR STYLES
  errorInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingLeft: 2,
  },
  errorInlineText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  genderBoxWrap: {
    width: '100%',
  },
  relationBoxWrap: {
    width: '100%',
  },

  openCalBtnIconOnly: {
    backgroundColor: '#0083B0',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  calSelectPillActive: {
    backgroundColor: '#0083B0',
  },
  calSelectPillText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0083B0',
  },
  calSelectPillTextActive: {
    color: '#FFFFFF',
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
    fontWeight: '800',
  },
  calFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  calPreviewLabel: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  calPreviewValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0083B0',
  },
  calCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  calCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  calConfirmBtn: {
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  calConfirmBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default AddMemberScreen;
