import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  BackHandler,
  useWindowDimensions,
  Animated,
  Modal,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';

interface BookTestScreenProps {
  userSession: UserSession;
  onBack: () => void;
  onOpenVisits?: () => void;
  onAddHealthPoints?: (points: number) => void;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  price: number;
  mrp: number;
  savings: number;
  savingsPct: number;
  rewardPoints: number;
  fastingNote?: string;
  category: string;
  isPrescribed?: boolean;
}

export interface PrescriptionGroup {
  id: string;
  doctorName: string;
  visitRef: string;
  date: string;
  department: string;
  summaryNotes: string;
  tests: DiagnosticTest[];
}

export interface SelfBookedDiagnostic {
  bookingId: string;
  testName: string;
  date: string;
  timeSlot: string;
  amount: number;
  status: 'Pending Lab Visit' | 'Sample Processing' | 'Completed';
  location: string;
  instructions: string;
}

const DOCTOR_PRESCRIPTIONS: PrescriptionGroup[] = [
  {
    id: 'rx-1',
    doctorName: 'Dr. Rajesh Sharma (MD Cardiology)',
    visitRef: 'VIS-2026-8841',
    date: '10 Sep 2026',
    department: 'Cardiology & Vascular OPD',
    summaryNotes: 'Quarterly diabetic & cardiac risk evaluation following OPD consultation.',
    tests: [
      {
        id: 'gtt',
        name: 'Glucose Tolerance Test (GTT)',
        price: 70.0,
        mrp: 100.0,
        savings: 30.0,
        savingsPct: 30.0,
        rewardPoints: 10,
        fastingNote: 'Fasting required: 8-12 hours, water permitted.',
        category: 'doctor_prescription',
        isPrescribed: true,
      },
      {
        id: 'hba1c',
        name: 'HbA1c, Glycated Hemoglobin',
        price: 280.0,
        mrp: 400.0,
        savings: 120.0,
        savingsPct: 30.0,
        rewardPoints: 35,
        fastingNote: 'No fasting required. Any time testing.',
        category: 'doctor_prescription',
        isPrescribed: true,
      },
      {
        id: 'fbs',
        name: 'Fasting Blood Sugar Test (FBS)',
        price: 777.0,
        mrp: 1110.0,
        savings: 333.0,
        savingsPct: 30.0,
        rewardPoints: 80,
        fastingNote: 'Strict 9-12 hours overnight fasting required.',
        category: 'doctor_prescription',
        isPrescribed: true,
      },
      {
        id: 'lipid_profile',
        name: 'Lipid Profile (Full Spectrum)',
        price: 490.0,
        mrp: 700.0,
        savings: 210.0,
        savingsPct: 30.0,
        rewardPoints: 50,
        fastingNote: '10-12 hours fasting required.',
        category: 'doctor_prescription',
        isPrescribed: true,
      },
      {
        id: 'lft',
        name: 'Liver Function Test (LFT)',
        price: 385.0,
        mrp: 550.0,
        savings: 165.0,
        savingsPct: 30.0,
        rewardPoints: 40,
        fastingNote: '8 hours fasting recommended.',
        category: 'doctor_prescription',
        isPrescribed: true,
      },
    ],
  },
  {
    id: 'rx-2',
    doctorName: 'Dr. Priya Nair (MD Endocrinology)',
    visitRef: 'VIS-2026-7419',
    date: '05 Sep 2026',
    department: 'Metabolic & Thyroid Care OPD',
    summaryNotes: 'Thyroid hormone balance screening & renal health check.',
    tests: [
      {
        id: 'thyroid_profile',
        name: 'Thyroid Profile Total (T3, T4, TSH)',
        price: 420.0,
        mrp: 600.0,
        savings: 180.0,
        savingsPct: 30.0,
        rewardPoints: 45,
        fastingNote: 'Fasting 8 hrs recommended.',
        category: 'doctor_prescription',
        isPrescribed: true,
      },
      {
        id: 'kft',
        name: 'Kidney Function Test (KFT / Renal)',
        price: 455.0,
        mrp: 650.0,
        savings: 195.0,
        savingsPct: 30.0,
        rewardPoints: 45,
        fastingNote: 'Overnight fasting required.',
        category: 'doctor_prescription',
        isPrescribed: true,
      },
      {
        id: 'urine_sugar',
        name: 'Urine Sugar And Ketone Panel',
        price: 196.0,
        mrp: 280.0,
        savings: 84.0,
        savingsPct: 30.0,
        rewardPoints: 20,
        fastingNote: 'First morning sample recommended at lab.',
        category: 'doctor_prescription',
        isPrescribed: true,
      },
    ],
  },
];

const PENDING_SELF_BOOKINGS: SelfBookedDiagnostic[] = [
  {
    bookingId: 'SELF-2026-7892',
    testName: 'Vitamin D3 & B12 Combo Panel',
    date: 'Sep 19, 2026',
    timeSlot: '10:30 AM',
    amount: 560.0,
    status: 'Pending Lab Visit',
    location: 'GMCH Central Diagnostic Lab (Ground Floor, OPD Wing B)',
    instructions: 'Report 10 minutes prior to slot time with digital token.',
  },
  {
    bookingId: 'SELF-2026-6410',
    testName: 'Thyroid Profile Total (T3, T4, TSH)',
    date: 'Sep 22, 2026',
    timeSlot: '11:15 AM',
    amount: 420.0,
    status: 'Pending Lab Visit',
    location: 'GMCH Central Diagnostic Lab (Ground Floor, OPD Wing B)',
    instructions: 'Morning fasting recommended. Bring national ID for verification.',
  },
];

const SELF_PRESCRIBED_CATEGORIES = [
  { id: 'first_aid', title: 'First Aid & Diagnostic Supplies', icon: 'medkit' as const, count: '12 Tests' },
  { id: 'personal_care', title: 'Personal Care & Preventive Health', icon: 'heart' as const, count: '18 Tests' },
  { id: 'medical_devices', title: 'Medical Devices & Blood Monitors', icon: 'pulse' as const, count: '8 Tests' },
  { id: 'vitamins', title: 'Vitamins & Deficiency Panels', icon: 'pill' as const, count: '24 Tests' },
  { id: 'diabetic_care', title: 'Diabetic & Sugar Care', icon: 'flask' as const, count: '15 Tests' },
  { id: 'full_body', title: 'Full Body Health Packages', icon: 'shield-check' as const, count: '6 Packages' },
];

