import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Alert,
  useWindowDimensions,
  BackHandler,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { PatientMember, UserSession } from './types';
import { INITIAL_PATIENTS } from './mockData';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';
import { getActiveMember } from './accountManager';

interface BookVisitScreenProps {
  userSession: UserSession;
  onBack: () => void;
  onBookingSuccess?: () => void;
  onAddHealthPoints?: (points: number) => void;
  skipPatientSelection?: boolean;
}

// 8 Specialty departments requested
interface Department {
  id: string;
  name: string;
  sub: string;
  icon: any;
  doctorCount: number;
}

const DEPARTMENTS: Department[] = [
  { id: '1', name: 'Cardiology', sub: 'Heart & Vascular', icon: 'heart', doctorCount: 4 },
  { id: '2', name: 'Orthopedics', sub: 'Bones & Joints', icon: 'care', doctorCount: 5 },
  { id: '3', name: 'General Medicine', sub: 'Physician & Fever', icon: 'hospital', doctorCount: 8 },
  { id: '4', name: 'Pediatrics', sub: 'Child Care & Health', icon: 'users', doctorCount: 3 },
  { id: '5', name: 'Gynaecology', sub: "Women's Health", icon: 'user', doctorCount: 4 },
  { id: '6', name: 'Dermatology', sub: 'Skin & Aesthetics', icon: 'shield-check', doctorCount: 3 },
  { id: '7', name: 'General Surgery', sub: 'Surgical & Laparoscopy', icon: 'edit', doctorCount: 6 },
  { id: '8', name: 'ENT', sub: 'Ear, Nose & Throat', icon: 'bullhorn', doctorCount: 2 },
];

// 3 Doctors with complete bio & patient reviews
interface PatientReview {
  id: string;
  patientName: string;
  rating: number;
  date: string;
  comment: string;
}

interface DoctorItem {
  id: string;
  deptId?: string;
  name: string;
  specialty: string;
  qualifications: string;
  unit: string;
  rating: string;
  reviewsCount: number;
  fee: number;
  experience: string;
  avatar: any;
  about: string;
  languages: string[];
  reviews: PatientReview[];
}

const DOCTORS_LIST: DoctorItem[] = [
  {
    id: 'doc-1',
    deptId: '4', // Pediatrics
    name: 'Dr. Priya Nair',
    specialty: 'Senior Pediatrician',
    qualifications: 'MBBS, MD (Pediatrics)',
    unit: 'Unit 1 · 09:00 AM – 12:00 PM',
    rating: '4.9',
    reviewsCount: 356,
    fee: 500,
    experience: '12 Yrs Exp',
    avatar: IMAGES.avatarDoctorFemale,
    about: 'Dr. Priya Nair is a highly acclaimed Senior Pediatrician specializing in child immunizations, newborn care, developmental assessment, and pediatric infectious conditions. She has over 12 years of experience in top-tier pediatric hospitals.',
    languages: ['English', 'Hindi', 'Malayalam'],
    reviews: [
      {
        id: 'rev-1',
        patientName: 'Sunita Verma',
        rating: 5,
        date: '12 Sep 2026',
        comment: 'Dr. Priya is wonderful with children! My 3-year-old son was very comfortable during the examination. Highly recommended!',
      },
      {
        id: 'rev-2',
        patientName: 'Rajesh Kumar',
        rating: 5,
        date: '08 Sep 2026',
        comment: 'Very patient listener. She diagnosed my daughter\'s fever accurately and gave detailed dosage instructions.',
      },
      {
        id: 'rev-3',
        patientName: 'Ananya Sharma',
        rating: 4.5,
        date: '01 Sep 2026',
        comment: 'Great pediatrician! Minimal waiting time and very supportive medical staff.',
      },
    ],
  },
  {
    id: 'doc-2',
    deptId: '3', // General Medicine
    name: 'Dr. Chakravarthi',
    specialty: 'Chief Consultant Physician',
    qualifications: 'MBBS, MD, FRCP (London)',
    unit: 'Unit 2 · 10:00 AM – 02:00 PM',
    rating: '4.8',
    reviewsCount: 412,
    fee: 600,
    experience: '16 Yrs Exp',
    avatar: IMAGES.avatarDoctor,
    about: 'Dr. Chakravarthi is a Chief Consultant Physician with over 16 years of extensive clinical practice in internal medicine, metabolic disorders, hypertension, and preventive health screenings.',
    languages: ['English', 'Hindi', 'Telugu'],
    reviews: [
      {
        id: 'rev-4',
        patientName: 'Vikram Malhotra',
        rating: 5,
        date: '14 Sep 2026',
        comment: 'Dr. Chakravarthi diagnosed my chronic condition accurately after 2 years of struggle elsewhere. Highly compassionate doctor.',
      },
      {
        id: 'rev-5',
        patientName: 'Meenakshi Sundaram',
        rating: 5,
        date: '10 Sep 2026',
        comment: 'Extremely polite and thorough in examination. Explained all lab reports clearly.',
      },
    ],
  },
  {
    id: 'doc-3',
    deptId: '4', // Pediatrics
    name: 'Dr. Ananya Roy',
    specialty: 'Associate Child Specialist',
    qualifications: 'MBBS, DNB (Pediatrics)',
    unit: 'Unit 3 · 02:00 PM – 05:00 PM',
    rating: '4.9',
    reviewsCount: 289,
    fee: 500,
    experience: '9 Yrs Exp',
    avatar: IMAGES.avatarDoctorFemale,
    about: 'Dr. Ananya Roy specializes in infant nutrition, pediatric allergy management, and adolescent growth counseling with 9 years of dedicated clinical experience.',
    languages: ['English', 'Hindi', 'Bengali'],
    reviews: [
      {
        id: 'rev-6',
        patientName: 'Pooja Hegde',
        rating: 5,
        date: '15 Sep 2026',
        comment: 'Very gentle with infants and explained vaccination timelines clearly. Loved the clinic atmosphere.',
      },
      {
        id: 'rev-7',
        patientName: 'Amitabh Sen',
        rating: 4.5,
        date: '05 Sep 2026',
        comment: 'Thorough consultation and friendly advice. Satisfied with the care provided.',
      },
    ],
  },
  {
    id: 'doc-4',
    deptId: '1', // Cardiology
    name: 'Dr. Rajesh Sharma',
    specialty: 'Senior Interventional Cardiologist',
    qualifications: 'MBBS, MD, DM (Cardiology)',
    unit: 'Unit 1 · 09:30 AM – 01:30 PM',
    rating: '4.9',
    reviewsCount: 520,
    fee: 800,
    experience: '18 Yrs Exp',
    avatar: IMAGES.avatarDoctor,
    about: 'Dr. Rajesh Sharma is a leading Interventional Cardiologist with 18 years of expertise in angioplasty, pacemaker implantation, and cardiac preventive care.',
    languages: ['English', 'Hindi', 'Punjabi'],
    reviews: [
      {
        id: 'rev-8',
        patientName: 'Ramesh Gupta',
        rating: 5,
        date: '11 Sep 2026',
        comment: 'Outstanding cardiologist! Explained my heart condition patiently and guided me through recovery.',
      },
    ],
  },
  {
    id: 'doc-5',
    deptId: '2', // Orthopedics
    name: 'Dr. Sunita Reddy',
    specialty: 'Senior Joint Replacement Surgeon',
    qualifications: 'MBBS, MS (Orthopedics)',
    unit: 'Unit 2 · 11:00 AM – 03:00 PM',
    rating: '4.8',
    reviewsCount: 380,
    fee: 700,
    experience: '14 Yrs Exp',
    avatar: IMAGES.avatarDoctorFemale,
    about: 'Dr. Sunita Reddy is a renowned Orthopedic Surgeon specializing in knee & hip replacements, arthroscopy, and sports injury management.',
    languages: ['English', 'Hindi', 'Telugu'],
    reviews: [
      {
        id: 'rev-9',
        patientName: 'Kavita Joshi',
        rating: 5,
        date: '09 Sep 2026',
        comment: 'Dr. Sunita performed my mother knee surgery smoothly. Exceptional care and attention.',
      },
    ],
  },
  {
    id: 'doc-6',
    deptId: '6', // Dermatology
    name: 'Dr. Meera Kapoor',
    specialty: 'Consultant Dermatologist & Cosmetologist',
    qualifications: 'MBBS, MD (Dermatology)',
    unit: 'Unit 1 · 10:00 AM – 02:00 PM',
    rating: '4.9',
    reviewsCount: 310,
    fee: 650,
    experience: '11 Yrs Exp',
    avatar: IMAGES.avatarDoctorFemale,
    about: 'Dr. Meera Kapoor is a specialist in clinical dermatology, skin rejuvenation, acne treatment, and laser therapies.',
    languages: ['English', 'Hindi'],
    reviews: [
      {
        id: 'rev-10',
        patientName: 'Alok Roy',
        rating: 5,
        date: '13 Sep 2026',
        comment: 'Very effective treatment for skin allergies. Highly recommended dermatologist!',
      },
    ],
  },
];

// Available dates - dynamically computed 7 days Sun to Sat
interface DateOption {
  dateStr: string;
  dayName: string;
  fullDayName: string;
  dayNum: string;
  month: string;
  fullDate: Date;
  badge?: string;
}

const formatDateStr = (d: Date): string => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const getWeekDays = (refDate: Date = new Date(2026, 8, 17)): DateOption[] => {
  const current = new Date(refDate);
  const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const sunday = new Date(current);
  sunday.setDate(current.getDate() - dayOfWeek);

  const days: DateOption[] = [];
  const todayStr = '17-09-2026';
  const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const dateStr = `${dd}-${mm}-${yyyy}`;

    days.push({
      dateStr,
      dayName: shortDayNames[i],
      fullDayName: fullDayNames[i],
      dayNum: dd,
      month: monthNames[d.getMonth()],
      fullDate: d,
      badge: dateStr === todayStr ? 'Today' : undefined,
    });
  }

  return days;
};