const CATEGORY_CUSTOM_TESTS: DiagnosticTest[] = [
  {
    id: 'vit_d3_b12',
    name: 'Vitamin D3 & B12 Combo Panel',
    price: 560.0,
    mrp: 800.0,
    savings: 240.0,
    savingsPct: 30.0,
    rewardPoints: 60,
    fastingNote: 'No fasting required.',
    category: 'vitamins',
  },
  {
    id: 'cbc_esr',
    name: 'Complete Blood Count (CBC with ESR)',
    price: 210.0,
    mrp: 300.0,
    savings: 90.0,
    savingsPct: 30.0,
    rewardPoints: 20,
    fastingNote: 'No fasting required.',
    category: 'first_aid',
  },
  {
    id: 'executive_package',
    name: 'Executive Full Body Screening Package',
    price: 1399.0,
    mrp: 1999.0,
    savings: 600.0,
    savingsPct: 30.0,
    rewardPoints: 150,
    fastingNote: '10-12 hours fasting required.',
    category: 'full_body',
  },
];

const TIME_SLOTS = [
  '09:00 AM',
  '09:45 AM',
  '10:30 AM',
  '11:15 AM',
  '12:00 PM',
  '02:00 PM',
  '03:15 PM',
  '04:30 PM',
  '05:45 PM',
  '07:00 PM',
];

export const BookTestScreen: React.FC<BookTestScreenProps> = ({
  userSession,
  onBack,
  onOpenVisits,
  onAddHealthPoints,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  const [activeTab, setActiveTab] = useState<'doctor_prescription' | 'self_prescription'>(
    'doctor_prescription'
  );

  const [prescriptionSubStep, setPrescriptionSubStep] = useState<
    'prescription_list' | 'prescribed_tests_booking'
  >('prescription_list');

  const [activePrescription, setActivePrescription] = useState<PrescriptionGroup | null>(null);
  const [expandedPrescriptionIds, setExpandedPrescriptionIds] = useState<string[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [showBookCustomModal, setShowBookCustomModal] = useState(false);

  const [bookingStep, setBookingStep] = useState<'browse' | 'slots' | 'bill_summary' | 'confirmation'>(
    'browse'
  );
  const [testSlots, setTestSlots] = useState<Record<string, string>>({});
  const [paymentMode, setPaymentMode] = useState<'pay_now' | 'pay_later'>('pay_now');

  // Animation refs
  const coinFloatAnim = useRef(new Animated.Value(0)).current;
  const trophyScaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (bookingStep === 'confirmation' && paymentMode === 'pay_now') {
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
    }
  }, [bookingStep, paymentMode]);

  useEffect(() => {
    const onHardwareBackPress = () => {
      if (showBookCustomModal) {
        setShowBookCustomModal(false);
        return true;
      }
      if (bookingStep === 'confirmation') {
        onBack();
        return true;
      }
      if (bookingStep === 'bill_summary') {
        setBookingStep('slots');
        return true;
      }
      if (bookingStep === 'slots') {
        setBookingStep('browse');
        return true;
      }
      if (prescriptionSubStep === 'prescribed_tests_booking') {
        setPrescriptionSubStep('prescription_list');
        setActivePrescription(null);
        return true;
      }
      if (selectedCategory !== null) {
        setSelectedCategory(null);
        return true;
      }
      onBack();
      return true;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => backSub.remove();
  }, [bookingStep, prescriptionSubStep, selectedCategory, showBookCustomModal]);

  const togglePrescriptionExpand = (id: string) => {
    setExpandedPrescriptionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenPrescriptionPage = (rx: PrescriptionGroup) => {
    setActivePrescription(rx);
    // Pre-select tests from this prescription that are not already booked
    const alreadyBookedNames = PENDING_SELF_BOOKINGS.map((b) => b.testName.toLowerCase());
    const availableTestIds = rx.tests
      .filter((t) => !alreadyBookedNames.includes(t.name.toLowerCase()))
      .map((t) => t.id);

    setSelectedTests(availableTestIds);
    setPrescriptionSubStep('prescribed_tests_booking');
  };

  const toggleTestSelection = (testId: string) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const allAvailableTestsList = [
    ...(activePrescription ? activePrescription.tests : DOCTOR_PRESCRIPTIONS.flatMap((p) => p.tests)),
    ...CATEGORY_CUSTOM_TESTS,
  ];

  const selectedTestObjects = allAvailableTestsList.filter((t) => selectedTests.includes(t.id));

  const totalMRP = selectedTestObjects.reduce((acc, curr) => acc + curr.mrp, 0);
  const totalPrice = selectedTestObjects.reduce((acc, curr) => acc + curr.price, 0);
  const totalSavings = totalMRP - totalPrice;
  const totalRewardPoints = selectedTestObjects.reduce((acc, curr) => acc + curr.rewardPoints, 0);

  const handleProceedToSlots = () => {
    if (selectedTests.length === 0) {
      Alert.alert('No Tests Selected', 'Please select at least 1 diagnostic test to proceed.');
      return;
    }

    const initialSlots: Record<string, string> = {};
    selectedTestObjects.forEach((test, idx) => {
      const slotIndex = idx % TIME_SLOTS.length;
      initialSlots[test.id] = TIME_SLOTS[slotIndex];
    });
    setTestSlots(initialSlots);
    setShowBookCustomModal(false);
    setBookingStep('slots');
  };

  const handleSlotSelectForTest = (testId: string, slot: string) => {
    const existingTestId = Object.keys(testSlots).find(
      (id) => id !== testId && testSlots[id] === slot
    );

    if (existingTestId) {
      const conflictingTest = allAvailableTestsList.find((t) => t.id === existingTestId);
      Alert.alert(
        'Slot Already Selected',
        `The slot ${slot} is already assigned to ${conflictingTest?.name || 'another test'}. Please select a different timing slot for this test.`
      );
      return;
    }

    setTestSlots((prev) => ({
      ...prev,
      [testId]: slot,
    }));
  };

  const handleProceedToBilling = () => {
    const unassigned = selectedTestObjects.find((t) => !testSlots[t.id]);
    if (unassigned) {
      Alert.alert(
        'Slot Selection Required',
        `Please select a lab visit slot timing for ${unassigned.name}.`
      );
      return;
    }
    setBookingStep('bill_summary');
  };

  const handleFinalPaymentSubmit = () => {
    if (paymentMode === 'pay_now' && onAddHealthPoints) {
      // Award Health Points only when user pays now online!
      const earned = totalRewardPoints + 20;
      onAddHealthPoints(earned);
    }
    setBookingStep('confirmation');
  };

  // Filter out tests that are already booked in PENDING_SELF_BOOKINGS
  const alreadyBookedTestNames = PENDING_SELF_BOOKINGS.map((b) => b.testName.toLowerCase());

  const currentPrescriptionTests = activePrescription
    ? activePrescription.tests.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !alreadyBookedTestNames.includes(t.name.toLowerCase())
      )
    : [];

  const filteredSelfTests = CATEGORY_CUSTOM_TESTS.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory ? t.category === selectedCategory : true;
    const isAlreadyBooked = alreadyBookedTestNames.includes(t.name.toLowerCase());
    return matchesSearch && matchesCat && !isAlreadyBooked;
  });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        {/* APP-THEMED AMBIENT PARENT BACKGROUND LAYER */}
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
              paddingHorizontal: isTablet ? 24 : 16,
              paddingTop: isTablet ? 14 : 10,
              paddingBottom: isTablet ? 14 : 12,
            },
          ]}
        >
          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]}>
            <TouchableOpacity
              onPress={() => {
                if (bookingStep === 'confirmation') {
                  onBack();
                } else if (bookingStep === 'bill_summary') {
                  setBookingStep('slots');
                } else if (bookingStep === 'slots') {
                  setBookingStep('browse');
                } else if (prescriptionSubStep === 'prescribed_tests_booking') {
                  setPrescriptionSubStep('prescription_list');
                  setActivePrescription(null);
                } else {
                  onBack();
                }
              }}
              style={[
                styles.headerBackBtn,
                isDark && { backgroundColor: colors.borderLight },
                isTablet && { width: 42, height: 42, borderRadius: 21 },
              ]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppIcon name="back" size={20} color="#0083B0" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, isTablet && { fontSize: 24 }]} numberOfLines={1}>
              {bookingStep === 'browse'
                ? prescriptionSubStep === 'prescribed_tests_booking' && activePrescription
                  ? `${activePrescription.doctorName.split(' ')[1]}'s Prescribed Tests`
                  : 'Book Test'
                : bookingStep === 'slots'
                ? 'Select Lab Visit Slots'
                : bookingStep === 'bill_summary'
                ? 'Invoice & Bill Summary'
                : 'Booking Confirmed'}
            </Text>
          </View>

          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
        </View>

        {/* STEP 1: BROWSE & VIEW BOOKINGS */}
        {bookingStep === 'browse' && (
          <View style={styles.stepContainer}>
            {/* ONLY SHOW TOP TOGGLE TABS WHEN ON MAIN PRESCRIPTION LIST */}
            {prescriptionSubStep === 'prescription_list' && (
              <View style={[styles.filterTabsContainer, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                <TouchableOpacity
                  style={[
                    styles.filterTab,
                    activeTab === 'doctor_prescription' && styles.filterTabActive,
                  ]}
                  onPress={() => setActiveTab('doctor_prescription')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      activeTab === 'doctor_prescription' && styles.filterTabTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    Doctor Prescribed ({DOCTOR_PRESCRIPTIONS.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterTab,
                    activeTab === 'self_prescription' && styles.filterTabActive,
                  ]}
                  onPress={() => setActiveTab('self_prescription')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      activeTab === 'self_prescription' && styles.filterTabTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    Self Prescription ({PENDING_SELF_BOOKINGS.length})
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TAB 1, SUB-STEP 1: DOCTOR PRESCRIPTIONS LIST (2 PRESCRIPTION CARDS) */}
            {activeTab === 'doctor_prescription' && prescriptionSubStep === 'prescription_list' && (
              <ScrollView
                contentContainerStyle={[styles.scrollListContent, { paddingBottom: 110 }]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                  Available Doctor Prescriptions ({DOCTOR_PRESCRIPTIONS.length})
                </Text>

                {DOCTOR_PRESCRIPTIONS.map((rx) => {
                  const isExpanded = expandedPrescriptionIds.includes(rx.id);
                  return (
                    <View
                      key={rx.id}
                      style={[
                        styles.prescriptionCardItem,
                        {
                          backgroundColor: colors.surface,
                          borderColor: isDark ? colors.border : '#CBD5E1',
                        },
                      ]}
                    >
                      <View style={styles.prescriptionHeaderRow}>
                        <View style={styles.heroDocIconCircle}>
                          <AppIcon name="user-check" size={22} color="#0083B0" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.heroDocTitle, { color: colors.textPrimary }]}>
                            {rx.doctorName}
                          </Text>
                          <Text style={[styles.heroDocMeta, { color: colors.textSecondary }]}>
                            Ref: <Text style={{ fontWeight: '700', color: '#0083B0' }}>{rx.visitRef}</Text> • {rx.date}
                          </Text>
                        </View>

                        {/* CHEVRON ACCORDION TOGGLE ONLY (NO TEXT) */}
                        <TouchableOpacity
                          style={styles.chevronOnlyToggle}
                          onPress={() => togglePrescriptionExpand(rx.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <AppIcon
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={22}
                            color="#0083B0"
                          />
                        </TouchableOpacity>
                      </View>

                      {/* SUMMARY NOTES (DEFAULT COLLAPSED) */}
                      {isExpanded && (
                        <View style={styles.prescriptionExpandContent}>
                          <View style={styles.divider} />
                          <Text style={[styles.prescriptionSummaryLabel, { color: colors.textSecondary }]}>
                            Department: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{rx.department}</Text>
                          </Text>
                          <Text style={[styles.prescriptionSummaryNotesText, { color: colors.textPrimary }]}>
                            💡 {rx.summaryNotes}
                          </Text>
                          <Text style={[styles.prescribedCountText, { color: '#0083B0' }]}>
                            📋 {rx.tests.length} Diagnostic Tests Prescribed
                          </Text>
                        </View>
                      )}

                      <View style={styles.divider} />

                      {/* PROMINENT "BOOK PRESCRIBED TESTS NOW" BUTTON */}
                      <TouchableOpacity
                        style={styles.heroBookNowBtn}
                        onPress={() => handleOpenPrescriptionPage(rx)}
                        activeOpacity={0.88}
                      >
                        <Text style={styles.heroBookNowBtnText}>
                          Book Prescribed Tests Now ({rx.tests.length})
                        </Text>
                        <AppIcon name="arrow-right" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {/* TAB 1, SUB-STEP 2: DEDICATED PRESCRIPTION BOOKING PAGE (NO TOP TOGGLE TABS) */}
            {activeTab === 'doctor_prescription' && prescriptionSubStep === 'prescribed_tests_booking' && activePrescription && (
              <ScrollView
                contentContainerStyle={[styles.scrollListContent, { paddingBottom: 110 }]}
                showsVerticalScrollIndicator={false}
              >
                {/* ACTIVE PRESCRIPTION HEADER CARD */}
                <View
                  style={[
                    styles.activeRxBannerCard,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#E6F4FA',
                      borderColor: '#0083B0',
                    },
                  ]}
                >
                  <View style={styles.activeRxHeaderRow}>
                    <AppIcon name="user-check" size={22} color="#0083B0" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.activeRxDocName, { color: isDark ? '#F1F5F9' : '#004F6E' }]}>
                        {activePrescription.doctorName}
                      </Text>
                      <Text style={[styles.activeRxMetaText, { color: isDark ? '#CBD5E1' : '#334155' }]}>
                        Ref: {activePrescription.visitRef} • {activePrescription.department}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* SEARCH BOX */}
                <View style={[styles.searchBoxContainer, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                  <AppIcon name="search" size={18} color="#0083B0" />
                  <TextInput
                    style={[styles.searchInput, { color: colors.textPrimary }]}
                    placeholder="Search prescribed tests..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <AppIcon name="close" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* LIST OF PRESCRIBED TESTS (EXCLUDES ALREADY BOOKED TESTS) */}
                <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                  Prescribed Tests ({currentPrescriptionTests.length})
                </Text>

                {currentPrescriptionTests.map((test) => {
                  const isSelected = selectedTests.includes(test.id);
                  return (
                    <View
                      key={test.id}
                      style={[
                        styles.testCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: isSelected ? '#0083B0' : isDark ? colors.border : '#E2E8F0',
                          borderWidth: isSelected ? 1.5 : 1,
                        },
                      ]}
                    >
                      <View style={styles.testCardBody}>
                        <View style={styles.testCardMain}>
                          <Text style={[styles.testName, { color: colors.textPrimary }]}>{test.name}</Text>

                          <View style={styles.priceRow}>
                            <Text style={styles.priceCurrent}>₹{test.price.toFixed(2)}</Text>
                            <Text style={styles.priceMRP}>MRP: ₹{test.mrp.toFixed(2)}</Text>
                          </View>

                          <View style={styles.badgeRow}>
                            <Text style={styles.savingsTag}>
                              Save: ₹{test.savings.toFixed(2)} ({test.savingsPct.toFixed(2)}%)
                            </Text>
                            <View style={styles.rewardTag}>
                              <Text style={styles.rewardTagText}>+{test.rewardPoints} Points</Text>
                            </View>
                          </View>

                          {test.fastingNote && (
                            <Text style={styles.fastingNoteText}>💡 {test.fastingNote}</Text>
                          )}
                        </View>

                        {/* ADD & REMOVE BUTTON UI: WHITE BACKGROUND FOR BOTH, JUST TEXT & BORDER CHANGES */}
                        <TouchableOpacity
                          style={[
                            styles.whiteBgAddRemoveBtn,
                            isSelected ? styles.whiteBgRemoveBtnBorder : styles.whiteBgAddBtnBorder,
                          ]}
                          onPress={() => toggleTestSelection(test.id)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.whiteBgAddRemoveBtnText,
                              isSelected ? styles.whiteBgRemoveBtnText : styles.whiteBgAddBtnText,
                            ]}
                          >
                            {isSelected ? 'Remove' : 'Add'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {/* TAB 2: SELF PRESCRIPTION (PENDING SELF BOOKINGS) */}
            {activeTab === 'self_prescription' && (
              <ScrollView
                contentContainerStyle={[styles.scrollListContent, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.selfTabHeaderRow}>
                  <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                    Self-Booked Pending Diagnostics ({PENDING_SELF_BOOKINGS.length})
                  </Text>
                </View>

                <Text style={[styles.selfTabSubNote, { color: colors.textSecondary }]}>
                  Below are the diagnostic tests you booked for yourself without a doctor prescription that are scheduled and pending your lab visit.
                </Text>

                {PENDING_SELF_BOOKINGS.map((booking) => (
                  <View
                    key={booking.bookingId}
                    style={[
                      styles.selfBookingCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isDark ? colors.border : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={styles.selfBookingHeader}>
                      <View style={styles.selfRefBadge}>
                        <AppIcon name="flask" size={13} color="#0083B0" />
                        <Text style={styles.selfRefBadgeText}>{booking.bookingId}</Text>
                      </View>

                      <View style={styles.statusPillPending}>
                        <Text style={styles.statusPillPendingText}>{booking.status}</Text>
                      </View>
                    </View>

                    <Text style={[styles.selfTestTitle, { color: colors.textPrimary }]}>
                      {booking.testName}
                    </Text>

                    <View style={styles.selfDetailRow}>
                      <AppIcon name="calendar" size={15} color="#0083B0" />
                      <Text style={[styles.selfDetailText, { color: colors.textPrimary }]}>
                        {booking.date} • <Text style={{ fontWeight: '700', color: '#0083B0' }}>{booking.timeSlot}</Text>
                      </Text>
                    </View>

                    <View style={styles.selfDetailRow}>
                      <AppIcon name="hospital" size={15} color="#0083B0" />
                      <Text style={[styles.selfDetailText, { color: colors.textSecondary }]}>
                        {booking.location}
                      </Text>
                    </View>

                    <Text style={styles.selfInstructionText}>💡 {booking.instructions}</Text>

                    <View style={styles.divider} />

                    <View style={styles.selfFooterRow}>
                      <Text style={[styles.selfAmountText, { color: colors.textPrimary }]}>
                        Amount Paid: <Text style={{ color: '#0083B0', fontWeight: '800' }}>₹{booking.amount.toFixed(2)}</Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.selfTokenBtn}
                        onPress={() =>
                          Alert.alert(
                            'Lab Entry Digital Token',
                            `Token ID: ${booking.bookingId}\nPresent this barcode token at GMCH OPD Diagnostic Desk on ${booking.date} at ${booking.timeSlot}.`
                          )
                        }
                      >
                        <AppIcon name="qrcode" size={14} color="#FFFFFF" />
                        <Text style={styles.selfTokenBtnText}>View Token</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* BOTTOM CART BAR */}
            {selectedTests.length > 0 && prescriptionSubStep === 'prescribed_tests_booking' && (
              <View
                style={[
                  styles.bottomCartBar,
                  {
                    backgroundColor: colors.surface,
                    borderTopColor: isDark ? colors.border : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.cartInfoCol}>
                  <Text style={[styles.cartItemCountText, { color: colors.textPrimary }]}>
                    {selectedTests.length} Test{selectedTests.length > 1 ? 's' : ''} Selected
                  </Text>
                  <Text style={[styles.cartPriceText, { color: colors.textSecondary }]}>
                    Total: <Text style={{ color: '#0083B0', fontWeight: '700' }}>₹{totalPrice.toFixed(2)}</Text>{' '}
                    | Save: ₹{totalSavings.toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.cartProceedBtn}
                  onPress={handleProceedToSlots}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cartProceedBtnText}>Proceed to Slots</Text>
                  <AppIcon name="arrow-right" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* RIGHT FLOATING BUTTON: "BOOK YOUR TEST" */}
            <TouchableOpacity
              style={[
                styles.floatingBookBtnRight,
                { bottom: Math.max(insets.bottom, 10) + (selectedTests.length > 0 && prescriptionSubStep === 'prescribed_tests_booking' ? 76 : 24) },
              ]}
              onPress={() => setShowBookCustomModal(true)}
              activeOpacity={0.88}
            >
              <AppIcon name="flask" size={16} color="#FFFFFF" />
              <Text style={styles.floatingBookBtnRightText}>Book Your Test</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: SELECT LAB VISIT SLOTS (HOSPITAL WALK-IN ONLY) */}
        {bookingStep === 'slots' && (
          <ScrollView
            contentContainerStyle={[styles.scrollListContent, { paddingBottom: 40 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
              <View style={styles.hospitalWalkInHeader}>
                <AppIcon name="hospital" size={22} color="#0083B0" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                    GMCH Central Diagnostic Lab Visit
                  </Text>
                  <Text style={[styles.hospitalLocationText, { color: colors.textSecondary }]}>
                    Ground Floor, OPD Block Wing B, GMCH Hospital Main Campus
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              Select Lab Visit Timing Slots (09:00 AM – 07:30 PM)
            </Text>
            <Text style={[styles.slotNote, { color: colors.textSecondary }]}>
              💡 Each diagnostic test is conducted in distinct staggered time slots to maintain sample purity.
            </Text>

            {selectedTestObjects.map((test) => {
              const currentSlot = testSlots[test.id];
              return (
                <View
                  key={test.id}
                  style={[
                    styles.cardContainer,
                    { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' },
                  ]}
                >
                  <View style={styles.testSlotHeader}>
                    <Text style={[styles.testSlotTitle, { color: colors.textPrimary }]}>{test.name}</Text>
                    <View style={styles.assignedSlotBadge}>
                      <AppIcon name="clock" size={13} color="#0083B0" />
                      <Text style={styles.assignedSlotBadgeText}>{currentSlot || 'Select Slot'}</Text>
                    </View>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsScrollRow}>
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = currentSlot === slot;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[
                            styles.slotChip,
                            isSelected && styles.slotChipActive,
                          ]}
                          onPress={() => handleSlotSelectForTest(test.id, slot)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.slotChipText, isSelected && styles.slotChipTextActive]}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleProceedToBilling}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionButtonText}>Continue to Invoice & Billing</Text>
              <AppIcon name="arrow-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 3: INVOICE & BILL SUMMARY */}
        {bookingStep === 'bill_summary' && (
          <ScrollView
            contentContainerStyle={[styles.scrollListContent, { paddingBottom: 40 }]}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.invoiceCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.border : '#CBD5E1',
                },
              ]}
            >
              <View style={styles.invoiceHeaderRow}>
                <View>
                  <Text style={styles.invoiceOrgName}>GMCH CENTRAL DIAGNOSTICS</Text>
                  <Text style={[styles.invoiceSubTitle, { color: colors.textSecondary }]}>
                    Official Diagnostic Tax Invoice • Hospital Walk-in
                  </Text>
                </View>
                <View style={styles.invoiceBadge}>
                  <Text style={styles.invoiceBadgeText}>VERIFIED LAB</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.invoiceMetaGrid}>
                <Text style={[styles.metaGridItem, { color: colors.textSecondary }]}>
                  Patient: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{userSession.name || 'Rathi Vijay Sharma'}</Text>
                </Text>
                <Text style={[styles.metaGridItem, { color: colors.textSecondary }]}>
                  Visit Mode: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Hospital Lab Walk-in</Text>
                </Text>
              </View>

              <View style={styles.divider} />

              <Text style={[styles.billSectionTitle, { color: colors.textPrimary }]}>Itemized Diagnostic Tests</Text>

              {selectedTestObjects.map((test) => (
                <View key={test.id} style={styles.billItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.billItemName, { color: colors.textPrimary }]}>{test.name}</Text>
                    <Text style={styles.billItemSlot}>Lab Visit Slot: {testSlots[test.id] || '09:00 AM'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.billItemPrice, { color: colors.textPrimary }]}>₹{test.price.toFixed(2)}</Text>
                    <Text style={styles.billItemMRP}>₹{test.mrp.toFixed(2)}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.priceBreakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Diagnostic MRP Total</Text>
                <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>₹{totalMRP.toFixed(2)}</Text>
              </View>

              <View style={styles.priceBreakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Diagnostic Discount (30% Off)</Text>
                <Text style={styles.breakdownDiscount}>-₹{totalSavings.toFixed(2)}</Text>
              </View>

              <View style={styles.priceBreakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Health Points Redeemed (450 Points)</Text>
                <Text style={styles.breakdownDiscount}>-₹50.00</Text>
              </View>

              <View style={[styles.divider, { height: 1.5, backgroundColor: '#0083B0' }]} />

              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Net Amount Payable</Text>
                <Text style={styles.totalValue}>₹{Math.max(0, totalPrice - 50).toFixed(2)}</Text>
              </View>

              {paymentMode === 'pay_now' && (
                <View style={styles.earnedPointsBanner}>
                  <AppIcon name="star" size={16} color="#0083B0" />
                  <Text style={styles.earnedPointsText}>
                    You will earn <Text style={{ fontWeight: '800' }}>+{totalRewardPoints + 20} Health Points</Text> on this online payment!
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Select Payment Option</Text>

            <TouchableOpacity
              style={[
                styles.payModeOption,
                { backgroundColor: colors.surface, borderColor: paymentMode === 'pay_now' ? '#0083B0' : colors.border },
                paymentMode === 'pay_now' && { borderWidth: 2 },
              ]}
              onPress={() => setPaymentMode('pay_now')}
              activeOpacity={0.8}
            >
              <AppIcon name="card" size={20} color="#0083B0" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.payModeTitle, { color: colors.textPrimary }]}>Pay Now Online (UPI / Cards / NetBanking)</Text>
                <Text style={[styles.payModeSub, { color: colors.textSecondary }]}>Instant confirmation + Extra Bonus Health Points</Text>
              </View>
              {paymentMode === 'pay_now' && <AppIcon name="check" size={20} color="#0083B0" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.payModeOption,
                { backgroundColor: colors.surface, borderColor: paymentMode === 'pay_later' ? '#0083B0' : colors.border },
                paymentMode === 'pay_later' && { borderWidth: 2 },
              ]}
              onPress={() => setPaymentMode('pay_later')}
              activeOpacity={0.8}
            >
              <AppIcon name="wallet" size={20} color="#0083B0" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.payModeTitle, { color: colors.textPrimary }]}>Pay Later at GMCH Lab Counter</Text>
                <Text style={[styles.payModeSub, { color: colors.textSecondary }]}>Pay cash/UPI directly at hospital lab OPD counter (No points bonus)</Text>
              </View>
              {paymentMode === 'pay_later' && <AppIcon name="check" size={20} color="#0083B0" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleFinalPaymentSubmit}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionButtonText}>
                {paymentMode === 'pay_now' ? 'Confirm & Pay Now' : 'Confirm Pay Later Booking'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 4: CONFIRMATION SCREEN */}
        {bookingStep === 'confirmation' && (
          paymentMode === 'pay_now' ? (
            /* PAY NOW ONLINE: REWARDS CELEBRATION OVERLAY */
            <View style={styles.darkGradientVictoryOverlay}>
              <ScrollView
                contentContainerStyle={styles.imageRefVictoryScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.imageRefHeaderTitle}>
                  You unlocked a new reward! 🎉
                </Text>
                <Text style={styles.imageRefSubTitle}>
                  Congrats on completing your online payment! You earned +{totalRewardPoints + 20} Health Points!
                </Text>

                <Animated.View style={[styles.imageRefGraphicContainer, { transform: [{ scale: trophyScaleAnim }] }]}>
                  <Image
                    source={IMAGES.giftBoxRewards}
                    fadeDuration={0}
                    style={styles.imageRefGiftBoxArt}
                    resizeMode="contain"
                  />

                  <Animated.View style={[styles.floatingCoinWrap1, { transform: [{ translateY: coinFloatAnim }] }]}>
                    <Text style={styles.coinEmoji}>🪙</Text>
                  </Animated.View>

                  <Animated.View style={[styles.floatingCoinWrap2, { transform: [{ translateY: coinFloatAnim }] }]}>
                    <Text style={styles.coinEmoji}>🪙</Text>
                  </Animated.View>

                  <Animated.View style={[styles.floatingCoinWrap3, { transform: [{ translateY: coinFloatAnim }] }]}>
                    <Text style={styles.coinEmoji}>✨</Text>
                  </Animated.View>
                </Animated.View>

                <View style={styles.imageRefDetailsCard}>
                  <View style={styles.victoryCardHeaderRow}>
                    <AppIcon name="check" size={18} color="#16A34A" />
                    <Text style={styles.imageRefRefText}>
                      Booking Ref: <Text style={{ color: '#0083B0', fontWeight: '800' }}>LAB-2026-9402</Text>
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <Text style={styles.imageRefMetaText}>
                    🏥 <Text style={{ fontWeight: '700' }}>Lab Visit Location:</Text> GMCH OPD Central Diagnostic Lab (Ground Floor)
                  </Text>
                  <Text style={styles.imageRefMetaText}>
                    🗓️ <Text style={{ fontWeight: '700' }}>Visit Time Slot:</Text> Tomorrow Morning ({TIME_SLOTS[0]} - {TIME_SLOTS[1]})
                  </Text>
                  <Text style={styles.imageRefMetaText}>
                    💳 <Text style={{ fontWeight: '700' }}>Payment Mode:</Text> Paid Online (UPI/Card)
                  </Text>

                  <View style={styles.rewardSummaryBanner}>
                    <AppIcon name="star" size={20} color="#38BDF8" />
                    <Text style={styles.rewardSummaryBannerText}>
                      +{totalRewardPoints + 20} Health Points credited dynamically to your Patient Account!
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.imageRefOrangeCloseBtn}
                  onPress={onBack}
                  activeOpacity={0.88}
                >
                  <Text style={styles.imageRefOrangeCloseBtnText}>Close & Return to Dashboard</Text>
                </TouchableOpacity>

                {onOpenVisits && (
                  <TouchableOpacity
                    style={styles.imageRefSecondaryBtn}
                    onPress={() => {
                      onBack();
                      onOpenVisits();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.imageRefSecondaryBtnText}>View My Lab Bookings</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          ) : (
            /* PAY LATER: CLEAN SIMPLE BOOKING CONFIRMED SUMMARY (NO REWARDS / NO POINTS) */
            <ScrollView
              contentContainerStyle={[styles.scrollListContent, { paddingBottom: 40, paddingTop: 20 }]}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.payLaterConfirmCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                <View style={styles.payLaterCheckCircle}>
                  <AppIcon name="check" size={32} color="#16A34A" />
                </View>

                <Text style={[styles.payLaterTitle, { color: colors.textPrimary }]}>
                  Lab Visit Booking Confirmed!
                </Text>
                <Text style={[styles.payLaterSub, { color: colors.textSecondary }]}>
                  Your appointment slot is reserved at GMCH Central Lab OPD.
                </Text>

                <View style={styles.divider} />

                <View style={styles.payLaterDetailRow}>
                  <Text style={[styles.payLaterLabel, { color: colors.textSecondary }]}>Booking Ref No:</Text>
                  <Text style={[styles.payLaterVal, { color: '#0083B0' }]}>LAB-2026-9402</Text>
                </View>

                <View style={styles.payLaterDetailRow}>
                  <Text style={[styles.payLaterLabel, { color: colors.textSecondary }]}>Payment Method:</Text>
                  <Text style={[styles.payLaterVal, { color: colors.textPrimary }]}>Pay Later at Lab Counter</Text>
                </View>

                <View style={styles.payLaterDetailRow}>
                  <Text style={[styles.payLaterLabel, { color: colors.textSecondary }]}>Net Amount Due:</Text>
                  <Text style={[styles.payLaterVal, { color: '#0083B0' }]}>₹{Math.max(0, totalPrice - 50).toFixed(2)}</Text>
                </View>

                <View style={styles.payLaterDetailRow}>
                  <Text style={[styles.payLaterLabel, { color: colors.textSecondary }]}>Visit Timing:</Text>
                  <Text style={[styles.payLaterVal, { color: colors.textPrimary }]}>Tomorrow Morning ({TIME_SLOTS[0]})</Text>
                </View>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={onBack}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryActionButtonText}>Return to Dashboard</Text>
                </TouchableOpacity>

                {onOpenVisits && (
                  <TouchableOpacity
                    style={styles.secondaryOutlineBtn}
                    onPress={() => {
                      onBack();
                      onOpenVisits();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryOutlineBtnText}>View My Lab Bookings</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )
        )}

        {/* CUSTOM CATEGORY SEARCH MODAL */}
        <Modal
          visible={showBookCustomModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowBookCustomModal(false)}
        >
          <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
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
                <View style={[styles.headerSideGroup, isTablet && { width: 44 }]}>
                  <TouchableOpacity
                    style={[styles.headerBackBtn, isDark && { backgroundColor: colors.borderLight }]}
                    onPress={() => setShowBookCustomModal(false)}
                  >
                    <AppIcon name="close" size={20} color="#0083B0" />
                  </TouchableOpacity>
                </View>

                <View style={styles.headerCenterGroup}>
                  <Text style={[styles.headerTitleCentered, isTablet && { fontSize: 24 }]}>
                    Book Custom Test
                  </Text>
                </View>

                <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
              </View>

              <View style={[styles.searchBoxContainer, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0', marginTop: 12, marginHorizontal: 16 }]}>
                <AppIcon name="search" size={18} color="#0083B0" />
                <TextInput
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                  placeholder="Search test by name or category..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <AppIcon name="close" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollListContent, { paddingBottom: selectedTests.length > 0 ? 110 : 30 }]}
                showsVerticalScrollIndicator={false}
              >
                {!selectedCategory ? (
                  <>
                    <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                      Select Diagnostic Category
                    </Text>

                    {SELF_PRESCRIBED_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: isDark ? colors.border : '#E2E8F0',
                          },
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.categoryIconWrap}>
                          <AppIcon name={cat.icon} size={22} color="#0083B0" />
                        </View>
                        <View style={styles.categoryTextCol}>
                          <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>{cat.title}</Text>
                          <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>{cat.count}</Text>
                        </View>
                        <AppIcon name="chevron-right" size={20} color="#0083B0" />
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.backToCatBtn}
                      onPress={() => setSelectedCategory(null)}
                    >
                      <AppIcon name="back" size={16} color="#0083B0" />
                      <Text style={styles.backToCatText}>
                        Back to All Categories ({SELF_PRESCRIBED_CATEGORIES.find((c) => c.id === selectedCategory)?.title})
                      </Text>
                    </TouchableOpacity>

                    {filteredSelfTests.map((test) => {
                      const isSelected = selectedTests.includes(test.id);
                      return (
                        <View
                          key={test.id}
                          style={[
                            styles.testCard,
                            {
                              backgroundColor: colors.surface,
                              borderColor: isSelected ? '#0083B0' : isDark ? colors.border : '#E2E8F0',
                              borderWidth: isSelected ? 1.5 : 1,
                            },
                          ]}
                        >
                          <View style={styles.testCardBody}>
                            <View style={styles.testCardMain}>
                              <Text style={[styles.testName, { color: colors.textPrimary }]}>{test.name}</Text>
                              <View style={styles.priceRow}>
                                <Text style={styles.priceCurrent}>₹{test.price.toFixed(2)}</Text>
                                <Text style={styles.priceMRP}>MRP: ₹{test.mrp.toFixed(2)}</Text>
                              </View>
                              <View style={styles.badgeRow}>
                                <Text style={styles.savingsTag}>
                                  Save: ₹{test.savings.toFixed(2)} ({test.savingsPct.toFixed(2)}%)
                                </Text>
                                <View style={styles.rewardTag}>
                                  <Text style={styles.rewardTagText}>+{test.rewardPoints} Points</Text>
                                </View>
                              </View>
                              {test.fastingNote && (
                                <Text style={styles.fastingNoteText}>💡 {test.fastingNote}</Text>
                              )}
                            </View>

                            {/* ADD & REMOVE BUTTON UI: WHITE BACKGROUND FOR BOTH */}
                            <TouchableOpacity
                              style={[
                                styles.whiteBgAddRemoveBtn,
                                isSelected ? styles.whiteBgRemoveBtnBorder : styles.whiteBgAddBtnBorder,
                              ]}
                              onPress={() => toggleTestSelection(test.id)}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.whiteBgAddRemoveBtnText,
                                  isSelected ? styles.whiteBgRemoveBtnText : styles.whiteBgAddBtnText,
                                ]}
                              >
                                {isSelected ? 'Remove' : 'Add'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}
              </ScrollView>

              {selectedTests.length > 0 && (
                <View
                  style={[
                    styles.bottomCartBar,
                    {
                      backgroundColor: colors.surface,
                      borderTopColor: isDark ? colors.border : '#E2E8F0',
                    },
                  ]}
                >
                  <View style={styles.cartInfoCol}>
                    <Text style={[styles.cartItemCountText, { color: colors.textPrimary }]}>
                      {selectedTests.length} Test{selectedTests.length > 1 ? 's' : ''} Selected
                    </Text>
                    <Text style={[styles.cartPriceText, { color: colors.textSecondary }]}>
                      Total: <Text style={{ color: '#0083B0', fontWeight: '700' }}>₹{totalPrice.toFixed(2)}</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.cartProceedBtn}
                    onPress={handleProceedToSlots}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.cartProceedBtnText}>Proceed to Slots</Text>
                    <AppIcon name="arrow-right" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      </View>
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
  ambientBgContainer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    zIndex: -1,
  },
  ambientTopGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#E0F2FE',
    opacity: 0.8,
  },
  ambientMidGlow: {
    position: 'absolute',
    top: 260,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#F0F9FF',
    opacity: 0.6,
  },
  ambientWaveImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
  },
  headerSideGroup: {
    width: 38,
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

  stepContainer: {
    flex: 1,
  },

  filterTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  filterTabActive: {
    backgroundColor: '#0083B0',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    marginLeft: 8,
    paddingVertical: 0,
  },

  scrollListContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  prescriptionCardItem: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  prescriptionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroDocIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDocTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  heroDocMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  chevronOnlyToggle: {
    padding: 6,
  },
  prescriptionExpandContent: {
    marginTop: 4,
  },
  prescriptionSummaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  prescriptionSummaryNotesText: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 6,
  },
  prescribedCountText: {
    fontSize: 12,
    fontWeight: '700',
  },

  activeRxBannerCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
  },
  activeRxHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeRxDocName: {
    fontSize: 15,
    fontWeight: '800',
  },
  activeRxMetaText: {
    fontSize: 12,
    marginTop: 2,
  },

  heroBookNowBtn: {
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  heroBookNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },

  testCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  testCardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  testCardMain: {
    flex: 1,
  },
  testName: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  priceCurrent: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0083B0',
  },
  priceMRP: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  savingsTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  rewardTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rewardTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D97706',
  },
  fastingNoteText: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 2,
  },

  // ADD & REMOVE BUTTON UI: WHITE BACKGROUND FOR BOTH!
  whiteBgAddRemoveBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 74,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  whiteBgAddBtnBorder: {
    borderColor: '#0083B0',
  },
  whiteBgRemoveBtnBorder: {
    borderColor: '#DC2626',
  },
  whiteBgAddRemoveBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  whiteBgAddBtnText: {
    color: '#0083B0',
  },
  whiteBgRemoveBtnText: {
    color: '#DC2626',
  },

  // SELF PRESCRIPTION TAB - PENDING BOOKINGS
  selfTabHeaderRow: {
    marginBottom: 4,
  },
  selfTabSubNote: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  selfBookingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  selfBookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  selfRefBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D0EDFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selfRefBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#004F6E',
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillPendingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D97706',
  },
  selfTestTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  selfDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  selfDetailText: {
    fontSize: 12,
  },
  selfInstructionText: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 4,
  },
  selfFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  selfAmountText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  selfTokenBtn: {
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selfTokenBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextCol: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryCount: {
    fontSize: 11.5,
    marginTop: 2,
  },
  backToCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  backToCatText: {
    fontSize: 12.5,
    color: '#0083B0',
    fontWeight: '700',
  },

  bottomCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 90,
  },
  cartInfoCol: {
    flex: 1,
  },
  cartItemCountText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  cartPriceText: {
    fontSize: 11.5,
    marginTop: 2,
  },
  cartProceedBtn: {
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cartProceedBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },

  floatingBookBtnRight: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#0083B0',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
  floatingBookBtnRightText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // SLOTS SELECTION STEP
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  hospitalWalkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  hospitalLocationText: {
    fontSize: 11.5,
    marginTop: 2,
  },
  slotNote: {
    fontSize: 11.5,
    marginBottom: 10,
  },
  testSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  testSlotTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
  },
  assignedSlotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D0EDFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  assignedSlotBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0083B0',
  },
  slotsScrollRow: {
    marginHorizontal: -4,
  },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 6,
  },
  slotChipActive: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
  },
  slotChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  slotChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // INVOICE CARD
  invoiceCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  invoiceOrgName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0083B0',
    letterSpacing: 0.5,
  },
  invoiceSubTitle: {
    fontSize: 11,
    marginTop: 2,
  },
  invoiceBadge: {
    backgroundColor: '#D0EDFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  invoiceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#004F6E',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  invoiceMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaGridItem: {
    fontSize: 11.5,
  },
  billSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  billItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billItemName: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  billItemSlot: {
    fontSize: 10.5,
    color: '#0083B0',
  },
  billItemPrice: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  billItemMRP: {
    fontSize: 10.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  priceBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 12,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownDiscount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0083B0',
  },
  earnedPointsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D0EDFF',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  earnedPointsText: {
    fontSize: 11.5,
    color: '#004F6E',
  },

  payModeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  payModeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  payModeSub: {
    fontSize: 11,
    marginTop: 2,
  },

  primaryActionButton: {
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryOutlineBtn: {
    borderWidth: 1.5,
    borderColor: '#0083B0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  secondaryOutlineBtnText: {
    color: '#0083B0',
    fontSize: 13.5,
    fontWeight: '700',
  },

  // PAY LATER CLEAN CONFIRMATION CARD
  payLaterConfirmCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  payLaterCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  payLaterTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  payLaterSub: {
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  payLaterDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  payLaterLabel: {
    fontSize: 12.5,
  },
  payLaterVal: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  // PREMIUM CELEBRATION REWARDS OVERLAY (FOR PAY NOW ONLINE ONLY)
  darkGradientVictoryOverlay: {
    flex: 1,
    backgroundColor: '#0A2540',
  },
  imageRefVictoryScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 26,
    alignItems: 'center',
  },
  imageRefHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  imageRefSubTitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageRefGraphicContainer: {
    width: 220,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  imageRefGiftBoxArt: {
    width: 160,
    height: 160,
    borderRadius: 20,
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
  imageRefSecondaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  imageRefSecondaryBtnText: {
    color: '#38BDF8',
    fontSize: 13.5,
    fontWeight: '700',
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
});

export default BookTestScreen;