// Time slots split into Morning, Afternoon, Evening
const MORNING_SLOTS = [
  '09:00 AM', '09:20 AM', '09:40 AM', '10:00 AM',
  '10:20 AM', '10:40 AM', '11:00 AM', '11:20 AM', '11:40 AM',
];

const AFTERNOON_SLOTS = [
  '12:00 PM', '12:20 PM', '12:40 PM', '01:00 PM',
  '01:20 PM', '01:40 PM', '02:00 PM', '02:30 PM', '03:00 PM',
];

const EVENING_SLOTS = [
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
];

export const BookVisitScreen: React.FC<BookVisitScreenProps> = ({
  userSession,
  onBack,
  onBookingSuccess,
  onAddHealthPoints,
  skipPatientSelection = false,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { isDark, colors } = useTheme();

  // Active member dynamically from account manager
  const activeMember = getActiveMember();

  // Active step: 1 = Patient, 2 = Department, 3 = Doctor & Slot, 4 = Payment & Dues
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(skipPatientSelection ? 2 : 1);

  // Reference date for 1-week Sunday to Saturday generation (defaults to 17 Sep 2026)
  const [refDate, setRefDate] = useState<Date>(new Date(2026, 8, 17));
  const weekDays = getWeekDays(refDate);

  // Selection state (pre-selected to active selected member)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(activeMember ? activeMember.id : '1');

  useEffect(() => {
    const active = getActiveMember();
    if (active) {
      setSelectedPatientId(active.id);
    }
  }, [userSession]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('4'); // Pediatrics
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc-1'); // Dr. Priya Nair
  const [doctorSearchQuery, setDoctorSearchQuery] = useState<string>('');
  const [searchedDoctor, setSearchedDoctor] = useState<DoctorItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('17-09-2026');
  const [selectedDay, setSelectedDay] = useState<string>('Thursday');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:20 AM');
  const [duesDismissed, setDuesDismissed] = useState<boolean>(false);
  const [paymentOption, setPaymentOption] = useState<'pay_now' | 'pay_later'>('pay_later');

  // Calendar Modal state
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(2026, 8, 1));
  const [showMonthYearPicker, setShowMonthYearPicker] = useState<boolean>(false);

  // Doctor Detail Bottom Sheet Modal state
  const [showDoctorModal, setShowDoctorModal] = useState<boolean>(false);
  const [activeModalDoctor, setActiveModalDoctor] = useState<DoctorItem | null>(null);

  // Confirmation modal & Loader
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM'>('GPAY');
  const [generatedToken, setGeneratedToken] = useState<string>('TK-2026-0917-042');
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    message?: string;
    subtitle?: string;
  }>({ visible: false });

  // Animation refs for Victory Celebration Blast (Pay Now)
  const coinFloatAnim = useRef(new Animated.Value(0)).current;
  const trophyScaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (showSuccessModal && paymentOption === 'pay_now') {
      trophyScaleAnim.setValue(0.3);
      coinFloatAnim.setValue(0);
      Animated.parallel([
        Animated.spring(trophyScaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(coinFloatAnim, {
              toValue: -12,
              duration: 1200,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(coinFloatAnim, {
              toValue: 0,
              duration: 1200,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
      if (onAddHealthPoints) {
        onAddHealthPoints(50);
      }
    }
  }, [showSuccessModal, paymentOption]);

  // Get selected patient object (defaults to Self)
  const selectedPatient =
    INITIAL_PATIENTS.find((p) => p.id === selectedPatientId) || INITIAL_PATIENTS[0];
  const selectedDept =
    DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[3];
  const selectedDoctor =
    DOCTORS_LIST.find((d) => d.id === selectedDoctorId) || DOCTORS_LIST[0];

  // Avatar helper
  const getPatientAvatar = (p: PatientMember) => {
    const nameLower = p.name.toLowerCase();
    const relLower = p.relation.toLowerCase();
    if (
      nameLower.includes('rathi') ||
      nameLower.includes('sharma') ||
      relLower === 'self' ||
      relLower === 'you'
    ) {
      return IMAGES.avatarMale;
    }
    if (nameLower.includes('kavita')) {
      return IMAGES.avatarKavita;
    }
    if (nameLower.includes('aarav')) {
      return IMAGES.avatarAarav;
    }
    if (nameLower.includes('deepak')) {
      return IMAGES.avatarDeepak;
    }
    return IMAGES.avatarKavita;
  };

  const handleStepBack = () => {
    if (showDoctorModal) {
      setShowDoctorModal(false);
      return;
    }
    if (showCalendarModal) {
      setShowCalendarModal(false);
      return;
    }
    if (currentStep > 2) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      onBack();
    }
  };

  // Hardware device back button handling for multi-step workflow & active modals
  useEffect(() => {
    const onBackPress = () => {
      if (showDoctorModal) {
        setShowDoctorModal(false);
        return true;
      }
      if (showCalendarModal) {
        setShowCalendarModal(false);
        return true;
      }
      if (showSuccessModal) {
        setShowSuccessModal(false);
        if (onBookingSuccess) {
          onBookingSuccess();
        } else {
          onBack();
        }
        return true;
      }
      if (currentStep > 1) {
        setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
        return true;
      }
      onBack();
      return true;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSubscription.remove();
  }, [showDoctorModal, showCalendarModal, showSuccessModal, currentStep, onBack, onBookingSuccess]);

  const handleConfirmBooking = () => {
    if (paymentOption === 'pay_now') {
      setShowPaymentModal(true);
    } else {
      executeFinalBooking();
    }
  };

  const executeFinalBooking = () => {
    setShowPaymentModal(false);
    setLoaderState({
      visible: true,
      message: 'Confirming Appointment...',
      subtitle: `Allocating slot with ${selectedDoctor.name} for ${selectedPatient.name}`,
    });

    setTimeout(() => {
      setLoaderState({ visible: false });
      setGeneratedToken(`TK-2026-0907-0${Math.floor(10 + Math.random() * 89)}`);
      setShowSuccessModal(true);
    }, 700);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        {/* APP-THEMED AMBIENT PARENT BACKGROUND */}
        <View style={styles.ambientBgContainer} pointerEvents="none">
          <View style={[styles.ambientTopGlow, { backgroundColor: colors.primaryLight, opacity: isDark ? 0.25 : 0.65 }]} />
          <View style={[styles.ambientMidGlow, { backgroundColor: colors.primaryLight, opacity: isDark ? 0.15 : 0.45 }]} />
          <Image
            source={IMAGES.leavesWaveBg}
            fadeDuration={0}
            style={[styles.ambientWaveImage, { opacity: isDark ? 0.07 : 0.2 }]}
            resizeMode="cover"
          />
        </View>

        {/* 1. TOP HEADER BAR: Back button, centered "Book Visit" in blue, step badge */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
              paddingHorizontal: isTablet ? 24 : 16,
              paddingTop: isTablet ? 14 : 10,
              paddingBottom: isTablet ? 14 : 12,
            },
          ]}
        >
          {/* Left side: Back Button */}
          <View style={[styles.headerSideGroup, isTablet && { width: 104 }]}>
            <TouchableOpacity
              style={[styles.headerBackBtn, { backgroundColor: colors.surfaceVariant }, isTablet && { width: 44, height: 44, borderRadius: 22 }]}
              onPress={handleStepBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppIcon name="back" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Centered Blue Header Title: Book Appointment (No secondary text) */}
          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, isTablet && { fontSize: 24 }]}>
              Book Appointment
            </Text>
          </View>

          {/* Right side: Step Pill Indicator */}
          <View style={[styles.headerSideGroup, styles.headerRightGroup, isTablet && { width: 104 }]}>
            <View style={[styles.stepBadge, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight, borderColor: isDark ? colors.border : colors.primaryLight }]}>
              <Text style={[styles.stepBadgeText, { color: isDark ? colors.accent : colors.primary }]}>Step {currentStep} of 4</Text>
            </View>
          </View>
        </View>

        {/* 4-SEGMENT PROGRESS BAR */}
        <View style={[styles.progressTrackContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {[1, 2, 3, 4].map((stepNumber) => (
            <View
              key={stepNumber}
              style={[
                styles.progressSegment,
                stepNumber <= currentStep
                  ? [styles.progressSegmentActive, { backgroundColor: colors.primary }]
                  : [styles.progressSegmentInactive, { backgroundColor: colors.border }],
              ]}
            />
          ))}
        </View>

        {/* MAIN SCROLLABLE STEP CONTENT */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isTablet ? 24 : 16,
              paddingTop: 12,
              paddingBottom: insets.bottom + 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ========================================================
              STEP 1: SELECT PATIENT FROM FAMILY MEMBERS
             ======================================================== */}
          {currentStep === 1 && (
            <View>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepSubTitle, { color: colors.primary }]}>STEP 1</Text>
                <Text style={[styles.stepMainTitle, { color: colors.textPrimary }]}>Who is this visit for?</Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Select a family member from your registered health records.
                </Text>
              </View>

              <View style={styles.patientListContainer}>
                {INITIAL_PATIENTS.map((patient) => {
                  const isSelected = selectedPatientId === patient.id;
                  return (
                    <TouchableOpacity
                      key={patient.id}
                      style={[
                        styles.patientCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                        isSelected && (isDark ? { borderColor: colors.accent, backgroundColor: colors.surfaceVariant } : [styles.patientCardSelected, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]),
                      ]}
                      onPress={() => setSelectedPatientId(patient.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.patientAvatarBox, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight }]}>
                        <Image
                          source={getPatientAvatar(patient)}
                          style={styles.patientAvatarImg}
                          resizeMode="cover"
                        />
                      </View>

                      <View style={styles.patientInfoBox}>
                        <View style={styles.patientNameRow}>
                          <Text style={[styles.patientNameText, { color: colors.textPrimary }]}>{patient.name}</Text>
                          <View
                            style={[
                              styles.relationBadge,
                              { backgroundColor: colors.surfaceVariant },
                              isSelected && (isDark ? { backgroundColor: colors.surfaceVariant } : [styles.relationBadgeSelected, { backgroundColor: colors.primaryLight }]),
                            ]}
                          >
                            <Text
                              style={[
                                styles.relationBadgeText,
                                { color: colors.textSecondary },
                                isSelected && (isDark ? { color: colors.accent } : [styles.relationBadgeTextSelected, { color: colors.primary }]),
                              ]}
                            >
                              {patient.relation}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.patientMetaText, { color: colors.textSecondary }]}>
                          {patient.sex === 'M' ? 'Male' : 'Female'} • {patient.age} • UHID: {patient.patientNumber}
                        </Text>
                      </View>

                      {/* Radio Indicator */}
                      <View
                        style={[
                          styles.radioCircle,
                          { borderColor: colors.border },
                          isSelected && [styles.radioCircleSelected, { borderColor: colors.primary }],
                        ]}
                      >
                        {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Add Member helper banner */}
              <View style={[styles.addMemberHintBanner, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight, borderColor: isDark ? colors.border : colors.primaryLight }]}>
                <AppIcon name="info" size={16} color={isDark ? colors.accent : colors.primary} />
                <Text style={[styles.addMemberHintText, { color: isDark ? colors.accent : colors.primary }]}>
                  Need to book for another family member? You can add them from the Member list section anytime.
                </Text>
              </View>

              {/* Bottom Continue Action */}
              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: colors.primary }]}
                onPress={() => setCurrentStep(2)}
                activeOpacity={0.88}
              >
                <Text style={styles.continueButtonText}>Continue to Department</Text>
                <AppIcon name="arrow-right" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* ========================================================
              STEP 2: SELECT SPECIALTY / DEPARTMENT & DOCTOR SEARCH
             ======================================================== */}
          {currentStep === 2 && (
            <View>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepSubTitle, { color: colors.primary }]}>STEP 2</Text>
                <Text style={[styles.stepMainTitle, { color: colors.textPrimary }]}>Select Department or Search Doctor</Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Booking consultation for{' '}
                  <Text style={{ fontWeight: '700', color: isDark ? colors.accent : colors.primary }}>
                    {selectedPatient.name}
                  </Text>
                  . Search doctor by name or choose clinical specialty:
                </Text>
              </View>

              {/* SEARCH DOCTOR BY NAME INPUT */}
              <View style={styles.searchDoctorWrapper}>
                <Text style={[styles.searchDoctorLabel, { color: colors.textPrimary }]}>
                  Search Doctor by Name
                </Text>
                <View
                  style={[
                    styles.searchDoctorInputRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: doctorSearchQuery ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <AppIcon name="search" size={18} color={colors.primary} />
                  <TextInput
                    style={[styles.searchDoctorTextInput, { color: colors.textPrimary }]}
                    placeholder="Search doctor by name (e.g. Dr. Priya, Dr. Chakravarthi)..."
                    placeholderTextColor={colors.textSecondary || '#94A3B8'}
                    value={doctorSearchQuery}
                    onChangeText={setDoctorSearchQuery}
                  />
                  {doctorSearchQuery ? (
                    <TouchableOpacity
                      onPress={() => setDoctorSearchQuery('')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <AppIcon name="close" size={16} color={colors.textSecondary || '#94A3B8'} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* LIVE SEARCH DOCTOR RESULTS */}
              {doctorSearchQuery.trim() !== '' && (() => {
                const queryLower = doctorSearchQuery.toLowerCase().trim();
                const matchedDoctors = DOCTORS_LIST.filter(
                  (doc) => doc.name.toLowerCase().includes(queryLower) || doc.specialty.toLowerCase().includes(queryLower)
                );

                return (
                  <View style={[styles.searchResultsCardContainer, { backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC', borderColor: colors.border }]}>
                    <View style={styles.searchResultsHeaderRow}>
                      <Text style={[styles.searchResultsTitleText, { color: colors.textPrimary }]}>
                        Matching Doctors ({matchedDoctors.length})
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' }}>
                        Tap to select slot directly
                      </Text>
                    </View>

                    {matchedDoctors.length === 0 ? (
                      <View style={styles.searchEmptyStateBox}>
                        <AppIcon name="user" size={24} color={colors.textSecondary || '#94A3B8'} />
                        <Text style={[styles.searchEmptyStateText, { color: colors.textSecondary }]}>
                          No doctor found matching "{doctorSearchQuery}"
                        </Text>
                      </View>
                    ) : (
                      matchedDoctors.map((doc) => (
                        <TouchableOpacity
                          key={doc.id}
                          style={[styles.searchResultItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                          onPress={() => {
                            setSelectedDoctorId(doc.id);
                            setSearchedDoctor(doc);
                            if (doc.deptId) {
                              setSelectedDeptId(doc.deptId);
                            }
                            setDoctorSearchQuery('');
                            setCurrentStep(3); // Immediate navigation to Slot Selection!
                          }}
                          activeOpacity={0.8}
                        >
                          <Image source={doc.avatar} style={styles.searchResultAvatar} resizeMode="cover" />
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[styles.searchResultDoctorName, { color: colors.textPrimary }]}>{doc.name}</Text>
                            <Text style={[styles.searchResultSpecText, { color: colors.textSecondary }]}>
                              {doc.specialty} • {doc.experience}
                            </Text>
                            <Text style={[styles.searchResultUnitText, { color: colors.textSecondary }]}>{doc.unit}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 6 }}>
                            <View style={[styles.searchResultFeeBadge, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight }]}>
                              <Text style={[styles.searchResultFeeText, { color: colors.primary }]}>₹{doc.fee}</Text>
                            </View>
                            <View style={[styles.selectSlotBtn, { backgroundColor: colors.primary }]}>
                              <Text style={styles.selectSlotBtnText}>Select Slot ›</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                );
              })()}

              <View style={styles.deptGrid}>
                {DEPARTMENTS.map((dept) => {
                  const isSelected = selectedDeptId === dept.id;
                  return (
                    <TouchableOpacity
                      key={dept.id}
                      style={[
                        styles.deptCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                        isSelected && (isDark ? { borderColor: colors.accent, backgroundColor: colors.surfaceVariant } : [styles.deptCardSelected, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]),
                      ]}
                      onPress={() => {
                        setSelectedDeptId(dept.id);
                        setSearchedDoctor(null);
                      }}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.deptIconBox,
                          { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight },
                          isSelected && [styles.deptIconBoxSelected, { backgroundColor: colors.primary }],
                        ]}
                      >
                        <AppIcon
                          name={dept.icon}
                          size={24}
                          color={isSelected ? '#FFFFFF' : (isDark ? colors.accent : colors.primary)}
                        />
                      </View>

                      <Text
                        style={[
                          styles.deptNameText,
                          { color: colors.textPrimary },
                          isSelected && (isDark ? { color: colors.accent } : [styles.deptNameTextSelected, { color: colors.primary }]),
                        ]}
                        numberOfLines={1}
                      >
                        {dept.name}
                      </Text>

                      <Text style={[styles.deptSubText, { color: colors.textSecondary }]}>{dept.sub}</Text>

                      <View
                        style={[
                          styles.deptCountPill,
                          { backgroundColor: colors.surfaceVariant },
                          isSelected && (isDark ? { backgroundColor: colors.surfaceVariant } : [styles.deptCountPillSelected, { backgroundColor: colors.primaryLight }]),
                        ]}
                      >
                        <Text
                          style={[
                            styles.deptCountText,
                            { color: colors.textSecondary },
                            isSelected && (isDark ? { color: colors.accent } : [styles.deptCountTextSelected, { color: colors.primary }]),
                          ]}
                        >
                          {dept.doctorCount} Doctors
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Bottom Continue Action */}
              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setSearchedDoctor(null);
                  setCurrentStep(3);
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.continueButtonText}>Continue to Doctor & Slot</Text>
                <AppIcon name="arrow-right" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* ========================================================
              STEP 3: SELECT DOCTOR & SLOT
             ======================================================== */}
          {currentStep === 3 && (() => {
            const deptDoctors = DOCTORS_LIST.filter((d) => d.deptId === selectedDeptId);
            const displayedDoctors = searchedDoctor
              ? [searchedDoctor]
              : (deptDoctors.length > 0 ? deptDoctors : DOCTORS_LIST);

            return (
              <View>
                {/* SLOT Header */}
                <View style={styles.slotHeaderRow}>
                  <Text style={[styles.slotHeadingText, { color: colors.textSecondary }]}>SLOT SELECTION</Text>
                  <Text style={[styles.slotSubHeadingText, { color: colors.textSecondary }]}>
                    Dept: <Text style={{ fontWeight: '700', color: isDark ? colors.accent : colors.primary }}>{selectedDept.name}</Text>
                  </Text>
                </View>

                {/* SEARCHED DOCTOR BANNER NOTICE */}
                {searchedDoctor ? (
                  <View style={[styles.searchedDoctorNoticeBanner, { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF', borderColor: isDark ? colors.border : '#BAE6FD' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
                      <AppIcon name="user" size={16} color={colors.primary} />
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 1 }}>
                        Selected via Search: <Text style={{ fontWeight: '700', color: colors.primary }}>{searchedDoctor.name}</Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.viewAllDoctorsBtn, { backgroundColor: isDark ? colors.surface : colors.primaryLight }]}
                      onPress={() => setSearchedDoctor(null)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.viewAllDoctorsBtnText, { color: colors.primary }]}>View All in Dept</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* 1. SECTION: CHOOSE DOCTOR */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                    {searchedDoctor ? 'Selected Doctor' : 'Select Doctor'}
                  </Text>
                  <Text style={[styles.sectionBadgeText, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight, color: isDark ? colors.accent : colors.primary }]}>
                    {displayedDoctors.length} Available
                  </Text>
                </View>

                <View style={styles.doctorsListContainer}>
                  {displayedDoctors.map((doctor) => {
                    const isDoctorSelected = selectedDoctorId === doctor.id;
                    return (
                      <TouchableOpacity
                        key={doctor.id}
                        style={[
                          styles.doctorSelectCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                          isDoctorSelected && (isDark ? { borderColor: colors.accent, backgroundColor: colors.surfaceVariant } : [styles.doctorSelectCardActive, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]),
                        ]}
                        onPress={() => {
                          setSelectedDoctorId(doctor.id);
                          setActiveModalDoctor(doctor);
                          setShowDoctorModal(true);
                        }}
                        activeOpacity={0.88}
                      >
                        {/* Doctor Avatar - Clickable with Info Badge */}
                        <View style={[styles.doctorAvatarBox, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight }]}>
                          <Image
                            source={doctor.avatar}
                            style={styles.doctorAvatarImg}
                            resizeMode="cover"
                          />
                          <View style={styles.doctorVerifiedBadge}>
                            <AppIcon name="check" size={8} color="#FFFFFF" />
                          </View>
                          <View style={styles.doctorInfoCornerBadge}>
                            <AppIcon name="info" size={9} color="#FFFFFF" />
                          </View>
                        </View>

                        <View style={styles.doctorDetailsCol}>
                          <View style={styles.doctorNameRatingRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Text
                                style={[
                                  styles.doctorNameText,
                                  { color: colors.textPrimary },
                                  isDoctorSelected && (isDark ? { color: colors.accent } : [styles.doctorNameTextActive, { color: colors.primary }]),
                                ]}
                              >
                                {doctor.name}
                              </Text>
                              <AppIcon name="info" size={13} color={isDark ? colors.accent : colors.primary} />
                            </View>

                            {/* Rating Pill */}
                            <View style={styles.doctorRatingPill}>
                              <AppIcon name="star" size={11} color="#EAB308" />
                              <Text style={[styles.doctorRatingText, { color: colors.textPrimary }]}>{doctor.rating}</Text>
                              <Text style={[styles.doctorReviewsText, { color: colors.textSecondary }]}>({doctor.reviewsCount})</Text>
                            </View>
                          </View>

                          <Text style={[styles.doctorSpecText, { color: colors.textSecondary }]}>
                            {doctor.specialty} • {doctor.qualifications}
                          </Text>

                          <Text style={[styles.doctorUnitText, { color: colors.textSecondary }]}>{doctor.unit}</Text>

                          <View style={styles.doctorPillsRow}>
                            <View
                              style={[
                                styles.doctorFeeBadge,
                                { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight },
                                isDoctorSelected && [styles.doctorFeeBadgeActive, { backgroundColor: colors.primary }],
                              ]}
                            >
                              <Text
                                style={[
                                  styles.doctorFeeText,
                                  isDoctorSelected && styles.doctorFeeTextActive,
                                ]}
                              >
                                ₹{doctor.fee}
                              </Text>
                            </View>
                            <View style={[styles.doctorExpBadge, { backgroundColor: colors.surfaceVariant }]}>
                              <Text style={[styles.doctorExpText, { color: colors.textSecondary }]}>{doctor.experience}</Text>
                            </View>

                            {/* Prominent View Profile & Reviews Button */}
                            <TouchableOpacity
                              style={[styles.viewProfileBtn, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight, borderColor: isDark ? colors.border : colors.primaryLight, borderWidth: 1 }]}
                              onPress={() => {
                                setSelectedDoctorId(doctor.id);
                                setActiveModalDoctor(doctor);
                                setShowDoctorModal(true);
                              }}
                              activeOpacity={0.75}
                            >
                              <AppIcon name="info" size={11} color={isDark ? colors.accent : colors.primary} />
                              <Text style={[styles.viewProfileBtnText, { color: isDark ? colors.accent : colors.primary }]}>View Details & Reviews ›</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Radio Selection Indicator */}
                        <View
                          style={[
                            styles.radioCircle,
                            { borderColor: colors.border },
                            isDoctorSelected && [styles.radioCircleSelected, { borderColor: colors.primary }],
                          ]}
                        >
                          {isDoctorSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 2. SECTION: SELECT DATE */}
              <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
                <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>Select Date</Text>
              </View>

              {/* One Week Strip with > Next Week Arrow on right & blurred past dates */}
              <View style={styles.dateStripRowWithArrow}>
                {/* Back Arrow if viewing a future week */}
                {(() => {
                  const todayRef = new Date(2026, 8, 17);
                  todayRef.setHours(0, 0, 0, 0);
                  const firstDayOfWeek = new Date(weekDays[0].fullDate);
                  firstDayOfWeek.setHours(0, 0, 0, 0);

                  const isFutureWeek = firstDayOfWeek.getTime() > new Date(2026, 8, 13).getTime();

                  if (isFutureWeek) {
                    return (
                      <TouchableOpacity
                        style={[styles.stripNavArrowBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => {
                          const prev = new Date(refDate);
                          prev.setDate(prev.getDate() - 7);
                          setRefDate(prev);
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.stripNavArrowText, { color: isDark ? colors.accent : colors.primary }]}>‹</Text>
                      </TouchableOpacity>
                    );
                  }
                  return null;
                })()}

                {/* 7 Days Sunday to Saturday */}
                <View style={styles.weekStripGridContainer}>
                  {weekDays.map((item) => {
                    const todayRef = new Date(2026, 8, 17);
                    todayRef.setHours(0, 0, 0, 0);
                    const itemDate = new Date(item.fullDate);
                    itemDate.setHours(0, 0, 0, 0);
                    const isPast = itemDate.getTime() < todayRef.getTime();

                    const isDateSelected = selectedDate === item.dateStr;

                    return (
                      <TouchableOpacity
                        key={item.dateStr}
                        disabled={isPast}
                        style={[
                          styles.dateStripPill,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          isDateSelected && (isDark ? { borderColor: colors.accent, backgroundColor: colors.surfaceVariant } : [styles.dateStripPillActive, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]),
                          isPast && styles.dateStripPillDisabled,
                        ]}
                        onPress={() => {
                          if (!isPast) {
                            setSelectedDate(item.dateStr);
                            setSelectedDay(item.fullDayName);
                          }
                        }}
                        activeOpacity={isPast ? 1 : 0.8}
                      >
                        {item.badge && !isPast && (
                          <View
                            style={[
                              styles.dateTodayBadge,
                              isDateSelected && [styles.dateTodayBadgeActive, { backgroundColor: colors.primary }],
                            ]}
                          >
                            <Text
                              style={[
                                styles.dateTodayText,
                                isDateSelected && styles.dateTodayTextActive,
                              ]}
                            >
                              {item.badge}
                            </Text>
                          </View>
                        )}

                        {isPast && (
                          <View style={styles.datePastBadge}>
                            <Text style={styles.datePastBadgeText}>Off</Text>
                          </View>
                        )}

                        <Text
                          style={[
                            styles.dateStripDayName,
                            { color: colors.textSecondary },
                            isDateSelected && [styles.dateStripTextActive, { color: colors.primary }],
                            isPast && styles.dateStripTextDisabled,
                          ]}
                        >
                          {item.dayName.toUpperCase()}
                        </Text>
                        <Text
                          style={[
                            styles.dateStripDayNum,
                            { color: colors.textPrimary },
                            isDateSelected && [styles.dateStripTextActive, { color: colors.primary }],
                            isPast && styles.dateStripTextDisabled,
                          ]}
                        >
                          {item.dayNum}
                        </Text>
                        <Text
                          style={[
                            styles.dateStripMonth,
                            { color: colors.textSecondary },
                            isDateSelected && [styles.dateStripTextActive, { color: colors.primary }],
                            isPast && styles.dateStripTextDisabled,
                          ]}
                        >
                          {item.month}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Next Week > Arrow Button right on the date selection strip */}
                <TouchableOpacity
                  style={[styles.stripNavArrowBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {
                    const next = new Date(refDate);
                    next.setDate(next.getDate() + 7);
                    setRefDate(next);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.stripNavArrowText, { color: isDark ? colors.accent : colors.primary }]}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Working Interactive Calendar Display Card */}
              <TouchableOpacity
                style={[styles.datePickerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  const parts = selectedDate.split('-');
                  if (parts.length === 3) {
                    setCalendarMonth(new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, 1));
                  }
                  setShowCalendarModal(true);
                }}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.datePickerText, { color: colors.textPrimary }]}>{selectedDate} ({selectedDay})</Text>
                </View>
                <View style={[styles.calendarIconCircle, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight }]}>
                  <AppIcon name="calendar" size={18} color={isDark ? colors.accent : colors.primary} />
                </View>
              </TouchableOpacity>

              {/* 3. SECTION: SELECT TIME SLOT CATEGORIZED (MORNING, AFTERNOON, EVENING) */}
              <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
                <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>Select Time Slot</Text>
                <Text style={[styles.sectionBadgeText, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight, color: isDark ? colors.accent : colors.primary }]}>
                  Selected: {selectedSlot}
                </Text>
              </View>

              {/* CATEGORY 1: MORNING SLOTS */}
              <View style={styles.slotCategoryBlock}>
                <View style={styles.slotCategoryHeaderRow}>
                  <AppIcon name="weather-sunset" size={20} color="#D97706" />
                  <Text style={[styles.slotCategoryTitle, { color: colors.textPrimary }]}>Morning Slots</Text>
                  <Text style={[styles.slotCategorySubText, { color: colors.textSecondary }]}>09:00 AM – 11:40 AM</Text>
                </View>
                <View style={styles.slotsGridContainer}>
                  {MORNING_SLOTS.map((slotTime) => {
                    const isSlotSelected = selectedSlot === slotTime;
                    return (
                      <TouchableOpacity
                        key={slotTime}
                        style={[
                          styles.slotPill,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          isSlotSelected && styles.slotPillSelected,
                        ]}
                        onPress={() => setSelectedSlot(slotTime)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.slotPillText,
                            { color: colors.textSecondary },
                            isSlotSelected && styles.slotPillTextSelected,
                          ]}
                        >
                          {slotTime}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* CATEGORY 2: AFTERNOON SLOTS */}
              <View style={styles.slotCategoryBlock}>
                <View style={styles.slotCategoryHeaderRow}>
                  <AppIcon name="weather-sunny" size={20} color="#EA580C" />
                  <Text style={[styles.slotCategoryTitle, { color: colors.textPrimary }]}>Afternoon Slots</Text>
                  <Text style={[styles.slotCategorySubText, { color: colors.textSecondary }]}>12:00 PM – 03:00 PM</Text>
                </View>
                <View style={styles.slotsGridContainer}>
                  {AFTERNOON_SLOTS.map((slotTime) => {
                    const isSlotSelected = selectedSlot === slotTime;
                    return (
                      <TouchableOpacity
                        key={slotTime}
                        style={[
                          styles.slotPill,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          isSlotSelected && styles.slotPillSelected,
                        ]}
                        onPress={() => setSelectedSlot(slotTime)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.slotPillText,
                            { color: colors.textSecondary },
                            isSlotSelected && styles.slotPillTextSelected,
                          ]}
                        >
                          {slotTime}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* CATEGORY 3: EVENING SLOTS */}
              <View style={styles.slotCategoryBlock}>
                <View style={styles.slotCategoryHeaderRow}>
                  <AppIcon name="weather-night" size={20} color="#4F46E5" />
                  <Text style={[styles.slotCategoryTitle, { color: colors.textPrimary }]}>Evening Slots</Text>
                  <Text style={[styles.slotCategorySubText, { color: colors.textSecondary }]}>04:00 PM – 07:30 PM</Text>
                </View>
                <View style={styles.slotsGridContainer}>
                  {EVENING_SLOTS.map((slotTime) => {
                    const isSlotSelected = selectedSlot === slotTime;
                    return (
                      <TouchableOpacity
                        key={slotTime}
                        style={[
                          styles.slotPill,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          isSlotSelected && styles.slotPillSelected,
                        ]}
                        onPress={() => setSelectedSlot(slotTime)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.slotPillText,
                            { color: colors.textSecondary },
                            isSlotSelected && styles.slotPillTextSelected,
                          ]}
                        >
                          {slotTime}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Bottom Continue Button */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => setCurrentStep(4)}
                activeOpacity={0.88}
              >
                <Text style={styles.continueButtonText}>Continue to Payment</Text>
                <AppIcon name="arrow-right" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        })()}

          {/* ========================================================
              STEP 4: PAYMENT DETAILS & FAMILY DUES (REFERENCE IMAGE 2)
             ======================================================== */}
          {currentStep === 4 && (
            <View>
              {/* Reference Image 2: PAYMENT Subheader */}
              <View style={styles.slotHeaderRow}>
                <Text style={[styles.slotHeadingText, { color: colors.textSecondary }]}>PAYMENT</Text>
                <Text style={[styles.slotSubHeadingText, { color: colors.textSecondary }]}>Confirm visit & payment mode</Text>
              </View>

              {/* BOOKING SUMMARY CARD (Requested Details) */}
              <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.summaryCardTitle, { color: colors.textPrimary }]}>Appointment Summary</Text>

                {/* Patient */}
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Patient</Text>
                  <Text style={[styles.summaryValueBold, { color: colors.textPrimary }]}>{selectedPatient.name}</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

                {/* Doctor */}
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Doctor</Text>
                  <Text style={[styles.summaryValueBold, { color: colors.textPrimary }]}>{selectedDoctor.name}</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

                {/* Date/Time */}
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Date/Time</Text>
                  <Text style={[styles.summaryValueAccent, { color: isDark ? colors.accent : colors.primary }]}>{selectedDate} {selectedSlot}</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

              
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

                {/* Tariff */}
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Doctor Fees</Text>
                  <Text style={[styles.tariffValueText, { color: colors.textPrimary }]}>₹{selectedDoctor.fee}</Text>
                </View>
              </View>

              {/* OUTSTANDING DUES ON FAMILY ACCOUNT CARD (from Reference Image 2, App Light Theme) */}
              {!duesDismissed && (
                <View style={[styles.duesCard, isDark && { backgroundColor: '#2A1C0E', borderColor: '#78350F' }]}>
                  <View style={styles.duesHeaderRow}>
                    <AppIcon name="alert-circle" size={18} color="#D97706" />
                    <Text style={[styles.duesHeadingText, isDark && { color: '#FBBF24' }]}>
                      Outstanding dues on your family account — ₹8210
                    </Text>
                  </View>

                  {/* Line Items */}
                  <View style={[styles.duesList, isDark && { backgroundColor: '#1A140F', borderColor: '#451A03' }]}>
                    <View style={styles.duesItemRow}>
                      <Text style={[styles.duesItemName, isDark && { color: '#D1D5DB' }]}>IP Bill IP-2026-00142</Text>
                      <Text style={[styles.duesItemPrice, isDark && { color: '#F9FAFB' }]}>₹7700</Text>
                    </View>
                    <View style={styles.duesItemRow}>
                      <Text style={[styles.duesItemName, isDark && { color: '#D1D5DB' }]}>Lipid Profile</Text>
                      <Text style={[styles.duesItemPrice, isDark && { color: '#F9FAFB' }]}>₹450</Text>
                    </View>
                    <View style={styles.duesItemRow}>
                      <Text style={[styles.duesItemName, isDark && { color: '#D1D5DB' }]}>Pantoprazole 40mg</Text>
                      <Text style={[styles.duesItemPrice, isDark && { color: '#F9FAFB' }]}>₹60</Text>
                    </View>
                  </View>

                  {/* Action Buttons: Dismiss & Continue / Pay Now */}
                  <View style={styles.duesActionsRow}>
                    <TouchableOpacity
                      style={[styles.duesDismissBtn, isDark && { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
                      onPress={() => setDuesDismissed(true)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.duesDismissText, isDark && { color: colors.textSecondary }]}>Dismiss & Continue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.duesPayBtn}
                      onPress={() => {
                        Alert.alert(
                          'Clear Dues',
                          'Opening payment gateway to clear outstanding dues of ₹8,210.'
                        );
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.duesPayText}>Pay Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* PAYMENT OPTION 1: Pay Now (from Reference Image 2) */}
              <TouchableOpacity
                style={[
                  styles.paymentOptionCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  paymentOption === 'pay_now' && (isDark ? { borderColor: '#38BDF8', backgroundColor: '#1E3A5F' } : styles.paymentOptionCardSelected),
                ]}
                onPress={() => setPaymentOption('pay_now')}
                activeOpacity={0.8}
              >
                <View style={styles.paymentOptionLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      { borderColor: colors.border },
                      paymentOption === 'pay_now' && styles.radioCircleSelected,
                    ]}
                  >
                    {paymentOption === 'pay_now' && <View style={styles.radioDot} />}
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.paymentOptionTitle, { color: colors.textPrimary }]}>Pay Now</Text>
                    <Text style={[styles.paymentOptionSubtitle, { color: colors.textSecondary }]}>
                      Pay online now — appointment + token issued together on success.
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* PAYMENT OPTION 2: Pay Later (from Reference Image 2) */}
              <TouchableOpacity
                style={[
                  styles.paymentOptionCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  paymentOption === 'pay_later' && (isDark ? { borderColor: '#38BDF8', backgroundColor: '#1E3A5F' } : styles.paymentOptionCardSelected),
                ]}
                onPress={() => setPaymentOption('pay_later')}
                activeOpacity={0.8}
              >
                <View style={styles.paymentOptionLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      { borderColor: colors.border },
                      paymentOption === 'pay_later' && styles.radioCircleSelected,
                    ]}
                  >
                    {paymentOption === 'pay_later' && <View style={styles.radioDot} />}
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.paymentOptionTitle, { color: colors.textPrimary }]}>Pay Later</Text>
                    <Text style={[styles.paymentOptionSubtitle, { color: colors.textSecondary }]}>
                      Reserve now; token only after counter payment & check-in.
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* PRIMARY ACTION BUTTON: Confirm Booking (from Reference Image 2) */}
              <TouchableOpacity
                style={styles.confirmBookingButton}
                onPress={handleConfirmBooking}
                activeOpacity={0.88}
              >
                <Text style={styles.confirmBookingButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ========================================================
            PAYMENT METHODS MODAL SHEET (UPI / CARDS / NET BANKING)
           ======================================================== */}
        <Modal
          visible={showPaymentModal}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setShowPaymentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                isTablet && { width: 480 },
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>Select Payment Method</Text>
                  <Text style={[styles.modalHeaderSub, { color: colors.textSecondary }]}>Healthcare Gateway</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowPaymentModal(false)}
                  style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceVariant }]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <AppIcon name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Amount to Pay Summary */}
              <View
                style={[
                  styles.paySummaryBox,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight,
                    borderColor: isDark ? colors.border : '#BAE6FD',
                  },
                ]}
              >
                <Text style={[styles.paySummaryLabel, { color: isDark ? colors.accent : '#0369A1' }]}>
                  OPD Visit Fee for {selectedDoctor.name}
                </Text>
                <Text style={[styles.paySummaryAmount, { color: isDark ? colors.accent : colors.primary }]}>
                  ₹{selectedDoctor.fee}
                </Text>
              </View>

              {/* Payment Methods Selection */}
              <Text style={[styles.methodSectionHeader, { color: colors.textSecondary }]}>CHOOSE PAYMENT METHOD</Text>

              {/* Option 1: Instant UPI */}
              <TouchableOpacity
                style={[
                  styles.methodOptionCard,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC',
                    borderColor: isDark ? colors.border : '#E2E8F0',
                  },
                  selectedMethod === 'UPI' && (isDark ? { backgroundColor: '#1E3A5F', borderColor: '#38BDF8' } : styles.methodOptionCardSelected),
                ]}
                onPress={() => setSelectedMethod('UPI')}
                activeOpacity={0.8}
              >
                <View style={styles.methodRadioRow}>
                  <View style={[styles.radioCircle, { borderColor: colors.border }, selectedMethod === 'UPI' && styles.radioCircleActive]}>
                    {selectedMethod === 'UPI' && <View style={styles.radioInnerDot} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.methodTitle, { color: colors.textPrimary }]}>UPI Instant Payment</Text>
                    <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>Google Pay, PhonePe, Paytm, or UPI ID</Text>
                  </View>
                  <AppIcon name="shield-check" size={20} color={isDark ? colors.accent : colors.primary} />
                </View>

                {/* Sub UPI apps selection */}
                {selectedMethod === 'UPI' && (
                  <View style={[styles.upiAppsRow, { borderTopColor: colors.border }]}>
                    {(['GPAY', 'PHONEPE', 'PAYTM'] as const).map((app) => (
                      <TouchableOpacity
                        key={app}
                        style={[
                          styles.upiAppPill,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          selectedUpiApp === app && styles.upiAppPillActive,
                        ]}
                        onPress={() => setSelectedUpiApp(app)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.upiAppPillText,
                            { color: colors.textSecondary },
                            selectedUpiApp === app && styles.upiAppPillTextActive,
                          ]}
                        >
                          {app === 'GPAY' ? 'Google Pay' : app === 'PHONEPE' ? 'PhonePe' : 'Paytm'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </TouchableOpacity>

              {/* Option 2: Credit / Debit Card */}
              <TouchableOpacity
                style={[
                  styles.methodOptionCard,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC',
                    borderColor: isDark ? colors.border : '#E2E8F0',
                  },
                  selectedMethod === 'CARD' && (isDark ? { backgroundColor: '#1E3A5F', borderColor: '#38BDF8' } : styles.methodOptionCardSelected),
                ]}
                onPress={() => setSelectedMethod('CARD')}
                activeOpacity={0.8}
              >
                <View style={styles.methodRadioRow}>
                  <View style={[styles.radioCircle, { borderColor: colors.border }, selectedMethod === 'CARD' && styles.radioCircleActive]}>
                    {selectedMethod === 'CARD' && <View style={styles.radioInnerDot} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.methodTitle, { color: colors.textPrimary }]}>Credit / Debit Card</Text>
                    <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>Visa, MasterCard, RuPay, Amex</Text>
                  </View>
                  <AppIcon name="wallet-outline" size={20} color={isDark ? colors.accent : colors.primary} />
                </View>
              </TouchableOpacity>

              {/* Option 3: Net Banking */}
              <TouchableOpacity
                style={[
                  styles.methodOptionCard,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC',
                    borderColor: isDark ? colors.border : '#E2E8F0',
                  },
                  selectedMethod === 'NETBANKING' && (isDark ? { backgroundColor: '#1E3A5F', borderColor: '#38BDF8' } : styles.methodOptionCardSelected),
                ]}
                onPress={() => setSelectedMethod('NETBANKING')}
                activeOpacity={0.8}
              >
                <View style={styles.methodRadioRow}>
                  <View style={[styles.radioCircle, { borderColor: colors.border }, selectedMethod === 'NETBANKING' && styles.radioCircleActive]}>
                    {selectedMethod === 'NETBANKING' && <View style={styles.radioInnerDot} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.methodTitle, { color: colors.textPrimary }]}>Net Banking</Text>
                    <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>HDFC, SBI, ICICI, Axis & all major banks</Text>
                  </View>
                  <AppIcon name="hospital" size={20} color={isDark ? colors.accent : colors.primary} />
                </View>
              </TouchableOpacity>

              {/* Confirm and Pay Button */}
              <TouchableOpacity
                style={styles.confirmPayBtn}
                onPress={executeFinalBooking}
                activeOpacity={0.88}
              >
                <Text style={styles.confirmPayBtnText}>
                  Pay ₹{selectedDoctor.fee} Securely
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ========================================================
            SUCCESS CONFIRMATION MODAL (CLEAN TRANSPARENT VICTORY OVERLAY)
           ======================================================== */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowSuccessModal(false);
            if (onBookingSuccess) onBookingSuccess();
            else onBack();
          }}
        >
          {paymentOption === 'pay_now' ? (
            /* PAY NOW ONLINE: TRANSPARENT CELEBRATION OVERLAY (AMAZON / FLIPKART STYLE) */
            <View style={styles.transparentVictoryOverlay}>
              {/* TOP RIGHT CLOSE CROSS ICON */}
              <TouchableOpacity
                style={styles.victoryTopCloseBtn}
                onPress={() => {
                  setShowSuccessModal(false);
                  if (onBookingSuccess) onBookingSuccess();
                  else onBack();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <AppIcon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <ScrollView
                contentContainerStyle={styles.imageRefVictoryScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.imageRefHeaderTitle}>
                  Woohoo! You Won +4 Health Points as a Reward! 🎉
                </Text>

                <Animated.View style={[styles.imageRefGraphicContainer, { transform: [{ scale: trophyScaleAnim }] }]}>
                  <Image
                    source={IMAGES.rewardBlastGif}
                    fadeDuration={0}
                    style={styles.imageRefGiftBoxArt}
                    resizeMode="contain"
                  />
                </Animated.View>
              </ScrollView>
            </View>
          ) : (
            /* PAY LATER: CLEAN SIMPLE BOOKING CONFIRMED SUMMARY */
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.successModalCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 0,
                  },
                ]}
              >
                <View style={styles.successCheckCircle}>
                  <AppIcon name="check" size={32} color="#FFFFFF" />
                </View>

                <Text style={[styles.successModalTitle, { color: colors.textPrimary }]}>Appointment Confirmed!</Text>
                <Text style={[styles.successModalSubtitle, { color: colors.textSecondary }]}>
                  Your hospital visit has been successfully booked with {selectedDoctor.name}.
                </Text>

                {/* Token Display Box */}
                <View
                  style={[
                    styles.tokenBox,
                    isDark && { backgroundColor: '#064E3B', borderColor: '#059669' },
                  ]}
                >
                  <Text style={[styles.tokenLabel, isDark && { color: '#34D399' }]}>HOSPITAL VISIT TOKEN</Text>
                  <Text style={[styles.tokenValue, isDark && { color: '#6EE7B7' }]}>{generatedToken}</Text>
                  <Text style={[styles.tokenRoomText, isDark && { color: '#A7F3D0' }]}>OPD Block B • Consultation Room 104</Text>
                </View>

                {/* Quick Details */}
                <View
                  style={[
                    styles.successDetailsCard,
                    {
                      backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.successDetailRow}>
                    <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Patient:</Text>
                    <Text style={[styles.successDetailVal, { color: colors.textPrimary }]}>{selectedPatient.name} ({selectedPatient.relation})</Text>
                  </View>
                  <View style={styles.successDetailRow}>
                    <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Doctor:</Text>
                    <Text style={[styles.successDetailVal, { color: colors.textPrimary }]}>{selectedDoctor.name}</Text>
                  </View>
                  <View style={styles.successDetailRow}>
                    <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Slot:</Text>
                    <Text style={[styles.successDetailVal, { color: colors.textPrimary }]}>{selectedDate} at {selectedSlot}</Text>
                  </View>
                  <View style={styles.successDetailRow}>
                    <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Payment:</Text>
                    <Text style={[styles.successDetailVal, { color: colors.textPrimary }]}>Pay Later at Counter</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.successDoneBtn}
                  onPress={() => {
                    setShowSuccessModal(false);
                    if (onBookingSuccess) onBookingSuccess();
                    else onBack();
                  }}
                  activeOpacity={0.88}
                >
                  <Text style={styles.successDoneBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Modal>

        {/* ========================================================
            SLIDE-UP BOTTOM SHEET: DOCTOR PROFILE & REVIEWS MODAL
           ======================================================== */}
        <Modal
          visible={showDoctorModal && activeModalDoctor !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDoctorModal(false)}
        >
          <View style={styles.bottomSheetOverlay}>
            <TouchableOpacity
              style={styles.modalBackdropTap}
              activeOpacity={1}
              onPress={() => setShowDoctorModal(false)}
            />

            {activeModalDoctor && (
              <View
                style={[
                  styles.doctorBottomSheetCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderTopWidth: 1,
                  },
                ]}
              >
                {/* Drag handle */}
                <View style={[styles.dragHandleBar, { backgroundColor: colors.border }]} />

                {/* Sheet Header */}
                <View style={styles.bottomSheetHeaderRow}>
                  <Text style={[styles.bottomSheetTitleText, { color: colors.textPrimary }]}>
                    Doctor Profile & Reviews
                  </Text>
                  <TouchableOpacity
                    style={[styles.closeModalBtn, { backgroundColor: colors.surfaceVariant }]}
                    onPress={() => setShowDoctorModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textSecondary }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.72 }}>
                  {/* Doctor Profile Banner */}
                  <View style={[styles.doctorModalHero, { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF', borderColor: isDark ? colors.border : '#BAE6FD' }]}>
                    <View style={styles.doctorModalAvatarBox}>
                      <Image source={activeModalDoctor.avatar} style={styles.doctorModalAvatarImg} resizeMode="cover" />
                      <View style={styles.doctorVerifiedBadgeLarge}>
                        <AppIcon name="check" size={10} color="#FFFFFF" />
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.doctorModalName, { color: colors.textPrimary }]}>{activeModalDoctor.name}</Text>
                      <Text style={[styles.doctorModalSpec, { color: isDark ? colors.accent : colors.primary }]}>
                        {activeModalDoctor.specialty}
                      </Text>
                      <Text style={[styles.doctorModalQual, { color: colors.textSecondary }]}>
                        {activeModalDoctor.qualifications}
                      </Text>
                      <Text style={[styles.doctorModalUnit, { color: colors.textSecondary }]}>
                        📍 {activeModalDoctor.unit}
                      </Text>
                    </View>
                  </View>

                  {/* 4 Stats Grid */}
                  <View style={styles.doctorStatsGrid}>
                    <View style={[styles.doctorStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <AppIcon name="star" size={14} color="#EAB308" />
                        <Text style={[styles.doctorStatVal, { color: colors.textPrimary }]}>{activeModalDoctor.rating}</Text>
                      </View>
                      <Text style={[styles.doctorStatLabel, { color: colors.textSecondary }]}>Rating</Text>
                    </View>

                    <View style={[styles.doctorStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.doctorStatVal, { color: colors.textPrimary }]}>{activeModalDoctor.reviewsCount}</Text>
                      <Text style={[styles.doctorStatLabel, { color: colors.textSecondary }]}>Reviews</Text>
                    </View>

                    <View style={[styles.doctorStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.doctorStatVal, { color: isDark ? colors.accent : colors.primary }]}>₹{activeModalDoctor.fee}</Text>
                      <Text style={[styles.doctorStatLabel, { color: colors.textSecondary }]}>Fee</Text>
                    </View>

                    <View style={[styles.doctorStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.doctorStatVal, { color: colors.textPrimary }]}>{activeModalDoctor.experience.split(' ')[0]}</Text>
                      <Text style={[styles.doctorStatLabel, { color: colors.textSecondary }]}>Years Exp</Text>
                    </View>
                  </View>

                  {/* About Section */}
                  <View style={styles.modalSectionBox}>
                    <Text style={[styles.modalSectionTitle, { color: colors.textPrimary }]}>About Doctor</Text>
                    <Text style={[styles.modalAboutText, { color: colors.textSecondary }]}>{activeModalDoctor.about}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                      <Text style={[styles.langLabel, { color: colors.textSecondary }]}>Languages:</Text>
                      {activeModalDoctor.languages.map((lang) => (
                        <View key={lang} style={[styles.langBadge, { backgroundColor: colors.surfaceVariant }]}>
                          <Text style={[styles.langBadgeText, { color: colors.textPrimary }]}>{lang}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Patient Reviews Section */}
                  <View style={styles.modalSectionBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text style={[styles.modalSectionTitle, { color: colors.textPrimary }]}>Patient Reviews & Comments</Text>
                      <Text style={[styles.reviewBadgeText, { color: isDark ? colors.accent : colors.primary }]}>
                        {activeModalDoctor.reviews.length} Verified Reviews
                      </Text>
                    </View>

                    {activeModalDoctor.reviews.map((rev) => (
                      <View key={rev.id} style={[styles.reviewItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.reviewItemHeader}>
                          <View style={styles.reviewerAvatar}>
                            <Text style={styles.reviewerAvatarText}>{rev.patientName.charAt(0)}</Text>
                          </View>

                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[styles.reviewerName, { color: colors.textPrimary }]}>{rev.patientName}</Text>
                            <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{rev.date}</Text>
                          </View>

                          <View style={styles.reviewStarsRow}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <AppIcon
                                key={s}
                                name="star"
                                size={11}
                                color={s <= rev.rating ? '#EAB308' : '#CBD5E1'}
                              />
                            ))}
                          </View>
                        </View>

                        <Text style={[styles.reviewCommentText, { color: colors.textSecondary }]}>{rev.comment}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                {/* Bottom Select Action */}
                <TouchableOpacity
                  style={styles.modalSelectDoctorBtn}
                  onPress={() => {
                    setSelectedDoctorId(activeModalDoctor.id);
                    setShowDoctorModal(false);
                  }}
                  activeOpacity={0.88}
                >
                  <Text style={styles.modalSelectDoctorBtnText}>
                    Select {activeModalDoctor.name} & Continue
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>

        {/* ========================================================
            WORKING INTERACTIVE CALENDAR MODAL
           ======================================================== */}
        <Modal
          visible={showCalendarModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCalendarModal(false)}
        >
          <View style={styles.calendarModalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdropTap}
              activeOpacity={1}
              onPress={() => setShowCalendarModal(false)}
            />

            <View style={[styles.calendarModalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Modal Top Bar: Title & Top-Right Cross Close Icon */}
              <View style={styles.calendarModalTopBar}>
                <Text style={[styles.calendarModalTitleText, { color: colors.textPrimary }]}>Select Date</Text>
                <TouchableOpacity
                  style={[styles.closeCalTopBtn, { backgroundColor: colors.surfaceVariant }]}
                  onPress={() => setShowCalendarModal(false)}
                  activeOpacity={0.7}
                >
                  <AppIcon name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Calendar Header with Month & Year Direct Selector */}
              <View style={styles.calendarHeaderRow}>
                <TouchableOpacity
                  style={[styles.calNavBtn, { backgroundColor: colors.surfaceVariant }]}
                  onPress={() => {
                    const prev = new Date(calendarMonth);
                    prev.setMonth(prev.getMonth() - 1);
                    setCalendarMonth(prev);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? colors.accent : colors.primary }}>‹</Text>
                </TouchableOpacity>

                {/* Clickable Month & Year Title - opens quick picker */}
                <TouchableOpacity
                  style={[styles.monthYearClickableBtn, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight }]}
                  onPress={() => setShowMonthYearPicker(!showMonthYearPicker)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.calendarMonthTitle, { color: isDark ? colors.accent : colors.primary }]}>
                    {calendarMonth.toLocaleString('default', { month: 'long' })} {calendarMonth.getFullYear()} ▾
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.calNavBtn, { backgroundColor: colors.surfaceVariant }]}
                  onPress={() => {
                    const next = new Date(calendarMonth);
                    next.setMonth(next.getMonth() + 1);
                    setCalendarMonth(next);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? colors.accent : colors.primary }}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Month & Year Direct Picker Overlay Box */}
              {showMonthYearPicker && (
                <View style={[styles.monthYearPickerBox, { backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC', borderColor: colors.border }]}>
                  <Text style={[styles.pickerSectionHeader, { color: colors.textSecondary }]}>Select Year:</Text>
                  <View style={styles.yearsRowContainer}>
                    {[2026, 2027, 2028, 2029, 2030].map((yr) => {
                      const isSelectedYr = calendarMonth.getFullYear() === yr;
                      return (
                        <TouchableOpacity
                          key={yr}
                          style={[
                            styles.yearPill,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            isSelectedYr && { backgroundColor: colors.primary, borderColor: colors.primary },
                          ]}
                          onPress={() => {
                            const updated = new Date(calendarMonth);
                            updated.setFullYear(yr);
                            setCalendarMonth(updated);
                          }}
                        >
                          <Text style={[styles.yearPillText, { color: colors.textPrimary }, isSelectedYr && { color: '#FFFFFF', fontWeight: '800' }]}>
                            {yr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={[styles.pickerSectionHeader, { color: colors.textSecondary, marginTop: 10 }]}>Select Month:</Text>
                  <View style={styles.monthsGridContainer}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((mName, mIdx) => {
                      const isSelectedM = calendarMonth.getMonth() === mIdx;
                      return (
                        <TouchableOpacity
                          key={mName}
                          style={[
                            styles.monthPill,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            isSelectedM && { backgroundColor: colors.primary, borderColor: colors.primary },
                          ]}
                          onPress={() => {
                            const updated = new Date(calendarMonth);
                            updated.setMonth(mIdx);
                            setCalendarMonth(updated);
                            setShowMonthYearPicker(false);
                          }}
                        >
                          <Text style={[styles.monthPillText, { color: colors.textPrimary }, isSelectedM && { color: '#FFFFFF', fontWeight: '800' }]}>
                            {mName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Day Name Headers */}
              <View style={styles.calendarDaysHeaderRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={[styles.calendarDayHeaderCell, { color: colors.textSecondary }]}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar Days Grid */}
              <View style={styles.calendarGrid}>
                {(() => {
                  const year = calendarMonth.getFullYear();
                  const month = calendarMonth.getMonth();
                  const firstDayIndex = new Date(year, month, 1).getDay();
                  const totalDays = new Date(year, month + 1, 0).getDate();

                  const cells = [];
                  // Empty offset cells
                  for (let i = 0; i < firstDayIndex; i++) {
                    cells.push(<View key={`empty-${i}`} style={styles.calendarDayCellEmpty} />);
                  }

                  // Day cells
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                  for (let d = 1; d <= totalDays; d++) {
                    const todayRef = new Date(2026, 8, 17);
                    todayRef.setHours(0, 0, 0, 0);
                    const dateObj = new Date(year, month, d);
                    dateObj.setHours(0, 0, 0, 0);
                    const isPast = dateObj.getTime() < todayRef.getTime();

                    const dd = String(d).padStart(2, '0');
                    const mm = String(month + 1).padStart(2, '0');
                    const dateStr = `${dd}-${mm}-${year}`;
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === '17-09-2026';

                    cells.push(
                      <TouchableOpacity
                        key={`day-${d}`}
                        disabled={isPast}
                        style={[
                          styles.calendarDayCell,
                          { backgroundColor: colors.surfaceVariant },
                          isSelected && styles.calendarDayCellSelected,
                          isToday && !isSelected && styles.calendarDayCellToday,
                          isPast && { opacity: 0.35, backgroundColor: isDark ? colors.surfaceVariant : '#F1F5F9' },
                        ]}
                        onPress={() => {
                          if (!isPast) {
                            setSelectedDate(dateStr);
                            setSelectedDay(fullDayNames[dateObj.getDay()]);
                            setRefDate(dateObj); // Updates 1-week Sunday to Saturday strip!
                            setShowCalendarModal(false);
                          }
                        }}
                        activeOpacity={isPast ? 1 : 0.7}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            { color: colors.textPrimary },
                            isSelected && styles.calendarDayTextSelected,
                            isToday && !isSelected && { color: isDark ? colors.accent : colors.primary, fontWeight: '800' },
                            isPast && { color: isDark ? '#64748B' : '#94A3B8' },
                          ]}
                        >
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                  return cells;
                })()}
              </View>
            </View>
          </View>
        </Modal>

        {/* Universal Loader */}
        <UniversalLoader
          visible={loaderState.visible}
          message={loaderState.message}
          subtitle={loaderState.subtitle}
        />
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

  // AMBIENT BACKGROUND
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
    top: '40%',
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#E0F2FE',
    opacity: 0.45,
  },
  ambientWaveImage: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    width: '100%',
    height: 280,
    opacity: 0.2,
  },

  // 1. TOP HEADER BAR (Curvy bottom line, Blue centered title)
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
    width: 88,
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
  headerRightGroup: {
    alignItems: 'flex-end',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  stepBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0083B0',
  },

  // 4-SEGMENT PROGRESS BAR
  progressTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 9,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: '#0083B0',
  },
  progressSegmentInactive: {
    backgroundColor: '#E2E8F0',
  },

  // SCROLL CONTENT
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // STEP HEADER
  stepHeader: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  stepSubTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0083B0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  stepMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  stepDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },

  // STEP 1: PATIENTS LIST
  patientListContainer: {
    gap: 12,
    marginBottom: 16,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  patientCardSelected: {
    borderColor: '#0083B0',
    backgroundColor: '#F0F9FF',
  },
  patientAvatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 14,
  },
  patientAvatarImg: {
    width: 52,
    height: 52,
  },
  patientInfoBox: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  relationBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  relationBadgeSelected: {
    backgroundColor: '#DEF0FD',
  },
  relationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  relationBadgeTextSelected: {
    color: '#0083B0',
  },
  patientMetaText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: '#0083B0',
    backgroundColor: '#FFFFFF',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0083B0',
  },
  addMemberHintBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E0F2FE',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  addMemberHintText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 17,
  },

  // STEP 2: DEPARTMENT GRID
  deptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  deptCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  deptCardSelected: {
    borderColor: '#0083B0',
    backgroundColor: '#F0F9FF',
  },
  deptIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  deptIconBoxSelected: {
    backgroundColor: '#0083B0',
  },
  deptNameText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  deptNameTextSelected: {
    color: '#0083B0',
  },
  deptSubText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  deptCountPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginTop: 8,
  },
  deptCountPillSelected: {
    backgroundColor: '#DEF0FD',
  },
  deptCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  deptCountTextSelected: {
    color: '#0083B0',
  },

  // STEP 3: SLOT & DOCTOR (MATCHING REFERENCE IMAGE 1)
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slotHeadingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
  },
  slotSubHeadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0083B0',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  // 3 DOCTORS LIST
  doctorsListContainer: {
    gap: 10,
    marginBottom: 10,
  },
  doctorSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  doctorSelectCardActive: {
    borderColor: '#0083B0',
    backgroundColor: '#F0F9FF',
    shadowColor: '#0083B0',
    shadowOpacity: 0.1,
  },
  doctorAvatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
    overflow: 'visible',
  },
  doctorAvatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  doctorVerifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  doctorInfoCornerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0083B0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  doctorDetailsCol: {
    flex: 1,
  },
  doctorNameRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorNameText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  doctorNameTextActive: {
    color: '#0083B0',
  },
  doctorRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  doctorRatingText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  doctorReviewsText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  doctorSpecText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  doctorUnitText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  doctorPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  doctorFeeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  doctorFeeBadgeActive: {
    backgroundColor: '#0083B0',
  },
  doctorFeeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0083B0',
  },
  doctorFeeTextActive: {
    color: '#FFFFFF',
  },
  doctorExpBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  doctorExpText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },

  // DATE STRIP PICKER
  dateStripScrollContent: {
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  dateStripPill: {
    flex: 1,
    minWidth: 40,
    paddingVertical: 9,
    paddingHorizontal: 2,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  dateStripPillActive: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  dateTodayBadge: {
    position: 'absolute',
    top: -6,
    backgroundColor: '#DEF0FD',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  dateTodayBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  dateTodayText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0083B0',
  },
  dateTodayTextActive: {
    color: '#0083B0',
  },
  dateStripDayName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  dateStripDayNum: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 2,
  },
  dateStripMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  dateStripTextActive: {
    color: '#FFFFFF',
  },

  // Date Picker Card
  datePickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 6,
  },
  datePickerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  dayLabelText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
    marginLeft: 2,
  },

  // Slots Grid
  slotsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  slotPill: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  slotPillSelected: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
  },
  slotPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  slotPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // STEP 4: PAYMENT DETAILS (REFERENCE IMAGE 2)
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValueBold: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryValueAccent: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0083B0',
  },
  payerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  payerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0083B0',
  },
  tariffValueText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // OUTSTANDING DUES CARD (LIGHT THEMED ACCORDING TO APP)
  duesCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  duesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  duesHeadingText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#92400E',
  },
  duesList: {
    gap: 6,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  duesItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  duesItemName: {
    fontSize: 12.5,
    color: '#4B5563',
    fontWeight: '500',
  },
  duesItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  duesActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  duesDismissBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duesDismissText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  duesPayBtn: {
    flex: 1,
    backgroundColor: '#0083B0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duesPayText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // PAYMENT OPTION CARDS
  paymentOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  paymentOptionCardSelected: {
    borderColor: '#0083B0',
    backgroundColor: '#F0F9FF',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },

  // ACTION BUTTONS
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0083B0',
    borderRadius: 16,
    paddingVertical: 15,
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  confirmBookingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0083B0',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 14,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBookingButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  successCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  successModalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  tokenBox: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.8,
  },
  tokenValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#15803D',
    marginTop: 4,
    letterSpacing: 1,
  },
  tokenRoomText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#166534',
    marginTop: 4,
  },
  successDetailsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  successDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  successDetailVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  successDoneBtn: {
    width: '100%',
    backgroundColor: '#0083B0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  successDoneBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // 1-WEEK STRIP STYLES
  dateStripRowWithArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginVertical: 8,
  },
  weekStripGridContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  stripNavArrowBtn: {
    width: 32,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripNavArrowText: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  dateStripPillDisabled: {
    opacity: 0.38,
  },
  datePastBadge: {
    position: 'absolute',
    top: -6,
    backgroundColor: '#94A3B8',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  datePastBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateStripTextDisabled: {
    opacity: 0.6,
  },
  weekNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRangeText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  viewProfileBtn: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  viewProfileBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  calendarIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // SLOT CATEGORY STYLES
  slotCategoryBlock: {
    marginBottom: 12,
  },
  slotCategoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  slotCategoryHeaderIcon: {
    fontSize: 14,
  },
  slotCategoryTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  slotCategorySubText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 'auto',
  },

  // DOCTOR BOTTOM SHEET MODAL STYLES
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalBackdropTap: {
    flex: 1,
  },
  doctorBottomSheetCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  bottomSheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  bottomSheetTitleText: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeModalBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorModalHero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    gap: 14,
  },
  doctorModalAvatarBox: {
    position: 'relative',
  },
  doctorModalAvatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  doctorVerifiedBadgeLarge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doctorModalName: {
    fontSize: 17,
    fontWeight: '800',
  },
  doctorModalSpec: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  doctorModalQual: {
    fontSize: 12,
    marginTop: 1,
  },
  doctorModalUnit: {
    fontSize: 11.5,
    marginTop: 3,
    fontWeight: '500',
  },
  doctorStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  doctorStatCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorStatVal: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  doctorStatLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  modalSectionBox: {
    marginBottom: 14,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalAboutText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  langLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  langBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reviewBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  reviewItemCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0083B0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '800',
  },
  reviewDate: {
    fontSize: 10.5,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCommentText: {
    fontSize: 12,
    lineHeight: 16,
  },
  modalSelectDoctorBtn: {
    backgroundColor: '#0083B0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalSelectDoctorBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // CALENDAR MODAL STYLES
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  calendarModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarModalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarModalTitleText: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeCalTopBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  calendarDaysHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarDayHeaderCell: {
    width: '14%',
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  calendarDayCellEmpty: {
    width: '14%',
    height: 40,
  },
  calendarDayCell: {
    width: '14%',
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  calendarDayCellSelected: {
    backgroundColor: '#0083B0',
  },
  calendarDayCellToday: {
    borderWidth: 1.5,
    borderColor: '#0083B0',
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '700',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  monthYearClickableBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  monthYearPickerBox: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  pickerSectionHeader: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  yearsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  yearPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  monthsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthPill: {
    width: '23%',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  closeCalBtn: {
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // PREMIUM CELEBRATION REWARDS OVERLAY (FOR PAY NOW ONLINE ONLY)
  darkGradientVictoryOverlay: {
    flex: 1,
    backgroundColor: '#0A2540',
  },
  transparentVictoryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.94)',
    justifyContent: 'center',
    paddingTop: 40,
  },
  victoryTopCloseBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  imageRefVictoryScrollContent: {
    paddingHorizontal: 0,
    paddingTop: 70,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  imageRefHeaderTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 16,
    letterSpacing: -0.3,
  },
  imageRefGraphicContainer: {
    width: '100%',
    height: 540,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 0,
  },
  imageRefGiftBoxArt: {
    width: '100%',
    height: '100%',
  },
  floatingCoinWrap1: {
    position: 'absolute',
    top: 10,
    left: 20,
  },
  floatingCoinWrap2: {
    position: 'absolute',
    top: 20,
    right: 25,
  },
  floatingCoinWrap3: {
    position: 'absolute',
    bottom: 25,
    right: 15,
  },
  coinEmoji: {
    fontSize: 26,
  },
  imageRefDetailsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    width: '100%',
    marginVertical: 16,
  },
  victoryCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageRefRefText: {
    fontSize: 13.5,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  imageRefMetaText: {
    fontSize: 12.5,
    color: '#CBD5E1',
    marginBottom: 6,
  },
  imageRefOrangeCloseBtn: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    width: '100%',
    marginTop: 10,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  imageRefOrangeCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  rewardSummaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F2942',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  rewardSummaryBannerText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#38BDF8',
    flex: 1,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F253E',
  },
  modalHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paySummaryBox: {
    backgroundColor: '#DEF0FD',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  paySummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    textAlign: 'center',
  },
  paySummaryAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0083B0',
    marginTop: 4,
  },
  methodSectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  methodOptionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },
  methodOptionCardSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0083B0',
  },
  methodRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#0083B0',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0083B0',
  },
  methodTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F253E',
  },
  methodSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  upiAppsRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  upiAppPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  upiAppPillActive: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
  },
  upiAppPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  upiAppPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmPayBtn: {
    backgroundColor: '#0083B0',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmPayBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  // DOCTOR SEARCH STYLES
  searchDoctorWrapper: {
    marginBottom: 16,
  },
  searchDoctorLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  searchDoctorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchDoctorTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  searchResultsCardContainer: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 18,
  },
  searchResultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchResultsTitleText: {
    fontSize: 14,
    fontWeight: '800',
  },
  searchEmptyStateBox: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchEmptyStateText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  searchResultItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchResultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  searchResultDoctorName: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  searchResultSpecText: {
    fontSize: 12,
    marginTop: 2,
  },
  searchResultUnitText: {
    fontSize: 11,
    marginTop: 2,
  },
  searchResultFeeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  searchResultFeeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  selectSlotBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectSlotBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchedDoctorNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  viewAllDoctorsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewAllDoctorsBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default BookVisitScreen;
